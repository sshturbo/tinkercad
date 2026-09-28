import { describe, expect, it } from "vitest";
import {
  getRelayContactResistanceOhms,
  getRelayStateAfterCoilSample,
  RELAY_DPDT,
  RELAY_SPDT,
} from "./relayModels";

describe("descritores de relés extraídos", () => {
  it("registra pinos físicos e bobina de 125 Ω do SPDT e DPDT", () => {
    expect(RELAY_SPDT.terminals.map(({ name, packagePin }) => [name, packagePin])).toEqual([
      ["COIL1", 8],
      ["COIL2", 5],
      ["COM1", 12],
      ["COM2", 1],
      ["R1", 6],
      ["R2", 7],
    ]);
    expect(RELAY_DPDT.terminals.map(({ name, packagePin }) => [name, packagePin])).toEqual([
      ["COIL1", 16],
      ["COIL2", 1],
      ["COMA", 13],
      ["A1", 11],
      ["A2", 9],
      ["COMB", 4],
      ["B1", 6],
      ["B2", 8],
    ]);
    for (const model of [RELAY_SPDT, RELAY_DPDT]) {
      expect(model.coil.resistanceOhms).toBe(125);
      expect(model.contactSwitchDelaySeconds).toBe(0.003);
      expect(model.coil.maximumVoltageVolts).toBe(24);
      expect(model.maximumContactVoltageVolts).toBe(28);
      expect(model.primitiveBreakdownContactLimitVolts).toBe(150);
    }
  });

  it("registra a conexão de repouso e a conexão energizada dos contatos", () => {
    expect(RELAY_SPDT.poles[0].contacts.map(({ throwTerminal }) => throwTerminal)).toEqual([
      "R2",
      "R1",
    ]);
    expect(RELAY_SPDT.electricallyMergedTerminals).toEqual(["COM1", "COM2"]);
    expect(RELAY_DPDT.poles.map((pole) =>
      pole.contacts.map(({ commonTerminal, throwTerminal, closedWhenDeenergized }) => [
        commonTerminal,
        throwTerminal,
        closedWhenDeenergized,
      ]),
    )).toEqual([
      [
        ["COMA", "A1", true],
        ["COMA", "A2", false],
      ],
      [
        ["COMB", "B1", true],
        ["COMB", "B2", false],
      ],
    ]);

    const [restContact, alternateContact] = RELAY_DPDT.poles[0].contacts;
    expect(getRelayContactResistanceOhms(restContact, "deenergized")).toBe(1e-6);
    expect(getRelayContactResistanceOhms(restContact, "energized")).toBe(1e10);
    expect(getRelayContactResistanceOhms(alternateContact, "deenergized")).toBe(1e10);
    expect(getRelayContactResistanceOhms(alternateContact, "energized")).toBe(1e-6);
  });

  it("reproduz thresholds estritos, histerese e bobina não polarizada", () => {
    expect(getRelayStateAfterCoilSample(RELAY_SPDT, "deenergized", 2.89)).toBe("deenergized");
    expect(getRelayStateAfterCoilSample(RELAY_SPDT, "deenergized", 2.9)).toBe("deenergized");
    expect(getRelayStateAfterCoilSample(RELAY_SPDT, "deenergized", -2.91)).toBe("energized");
    expect(getRelayStateAfterCoilSample(RELAY_SPDT, "energized", 2.3)).toBe("energized");
    expect(getRelayStateAfterCoilSample(RELAY_SPDT, "energized", -2.29)).toBe("deenergized");

    expect(getRelayStateAfterCoilSample(RELAY_DPDT, "energized", 1.5)).toBe("energized");
    expect(getRelayStateAfterCoilSample(RELAY_DPDT, "energized", 1.49)).toBe("deenergized");
    expect(getRelayStateAfterCoilSample(RELAY_DPDT, "deenergized", 2.91)).toBe("energized");
  });
});
