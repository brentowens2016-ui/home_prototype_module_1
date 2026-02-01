from fastapi import FastAPI, Response
import os

app = FastAPI()

FRONTEND_PATH = os.path.join(os.path.dirname(__file__), '..', 'frontend')
UNDER_CONSTRUCTION_FILE = os.path.join(FRONTEND_PATH, 'under-construction.html')

def get_under_construction_html():
    with open(UNDER_CONSTRUCTION_FILE, encoding='utf-8') as f:
        return f.read()

@app.get("/{full_path:path}")
def under_construction(full_path: str):
    html = get_under_construction_html()
    return Response(content=html, media_type="text/html")
