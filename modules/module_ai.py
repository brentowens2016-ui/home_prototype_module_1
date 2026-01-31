"""
Module 2: Predictive AI Logic

This module contains all endpoints and logic for predictive AI features, including lighting schedule and automation. It is designed to be self-contained and independently runnable.

Endpoints:
- /predictive/lighting-schedule: Get predictive lighting schedule
- /predictive/run-lighting: Run predictive lighting automation

Dependencies:
- python_wrapper.predictive_ai
- fastapi, typing
"""

from fastapi import Request
from python_wrapper.predictive_ai import get_occupancy_schedule, run_predictive_lighting

def predictive_lighting_schedule():
	"""Endpoint: Get predictive lighting schedule (predictive AI)"""
	return get_occupancy_schedule()

def run_predictive_lighting_endpoint():
	"""Endpoint: Run predictive lighting automation (simulate occupancy)"""
	result = run_predictive_lighting()
	return {"status": "ok", "result": result}
"""
Module: AI (Module 2)
Purpose: Contains all logic, endpoints, and utilities for regenerative/learning AI, including scenario/event training, diagnostics, and adaptive routines for the Home Prototype system.
Dependencies: predictive_ai.py, scenario_input.py, event_chain_manager.py, event_template.json
Integration: FastAPI router, REST endpoints, dashboard integration, standalone CLI tools for training and diagnostics.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os
import json
from python_wrapper.predictive_ai import get_occupancy_schedule, run_predictive_lighting

app = FastAPI(
	title="Home Prototype AI Module",
	description="Predictive AI, scenario/event training, and diagnostics.",
	version="1.0.0",
	docs_url="/docs",
	redoc_url="/redoc"
)

# --- Predictive Lighting Endpoints ---
@app.get("/predictive/lighting-schedule")
def predictive_lighting_schedule():
	return get_occupancy_schedule()

@app.post("/predictive/run-lighting")
def run_predictive_lighting_endpoint():
	result = run_predictive_lighting()
	return {"status": "ok", "result": result}

# --- Scenario/Event Input and Training (CLI tools) ---
# scenario_input.py and event_chain_manager.py are CLI tools for interactive training and event chain management.
# See their docstrings for usage. They import and use ai_module from predictive_ai.py.

# --- Documentation ---
# - predictive_ai.py: Core AI logic, event handling, adaptive suggestions, diagnostics
# - scenario_input.py: CLI for adding/training events and scenarios
# - event_chain_manager.py: CLI for managing event chains (sequences)
# - event_template.json: Template for new events/scenarios

# To extend: Add more REST endpoints for AI diagnostics, scenario upload, or training as needed.
