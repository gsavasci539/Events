import requests
import json

try:
    # Test the stats endpoint
    response = requests.get('http://localhost:8000/api/stats')
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print("✅ API is working!")
        print("📊 Stats Data:")
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(f"❌ API Error: {response.text}")

except Exception as e:
    print(f"❌ Connection Error: {e}")
