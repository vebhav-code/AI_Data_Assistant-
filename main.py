from fastapi import FastAPI, Body, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
import requests
import mysql.connector

# ================= APP =================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (CSS, JS, Assets)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ROUTES FOR HTML PAGES
@app.get("/")
async def get_root():
    return FileResponse("templates/login.html")

@app.get("/login")
async def get_login():
    return FileResponse("templates/login.html")

@app.get("/signup")
async def get_signup():
    return FileResponse("templates/signup.html")

@app.get("/connect")
async def get_connect():
    return FileResponse("templates/connect.html")

@app.get("/dbconnect")
async def get_dbconnect():
    return FileResponse("templates/dbconnect.html")

@app.get("/app")
async def get_app():
    return FileResponse("templates/index.html")



# ================= MYSQL CONNECTION =================

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Vebhav@123",   # change this
    database="ai_app"
)

cursor = db.cursor()

# ================= REPORT FOLDER =================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPORT_DIR = os.path.join(BASE_DIR, "reports")
os.makedirs(REPORT_DIR, exist_ok=True)

# ================= OLLAMA CONFIG =================

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5:3b-instruct"

# ================= AI QUERY =================

@app.post("/ask")
async def ask_ai(data: dict = Body(...)):
    prompt = data["query"]

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False
        }
    )

    return {"answer": response.json()["response"]}

# ================= SAVE REPORT =================

@app.post("/save-report")
async def save_report(data: dict = Body(...)):
    content = data["content"]

    filename = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    filepath = os.path.join(REPORT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return {"file": filename}

# ================= SIGNUP =================

@app.post("/signup")
async def signup(data: dict = Body(...)):
    name = data["name"]
    email = data["email"]
    password = data["password"]

    cursor.execute(
        "INSERT INTO users (name,email,password) VALUES (%s,%s,%s)",
        (name, email, password)
    )
    db.commit()

    return {"status": "account created"}

# ================= LOGIN =================

@app.post("/login")
async def login(data: dict = Body(...)):
    email = data["email"]
    password = data["password"]

    cursor.execute(
        "SELECT id FROM users WHERE email=%s AND password=%s",
        (email, password)
    )

    user = cursor.fetchone()

    if user:
        return {"status": "success"}
    else:
        return {"status": "invalid"}