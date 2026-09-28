# Circuit Library v3 FULL

Esta versão preserva TUDO o que foi capturado no HAR.

## Estrutura principal

- `components/` — componentes normais detalhados
- `starters/` — catálogo visual de disparadores por grupo
- `starter-devices/` — starters que também vieram como packaged_device detalhado
- `helpers/` — packaged_devices auxiliares (ex.: annotation)
- `assets/thumbnails/` — todos os PNGs capturados
- `raw/packaged_devices/` — JSON bruto de todos os packaged_devices
- `raw/catalog/` — catálogo original
- `raw/http-json/` — todas as respostas JSON capturadas no HAR
- `catalog/` — índices prontos para frontend
- `indexes/` — tags, simulation models e CSV geral

## Resumo

- 112 packaged_devices preservados
- 109 componentes normais detalhados
- 2 starters detalhados
- 1 helpers detalhados
- 67 starters no catálogo
- 177 PNGs
- 113 SVGs
- 128 respostas JSON preservadas
- 106 simulation models
- 127 grupos de tags

Ponto de entrada recomendado:
`catalog/categories.json`

Para auditoria completa:
`catalog/all-packaged-devices.json`
`raw/http-json/`
