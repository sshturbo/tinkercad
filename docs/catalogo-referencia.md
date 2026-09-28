# Catálogo de referência do Tinkercad Circuits

Inventário de **110 componentes** observado no filtro **Componentes → Todos** do editor em 25/09/2026. Os nomes abaixo servem para planejar modelos e desenhos próprios. A presença neste inventário não indica que o componente já está implementado no CircuitLab. O editor também mostra exemplos prontos em “Disparadores”; eles não fazem parte desses 110 componentes.

Fontes: [editor Tinkercad Circuits](https://www.tinkercad.com/) e [guia oficial do Tinkercad Circuits](https://images.tinkercad.com/jl5ii4oqrdmc/4sMFqe3rDlbUymJt0I4yh/85a4487f7fe274e74c19870ae4679fc1/tinkercad-guides_circuits-Printable.pdf), que descreve a troca da seleção “Básico” para “Todos”.

## Geral

Resistor; capacitor; capacitor polarizado; diodo; diodo Zener; indutor.

## Entrada

Botão; potenciômetro; interruptor deslizante; fotorresistor; fotodiodo; sensor de luz ambiente (fototransistor); sensor flexível; sensor de força; sensor de infravermelho; sensor de distância ultrassônico; sensor de distância ultrassônico de quatro pinos; sensor PIR; sensor de umidade do solo; sensor de inclinação; sensor de temperatura TMP36; sensor de gás; teclado 4×4; interruptor DIP DPST; interruptor DIP DPST ×4; interruptor DIP DPST ×6.

## Saída

LED; LED RGB; lâmpada; NeoPixel; anéis NeoPixel de 12, 16 e 24; faixas NeoPixel de 4, 6, 8, 10, 12, 16 e 20; motor de vibração; motor CC; motor CC com codificador; micro servo; motor de engrenagem; piezo; infravermelho remoto; visor de sete segmentos; LCD 16×2; LCD 16×2 I2C; tela de relógio com sete segmentos.

## Potência e montagem

Bateria 9 V; bateria 1,5 V; bateria 3 V tipo moeda; célula solar; bateria de batata; bateria de limão; placa de ensaio normal, pequena e mini.

## Microcontroladores e instrumentos

micro:bit; micro:bit com corte parcial; Arduino Uno R3; ATtiny; multímetro; fonte de energia; gerador de função; osciloscópio.

## Circuitos integrados e controle de potência

Cronômetro; cronômetro duplo; amplificador operacional 741; comparador quádruplo; comparador duplo; optoacoplador; transistor NPN e PNP (BJT); transistor nMOS e pMOS de pequenos sinais; transistor nMOS e pMOS (MOSFET); TIP120; relé SPDT; relé DPDT; regulador 5 V LM7805; regulador 3,3 V LD1117V33; acionador de motor ponte H.

## Conectores

Conector de oito pinos; USB padrão A.

## Lógica

Portas quádruplas NAND, NOR, AND, OR e XOR; inversor hexagonal; disparador Schmitt inversor; disparador Schmitt NAND quádruplo; portas triplas NAND de três entradas, AND de três entradas e NOR de três entradas; portas duplas NAND de quatro entradas e AND de quatro entradas; flip-flop J-K duplo; flip-flop D duplo; trava de quatro bits; contador binário de quatro bits; somador de quatro bits; registrador de deslocamento de oito bits; contador de décadas Johnson; decodificador de sete segmentos; expansor I2C de oito portas.

## Referência visual do circuito da aula

O circuito aberto na conta do usuário contém duas placas de ensaio lado a lado, dois CIs **74HC73**, um **74HC00**, quatro LEDs verde/amarelo/laranja/azul, quatro resistores, uma fonte de bancada e um gerador de função. Os componentes aparecem como peças físicas: CIs DIP pretos com terminais metálicos, LED com cápsula colorida, resistor axial com faixas, protoboard com fileiras de furos e trilhos vermelho/azul, instrumentos cinza com visor e conectores vermelho/preto. O primeiro desenho SVG do CircuitLab usa essas características como referência.

## Estado de implementação

Estado atual do protótipo: placa de ensaio com redes internas, gerador de função analógico temporal (quadrada, senoidal e triangular), fonte, resistor, LED, botão, chaves, passivos, sensores modelados e parte da lógica 74HC. O gerador é uma fonte amostrada no tempo com resistência de saída de 50 Ω e não reproduz os estágios internos completos da extração. O motor digital mantém níveis `0`, `1` e `X`; a rede analógica usa MNA nos tipos reconhecidos. Capacitores comuns/polarizados já integram o ESR extraído de 10 mΩ no regime transitório; o polarizado apresenta aviso para polaridade reversa ou rating conhecido excedido, sem criar cutoff quando o rating está ausente. O estado guarda a tensão do capacitor ideal separadamente. Indutores usam o modelo transitório ideal, sem resistência de enrolamento. O controle Integração seleciona subpassos máximos de 1, 5, 10, 20 ou 50 ms; o inspetor permite editar a tensão inicial do capacitor e a corrente inicial do indutor. Consulte `docs/plano-simulador-eletronico.md` e o inventário gerado. Os demais itens acima precisam de desenhos, pinos, propriedades e modelos de simulação específicos.
