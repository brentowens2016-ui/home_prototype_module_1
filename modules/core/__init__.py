"""
Core module package for Home Prototype.
This package contains all core backend logic, endpoints, and utilities.
"""

from fastapi import FastAPI
from .static import static_router
from .privacy import privacy_router
from .export_import import export_import_router
from .feedback import feedback_router
from .device_health import device_health_router
from .login import login_router
from .ip_enforcement import ip_enforcement_middleware, ip_history_router
from .notifications import notifications_router
from .email import email_router
from .mapping import mapping_router

app = FastAPI()

# Include routers
app.include_router(static_router)
app.include_router(privacy_router)
app.include_router(export_import_router)
app.include_router(feedback_router)
app.include_router(device_health_router)
app.include_router(login_router)
app.include_router(ip_history_router)
app.include_router(notifications_router)
app.include_router(email_router)
app.include_router(mapping_router)

# Add middleware
app.middleware('http')(ip_enforcement_middleware)
