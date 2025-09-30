import requests
import json

# Login credentials
login_data = {
    "username": "test@example.com",
    "password": "testpassword123"
}

try:
    # Login to get token
    login_response = requests.post('http://localhost:8000/api/auth/login', data=login_data)
    print(f"Login Status: {login_response.status_code}")

    if login_response.status_code == 200:
        token_data = login_response.json()
        token = token_data['access_token']
        print("✅ Login successful!")
        print(f"🔑 Token: {token}")

        # Test the stats endpoint with token
        headers = {'Authorization': f'Bearer {token}'}
        stats_response = requests.get('http://localhost:8000/api/stats', headers=headers)

        print(f"Stats Status: {stats_response.status_code}")

        if stats_response.status_code == 200:
            data = stats_response.json()
            print("✅ Stats API is working!")
            print("📊 Stats Data:")
            print(json.dumps(data, indent=2, ensure_ascii=False))

            # Show summary
            if 'events' in data:
                print(f"📈 Events: {data['events']}")
                print(f"👥 Guests: {data['guests']}")
                print(f"👤 Users: {data['users']}")
                print(f"📧 Notifications: {data['notifications']}")
                print(f"🔔 Latest Notifications: {len(data.get('latest_notifications', []))}")
                print(f"📝 Latest Activities: {len(data.get('latest_activities', []))}")
        else:
            print(f"❌ Stats API Error: {stats_response.text}")
    else:
        print(f"❌ Login Error: {login_response.text}")

except Exception as e:
    print(f"❌ Connection Error: {e}")
