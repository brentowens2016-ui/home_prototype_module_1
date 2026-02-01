// Rust struct for dashboard contract (agent FFI)
use pyo3::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct FeatureContract {
    pub name: String,
    pub tier: String,
    pub enabled: bool,
    pub controls: Vec<Control>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Control {
    pub control_type: String,
    pub label: String,
    // Add more fields as needed
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DashboardContract {
    pub user_tier: String,
    pub features: Vec<FeatureContract>,
}
