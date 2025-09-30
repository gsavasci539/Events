#!/usr/bin/env python3
"""
Test API endpoints after fixes
"""

import requests
import json

def test_api_endpoints():
    print("🧪 Testing API endpoints after fixes...")
    print("=" * 50)

    base_url = "http://localhost:8000/api"

    # Test endpoints that were failing
    endpoints = [
        "/events/?page=1&per_page=10",
        "/stats/debug"
    ]

    for endpoint in endpoints:
        try:
            print(f"\n🔍 Testing {endpoint}")
            response = requests.get(f"{base_url}{endpoint}", timeout=10)

            if response.status_code == 200:
                print(f"✅ SUCCESS - Status: {response.status_code}")
                try:
                    data = response.json()
                    if "items" in data and isinstance(data["items"], list):
                        print(f"✅ Data returned: {len(data['items'])} items")
                    elif "events_count" in data:
                        print(f"✅ Stats returned: {data['events_count']} events")
                except:
                    print(f"✅ Response received (not JSON)")
            else:
                print(f"❌ FAILED - Status: {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

        except requests.exceptions.ConnectionError:
            print(f"❌ CONNECTION ERROR - Server not running")
            print("   Start server: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
            return False
        except Exception as e:
            print(f"❌ ERROR: {e}")

    print("\n" + "=" * 50)
    print("✅ API tests completed!")
    print("🎯 If all endpoints return 200, your API is working correctly!")
    return True

if __name__ == "__main__":
    test_api_endpoints()
