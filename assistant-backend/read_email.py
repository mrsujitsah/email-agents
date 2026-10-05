import imaplib
import email
from email.header import decode_header
import ollama

# --- CONFIGURATION ---
EMAIL_ACCOUNT = "youremail@gmail.com"  # Replace with your email
APP_PASSWORD = "your_app_password"          # Replace with your copied code (no spaces)
IMAP_SERVER = "imap.gmail.com"


def safe_decode(header_value):
    if not header_value:
        return ""
    try:
        decoded_parts = decode_header(header_value)
        result_text = ""
        for part, encoding in decoded_parts:
            if isinstance(part, bytes):
                # Fallback safely if encoding parameter is missing or a tuple
                enc = encoding if isinstance(encoding, str) else "utf-8"
                result_text += part.decode(enc, errors="ignore")
            elif isinstance(part, str):
                result_text += part
        return result_text
    except Exception:
        return str(header_value)

def get_dashboard_emails():
    email_list = []
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_ACCOUNT, APP_PASSWORD)
        mail.select("inbox")

        # Fetch up to the 5 latest unread emails
        status, messages = mail.search(None, 'UNSEEN')
        if not messages or not messages[0]:
            mail.logout()
            return []
            
        mail_ids = messages[0].split()
        if not mail_ids:
            mail.logout()
            return []

        # Get the 5 most recent unread emails
        latest_ids = mail_ids[-5:]
        
        for email_id in latest_ids:
            status, data = mail.fetch(email_id, '(RFC822)')
            for response_part in data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject = safe_decode(msg["Subject"])
                    from_address = safe_decode(msg["From"])
                    
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain":
                                payload = part.get_payload(decode=True)
                                if payload:
                                    body = payload.decode(errors="ignore")
                                break
                    else:
                        payload = msg.get_payload(decode=True)
                        if payload:
                            body = payload.decode(errors="ignore")
                    
                    # Run it through your local Qwen model
                    prompt = (
                        f"You are a local assistant processing an inbox item.\n"
                        f"Provide a 1-sentence summary of this message, and output exactly either 'HIGH PRIORITY' or 'STANDARD'.\n"
                        f"CRITICAL: Always flag any emails regarding Job Applications, interviews, or career work as 'HIGH PRIORITY'.\n"
                        f"Format your output exactly like this: Summary: <summary text> | Status: <priority>\n\n"
                        f"From: {from_address}\n"
                        f"Subject: {subject}\n"
                        f"Body:\n{body}"
                    )
                    
                    response = ollama.generate(model='qwen2.5:3b', prompt=prompt)
                    ai_output = response['response']
                    
                    summary = ai_output
                    action = "STANDARD"
                    
                    if "|" in ai_output:
                        parts = ai_output.split("|")
                        summary = parts[0].replace("Summary:", "").strip()
                        action = parts[1].replace("Status:", "").strip()
                    
                    email_list.append({
                        "from": from_address,
                        "subject": subject,
                        "summary": summary,
                        "action": action
                    })
        mail.logout()
    except Exception as e:
        print(f"Error fetching emails: {e}")
        return []
        
    return email_list


get_dashboard_emails()