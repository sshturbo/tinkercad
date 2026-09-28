// Auto-generated Component Details for CircuitLab Studio
export interface ComponentLink {
  label: string
  url: string
}

export interface ComponentSection {
  id: string
  title: string
  text: string
  image?: string | null
  starterId?: string | null
  starterThumbnail?: string | null
  links?: ComponentLink[]
  defaultOpen: boolean
}

export interface ComponentDetail {
  id: string
  name: string
  shortDescription: string
  sections: ComponentSection[]
}

export const COMPONENT_DETAILS: Record<string, ComponentDetail> = {
  "1": {
    "id": "1",
    "name": "Geral",
    "shortDescription": "",
    "sections": []
  },
  "2": {
    "id": "2",
    "name": "Entrada",
    "shortDescription": "",
    "sections": []
  },
  "3": {
    "id": "3",
    "name": "Saída",
    "shortDescription": "",
    "sections": []
  },
  "4": {
    "id": "4",
    "name": "Potência",
    "shortDescription": "",
    "sections": []
  },
  "5": {
    "id": "5",
    "name": "Placas de ensaio",
    "shortDescription": "",
    "sections": []
  },
  "6": {
    "id": "6",
    "name": "Microcontroladores",
    "shortDescription": "",
    "sections": []
  },
  "7": {
    "id": "7",
    "name": "Instrumentos",
    "shortDescription": "",
    "sections": []
  },
  "8": {
    "id": "8",
    "name": "Circuitos integrados",
    "shortDescription": "",
    "sections": []
  },
  "9": {
    "id": "9",
    "name": "Controle de potência",
    "shortDescription": "",
    "sections": []
  },
  "10": {
    "id": "10",
    "name": "Redes",
    "shortDescription": "",
    "sections": []
  },
  "11": {
    "id": "11",
    "name": "Conectores",
    "shortDescription": "",
    "sections": []
  },
  "12": {
    "id": "12",
    "name": "Lógica",
    "shortDescription": "",
    "sections": []
  },
  "13": {
    "id": "13",
    "name": "Montagens de circuito",
    "shortDescription": "",
    "sections": []
  },
  "14": {
    "id": "14",
    "name": "Disparadores básicos",
    "shortDescription": "",
    "sections": []
  },
  "15": {
    "id": "15",
    "name": "Disparadores Arduino",
    "shortDescription": "",
    "sections": []
  },
  "16": {
    "id": "16",
    "name": "Disparadores",
    "shortDescription": "",
    "sections": []
  },
  "17": {
    "id": "17",
    "name": "Outros componentes",
    "shortDescription": "",
    "sections": []
  },
  "18": {
    "id": "18",
    "name": "Outros disparadores",
    "shortDescription": "",
    "sections": []
  },
  "19": {
    "id": "19",
    "name": "Disparadores de micro:bits",
    "shortDescription": "",
    "sections": []
  },
  "20": {
    "id": "20",
    "name": "Disparadores variados",
    "shortDescription": "",
    "sections": []
  },
  "14416": {
    "id": "14416",
    "name": "Potenciômetro",
    "shortDescription": "Tipo de resistor cuja resistência muda quando se vira uma chave.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um resistor variável controlado por uma chave.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O potenciômetro funciona alterando-se a posição de um contato móvel em um material resistivo em relação a um contato fixo, resultando em uma resistência que varia conforme a movimentação do contato.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Esse dispositivo tem associados a ele três fios condutores. Conecte os pinos externos à fonte de alimentação e ao Terra (Ground); o pino de Sinal (Signal) é conectado diretamente a um dispositivo ou a qualquer terminal digital ou analógico de um Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Clique no dispositivo durante a simulação para realçá-lo e, em seguida, clique e arraste o limpador para alterar a resistência simulada.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicLEDDimmer",
        "starterThumbnail": "starters/basic/starterBasicLEDDimmer.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Ler um Potenciômetro com a Entrada analógica do Arduino",
            "url": "https://www.instructables.com/Arduino-Potentiometer-Analog-Input-Tinkercad/"
          },
          {
            "label": "Tutorial de Resistores variáveis",
            "url": "https://www.instructables.com/Resistors/#step6"
          },
          {
            "label": "Guia de Potenciômetros",
            "url": "https://learn.adafruit.com/make-it-change-potentiometers?view=all"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "16511": {
    "id": "16511",
    "name": "Resistor",
    "shortDescription": "Restringe o fluxo de eletricidade em um circuito, reduzindo a voltagem e, consequentemente, a corrente.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "O resistor limita o fluxo de corrente elétrica em um circuito.",
        "image": "/assets/component-photos/resistor.jpg",
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O resistor usa parte da corrente de um circuito e a converte em calor. Ele faz isso fornecendo à eletricidade um trajeto mais longo, delgado e um pouco menos condutivo. Os resistores são usados em todos os tipos de circuitos, desde o auxílio para que LEDs não queimem, até o ajuste de frequência de sinais de rádio.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "O resistor tem dois fios condutores e deve ser conectado em série com o dispositivo que ele deve suportar. Os resistores não são polarizados, o que significa que podem ser conectados de qualquer forma sem afetar seu funcionamento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e resistência.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicResistor",
        "starterThumbnail": "starters/basic/starterBasicResistor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Resistores",
            "url": "https://www.instructables.com/Resistors/"
          },
          {
            "label": "Lei de Ohm",
            "url": "https://www.instructables.com/Ohms-Law-4/"
          },
          {
            "label": "Calculadora de código de cores do resistor",
            "url": "https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-resistor-color-code"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17910": {
    "id": "17910",
    "name": "Capacitor",
    "shortDescription": "Armazena e libera energia elétrica em um circuito.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo armazena energia elétrica temporariamente. As \"tampas\" cerâmicas são normalmente usadas para baixos valores de capacitância.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O capacitor armazena energia elétrica coletando partículas carregadas em duas placas condutoras separadas por um material não condutor (neste caso, a cerâmica).",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "O capacitor tem dois fios condutores e pode ser conectado em paralelo ou em série com o dispositivo que ele deve suportar, dependendo da aplicação. Os capacitores cerâmicos não são polarizados, o que significa que podem ser conectados de qualquer forma sem afetar seu funcionamento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e capacitância.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicCeramicCapacitor",
        "starterThumbnail": "starters/basic/starterBasicCeramicCapacitor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Capacitores",
            "url": "https://www.instructables.com/Capacitors-2/"
          },
          {
            "label": "Circuit Playground: C significa Capacitor",
            "url": "https://learn.adafruit.com/circuit-playground-c-is-for-capacitor"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17911": {
    "id": "17911",
    "name": "Capacitor polarizado",
    "shortDescription": "Capacitor direcional usado para armazenar e liberar energia elétrica em um circuito.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo armazena energia elétrica temporariamente. As \"tampas\" eletrolíticas são normalmente usadas para altos valores de capacitância.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O capacitor armazena energia elétrica coletando partículas carregadas em duas placas condutoras separadas por um material não condutor (neste caso, um eletrólito e óxido metálico).",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "O capacitor tem dois fios condutores e pode ser conectado em paralelo ou em série com o dispositivo que ele deve suportar, dependendo da aplicação. O capacitor eletrolítico é polarizado, o que significa que ele tem um lado positivo e outro negativo, que precisam ser conectados corretamente para que ele funcione.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e capacitância.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicPolarizedCapacitor",
        "starterThumbnail": "starters/basic/starterBasicPolarizedCapacitor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Capacitores",
            "url": "https://www.instructables.com/Capacitors-2/"
          },
          {
            "label": "Circuit Playground: C significa Capacitor",
            "url": "https://learn.adafruit.com/circuit-playground-c-is-for-capacitor"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17913": {
    "id": "17913",
    "name": "Indutor",
    "shortDescription": "Resiste à mudança no fluxo de corrente.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Um indutor é uma bobina de fio que se opõe às alterações na corrente elétrica.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Esse dispositivo armazena energia em um campo magnético quando é aplicada eletricidade. Esse campo magnético resiste a mudanças no fluxo de corrente que passa pelo indutor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "O indutor tem dois fios condutores e deve ser conectado em série com o dispositivo que ele deve suportar.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e indutância.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicInductor",
        "starterThumbnail": "starters/basic/starterBasicInductor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Indutores",
            "url": "https://www.instructables.com/Inductors/"
          },
          {
            "label": "Calculadora de conversão de indutância",
            "url": "https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-inductance"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17914": {
    "id": "17914",
    "name": "Diodo",
    "shortDescription": "Permite o fluxo de eletricidade em uma única direção.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Um diodo é como uma válvula unidirecional que permite que a corrente flua através de um circuito em uma direção, mas não na outra.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Esse dispositivo contém um material semicondutor que conduz eletricidade em uma direção, mas bloqueia quase completamente o fluxo na direção oposta.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "O diodo tem dois fios condutores e pode ser conectado em paralelo ou em série com o dispositivo que ele deve suportar, dependendo da aplicação. Os diodos são polarizados, o que significa que cada um deles tem um polo positivo e outro negativo, que devem ser conectados de forma específica.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicDiode",
        "starterThumbnail": "starters/basic/starterBasicDiode.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Diodos",
            "url": "https://www.instructables.com/Diodes/"
          },
          {
            "label": "Circuit Playground: D significa Diodo",
            "url": "https://learn.adafruit.com/circuit-playground-d-is-for-diode?view=all"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17916": {
    "id": "17916",
    "name": "LED",
    "shortDescription": "Diodo emissor de luz que se acende quando a eletricidade passa através dele na direção correta.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um diodo emissor de luz.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o Ânodo positivo a uma voltagem maior e o Cátodo negativo a uma voltagem menor para aumentar a iluminação. Limite o fluxo de corrente com um resistor. Os LEDs são polarizados e não se acendem quando conectados de trás para frente.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e cor.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicLEDLightUp",
        "starterThumbnail": "starters/basic/starterBasicLEDLightUp.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "LEDs",
            "url": "https://www.instructables.com/LEDs-Lesson/"
          },
          {
            "label": "Lei de Ohm",
            "url": "https://www.instructables.com/Ohms-Law-4/"
          },
          {
            "label": "Calculadora de resistores em série para LED",
            "url": "https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-led-series-resistor"
          },
          {
            "label": "Circuit Playground: L significa LED",
            "url": "https://www.youtube.com/watch?v=E2WcaJySVuw&list=PLjF7R1fz_OOXWHQhEVEI5Jqf18TQRr5Hu&index=8"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17917": {
    "id": "17917",
    "name": "LED RGB",
    "shortDescription": "Tipo de LED que combina vermelho, azul e verde para produzir qualquer cor.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é composto por três diodos emissores de luz em um pacote.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Os LEDs RGB contêm três LEDs separados: vermelho, verde e azul, que compartilham um pino catódico comum. Sua luz pode ser misturada para criar qualquer cor de luz visível. Uma corrente excessiva pode danificar ou mesmo quebrar os LEDs; por isso, adicione resistores em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem quatro fios condutores. O pino Cátodo é ligado a uma tensão mais baixa e cada um dos três pinos coloridos é ligado a uma tensão mais alta para alimentar cada LED colorido. Certifique-se de limitar o fluxo de corrente com resistores.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicRGBLED",
        "starterThumbnail": "starters/basic/starterBasicRGBLED.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "LED RGB mistura de cores com o Arduino no Tinkercad",
            "url": "https://www.instructables.com/RGB-LED-Color-Mixing-With-Arduino-in-Tinkercad/"
          },
          {
            "label": "Folha de dados, RGB LED",
            "url": "https://www.kingbrightusa.com/images/catalog/SPEC/WP154A4SUREQBFZGC.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17919": {
    "id": "17919",
    "name": "Interruptor deslizante",
    "shortDescription": "Interruptor com duas posições: aberta e fechada.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um interruptor de alternância com duas posições.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O interruptor de alternância contém contatos de metal que se unem eletricamente quando o controle deslizante é movido, permitindo que a corrente elétrica flua.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Conecte o pino Comum (Common) no meio ao seu dispositivo. Os pinos de Força (Power) e Terra (Ground) são conectados aos Terminais 1 e 2; a ordem determina qual direção está ATIVADA ou DESATIVADA.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Clique no dispositivo durante a simulação para alterar a posição da chave.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicLEDSwitch",
        "starterThumbnail": "starters/basic/starterBasicLEDSwitch.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Interruptores",
            "url": "https://www.instructables.com/Switches/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17920": {
    "id": "17920",
    "name": "Transistor NPN (BJT)",
    "shortDescription": "Componente usado para amplificar ou trocar sinais eletrônicos. Usado comumente com motores.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Os transistores amplificam a potência e podem atuar como interruptores eletricamente controlados. Os transistores de junção bipolar (BJTs, bipolar junction transistors) possuem três camadas de silício, cuja disposição determina a direção do fluxo de corrente.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os transistores NPN BJT consistem em uma camada de silício tipo P posicionada entre duas camadas de silício tipo N. A corrente relativamente pequena que flui da base para o emissor aciona uma corrente significativamente maior para fluir do coletor para o emissor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três pinos. Conecte a base (B) ao seu sinal, como um pino de interruptor ou microcontrolador. Conecte o coletor (C) à sua fonte de alimentação e o emissor (E) através do dispositivo que você deseja controlar ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicNPN",
        "starterThumbnail": "starters/basic/starterBasicNPN.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Transistores 101",
            "url": "https://learn.adafruit.com/transistors-101"
          },
          {
            "label": "Transistores",
            "url": "https://www.instructables.com/Transistors/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17921": {
    "id": "17921",
    "name": "Transistor PNP (BJT)",
    "shortDescription": "Componente usado para amplificar ou trocar sinais eletrônicos. Usado comumente com motores.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Os transistores amplificam a potência e podem atuar como interruptores eletricamente controlados. Os transistores de junção bipolar (BJTs, bipolar junction transistors) possuem três camadas de silício, cuja disposição determina a direção do fluxo de corrente.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os transistores PNP BJT consistem em uma camada de silício tipo N posicionada entre duas camadas de silício do tipo P. A corrente relativamente pequena que flui da base para o emissor aciona uma corrente significativamente maior para fluir do emissor para o coletor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três pinos. Conecte a base (B) ao seu sinal, como um pino de interruptor ou microcontrolador. Conecte o emissor (E) à sua fonte de alimentação e o coletor (C) através do dispositivo que você deseja controlar ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterPNPTransistor",
        "starterThumbnail": "starters/basic/starterPNPTransistor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Transistores 101",
            "url": "https://learn.adafruit.com/transistors-101"
          },
          {
            "label": "Transistores",
            "url": "https://www.instructables.com/Transistors/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17924": {
    "id": "17924",
    "name": "Transistor nMOS (MOSFET)",
    "shortDescription": "Transistor para grandes sinais controlado por voltagem.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Os transistores amplificam a energia e podem atuar como interruptores eletricamente controlados. MOSFET (metal-oxide-semiconductor field-effect transistor) significa transistor de efeitos de campo com semicondutores de óxido metálico. Os transistores de efeitos de campo (FETs, Field-effect transistors) são mais eficientes do que os BJTs pelo uso de um campo elétrico para controlar o fluxo de corrente.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "A tensão de porta controla o fluxo de corrente entre a fonte e o dreno. Os transistores MOS negativos criam um circuito fechado quando a tensão é aplicada.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três pinos. Conecte a porta (G) ao seu sinal, como um pino de interruptor ou microcontrolador. Conecte o dispositivo que você deseja controlar à fonte de alimentação e seu aterramento ao dreno (D). Conecte a fonte (S) ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterNMOSTransistor",
        "starterThumbnail": "starters/basic/starterNMOSTransistor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Transistores 101",
            "url": "https://learn.adafruit.com/transistors-101"
          },
          {
            "label": "M significa MOSFET",
            "url": "https://www.youtube.com/watch?v=SWiJcfNUYTg&list=PLjF7R1fz_OOXWHQhEVEI5Jqf18TQRr5Hu&index=7"
          },
          {
            "label": "Transistores NMOS e PMOS explicados",
            "url": "https://builtin.com/hardware/nmos-transistor"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "17927": {
    "id": "17927",
    "name": "Osciloscópio",
    "shortDescription": "Equipamento de teste eletrônico que mede sinais de saída.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um equipamento de teste eletrônico para medição de sinais de saída.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O osciloscópio de armazenamento digital (DSO, digital storage oscilloscope) converte um sinal analógico em digital para fins de armazenamento, exibição e análise por amostragem do sinal a uma taxa variável.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o fio Positivo (Positive) ao terminal positivo no dispositivo que você deseja medir e conecte o fio Negativo (Negative) ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e tempo por divisão.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoPWM",
        "starterThumbnail": "starters/basic/starterArduinoPWM.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Como usar um osciloscópio",
            "url": "https://learn.sparkfun.com/tutorials/how-to-use-an-oscilloscope/all"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "18104": {
    "id": "18104",
    "name": "Transistor pMOS (MOSFET)",
    "shortDescription": "Transistor para grandes sinais controlado por voltagem.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Os transistores amplificam a energia e podem atuar como interruptores eletricamente controlados. MOSFET (metal-oxide-semiconductor field-effect transistor) significa transistor de efeitos de campo com semicondutores de óxido metálico. Os transistores de efeitos de campo (FETs, Field-effect transistors) são mais eficientes do que os BJTs pelo uso de um campo elétrico para controlar o fluxo de corrente.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "A tensão de porta controla o fluxo de corrente entre a fonte e o dreno. Os transistores MOS positivos criam um circuito aberto quando a tensão é aplicada.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três pinos. Conecte a porta (G) ao seu sinal, como um pino de interruptor ou microcontrolador. Conecte o dispositivo que você deseja controlar à fonte de alimentação e seu aterramento ao dreno (D). Conecte a fonte (S) ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoPMOSFET",
        "starterThumbnail": "starters/basic/starterArduinoPMOSFET.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Transistores 101",
            "url": "https://learn.adafruit.com/transistors-101"
          },
          {
            "label": "M significa MOSFET",
            "url": "https://www.youtube.com/watch?v=SWiJcfNUYTg&list=PLjF7R1fz_OOXWHQhEVEI5Jqf18TQRr5Hu&index=7"
          },
          {
            "label": "Transistores NMOS e PMOS explicados",
            "url": "https://builtin.com/hardware/nmos-transistor"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "27263": {
    "id": "27263",
    "name": "Acionador de motor de ponte H",
    "shortDescription": "Capaz de acionar dois motores CC ou um motor de passo bipolar ou unipolar.",
    "sections": []
  },
  "27266": {
    "id": "27266",
    "name": "Optoacoplador",
    "shortDescription": "Transfere sinais entre dois circuitos usando luz.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "O optoacoplador permite a transferência de sinal entre dois circuitos isolados com o uso de luz infravermelha. Eles são usados para evitar que sistemas elétricos diferentes afetem uns aos outros, como nos circuitos de fonte de alimentação e nas entradas de microcontroladores.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo consiste em um LED infravermelho e um fototransistor dentro dele. Quando o fototransistor detecta luz infravermelha do sinal aplicado ao LED, uma corrente elétrica flui pelo fototransistor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem seis pinos: dois para o LED (ânodo e cátodo), três para o fototransistor (base, emissor, coletor) e o pino restante não é conectado.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starter4N35",
        "starterThumbnail": "starters/basic/starter4N35.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Tutorial do optoacoplador",
            "url": "https://www.electronics-tutorials.ws/blog/optocoupler.html"
          },
          {
            "label": "Circuitos integrados (ICs)",
            "url": "https://www.instructables.com/Integrated-Circuits-1/"
          },
          {
            "label": "Folha de dados, 4N35",
            "url": "https://www.onsemi.com/download/data-sheet/pdf/4n35-d.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "27268": {
    "id": "27268",
    "name": "Placa de ensaio pequena",
    "shortDescription": "Placa de ensaio com metade do tamanho, com 30 linhas, 10 colunas e dois pares de linhas de corrente.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "As placas de ensaio sem solda são usadas para prototipagem de circuitos de forma rápida e fácil.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "As placas de ensaio permitem conectar componentes com o uso de soquetes de metal com várias portas. As partes condutivas da placa de ensaio permitem o fluxo de elétrons entre os itens a ela conectados.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Duas linhas longas descem em cada lado. Esses conectores longos normalmente servem para conexões de energia e aterramento, usadas com muita frequência. As pequenas colunas verticais que compõem o meio da placa destinam-se à conexão de fios e componentes. Observe o divisor no meio da placa: ele é um ponto de fixação para os chips, fornecendo acesso independente a cada um dos pinos.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome. Passe o mouse sobre os furos para ver quais estão conectados eletricamente no interior da placa de ensaio.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoToneKeyboard",
        "starterThumbnail": "starters/basic/starterArduinoToneKeyboard.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Introdução à placa de ensaio",
            "url": "https://www.instructables.com/Introducing-the-Breadboard/"
          },
          {
            "label": "Vários LEDs e placas de ensaio com Arduino no Tinkercad",
            "url": "https://www.instructables.com/Multiple-LEDs-Breadboards-With-Arduino-in-Tinkerca/"
          },
          {
            "label": "Aula sobre Arduino: seus primeiros experimentos com uma placa de ensaio sem solda",
            "url": "https://www.instructables.com/Your-First-Experiments/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "27571": {
    "id": "27571",
    "name": "Fonte de energia",
    "shortDescription": "Equipamento de teste eletrônico para fornecimento de energia ao circuito",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um equipamento de teste eletrônico para fornecimento de energia ao circuito.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "As fontes de alimentação convertem a CA da parede em CC regulada em tensão determinada e corrente máxima.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o fio Positivo (Positive) ao terminal positivo no dispositivo que você deseja alimentar e o fio Negativo (Negative) ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome, tensão e corrente.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterPowerSupply",
        "starterThumbnail": "starters/basic/starterPowerSupply.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia de fontes de alimentação",
            "url": "https://learn.adafruit.com/power-supplies"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "27664": {
    "id": "27664",
    "name": "Sensor de temperatura [TMP36]",
    "shortDescription": "Sensor que emite diferentes voltagens com base na temperatura ambiente.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este sensor mede a temperatura.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo contém material semicondutor que altera propriedades elétricas de forma consistente com a alteração de temperaturas. O sinal do pino central muda conforme a mudança de temperatura, e o programa do microcontrolador pode converter esse sinal de 0 a 1023 em uma temperatura em °C ou °F.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Há três pinos conectados ao dispositivo. Gire o sensor para que o lado plano e rotulado fique de frente para você. Ligue o dispositivo conectando o pino mais à esquerda à alimentação, o pino mais à direita ao aterramento e o pino central ao seu multímetro ou microcontrolador.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação para exibir um controle deslizante que representa a temperatura. Deslize o alvo para alterar a temperatura simulada.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicTemperatureSensor",
        "starterThumbnail": "starters/basic/starterBasicTemperatureSensor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Sensor de temperatura TMP36 com Arduino no Tinkercad",
            "url": "https://www.instructables.com/TMP36-Temperature-Sensor-Arduino-Tinkercad/"
          },
          {
            "label": "Uso de um sensor de temperatura",
            "url": "https://learn.adafruit.com/tmp36-temperature-sensor?view=all"
          },
          {
            "label": "Folha de dados, TMP36",
            "url": "https://www.analog.com/media/en/technical-documentation/data-sheets/TMP35_36_37.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28098": {
    "id": "28098",
    "name": "LCD 16 x 2",
    "shortDescription": "Tela de cristal líquido que exibe duas linhas de 16 caracteres.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um Visualizador de cristal líquido capaz de exibir duas linhas de texto com 16 caracteres cada.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LCDs contêm muitas camadas de materiais. Há uma luz de fundo LED e um \"sanduíche\" de vidro polarizado em torno de cristais líquidos, que pode girar eletronicamente a luz polarizada para permitir que a luz de fundo passe e seja vista, ou seja bloqueada pelo polarizador na parte superior.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem 16 fios condutores. Conecte o VCC a 5V em um Arduino e o GND a qualquer terminal GND em um Arduino. Os outros pinos controlam o contraste da tela, a comunicação de dados com o microcontrolador e a luz de fundo do LED.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoLCD",
        "starterThumbnail": "starters/basic/starterArduinoLCD.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia de LCDs de caracteres",
            "url": "https://learn.adafruit.com/character-lcds?view=all"
          },
          {
            "label": "Folha de dados, módulo LCD",
            "url": "https://www.arduino.cc/documents/datasheets/LCDscreen.PDF"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28101": {
    "id": "28101",
    "name": "Sensor de inclinação de 4 pinos",
    "shortDescription": "Interruptor acionador de 4 pinos sensível à inclinação, encontrado nos kits Arduino.",
    "sections": []
  },
  "28211": {
    "id": "28211",
    "name": "Piezo",
    "shortDescription": "Tipo de buzzer que emite ruído em diferentes frequências.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Piezos são um tipo de buzzer que produz ruído em diferentes frequências.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os piezos podem converter corrente elétrica alternada em som (vibração) e vice-versa.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Ele pode ser conectado de qualquer forma para produzir som. Um terminal é conectado a um sinal PWM (por exemplo, de um Arduino) e o outro é conectado ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoToneKeyboard",
        "starterThumbnail": "starters/basic/starterArduinoToneKeyboard.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Detectar um deslocamento",
            "url": "https://docs.arduino.cc/built-in-examples/sensors/Knock"
          },
          {
            "label": "Reproduzir uma melodia usando a função de tom()",
            "url": "https://www.arduino.cc/en/Tutorial/BuiltInExamples/toneMelody"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28256": {
    "id": "28256",
    "name": "Motor CC",
    "shortDescription": "Motor que converte energia elétrica em energia mecânica.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "O motor CC converte corrente elétrica em movimento rotacional.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Quando o motor é alimentado por corrente direta, é criado um campo magnético que atrai e repele os ímãs no interior, fazendo com que o rotor gire.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o Positivo (Positive) à alimentação e o Negativo (Negative) ao aterramento para fazer o motor girar.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicDCMotor",
        "starterThumbnail": "starters/basic/starterBasicDCMotor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Motores e movimento",
            "url": "https://www.instructables.com/Motors-and-Motion/"
          },
          {
            "label": "Folha de dados, motor CC",
            "url": "https://www.arduino.cc/documents/datasheets/DCmotor.PDF"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28257": {
    "id": "28257",
    "name": "Micro servo",
    "shortDescription": "Motor cuja posição pode ser controlada com o uso de um microcontrolador, como um Arduino.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Os motores servo contêm um motor CC, uma placa controladora e uma caixa de engrenagens.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo interpreta um sinal de pulso modulado por largura de pulso (PWM, pulse-width-modulated) para girar até determinada posição ou controlar a velocidade de rotação.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Sinal (Signal) é conectado a qualquer saída compatível com PWM no Arduino (marcada com ~).",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome e definir se ele é um servo de rotação posicional ou contínua.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterThumbnail": null,
        "defaultOpen": true
      }
    ]
  },
  "28704": {
    "id": "28704",
    "name": "Placa de ensaio",
    "shortDescription": "Placa de ensaio com tamanho integral, 63 linhas, 10 colunas e dois pares de linhas de corrente.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "As placas de ensaio sem solda são usadas para prototipagem de circuitos de forma rápida e fácil.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "As placas de ensaio permitem conectar componentes com o uso de soquetes de metal com várias portas. As partes condutivas da placa de ensaio permitem o fluxo de elétrons entre os itens a ela conectados.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Duas linhas longas descem em cada lado. Esses conectores longos normalmente servem para conexões de energia e aterramento, usadas com muita frequência. As pequenas colunas verticais que compõem o meio da placa destinam-se à conexão de fios e componentes. Observe o divisor no meio da placa: ele é um ponto de fixação para os chips, fornecendo acesso independente a cada um dos pinos.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome. Passe o mouse sobre os furos para ver quais estão conectados eletricamente no interior da placa de ensaio.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starter7Segment",
        "starterThumbnail": "starters/basic/starter7Segment.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Introdução à placa de ensaio",
            "url": "https://www.instructables.com/Introducing-the-Breadboard/"
          },
          {
            "label": "Vários LEDs e placas de ensaio com Arduino no Tinkercad",
            "url": "https://www.instructables.com/Multiple-LEDs-Breadboards-With-Arduino-in-Tinkerca/"
          },
          {
            "label": "Aula sobre Arduino: seus primeiros experimentos com uma placa de ensaio sem solda",
            "url": "https://www.instructables.com/Your-First-Experiments/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28708": {
    "id": "28708",
    "name": "Diodo Zener",
    "shortDescription": "Assemelha-se a um diodo normal, mas permite o fluxo de corrente invertido, se a voltagem Zener for alcançada.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "O diodo Zener permite que a corrente inverta o fluxo se for alcançada determinada tensão.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Esse dispositivo contém material semicondutor que conduz eletricidade em uma direção, mas bloqueia quase completamente o fluxo na direção oposta, a menos que seja excedida determinada tensão.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "O diodo Zener tem dois fios condutores e deve ser conectado em série com o dispositivo que ele deve suportar. Os diodos são polarizados, o que significa que cada um deles tem um polo positivo e outro negativo, que devem ser conectados de forma específica.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e tensão Zener.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicZenerDiode",
        "starterThumbnail": "starters/basic/starterBasicZenerDiode.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Diodos",
            "url": "https://www.instructables.com/Diodes/"
          },
          {
            "label": "Introdução aos diodos Zener",
            "url": "https://www.evilmadscientist.com/2012/basics-introduction-to-zener-diodes/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28709": {
    "id": "28709",
    "name": "Multímetro",
    "shortDescription": "Ferramenta usada para medir a voltagem, a corrente e a resistência no circuito.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é uma ferramenta para medir tensão, corrente e resistência no circuito.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os medidores usam a Lei de Ohm para calcular a tensão, a corrente ou a resistência que medem após aplicar uma corrente, resistência ou tensão conhecida, respectivamente. Os multimetros digitais medem a tensão usando um circuito de conversão analógico-digital (ADC).",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o fio Positivo ao terminal de tensão mais alta no dispositivo que você deseja medir e o Negativo ao terminal de tensão mais baixa. Frequentemente, a entrada negativa está conectada ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e modo.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicTemperatureSensor",
        "starterThumbnail": "starters/basic/starterBasicTemperatureSensor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia de multímetros",
            "url": "https://learn.adafruit.com/multimeters?view=all"
          },
          {
            "label": "Como usar um multímetro",
            "url": "https://learn.sparkfun.com/tutorials/how-to-use-a-multimeter/all"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28710": {
    "id": "28710",
    "name": "USB padrão A",
    "shortDescription": "Conector USB padrão macho do tipo A.",
    "sections": []
  },
  "28711": {
    "id": "28711",
    "name": "Cronômetro",
    "shortDescription": "Tipo de medidor de tempo bipolar único de uso geral.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um circuito integrado (IC, integrated circuit) que contém um medidor de tempo bipolar único de uso geral. Ele pode ser usado para criar pulsos bem cronometrados.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O cronômetro 555 é um tipo de Circuito integrado (IC, Integrated Circuit) que contém um circuito de sincronização composto por 25 transistores, dois diodos e 15 resistores.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem oito pinos, requer energia para seu pino de Força (Power), aterramento para seu pino Terra (Ground) e os pinos restantes configuram se o temporizador funciona como flip-flop, divisor de tensão ou comparador.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starter555",
        "starterThumbnail": "starters/basic/starter555.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Conheça a 555",
            "url": "https://learn.adafruit.com/getting-to-know-the-555"
          },
          {
            "label": "Calculadora de cronômetros 555",
            "url": "https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-555-timer"
          },
          {
            "label": "Circuitos integrados",
            "url": "https://www.instructables.com/Integrated-Circuits-1/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28712": {
    "id": "28712",
    "name": "Fotorresistor",
    "shortDescription": "Sensor cuja resistência muda segundo o volume de luz detectado.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um resistor variável que reage à luz.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Quando a energia da luz entra em contato com o sensor, o material absorve parte da energia da luz e a converte em energia elétrica, tornando-se menos resistente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "O resistor tem dois fios condutores e deve ser conectado em série com o dispositivo que ele deve controlar. Os Fotorresistores não são polarizados, o que significa que podem ser conectados de qualquer forma.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação para exibir um controle deslizante que representa o nível de luz. Deslize o alvo para alterar o nível de luz simulado.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicDCMotor",
        "starterThumbnail": "starters/basic/starterBasicDCMotor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Sensor de luz (fotorresistor) com Arduino no Tinkercad",
            "url": "https://www.instructables.com/Light-Sensor-Photoresistor-Arduino-Tinkercad/"
          },
          {
            "label": "Tutorial de fotocélulas",
            "url": "https://learn.adafruit.com/photocells"
          },
          {
            "label": "Folha de dados, fotocélula típica",
            "url": "https://cdn.sparkfun.com/datasheets/Sensors/LightImaging/SEN-09088.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28713": {
    "id": "28713",
    "name": "Amplificador operacional 741",
    "shortDescription": "Utilizado para amplificar ou filtrar sinais analógicos.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Esse dispositivo é um circuito integrado (IC, integrated circuit) usado para amplificar ou filtrar sinais analógicos.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O amplificador operacional 741 é um tipo de circuito integrado (IC, integrated circuit) que contém um circuito de filtro de sinal formado por 20 transistores e 11 resistores.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem oito pinos e requer energia e aterramento para seus pinos de Alimentação+ (Alimentação+) e Alimentação- (Power-), respectivamente. As entradas Ent+ (In+) e Ent- (In-) destinam-se à conexão do sinal a ser amplificado ou filtrado. \"Out\" é a saída. Os pinos de Deslocamento 1 (Offset 1) e Deslocamento 2 (Offset 2) são opcionais e ajudam a estabilizar a variabilidade do sinal que flui pelas entradas.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starter741OpAmp",
        "starterThumbnail": "starters/basic/starter741OpAmp.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Conceitos básicos sobre o amplificador operacional IC 741",
            "url": "https://www.electronicshub.org/ic-741-op-amp-basics/"
          },
          {
            "label": "O que é um amplificador operacional?",
            "url": "https://www.youtube.com/watch?v=ySQxyToxa_o"
          },
          {
            "label": "Circuitos integrados",
            "url": "https://www.instructables.com/Integrated-Circuits-1/"
          },
          {
            "label": "Folha de dados, amplificador operacional 741",
            "url": "https://www.ti.com/lit/ds/symlink/lm741.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28714": {
    "id": "28714",
    "name": "Lâmpada",
    "shortDescription": "Lâmpada incandescente de 12V/3W.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é uma lâmpada incandescente.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo emite luz quando é aplicada eletricidade e aquece um filamento metálico a uma temperatura que produz luz.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o Terminal 1 à alimentação e o Terminal 2 ao aterramento (ou vice-versa; ele não é polarizado) para acender a lâmpada.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterLightBulb",
        "starterThumbnail": "starters/basic/starterLightBulb.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Lâmpadas",
            "url": "http://instructables.com/Light-Bulbs/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28715": {
    "id": "28715",
    "name": "Registrador de deslocamento de oito bits",
    "shortDescription": "Permite adicionar saídas a um microcontrolador.",
    "sections": []
  },
  "28716": {
    "id": "28716",
    "name": "Porta quad NAND",
    "shortDescription": "Quatro portas lógicas, cada uma com saída ALTA quando qualquer uma de suas entradas for BAIXA.",
    "sections": []
  },
  "28717": {
    "id": "28717",
    "name": "Porta quad NOR",
    "shortDescription": "Quatro portas lógicas, cada uma com saída ALTA quando todas as suas entradas forem BAIXAS.",
    "sections": []
  },
  "28718": {
    "id": "28718",
    "name": "Inversor hexadecimal",
    "shortDescription": "Seis portas lógicas inversoras (NOT).",
    "sections": []
  },
  "28719": {
    "id": "28719",
    "name": "Porta quad AND",
    "shortDescription": "Quatro portas lógicas, cada uma com saída ALTA quando todas as suas entradas forem ALTAS.",
    "sections": []
  },
  "28720": {
    "id": "28720",
    "name": "Porta NAND de três entradas tripla",
    "shortDescription": "Três portas lógicas, cada uma com saída ALTA quando qualquer uma de suas três entradas for BAIXA.",
    "sections": []
  },
  "28721": {
    "id": "28721",
    "name": "Porta AND de três entradas tripla",
    "shortDescription": "Três portas lógicas, cada uma com saída ALTA quando todas as suas três entradas forem ALTAS.",
    "sections": []
  },
  "28722": {
    "id": "28722",
    "name": "Disparador Schmitt inversor",
    "shortDescription": "Seis portas lógicas inversoras (NOT) com entradas de disparador Schmitt.",
    "sections": []
  },
  "28724": {
    "id": "28724",
    "name": "Porta NAND de quatro entradas dupla",
    "shortDescription": "Duas portas lógicas, cada uma com saída ALTA quando qualquer uma das suas quatro entradas for BAIXA.",
    "sections": []
  },
  "28725": {
    "id": "28725",
    "name": "Porta AND de quatro entradas dupla",
    "shortDescription": "Duas portas lógicas, cada uma com saída ALTA quando todas as suas quatro entradas forem ALTAS.",
    "sections": []
  },
  "28726": {
    "id": "28726",
    "name": "Porta NOR de três entradas tripla",
    "shortDescription": "Três portas lógicas, cada uma com saída ALTA quando todas as suas três entradas forem BAIXAS.",
    "sections": []
  },
  "28727": {
    "id": "28727",
    "name": "Porta quad OR",
    "shortDescription": "Quatro portas lógicas, cada uma com saída ALTA quando alguma das suas entradas for ALTA.",
    "sections": []
  },
  "28729": {
    "id": "28729",
    "name": "Flip-flop J-K duplo",
    "shortDescription": "Flip-flop J-K duplo com reset. Disparador na borda negativa.",
    "sections": []
  },
  "28730": {
    "id": "28730",
    "name": "Flip-flop D duplo",
    "shortDescription": "Dois flip-flops do tipo D com set/reset. Disparador na borda positiva.",
    "sections": []
  },
  "28731": {
    "id": "28731",
    "name": "Porta quad XOR",
    "shortDescription": "Quatro portas lógicas, cada uma com saída ALTA quando somente uma das suas entradas for ALTA.",
    "sections": []
  },
  "28732": {
    "id": "28732",
    "name": "Contador binário de quatro bits",
    "shortDescription": "Utilizado para contagem ascendente em modo binário.",
    "sections": []
  },
  "28733": {
    "id": "28733",
    "name": "Disparador Schmitt quad NAND",
    "shortDescription": "Quatro portas lógicas, cada uma com saída ALTA quando qualquer uma das entradas do seu disparador Schmitt for BAIXA.",
    "sections": []
  },
  "28734": {
    "id": "28734",
    "name": "Fotodiodo",
    "shortDescription": "Converte luz em corrente elétrica.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "O fotodiodo permite que a corrente seja revertida através dele proporcionalmente à luz que ele absorve.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo funciona como LED reverso: quando a junção de seus materiais é exposta à luz, é gerada corrente ou tensão elétrica, dependendo da forma de conexão.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores e é polarizado. Frequentemente, ele é conectado de forma inversa (polarizado inversamente) para detectar alterações na corrente por meio de uma entrada analógica de um microcontrolador.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação para exibir um controle deslizante que representa o nível de luz. Deslize o alvo para alterar o nível de luz simulado.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoPhotodiode",
        "starterThumbnail": "starters/basic/starterArduinoPhotodiode.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Conceitos básicos de fotodiodos, fototransistores e como aplicá-los",
            "url": "https://www.digikey.com/en/articles/the-basics-of-photodiodes-and-phototransistors-and-how-to-apply-them"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28784": {
    "id": "28784",
    "name": "Transistor nMOS de pequenos sinais",
    "shortDescription": "Transistor para pequenos sinais controlado por voltagem.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Os transistores amplificam a energia e podem atuar como interruptores eletricamente controlados. MOSFET (metal-oxide-semiconductor field-effect transistor) significa transistor de efeitos de campo com semicondutores de óxido metálico. Os transistores de efeitos de campo (FETs, Field-effect transistors) são mais eficientes do que os BJTs pelo uso de um campo elétrico para controlar o fluxo de corrente.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "A tensão de porta controla o fluxo de corrente entre a fonte e o dreno. Os transistores MOS negativos criam um circuito fechado quando a tensão é aplicada.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três pinos. Conecte a porta (G) ao seu sinal, como um pino de interruptor ou microcontrolador. Conecte o dispositivo que você deseja controlar à fonte de alimentação e seu aterramento ao dreno (D). Conecte a fonte (S) ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoSmallSignalNMOS",
        "starterThumbnail": "starters/basic/starterArduinoSmallSignalNMOS.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Transistores 101",
            "url": "https://learn.adafruit.com/transistors-101"
          },
          {
            "label": "M significa MOSFET",
            "url": "https://www.youtube.com/watch?v=SWiJcfNUYTg&list=PLjF7R1fz_OOXWHQhEVEI5Jqf18TQRr5Hu&index=7"
          },
          {
            "label": "Transistores NMOS e PMOS explicados",
            "url": "https://builtin.com/hardware/nmos-transistor"
          },
          {
            "label": "Folha de dados, BS170",
            "url": "https://www.onsemi.com/pdf/datasheet/mmbf170-d.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28785": {
    "id": "28785",
    "name": "Transistor pMOS para pequenos sinais",
    "shortDescription": "Transistor para pequenos sinais controlado por voltagem.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Os transistores amplificam a energia e podem atuar como interruptores eletricamente controlados. MOSFET (metal-oxide-semiconductor field-effect transistor) significa transistor de efeitos de campo com semicondutores de óxido metálico. Os transistores de efeitos de campo (FETs, Field-effect transistors) são mais eficientes do que os BJTs pelo uso de um campo elétrico para controlar o fluxo de corrente.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "A tensão de porta controla o fluxo de corrente entre a fonte e o dreno. Os transistores MOS positivos criam um circuito aberto quando a tensão é aplicada.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três pinos. Conecte a porta (G) ao seu sinal, como um pino de interruptor ou microcontrolador. Conecte o dispositivo que você deseja controlar à fonte de alimentação e seu aterramento ao dreno (D). Conecte a fonte (S) ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoSmallSignalPMOS",
        "starterThumbnail": "starters/basic/starterArduinoSmallSignalPMOS.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Transistores 101",
            "url": "https://learn.adafruit.com/transistors-101"
          },
          {
            "label": "M significa MOSFET",
            "url": "https://www.youtube.com/watch?v=SWiJcfNUYTg&list=PLjF7R1fz_OOXWHQhEVEI5Jqf18TQRr5Hu&index=7"
          },
          {
            "label": "Transistores NMOS e PMOS explicados",
            "url": "https://builtin.com/hardware/nmos-transistor"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28786": {
    "id": "28786",
    "name": "ATtiny",
    "shortDescription": "ATTiny25/45/85 compatível com Arduino, com 512 bytes de memória RAM.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um microcontrolador compatível com ATTiny25/45/85 Arduino.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O ATTiny é um tipo de Circuito Integrado (IC, Integraded Circuit) que pode executar um programa. Ele pode ser programado usando-se o mesmo código que um Arduino Uno R3, mas tem menos pinos e não tem placa de circuito.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem oito pinos e requer entre 2,7V e 5,5V de potência para seu pino de Alimentação (Power) e aterramento para o pino Terra (Ground). Os pinos restantes são de entrada/saída (i/o) (mas PB5/Reset não deve ser usado como entrada).",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo e pressione o botão \"Código\" (\"Code\") para abrir o editor de código e editar seu programa.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterATTiny",
        "starterThumbnail": "starters/basic/starterATTiny.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Programar um ATTiny com Arduino",
            "url": "https://www.instructables.com/Program-an-ATtiny-with-Arduino/"
          },
          {
            "label": "Circuitos integrados",
            "url": "https://www.instructables.com/Integrated-Circuits-1/"
          },
          {
            "label": "Folha de dados, ATTiny",
            "url": "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-2586-AVR-8-bit-Microcontroller-ATtiny25-ATtiny45-ATtiny85_Datasheet.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28787": {
    "id": "28787",
    "name": "Bateria 9V",
    "shortDescription": "Bateria comum, ótima para aplicações que empregam maior potência, como motores.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é uma bateria elétrica com tensão nominal de 9 volts.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Esse aparelho armazena energia potencial e pode converter sua energia química em eletricidade quando conectado a um circuito. As pilhas têm potencial de tensão em seus dois eletrodos, o que faz com que os elétrons percorram o circuito para chegar ao outro lado.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o fio Positivo (Positive) ao terminal positivo no dispositivo que você deseja alimentar e o Negativo (Negative) ao terminal negativo ou de aterramento no dispositivo.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicDCMotor",
        "starterThumbnail": "starters/basic/starterBasicDCMotor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Tudo sobre baterias",
            "url": "https://learn.adafruit.com/all-about-batteries"
          },
          {
            "label": "Circuit Playground: B significa Bateria",
            "url": "https://www.youtube.com/watch?v=mzSnz6ZDkFE"
          },
          {
            "label": "Calculadora de vida útil da bateria",
            "url": "https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-battery-life"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28788": {
    "id": "28788",
    "name": "Placa de ensaio mini",
    "shortDescription": "Placa de ensaio com um quarto do tamanho, 17 linhas e 10 colunas.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "As placas de ensaio sem solda são usadas para prototipagem de circuitos de forma rápida e fácil.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "As placas de ensaio permitem conectar componentes com o uso de soquetes de metal com várias portas. As partes condutivas da placa de ensaio permitem o fluxo de elétrons entre os itens a ela conectados.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Esta miniplaca de ensaio não tem linhas longas de energia/aterramento como as maiores. As pequenas colunas verticais que compõem o meio da placa destinam-se à conexão de fios e componentes. Observe o divisor no meio da placa: ele é um ponto de fixação para os chips, fornecendo acesso independente a cada um dos pinos.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome. Passe o mouse sobre os furos para ver quais estão conectados eletricamente no interior da placa de ensaio.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoMoisture",
        "starterThumbnail": "starters/basic/starterArduinoMoisture.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Introdução à placa de ensaio",
            "url": "https://www.instructables.com/Introducing-the-Breadboard/"
          },
          {
            "label": "Vários LEDs e placas de ensaio com Arduino no Tinkercad",
            "url": "https://www.instructables.com/Multiple-LEDs-Breadboards-With-Arduino-in-Tinkerca/"
          },
          {
            "label": "Aula sobre Arduino: seus primeiros experimentos com uma placa de ensaio sem solda",
            "url": "https://www.instructables.com/Your-First-Experiments/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "28789": {
    "id": "28789",
    "name": "Conector de oito pinos",
    "shortDescription": "Conector de oito pinos com espaçamento de 0,1\".",
    "sections": []
  },
  "29726": {
    "id": "29726",
    "name": "Decodificador de sete segmentos",
    "shortDescription": "Aciona segmentos de LED para que iluminem números em um visor de sete segmentos.",
    "sections": []
  },
  "29956": {
    "id": "29956",
    "name": "Relé DPDT",
    "shortDescription": "Relé de força DPDT de 5V em miniatura",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Um relé é um tipo de chave física controlada por um sinal elétrico. Ele pode lidar com corrente maior do que os comutadores de transistor. DPDT significa Double Pole Double Throw, o que significa um par de comutadores que têm duas posições cada.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Em geral, a alternância no interior dos relés é obtida com o uso de um eletroímã que move um pedaço ou duas linguetas de metal para abrir e fechar um circuito (relé eletromecânico) ou de componentes eletrônicos (relé de estado sólido).",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem oito pinos: dois para a bobina (sinal de controle), um para cada fonte de alimentação do dispositivo e duas saídas para cada interruptor (normalmente abertas e normalmente fechadas).",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicRelayDPDT",
        "starterThumbnail": "starters/basic/starterBasicRelayDPDT.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Tipos de relés e como usá-los",
            "url": "https://www.campuscomponent.com/blogs/post/types-of-relays-and-how-to-use-them-spdt-dpdt-and-solid-state-relay"
          },
          {
            "label": "Folha de dados, relé DPDT série KS2E-M",
            "url": "https://datasheetspdf.com/pdf/552658/KEST/KS2E-M-DC5/1"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "29959": {
    "id": "29959",
    "name": "Relé SPDT",
    "shortDescription": "Relé SPDT de 5V para alternância entre dois circuitos.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Um relé é uma chave física controlada por um sinal elétrico. Ela pode lidar com corrente maior do que as comutadores de transistor. SPDT significa Single Pole Double Throw, que significa uma chave única que tem duas posições.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Em geral, a alternância no interior dos relés é obtida com o uso de um eletroímã que move um pedaço ou duas linguetas de metal para abrir e fechar um circuito (relé eletromecânico) ou de componentes eletrônicos (relé de estado sólido).",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Esse dispositivo tem seis pinos: dois para a bobina (sinal de controle), dois para a fonte de alimentação do dispositivo e duas saídas (normalmente abertas e normalmente fechadas).",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicRelaySPDT",
        "starterThumbnail": "starters/basic/starterBasicRelaySPDT.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Tipos de relés e como usá-los",
            "url": "https://www.campuscomponent.com/blogs/post/types-of-relays-and-how-to-use-them-spdt-dpdt-and-solid-state-relay"
          },
          {
            "label": "Folha de dados, relé SPDT série LU",
            "url": "https://www.jameco.com/Jameco/Products/ProdDS/174450.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "31599": {
    "id": "31599",
    "name": "Contador de décadas Johnson",
    "shortDescription": "Alterna cada uma de dez saídas ALTAS em sequência.",
    "sections": []
  },
  "31738": {
    "id": "31738",
    "name": "Visor de sete segmentos",
    "shortDescription": "LED único com sete segmentos usado para exibir um número ou uma letra.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Esse dispositivo é composto por oito LEDs e um gabinete de plástico para formar os segmentos de dígitos numéricos.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Dependendo da configuração de quais LEDs se acendem por vez, são lidos diferentes números no visor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dez fios condutores. Dois deles estão conectados ao Comum (Common), que é o ânodo ou o cátodo compartilhado de todos os LEDs, dependendo da configuração selecionada. Os outros oito conectam-se separadamente ao outro lado de cada um dos oito LEDs.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e configuração de cátodo/ânodo.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starter7Segment",
        "starterThumbnail": "starters/basic/starter7Segment.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Interface de uma tela de sete segmentos para um Arduino",
            "url": "https://www.allaboutcircuits.com/projects/interface-a-seven-segment-display-to-an-arduino/"
          },
          {
            "label": "Folha de dados, tela de sete segmentos",
            "url": "http://www.kingbrightusa.com/images/catalog/SPEC/SA56-11SRWA.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "31873": {
    "id": "31873",
    "name": "Sensor de inclinação",
    "shortDescription": "Interruptor acionador sensível à inclinação. SW200D.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Esse sensor detecta quando foi inclinado.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo tem no seu interior uma esfera de metal condutor que, quando inclinada além de determinado ângulo, move-se para outra parte do gabinete, fechando ou abrindo o circuito entre as duas entradas.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores e deve ser conectado em série com o dispositivo que ele deve controlar. Os sensores de inclinação não são polarizados, o que significa que podem ser conectados de qualquer forma.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação para exibir uma barra deslizante que representa a inclinação. Deslize o alvo para alterar a inclinação simulada.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicTiltSensor",
        "starterThumbnail": "starters/basic/starterBasicTiltSensor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia do sensor de inclinação",
            "url": "https://learn.adafruit.com/tilt-sensor"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "31896": {
    "id": "31896",
    "name": "Arduino Uno R3",
    "shortDescription": "Placa programável que pode ser usada para gerar circuitos interativos.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é uma placa de microcontrolador Arduino Uno R3.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Esse dispositivo tem um microcontrolador ATMega328, seis entradas analógicas e 13 entradas/saídas digitais.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Conecte os pinos 5V e GND à alimentação da placa de ensaio e às linhas de aterramento, respectivamente. Conecte outros componentes externos, dependendo do código. O código no ponto inicial pisca o LED conectado ao pino 13.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo e pressione o botão \"Código\" (\"Code\") para abrir o editor de código e editar seu programa. Ao simular, o botão vermelho pode ser usado para redefinir o Arduino durante a simulação. Soltar o botão fará com que o programa seja totalmente reiniciado.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoBlink",
        "starterThumbnail": "starters/basic/starterArduinoBlink.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Iniciante do Arduino com circuitos do Tinkercad",
            "url": "https://www.instructables.com/Beginner-Arduino-With-Tinkercad-Circuits/"
          },
          {
            "label": "Aula sobre o Arduino no Instructables",
            "url": "https://www.instructables.com/Arduino-Class/"
          },
          {
            "label": "Folha de dados, Arduino Uno R3",
            "url": "https://docs.arduino.cc/static/ddf3b19af524334434664c2c6c8833cf/A000066-datasheet.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "33016": {
    "id": "33016",
    "name": "Infravermelho remoto",
    "shortDescription": "Controle remoto que emite sinais em infravermelho, decodificados com o uso de um sensor de infravermelho.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo envia sinais usando luz infravermelha.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Usado com um sensor de infravermelho; um infravermelho remoto envia padrões de luz para comunicação sem fio.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação e clique nos botões para enviar seu sinal. Qualquer sensor de infravermelho na simulação receberá o sinal.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterThumbnail": null,
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Tutorial do kit DFR0107 IR",
            "url": "https://wiki.dfrobot.com/IR_Kit_SKU_DFR0107_"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "33187": {
    "id": "33187",
    "name": "TIP120",
    "shortDescription": "Transistor NPN Darlington usado para alternância em equipamentos eletrônicos de alta potência, como motores.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Os transistores amplificam a energia e podem atuar como interruptores controlados eletricamente. Pares de Darlington são dois transistores conectados de forma a criar uma saída muito maior do que um único transistor poderia fornecer sozinho.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "A corrente relativamente pequena que flui da base para o emissor aciona uma corrente significativamente maior que flui do coletor para o emissor. Espera-se que os transistores TIP120 se aqueçam; por isso, eles vêm com uma placa posterior de metal projetada para ser anexada a um dissipador de calor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três pinos. Conecte a base (B) ao seu sinal, como um pino de interruptor ou microcontrolador. Conecte o coletor (C) à sua fonte de alimentação e o emissor (E) através do dispositivo que você deseja controlar ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterTIP120Transistor",
        "starterThumbnail": "starters/basic/starterTIP120Transistor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Transistores 101",
            "url": "https://learn.adafruit.com/transistors-101"
          },
          {
            "label": "Transistores",
            "url": "https://www.instructables.com/Transistors/"
          },
          {
            "label": "Circuito TIP120 Arduino",
            "url": "https://adam-meyer.com/arduino/TIP120"
          },
          {
            "label": "Folha de dados, TIP120",
            "url": "https://cdn-shop.adafruit.com/datasheets/TIP120.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "33955": {
    "id": "33955",
    "name": "Micro servo",
    "shortDescription": "Motor cuja posição pode ser controlada com o uso de um microcontrolador, como um Arduino.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Os motores servo contêm um motor CC, uma placa controladora e uma caixa de engrenagens.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo interpreta um sinal de pulso modulado por largura de pulso (PWM, pulse-width-modulated) para girar até determinada posição ou controlar a velocidade de rotação.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Sinal (Signal) é conectado a qualquer saída compatível com PWM no Arduino (marcada com ~).",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome e definir se ele é um servo de rotação posicional ou contínua.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoServo",
        "starterThumbnail": "starters/basic/starterArduinoServo.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Servo A-Go-Go!",
            "url": "https://www.instructables.com/Servo-A-Go-Go/"
          },
          {
            "label": "Folha de dados, Micro servo",
            "url": "https://media.digikey.com/pdf/Data%20Sheets/DFRobot%20PDFs/SER0006_Web.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "33961": {
    "id": "33961",
    "name": "Sensor de luz ambiente [fototransistor]",
    "shortDescription": "Utiliza a luz ambiente para controlar a base de um transistor NPN interno.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "O sensor de luz ambiente, ou fototransistor, detecta alterações na intensidade da luz. O fluxo de corrente elétrica entre o emissor e o coletor varia com base na quantidade de luz recebida.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo é um transistor NPN cuja conexão base é substituída por uma fonte óptica. A corrente base dos fótons é amplificada pelo ganho do transistor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. O Coletor (Collector) é conectado à alimentação e o Emissor (Emitter) conecta-se a um medidor de tensão ou a uma entrada analógica em um microcontrolador, e também ao aterramento por meio de um grande resistor.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação para exibir um controle deslizante que representa o nível de luz. Deslize o alvo para alterar o nível de luz simulado.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicPhototransistor",
        "starterThumbnail": "starters/basic/starterBasicPhototransistor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Conceitos básicos de fotodiodos, fototransistores e como aplicá-los",
            "url": "https://www.digikey.com/en/articles/the-basics-of-photodiodes-and-phototransistors-and-how-to-apply-them"
          },
          {
            "label": "Folha de dados, sensor de luz ambiente",
            "url": "https://media.digikey.com/pdf/Data%20Sheets/Everlight%20PDFs/ALS-PT243-3C,L177.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "34360": {
    "id": "34360",
    "name": "Botão",
    "shortDescription": "Chave que fecha um circuito enquanto está na posição pressionada.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um interruptor momentâneo.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Um botão contém contatos de metal que são comprimidos quando o botão é pressionado, permitindo que a corrente elétrica flua. Este botão tem quatro fios condutores, com dois conjuntos sempre conectados internamente, e os dois conjuntos se tocam quando o botão é pressionado.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Ligue um lado do interruptor à alimentação e o outro a um pino de entrada do microcontrolador, e também ao aterramento por meio de um grande resistor. O resistor mantém o pino BAIXO (LOW), a menos que o botão seja pressionado e, nesse ponto, o pino pode detectar um sinal ALTO (HIGH) ao conectar-se a 5V.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Clique no dispositivo durante a simulação para simular a pressão no interruptor. Pressione Shift e clique no dispositivo para simular, mantendo o interruptor pressionado.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoButton",
        "starterThumbnail": "starters/basic/starterArduinoButton.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Entrada digital com um botão com o Arduino no Tinkercad",
            "url": "https://www.instructables.com/Digital-Input-With-a-Pushbutton-With-Arduino-in-Ti/"
          },
          {
            "label": "Folha de dados, botão típico",
            "url": "https://www.arduino.cc/documents/datasheets/Button.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "34649": {
    "id": "34649",
    "name": "Módulo Wifi (ESP8266)",
    "shortDescription": "Permite conectar um microcontrolador a uma rede WiFi.",
    "sections": []
  },
  "35130": {
    "id": "35130",
    "name": "Interruptor DIP DPST",
    "shortDescription": "Interruptor DIP único.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um interruptor de alternância com duas posições.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Uma chave DIP tem contatos de metal que se tocam quando o controle deslizante é movido, permitindo que a corrente elétrica flua. Este interruptor DIP funciona como dois interruptores de alternância separados com a mesma alavanca.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem quatro fios condutores. 1A e 1B formam o primeiro interruptor de alternância; 2A e 2B formam o segundo. Esses interruptores devem ser conectados em série com o dispositivo a ser controlado.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Clique no dispositivo durante a simulação para alterar a posição da chave.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicDIPDPST",
        "starterThumbnail": "starters/basic/starterBasicDIPDPST.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia completo de interruptores DIP",
            "url": "https://uk.rs-online.com/web/content/discovery/ideas-and-advice/dip-switches-guide"
          },
          {
            "label": "Folha de dados, interruptor DIP",
            "url": "https://www.grayhill.com/documents/78-Datasheet"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "35401": {
    "id": "35401",
    "name": "Interruptor DIP DPST x 4",
    "shortDescription": "Contém 4 interruptores individuais.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Esse dispositivo é composto de quatro interruptores de alternância com duas posições cada.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O interruptor DIP tem contatos de metal que se tocam quando o controle deslizante é movido, permitindo que a corrente elétrica flua. Este interruptor DIP funciona como quatro interruptores de alternância separados.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem oito fios condutores. 1A e 1B formam o primeiro interruptor de alternância; 2A e 2B formam o segundo e assim sucessivamente. Esses interruptores devem ser conectados em série com o dispositivo a ser controlado.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Clique no dispositivo durante a simulação para alterar as posições do interruptor.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterDIPSPSTx4",
        "starterThumbnail": "starters/basic/starterDIPSPSTx4.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia completo de interruptores DIP",
            "url": "https://uk.rs-online.com/web/content/discovery/ideas-and-advice/dip-switches-guide"
          },
          {
            "label": "Folha de dados, interruptor DIP",
            "url": "https://www.grayhill.com/documents/78-Datasheet"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "35402": {
    "id": "35402",
    "name": "Interruptor DIP DPST x 6",
    "shortDescription": "Contém 6 interruptores individuais.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Esse dispositivo é composto por seis interruptores de alternância com duas posições cada.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O interruptor DIP contém contatos de metal que se tocam quando o controle deslizante é movido, permitindo que a corrente elétrica flua. Este interruptor DIP funciona como seis interruptores de alternância separados.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem doze fios condutores. 1A e 1B formam o primeiro interruptor de alternância; 2A e 2B formam o segundo e assim sucessivamente. Esses interruptores devem ser conectados em série com o dispositivo a ser controlado.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Clique no dispositivo durante a simulação para alterar as posições do interruptor.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterDIPSPSTx6",
        "starterThumbnail": "starters/basic/starterDIPSPSTx6.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia completo de interruptores DIP",
            "url": "https://uk.rs-online.com/web/content/discovery/ideas-and-advice/dip-switches-guide"
          },
          {
            "label": "Folha de dados, interruptor DIP",
            "url": "https://www.grayhill.com/documents/78-Datasheet"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "35991": {
    "id": "35991",
    "name": "Motor CC com codificador",
    "shortDescription": "Motor de engrenagem planetária Actobotics de 6 a 12V com codificador para trabalhos pesados.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "O motor CC converte corrente elétrica em movimento rotacional. Um codificador fornece informações sobre a velocidade e a posição do motor.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O codificador envia um par de sinais de retorno que medem com precisão o movimento do motor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem seis fios condutores. Os fios de Alimentação (Power) e Terra (Ground) do codificador são conectados às entradas 5V e GND no Arduino, respectivamente; o Positivo do motor (Motor Positive) e o Negativo do motor (Motor Negative) são conectados a uma fonte de alimentação separada para acionar o motor; Canal A (Channel A) e Canal B (Channel B) são conectados a entradas digitais no seu Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e rotações por minuto.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterThumbnail": null,
        "defaultOpen": true
      }
    ]
  },
  "36242": {
    "id": "36242",
    "name": "Motor CC com codificador",
    "shortDescription": "Motor de engrenagem planetária Actobotics de 3 a 12V com codificador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "O motor CC converte corrente elétrica em movimento rotacional. Um codificador fornece informações sobre a velocidade e a posição do motor.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O codificador envia um par de sinais de retorno que medem com precisão o movimento do motor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem seis fios condutores. Os fios de Alimentação (Power) e Terra (Ground) do codificador são conectados às entradas 5V e GND no Arduino, respectivamente; o Positivo do motor (Motor Positive) e o Negativo do motor (Motor Negative) são conectados a uma fonte de alimentação separada para acionar o motor; Canal A (Channel A) e Canal B (Channel B) são conectados a entradas digitais no seu Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome e rotações por minuto.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoMotorEncoderSmaller",
        "starterThumbnail": "starters/basic/starterArduinoMotorEncoderSmaller.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "O que é um codificador?",
            "url": "https://www.encoder.com/article-what-is-an-encoder"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "36567": {
    "id": "36567",
    "name": "Controlador de motor simples Pololu",
    "shortDescription": "Usado no controle bidirecional de um único motor CC.",
    "sections": []
  },
  "39041": {
    "id": "39041",
    "name": "Bateria 3V do tipo moeda",
    "shortDescription": "Bateria de tamanho pequeno, ótima para aplicações que empregam menor potência, como o acendimento de LEDS.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é uma bateria elétrica em formato de moeda com tensão nominal de 3 volts.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "As pilhas armazenam energia potencial e podem converter essa energia química em eletricidade quando conectadas a um circuito. Cada pilha tem potencial de tensão em seus dois eletrodos, o que faz com que os elétrons percorram o circuito para chegar ao outro lado.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o fio Positivo (Positive) ao terminal positivo no dispositivo que você deseja alimentar e o Negativo (Negative) ao terminal negativo ou de aterramento no dispositivo.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicLEDLightUp",
        "starterThumbnail": "starters/basic/starterBasicLEDLightUp.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Baterias de lítio e células em formato de moeda",
            "url": "https://learn.adafruit.com/all-about-batteries/lithium-batteries-and-coin-cells"
          },
          {
            "label": "Circuit Playground: B significa Bateria",
            "url": "https://www.youtube.com/watch?v=mzSnz6ZDkFE"
          },
          {
            "label": "Aula sobre impressão 3D com circuitos no Instructables",
            "url": "https://www.instructables.com/3D-Printing-With-Circuits-Class/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "45398": {
    "id": "45398",
    "name": "Sensor de infravermelho",
    "shortDescription": "Detecta sinais de infravermelho emitidos por dispositivos como controles remotos.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo detecta padrões de luz infravermelha criados por um controle remoto ou por uma comunicação sem fio.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Usado com infravermelho remoto, um sensor de infravermelho detecta padrões de luz para comunicação sem fio.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores e é frequentemente conectado à entrada digital de um microcontrolador. Ligue o dispositivo conectando o pino de Alimentação (Power) à entrada 5V e GND ao aterramento. O pino de Saída (Out) é conectado a uma entrada digital em um Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome. Ele receberá o sinal de qualquer infravermelho remoto no seu circuito.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoInfraredReceiver",
        "starterThumbnail": "starters/basic/starterArduinoInfraredReceiver.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Sensor de infravermelho e tutorial remoto",
            "url": "https://learn.adafruit.com/ir-sensor?view=all"
          },
          {
            "label": "Folha de dados, sensor de infravermelho",
            "url": "https://www.vishay.com/docs/82737/tssp40xxss1xb.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "46828": {
    "id": "46828",
    "name": "NeoPixel Ring 12",
    "shortDescription": "Anel de 12 NeoPixels que podem ser controlados individualmente com o uso de um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "46936": {
    "id": "46936",
    "name": "Cronômetro duplo",
    "shortDescription": "Combina dois cronômetros 555 em um só pacote.",
    "sections": []
  },
  "47214": {
    "id": "47214",
    "name": "Teclado 4x4",
    "shortDescription": "Teclado de 16 botões, com dígitos de 0 a 9, letras de A a D e os símbolos * e #.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é composto por 16 interruptores momentâneos organizados em padrão de grade.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os padrões de material condutor são impressos em camadas de plástico, e uma pequena membrana boleada pode ser comprimida ou pressionada para permitir o contato entre as duas superfícies.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem oito fios condutores que correspondem às linhas e colunas de interruptores internos. Conecte cada pino ao seu próprio pino digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Clique nos botões do dispositivo durante a simulação para pressionar os interruptores.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduino4x4Keypad",
        "starterThumbnail": "starters/basic/starterArduino4x4Keypad.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Exemplo da biblioteca de teclados numéricos do Arduino",
            "url": "https://playground.arduino.cc/Code/Keypad/"
          },
          {
            "label": "Guia do teclado matricial",
            "url": "https://learn.adafruit.com/matrix-keypad?view=all"
          },
          {
            "label": "Folha de dados, teclado de membrana 4 x 4",
            "url": "https://cdn.sparkfun.com/assets/f/f/a/5/0/DS-16038.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "48698": {
    "id": "48698",
    "name": "Gerador de função",
    "shortDescription": "Equipamento de teste eletrônico que gera diversas formas de onda de voltagem.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um equipamento eletrônico de teste que gera várias formas de onda de tensão.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O gerador de função utiliza um gerador de sinal e circuitos de oscilador eletrônico para gerar sinais.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o fio Positivo (Positive) ao terminal positivo no dispositivo ao qual você deseja enviar o sinal e conecte o fio Negativo (Negative) ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome, frequência, amplitude, deslocamento CC e forma de onda de função.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterFunctionGenerator",
        "starterThumbnail": "starters/basic/starterFunctionGenerator.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Geradores de função explicados",
            "url": "https://www.electronics-notes.com/articles/test-methods/signal-generators/function-generator.php"
          },
          {
            "label": "Circuit Playground: F significa Frequência",
            "url": "https://www.youtube.com/watch?v=20pMUCnX4hA&list=PLjF7R1fz_OOXWHQhEVEI5Jqf18TQRr5Hu&index=14"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "48952": {
    "id": "48952",
    "name": "Regulador 5V [LM7805]",
    "shortDescription": "Usado para fornecer voltagem de saída fixa de 5V.",
    "sections": []
  },
  "48953": {
    "id": "48953",
    "name": "Regulador 3,3V [LD1117V33]",
    "shortDescription": "Usado para fornecer voltagem de saída fixa de 3,3V.",
    "sections": []
  },
  "49811": {
    "id": "49811",
    "name": "NeoPixel Ring 24",
    "shortDescription": "Anel de 24 NeoPixels que podem ser controlados individualmente com o uso de um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "49813": {
    "id": "49813",
    "name": "NeoPixel Ring 16",
    "shortDescription": "Anel de 16 NeoPixels que podem ser controlados individualmente com o uso de um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "49819": {
    "id": "49819",
    "name": "NeoPixel Jewel",
    "shortDescription": "Conjunto de 7 NeoPixels que podem ser controlados individualmente com o uso de um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterThumbnail": null,
        "defaultOpen": true
      }
    ]
  },
  "49820": {
    "id": "49820",
    "name": "NeoPixel",
    "shortDescription": "LED RGB único, que pode ser controlado com o uso de um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "50340": {
    "id": "50340",
    "name": "Sensor de distância ultrassônico",
    "shortDescription": "Sensor que utiliza ondas de som para determinar a que distância está um objeto.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este sensor usa ondas sonoras para determinar a que distância está um objeto.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo emite som muito agudo. Tão agudo que você não pode ouvir. O som leva algum tempo para se deslocar no ar. Este dispositivo inteligente detecta o primeiro eco produzido por um objeto próximo e calcula a distância até esse objeto medindo o tempo decorrido até que o som se reflita no alvo e volte a ele.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Há três pinos na parte inferior deste dispositivo. Para ligá-lo, conecte o pino de Força (Power) ao terminal Arduino 5V e o Terra (Ground) a qualquer terminal GND em um Arduino. O pino de Sinal (Signal) é conectado a qualquer terminal digital ou analógico no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação para exibir uma região com um círculo interno. A região representa o espaço no qual o sensor pode detectar um objeto grande. O círculo é o objeto alvo. Selecione o alvo para movê-lo na região e altere a distância entre ele e o sensor.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o interior do seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterThumbnail": null,
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Sensor de distância ultrassônico no Arduino com o Tinkercad",
            "url": "https://www.instructables.com/Ultrasonic-Distance-Sensor-Arduino-Tinkercad/"
          },
          {
            "label": "Localizador de faixa ultrassônica de ping",
            "url": "https://docs.arduino.cc/built-in-examples/sensors/Ping"
          },
          {
            "label": "PING))) Sensor de distância ultrassônico - downloads",
            "url": "https://www.parallax.com/package/ping-ultrasonic-distance-sensor-downloads/"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "50341": {
    "id": "50341",
    "name": "Sensor de distância ultrassônico (quatro pinos)",
    "shortDescription": "Sensor que utiliza ondas de som para determinar a que distância está um objeto.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este sensor usa ondas sonoras para determinar a que distância está um objeto.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo emite som muito agudo. Tão agudo que você não pode ouvir. O som leva algum tempo para se deslocar no ar. Este dispositivo inteligente detecta o primeiro eco produzido por um objeto próximo e calcula a distância até esse objeto medindo o tempo decorrido até que o som se reflita no alvo e volte a ele.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Há quatro pinos na base deste dispositivo. Ligue-o conectando o pino de Alimentação (Power) ao terminal Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. Os pinos Acionador (Trigger) e Eco (Echo) são conectados a qualquer terminal digital ou analógico do Arduino. O código informa ao sensor que deve emitir seu som usando o pino de acionamento e aguarda a detecção de eco do pino de eco. Ele converte o tempo gasto em um número que representa a distância em polegadas ou centímetros.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação para exibir uma região com um círculo interno. A região representa o espaço no qual o sensor pode detectar um objeto grande. O círculo é o objeto alvo. Selecione o alvo para movê-lo na região e altere a distância entre ele e o sensor.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o interior do seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterThumbnail": null,
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Sensor de distância ultrassônico no Arduino com o Tinkercad",
            "url": "https://www.instructables.com/Ultrasonic-Distance-Sensor-Arduino-Tinkercad/"
          },
          {
            "label": "Folha de dados, HC-SR04",
            "url": "https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "52579": {
    "id": "52579",
    "name": "Sensor PIR",
    "shortDescription": "Sensor infravermelho passivo usado para detectar movimento em frente ao mesmo.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo detecta alterações nos níveis de luz infravermelha sobre uma área ampla, como movimento em um ambiente.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os sensores de infravermelho passivo (PIR, Passive Infrared) detectam energia térmica comparando os sinais de um par de elementos piroelétricos. O circuito de suporte, então, envia um sinal de ALTO (HIGH) ao seu fio de sinal.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Há três pinos na parte inferior do dispositivo. Ligue-o conectando o pino de Alimentação (Power) ao ponto 5V e o Terra (Ground) ao aterramento. O pino de Sinal (Signal) é conectado diretamente a um dispositivo ou a qualquer terminal digital ou analógico de um Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação para mostrar uma região com um círculo. Essa região representa o espaço no qual o sensor pode detectar movimento. O círculo é o objeto alvo. Selecione o alvo para movê-lo pela região e ative o sensor.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicPIRSensor",
        "starterThumbnail": "starters/basic/starterBasicPIRSensor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Sensor de movimento PIR com Arduino no Tinkercad",
            "url": "https://www.instructables.com/PIR-Motion-Sensor-With-Arduino-in-Tinkercad/"
          },
          {
            "label": "Tutorial sobre sensor de movimento PIR",
            "url": "https://learn.adafruit.com/pir-passive-infrared-proximity-motion-sensor"
          },
          {
            "label": "Folha de dados, sensor de movimento PIR",
            "url": "https://www.parallax.com/package/pir-sensor-rev-b-product-guide/?ind=1600785426529&filename=555-28027-PIR-Sensor-Prodcut-Doc-v2.2.pdf&wpdmdl=3630&refresh=610b2862bdde31628121186"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "53905": {
    "id": "53905",
    "name": "Sensor de gás",
    "shortDescription": "Sensor de gás Winsen utilizado para detectar fugas de gás, como monóxido de carbono, álcool ou metano.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este sensor detecta partículas de uma substância específica no ar.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Esse aparelho detecta a presença de um gás no ambiente medindo as propriedades elétricas do ar.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem seis fios condutores. Ligue o aquecedor conectando +5V a H1 ou H2 e o aterramento ao outro. A resistência entre A e B muda com a quantidade de gás detectada. Conecte um lado do circuito de detecção a A1 ou A2 e o outro a B1 ou B2.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação para mostrar uma nuvem que representa a concentração de gás. Deslize o alvo para alterar o nível de gás simulado.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBasicGasSensor",
        "starterThumbnail": "starters/basic/starterBasicGasSensor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Exemplo de sensor de qualidade do ar MQ135",
            "url": "http://wiring.org.co/learning/basics/airqualitymq135.html"
          },
          {
            "label": "Folha de dados, sensor de gás MQ-6",
            "url": "https://cdn.sparkfun.com/datasheets/Sensors/Biometric/MQ-6%20Ver1.3%20-%20Manual.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "54641": {
    "id": "54641",
    "name": "Disparadores",
    "shortDescription": "categoria",
    "sections": []
  },
  "54642": {
    "id": "54642",
    "name": "Outros componentes",
    "shortDescription": "categoria",
    "sections": []
  },
  "54646": {
    "id": "54646",
    "name": "Bateria 1,5V",
    "shortDescription": "Pilhas padrão AA ou AAA; cada uma fornece 1,5V.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um suporte de bateria para pilhas AA ou AAA com definições configuráveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "As pilhas armazenam energia potencial e podem converter essa energia química em eletricidade quando conectadas a um circuito. Cada pilha tem potencial de tensão em seus dois eletrodos, o que faz com que os elétrons percorram o circuito para chegar ao outro lado.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o fio Positivo (Positive) ao terminal positivo no dispositivo que você deseja alimentar e o Negativo (Negative) ao terminal negativo ou de aterramento no dispositivo.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome, contagem de bateria, tipo de bateria e selecionar se deseja ou não incluir um interruptor interno, que pode ser ativado ou desativado com um clique durante a simulação.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterBatteryArray",
        "starterThumbnail": "starters/basic/starterBatteryArray.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Tudo sobre baterias",
            "url": "https://learn.adafruit.com/all-about-batteries"
          },
          {
            "label": "Circuit Playground: B significa Bateria",
            "url": "https://www.youtube.com/watch?v=mzSnz6ZDkFE"
          },
          {
            "label": "Calculadora de vida útil da bateria",
            "url": "https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-battery-life"
          },
          {
            "label": "Página do produto suporte de bateria 4 x AA com capa e interruptor",
            "url": "https://www.sparkfun.com/products/12083"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "56250": {
    "id": "56250",
    "name": "Comparador quad",
    "shortDescription": "O LM339 consiste em quatro comparadores de voltagem, com uma única fonte de energia.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "O comparador quad é usado quando é preciso comparar vários sinais de tensão.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Este dispositivo consiste em quatro comparadores de voltagem, para que possa comparar quatro pares de sinais por vez. Efetivamente, são dois LM393s em um pacote.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem 14 pinos e requer alimentação para seu pino de Alimentação (Power) e aterramento para seu pino Terra (Ground); os pinos restantes são as duas entradas e uma saída para cada um dos quatro comparadores de voltagem internos.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterGasSensor",
        "starterThumbnail": "starters/basic/starterGasSensor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Circuito comparador de voltagem quad LM399",
            "url": "http://www.learningaboutelectronics.com/Articles/LM339-quad-voltage-comparator-circuit.php"
          },
          {
            "label": "Circuitos integrados (ICs)",
            "url": "https://www.instructables.com/Integrated-Circuits-1/"
          },
          {
            "label": "Folha de dados, LM339",
            "url": "https://www.ti.com/lit/ds/symlink/lm339.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "63927": {
    "id": "63927",
    "name": "Comparador duplo",
    "shortDescription": "LM393. Consiste em dois comparadores de voltagem independentes.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "O comparador duplo é usado quando é preciso comparar vários sinais de tensão.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Esse dispositivo consiste em dois comparadores de tensão, para que possa comparar dois pares de sinais por vez.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem oito pinos e requer alimentação para seu pino de Alimentação (Power) e aterramento para seu pino Terra (Ground); os pinos restantes são as duas entradas e uma saída para cada um dos dois comparadores de tensão internos.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterLM393",
        "starterThumbnail": "starters/basic/starterLM393.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Como construir um circuito de comparador de tensão usando um LM393",
            "url": "http://www.learningaboutelectronics.com/Articles/LM393-voltage-comparator-circuit.php"
          },
          {
            "label": "Circuitos integrados (ICs)",
            "url": "https://www.instructables.com/Integrated-Circuits-1/"
          },
          {
            "label": "Folha de dados, LM393",
            "url": "https://www.ti.com/lit/ds/symlink/lm393.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "71005": {
    "id": "71005",
    "name": "Motor de vibração",
    "shortDescription": "Motor que vibra quando acionado.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um tipo de motor CC frequentemente usado para comunicação tátil.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Quando a alimentação é aplicada, esse dispositivo gira um peso descentralizado, causando vibração.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o Positivo (Positive) à alimentação e o Negativo (Negative) ao aterramento para fazer o motor vibrar.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterCircuitAssemblyMove",
        "starterThumbnail": "starters/basic/starterCircuitAssemblyMove.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Motores de vibração",
            "url": "https://www.instructables.com/Vibrating-Motors/"
          },
          {
            "label": "Montagem de circuito de movimento",
            "url": "https://www.instructables.com/The-Move-Circuit-Assembly/"
          },
          {
            "label": "Folha de dados, motor de vibração",
            "url": "https://cdn-shop.adafruit.com/product-files/1201/P1012_datasheet.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "330000": {
    "id": "330000",
    "name": "Motor de engrenagem de uso não profissional",
    "shortDescription": "Motor com engrenagem usado com frequência para acionar rodas de robôs.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Os motores de engrenagem de uso não profissional contêm um motor CC e uma caixa de engrenagens.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Quando o motor é alimentado por corrente CC, é criado um campo magnético que atrai e repele os ímãs no interior, fazendo com que o rotor gire. Uma caixa de engrenagens converte o motor CC de velocidade mais alta e baixo torque em uma saída de menor velocidade e maior torque, adequada a rodas robóticas.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o Positivo (Positive) à alimentação e o Negativo (Negative) ao aterramento para fazer o motor girar.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterCircuitAssemblySpin",
        "starterThumbnail": "starters/basic/starterCircuitAssemblySpin.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Página do produto motor de engrenagem de uso não profissional",
            "url": "https://www.sparkfun.com/products/13302"
          },
          {
            "label": "Folha de dados, motor de engrenagem de uso não profissional",
            "url": "https://cdn.sparkfun.com/datasheets/Robotics/DG01D.jpg"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "wire": {
    "id": "wire",
    "name": "Fio",
    "shortDescription": "",
    "sections": []
  },
  "annotation": {
    "id": "annotation",
    "name": "Nota",
    "shortDescription": "",
    "sections": []
  },
  "neopixel_strip_4": {
    "id": "neopixel_strip_4",
    "name": "Faixa de NeoPixel 4",
    "shortDescription": "Uma faixa flexível de LEDs RGB que pode ser controlada usando-se um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "neopixel_strip_6": {
    "id": "neopixel_strip_6",
    "name": "Faixa de NeoPixel 6",
    "shortDescription": "Uma faixa flexível de LEDs RGB que pode ser controlada usando-se um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "neopixel_strip_8": {
    "id": "neopixel_strip_8",
    "name": "Faixa de NeoPixel 8",
    "shortDescription": "Uma faixa flexível de LEDs RGB que pode ser controlada usando-se um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "neopixel_strip_10": {
    "id": "neopixel_strip_10",
    "name": "Faixa de NeoPixel 10",
    "shortDescription": "Uma faixa flexível de LEDs RGB que pode ser controlada usando-se um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "neopixel_strip_12": {
    "id": "neopixel_strip_12",
    "name": "Faixa de NeoPixel 12",
    "shortDescription": "Uma faixa flexível de LEDs RGB que pode ser controlada usando-se um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "neopixel_strip_16": {
    "id": "neopixel_strip_16",
    "name": "Faixa de NeoPixel 16",
    "shortDescription": "Uma faixa flexível de LEDs RGB que pode ser controlada usando-se um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "neopixel_strip_20": {
    "id": "neopixel_strip_20",
    "name": "Faixa de NeoPixel 20",
    "shortDescription": "Uma faixa flexível de LEDs RGB que pode ser controlada usando-se um microcontrolador.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "NeoPixels são LEDs RGB endereçáveis.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LEDs são feitos de materiais semicondutores que emitem luz quando a corrente flui através deles na direção correta. Uma corrente excessiva pode danificá-los ou mesmo quebrá-los; por isso, adicione um resistor em série para limitar o fluxo de corrente.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três fios condutores. Ligue-o conectando o pino de Alimentação (Power) ao Arduino 5V e o Terra (Ground) a qualquer terminal GND de um Arduino. O pino de Entrada (In) é conectado a qualquer pino de saída digital no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoNeopixel",
        "starterThumbnail": "starters/basic/starterArduinoNeopixel.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Adafruit NeoPixel Überguide",
            "url": "https://learn.adafruit.com/adafruit-neopixel-uberguide"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "ic74hc75": {
    "id": "ic74hc75",
    "name": "Trava de 4 bits",
    "shortDescription": "Trava binária de 4 bits.",
    "sections": []
  },
  "ic74hc283": {
    "id": "ic74hc283",
    "name": "Inclusor de 4 bits",
    "shortDescription": "Inclusor completo binário com transporte.",
    "sections": []
  },
  "starterCircuitAssemblyGlow": {
    "id": "starterCircuitAssemblyGlow",
    "name": "Montagem de circuito de brilho",
    "shortDescription": "Crie um projeto simples com brilho usando um LED e bateria.",
    "sections": []
  },
  "starterCircuitAssemblyMove": {
    "id": "starterCircuitAssemblyMove",
    "name": "Montagem de circuito de movimento",
    "shortDescription": "Construa um projeto que se move com um motor de vibração e um interruptor.",
    "sections": []
  },
  "starterCircuitAssemblySpin": {
    "id": "starterCircuitAssemblySpin",
    "name": "Montagem de circuito de giro",
    "shortDescription": "Crie um projeto giratório com um motor de engrenagem de uso não profissional e uma bateria.",
    "sections": []
  },
  "starterBasicLEDLightUp": {
    "id": "starterBasicLEDLightUp",
    "name": "Iluminação de LED",
    "shortDescription": "Ilumine um LED com apenas uma bateria e um resistor.",
    "sections": []
  },
  "starterBasicLEDDimmer": {
    "id": "starterBasicLEDDimmer",
    "name": "Dimmer para LED",
    "shortDescription": "Esmaeça e intensifique seu LED com uma bateria e um potenciômetro.",
    "sections": []
  },
  "starterBasicLEDSwitch": {
    "id": "starterBasicLEDSwitch",
    "name": "Interruptor para LED",
    "shortDescription": "Ligue e desligue seu LED com um simples interruptor.",
    "sections": []
  },
  "starterBasicMultipleLEDs": {
    "id": "starterBasicMultipleLEDs",
    "name": "LEDs múltiplos",
    "shortDescription": "Ilumine vários LEDs conectando-os em paralelo.",
    "sections": []
  },
  "starterBasicRGBLED": {
    "id": "starterBasicRGBLED",
    "name": "LED RGB",
    "shortDescription": "Misture cores com um LED RGB.",
    "sections": []
  },
  "starterBasicDCMotor": {
    "id": "starterBasicDCMotor",
    "name": "Motor CC",
    "shortDescription": "Controle um motor CC com luz usando uma fotorresistor.",
    "sections": []
  },
  "starterBasicTemperatureSensor": {
    "id": "starterBasicTemperatureSensor",
    "name": "Sensor de temperatura",
    "shortDescription": "Meça a temperatura ambiente usando um sensor de temperatura.",
    "sections": []
  },
  "starterBasicTiltSensor": {
    "id": "starterBasicTiltSensor",
    "name": "Sensor de inclinação",
    "shortDescription": "Acenda um LED quando você detectar uma curva com o sensor de inclinação.",
    "sections": []
  },
  "starterBasicPIRSensor": {
    "id": "starterBasicPIRSensor",
    "name": "Sensor PIR",
    "shortDescription": "Detecte movimentos usando um sensor PIR.",
    "sections": []
  },
  "starterArduinoBreadboard": {
    "id": "starterArduinoBreadboard",
    "name": "Placa de ensaio",
    "shortDescription": "Arduino e uma placa de ensaio.",
    "sections": []
  },
  "starterArduinoBlink": {
    "id": "starterArduinoBlink",
    "name": "Piscar",
    "shortDescription": "Pisque um LED.",
    "sections": []
  },
  "starterArduinoFade": {
    "id": "starterArduinoFade",
    "name": "Esmaecer",
    "shortDescription": "Esmaeça e intensifique um LED.",
    "sections": []
  },
  "starterArduinoButton": {
    "id": "starterArduinoButton",
    "name": "Botão",
    "shortDescription": "Detecte entradas usando um botão.",
    "sections": []
  },
  "starterArduinoDebounce": {
    "id": "starterArduinoDebounce",
    "name": "Devolução",
    "shortDescription": "Use o recurso de debounce em uma entrada, como o pressionar de um botão, para detectar com maior precisão uma alteração de estado.",
    "sections": []
  },
  "starterArduinoStateChangeDetection": {
    "id": "starterArduinoStateChangeDetection",
    "name": "Detecção de mudança de estado",
    "shortDescription": "Detecte quando uma entrada mudar de ALTA para BAIXA ou vice-versa.",
    "sections": []
  },
  "starterArduinoAnalogInput": {
    "id": "starterArduinoAnalogInput",
    "name": "Entrada analógica",
    "shortDescription": "Leia entradas analógicas usando um potenciômetro.",
    "sections": []
  },
  "starterArduinoDigitalReadSerial": {
    "id": "starterArduinoDigitalReadSerial",
    "name": "Leitura digital serial",
    "shortDescription": "Leia entradas digitais de um botão e imprima os resultados no monitor serial.",
    "sections": []
  },
  "starterArduinoAnalogReadSerial": {
    "id": "starterArduinoAnalogReadSerial",
    "name": "Leitura analógica serial",
    "shortDescription": "Leia entradas analógicas usando um potenciômetro e imprima os resultados no monitor serial.",
    "sections": []
  },
  "starterArduinoServo": {
    "id": "starterArduinoServo",
    "name": "Servo",
    "shortDescription": "Controle um servomotor.",
    "sections": []
  },
  "starterArduinoToneKeyboard": {
    "id": "starterArduinoToneKeyboard",
    "name": "Teclado de tom",
    "shortDescription": "Reproduza tons do teclado usando um buzzer e botões.",
    "sections": []
  },
  "starterArduinoToneMelody": {
    "id": "starterArduinoToneMelody",
    "name": "Melodia do tom",
    "shortDescription": "Programe uma melodia usando um buzzer.",
    "sections": []
  },
  "starterArduinoToneMultiple": {
    "id": "starterArduinoToneMultiple",
    "name": "Múltiplos tons",
    "shortDescription": "Reproduza vários tons em vários pinos em sequência.",
    "sections": []
  },
  "starterArduinoTonePitchFollower": {
    "id": "starterArduinoTonePitchFollower",
    "name": "Detector de frequência do tom",
    "shortDescription": "Ajuste a frequência usando a entrada analógica com um fotorresistor.",
    "sections": []
  },
  "starterArduinoUltrasonicRangeFinder": {
    "id": "starterArduinoUltrasonicRangeFinder",
    "name": "Localizador de faixa ultrassônica",
    "shortDescription": "Detecte a que distância um objeto está, usando um localizador de faixa ultrassônica.",
    "sections": []
  },
  "starterArduinoNeopixel": {
    "id": "starterArduinoNeopixel",
    "name": "Neopixel",
    "shortDescription": "Ilumine um Neopixel com as cores do arco-íris.",
    "sections": []
  },
  "starterArduinoLCD": {
    "id": "starterArduinoLCD",
    "name": "LCD de 2 fios",
    "shortDescription": "Controle o texto em uma tela de cristal líquido usando I2C de 2 fios.",
    "sections": []
  },
  "starterArduinoLCDI2C": {
    "id": "starterArduinoLCDI2C",
    "name": "LCD",
    "shortDescription": "Controle o texto em uma tela de cristal líquido.",
    "sections": []
  },
  "starterArduinoAnalogInSerialOut": {
    "id": "starterArduinoAnalogInSerialOut",
    "name": "Entrada analógica, saída serial",
    "shortDescription": "Controle um pino de saída de usando entrada analógica com um potenciômetro.",
    "sections": []
  },
  "starterArduinoCalibration": {
    "id": "starterArduinoCalibration",
    "name": "Calibragem",
    "shortDescription": "Calibre a entrada de um sensor.",
    "sections": []
  },
  "starterArduinoSmoothing": {
    "id": "starterArduinoSmoothing",
    "name": "Suavização",
    "shortDescription": "Extraia a média de entrada analógica ao longo do tempo para criar um sinal mais suave.",
    "sections": []
  },
  "starterArduinoReadAnalogVoltage": {
    "id": "starterArduinoReadAnalogVoltage",
    "name": "Ler voltagem analógica",
    "shortDescription": "Converta entrada analógica em voltagem e imprima o resultado no monitor serial.",
    "sections": []
  },
  "starterArduinoBlinkWithoutDelay": {
    "id": "starterArduinoBlinkWithoutDelay",
    "name": "Piscar sem atraso",
    "shortDescription": "Ative e desative um LED sem usar a função de atraso().",
    "sections": []
  },
  "starterArduinoInternalSerialPullup": {
    "id": "starterArduinoInternalSerialPullup",
    "name": "Entrada pull-up serial",
    "shortDescription": "Use um resistor interno em um pino de entrada e imprima os resultados no monitor serial.",
    "sections": []
  },
  "solarCellid": {
    "id": "solarCellid",
    "name": "Célula solar",
    "shortDescription": "Dispositivo que converte luz em energia elétrica.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Esta fonte de energia gera eletricidade CC a partir da luz solar.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Esse dispositivo é feito com base em uma matriz de células fotovoltaicas, que geram corrente elétrica quando expostas à luz. As células fotovoltaicas são formadas por dois tipos de semicondutores de silício empilhados em camadas planas largas, posicionadas entre um condutor sólido na parte traseira e conectores finos isolados magneticamente na parte dianteira (para que a luz possa ter contato direto com o silício).",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o fio Positivo (Positive) ao terminal positivo no dispositivo que você deseja alimentar e o Negativo (Negative) ao terminal negativo ou de aterramento no dispositivo.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome, tensão de pico e corrente de pico.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterSolarCell",
        "starterThumbnail": "starters/basic/starterSolarCell.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Aula sobre energia solar no Instructables",
            "url": "https://www.instructables.com/Solar-Class/"
          },
          {
            "label": "Collin’s Lab: Solar",
            "url": "https://learn.adafruit.com/collins-lab-solar"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "batteryLemonid": {
    "id": "batteryLemonid",
    "name": "Bateria de limão",
    "shortDescription": "Uma bateria química feita de um limão e de um metal de cobre e zinco.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é uma bateria química feita com um limão e metal (cobre e zinco).",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O limão atua como eletrólito entre o prego revestido com zinco e a moeda de cobre, resultando no fluxo de elétrons pelo circuito.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o fio Positivo (Positive) ao terminal positivo no dispositivo que você deseja alimentar e o fio Negativo (Negative) ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome, tensão e resistência.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterLemonBattery",
        "starterThumbnail": "starters/basic/starterLemonBattery.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Bateria de batata (funciona tal como a de limão)",
            "url": "https://www.allaboutcircuits.com/textbook/experiments/chpt-3/potato-battery/"
          },
          {
            "label": "Circuit Playground: B significa Bateria",
            "url": "https://www.youtube.com/watch?v=mzSnz6ZDkFE"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "batteryPotatoid": {
    "id": "batteryPotatoid",
    "name": "Bateria de batata",
    "shortDescription": "Uma bateria química feita de uma batata e de um metal de cobre e zinco.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é uma bateria química feita com uma batata e metal de cobre e zinco.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "A batata atua como eletrólito entre o prego revestido com zinco e a moeda de cobre, resultando no fluxo de elétrons pelo circuito.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores. Conecte o fio Positivo (Positive) ao terminal positivo no dispositivo que você deseja alimentar e o fio Negativo (Negative) ao aterramento.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome, tensão e resistência.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterPotatoBattery",
        "starterThumbnail": "starters/basic/starterPotatoBattery.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Bateria de batata",
            "url": "https://www.allaboutcircuits.com/textbook/experiments/chpt-3/potato-battery/"
          },
          {
            "label": "Circuit Playground: B significa Bateria",
            "url": "https://www.youtube.com/watch?v=mzSnz6ZDkFE"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "microbitid": {
    "id": "microbitid",
    "name": "micro:bit",
    "shortDescription": "Placa programável que pode ser usada para gerar circuitos interativos.",
    "sections": []
  },
  "microbitBreakoutid": {
    "id": "microbitBreakoutid",
    "name": "micro:bit com corte parcial",
    "shortDescription": "Uma placa programável que pode ser utilizada para criar circuitos interativos, com uma placa de corte parcial para facilitar a conexão com uma placa de distribuição.",
    "sections": []
  },
  "sensorFlexid": {
    "id": "sensorFlexid",
    "name": "Sensor flexível",
    "shortDescription": "Um sensor cuja resistência muda à medida que se dobra.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um resistor variável que reage à dobra.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O material semicondutor existente neste sensor flexível torna-se mais condutor quando comprimido juntamente com a flexão do sensor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores e, frequentemente, é conectado à entrada analógica de um microcontrolador. Os sensores flexíveis não são polarizados, o que significa que podem ser conectados de qualquer forma.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação e arraste-o para cima e para baixo para alterar seu ângulo de flexão.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoFlexSensor",
        "starterThumbnail": "starters/basic/starterArduinoFlexSensor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia de desligamento do sensor flexível",
            "url": "https://learn.sparkfun.com/tutorials/flex-sensor-hookup-guide/all"
          },
          {
            "label": "Folha de dados, sensor flexível",
            "url": "https://cdn.sparkfun.com/assets/9/5/b/f/7/FLEX_SENSOR_-_SPECIAL_EDITION_DATA_SHEET_v2019__Rev_A_.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "displayLCD16x2I2C": {
    "id": "displayLCD16x2I2C",
    "name": "LCD 16 x 2 (I2C)",
    "shortDescription": "Tela de cristal líquido que exibe duas linhas de 16 caracteres.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um Visualizador de cristal líquido capaz de exibir duas linhas de texto com 16 caracteres cada. Esta versão também tem uma placa de driver que usa menos saídas no seu microcontrolador conectado.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Os LCDs contêm muitas camadas de materiais. Há uma luz de fundo LED e um \"sanduíche\" de vidro polarizado em torno de cristais líquidos, que pode girar eletronicamente a luz polarizada para permitir que a luz de fundo passe e seja vista, ou seja bloqueada pelo polarizador na parte superior.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem quatro fios condutores. Conecte o pino VCC ao pino 5V do Arduino e GND a qualquer terminal GND de um Arduino. Os pinos SDA e SCL são conectados aos seus respectivos pinos I2C no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seu nome.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoLCDI2C",
        "starterThumbnail": "starters/basic/starterArduinoLCDI2C.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia de pacotes I2C/SPI LCD",
            "url": "https://learn.adafruit.com/i2c-spi-lcd-backpack?view=all"
          },
          {
            "label": "Placa de fundo de LCD I2C/SPI do Adafruit PCB no github",
            "url": "http://Adafruit-I2C-SPI-LCD-Backpack-PCB"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "display7SegmentI2C": {
    "id": "display7SegmentI2C",
    "name": "Tela de relógio com 7 segmentos",
    "shortDescription": "Uma tela de LED de 4 dígitos com 7 segmentos controlada por I2C.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é composto por quatro telas de sete segmentos e uma placa de driver. Cada tela de sete segmentos contém oito LEDs e um gabinete de plástico para formar os segmentos de dígitos numéricos.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Dependendo da configuração de quais LEDs se acendem por vez, são lidos diferentes números no visor.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem quatro fios condutores. Conecte o pino VCC ao pino 5V do Arduino e GND a qualquer terminal GND de um Arduino. Os pinos SDA e SCL são conectados aos seus respectivos pinos I2C no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo para editar seus dados de nome, cor e endereço I2C.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoVoltageMeter",
        "starterThumbnail": "starters/basic/starterArduinoVoltageMeter.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia de pacotes de LED com sete segmentos",
            "url": "https://learn.adafruit.com/adafruit-led-backpack?view=all#0-dot-56-seven-segment-backpack"
          },
          {
            "label": "Placas de circuito impresso para pacotes LED Matrix Adafruit",
            "url": "https://github.com/adafruit/Adafruit-LED-Backpacks#readme"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "starterMicrobitAlarm": {
    "id": "starterMicrobitAlarm",
    "name": "Alarme",
    "shortDescription": "micro:bit, sensor PIR e alarme piezoelétrico.",
    "sections": []
  },
  "starterMicrobitAnalog": {
    "id": "starterMicrobitAnalog",
    "name": "Analógico",
    "shortDescription": "exemplo de entrada/saída analógica de micro:bits.",
    "sections": []
  },
  "starterMicrobitBreadboard": {
    "id": "starterMicrobitBreadboard",
    "name": "Placa de ensaio",
    "shortDescription": "micro:bit e quadro de distribuição.",
    "sections": []
  },
  "starterMicrobitBreakout": {
    "id": "starterMicrobitBreakout",
    "name": "intervalo de micro:bit",
    "shortDescription": "micro:bit e quadro de distribuição.",
    "sections": []
  },
  "starterMicrobitCompass": {
    "id": "starterMicrobitCompass",
    "name": "Bússola",
    "shortDescription": "exemplo de sensor magnético de micro:bits.",
    "sections": []
  },
  "starterMicrobitGestures": {
    "id": "starterMicrobitGestures",
    "name": "Gestos",
    "shortDescription": "exemplo de acelerômetro de micro:bit, botão e toque.",
    "sections": []
  },
  "starterMicrobitLight": {
    "id": "starterMicrobitLight",
    "name": "Luz",
    "shortDescription": "exemplo de sensor de luz micro:bit.",
    "sections": []
  },
  "starterMicrobitRadio": {
    "id": "starterMicrobitRadio",
    "name": "Rádio",
    "shortDescription": "rádio bluetooth de micro:bit.",
    "sections": []
  },
  "starterMicrobitServo": {
    "id": "starterMicrobitServo",
    "name": "Servo",
    "shortDescription": "termômetro micro:bit usando servomotor.",
    "sections": []
  },
  "sensorSoilMoistureid": {
    "id": "sensorSoilMoistureid",
    "name": "Sensor de umidade do solo",
    "shortDescription": "Sensor cuja voltagem do sinal muda conforme ele se molha.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo detecta a quantidade de umidade presente no solo.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "Esse sensor de umidade do solo mede a resistência entre as duas sondas fixadas no solo, que diminuirá em presença de mais umidade.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem três plataformas de conexão identificadas como VCC, GND e SIG. Ligue-o conectando o pino VCC ao terminal 5V do Arduino (ou qualquer terminal analógico ou digital definido como HIGH) e o Terra (GND) a qualquer terminal GND em um Arduino. O pino de Sinal (Signal) é conectado a qualquer entrada analógica no Arduino.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Clique no dispositivo durante a simulação para realçá-lo e, em seguida, clique e arraste o limpador para alterar a resistência simulada.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoMoisture",
        "starterThumbnail": "starters/basic/starterArduinoMoisture.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia de desligamento do sensor de umidade do solo",
            "url": "https://learn.sparkfun.com/tutorials/soil-moisture-sensor-hookup-guide"
          },
          {
            "label": "Ler um Potenciômetro com a entrada analógica do Arduino",
            "url": "https://www.instructables.com/Arduino-Potentiometer-Analog-Input-Tinkercad/"
          },
          {
            "label": "Informações sobre o produto do sensor de umidade do solo SparkFun",
            "url": "https://www.sparkfun.com/products/13322"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "sensorForceid": {
    "id": "sensorForceid",
    "name": "Sensor de força",
    "shortDescription": "Sensor cuja resistência muda com base na quantidade de força aplicada.",
    "sections": [
      {
        "id": "description",
        "title": "Descrição",
        "text": "Este dispositivo é um resistor variável que reage quando pressionado.",
        "image": null,
        "defaultOpen": true
      },
      {
        "id": "how-it-works",
        "title": "Como funciona",
        "text": "O material semicondutor existente neste sensor flexível torna-se mais condutor quando também é comprimido.",
        "defaultOpen": false
      },
      {
        "id": "connect-it",
        "title": "Conectar",
        "text": "Este dispositivo tem dois fios condutores e, frequentemente, é conectado à entrada analógica de um microcontrolador. Os sensores de força não são polarizados, o que significa que podem ser conectados de qualquer forma.",
        "defaultOpen": false
      },
      {
        "id": "how-to-use",
        "title": "Como é utilizado",
        "text": "Selecione o dispositivo durante a simulação e para exibir um controle deslizante que representa a força de pressão. Arraste o controle deslizante para cima e para baixo para alterar a quantidade de força.",
        "defaultOpen": false
      },
      {
        "id": "get-started",
        "title": "Introdução",
        "text": "Arraste o circuito inicial abaixo para o seu projeto, para obter um exemplo funcional de como usar esta peça.",
        "starterId": "starterArduinoForceSensor",
        "starterThumbnail": "starters/basic/starterArduinoForceSensor.png",
        "defaultOpen": true
      },
      {
        "id": "more-info",
        "title": "Mais informações",
        "text": "Consulte materiais e tutoriais complementares:",
        "links": [
          {
            "label": "Guia de desligamento do resistor sensível à força",
            "url": "https://learn.sparkfun.com/tutorials/force-sensitive-resistor-hookup-guide"
          },
          {
            "label": "Folha de dados, FSR 402",
            "url": "https://cdn.sparkfun.com/assets/8/a/1/2/0/2010-10-26-DataSheet-FSR402-Layout2.pdf"
          }
        ],
        "defaultOpen": false
      }
    ]
  },
  "icPCF8574": {
    "id": "icPCF8574",
    "name": "Expansor I2C de 8 portas",
    "shortDescription": "Permite adicionar entradas ou saídas a um microcontrolador.",
    "sections": []
  },
  "starterArduinoMoisture": {
    "id": "starterArduinoMoisture",
    "name": "Umidade",
    "shortDescription": "Exemplo de sensor de umidade do solo do Arduino.",
    "sections": []
  },
  "starterArduinoVoltageMeter": {
    "id": "starterArduinoVoltageMeter",
    "name": "Medidor de tensão",
    "shortDescription": "Meça uma tensão e exiba-a em uma tela de LED.",
    "sections": []
  },
  "starterMicrobitMoisture": {
    "id": "starterMicrobitMoisture",
    "name": "Umidade",
    "shortDescription": "exemplo de sensor de umidade do solo micro:bit.",
    "sections": []
  }
}

export const COMPONENT_NAME_TO_ID: Record<string, string> = {
  "geral": "1",
  "entrada": "2",
  "saída": "3",
  "potência": "4",
  "placas de ensaio": "5",
  "microcontroladores": "6",
  "instrumentos": "7",
  "circuitos integrados": "8",
  "controle de potência": "9",
  "redes": "10",
  "conectores": "11",
  "lógica": "12",
  "montagens de circuito": "13",
  "disparadores básicos": "14",
  "disparadores arduino": "15",
  "disparadores": "54641",
  "outros componentes": "54642",
  "outros disparadores": "18",
  "disparadores de micro:bits": "19",
  "disparadores variados": "20",
  "potenciômetro": "14416",
  "resistor": "16511",
  "capacitor": "17910",
  "capacitor polarizado": "17911",
  "indutor": "17913",
  "diodo": "17914",
  "led": "17916",
  "led rgb": "starterBasicRGBLED",
  "interruptor deslizante": "17919",
  "transistor npn (bjt)": "17920",
  "transistor pnp (bjt)": "17921",
  "transistor nmos (mosfet)": "17924",
  "osciloscópio": "17927",
  "transistor pmos (mosfet)": "18104",
  "acionador de motor de ponte h": "27263",
  "optoacoplador": "27266",
  "placa de ensaio pequena": "27268",
  "fonte de energia": "27571",
  "sensor de temperatura [tmp36]": "27664",
  "lcd 16 x 2": "28098",
  "sensor de inclinação de 4 pinos": "28101",
  "piezo": "28211",
  "motor cc": "starterBasicDCMotor",
  "micro servo": "33955",
  "placa de ensaio": "starterMicrobitBreadboard",
  "diodo zener": "28708",
  "multímetro": "28709",
  "usb padrão a": "28710",
  "cronômetro": "28711",
  "fotorresistor": "28712",
  "amplificador operacional 741": "28713",
  "lâmpada": "28714",
  "registrador de deslocamento de oito bits": "28715",
  "porta quad nand": "28716",
  "porta quad nor": "28717",
  "inversor hexadecimal": "28718",
  "porta quad and": "28719",
  "porta nand de três entradas tripla": "28720",
  "porta and de três entradas tripla": "28721",
  "disparador schmitt inversor": "28722",
  "porta nand de quatro entradas dupla": "28724",
  "porta and de quatro entradas dupla": "28725",
  "porta nor de três entradas tripla": "28726",
  "porta quad or": "28727",
  "flip-flop j-k duplo": "28729",
  "flip-flop d duplo": "28730",
  "porta quad xor": "28731",
  "contador binário de quatro bits": "28732",
  "disparador schmitt quad nand": "28733",
  "fotodiodo": "28734",
  "transistor nmos de pequenos sinais": "28784",
  "transistor pmos para pequenos sinais": "28785",
  "attiny": "28786",
  "bateria 9v": "28787",
  "placa de ensaio mini": "28788",
  "conector de oito pinos": "28789",
  "decodificador de sete segmentos": "29726",
  "relé dpdt": "29956",
  "relé spdt": "29959",
  "contador de décadas johnson": "31599",
  "visor de sete segmentos": "31738",
  "sensor de inclinação": "starterBasicTiltSensor",
  "arduino uno r3": "31896",
  "infravermelho remoto": "33016",
  "tip120": "33187",
  "sensor de luz ambiente [fototransistor]": "33961",
  "botão": "starterArduinoButton",
  "módulo wifi (esp8266)": "34649",
  "interruptor dip dpst": "35130",
  "interruptor dip dpst x 4": "35401",
  "interruptor dip dpst x 6": "35402",
  "motor cc com codificador": "36242",
  "controlador de motor simples pololu": "36567",
  "bateria 3v do tipo moeda": "39041",
  "sensor de infravermelho": "45398",
  "neopixel ring 12": "46828",
  "cronômetro duplo": "46936",
  "teclado 4x4": "47214",
  "gerador de função": "48698",
  "regulador 5v [lm7805]": "48952",
  "regulador 3,3v [ld1117v33]": "48953",
  "neopixel ring 24": "49811",
  "neopixel ring 16": "49813",
  "neopixel jewel": "49819",
  "neopixel": "starterArduinoNeopixel",
  "sensor de distância ultrassônico": "50340",
  "sensor de distância ultrassônico (quatro pinos)": "50341",
  "sensor pir": "starterBasicPIRSensor",
  "sensor de gás": "53905",
  "bateria 1,5v": "54646",
  "comparador quad": "56250",
  "comparador duplo": "63927",
  "motor de vibração": "71005",
  "motor de engrenagem de uso não profissional": "330000",
  "fio": "wire",
  "nota": "annotation",
  "faixa de neopixel 4": "neopixel_strip_4",
  "faixa de neopixel 6": "neopixel_strip_6",
  "faixa de neopixel 8": "neopixel_strip_8",
  "faixa de neopixel 10": "neopixel_strip_10",
  "faixa de neopixel 12": "neopixel_strip_12",
  "faixa de neopixel 16": "neopixel_strip_16",
  "faixa de neopixel 20": "neopixel_strip_20",
  "trava de 4 bits": "ic74hc75",
  "inclusor de 4 bits": "ic74hc283",
  "montagem de circuito de brilho": "starterCircuitAssemblyGlow",
  "montagem de circuito de movimento": "starterCircuitAssemblyMove",
  "montagem de circuito de giro": "starterCircuitAssemblySpin",
  "iluminação de led": "starterBasicLEDLightUp",
  "dimmer para led": "starterBasicLEDDimmer",
  "interruptor para led": "starterBasicLEDSwitch",
  "leds múltiplos": "starterBasicMultipleLEDs",
  "sensor de temperatura": "starterBasicTemperatureSensor",
  "piscar": "starterArduinoBlink",
  "esmaecer": "starterArduinoFade",
  "devolução": "starterArduinoDebounce",
  "detecção de mudança de estado": "starterArduinoStateChangeDetection",
  "entrada analógica": "starterArduinoAnalogInput",
  "leitura digital serial": "starterArduinoDigitalReadSerial",
  "leitura analógica serial": "starterArduinoAnalogReadSerial",
  "servo": "starterMicrobitServo",
  "teclado de tom": "starterArduinoToneKeyboard",
  "melodia do tom": "starterArduinoToneMelody",
  "múltiplos tons": "starterArduinoToneMultiple",
  "detector de frequência do tom": "starterArduinoTonePitchFollower",
  "localizador de faixa ultrassônica": "starterArduinoUltrasonicRangeFinder",
  "lcd de 2 fios": "starterArduinoLCD",
  "lcd": "starterArduinoLCDI2C",
  "entrada analógica, saída serial": "starterArduinoAnalogInSerialOut",
  "calibragem": "starterArduinoCalibration",
  "suavização": "starterArduinoSmoothing",
  "ler voltagem analógica": "starterArduinoReadAnalogVoltage",
  "piscar sem atraso": "starterArduinoBlinkWithoutDelay",
  "entrada pull-up serial": "starterArduinoInternalSerialPullup",
  "célula solar": "solarCellid",
  "bateria de limão": "batteryLemonid",
  "bateria de batata": "batteryPotatoid",
  "micro:bit": "microbitid",
  "micro:bit com corte parcial": "microbitBreakoutid",
  "sensor flexível": "sensorFlexid",
  "lcd 16 x 2 (i2c)": "displayLCD16x2I2C",
  "tela de relógio com 7 segmentos": "display7SegmentI2C",
  "alarme": "starterMicrobitAlarm",
  "analógico": "starterMicrobitAnalog",
  "intervalo de micro:bit": "starterMicrobitBreakout",
  "bússola": "starterMicrobitCompass",
  "gestos": "starterMicrobitGestures",
  "luz": "starterMicrobitLight",
  "rádio": "starterMicrobitRadio",
  "sensor de umidade do solo": "sensorSoilMoistureid",
  "sensor de força": "sensorForceid",
  "expansor i2c de 8 portas": "icPCF8574",
  "umidade": "starterMicrobitMoisture",
  "medidor de tensão": "starterArduinoVoltageMeter"
}

export function getComponentDetail(idOrName: string | number): ComponentDetail | undefined {
  const strId = String(idOrName)
  if (COMPONENT_DETAILS[strId]) return COMPONENT_DETAILS[strId]
  const lowerName = strId.toLowerCase().trim()
  const mappedId = COMPONENT_NAME_TO_ID[lowerName]
  if (mappedId && COMPONENT_DETAILS[mappedId]) return COMPONENT_DETAILS[mappedId]
  return Object.values(COMPONENT_DETAILS).find(d => d.name.toLowerCase() === lowerName)
}

export function getComponentDescription(idOrName: string | number, fallback = ""): string {
  const detail = getComponentDetail(idOrName)
  return detail?.shortDescription || fallback
}
