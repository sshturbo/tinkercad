use circuitlab_engine::{Project, Runtime, StepResult};
use rusqlite::{params, Connection};
use serde::Serialize;
use std::{
    fs,
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::Manager;

fn database(app: &tauri::AppHandle) -> Result<Connection, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let connection = Connection::open(dir.join("projects.db")).map_err(|e| e.to_string())?;
    connection.execute_batch("CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, document TEXT NOT NULL, updated_at INTEGER NOT NULL);")
        .map_err(|e| e.to_string())?;
    Ok(connection)
}

#[tauri::command]
fn simulate_step(project: Project, runtime: Runtime, advance_clock: bool) -> StepResult {
    circuitlab_engine::simulate_step(&project, runtime, advance_clock)
}

#[tauri::command]
fn save_project(app: tauri::AppHandle, project: Project) -> Result<(), String> {
    if project.version != 1 {
        return Err("Versão de projeto incompatível".into());
    }
    let json = serde_json::to_string(&project).map_err(|e| e.to_string())?;
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis() as i64;
    database(&app)?.execute("INSERT INTO projects (id,name,document,updated_at) VALUES (?1,?2,?3,?4) ON CONFLICT(id) DO UPDATE SET name=excluded.name,document=excluded.document,updated_at=excluded.updated_at",
        params![project.id, project.name, json, now]).map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Serialize)]
struct ProjectSummary {
    id: String,
    name: String,
    updated_at: i64,
}

#[tauri::command]
fn list_projects(app: tauri::AppHandle) -> Result<Vec<ProjectSummary>, String> {
    let db = database(&app)?;
    let mut query = db
        .prepare("SELECT id,name,updated_at FROM projects ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;
    let rows = query
        .query_map([], |row| {
            Ok(ProjectSummary {
                id: row.get(0)?,
                name: row.get(1)?,
                updated_at: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn load_project(app: tauri::AppHandle, id: String) -> Result<Project, String> {
    let db = database(&app)?;
    let json: String = db
        .query_row("SELECT document FROM projects WHERE id=?1", [id], |row| {
            row.get(0)
        })
        .map_err(|e| e.to_string())?;
    serde_json::from_str(&json).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            simulate_step,
            save_project,
            list_projects,
            load_project
        ])
        .run(tauri::generate_context!())
        .expect("Falha ao iniciar CircuitLab Offline");
}
