#!/usr/bin/env python3

import requests
import json
import sys

def test_api():
    base_url = "http://localhost:8000"

    print("Testing API endpoints...")
    print("-" * 50)

    # Test basic endpoints
    endpoints = [
        "/",
        "/health",
        "/api/auth/login",
        "/api/events/",
        "/api/users/"
    ]

    for endpoint in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            print(f"Testing {url}...")

            if endpoint == "/":
                response = requests.get(url, timeout=5)
            else:
                response = requests.get(url, timeout=5)

            print(f"  Status: {response.status_code}")
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"  Response: {json.dumps(data, indent=2)}")
                except:
                    print(f"  Response: {response.text[:100]}...")
            else:
                print(f"  Error: {response.text[:100]}...")

        except requests.exceptions.ConnectionError:
            print("  Error: Connection refused - Is the server running?")
            return False
        except requests.exceptions.Timeout:
            print("  Error: Request timeout")
        except Exception as e:
            print(f"  Error: {e}")

        print()

    return True

if __name__ == "__main__":
    test_api()
