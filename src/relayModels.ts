/**
 * Descritores derivados dos módulos extraídos relay_spdt--module-24939.js,
 * relay_dpdt--module-73776.js e da primitiva n.Relay (module 63372 em
 * tinkercad-engine-complete-extracted/raw/circuits-compiled.js).
 *
 * Estes dados ainda não estão ligados ao solver. Os contatos são representados
 * pelo equivalente resistivo da primitiva (1 µΩ/10 GΩ), sem arco, bounce,
 * desgaste, aquecimento, corrente máxima ou modelo eletromagnético da bobina.
 * O atraso de 3 ms é registrado como metadado; o consumidor futuro deve
 * aplicá-lo ao trocar os contatos, em vez de mudar a topologia instantaneamente.
 */

export type RelayState = "deenergized" | "energized";
export type RelayTerminalRole = "coil" | "common" | "throw";

export interface RelayTerminal {
  readonly name: string;
  /** Número do pino físico obtido do pinmap extraído. */
  readonly packagePin: number;
  readonly role: RelayTerminalRole;
}

export interface RelayContact {
  readonly commonTerminal: string;
  readonly throwTerminal: string;
  /** Estado inicial e de repouso (switchState=2 na engine). */
  readonly closedWhenDeenergized: boolean;
  /** Resistência aproximada usada pela engine em cada estado. */
  readonly deenergizedResistanceOhms: number;
  readonly energizedResistanceOhms: number;
}

export interface RelayPole {
  readonly name: string;
  readonly contacts: readonly [RelayContact, RelayContact];
}

export interface RelayModel {
  readonly modelId: "relay_spdt" | "relay_dpdt";
  readonly name: string;
  readonly terminals: readonly RelayTerminal[];
  readonly coil: {
    readonly terminals: readonly ["COIL1", "COIL2"];
    readonly resistanceOhms: 125;
    readonly pickupVoltageVolts: number;
    readonly dropoutVoltageVolts: number;
    /** O modelo extraído aceita qualquer polaridade para estes relés. */
    readonly polaritySensitive: false;
    readonly maximumVoltageVolts: 24;
  };
  readonly contactSwitchDelaySeconds: 0.003;
  /** Limite passado pelos módulos dos componentes à primitiva (28 V). */
  readonly maximumContactVoltageVolts: 28;
  /**
   * Limite efetivamente usado por update_Ui da primitiva: ela fixa 150 V,
   * ignorando maximumSwitchingVoltage recebido no construtor.
   */
  readonly primitiveBreakdownContactLimitVolts: 150;
  readonly latching: false;
  readonly poles: readonly RelayPole[];
  /** Nets que a SimulationModel extraída une eletricamente. */
  readonly electricallyMergedTerminals: readonly string[];
}

const CLOSED_OHMS = 1e-6;
const OPEN_OHMS = 1e10;

function contact(
  commonTerminal: string,
  throwTerminal: string,
  closedWhenDeenergized: boolean,
): RelayContact {
  return {
    commonTerminal,
    throwTerminal,
    closedWhenDeenergized,
    deenergizedResistanceOhms: closedWhenDeenergized ? CLOSED_OHMS : OPEN_OHMS,
    energizedResistanceOhms: closedWhenDeenergized ? OPEN_OHMS : CLOSED_OHMS,
  };
}

/**
 * SPDT: package pins come from relay-spdt--122167/raw.json. The extracted
 * SimulationModel explicitly merges COM1 and COM2 and connects its pole from
 * COM1 to [R2, R1], so R2 is closed at rest and R1 is closed when energized.
 */
export const RELAY_SPDT: RelayModel = {
  modelId: "relay_spdt",
  name: "Relay SPDT",
  terminals: [
    { name: "COIL1", packagePin: 8, role: "coil" },
    { name: "COIL2", packagePin: 5, role: "coil" },
    { name: "COM1", packagePin: 12, role: "common" },
    { name: "COM2", packagePin: 1, role: "common" },
    { name: "R1", packagePin: 6, role: "throw" },
    { name: "R2", packagePin: 7, role: "throw" },
  ],
  coil: {
    terminals: ["COIL1", "COIL2"],
    resistanceOhms: 125,
    pickupVoltageVolts: 2.9,
    dropoutVoltageVolts: 2.3,
    polaritySensitive: false,
    maximumVoltageVolts: 24,
  },
  contactSwitchDelaySeconds: 0.003,
  maximumContactVoltageVolts: 28,
  primitiveBreakdownContactLimitVolts: 150,
  latching: false,
  poles: [
    {
      name: "pole1",
      contacts: [
        contact("COM1", "R2", true),
        contact("COM1", "R1", false),
      ],
    },
  ],
  electricallyMergedTerminals: ["COM1", "COM2"],
};

/**
 * DPDT: package pins come from relay-dpdt--122164/raw.json. The engine pole
 * order is COMA->[A1,A2], COMB->[B1,B2]; contact index 0 is closed at rest.
 */
export const RELAY_DPDT: RelayModel = {
  modelId: "relay_dpdt",
  name: "Relay DPDT",
  terminals: [
    { name: "COIL1", packagePin: 16, role: "coil" },
    { name: "COIL2", packagePin: 1, role: "coil" },
    { name: "COMA", packagePin: 13, role: "common" },
    { name: "A1", packagePin: 11, role: "throw" },
    { name: "A2", packagePin: 9, role: "throw" },
    { name: "COMB", packagePin: 4, role: "common" },
    { name: "B1", packagePin: 6, role: "throw" },
    { name: "B2", packagePin: 8, role: "throw" },
  ],
  coil: {
    terminals: ["COIL1", "COIL2"],
    resistanceOhms: 125,
    pickupVoltageVolts: 2.9,
    dropoutVoltageVolts: 1.5,
    polaritySensitive: false,
    maximumVoltageVolts: 24,
  },
  contactSwitchDelaySeconds: 0.003,
  maximumContactVoltageVolts: 28,
  primitiveBreakdownContactLimitVolts: 150,
  latching: false,
  poles: [
    {
      name: "poleA",
      contacts: [contact("COMA", "A1", true), contact("COMA", "A2", false)],
    },
    {
      name: "poleB",
      contacts: [contact("COMB", "B1", true), contact("COMB", "B2", false)],
    },
  ],
  electricallyMergedTerminals: [],
};

export const RELAY_MODELS: Readonly<Record<RelayModel["modelId"], RelayModel>> = {
  relay_spdt: RELAY_SPDT,
  relay_dpdt: RELAY_DPDT,
};

/**
 * Aplica a histerese da primitiva n.Relay para bobinas não polarizadas.
 * Os limites são estritos: entre dropout e pickup o estado anterior persiste.
 */
export function getRelayStateAfterCoilSample(
  model: RelayModel,
  previousState: RelayState,
  coilVoltageVolts: number,
): RelayState {
  const magnitude = Math.abs(coilVoltageVolts);
  if (magnitude > model.coil.pickupVoltageVolts) return "energized";
  if (magnitude < model.coil.dropoutVoltageVolts) return "deenergized";
  return previousState;
}

/** Resistência equivalente de um contato depois que o atraso de atuação passou. */
export function getRelayContactResistanceOhms(
  contactModel: RelayContact,
  state: RelayState,
): number {
  return state === "deenergized"
    ? contactModel.deenergizedResistanceOhms
    : contactModel.energizedResistanceOhms;
}
