from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from search_jobs import scrape_linkedin_jobs
from read_email import get_dashboard_emails

app = FastAPI(title="Local Personal Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ],  # Explicitly allow your React dev server URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DB_FILE = "assistant.db"

def init_db():
    """Creates the local database tables for both emails and jobs if they don't exist."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Existing Email Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS emails (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT,
            subject TEXT,
            summary TEXT,
            action TEXT,
            fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # NEW: Job Tracking Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role_input TEXT,
            title TEXT,
            company TEXT,
            location TEXT,
            link TEXT,
            ai_analysis TEXT,
            fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize immediately on boot
init_db()



@app.get("/")
def home():
    return {"status": "Online", "message": "Welcome to your local AI assistant API backend!"}

@app.get("/api/emails")
def fetch_emails_endpoint():
    """
    1. Fetches new unread emails from Gmail & processes them with Qwen.
    2. Saves new items permanently to the local database.
    3. Returns ALL stored emails to your React frontend.
    """
    # Step A: Fetch any new unread emails from the inbox wrapper
    new_emails = get_dashboard_emails()
    
    # Step B: Connect to the database and save them if new emails exist
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    for email_item in new_emails:
        # Check if we already saved this exact sender + subject combo to avoid duplicates
        cursor.execute(
            "SELECT id FROM emails WHERE sender = ? AND subject = ?", 
            (email_item["from"], email_item["subject"])
        )
        exists = cursor.fetchone()
        
        if not exists:
            # Save the email values to our database table rows
            cursor.execute(
                "INSERT INTO emails (sender, subject, summary, action) VALUES (?, ?, ?, ?)",
                (email_item["from"], email_item["subject"], email_item["summary"], email_item["action"])
            )
    
    conn.commit()
    
    # Step C: Read back all stored emails from oldest to newest to deliver to the UI
    cursor.execute("SELECT id, sender, subject, summary, action FROM emails ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    # Format the data cleanly into JSON items for React
    saved_emails = []
    for row in rows:
        saved_emails.append({
            "id": row[0],
            "from": row[1],
            "subject": row[2],
            "summary": row[3],
            "action": row[4]
        })
        
    return {"count": len(saved_emails), "emails": saved_emails}

@app.delete("/api/emails/{email_id}")
def delete_single_email_endpoint(email_id: int):
    """
    Deletes one specific email row from the database using its primary ID key.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Execute the delete command on the targeting row ID matching the UI button click
        cursor.execute("DELETE FROM emails WHERE id = ?", (email_id,))
        conn.commit()
        conn.close()
        
        return {"status": "Success", "message": f"Email with ID {email_id} deleted successfully."}
    except Exception as e:
        return {"status": "Error", "message": f"Failed to delete email: {str(e)}"}


# Create a simple utility structure to read the raw incoming query text string from the UI
from pydantic import BaseModel

class JobSearchRequest(BaseModel):
    role: str
    location: str = "Remote"

@app.get("/api/jobs")
def get_saved_jobs_endpoint():
    """Returns all locally stored and AI-screened job posts from the database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, role_input, title, company, location, link, ai_analysis FROM jobs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    saved_jobs = []
    for row in rows:
        saved_jobs.append({
            "id": row[0],
            "role_input": row[1],
            "title": row[2],
            "company": row[3],
            "location": row[4],
            "link": row[5],
            "ai_analysis": row[6]
        })
    return {"count": len(saved_jobs), "jobs": saved_jobs}

@app.post("/api/jobs/search")
def search_and_save_jobs_endpoint(payload: JobSearchRequest):
    """
    Triggers the scraper to fetch items from LinkedIn,
    runs them through local Qwen, and commits them to the database.
    """
    # Trigger your newly created scraper logic
    new_jobs = scrape_linkedin_jobs(payload.role, payload.location)
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    for job in new_jobs:
        # Prevent exact duplicates of the same title at the same company
        cursor.execute(
            "SELECT id FROM jobs WHERE title = ? AND company = ?", 
            (job["title"], job["company"])
        )
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("""
                INSERT INTO jobs (role_input, title, company, location, link, ai_analysis)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (payload.role, job["title"], job["company"], job["location"], job["link"], job["ai_analysis"]))
            
    conn.commit()
    conn.close()
    
    # Return the updated database listings back to the React UI instantly
    return get_saved_jobs_endpoint()

@app.delete("/api/jobs/{job_id}")
def delete_single_job_endpoint(job_id: int):
    """Allows the user to remove specific job listings from their tracker view."""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
        conn.commit()
        conn.close()
        return {"status": "Success", "message": f"Job {job_id} deleted."}
    except Exception as e:
        return {"status": "Error", "message": str(e)}



