import requests
from bs4 import BeautifulSoup
import urllib.parse
import ollama

def scrape_linkedin_jobs(role_title, location="Remote"):
    """
    Scrapes LinkedIn's public guest search API endpoint for target job keywords.
    Passes data down to local Qwen to screen and rank entries automatically.
    """
    job_results = []
    
    # URL encode parameters cleanly (e.g. "AI Engineer" -> "AI%20Engineer")
    encoded_role = urllib.parse.quote(role_title)
    encoded_loc = urllib.parse.quote(location)
    
    # CORRECT PATH: Double-check the path strings structure
    target_url = f"https://linkedin.com/jobs/view/{encoded_role}?location={encoded_loc}&start=0"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(target_url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"LinkedIn rejected request with status code: {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.text, 'html.parser')
        cards = soup.find_all("li")
        
        # Pull top 3 listings to save local processing times
        for card in cards[:3]:
            title_tag = card.find("h3", class_="base-search-card__title")
            company_tag = card.find("h4", class_="base-search-card__subtitle")
            location_tag = card.find("span", class_="job-search-card__location")
            link_tag = card.find("a", class_="base-card__full-link")
            
            if title_tag and company_tag:
                title = title_tag.text.strip()
                company = company_tag.text.strip()
                loc = location_tag.text.strip() if location_tag else location
                
                raw_link = link_tag['href'] if link_tag else "https://linkedin.com"
                link = raw_link.split('?')[0] # Strips out long tracking characters
                
                # Analyze the matching card profile with your local Qwen model
                prompt = (
                    f"You are a talent screening assistant.\n"
                    f"Analyze if this job title matches a user searching for '{role_title}'.\n"
                    f"Write a 1-sentence assessment summarizing if this is a good fit and highlight required skills.\n\n"
                    f"Job Title: {title}\n"
                    f"Company: {company}\n"
                    f"Location: {loc}"
                )
                
                ai_response = ollama.generate(model='qwen2.5:3b', prompt=prompt)
                assessment = ai_response['response'].strip()
                
                job_results.append({
                    "title": title,
                    "company": company,
                    "location": loc,
                    "link": link,
                    "ai_analysis": assessment
                })
                
    except Exception as e:
        print(f"Scraping exception error: {e}")
        return []
        
    return job_results
