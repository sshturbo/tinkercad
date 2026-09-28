# Inventário dos modelos de simulação

Gerado a partir do catálogo offline, do mapa e dos índices em `tinkercad-engine-complete-extracted`. Atualize com `npm run report:sim-models`. “Encontrado” quer dizer que a extração contém um módulo, não que esse modelo esteja implementado no simulador local. Os estados locais descrevem o comportamento atual e podem ser parciais.

O solver MNA valida resíduos KCL, restrições de tensão das fontes ideais e correntes físicas dos dispositivos não lineares. Capacitores e indutores usam startup backward Euler e integração trapezoidal posterior.

- Componentes no catálogo: 109.
- Componentes com lógica elétrica/digital/continuidade local reconhecida: 82; os demais são visuais.
- Modelos distintos no catálogo: 105; com implementação encontrada na extração: 103.
- Modelos locais sem implementação encontrada: L293D, optoCoupler_4N35.

Diodo comum e LED 2 pinos usam curvas Shockley extraídas (diodo Is=1e−12 A/n=1; LED Is=1e−20 A, 6 Ω série e n por cor); a continuação numérica do MNA mantém uma pequena fuga reversa aproximada, sem comportamento térmico ou dano. O LED avisa acima de 20 mA e marca breakdown a partir de 120 mA sem limitar a corrente. O modelo piezoSound usa o resistor extraído de 600 Ω e o limite direto >25 V; áudio e intensidade acústica não são implementados. O Timer555 reproduz a ladder/pulls, o latch e a saída/discharge analógicos; os delays pendentes de 0,5 µs são processados por deadlines internos. O timer556 contém dois núcleos 555 com estado independente, rails compartilhados e deadlines separados por canal. O LCD_HD44780 implementa instruções comuns, DDRAM 16×2, interface de 4/8 bits e shunts/backlight; leitura RW e CGRAM não estão implementados. O servo SG90 usa shunt extraído de 1,47 kΩ, limite de alimentação 2,8–6 V e captura por amostragem de pulsos >2,5 V (0,5–2,5 ms), com deslocamento de até 3° por pulso; pulsos entre passos, corrente dinâmica e modo contínuo não são modelados. O modelo sensor_ultrasonic_ping reproduz branches MNA e o scheduler de echo nos prazos extraídos, mas os triggers ainda são amostrados pelos subpassos do caller; pulsos entre amostras baixas são perdidos e não se afirma captura a 2 µs em passos de dezenas de milissegundos.

| Modelo | Itens no catálogo | Implementação extraída | Estado no simulador local |
|---|---:|---|---|
| `74HC00` | 1 | sim (módulo 59866) | Digital/lógico parcial |
| `74HC02` | 1 | sim (módulo 39440) | Digital/lógico parcial |
| `74HC04` | 1 | sim (módulo 21529) | Digital/lógico parcial |
| `74HC08` | 1 | sim (módulo 27970) | Digital/lógico parcial |
| `74HC10` | 1 | sim (módulo 14551) | Digital/lógico parcial |
| `74HC11` | 1 | sim (módulo 73248) | Digital/lógico parcial |
| `74HC132` | 1 | sim (módulo 49834) | Digital/lógico parcial |
| `74HC14` | 1 | sim (módulo 14803) | Digital/lógico parcial |
| `74HC20` | 1 | sim (módulo 27688) | Digital/lógico parcial |
| `74HC21` | 1 | sim (módulo 62303) | Digital/lógico parcial |
| `74HC27` | 1 | sim (módulo 7901) | Digital/lógico parcial |
| `74HC283` | 1 | sim (módulo 75903) | Digital/lógico parcial |
| `74HC32` | 1 | sim (módulo 8491) | Digital/lógico parcial |
| `74HC4017` | 1 | sim (módulo 85658) | Digital/lógico parcial |
| `74HC595` | 1 | sim (módulo 97929) | Digital/lógico parcial |
| `74HC73` | 1 | sim (módulo 96232) | Digital/lógico parcial |
| `74HC74` | 1 | sim (módulo 92285) | Digital/lógico parcial |
| `74HC75` | 1 | sim (módulo 82366) | Digital/lógico parcial |
| `74HC86` | 1 | sim (módulo 89988) | Digital/lógico parcial |
| `74HC93` | 1 | sim (módulo 45266) | Digital/lógico parcial |
| `AABattery` | 1 | sim (módulo 9058) | MNA DC/transitório parcial |
| `arduinoUnoRev3` | 1 | sim (módulo 62891) | Visual; sem modelo local |
| `ATtiny` | 1 | sim (módulo 56486) | Visual; sem modelo local |
| `battery9V` | 1 | sim (módulo 72563) | MNA DC/transitório parcial |
| `batteryLemon` | 1 | sim (módulo 99737) | MNA DC/transitório parcial |
| `batteryPotato` | 1 | sim (módulo 33443) | MNA DC/transitório parcial |
| `button` | 1 | sim (módulo 77617) | MNA DC/transitório parcial |
| `capacitor` | 1 | sim (módulo 5737) | MNA DC/transitório parcial |
| `capacitor_polarized` | 1 | sim (módulo 20243) | MNA DC/transitório parcial |
| `CD4511` | 1 | sim (módulo 43434) | Digital/lógico parcial |
| `coinCell` | 1 | sim (módulo 42520) | MNA DC/transitório parcial |
| `dc_motor_arduino` | 1 | sim (módulo 80722) | Visual; sem modelo local |
| `dc_motor_encoder_small` | 1 | sim (módulo 3179) | Visual; sem modelo local |
| `dc_motor_hobby_gear` | 1 | sim (módulo 10069) | Visual; sem modelo local |
| `diode` | 1 | sim (módulo 8338) | MNA DC/transitório parcial |
| `dip_switch_4` | 1 | sim (módulo 64570) | MNA DC/transitório parcial |
| `dip_switch_6` | 1 | sim (módulo 27248) | MNA DC/transitório parcial |
| `dip_switch_spdt` | 1 | sim (módulo 83883) | MNA DC/transitório parcial |
| `function_generator` | 1 | sim (módulo 85044) | MNA transitório parcial; fonte temporal |
| `inductor` | 1 | sim (módulo 91271) | MNA DC/transitório parcial |
| `IRremote` | 1 | sim (módulo 27505) | Visual; sem modelo local |
| `IRsensor` | 1 | sim (módulo 76617) | MNA DC/transitório parcial |
| `keypad_4x4` | 1 | sim (módulo 58745) | MNA DC/transitório parcial |
| `L293D` | 1 | não encontrado | Visual; sem modelo local |
| `LCD_HD44780` | 1 | sim (módulo 12130) | MNA + HD44780: comandos, DDRAM, 4/8 bits; leitura RW/CGRAM ausentes |
| `LCD_HD44780_I2C` | 1 | sim (módulo 78116) | Visual; sem modelo local |
| `ldr_v2` | 1 | sim (módulo 35963) | MNA DC/transitório parcial |
| `led2` | 1 | sim (módulo 2292) | MNA DC/transitório parcial |
| `ledRGB` | 1 | sim (módulo 37833) | MNA DC/transitório parcial |
| `lightBulb` | 1 | sim (módulo 9482) | MNA DC/transitório parcial |
| `lm339` | 1 | sim (módulo 46173) | MNA DC/transitório parcial |
| `lm393` | 1 | sim (módulo 43877) | MNA DC/transitório parcial |
| `microbit` | 2 | sim (módulo 59214) | Visual; sem modelo local |
| `multimeter_v2` | 1 | sim (módulo 16603) | Visual; sem modelo local |
| `nmos` | 1 | sim (módulo 68610) | MNA DC/transitório parcial |
| `npn` | 1 | sim (módulo 72885) | MNA DC/transitório parcial |
| `null_device` | 1 | sim (módulo 50438) | Visual; sem modelo local |
| `opAmp_UA741` | 1 | sim (módulo 72622) | MNA DC/transitório parcial |
| `optoCoupler_4N35` | 1 | não encontrado | Visual; sem modelo local |
| `oscilloscope` | 1 | sim (módulo 63909) | Visual; sem modelo local |
| `pcf8574` | 1 | sim (módulo 44504) | Visual; sem modelo local |
| `photodiode_v2` | 1 | sim (módulo 43050) | MNA DC/transitório parcial |
| `phototransistor` | 1 | sim (módulo 49109) | MNA DC/transitório parcial |
| `piezoSound` | 1 | sim (módulo 97250) | MNA DC/transitório parcial |
| `pmos` | 1 | sim (módulo 87092) | MNA DC/transitório parcial |
| `pnp` | 1 | sim (módulo 86523) | MNA DC/transitório parcial |
| `potentiometer_v2` | 1 | sim (módulo 30148) | MNA DC/transitório parcial |
| `power_nmos` | 1 | sim (módulo 24531) | MNA DC/transitório parcial |
| `power_pmos` | 1 | sim (módulo 53181) | MNA DC/transitório parcial |
| `powerSupply` | 1 | sim (módulo 66667) | MNA DC/transitório parcial |
| `relay_dpdt` | 1 | sim (módulo 73776) | MNA DC/transitório parcial |
| `relay_spdt` | 1 | sim (módulo 24939) | MNA DC/transitório parcial |
| `resistor` | 1 | sim (módulo 23274) | MNA DC/transitório parcial |
| `sensor_gas` | 1 | sim (módulo 58766) | MNA DC/transitório parcial |
| `sensor_pir` | 1 | sim (módulo 61384) | MNA DC/transitório parcial |
| `sensor_tilt_sw200d` | 1 | sim (módulo 59844) | MNA DC/transitório parcial |
| `sensor_ultrasonic_ping` | 1 | sim (módulo 81629) | MNA transitório parcial; echo por deadlines e trigger amostrado |
| `sensorFlex` | 1 | sim (módulo 28308) | MNA DC/transitório parcial |
| `sensorForce` | 1 | sim (módulo 60952) | MNA DC/transitório parcial |
| `sensorSoilMoisture` | 1 | sim (módulo 12798) | MNA DC/transitório parcial |
| `servo_SG90` | 1 | sim (módulo 53417) | MNA DC/transitório parcial; PWM posicional amostrado |
| `seven_segment_digit_5011bh` | 1 | sim (módulo 28034) | MNA DC/transitório parcial |
| `seven-segment-i2c` | 1 | sim (módulo 7403) | Visual; sem modelo local |
| `slide_switch_v2` | 1 | sim (módulo 40360) | MNA DC/transitório parcial |
| `solarCell` | 1 | sim (módulo 27051) | MNA DC/transitório parcial |
| `Timer555` | 1 | sim (módulo 27251) | MNA transitório parcial; atraso com deadline interno |
| `timer556` | 1 | sim (módulo 73430) | MNA dual transitório parcial; deadlines por canal |
| `tip120` | 1 | sim (módulo 94047) | MNA DC/transitório parcial |
| `TMP36` | 1 | sim (módulo 84820) | MNA DC/transitório parcial |
| `USBstandard` | 1 | sim (módulo 70394) | MNA DC/transitório parcial |
| `vibration_motor` | 1 | sim (módulo 45616) | MNA DC/transitório parcial |
| `voltageRegulator3p3V` | 1 | sim (módulo 50330) | MNA DC/transitório parcial |
| `voltageRegulator5V` | 1 | sim (módulo 34639) | MNA DC/transitório parcial |
| `ws2812_breadboard` | 1 | sim (módulo 97228) | Visual; sem modelo local |
| `ws2812_strip10` | 1 | sim (módulo 60331) | Visual; sem modelo local |
| `ws2812_strip12` | 1 | sim (módulo 20365) | Visual; sem modelo local |
| `ws2812_strip16` | 1 | sim (módulo 18961) | Visual; sem modelo local |
| `ws2812_strip20` | 1 | sim (módulo 73964) | Visual; sem modelo local |
| `ws2812_strip4` | 1 | sim (módulo 31784) | Visual; sem modelo local |
| `ws2812_strip6` | 1 | sim (módulo 17074) | Visual; sem modelo local |
| `ws2812_strip8` | 1 | sim (módulo 70508) | Visual; sem modelo local |
| `ws2812b_ring12` | 1 | sim (módulo 84263) | Visual; sem modelo local |
| `ws2812b_ring16` | 1 | sim (módulo 41699) | Visual; sem modelo local |
| `ws2812b_ring24` | 1 | sim (módulo 57962) | Visual; sem modelo local |
| `zenerDiode` | 1 | sim (módulo 1660) | MNA DC/transitório parcial |
