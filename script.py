# force run
import requests
from datetime import datetime

# 🔑 Replace with your API key
API_KEY = "6894d916873f4c0cb09bcab629d14dcf"

url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={API_KEY}"

response = requests.get(url)
data = response.json()

articles = data.get("articles", [])[:5]

html_content = "<h1>Insight Engine 🚀</h1>"
html_content += f"<p>Last updated: {datetime.now()}</p>"

for article in articles:
    title = article.get("title", "")
    
    # Simple sentiment logic
    if "rise" in title.lower() or "growth" in title.lower():
        sentiment = "📈 Positive"
    elif "fall" in title.lower() or "crash" in title.lower():
        sentiment = "📉 Negative"
    else:
        sentiment = "😐 Neutral"

    html_content += f"<h3>{title}</h3>"
    html_content += f"<p>Sentiment: {sentiment}</p>"

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Dashboard updated successfully!")
