import { describe, expect, it } from 'vitest'
import {
  getMOSFETModel,
  isMOSFETModel,
  MOSFET_MODELS,
} from './mosfetModels'

describe('descritores dos MOSFETs extraídos', () => {
  it('reconhece somente os quatro contratos analógicos implementados no bundle', () => {
    expect(MOSFET_MODELS).toEqual(['nmos', 'pmos', 'power_nmos', 'power_pmos'])
    for (const model of MOSFET_MODELS) expect(isMOSFETModel(model)).toBe(true)
    expect(isMOSFETModel('NMOS')).toBe(false)
    expect(isMOSFETModel('nmos_irf520')).toBe(false)
    expect(isMOSFETModel(undefined)).toBe(false)
    expect(getMOSFETModel('unknown')).toBeUndefined()
  })

  it('mantém limiar, beta e pinos Gate/Drain/Source do nMOS de pequeno sinal', () => {
    expect(getMOSFETModel('nmos')).toMatchObject({
      model: 'nmos',
      polarity: 'n-channel',
      size: 'small-signal',
      thresholdVoltageV: 0.7,
      betaAperV2: 0.006,
      deviceId: '116838',
      catalogId: '28784',
      terminals: { gate: 'gate', source: 'source', drain: 'drain' },
      breadboardPins: { gate: 'Gate', drain: 'Drain', source: 'Source' },
    })
  })

  it('mantém o limiar negativo e beta do pMOS de pequeno sinal', () => {
    expect(getMOSFETModel('pmos')).toMatchObject({
      model: 'pmos',
      polarity: 'p-channel',
      size: 'small-signal',
      thresholdVoltageV: -0.7,
      betaAperV2: 0.00192,
      deviceId: '116839',
      catalogId: '28785',
      bodyDiode: { anode: 'drain', cathode: 'source' },
    })
  })

  it('usa o modelo de potência com limiar de 2 V e beta de 1.1 A/V²', () => {
    expect(getMOSFETModel('power_nmos')).toMatchObject({
      model: 'power_nmos',
      polarity: 'n-channel',
      size: 'power',
      thresholdVoltageV: 2,
      betaAperV2: 1.1,
      deviceId: '58627',
      catalogId: '17924',
      bodyDiode: { anode: 'source', cathode: 'drain' },
    })
  })

  it('calcula o beta de potência do pMOS a partir do multiplicador extraído', () => {
    expect(getMOSFETModel('power_pmos')).toMatchObject({
      model: 'power_pmos',
      polarity: 'p-channel',
      size: 'power',
      thresholdVoltageV: -2,
      deviceId: '59076',
      catalogId: '18104',
      bodyDiode: { anode: 'drain', cathode: 'source' },
    })
    expect(getMOSFETModel('power_pmos')?.betaAperV2).toBeCloseTo(1.1 * 0.32, 12)
  })

  it('documenta lambda, diodo de corpo com continuação e fuga da porta extraídos', () => {
    for (const model of MOSFET_MODELS) {
      expect(getMOSFETModel(model)).toMatchObject({
        channelLengthModulationPerV: 0.01,
        gateSourceLeakageOhms: 1e12,
        bodyDiode: {
          saturationCurrentA: 1e-12,
          thermalVoltageV: 0.0258,
          emissionFactor: 0.9505071264,
          linearContinuation: {
            voltageV: 0.9505071264,
            currentOffsetA: -358413.6156,
            conductanceS: 387596.9,
          },
        },
      })
    }
  })

  it('devolve descritores imutáveis', () => {
    const descriptor = getMOSFETModel('nmos')
    expect(Object.isFrozen(descriptor)).toBe(true)
    expect(descriptor && Object.isFrozen(descriptor.bodyDiode)).toBe(true)
    expect(descriptor && Object.isFrozen(descriptor.breadboardPins)).toBe(true)
  })
})
