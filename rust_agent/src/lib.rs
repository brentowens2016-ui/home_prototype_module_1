use pyo3::prelude::*;

#[pyfunction]
fn agent_logic(input: &str, ai_role: Option<&str>) -> PyResult<String> {
    // Role-based AI logic
    match ai_role {
        Some("system_admin") => Ok(format!("[System Admin] Agent received: {}", input)),
        Some("remote_agent") => Ok(format!("[Remote Agent] Agent received: {}", input)),
        Some("user_admin") | _ => Ok(format!("[User Admin] Agent received: {}", input)),
    }
}

#[pymodule]
fn rust_agent(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(agent_logic, m)?)?;
    Ok(())
}
