use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum Level {
    #[serde(rename = "0")]
    Low,
    #[serde(rename = "1")]
    High,
    #[default]
    #[serde(rename = "X")]
    Unknown,
}

impl Level {
    fn invert(self) -> Self {
        match self {
            Self::Low => Self::High,
            Self::High => Self::Low,
            Self::Unknown => Self::Unknown,
        }
    }
    fn and(self, other: Self) -> Self {
        if self == Self::Low || other == Self::Low {
            Self::Low
        } else if self == Self::High && other == Self::High {
            Self::High
        } else {
            Self::Unknown
        }
    }
    fn or(self, other: Self) -> Self {
        if self == Self::High || other == Self::High {
            Self::High
        } else if self == Self::Low && other == Self::Low {
            Self::Low
        } else {
            Self::Unknown
        }
    }
    fn xor(self, other: Self) -> Self {
        match (self, other) {
            (Self::Low, Self::Low) | (Self::High, Self::High) => Self::Low,
            (Self::Low, Self::High) | (Self::High, Self::Low) => Self::High,
            _ => Self::Unknown,
        }
    }
}

fn deserialize_f64_default<'de, D>(deserializer: D) -> Result<f64, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let opt = Option::<serde_json::Value>::deserialize(deserializer)?;
    match opt {
        Some(serde_json::Value::Number(n)) => Ok(n.as_f64().unwrap_or(0.0)),
        Some(serde_json::Value::String(s)) => Ok(s.parse::<f64>().unwrap_or(0.0)),
        _ => Ok(0.0),
    }
}

fn default_version() -> u32 {
    1
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Part {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub kind: String,
    #[serde(default, deserialize_with = "deserialize_f64_default")]
    pub x: f64,
    #[serde(default, deserialize_with = "deserialize_f64_default")]
    pub y: f64,
    #[serde(default, deserialize_with = "deserialize_f64_default")]
    pub rotation: f64,
    #[serde(default)]
    pub label: String,
    #[serde(default)]
    pub properties: serde_json::Value,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Wire {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub from: String,
    #[serde(default)]
    pub to: String,
    #[serde(default)]
    pub color: String,
    #[serde(default)]
    pub hidden: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub bends: Option<Vec<WirePoint>>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct WirePoint {
    #[serde(default, deserialize_with = "deserialize_f64_default")]
    pub x: f64,
    #[serde(default, deserialize_with = "deserialize_f64_default")]
    pub y: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Project {
    #[serde(default = "default_version")]
    pub version: u32,
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub parts: Vec<Part>,
    #[serde(default)]
    pub wires: Vec<Wire>,
}

impl Default for Project {
    fn default() -> Self {
        Self {
            version: 1,
            id: String::new(),
            name: String::new(),
            parts: Vec::new(),
            wires: Vec::new(),
        }
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Runtime {
    pub clock_high: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub phase: Option<f64>,
    #[serde(default)]
    pub buttons: HashMap<String, bool>,
    #[serde(default)]
    pub q: HashMap<String, Level>,
    #[serde(default)]
    pub prev_clock: HashMap<String, Level>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Simulation {
    pub levels: HashMap<String, Level>,
    pub leds: HashMap<String, Level>,
    pub q: HashMap<String, Level>,
    pub prev_clock: HashMap<String, Level>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StepResult {
    pub simulation: Simulation,
    pub runtime: Runtime,
}

fn canonical_pin_name<'a>(kind: &str, pin: &'a str) -> &'a str {
    match (kind, pin) {
        ("jk74hc73", "J1") => "J 1",
        ("jk74hc73", "NQ1") => "Saída invertida 1",
        ("jk74hc73", "Q1") => "Saída 1",
        ("jk74hc73", "GND") => "Solo",
        ("jk74hc73", "K2") => "K 2",
        ("jk74hc73", "Q2") => "Saída 2",
        ("jk74hc73", "NQ2") => "Saída invertida 2",
        ("jk74hc73", "CLK1") => "Relógio 1",
        ("jk74hc73", "CLR1") => "Redefinir 1",
        ("jk74hc73", "K1") => "K 1",
        ("jk74hc73", "VCC") => "Potência",
        ("jk74hc73", "CLK2") => "Relógio 2",
        ("jk74hc73", "CLR2") => "Redefinir 2",
        ("jk74hc73", "J2") => "J 2",
        ("nand74hc00", "VCC") => "Potência",
        ("nand74hc00", "B4") => "Entrada 4B",
        ("nand74hc00", "A4") => "Entrada 4A",
        ("nand74hc00", "Y4") => "Saída 4",
        ("nand74hc00", "B3") => "Entrada 3B",
        ("nand74hc00", "A3") => "Entrada 3A",
        ("nand74hc00", "Y3") => "Saída 3",
        ("nand74hc00", "A1") => "Entrada 1A",
        ("nand74hc00", "B1") => "Entrada 1B",
        ("nand74hc00", "Y1") => "Saída 1",
        ("nand74hc00", "A2") => "Entrada 2A",
        ("nand74hc00", "B2") => "Entrada 2B",
        ("nand74hc00", "Y2") => "Saída 2",
        ("nand74hc00", "GND") => "Solo",
        _ => pin,
    }
}

fn canonical_endpoint(endpoint: &str, kinds: &HashMap<String, String>) -> String {
    let Some((part_id, pin)) = endpoint.split_once(':') else {
        return endpoint.to_string();
    };
    let Some(kind) = kinds.get(part_id) else {
        return endpoint.to_string();
    };
    format!("{}:{}", part_id, canonical_pin_name(kind, pin))
}

fn pins(kind: &str) -> Vec<String> {
    match kind {
        "vcc" | "gnd" | "clock" => vec!["OUT".into()],
        "button" => vec![
            "A1".into(),
            "A2".into(),
            "B1".into(),
            "B2".into(),
            "OUT".into(),
        ],
        "generator" => vec!["OUT".into(), "GND".into()],
        "supply" => vec!["PLUS".into(), "MINUS".into()],
        "resistor" => vec!["A".into(), "B".into()],
        "led" => vec!["A".into(), "K".into()],
        "not" => vec!["A".into(), "Y".into()],
        "and" | "or" | "nand" | "nor" | "xor" => vec!["A".into(), "B".into(), "Y".into()],
        "dff7474" => [
            "D1", "CLK1", "PRE1", "CLR1", "Q1", "NQ1", "D2", "CLK2", "PRE2", "CLR2", "Q2", "NQ2",
            "VCC", "GND",
        ]
        .map(String::from)
        .to_vec(),
        "jk74hc73" => [
            "J1", "K1", "CLK1", "CLR1", "Q1", "NQ1", "J2", "K2", "CLK2", "CLR2", "Q2", "NQ2",
            "VCC", "GND",
        ]
        .map(|pin| canonical_pin_name(kind, pin).to_string())
        .to_vec(),
        "nand74hc00" => [
            "A1", "B1", "Y1", "A2", "B2", "Y2", "A3", "B3", "Y3", "A4", "B4", "Y4", "VCC", "GND",
        ]
        .map(|pin| canonical_pin_name(kind, pin).to_string())
        .to_vec(),
        _ => vec![],
    }
}

fn terminal(part: &Part, pin: &str) -> String {
    format!("{}:{pin}", part.id)
}
fn canonical(id: &str) -> String {
    let bits: Vec<_> = id.split(':').collect();
    if bits.first() != Some(&"board") {
        return id.to_string();
    }
    if bits.get(2) == Some(&"row") {
        bits.iter().take(5).copied().collect::<Vec<_>>().join(":")
    } else {
        bits.iter().take(3).copied().collect::<Vec<_>>().join(":")
    }
}

#[derive(Default)]
struct Nets {
    parent: HashMap<String, String>,
}
impl Nets {
    fn add(&mut self, id: &str) -> String {
        let key = canonical(id);
        self.parent.entry(key.clone()).or_insert(key.clone());
        key
    }
    fn root(&self, id: &str) -> String {
        let mut key = canonical(id);
        while let Some(parent) = self.parent.get(&key) {
            if parent == &key {
                break;
            }
            key = parent.clone();
        }
        key
    }
    fn join(&mut self, a: &str, b: &str) {
        self.add(a);
        self.add(b);
        let ra = self.root(a);
        let rb = self.root(b);
        if ra != rb {
            self.parent.insert(rb, ra);
        }
    }
    fn level(&self, values: &HashMap<String, Level>, id: &str) -> Level {
        values
            .get(&self.root(id))
            .copied()
            .unwrap_or(Level::Unknown)
    }
}

fn drive(nets: &Nets, drivers: &mut HashMap<String, Vec<Level>>, id: String, level: Level) {
    drivers.entry(nets.root(&id)).or_default().push(level);
}

fn settle(project: &Project, runtime: &Runtime, nets: &Nets) -> HashMap<String, Level> {
    let mut values = HashMap::new();
    for _ in 0..32 {
        let mut drivers: HashMap<String, Vec<Level>> = HashMap::new();
        for part in &project.parts {
            let p = |name: &str| terminal(part, canonical_pin_name(&part.kind, name));
            let read = |name: &str| nets.level(&values, &p(name));
            match part.kind.as_str() {
                "vcc" => drive(
                    nets,
                    &mut drivers,
                    p("OUT"),
                    if part
                        .properties
                        .get("voltage")
                        .and_then(|v| v.as_f64())
                        .unwrap_or(5.0)
                        >= 2.5
                    {
                        Level::High
                    } else {
                        Level::Low
                    },
                ),
                "gnd" => drive(nets, &mut drivers, p("OUT"), Level::Low),
                "button" => drive(
                    nets,
                    &mut drivers,
                    p("OUT"),
                    if *runtime.buttons.get(&part.id).unwrap_or(&false) {
                        Level::High
                    } else {
                        Level::Low
                    },
                ),
                "clock" => drive(
                    nets,
                    &mut drivers,
                    p("OUT"),
                    if runtime.clock_high {
                        Level::High
                    } else {
                        Level::Low
                    },
                ),
                "generator" => {
                    drive(nets, &mut drivers, p("GND"), Level::Low);
                    let amplitude = part
                        .properties
                        .get("amplitude")
                        .and_then(|v| v.as_f64())
                        .unwrap_or(5.0)
                        .max(0.0);
                    let offset = part
                        .properties
                        .get("offset")
                        .and_then(|v| v.as_f64())
                        .unwrap_or(2.5);
                    let phase =
                        runtime
                            .phase
                            .unwrap_or(if runtime.clock_high { 0.25 } else { 0.75 });
                    let shape = match part
                        .properties
                        .get("waveform")
                        .and_then(|v| v.as_str())
                        .unwrap_or("square")
                    {
                        "sine" => (std::f64::consts::TAU * phase).sin(),
                        "triangle" => 1.0 - 4.0 * ((phase + 0.25).rem_euclid(1.0) - 0.5).abs(),
                        _ => {
                            if phase < 0.5 {
                                1.0
                            } else {
                                -1.0
                            }
                        }
                    };
                    let voltage = offset + amplitude * shape / 2.0;
                    drive(
                        nets,
                        &mut drivers,
                        p("OUT"),
                        if voltage >= 2.5 {
                            Level::High
                        } else {
                            Level::Low
                        },
                    );
                }
                "supply" => {
                    let voltage = part
                        .properties
                        .get("voltage")
                        .and_then(|v| v.as_f64())
                        .unwrap_or(5.0);
                    drive(
                        nets,
                        &mut drivers,
                        p("PLUS"),
                        if voltage >= 2.5 {
                            Level::High
                        } else {
                            Level::Low
                        },
                    );
                    drive(nets, &mut drivers, p("MINUS"), Level::Low);
                }
                "not" => drive(nets, &mut drivers, p("Y"), read("A").invert()),
                "and" => drive(nets, &mut drivers, p("Y"), read("A").and(read("B"))),
                "or" => drive(nets, &mut drivers, p("Y"), read("A").or(read("B"))),
                "nand" => drive(
                    nets,
                    &mut drivers,
                    p("Y"),
                    read("A").and(read("B")).invert(),
                ),
                "nor" => drive(nets, &mut drivers, p("Y"), read("A").or(read("B")).invert()),
                "xor" => drive(nets, &mut drivers, p("Y"), read("A").xor(read("B"))),
                "nand74hc00" => {
                    let powered = read("VCC") == Level::High && read("GND") == Level::Low;
                    for n in 1..=4 {
                        let output = if powered {
                            read(&format!("A{n}")).and(read(&format!("B{n}"))).invert()
                        } else {
                            Level::Unknown
                        };
                        drive(nets, &mut drivers, p(&format!("Y{n}")), output);
                    }
                }
                "dff7474" | "jk74hc73" => {
                    let powered = read("VCC") == Level::High && read("GND") == Level::Low;
                    for n in 1..=2 {
                        let q = if powered {
                            runtime
                                .q
                                .get(&format!("{}:{n}", part.id))
                                .copied()
                                .unwrap_or(Level::Unknown)
                        } else {
                            Level::Unknown
                        };
                        drive(nets, &mut drivers, p(&format!("Q{n}")), q);
                        drive(nets, &mut drivers, p(&format!("NQ{n}")), q.invert());
                    }
                }
                _ => {}
            }
        }
        let mut next = HashMap::new();
        let roots: HashSet<_> = nets.parent.keys().map(|key| nets.root(key)).collect();
        for root in roots {
            let concrete: Vec<_> = drivers
                .get(&root)
                .into_iter()
                .flatten()
                .filter(|v| **v != Level::Unknown)
                .copied()
                .collect();
            let value = if concrete.is_empty() {
                Level::Unknown
            } else if concrete.iter().all(|v| *v == concrete[0]) {
                concrete[0]
            } else {
                Level::Unknown
            };
            next.insert(root, value);
        }
        if next == values {
            return next;
        }
        values = next;
    }
    values
}

pub fn simulate_step(project: &Project, mut runtime: Runtime, advance_clock: bool) -> StepResult {
    if advance_clock {
        runtime.clock_high = !runtime.clock_high;
        runtime.phase = runtime.phase.map(|phase| (phase + 0.5).rem_euclid(1.0));
    }
    let mut nets = Nets::default();
    let part_kinds: HashMap<String, String> = project
        .parts
        .iter()
        .map(|part| (part.id.clone(), part.kind.clone()))
        .collect();
    for part in &project.parts {
        for pin in pins(&part.kind) {
            nets.add(&terminal(part, &pin));
        }
    }
    for wire in &project.wires {
        let from = canonical_endpoint(&wire.from, &part_kinds);
        let to = canonical_endpoint(&wire.to, &part_kinds);
        nets.join(&from, &to);
    }
    for part in &project.parts {
        if part.kind == "resistor" {
            nets.join(&terminal(part, "A"), &terminal(part, "B"));
        }
        if part.kind == "button" {
            nets.join(&terminal(part, "A1"), &terminal(part, "A2"));
            nets.join(&terminal(part, "B1"), &terminal(part, "B2"));
            if *runtime.buttons.get(&part.id).unwrap_or(&false) {
                nets.join(&terminal(part, "A1"), &terminal(part, "B1"));
            }
        }
    }
    let mut values = settle(project, &runtime, &nets);
    for _ in 0..16 {
        let mut changed = false;
        for part in &project.parts {
            if part.kind != "dff7474" && part.kind != "jk74hc73" {
                continue;
            }
            let read = |pin: &str| {
                nets.level(
                    &values,
                    &terminal(part, canonical_pin_name(&part.kind, pin)),
                )
            };
            let powered = read("VCC") == Level::High && read("GND") == Level::Low;
            for n in 1..=2 {
                let key = format!("{}:{n}", part.id);
                let clk = read(&format!("CLK{n}"));
                let pre = if part.kind == "jk74hc73" {
                    Level::High
                } else {
                    read(&format!("PRE{n}"))
                };
                let clr = read(&format!("CLR{n}"));
                let mut next = runtime.q.get(&key).copied().unwrap_or(Level::Unknown);
                if !powered || (pre == Level::Low && clr == Level::Low) {
                    next = Level::Unknown;
                } else if pre == Level::Low && clr == Level::High {
                    next = Level::High;
                } else if clr == Level::Low && pre == Level::High {
                    next = Level::Low;
                } else if pre == Level::High && clr == Level::High {
                    let prev = runtime
                        .prev_clock
                        .get(&key)
                        .copied()
                        .unwrap_or(Level::Unknown);
                    let edge = if part.kind == "jk74hc73" {
                        prev == Level::High && clk == Level::Low
                    } else {
                        prev == Level::Low && clk == Level::High
                    };
                    if edge && part.kind == "dff7474" {
                        next = read(&format!("D{n}"));
                    }
                    if edge && part.kind == "jk74hc73" {
                        let j = read(&format!("J{n}"));
                        let k = read(&format!("K{n}"));
                        next = match (j, k) {
                            (Level::Low, Level::Low) => next,
                            (Level::Low, Level::High) => Level::Low,
                            (Level::High, Level::Low) => Level::High,
                            (Level::High, Level::High) => next.invert(),
                            _ => Level::Unknown,
                        };
                    }
                }
                if runtime.q.get(&key).copied() != Some(next) {
                    runtime.q.insert(key.clone(), next);
                    changed = true;
                }
                runtime.prev_clock.insert(key, clk);
            }
        }
        if !changed {
            break;
        }
        values = settle(project, &runtime, &nets);
    }
    values = settle(project, &runtime, &nets);
    let mut levels = HashMap::new();
    for part in &project.parts {
        for pin in pins(&part.kind) {
            let id = terminal(part, &pin);
            levels.insert(id.clone(), nets.level(&values, &id));
        }
    }
    for wire in &project.wires {
        let from = canonical_endpoint(&wire.from, &part_kinds);
        let to = canonical_endpoint(&wire.to, &part_kinds);
        levels.insert(from.clone(), nets.level(&values, &from));
        levels.insert(to.clone(), nets.level(&values, &to));
    }
    let mut leds = HashMap::new();
    for part in &project.parts {
        if part.kind != "led" {
            continue;
        }
        let a = nets.level(&values, &terminal(part, "A"));
        let k = nets.level(&values, &terminal(part, "K"));
        let result = if a == Level::High && k == Level::Low {
            Level::High
        } else if a == Level::Unknown || k == Level::Unknown {
            Level::Unknown
        } else {
            Level::Low
        };
        leds.insert(part.id.clone(), result);
    }
    StepResult {
        simulation: Simulation {
            levels,
            leds,
            q: runtime.q.clone(),
            prev_clock: runtime.prev_clock.clone(),
        },
        runtime,
    }
}
