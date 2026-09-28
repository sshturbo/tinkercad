use circuitlab_engine::{simulate_step, Level, Part, Project, Runtime, Wire};
use std::collections::HashMap;

fn part(id: &str, kind: &str) -> Part {
    Part {
        id: id.into(),
        kind: kind.into(),
        x: 0.0,
        y: 0.0,
        rotation: 0.0,
        label: id.into(),
        properties: serde_json::Value::Null,
    }
}
fn wire(from: &str, to: &str) -> Wire {
    Wire {
        id: format!("{from}-{to}"),
        from: from.into(),
        to: to.into(),
        color: "red".into(),
        hidden: false,
        bends: None,
    }
}
fn project(parts: Vec<Part>, wires: Vec<Wire>) -> Project {
    Project {
        version: 1,
        id: "test".into(),
        name: "test".into(),
        parts,
        wires,
    }
}
fn counter() -> Project {
    let mut wires = vec![
        wire("v:PLUS", "a:Potência"),
        wire("v:MINUS", "a:Solo"),
        wire("v:PLUS", "b:Potência"),
        wire("v:MINUS", "b:Solo"),
        wire("gen:OUT", "a:Relógio 1"),
    ];
    for chip in ["a", "b"] {
        for n in 1..=2 {
            wires.push(wire("v:PLUS", &format!("{chip}:J {n}")));
            wires.push(wire("v:PLUS", &format!("{chip}:K {n}")));
            wires.push(wire("v:PLUS", &format!("{chip}:Redefinir {n}")));
        }
    }
    wires.extend([
        wire("a:Saída 1", "a:Relógio 2"),
        wire("a:Saída 2", "b:Relógio 1"),
        wire("b:Saída 1", "b:Relógio 2"),
    ]);
    project(
        vec![
            part("v", "supply"),
            part("gen", "generator"),
            part("a", "jk74hc73"),
            part("b", "jk74hc73"),
        ],
        wires,
    )
}
fn runtime_zeroed() -> Runtime {
    let mut q = HashMap::new();
    for chip in ["a", "b"] {
        for n in 1..=2 {
            q.insert(format!("{chip}:{n}"), Level::Low);
        }
    }
    Runtime {
        q,
        ..Default::default()
    }
}

#[test]
fn new_supply_resistor_led_circuit_works_with_wires_and_direct_contacts() {
    for hidden in [false, true] {
        let mut contact = wire("r:A", "d:A");
        contact.hidden = hidden;
        contact.id = "contact:resistor-led".into();
        let mut circuit = project(
            vec![part("s", "supply"), part("r", "resistor"), part("d", "led")],
            vec![wire("s:PLUS", "r:B"), contact, wire("d:K", "s:MINUS")],
        );
        assert_eq!(
            simulate_step(&circuit, Runtime::default(), false)
                .simulation
                .leds["d"],
            Level::High
        );
        let json = serde_json::to_string(&circuit).unwrap();
        let loaded: Project = serde_json::from_str(&json).unwrap();
        assert_eq!(loaded.wires[1].hidden, hidden);
        assert_eq!(
            simulate_step(&loaded, Runtime::default(), false)
                .simulation
                .leds["d"],
            Level::High
        );
        circuit.wires.remove(1);
        assert_ne!(
            simulate_step(&circuit, Runtime::default(), false)
                .simulation
                .leds["d"],
            Level::High
        );
    }
}

#[test]
fn tactile_button_closes_contacts_while_pressed() {
    let circuit = project(
        vec![
            part("v", "vcc"),
            part("g", "gnd"),
            part("b", "button"),
            part("d", "led"),
        ],
        vec![
            wire("v:OUT", "b:A1"),
            wire("b:B1", "d:A"),
            wire("g:OUT", "d:K"),
        ],
    );
    let released = simulate_step(&circuit, Runtime::default(), false);
    assert_ne!(released.simulation.leds["d"], Level::High);
    let mut pressed = released.runtime;
    pressed.buttons.insert("b".into(), true);
    let closed = simulate_step(&circuit, pressed, false);
    assert_eq!(closed.simulation.leds["d"], Level::High);
}

#[test]
fn generator_settings_change_its_digital_output() {
    let mut generator = part("gen", "generator");
    generator.properties = serde_json::json!({"amplitude": 5.0, "offset": 2.5, "waveform": "sine"});
    let circuit = project(vec![generator], vec![]);
    let high = simulate_step(
        &circuit,
        Runtime {
            phase: Some(0.25),
            ..Default::default()
        },
        false,
    );
    assert_eq!(high.simulation.levels["gen:OUT"], Level::High);
    let low = simulate_step(
        &circuit,
        Runtime {
            phase: Some(0.75),
            ..Default::default()
        },
        false,
    );
    assert_eq!(low.simulation.levels["gen:OUT"], Level::Low);
}

#[test]
fn nand_74hc00_truth_table() {
    let p = project(
        vec![
            part("v", "supply"),
            part("a", "button"),
            part("b", "button"),
            part("u", "nand74hc00"),
        ],
        vec![
            wire("v:PLUS", "u:Potência"),
            wire("v:MINUS", "u:Solo"),
            wire("a:OUT", "u:Entrada 1A"),
            wire("b:OUT", "u:Entrada 1B"),
        ],
    );
    for (a, b, expected) in [
        (false, false, Level::High),
        (false, true, Level::High),
        (true, false, Level::High),
        (true, true, Level::Low),
    ] {
        let mut runtime = Runtime::default();
        runtime.buttons.insert("a".into(), a);
        runtime.buttons.insert("b".into(), b);
        assert_eq!(
            simulate_step(&p, runtime, false).simulation.levels["u:Saída 1"],
            expected
        );
    }
}

#[test]
fn jk_modes_on_falling_edge() {
    let p = project(
        vec![
            part("v", "supply"),
            part("gen", "generator"),
            part("j", "button"),
            part("k", "button"),
            part("a", "jk74hc73"),
        ],
        vec![
            wire("v:PLUS", "a:Potência"),
            wire("v:MINUS", "a:Solo"),
            wire("v:PLUS", "a:Redefinir 1"),
            wire("gen:OUT", "a:Relógio 1"),
            wire("j:OUT", "a:J 1"),
            wire("k:OUT", "a:K 1"),
        ],
    );
    let mut runtime = Runtime::default();
    runtime.q.insert("a:1".into(), Level::Low);
    runtime = simulate_step(&p, runtime, false).runtime;
    for (j, k, expected) in [
        (false, false, Level::Low),
        (true, false, Level::High),
        (false, false, Level::High),
        (false, true, Level::Low),
        (true, true, Level::High),
        (true, true, Level::Low),
    ] {
        runtime.buttons.insert("j".into(), j);
        runtime.buttons.insert("k".into(), k);
        runtime = simulate_step(&p, runtime, true).runtime;
        runtime = simulate_step(&p, runtime, true).runtime;
        assert_eq!(runtime.q["a:1"], expected, "J={j} K={k}");
    }
}

#[test]
fn legacy_chip_endpoint_aliases_still_simulate_and_report_canonical_names() {
    let p = project(
        vec![
            part("v", "supply"),
            part("a", "button"),
            part("b", "button"),
            part("u", "nand74hc00"),
        ],
        vec![
            wire("v:PLUS", "u:VCC"),
            wire("v:MINUS", "u:GND"),
            wire("a:OUT", "u:A1"),
            wire("b:OUT", "u:B1"),
        ],
    );
    let result = simulate_step(&p, Runtime::default(), false);
    assert_eq!(result.simulation.levels["u:Saída 1"], Level::High);
    assert!(!result.simulation.levels.contains_key("u:Y1"));
    assert!(!result.simulation.levels.contains_key("u:A1"));
}

#[test]
fn ripple_counter_covers_zero_to_fifteen_and_wraps() {
    let p = counter();
    let mut runtime = simulate_step(&p, runtime_zeroed(), false).runtime;
    for expected in 1..=16 {
        runtime = simulate_step(&p, runtime, true).runtime;
        runtime = simulate_step(&p, runtime, true).runtime;
        let bits = ["a:1", "a:2", "b:1", "b:2"];
        let count: usize = bits
            .iter()
            .enumerate()
            .map(|(index, bit)| {
                if runtime.q[*bit] == Level::High {
                    1 << index
                } else {
                    0
                }
            })
            .sum();
        assert_eq!(count, expected % 16, "clock cycle {expected}");
    }
}

#[test]
fn project_deserialization_tolerant_to_missing_or_null_coordinates() {
    let json_missing_x = r#"{
        "version": 1,
        "id": "test-missing-x",
        "name": "Missing X",
        "parts": [
            { "id": "p1", "kind": "supply" },
            { "id": "led1", "kind": "led", "y": 100 }
        ],
        "wires": [
            { "id": "w1", "from": "p1:PLUS", "to": "led1:A", "bends": [{ "y": 50 }] },
            { "id": "w2", "from": "p1:MINUS", "to": "led1:K" }
        ]
    }"#;
    let proj: Project = serde_json::from_str(json_missing_x).expect("should deserialize even when x is missing");
    assert_eq!(proj.parts[0].x, 0.0);
    assert_eq!(proj.parts[1].x, 0.0);
    assert_eq!(proj.parts[1].y, 100.0);
    assert_eq!(proj.wires[0].bends.as_ref().unwrap()[0].x, 0.0);
    assert_eq!(proj.wires[0].bends.as_ref().unwrap()[0].y, 50.0);

    let json_null_x = r#"{
        "parts": [
            { "id": "led1", "kind": "led", "x": null, "y": null, "rotation": null }
        ],
        "wires": []
    }"#;
    let proj2: Project = serde_json::from_str(json_null_x).expect("should deserialize even when x is null");
    assert_eq!(proj2.parts[0].x, 0.0);
    assert_eq!(proj2.parts[0].y, 0.0);
    assert_eq!(proj2.parts[0].rotation, 0.0);

    // Simulate the project with missing coordinates - LED should light up!
    let res = simulate_step(&proj, Runtime::default(), false);
    assert_eq!(res.simulation.leds.get("led1"), Some(&Level::High));
}

