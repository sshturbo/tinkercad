import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const versionFiles = ['package.json', 'package-lock.json', 'src-tauri/tauri.conf.json', 'src-tauri/Cargo.toml', 'src-tauri/Cargo.lock']
let temp
let repo
let remote
let env

function git(args, cwd = repo) {
  const result = spawnSync('git', args, { cwd, env, encoding: 'utf8' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`)
  return result.stdout.trim()
}

function write(path, content) {
  const absolute = join(repo, path)
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, content)
}

function run(...args) {
  return spawnSync(process.execPath, [join(repo, 'scripts/release.mjs'), ...args], { cwd: repo, env, encoding: 'utf8' })
}

function snapshot() {
  return {
    files: versionFiles.map(path => readFileSync(join(repo, path), 'utf8')),
    head: git(['rev-parse', 'HEAD']),
    tags: git(['tag', '--list']),
    status: git(['status', '--porcelain']),
    remoteRefs: git(['show-ref'], remote),
  }
}

describe('publicação de versões em repositórios temporários', () => {
  beforeEach(() => {
    temp = mkdtempSync(join(tmpdir(), 'circuitlab-release-'))
    repo = join(temp, 'repo')
    remote = join(temp, 'origin.git')
    env = {
      ...process.env,
      GIT_CONFIG_GLOBAL: join(temp, 'empty-gitconfig'),
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_TERMINAL_PROMPT: '0',
      GIT_AUTHOR_NAME: 'Release Test',
      GIT_AUTHOR_EMAIL: 'release@example.invalid',
      GIT_COMMITTER_NAME: 'Release Test',
      GIT_COMMITTER_EMAIL: 'release@example.invalid',
    }
    mkdirSync(repo)
    git(['init', '--bare', '--initial-branch=main', remote])
    git(['init', '--initial-branch=main'])
    for (const path of [...versionFiles, 'scripts/release.mjs']) {
      write(path, readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))
    }
    git(['add', '.'])
    git(['commit', '-m', 'Initial fixture'])
    git(['remote', 'add', 'origin', remote])
    git(['push', '-u', 'origin', 'main'])
  })

  afterEach(() => {
    rmSync(temp, { recursive: true, force: true })
  })

  it('sincroniza os cinco arquivos e envia um commit e uma tag anotada', () => {
    const before = snapshot()
    const result = run('0.1.4')
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('Release v0.1.4 enviada')
    expect(git(['status', '--porcelain'])).toBe('')
    expect(git(['cat-file', '-t', 'refs/tags/v0.1.4'], remote)).toBe('tag')
    const head = git(['rev-parse', 'HEAD'])
    expect(git(['rev-parse', 'refs/tags/v0.1.4^{}'], remote)).toBe(head)
    expect(git(['rev-parse', 'refs/heads/main'], remote)).toBe(head)
    expect(git(['rev-parse', 'HEAD^'])).toBe(before.head)

    for (const path of versionFiles.slice(0, 3)) {
      const published = JSON.parse(git(['show', `v0.1.4:${path}`], remote))
      expect(published.version).toBe('0.1.4')
      if (path === 'package-lock.json') expect(published.packages[''].version).toBe('0.1.4')
    }
    for (const path of versionFiles.slice(3)) {
      const published = git(['show', `v0.1.4:${path}`], remote)
      const original = before.files[versionFiles.indexOf(path)].trim()
      expect(published).toBe(original.replace(/(name = "circuitlab-offline"\r?\nversion = ")[^"]+/, '$10.1.4'))
    }
    // Releasing again with a fresh tag and already aligned versions needs no extra commit.
    git(['tag', '-d', 'v0.1.4'])
    git(['push', 'origin', ':refs/tags/v0.1.4'])
    const repeat = run('v0.1.4')
    expect(repeat.status, repeat.stderr).toBe(0)
    expect(git(['rev-parse', 'HEAD'])).toBe(head)
  })

  it('aceita o prefixo v e simula sem alterar arquivos ou refs', () => {
    const before = snapshot()
    const result = run('v0.1.4', '--dry-run')
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('Simulação concluída')
    expect(result.stdout).toContain('Atualizar src-tauri/tauri.conf.json para 0.1.4')
    expect(snapshot()).toEqual(before)
  })

  it.each([[], ['1.2'], ['01.2.3'], ['1.2.3-beta.1'], ['1.2.3', '--force']])('recusa argumentos inválidos: %j', (...args) => {
    const before = snapshot()
    const result = run(...args)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Informe uma versão estável')
    expect(snapshot()).toEqual(before)
  })

  it.each(['tracked', 'staged', 'untracked'])('preserva alterações pendentes (%s)', kind => {
    if (kind === 'untracked') write('notes.txt', 'Trabalho em andamento\n')
    else {
      write('package.json', `${readFileSync(join(repo, 'package.json'), 'utf8')}\n`)
      if (kind === 'staged') git(['add', 'package.json'])
    }
    const before = snapshot()
    const result = run('0.1.4')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Há alterações pendentes')
    expect(snapshot()).toEqual(before)
  })

  it.each(['local', 'remote'])('recusa uma tag existente (%s)', location => {
    git(['tag', 'v0.1.4'])
    if (location === 'remote') {
      git(['push', 'origin', 'v0.1.4'])
      git(['tag', '-d', 'v0.1.4'])
    }
    const before = snapshot()
    const result = run('0.1.4')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(location === 'local' ? 'já existe localmente' : 'já existe no origin')
    expect(snapshot()).toEqual(before)
  })

  it('recusa uma branch diferente de main', () => {
    git(['switch', '-c', 'feature'])
    const before = snapshot()
    const result = run('0.1.4')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Execute a release na branch main')
    expect(snapshot()).toEqual(before)
  })

  it('recusa uma main atrasada em relação ao remoto', () => {
    const peer = join(temp, 'peer')
    git(['clone', remote, peer])
    writeFileSync(join(peer, 'new.txt'), 'Mudança de outro colaborador\n')
    git(['add', '.'], peer)
    git(['commit', '-m', 'Remote change'], peer)
    git(['push', 'origin', 'main'], peer)
    const before = snapshot()
    const result = run('0.1.4')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('não contém todos os commits do origin')
    expect(snapshot()).toEqual(before)
  })

  it('falha antes de editar arquivos quando o remoto está indisponível', () => {
    git(['remote', 'set-url', 'origin', join(temp, 'missing.git')])
    const before = snapshot()
    const result = run('0.1.4')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('ls-remote')
    expect(snapshot()).toEqual(before)
  })

  it('valida todos os arquivos antes de começar a gravar versões', () => {
    write('src-tauri/Cargo.lock', 'version = 4\n')
    git(['add', 'src-tauri/Cargo.lock'])
    git(['commit', '-m', 'Incomplete lockfile'])
    const before = snapshot()
    const result = run('0.1.4')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Não foi possível localizar a versão')
    expect(snapshot()).toEqual(before)
  })

  it('mantém o remoto intacto se a tag for rejeitada e informa como repetir o push', () => {
    writeFileSync(join(remote, 'hooks/update'), '#!/bin/sh\ncase "$1" in refs/tags/*) echo "Tag rejeitada para teste" >&2; exit 1 ;; esac\n', { mode: 0o755 })
    const before = snapshot()
    const result = run('0.1.4')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('foram mantidos localmente')
    expect(result.stderr).toContain('git push --atomic origin HEAD:refs/heads/main refs/tags/v0.1.4')
    expect(git(['show-ref'], remote)).toBe(before.remoteRefs)
    expect(git(['rev-parse', 'HEAD'])).not.toBe(before.head)
    expect(git(['rev-parse', 'v0.1.4^{}'])).toBe(git(['rev-parse', 'HEAD']))
    expect(git(['status', '--porcelain'])).toBe('')
  })
})
