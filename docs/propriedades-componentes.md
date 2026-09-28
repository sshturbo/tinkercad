# Propriedades dos componentes inspecionados

Referência: seleção direta no editor do [Tinkercad Circuits](https://www.tinkercad.com/) no circuito de aula em 26/09/2026. O painel de cada peça aparece no canto superior direito da bancada. Este documento registra os campos observados; os demais itens do [inventário](catalogo-referencia.md) ainda exigem inspeção e implementação individual.

| Peça | Campos observados | Estado no CircuitLab |
|---|---|---|
| Resistor | Nome; resistência; unidade de pΩ a GΩ | Painel, valor salvo, faixas atualizadas; corrente analógica ainda não calculada |
| LED | Nome; cor verde, amarelo, laranja, azul, vermelho ou branco | Painel, cor física e estado digital |
| Botão | Nome | Painel e contatos momentâneos de quatro terminais |
| Placa de ensaio pequena | Nome | Painel e conexões internas da protoboard |
| Flip-flop J-K duplo 74HC73 | Nome | Painel e simulação digital das duas células |
| Porta quad NAND 74HC00 | Nome | Painel e simulação digital das quatro portas |
| Fonte de energia | Nome; tensão; corrente | Painel e tensão como nível digital; limite de corrente ainda não aplicado |
| Gerador de função | Nome; frequência; amplitude; deslocamento CC; função quadrado, seno ou triângulo | Fonte analógica temporal MNA com 50 Ω de saída; aproximação sem os estágios internos da extração |
| Potenciômetro | Nome; resistência; unidade de pΩ a GΩ | Inspecionado; componente ainda ausente |
| Capacitor | Nome; capacitância; unidade de pF a GF; condição inicial de tensão (V) | MNA transitória parcial; aplica ESR extraído de 10 mΩ em série e guarda separadamente a tensão do elemento ideal |
| Capacitor polarizado | Nome; capacitância; rating quando registrado | Terminais `+`/`−`; aplica ESR de 10 mΩ e apresenta aviso por polaridade reversa ou rating excedido; rating ausente não cria cutoff |
| Indutor | Nome; indutância; condição inicial de corrente (A) | MNA transitória parcial; modelo extraído ideal, sem resistência de enrolamento |
| Interruptor deslizante | Nome | Inspecionado; componente ainda ausente |
| Bateria 9 V | Nome | Inspecionada; componente ainda ausente |
| Bateria 3 V tipo moeda | Nome | Inspecionada; componente ainda ausente |
| Bateria 1,5 V | Nome; contagem de 1 a 4; tipo AA ou AAA; chave incorporada | Inspecionada; componente ainda ausente |
| micro:bit | Nome; cor vermelha, amarela, verde ou azul | Inspecionada; programação e simulação ainda ausentes |

O motor atual usa níveis lógicos `0`, `1` e `X`. Os campos de grandezas analógicas precisam de um solucionador elétrico para reproduzir medições, queda de tensão, corrente, aquecimento e brilho da referência. As propriedades de componentes sem modelo correspondente não devem ser apresentadas como simulação física completa.
