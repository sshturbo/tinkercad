# Como navegar a engine extraída

## 1. Para achar a lógica de um componente

Abra:

`indexes/component-model-map.json`

Exemplo:

```json
{
  "device_id": "116725",
  "simulation_model": "74HC74",
  "implementation_found": true,
  "module_id": "...",
  "model_file": "models/74HC74--module-....js"
}
```

Depois abra o arquivo indicado em `model_file`.

## 2. Para achar o núcleo compartilhado

Use:

`indexes/shared-dependencies.json`

Os módulos mais importados pelos modelos de simulação são os melhores pontos para entender:
- SimulationModel base
- Signals
- Nets
- scheduler
- utilidades elétricas

## 3. Grafo completo

`indexes/full-webpack-dependency-graph.json`

Esse arquivo permite seguir todas as dependências internas detectadas no bundle.

## 4. Importante

Os arquivos são módulos extraídos de um bundle Webpack minificado.
Eles NÃO são standalone. O objetivo deste pacote é preservar e organizar a engine completa
capturada, para engenharia reversa/portabilidade.

Para uma implementação própria, use-os como referência estrutural e de comportamento.
