#!/usr/bin/env python3

import requests
import json
import time

def test_api_connection():
    print("🌐 Testing API connection...")
    print("-" * 50)

    base_url = "http://89.252.184.134:5003"

    # Test endpoints that should work even without database
    endpoints = [
        "/",
        "/health",
        "/docs",  # FastAPI auto-generated docs
    ]

    for endpoint in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            print(f"Testing {url}...")

            response = requests.get(url, timeout=10)
            print(f"  ✅ Status: {response.status_code}")

            if response.status_code == 200:
                if endpoint == "/":
                    data = response.json()
                    print(f"  📄 Response: {data}")
                elif endpoint == "/health":
                    data = response.json()
                    print(f"  📄 Response: {json.dumps(data, indent=2)}")
                else:
                    print(f"  📄 Response: Available (length: {len(response.text)})")
            else:
                print(f"  ❌ Error: {response.text[:100]}...")

        except requests.exceptions.ConnectionError:
            print("  ❌ Error: Cannot connect to server")
            print("  💡 Make sure the FastAPI server is running:")
            print("     cd backend && python run.py")
            return False
        except requests.exceptions.Timeout:
            print("  ⏰ Error: Request timeout")
        except Exception as e:
            print(f"  ❌ Error: {e}")

        print()

    # Test API endpoints (these might fail if database is not connected)
    print("Testing API endpoints...")
    api_endpoints = [
        "/api/auth/login",
        "/api/events/",
        "/api/users/"
    ]

    for endpoint in api_endpoints:
        try:
            url = f"{base_url}{endpoint}"
            print(f"Testing {url}...")

            response = requests.get(url, timeout=10)
            print(f"  📊 Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                print(f"  📄 Response: {json.dumps(data, indent=2)}")
            else:
                print(f"  ❌ Error: {response.text[:100]}...")

        except Exception as e:
            print(f"  ❌ Error: {e}")

        print()

    return True

if __name__ == "__main__":
    print("🚀 API Connection Test")
    print("=" * 50)
    test_api_connection()
