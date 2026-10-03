import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const help = `Uso: npm run release -- <versão> [--dry-run]

Exemplos:
  npm run release -- 0.1.4
  npm run release -- v0.1.4 --dry-run

Requer Node.js, Git, a branch main sem alterações pendentes e acesso ao origin.
Atualiza as versões do aplicativo, cria um commit e uma tag anotada e envia
main e a tag juntos ao origin. O GitHub Actions gera os instaladores.
--dry-run verifica e mostra o plano sem alterar arquivos, commits ou tags.`

function git(args, { allowFailure = false } = {}) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  if (result.error) throw result.error
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`git ${args.join(' ')} falhou:\n${result.stderr.trim() || result.stdout.trim()}`)
  }
  return { ...result, stdout: result.stdout.trim() }
}

function updateTomlVersion(source, header, packageName, version, path) {
  // Only the application's own package changes; dependency versions stay intact.
  const sections = source.split(/(?=^\[)/m)
  const matches = sections.flatMap((section, index) => (
    section.split(/\r?\n/, 1)[0] === header
    && section.match(/^name\s*=\s*"([^"]+)"/m)?.[1] === packageName
      ? [index] : []
  ))
  const versionLine = /^(version\s*=\s*)"[^"\r\n]+"/m
  if (matches.length !== 1 || !versionLine.test(sections[matches[0]])) {
    throw new Error(`Não foi possível localizar a versão de ${packageName} em ${path}.`)
  }
  sections[matches[0]] = sections[matches[0]].replace(versionLine, `$1"${version}"`)
  return sections.join('')
}

function prepareFiles(version) {
  const paths = [
    'package.json',
    'package-lock.json',
    'src-tauri/tauri.conf.json',
    'src-tauri/Cargo.toml',
    'src-tauri/Cargo.lock',
  ]
  git(['ls-files', '--error-unmatch', '--', ...paths])
  const originals = new Map(paths.map(path => [path, readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')]))
  const updated = new Map(originals)
  const manifest = JSON.parse(originals.get('package.json'))
  const lock = JSON.parse(originals.get('package-lock.json'))
  if (!manifest.name || lock.name !== manifest.name || lock.packages?.['']?.name !== manifest.name) {
    throw new Error('package-lock.json não corresponde ao package.json. Execute npm install antes da release.')
  }
  manifest.version = version
  lock.version = version
  lock.packages[''].version = version
  updated.set('package.json', `${JSON.stringify(manifest, null, 2)}\n`)
  updated.set('package-lock.json', `${JSON.stringify(lock, null, 2)}\n`)

  // Preserve the compact formatting of the other Tauri configuration fields.
  const tauriPath = 'src-tauri/tauri.conf.json'
  const tauri = originals.get(tauriPath).replace(/^(\s*"version"\s*:\s*)"[^"\r\n]*"/m, `$1"${version}"`)
  if (JSON.parse(tauri).version !== version) throw new Error(`Campo version não encontrado em ${tauriPath}.`)
  updated.set(tauriPath, tauri)

  for (const [path, header] of [['src-tauri/Cargo.toml', '[package]'], ['src-tauri/Cargo.lock', '[[package]]']]) {
    updated.set(path, updateTomlVersion(originals.get(path), header, manifest.name, version, path))
  }
  return [...updated].filter(([path, content]) => content !== originals.get(path))
}

function main() {
  const args = process.argv.slice(2)
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log(help)
    return
  }
  const versions = args.filter(arg => arg !== '--dry-run')
  if (versions.length !== 1 || args.length > 2 || !/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(versions[0])) {
    throw new Error(`Informe uma versão estável no formato 0.1.4 ou v0.1.4.\n\n${help}`)
  }
  const version = versions[0].replace(/^v/, '')
  const tag = `v${version}`
  const dryRun = args.includes('--dry-run')

  if (git(['symbolic-ref', '--quiet', '--short', 'HEAD'], { allowFailure: true }).stdout !== 'main') {
    throw new Error('Execute a release na branch main: git switch main')
  }
  if (git(['status', '--porcelain', '--untracked-files=all']).stdout) {
    throw new Error('Há alterações pendentes. Faça commit ou guarde as alterações antes de executar a release.')
  }
  if (git(['tag', '--list', tag]).stdout) throw new Error(`A tag ${tag} já existe localmente. Escolha outra versão.`)
  git(['var', 'GIT_AUTHOR_IDENT'])
  git(['var', 'GIT_COMMITTER_IDENT'])

  const remoteRefs = new Map(git(['ls-remote', '--refs', 'origin', 'refs/heads/main', `refs/tags/${tag}`])
    .stdout.split('\n').filter(Boolean).map(line => {
      const [hash, ref] = line.split(/\s+/)
      return [ref, hash]
    }))
  if (remoteRefs.has(`refs/tags/${tag}`)) throw new Error(`A tag ${tag} já existe no origin. Escolha outra versão.`)
  const remoteMain = remoteRefs.get('refs/heads/main')
  if (!remoteMain) throw new Error('A branch main não foi encontrada no origin.')
  if (git(['merge-base', '--is-ancestor', remoteMain, 'HEAD'], { allowFailure: true }).status !== 0) {
    throw new Error('A main local não contém todos os commits do origin. Execute git pull --ff-only origin main e resolva eventuais divergências.')
  }

  const files = prepareFiles(version)
  console.log(`Release ${tag}:`)
  for (const [path] of files) console.log(`  Atualizar ${path} para ${version}`)
  if (!files.length) console.log(`  Os arquivos já estão na versão ${version}; a tag usará o commit atual.`)
  else console.log(`  Criar commit: chore: release ${tag}`)
  console.log(`  Criar tag anotada ${tag} e enviar main + tag ao origin.`)
  if (dryRun) {
    console.log('Simulação concluída. Nenhum arquivo, commit ou tag foi alterado.')
    return
  }

  if (files.length) {
    for (const [path, content] of files) writeFileSync(new URL(`../${path}`, import.meta.url), content)
    git(['add', '--', ...files.map(([path]) => path)])
    git(['commit', '-m', `chore: release ${tag}`])
  }
  git(['tag', '-a', tag, '-m', `CircuitLab Offline ${tag}`])
  const pushArgs = ['push', '--atomic', 'origin', 'HEAD:refs/heads/main', `refs/tags/${tag}`]
  try {
    const result = git(pushArgs)
    if (result.stderr.trim()) console.log(result.stderr.trim())
  } catch (error) {
    throw new Error(`${error.message}\n\nO commit e a tag ${tag} foram mantidos localmente. Após resolver a falha, envie novamente:\n  git ${pushArgs.join(' ')}`)
  }
  console.log(`Release ${tag} enviada. Acompanhe a geração dos instaladores na aba Actions do GitHub.`)
}

try {
  main()
} catch (error) {
  console.error(`Erro: ${error.message}`)
  process.exitCode = 1
}
