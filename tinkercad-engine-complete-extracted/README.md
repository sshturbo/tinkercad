# Tinkercad Engine Complete Extracted

## Conteúdo

- **170 modelos de simulação** extraídos.
- **332 módulos de engine/dependências** separados.
- **221** classificados como núcleo provável.
- **111** dependências de apoio.
- **667 módulos Webpack** detectados no bundle inteiro.
- Bundle original preservado em `raw/`.

## Estrutura

```text
models/
  <simulation_model>--module-<id>.js

engine/
  core/
  dependencies/

component-map/
  <device_id>.json

indexes/
  model-index.json
  model-to-module.json
  component-model-map.json
  engine-index.json
  shared-dependencies.json
  full-webpack-dependency-graph.json

raw/
  circuits-compiled.js
  vendor-compiled.js
```

## Cobertura dos packaged_devices

- 112 packaged_devices analisados.
- 107 possuem `simulation_model`.
- 103 encontraram implementação no bundle.
- 4 referências não encontradas pelo extrator.

## Observação

Esta é a extração completa encontrada no bundle, e não a versão TypeScript simplificada.
O código permanece minificado/acoplado ao runtime Webpack e não deve ser tratado como uma
biblioteca standalone pronta para `import`.
