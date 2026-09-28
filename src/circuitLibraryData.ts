// CircuitLab Studio component catalog registry
export interface CircuitLibraryComponent {
  id: number | string
  deviceId: string
  name: string
  namePt: string
  basic: boolean
  group: 'Básico' | 'Circuitos Integrados' | 'Entrada & Sensores' | 'Saída & Atuadores' | 'Alimentação & Instrumentos' | 'Microcontroladores' | 'Componentes Gerais'
  thumbnail: string
  svgPath: string
  componentPath: string
  simulationModel: string | null
  kind?: string | null
  description?: string | null
  extents?: { top: number; left: number; width: number; height: number } | null
}

export const circuitLibraryCatalog: CircuitLibraryComponent[] = [
  {
    "id": 54646,
    "deviceId": "241925",
    "name": "1.5V Battery",
    "namePt": "Bateria de 1,5 V",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/batteryAA.png",
    "svgPath": "/circuit-library/components/1.5v-battery--241925/svg/breadboard.svg",
    "componentPath": "components/1.5v-battery--241925",
    "simulationModel": "AABattery",
    "kind": "battery_1v5",
    "description": "Standard AA or AAA batteries, with each battery providing 1.5V.",
    "extents": {
      "top": 0,
      "left": -119,
      "width": 238,
      "height": 227.25
    }
  },
  {
    "id": 48953,
    "deviceId": "212156",
    "name": "3.3V Regulator [LD1117V33]",
    "namePt": "3.3V Regulator [LD1117V33]",
    "basic": false,
    "group": "Alimentação & Instrumentos",
    "thumbnail": "/circuit-library/assets/thumbnails/regulator3V.png",
    "svgPath": "/circuit-library/components/3.3v-regulator-ld1117v33--212156/svg/breadboard.svg",
    "componentPath": "components/3.3v-regulator-ld1117v33--212156",
    "simulationModel": "voltageRegulator3p3V",
    "kind": null,
    "description": "Used to provide a fixed 3.3V output voltage.",
    "extents": {
      "top": -44,
      "left": -15,
      "width": 30,
      "height": 44
    }
  },
  {
    "id": "ic74hc283",
    "deviceId": "ic74hc283",
    "name": "4-Bit Adder",
    "namePt": "CI 74HC283 (Somador 4 Bits)",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC283.png",
    "svgPath": "/circuit-library/components/4-bit-adder--ic74hc283/svg/breadboard.svg",
    "componentPath": "components/4-bit-adder--ic74hc283",
    "simulationModel": "74HC283",
    "kind": "adder_74hc283",
    "description": "A binary adder.",
    "extents": {
      "top": -16,
      "left": -41,
      "width": 82,
      "height": 32
    }
  },
  {
    "id": 28732,
    "deviceId": "116728",
    "name": "4-Bit Binary Counter",
    "namePt": "CI 74HC93 (Contador Binário)",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC93.png",
    "svgPath": "/circuit-library/components/4-bit-binary-counter--116728/svg/breadboard.svg",
    "componentPath": "components/4-bit-binary-counter--116728",
    "simulationModel": "74HC93",
    "kind": "counter_74hc93",
    "description": "Used for counting up in binary.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": "ic74hc75",
    "deviceId": "ic74hc75",
    "name": "4-Bit Latch",
    "namePt": "CI 74HC75 (Latch 4 Bits)",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC75.png",
    "svgPath": "/circuit-library/components/4-bit-latch--ic74hc75/svg/breadboard.svg",
    "componentPath": "components/4-bit-latch--ic74hc75",
    "simulationModel": "74HC75",
    "kind": "latch_74hc75",
    "description": "A 4-bit binary latch.",
    "extents": {
      "top": -16,
      "left": -41,
      "width": 82,
      "height": 32
    }
  },
  {
    "id": 48952,
    "deviceId": "212155",
    "name": "5V Regulator [LM7805]",
    "namePt": "5V Regulator [LM7805]",
    "basic": false,
    "group": "Alimentação & Instrumentos",
    "thumbnail": "/circuit-library/assets/thumbnails/regulator5V.png",
    "svgPath": "/circuit-library/components/5v-regulator-lm7805--212155/svg/breadboard.svg",
    "componentPath": "components/5v-regulator-lm7805--212155",
    "simulationModel": "voltageRegulator5V",
    "kind": null,
    "description": "Used to provide a fixed 5V output voltage.",
    "extents": {
      "top": -44,
      "left": -15,
      "width": 30,
      "height": 44
    }
  },
  {
    "id": 31738,
    "deviceId": "129710",
    "name": "7 Segment Display",
    "namePt": "Visor de 7 segmentos",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/display7SegmentCommonAnode.png",
    "svgPath": "/circuit-library/components/7-segment-display--129710/svg/breadboard.svg",
    "componentPath": "components/7-segment-display--129710",
    "simulationModel": "seven_segment_digit_5011bh",
    "kind": "display_7seg",
    "description": "A single 7-segment LED for displaying a number of letter.",
    "extents": {
      "top": -37.5,
      "left": -25,
      "width": 50,
      "height": 75
    }
  },
  {
    "id": "display7SegmentI2C",
    "deviceId": "display7SegmentI2C",
    "name": "7-Segment Clock Display",
    "namePt": "Visor de relógio 7 seg",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/display7SegmentI2C.png",
    "svgPath": "/circuit-library/components/7-segment-clock-display--display7SegmentI2C/svg/breadboard.svg",
    "componentPath": "components/7-segment-clock-display--display7SegmentI2C",
    "simulationModel": "seven-segment-i2c",
    "kind": "display_clock",
    "description": "A 4-digit 7-segment LED display controlled by I2C.",
    "extents": {
      "top": -8,
      "left": -99,
      "width": 198,
      "height": 105
    }
  },
  {
    "id": 29726,
    "deviceId": "121827",
    "name": "7-Segment Decoder",
    "namePt": "CI CD4511 (Decodificador 7 Seg)",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/icCD4511.png",
    "svgPath": "/circuit-library/components/7-segment-decoder--121827/svg/breadboard.svg",
    "componentPath": "components/7-segment-decoder--121827",
    "simulationModel": "CD4511",
    "kind": "cd4511",
    "description": "Drives LED segments to illuminate numbers on a 7-segment display.",
    "extents": {
      "top": -16,
      "left": -41,
      "width": 82,
      "height": 32
    }
  },
  {
    "id": 28713,
    "deviceId": "116692",
    "name": "741 Operational Amplifier",
    "namePt": "Amplificador Operacional 741",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/icOperationalAmplifier741.png",
    "svgPath": "/circuit-library/components/741-operational-amplifier--116692/svg/breadboard.svg",
    "componentPath": "components/741-operational-amplifier--116692",
    "simulationModel": "opAmp_UA741",
    "kind": "opamp_741",
    "description": "Used to amplify or filter analog signals.",
    "extents": {
      "top": -16,
      "left": -21,
      "width": 42,
      "height": 32
    }
  },
  {
    "id": 28789,
    "deviceId": "116859",
    "name": "8 Pin Header",
    "namePt": "8 Pin Header",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/header8pin.png",
    "svgPath": "/circuit-library/components/8-pin-header--116859/svg/breadboard.svg",
    "componentPath": "components/8-pin-header--116859",
    "simulationModel": "null_device",
    "kind": null,
    "description": "A 8-pin header with 0.1\" header spacing.",
    "extents": {
      "top": -40,
      "left": -5,
      "width": 10,
      "height": 80
    }
  },
  {
    "id": 28715,
    "deviceId": "116695",
    "name": "8-Bit Shift Register",
    "namePt": "CI 74HC595 (Shift Register)",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC595.png",
    "svgPath": "/circuit-library/components/8-bit-shift-register--116695/svg/breadboard.svg",
    "componentPath": "components/8-bit-shift-register--116695",
    "simulationModel": "74HC595",
    "kind": "shift_74hc595",
    "description": "Allows you to add additional outputs to a micronctroller.",
    "extents": {
      "top": -16,
      "left": -41,
      "width": 82,
      "height": 32
    }
  },
  {
    "id": "icPCF8574",
    "deviceId": "icPCF8574",
    "name": "8-port I2C expander",
    "namePt": "8-port I2C expander",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/icPCF8574.png",
    "svgPath": "/circuit-library/components/8-port-i2c-expander--icPCF8574/svg/breadboard.svg",
    "componentPath": "components/8-port-i2c-expander--icPCF8574",
    "simulationModel": "pcf8574",
    "kind": null,
    "description": "Allows you to add additional inputs or outputs to a microcontroller.",
    "extents": null
  },
  {
    "id": 28787,
    "deviceId": "116841",
    "name": "9V Battery",
    "namePt": "Bateria de 9 V",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/battery9V.png",
    "svgPath": "/circuit-library/components/9v-battery--116841/svg/breadboard.svg",
    "componentPath": "components/9v-battery--116841",
    "simulationModel": "battery9V",
    "kind": "battery_9v",
    "description": "A common battery great for higher power applications like motors.",
    "extents": {
      "top": -51.822,
      "left": 0,
      "width": 230.639,
      "height": 103.636
    }
  },
  {
    "id": 33961,
    "deviceId": "142078",
    "name": "Ambient Light Sensor [Phototransistor]",
    "namePt": "Ambient Light Sensor [Phototransistor]",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/photoTransistor.png",
    "svgPath": "/circuit-library/components/ambient-light-sensor-phototransistor--142078/svg/breadboard.svg",
    "componentPath": "components/ambient-light-sensor-phototransistor--142078",
    "simulationModel": "phototransistor",
    "kind": null,
    "description": "Uses ambient light to control the base of an internal NPN transistor.",
    "extents": {
      "top": -25.475000381469727,
      "left": -10.125,
      "width": 20.25,
      "height": 25.475000381469727
    }
  },
  {
    "id": 31896,
    "deviceId": "132521",
    "name": "Arduino Uno R3",
    "namePt": "Arduino Uno R3",
    "basic": false,
    "group": "Microcontroladores",
    "thumbnail": "/circuit-library/assets/thumbnails/arduinoUnoR3.png",
    "svgPath": "/circuit-library/components/arduino-uno-r3--132521/svg/breadboard.svg",
    "componentPath": "components/arduino-uno-r3--132521",
    "simulationModel": "arduinoUnoRev3",
    "kind": "arduino_uno",
    "description": "A programmable board you can use to build interactive circuits.",
    "extents": null
  },
  {
    "id": 28786,
    "deviceId": "116840",
    "name": "ATtiny",
    "namePt": "Microcontrolador ATtiny85",
    "basic": false,
    "group": "Microcontroladores",
    "thumbnail": "/circuit-library/assets/thumbnails/attiny.png",
    "svgPath": "/circuit-library/components/attiny--116840/svg/breadboard.svg",
    "componentPath": "components/attiny--116840",
    "simulationModel": "ATtiny",
    "kind": "attiny",
    "description": "Arduino-compatible ATTiny25/45/85 with 512 bytes RAM.",
    "extents": {
      "top": -16,
      "left": -21,
      "width": 42,
      "height": 32
    }
  },
  {
    "id": 28704,
    "deviceId": "116648",
    "name": "Breadboard",
    "namePt": "Placa de ensaio",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/breadboard.png",
    "svgPath": "/circuit-library/components/breadboard--116648/svg/breadboard.svg",
    "componentPath": "components/breadboard--116648",
    "simulationModel": null,
    "kind": "breadboard",
    "description": "A full-size breadboard with 63 rows, 10 columns, and two pairs of power rails.",
    "extents": {
      "top": -110,
      "left": -340,
      "width": 680,
      "height": 220
    }
  },
  {
    "id": 28788,
    "deviceId": "116842",
    "name": "Breadboard Mini",
    "namePt": "Mini placa de ensaio",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/breadboardMini.png",
    "svgPath": "/circuit-library/components/breadboard-mini--116842/svg/breadboard.svg",
    "componentPath": "components/breadboard-mini--116842",
    "simulationModel": null,
    "kind": "breadboard",
    "description": "A quarter-size breadboard with 17 rows and 10 columns.",
    "extents": {
      "top": -70,
      "left": -95,
      "width": 190,
      "height": 140
    }
  },
  {
    "id": 27268,
    "deviceId": "111211",
    "name": "Breadboard Small",
    "namePt": "Placa de ensaio pequena",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/breadboardSmall.png",
    "svgPath": "/circuit-library/components/breadboard-small--111211/svg/breadboard.svg",
    "componentPath": "components/breadboard-small--111211",
    "simulationModel": null,
    "kind": "breadboard",
    "description": "A half-size breadboard with 30 rows, 10 columns, and two pairs of power rails.",
    "extents": {
      "top": -106,
      "left": -165,
      "width": 330,
      "height": 212
    }
  },
  {
    "id": 17910,
    "deviceId": "57752",
    "name": "Capacitor",
    "namePt": "Capacitor",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/capacitor.png",
    "svgPath": "/circuit-library/components/capacitor--57752/svg/breadboard.svg",
    "componentPath": "components/capacitor--57752",
    "simulationModel": "capacitor",
    "kind": "capacitor",
    "description": "Stores and releases electrical energy in a circuit.",
    "extents": {
      "top": -26.40999984741211,
      "left": -9.619999885559082,
      "width": 19.239999771118164,
      "height": 26.529998779296875
    }
  },
  {
    "id": 39041,
    "deviceId": "165360",
    "name": "Coin Cell 3V Battery",
    "namePt": "Bateria tipo moeda de 3 V",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/batteryCoinCell.png",
    "svgPath": "/circuit-library/components/coin-cell-3v-battery--165360/svg/breadboard.svg",
    "componentPath": "components/coin-cell-3v-battery--165360",
    "simulationModel": "coinCell",
    "kind": "battery_coin",
    "description": "A small battery great for low power applications like lighting up LEDs.",
    "extents": {
      "top": -60,
      "left": -42.209999084472656,
      "width": 84.41999816894531,
      "height": 120
    }
  },
  {
    "id": 28256,
    "deviceId": "114158",
    "name": "DC Motor",
    "namePt": "Motor CC",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/motorDCArduinoKit.png",
    "svgPath": "/circuit-library/components/dc-motor--114158/svg/breadboard.svg",
    "componentPath": "components/dc-motor--114158",
    "simulationModel": "dc_motor_arduino",
    "kind": "dc_motor",
    "description": "A motor, which converts electrical energy into mechanical energy.",
    "extents": {
      "top": -81,
      "left": -47.5,
      "width": 95,
      "height": 81
    }
  },
  {
    "id": 36242,
    "deviceId": "153670",
    "name": "DC Motor with encoder",
    "namePt": "Motor CC com encoder",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/motorDCEncoderSmall.png",
    "svgPath": "/circuit-library/components/dc-motor-with-encoder--153670/svg/breadboard.svg",
    "componentPath": "components/dc-motor-with-encoder--153670",
    "simulationModel": "dc_motor_encoder_small",
    "kind": "dc_motor_encoder",
    "description": "An Actobotics 3-12V planetary gear motor with encoder.",
    "extents": {
      "top": -133.25,
      "left": -43.25,
      "width": 86.5,
      "height": 139.16400146484375
    }
  },
  {
    "id": 17914,
    "deviceId": "58320",
    "name": "Diode",
    "namePt": "Diodo",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/diode.png",
    "svgPath": "/circuit-library/components/diode--58320/svg/breadboard.svg",
    "componentPath": "components/diode--58320",
    "simulationModel": "diode",
    "kind": "diode",
    "description": "Allows electricity to flow in only one direction.",
    "extents": {
      "top": -20,
      "left": -4.75,
      "width": 9.5,
      "height": 40
    }
  },
  {
    "id": 35130,
    "deviceId": "146812",
    "name": "DIP Switch DPST",
    "namePt": "Chave DIP DPST",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/dipSwitchDPST.png",
    "svgPath": "/circuit-library/components/dip-switch-dpst--146812/svg/breadboard.svg",
    "componentPath": "components/dip-switch-dpst--146812",
    "simulationModel": "dip_switch_spdt",
    "kind": "dip_dpst",
    "description": "A single DIP switch.",
    "extents": {
      "top": -19,
      "left": -14,
      "width": 28,
      "height": 38
    }
  },
  {
    "id": 35401,
    "deviceId": "148342",
    "name": "DIP Switch SPST x 4",
    "namePt": "Chave DIP SPST x 4",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/dipSwitchSPSTx4.png",
    "svgPath": "/circuit-library/components/dip-switch-spst-x-4--148342/svg/breadboard.svg",
    "componentPath": "components/dip-switch-spst-x-4--148342",
    "simulationModel": "dip_switch_4",
    "kind": "dip_4",
    "description": "Contains 4 individual switches.",
    "extents": {
      "top": -19.5,
      "left": -22,
      "width": 44,
      "height": 39
    }
  },
  {
    "id": 35402,
    "deviceId": "148343",
    "name": "DIP Switch SPST x 6",
    "namePt": "Chave DIP SPST x 6",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/dipSwitchSPSTx6.png",
    "svgPath": "/circuit-library/components/dip-switch-spst-x-6--148343/svg/breadboard.svg",
    "componentPath": "components/dip-switch-spst-x-6--148343",
    "simulationModel": "dip_switch_6",
    "kind": "dip_6",
    "description": "Contains 6 individual switches.",
    "extents": {
      "top": -19.5,
      "left": -34.25,
      "width": 68.5,
      "height": 39
    }
  },
  {
    "id": 28725,
    "deviceId": "116716",
    "name": "Dual 4-Input AND gate",
    "namePt": "Dual 4-Input AND gate",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC21.png",
    "svgPath": "/circuit-library/components/dual-4-input-and-gate--116716/svg/breadboard.svg",
    "componentPath": "components/dual-4-input-and-gate--116716",
    "simulationModel": "74HC21",
    "kind": null,
    "description": "Two logic gates that each have a HIGH output when all of their 4 inputs are HIGH.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 28724,
    "deviceId": "116714",
    "name": "Dual 4-Input NAND gate",
    "namePt": "Dual 4-Input NAND gate",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC20.png",
    "svgPath": "/circuit-library/components/dual-4-input-nand-gate--116714/svg/breadboard.svg",
    "componentPath": "components/dual-4-input-nand-gate--116714",
    "simulationModel": "74HC20",
    "kind": null,
    "description": "Two logic gates that each have a HIGH output when any of their 4 inputs are LOW.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 63927,
    "deviceId": "286515",
    "name": "Dual comparator",
    "namePt": "Comparador Duplo LM393",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/icComparatorDualLM393.png",
    "svgPath": "/circuit-library/components/dual-comparator--286515/svg/breadboard.svg",
    "componentPath": "components/dual-comparator--286515",
    "simulationModel": "lm393",
    "kind": "comparator_lm393",
    "description": "LM393. Consists of two independent voltage comparators.",
    "extents": {
      "top": -16,
      "left": -21,
      "width": 42,
      "height": 32
    }
  },
  {
    "id": 28730,
    "deviceId": "116725",
    "name": "Dual D Flip-Flop",
    "namePt": "CI 74HC74 (Flip-Flop D)",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC74.png",
    "svgPath": "/circuit-library/components/dual-d-flip-flop--116725/svg/breadboard.svg",
    "componentPath": "components/dual-d-flip-flop--116725",
    "simulationModel": "74HC74",
    "kind": "dff7474",
    "description": "Two D-type flip-flops with set and reset. Positive edge trigger.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 28729,
    "deviceId": "116723",
    "name": "Dual J-K Flip-Flop",
    "namePt": "CI 74HC73 (Flip-Flop JK)",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC73.png",
    "svgPath": "/circuit-library/components/dual-j-k-flip-flop--116723/svg/breadboard.svg",
    "componentPath": "components/dual-j-k-flip-flop--116723",
    "simulationModel": "74HC73",
    "kind": "jk74hc73",
    "description": "Dual JK flip-flop with reset. Negative-edge trigger.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 46936,
    "deviceId": "202580",
    "name": "Dual Timer",
    "namePt": "CI Temporizador Duplo 556",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/icTimer556.png",
    "svgPath": "/circuit-library/components/dual-timer--202580/svg/breadboard.svg",
    "componentPath": "components/dual-timer--202580",
    "simulationModel": "timer556",
    "kind": "timer_556",
    "description": "Combines two 555 timers in one package.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": "sensorFlexid",
    "deviceId": "sensorFlex",
    "name": "Flex Sensor",
    "namePt": "Flex Sensor",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/sensorFlex.png",
    "svgPath": "/circuit-library/components/flex-sensor--sensorFlex/svg/breadboard.svg",
    "componentPath": "components/flex-sensor--sensorFlex",
    "simulationModel": "sensorFlex",
    "kind": null,
    "description": "A sensor whose resistance changes as it bends.",
    "extents": {
      "top": -145,
      "left": -12.5,
      "width": 25,
      "height": 308
    }
  },
  {
    "id": "sensorForceid",
    "deviceId": "sensorForce",
    "name": "Force Sensor",
    "namePt": "Force Sensor",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/sensorForce.png",
    "svgPath": "/circuit-library/components/force-sensor--sensorForce/svg/breadboard.svg",
    "componentPath": "components/force-sensor--sensorForce",
    "simulationModel": "sensorForce",
    "kind": null,
    "description": "A sensor whose resistance changes based on the amount of force applied.",
    "extents": {
      "top": -136.9961395263672,
      "left": -36.000003814697266,
      "width": 72,
      "height": 241.2461395263672
    }
  },
  {
    "id": 48698,
    "deviceId": "209278",
    "name": "Function Generator",
    "namePt": "Gerador de função",
    "basic": false,
    "group": "Alimentação & Instrumentos",
    "thumbnail": "/circuit-library/assets/thumbnails/functionGenerator.png",
    "svgPath": "/circuit-library/components/function-generator--209278/svg/breadboard.svg",
    "componentPath": "components/function-generator--209278",
    "simulationModel": "function_generator",
    "kind": "generator",
    "description": "Electronic test equipment that generates various voltage waveforms.",
    "extents": {
      "top": -113.5,
      "left": -108.22200012207031,
      "width": 203.2220001220703,
      "height": 121
    }
  },
  {
    "id": 53905,
    "deviceId": "239306",
    "name": "Gas Sensor",
    "namePt": "Sensor de Gás",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/sensorGas.png",
    "svgPath": "/circuit-library/components/gas-sensor--239306/svg/breadboard.svg",
    "componentPath": "components/gas-sensor--239306",
    "simulationModel": "sensor_gas",
    "kind": "gas_sensor",
    "description": "A Winsen gas sensor used to detect gas leaks like carbon monoxide, alcohol, or methane.",
    "extents": {
      "top": -45,
      "left": -37.500003814697266,
      "width": 75,
      "height": 90
    }
  },
  {
    "id": 27263,
    "deviceId": "112326",
    "name": "H-bridge Motor Driver",
    "namePt": "Driver de Motor Ponte H L293D",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/icHBridgeL293D.png",
    "svgPath": "/circuit-library/components/h-bridge-motor-driver--112326/svg/breadboard.svg",
    "componentPath": "components/h-bridge-motor-driver--112326",
    "simulationModel": "L293D",
    "kind": "l293d",
    "description": "Capable of running two DC motors or one bi-polar or uni-polar stepper motor.",
    "extents": {
      "top": -16,
      "left": -41,
      "width": 82,
      "height": 32
    }
  },
  {
    "id": 28718,
    "deviceId": "116701",
    "name": "Hex Inverter",
    "namePt": "CI 74HC04 (Inversor Hex)",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC04.png",
    "svgPath": "/circuit-library/components/hex-inverter--116701/svg/breadboard.svg",
    "componentPath": "components/hex-inverter--116701",
    "simulationModel": "74HC04",
    "kind": "not",
    "description": "Six inverting (NOT) logic gates.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 330000,
    "deviceId": "330000",
    "name": "Hobby Gearmotor",
    "namePt": "Hobby Gearmotor",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/motorDCHobbyGear.png",
    "svgPath": "/circuit-library/components/hobby-gearmotor--330000/svg/breadboard.svg",
    "componentPath": "components/hobby-gearmotor--330000",
    "simulationModel": "dc_motor_hobby_gear",
    "kind": null,
    "description": "A geared motor that is often used to drive robot wheels.",
    "extents": {
      "top": -175,
      "left": -24,
      "width": 120,
      "height": 222.47000122070312
    }
  },
  {
    "id": 17913,
    "deviceId": "58208",
    "name": "Inductor",
    "namePt": "Indutor",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/inductor.png",
    "svgPath": "/circuit-library/components/inductor--58208/svg/breadboard.svg",
    "componentPath": "components/inductor--58208",
    "simulationModel": "inductor",
    "kind": "inductor",
    "description": "Resists change in current flow.",
    "extents": {
      "top": -4.889999866485596,
      "left": -21.032001495361328,
      "width": 42.06300354003906,
      "height": 9.780000686645508
    }
  },
  {
    "id": 28722,
    "deviceId": "116709",
    "name": "Inverting Schmitt Trigger",
    "namePt": "Inverting Schmitt Trigger",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC14.png",
    "svgPath": "/circuit-library/components/inverting-schmitt-trigger--116709/svg/breadboard.svg",
    "componentPath": "components/inverting-schmitt-trigger--116709",
    "simulationModel": "74HC14",
    "kind": null,
    "description": "Six inverting (NOT) logic gates with Schmitt trigger inputs.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 33016,
    "deviceId": "138097",
    "name": "IR remote",
    "namePt": "IR remote",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/infraredRemoteControl.png",
    "svgPath": "/circuit-library/components/ir-remote--138097/svg/breadboard.svg",
    "componentPath": "components/ir-remote--138097",
    "simulationModel": "IRremote",
    "kind": null,
    "description": "A remote control that emits IR signals that can be decoded using an IR sensor.",
    "extents": {
      "top": -162.33299255371094,
      "left": -79.5999984741211,
      "width": 159.1999969482422,
      "height": 324.6669921875
    }
  },
  {
    "id": 45398,
    "deviceId": "196401",
    "name": "IR sensor",
    "namePt": "IR sensor",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/sensorInfrared.png",
    "svgPath": "/circuit-library/components/ir-sensor--196401/svg/breadboard.svg",
    "componentPath": "components/ir-sensor--196401",
    "simulationModel": "IRsensor",
    "kind": null,
    "description": "Detects IR signals emitted by devices like remote controls.",
    "extents": {
      "top": -37.875,
      "left": -11.73799991607666,
      "width": 23.46500015258789,
      "height": 37.875
    }
  },
  {
    "id": 31599,
    "deviceId": "129343",
    "name": "Johnson Decade Counter",
    "namePt": "Johnson Decade Counter",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC4017.png",
    "svgPath": "/circuit-library/components/johnson-decade-counter--129343/svg/breadboard.svg",
    "componentPath": "components/johnson-decade-counter--129343",
    "simulationModel": "74HC4017",
    "kind": null,
    "description": "Toggles each of 10 outputs HIGH in sequence.",
    "extents": {
      "top": -16,
      "left": -41,
      "width": 82,
      "height": 32
    }
  },
  {
    "id": 47214,
    "deviceId": "203761",
    "name": "Keypad 4x4",
    "namePt": "Keypad 4x4",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/keypad.png",
    "svgPath": "/circuit-library/components/keypad-4x4--203761/svg/breadboard.svg",
    "componentPath": "components/keypad-4x4--203761",
    "simulationModel": "keypad_4x4",
    "kind": null,
    "description": "A 16-button keypad with digits 0-9, letters A-D, and the * and # symbols.",
    "extents": {
      "top": -377,
      "left": -137,
      "width": 274,
      "height": 383
    }
  },
  {
    "id": 28098,
    "deviceId": "113878",
    "name": "LCD 16 x 2",
    "namePt": "Visor LCD 16x2",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/displayLCD16x2.png",
    "svgPath": "/circuit-library/components/lcd-16-x-2--113878/svg/breadboard.svg",
    "componentPath": "components/lcd-16-x-2--113878",
    "simulationModel": "LCD_HD44780",
    "kind": "lcd_16x2",
    "description": "A Liquid Crystal Display capable of displaying two lines of 16 characters.",
    "extents": {
      "top": -70.9000015258789,
      "left": -157.5,
      "width": 315,
      "height": 141.8000030517578
    }
  },
  {
    "id": "displayLCD16x2I2C",
    "deviceId": "displayLCD16x2I2C",
    "name": "LCD 16 x 2 (I2C)",
    "namePt": "Visor LCD 16x2 I2C",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/displayLCD16x2I2C.png",
    "svgPath": "/circuit-library/components/lcd-16-x-2-i2c--displayLCD16x2I2C/svg/breadboard.svg",
    "componentPath": "components/lcd-16-x-2-i2c--displayLCD16x2I2C",
    "simulationModel": "LCD_HD44780_I2C",
    "kind": "lcd_i2c",
    "description": "A Liquid Crystal Display capable of displaying two lines of 16 characters.",
    "extents": {
      "top": -71,
      "left": -162.5,
      "width": 320,
      "height": 142
    }
  },
  {
    "id": 17916,
    "deviceId": "58422",
    "name": "LED",
    "namePt": "LED",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/led.png",
    "svgPath": "/circuit-library/components/led--58422/svg/breadboard.svg",
    "componentPath": "components/led--58422",
    "simulationModel": "led2",
    "kind": "led",
    "description": "Light-Emitting Diode that lights up when electricity passes through it in the correct direction.",
    "extents": {
      "top": -28.470001220703125,
      "left": -8.050000190734863,
      "width": 14.710000038146973,
      "height": 28.470001220703125
    }
  },
  {
    "id": 17917,
    "deviceId": "58456",
    "name": "LED RGB",
    "namePt": "LED RGB",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/ledRGB.png",
    "svgPath": "/circuit-library/components/led-rgb--58456/svg/breadboard.svg",
    "componentPath": "components/led-rgb--58456",
    "simulationModel": "ledRGB",
    "kind": null,
    "description": "A type of LED that combines Red, Blue, and Green to produce any color.",
    "extents": {
      "top": -33.279998779296875,
      "left": -15,
      "width": 30,
      "height": 33.279998779296875
    }
  },
  {
    "id": "batteryLemonid",
    "deviceId": "batteryLemon",
    "name": "Lemon Battery",
    "namePt": "Lemon Battery",
    "basic": false,
    "group": "Alimentação & Instrumentos",
    "thumbnail": "/circuit-library/assets/thumbnails/batteryLemon.png",
    "svgPath": "/circuit-library/components/lemon-battery--batteryLemon/svg/breadboard.svg",
    "componentPath": "components/lemon-battery--batteryLemon",
    "simulationModel": "batteryLemon",
    "kind": null,
    "description": "A chemical battery made from a lemon, and some copper and zinc metal.",
    "extents": {
      "top": -150,
      "left": -143.96739196777344,
      "width": 279.80438232421875,
      "height": 262.79559326171875
    }
  },
  {
    "id": 28714,
    "deviceId": "116693",
    "name": "Light bulb",
    "namePt": "Light bulb",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/lightBulb.png",
    "svgPath": "/circuit-library/components/light-bulb--116693/svg/breadboard.svg",
    "componentPath": "components/light-bulb--116693",
    "simulationModel": "lightBulb",
    "kind": null,
    "description": "A 12V / 3W incadescent light bulb.",
    "extents": {
      "top": -103.05999755859375,
      "left": -29.630001068115234,
      "width": 59.2599983215332,
      "height": 103.05999755859375
    }
  },
  {
    "id": 33955,
    "deviceId": "142073",
    "name": "Micro Servo",
    "namePt": "Micro servo motor",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/motorServoDFRobotKit.png",
    "svgPath": "/circuit-library/components/micro-servo--142073/svg/breadboard.svg",
    "componentPath": "components/micro-servo--142073",
    "simulationModel": "servo_SG90",
    "kind": "servo",
    "description": "A motor whose position can be controlled using a microcontroller like an Arduino.",
    "extents": {
      "top": -6,
      "left": -82.17353057861328,
      "width": 164.34706115722656,
      "height": 179.64999389648438
    }
  },
  {
    "id": "microbitid",
    "deviceId": "microbit",
    "name": "micro:bit",
    "namePt": "micro:bit",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/microbit.png",
    "svgPath": "/circuit-library/components/micro-bit--microbit/svg/breadboard.svg",
    "componentPath": "components/micro-bit--microbit",
    "simulationModel": "microbit",
    "kind": null,
    "description": "A programmable board you can use to build interactive circuits.",
    "extents": {
      "top": -211.81700134277344,
      "left": -100,
      "width": 200,
      "height": 424.0469970703125
    }
  },
  {
    "id": "microbitBreakoutid",
    "deviceId": "microbitBreakout",
    "name": "micro:bit with Breakout",
    "namePt": "micro:bit with Breakout",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/microbitBreakout.png",
    "svgPath": "/circuit-library/components/micro-bit-with-breakout--microbitBreakout/svg/breadboard.svg",
    "componentPath": "components/micro-bit-with-breakout--microbitBreakout",
    "simulationModel": "microbit",
    "kind": null,
    "description": "A programmable board you can use to build interactive circuits, with a breakout board for easy connection to a breadboard.",
    "extents": {
      "top": -211.81700134277344,
      "left": -142,
      "width": 284,
      "height": 379.3170166015625
    }
  },
  {
    "id": 28709,
    "deviceId": "116662",
    "name": "Multimeter",
    "namePt": "Multímetro Digital",
    "basic": false,
    "group": "Alimentação & Instrumentos",
    "thumbnail": "/circuit-library/assets/thumbnails/multimeter.png",
    "svgPath": "/circuit-library/components/multimeter--116662/svg/breadboard.svg",
    "componentPath": "components/multimeter--116662",
    "simulationModel": "multimeter_v2",
    "kind": "multimeter",
    "description": "A tool for measuring voltage, current, and resistance in your circuit.",
    "extents": {
      "top": -54,
      "left": -71,
      "width": 142,
      "height": 54
    }
  },
  {
    "id": 49820,
    "deviceId": "215842",
    "name": "NeoPixel",
    "namePt": "NeoPixel",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelBreadboard.png",
    "svgPath": "/circuit-library/components/neopixel--215842/svg/breadboard.svg",
    "componentPath": "components/neopixel--215842",
    "simulationModel": "ws2812_breadboard",
    "kind": null,
    "description": "A single RGB LED that can be controlled using a microcontroller.",
    "extents": {
      "top": -25,
      "left": -20,
      "width": 40,
      "height": 50
    }
  },
  {
    "id": 46828,
    "deviceId": "202163",
    "name": "NeoPixel Ring 12",
    "namePt": "NeoPixel Ring 12",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelRing12.png",
    "svgPath": "/circuit-library/components/neopixel-ring-12--202163/svg/breadboard.svg",
    "componentPath": "components/neopixel-ring-12--202163",
    "simulationModel": "ws2812b_ring12",
    "kind": null,
    "description": "A ring of 12 NeoPixels that can be individually controlled using a microcontroller.",
    "extents": {
      "top": -72,
      "left": -72,
      "width": 144,
      "height": 144
    }
  },
  {
    "id": 49813,
    "deviceId": "215830",
    "name": "NeoPixel Ring 16",
    "namePt": "NeoPixel Ring 16",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelRing16.png",
    "svgPath": "/circuit-library/components/neopixel-ring-16--215830/svg/breadboard.svg",
    "componentPath": "components/neopixel-ring-16--215830",
    "simulationModel": "ws2812b_ring16",
    "kind": null,
    "description": "A ring of 16 NeoPixels that can be individually controlled using a microcontroller.",
    "extents": {
      "top": -88,
      "left": -88,
      "width": 176,
      "height": 176
    }
  },
  {
    "id": 49811,
    "deviceId": "215824",
    "name": "NeoPixel Ring 24",
    "namePt": "NeoPixel Ring 24",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelRing24.png",
    "svgPath": "/circuit-library/components/neopixel-ring-24--215824/svg/breadboard.svg",
    "componentPath": "components/neopixel-ring-24--215824",
    "simulationModel": "ws2812b_ring24",
    "kind": null,
    "description": "A ring of 24 NeoPixels that can be individually controlled using a microcontroller.",
    "extents": {
      "top": -129,
      "left": -129,
      "width": 258,
      "height": 258
    }
  },
  {
    "id": "neopixel_strip_10",
    "deviceId": "neopixel_strip_10",
    "name": "NeoPixel Strip 10",
    "namePt": "NeoPixel Strip 10",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelStrip10.png",
    "svgPath": "/circuit-library/components/neopixel-strip-10--neopixel_strip_10/svg/breadboard.svg",
    "componentPath": "components/neopixel-strip-10--neopixel_strip_10",
    "simulationModel": "ws2812_strip10",
    "kind": null,
    "description": "A flexible strip of RGB LEDs that can be controlled using a microcontroller.",
    "extents": {
      "top": -19.6,
      "left": -328,
      "width": 656,
      "height": 39.2
    }
  },
  {
    "id": "neopixel_strip_12",
    "deviceId": "neopixel_strip_12",
    "name": "NeoPixel Strip 12",
    "namePt": "NeoPixel Strip 12",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelStrip12.png",
    "svgPath": "/circuit-library/components/neopixel-strip-12--neopixel_strip_12/svg/breadboard.svg",
    "componentPath": "components/neopixel-strip-12--neopixel_strip_12",
    "simulationModel": "ws2812_strip12",
    "kind": null,
    "description": "A flexible strip of RGB LEDs that can be controlled using a microcontroller.",
    "extents": {
      "top": -19.6,
      "left": -393.59999999999997,
      "width": 787.1999999999999,
      "height": 39.2
    }
  },
  {
    "id": "neopixel_strip_16",
    "deviceId": "neopixel_strip_16",
    "name": "NeoPixel Strip 16",
    "namePt": "NeoPixel Strip 16",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelStrip16.png",
    "svgPath": "/circuit-library/components/neopixel-strip-16--neopixel_strip_16/svg/breadboard.svg",
    "componentPath": "components/neopixel-strip-16--neopixel_strip_16",
    "simulationModel": "ws2812_strip16",
    "kind": null,
    "description": "A flexible strip of RGB LEDs that can be controlled using a microcontroller.",
    "extents": {
      "top": -19.6,
      "left": -524.8,
      "width": 1049.6,
      "height": 39.2
    }
  },
  {
    "id": "neopixel_strip_20",
    "deviceId": "neopixel_strip_20",
    "name": "NeoPixel Strip 20",
    "namePt": "NeoPixel Strip 20",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelStrip20.png",
    "svgPath": "/circuit-library/components/neopixel-strip-20--neopixel_strip_20/svg/breadboard.svg",
    "componentPath": "components/neopixel-strip-20--neopixel_strip_20",
    "simulationModel": "ws2812_strip20",
    "kind": null,
    "description": "A flexible strip of RGB LEDs that can be controlled using a microcontroller.",
    "extents": {
      "top": -19.6,
      "left": -656,
      "width": 1312,
      "height": 39.2
    }
  },
  {
    "id": "neopixel_strip_4",
    "deviceId": "neopixel_strip_4",
    "name": "NeoPixel Strip 4",
    "namePt": "NeoPixel Strip 4",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelStrip4.png",
    "svgPath": "/circuit-library/components/neopixel-strip-4--neopixel_strip_4/svg/breadboard.svg",
    "componentPath": "components/neopixel-strip-4--neopixel_strip_4",
    "simulationModel": "ws2812_strip4",
    "kind": null,
    "description": "A flexible strip of RGB LEDs that can be controlled using a microcontroller.",
    "extents": {
      "top": -19.6,
      "left": -131.2,
      "width": 262.4,
      "height": 39.2
    }
  },
  {
    "id": "neopixel_strip_6",
    "deviceId": "neopixel_strip_6",
    "name": "NeoPixel Strip 6",
    "namePt": "NeoPixel Strip 6",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelStrip6.png",
    "svgPath": "/circuit-library/components/neopixel-strip-6--neopixel_strip_6/svg/breadboard.svg",
    "componentPath": "components/neopixel-strip-6--neopixel_strip_6",
    "simulationModel": "ws2812_strip6",
    "kind": null,
    "description": "A flexible strip of RGB LEDs that can be controlled using a microcontroller.",
    "extents": {
      "top": -19.6,
      "left": -196.79999999999998,
      "width": 393.59999999999997,
      "height": 39.2
    }
  },
  {
    "id": "neopixel_strip_8",
    "deviceId": "neopixel_strip_8",
    "name": "NeoPixel Strip 8",
    "namePt": "NeoPixel Strip 8",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/neopixelStrip8.png",
    "svgPath": "/circuit-library/components/neopixel-strip-8--neopixel_strip_8/svg/breadboard.svg",
    "componentPath": "components/neopixel-strip-8--neopixel_strip_8",
    "simulationModel": "ws2812_strip8",
    "kind": null,
    "description": "A flexible strip of RGB LEDs that can be controlled using a microcontroller.",
    "extents": {
      "top": -19.6,
      "left": -262.4,
      "width": 524.8,
      "height": 39.2
    }
  },
  {
    "id": 17924,
    "deviceId": "58627",
    "name": "nMOS Transistor (MOSFET)",
    "namePt": "nMOS Transistor (MOSFET)",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/transistorNMOSFET.png",
    "svgPath": "/circuit-library/components/nmos-transistor-mosfet--58627/svg/breadboard.svg",
    "componentPath": "components/nmos-transistor-mosfet--58627",
    "simulationModel": "power_nmos",
    "kind": null,
    "description": "Large signal voltage controlled transistor.",
    "extents": {
      "top": -44,
      "left": -15,
      "width": 30,
      "height": 44
    }
  },
  {
    "id": 17920,
    "deviceId": "58468",
    "name": "NPN Transistor (BJT)",
    "namePt": "Transistor NPN (BJT)",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/transistorNPN.png",
    "svgPath": "/circuit-library/components/npn-transistor-bjt--58468/svg/breadboard.svg",
    "componentPath": "components/npn-transistor-bjt--58468",
    "simulationModel": "npn",
    "kind": "npn",
    "description": "A component used to amplify or switch electronic signals. Commonly used with motors.",
    "extents": {
      "top": -37.92000198364258,
      "left": -11.739998817443848,
      "width": 23.479997634887695,
      "height": 37.92000198364258
    }
  },
  {
    "id": 27266,
    "deviceId": "111209",
    "name": "Optocoupler",
    "namePt": "Optoacoplador 4N35",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/icOptocoupler4N35.png",
    "svgPath": "/circuit-library/components/optocoupler--111209/svg/breadboard.svg",
    "componentPath": "components/optocoupler--111209",
    "simulationModel": "optoCoupler_4N35",
    "kind": "optocoupler",
    "description": "Transfers signals between two circuits using light.",
    "extents": {
      "top": -16,
      "left": -16,
      "width": 32,
      "height": 32
    }
  },
  {
    "id": 17927,
    "deviceId": "58630",
    "name": "Oscilloscope",
    "namePt": "Osciloscópio",
    "basic": false,
    "group": "Alimentação & Instrumentos",
    "thumbnail": "/circuit-library/assets/thumbnails/oscilloscope.png",
    "svgPath": "/circuit-library/components/oscilloscope--58630/svg/breadboard.svg",
    "componentPath": "components/oscilloscope--58630",
    "simulationModel": "oscilloscope",
    "kind": "oscilloscope",
    "description": "Electronic test equipment for measuring output signals.",
    "extents": {
      "top": -181,
      "left": -83,
      "width": 173,
      "height": 181
    }
  },
  {
    "id": 28734,
    "deviceId": "116732",
    "name": "Photodiode",
    "namePt": "Fotodiodo",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/photoDiode.png",
    "svgPath": "/circuit-library/components/photodiode--116732/svg/breadboard.svg",
    "componentPath": "components/photodiode--116732",
    "simulationModel": "photodiode_v2",
    "kind": "photodiode",
    "description": "Convert light to electric current.",
    "extents": {
      "top": -37.51000213623047,
      "left": -17.5,
      "width": 35,
      "height": 37.51000213623047
    }
  },
  {
    "id": 28712,
    "deviceId": "116691",
    "name": "Photoresistor",
    "namePt": "Fotorresistor (LDR)",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/photoResistor.png",
    "svgPath": "/circuit-library/components/photoresistor--116691/svg/breadboard.svg",
    "componentPath": "components/photoresistor--116691",
    "simulationModel": "ldr_v2",
    "kind": "ldr",
    "description": "A sensor whose resistance changes based on the amount of light it senses.",
    "extents": {
      "top": -26.850000381469727,
      "left": -11.5,
      "width": 23,
      "height": 26.850000381469727
    }
  },
  {
    "id": 28211,
    "deviceId": "114067",
    "name": "Piezo",
    "namePt": "Buzzer Piezo",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/piezo.png",
    "svgPath": "/circuit-library/components/piezo--114067/svg/breadboard.svg",
    "componentPath": "components/piezo--114067",
    "simulationModel": "piezoSound",
    "kind": "piezo",
    "description": "A type of buzzer that makes noise at different frequencies.",
    "extents": {
      "top": -92.5,
      "left": -42.5,
      "width": 85,
      "height": 92.5
    }
  },
  {
    "id": 52579,
    "deviceId": "234203",
    "name": "PIR Sensor",
    "namePt": "Sensor de Presença PIR",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/sensorPassiveInfrared.png",
    "svgPath": "/circuit-library/components/pir-sensor--234203/svg/breadboard.svg",
    "componentPath": "components/pir-sensor--234203",
    "simulationModel": "sensor_pir",
    "kind": "pir_sensor",
    "description": "Passive infrared motion sensor used to sense motion in front of it.",
    "extents": {
      "top": -49,
      "left": -70,
      "width": 140,
      "height": 119
    }
  },
  {
    "id": 18104,
    "deviceId": "59076",
    "name": "pMOS Transistor (MOSFET)",
    "namePt": "pMOS Transistor (MOSFET)",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/transistorPMOSFET.png",
    "svgPath": "/circuit-library/components/pmos-transistor-mosfet--59076/svg/breadboard.svg",
    "componentPath": "components/pmos-transistor-mosfet--59076",
    "simulationModel": "power_pmos",
    "kind": null,
    "description": "Large signal voltage-controlled transistor.",
    "extents": {
      "top": -44,
      "left": -15,
      "width": 30,
      "height": 44
    }
  },
  {
    "id": 17921,
    "deviceId": "58571",
    "name": "PNP Transistor (BJT)",
    "namePt": "Transistor PNP (BJT)",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/transistorPNP.png",
    "svgPath": "/circuit-library/components/pnp-transistor-bjt--58571/svg/breadboard.svg",
    "componentPath": "components/pnp-transistor-bjt--58571",
    "simulationModel": "pnp",
    "kind": "pnp",
    "description": "A component used to amplify or switch electronic signals. Commonly used with motors.",
    "extents": {
      "top": -37.92000198364258,
      "left": -11.739998817443848,
      "width": 23.479997634887695,
      "height": 37.92000198364258
    }
  },
  {
    "id": 17911,
    "deviceId": "57950",
    "name": "Polarized Capacitor",
    "namePt": "Capacitor polarizado",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/capacitorPolarized.png",
    "svgPath": "/circuit-library/components/polarized-capacitor--57950/svg/breadboard.svg",
    "componentPath": "components/polarized-capacitor--57950",
    "simulationModel": "capacitor_polarized",
    "kind": "capacitor_polarized",
    "description": "A direction capacitor used to store and release electric energy in a circuit.",
    "extents": {
      "top": -49.869998931884766,
      "left": -14.710000991821289,
      "width": 29.420001983642578,
      "height": 49.869998931884766
    }
  },
  {
    "id": "batteryPotatoid",
    "deviceId": "batteryPotato",
    "name": "Potato Battery",
    "namePt": "Potato Battery",
    "basic": false,
    "group": "Alimentação & Instrumentos",
    "thumbnail": "/circuit-library/assets/thumbnails/batteryPotato.png",
    "svgPath": "/circuit-library/components/potato-battery--batteryPotato/svg/breadboard.svg",
    "componentPath": "components/potato-battery--batteryPotato",
    "simulationModel": "batteryPotato",
    "kind": null,
    "description": "A chemical battery made from a potato, and some copper and zinc metal.",
    "extents": {
      "top": -150,
      "left": -179.9892578125,
      "width": 349.99261474609375,
      "height": 300.001953125
    }
  },
  {
    "id": 14416,
    "deviceId": "45547",
    "name": "Potentiometer",
    "namePt": "Potenciômetro",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/potentiometer.png",
    "svgPath": "/circuit-library/components/potentiometer--45547/svg/breadboard.svg",
    "componentPath": "components/potentiometer--45547",
    "simulationModel": "potentiometer_v2",
    "kind": "potentiometer",
    "description": "A type of resistor whose resistance changes at the turn of a knob.",
    "extents": {
      "top": -55.484127044677734,
      "left": -25.75282859802246,
      "width": 51.23695373535156,
      "height": 55.484127044677734
    }
  },
  {
    "id": 27571,
    "deviceId": "111724",
    "name": "Power Supply",
    "namePt": "Fonte de energia",
    "basic": false,
    "group": "Alimentação & Instrumentos",
    "thumbnail": "/circuit-library/assets/thumbnails/powerSupply.png",
    "svgPath": "/circuit-library/components/power-supply--111724/svg/breadboard.svg",
    "componentPath": "components/power-supply--111724",
    "simulationModel": "powerSupply",
    "kind": "supply",
    "description": "Electronic test equipment for supplying power to your circuit.",
    "extents": {
      "top": -79.5,
      "left": -54,
      "width": 108,
      "height": 87
    }
  },
  {
    "id": 34360,
    "deviceId": "144786",
    "name": "Pushbutton",
    "namePt": "Botão de pressão",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/pushButton.png",
    "svgPath": "/circuit-library/components/pushbutton--144786/svg/breadboard.svg",
    "componentPath": "components/pushbutton--144786",
    "simulationModel": "button",
    "kind": "button",
    "description": "A switch that closes a circuit while pressed.",
    "extents": {
      "top": -15,
      "left": -12,
      "width": 24,
      "height": 30
    }
  },
  {
    "id": 28719,
    "deviceId": "116702",
    "name": "Quad AND gate",
    "namePt": "Quad AND gate",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC08.png",
    "svgPath": "/circuit-library/components/quad-and-gate--116702/svg/breadboard.svg",
    "componentPath": "components/quad-and-gate--116702",
    "simulationModel": "74HC08",
    "kind": null,
    "description": "Four logic gates that each have a HIGH output when all of their inputs are HIGH.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 56250,
    "deviceId": "248005",
    "name": "Quad comparator",
    "namePt": "Comparador Quádruplo LM339",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/icComparatorQuadLM339.png",
    "svgPath": "/circuit-library/components/quad-comparator--248005/svg/breadboard.svg",
    "componentPath": "components/quad-comparator--248005",
    "simulationModel": "lm339",
    "kind": "comparator_lm339",
    "description": "The LM339 consists of four voltage comparators, powered by a single supply.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 28716,
    "deviceId": "116696",
    "name": "Quad NAND gate",
    "namePt": "Quad NAND gate",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC00.png",
    "svgPath": "/circuit-library/components/quad-nand-gate--116696/svg/breadboard.svg",
    "componentPath": "components/quad-nand-gate--116696",
    "simulationModel": "74HC00",
    "kind": null,
    "description": "Four logic gates that each have a HIGH output when any of their inputs are LOW.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 28733,
    "deviceId": "116730",
    "name": "Quad NAND Schmitt Trigger",
    "namePt": "Quad NAND Schmitt Trigger",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC132.png",
    "svgPath": "/circuit-library/components/quad-nand-schmitt-trigger--116730/svg/breadboard.svg",
    "componentPath": "components/quad-nand-schmitt-trigger--116730",
    "simulationModel": "74HC132",
    "kind": null,
    "description": "Four logic gates each with HIGH output when any of their Schmitt trigger inputs are LOW.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 28717,
    "deviceId": "116698",
    "name": "Quad NOR gate",
    "namePt": "Quad NOR gate",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC02.png",
    "svgPath": "/circuit-library/components/quad-nor-gate--116698/svg/breadboard.svg",
    "componentPath": "components/quad-nor-gate--116698",
    "simulationModel": "74HC02",
    "kind": null,
    "description": "Four logic gates that each have a HIGH output when all of their inputs are LOW.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 28727,
    "deviceId": "116721",
    "name": "Quad OR gate",
    "namePt": "Quad OR gate",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC32.png",
    "svgPath": "/circuit-library/components/quad-or-gate--116721/svg/breadboard.svg",
    "componentPath": "components/quad-or-gate--116721",
    "simulationModel": "74HC32",
    "kind": null,
    "description": "Four logic gates that each have a HIGH output when either of their inputs are HIGH.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 28731,
    "deviceId": "116727",
    "name": "Quad XOR gate",
    "namePt": "Quad XOR gate",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC86.png",
    "svgPath": "/circuit-library/components/quad-xor-gate--116727/svg/breadboard.svg",
    "componentPath": "components/quad-xor-gate--116727",
    "simulationModel": "74HC86",
    "kind": null,
    "description": "Four logic gates that each have a HIGH output when only one of their inputs are HIGH.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 29956,
    "deviceId": "122164",
    "name": "Relay DPDT",
    "namePt": "Relay DPDT",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/relayDPDT.png",
    "svgPath": "/circuit-library/components/relay-dpdt--122164/svg/breadboard.svg",
    "componentPath": "components/relay-dpdt--122164",
    "simulationModel": "relay_dpdt",
    "kind": null,
    "description": "Miniature 5V DPDT power relay",
    "extents": {
      "top": -19.25,
      "left": -39.25,
      "width": 78.5,
      "height": 39.5
    }
  },
  {
    "id": 29959,
    "deviceId": "122167",
    "name": "Relay SPDT",
    "namePt": "Relay SPDT",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/relaySPDTBlack.png",
    "svgPath": "/circuit-library/components/relay-spdt--122167/svg/breadboard.svg",
    "componentPath": "components/relay-spdt--122167",
    "simulationModel": "relay_spdt",
    "kind": null,
    "description": "A 5V SPDT power relay for switching between two circuits.",
    "extents": {
      "top": -20.5,
      "left": -30.5,
      "width": 61,
      "height": 42
    }
  },
  {
    "id": 16511,
    "deviceId": "53184",
    "name": "Resistor",
    "namePt": "Resistor",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/resistor.png",
    "svgPath": "/circuit-library/components/resistor--53184/svg/breadboard.svg",
    "componentPath": "components/resistor--53184",
    "simulationModel": "resistor",
    "kind": "resistor",
    "description": "Restricts the flow of electricity in a circuit, reducing the voltage and current as a result.",
    "extents": {
      "top": -20,
      "left": -4.800000190734863,
      "width": 9.600000381469727,
      "height": 40
    }
  },
  {
    "id": 17919,
    "deviceId": "58458",
    "name": "Slideswitch",
    "namePt": "Interruptor deslizante",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/slideSwitch.png",
    "svgPath": "/circuit-library/components/slideswitch--58458/svg/breadboard.svg",
    "componentPath": "components/slideswitch--58458",
    "simulationModel": "slide_switch_v2",
    "kind": "switch",
    "description": "A switch with two positions: open or closed.",
    "extents": {
      "top": -15,
      "left": -14,
      "width": 28,
      "height": 15
    }
  },
  {
    "id": 28784,
    "deviceId": "116838",
    "name": "Small Signal nMOS Transistor",
    "namePt": "Small Signal nMOS Transistor",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/transistorNMOS.png",
    "svgPath": "/circuit-library/components/small-signal-nmos-transistor--116838/svg/breadboard.svg",
    "componentPath": "components/small-signal-nmos-transistor--116838",
    "simulationModel": "nmos",
    "kind": null,
    "description": "Small Signal voltage-controlled transistor.",
    "extents": {
      "top": -37.92000198364258,
      "left": -11.739998817443848,
      "width": 23.479997634887695,
      "height": 37.92000198364258
    }
  },
  {
    "id": 28785,
    "deviceId": "116839",
    "name": "Small Signal pMOS Transistor",
    "namePt": "Small Signal pMOS Transistor",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/transistorPMOS.png",
    "svgPath": "/circuit-library/components/small-signal-pmos-transistor--116839/svg/breadboard.svg",
    "componentPath": "components/small-signal-pmos-transistor--116839",
    "simulationModel": "pmos",
    "kind": null,
    "description": "Small Signal voltage-controlled transistor.",
    "extents": {
      "top": -37.92000198364258,
      "left": -11.739998817443848,
      "width": 23.479997634887695,
      "height": 37.92000198364258
    }
  },
  {
    "id": "sensorSoilMoistureid",
    "deviceId": "sensorSoilMoisture",
    "name": "Soil Moisture Sensor",
    "namePt": "Soil Moisture Sensor",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/sensorSoilMoisture.png",
    "svgPath": "/circuit-library/components/soil-moisture-sensor--sensorSoilMoisture/svg/breadboard.svg",
    "componentPath": "components/soil-moisture-sensor--sensorSoilMoisture",
    "simulationModel": "sensorSoilMoisture",
    "kind": null,
    "description": "A sensor whose signal voltage changes as it gets wet.",
    "extents": {
      "top": -14.1,
      "left": -45,
      "width": 90,
      "height": 239.5
    }
  },
  {
    "id": "solarCellid",
    "deviceId": "solarCell",
    "name": "Solar Cell",
    "namePt": "Solar Cell",
    "basic": false,
    "group": "Alimentação & Instrumentos",
    "thumbnail": "/circuit-library/assets/thumbnails/solarCell.png",
    "svgPath": "/circuit-library/components/solar-cell--solarCell/svg/breadboard.svg",
    "componentPath": "components/solar-cell--solarCell",
    "simulationModel": "solarCell",
    "kind": null,
    "description": "A device that converts light into electrical energy.",
    "extents": null
  },
  {
    "id": 27664,
    "deviceId": "112324",
    "name": "Temperature Sensor [TMP36]",
    "namePt": "Temperature Sensor [TMP36]",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/sensorTemperature.png",
    "svgPath": "/circuit-library/components/temperature-sensor-tmp36--112324/svg/breadboard.svg",
    "componentPath": "components/temperature-sensor-tmp36--112324",
    "simulationModel": "TMP36",
    "kind": null,
    "description": "A sensor that outputs different voltages based on the ambient temperature.",
    "extents": {
      "top": -37.92000198364258,
      "left": -11.739998817443848,
      "width": 23.479997634887695,
      "height": 37.92000198364258
    }
  },
  {
    "id": 31873,
    "deviceId": "132486",
    "name": "Tilt Sensor",
    "namePt": "Sensor de Inclinação",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/sensorTilt.png",
    "svgPath": "/circuit-library/components/tilt-sensor--132486/svg/breadboard.svg",
    "componentPath": "components/tilt-sensor--132486",
    "simulationModel": "sensor_tilt_sw200d",
    "kind": "tilt_sensor",
    "description": "Tilt-sensitive trigger switch. SW200D.",
    "extents": {
      "top": -4.800000190734863,
      "left": -25,
      "width": 50,
      "height": 9.5
    }
  },
  {
    "id": 28711,
    "deviceId": "116689",
    "name": "Timer",
    "namePt": "CI Temporizador 555",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/icTimer555.png",
    "svgPath": "/circuit-library/components/timer--116689/svg/breadboard.svg",
    "componentPath": "components/timer--116689",
    "simulationModel": "Timer555",
    "kind": "timer_555",
    "description": "General-purpose single bipolar timer.",
    "extents": {
      "top": -16,
      "left": -21,
      "width": 42,
      "height": 32
    }
  },
  {
    "id": 33187,
    "deviceId": "138714",
    "name": "TIP120",
    "namePt": "TIP120",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/transistorTIP120.png",
    "svgPath": "/circuit-library/components/tip120--138714/svg/breadboard.svg",
    "componentPath": "components/tip120--138714",
    "simulationModel": "tip120",
    "kind": null,
    "description": "A NPN Darlington transistor used for switching on high-power electronics like motors.",
    "extents": {
      "top": -44,
      "left": -15,
      "width": 30,
      "height": 44
    }
  },
  {
    "id": 28721,
    "deviceId": "116707",
    "name": "Triple 3-Input AND gate",
    "namePt": "Triple 3-Input AND gate",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC11.png",
    "svgPath": "/circuit-library/components/triple-3-input-and-gate--116707/svg/breadboard.svg",
    "componentPath": "components/triple-3-input-and-gate--116707",
    "simulationModel": "74HC11",
    "kind": null,
    "description": "Three logic gates that each have a HIGH output when all of their 3 inputs are HIGH.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 28720,
    "deviceId": "116705",
    "name": "Triple 3-Input NAND gate",
    "namePt": "Triple 3-Input NAND gate",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC10.png",
    "svgPath": "/circuit-library/components/triple-3-input-nand-gate--116705/svg/breadboard.svg",
    "componentPath": "components/triple-3-input-nand-gate--116705",
    "simulationModel": "74HC10",
    "kind": null,
    "description": "Three logic gates that each have a HIGH output when any of their 3 inputs are LOW.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 28726,
    "deviceId": "116719",
    "name": "Triple 3-Input NOR gate",
    "namePt": "Triple 3-Input NOR gate",
    "basic": false,
    "group": "Circuitos Integrados",
    "thumbnail": "/circuit-library/assets/thumbnails/ic74HC27.png",
    "svgPath": "/circuit-library/components/triple-3-input-nor-gate--116719/svg/breadboard.svg",
    "componentPath": "components/triple-3-input-nor-gate--116719",
    "simulationModel": "74HC27",
    "kind": null,
    "description": "Three logic gates that each have a HIGH output when all of their 3 inputs are LOW.",
    "extents": {
      "top": -16,
      "left": -36,
      "width": 72,
      "height": 32
    }
  },
  {
    "id": 50340,
    "deviceId": "219294",
    "name": "Ultrasonic Distance Sensor",
    "namePt": "Sensor Ultrassônico HC-SR04",
    "basic": false,
    "group": "Entrada & Sensores",
    "thumbnail": "/circuit-library/assets/thumbnails/sensorUltrasonicDistance.png",
    "svgPath": "/circuit-library/components/ultrasonic-distance-sensor--219294/svg/breadboard.svg",
    "componentPath": "components/ultrasonic-distance-sensor--219294",
    "simulationModel": "sensor_ultrasonic_ping",
    "kind": "ultrasonic",
    "description": "A sensor that uses sound waves to determine how far away an object is from it.",
    "extents": {
      "top": -44,
      "left": -90,
      "width": 180,
      "height": 104
    }
  },
  {
    "id": 28710,
    "deviceId": "116686",
    "name": "USB standard A",
    "namePt": "USB standard A",
    "basic": false,
    "group": "Componentes Gerais",
    "thumbnail": "/circuit-library/assets/thumbnails/usbStandardA.png",
    "svgPath": "/circuit-library/components/usb-standard-a--116686/svg/breadboard.svg",
    "componentPath": "components/usb-standard-a--116686",
    "simulationModel": "USBstandard",
    "kind": null,
    "description": "A type A male standard USB connector.",
    "extents": {
      "top": -31.201000213623047,
      "left": -228.8719940185547,
      "width": 228.8719940185547,
      "height": 62.4010009765625
    }
  },
  {
    "id": 71005,
    "deviceId": "311892",
    "name": "Vibration Motor",
    "namePt": "Motor de Vibração",
    "basic": false,
    "group": "Saída & Atuadores",
    "thumbnail": "/circuit-library/assets/thumbnails/motorVibration.png",
    "svgPath": "/circuit-library/components/vibration-motor--311892/svg/breadboard.svg",
    "componentPath": "components/vibration-motor--311892",
    "simulationModel": "vibration_motor",
    "kind": "vibe_motor",
    "description": "A motor that vibrates when powered.",
    "extents": {
      "top": -90,
      "left": -25.025239944458008,
      "width": 50.05047607421875,
      "height": 90
    }
  },
  {
    "id": 28708,
    "deviceId": "116655",
    "name": "Zener Diode",
    "namePt": "Diodo Zener",
    "basic": true,
    "group": "Básico",
    "thumbnail": "/circuit-library/assets/thumbnails/diodeZener.png",
    "svgPath": "/circuit-library/components/zener-diode--116655/svg/breadboard.svg",
    "componentPath": "components/zener-diode--116655",
    "simulationModel": "zenerDiode",
    "kind": "zener_diode",
    "description": "Like a regular diode but lets current flow in reverse if the Zener voltage is reached.",
    "extents": {
      "top": -20,
      "left": -4.75,
      "width": 9.5,
      "height": 40
    }
  }
];

export function getCatalogComponents(category: 'basic' | 'all'): CircuitLibraryComponent[] {
  if (category === 'basic') {
    return circuitLibraryCatalog.filter(c => c.basic)
  }
  return circuitLibraryCatalog
}

export function searchCatalog(query: string, category: 'basic' | 'all'): CircuitLibraryComponent[] {
  const list = getCatalogComponents(category)
  const q = query.trim().toLowerCase()
  if (!q) return list
  return list.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.namePt.toLowerCase().includes(q) ||
    (c.simulationModel && c.simulationModel.toLowerCase().includes(q)) ||
    (c.description && c.description.toLowerCase().includes(q))
  )
}
