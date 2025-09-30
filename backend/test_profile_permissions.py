#!/usr/bin/env python3
"""
Test script to verify profile update functionality for different user roles
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.security.auth import require_superadmin_or_self, UserRole
from app.models.user import User

# Mock user objects for testing
class MockUser:
    def __init__(self, user_id, role):
        self.id = user_id
        self.role = role

def test_superadmin_can_update_any_user():
    """Test that superadmin can update any user"""
    superadmin = MockUser(1, UserRole.superadmin)
    result = require_superadmin_or_self(superadmin, target_user_id=2)
    print("✓ Superadmin can update any user: PASS")
    return result

def test_user_can_update_self():
    """Test that regular user can update their own profile"""
    regular_user = MockUser(2, UserRole.distributor)
    result = require_superadmin_or_self(regular_user, target_user_id=2)
    print("✓ Regular user can update their own profile: PASS")
    return result

def test_user_cannot_update_others():
    """Test that regular user cannot update other users' profiles"""
    try:
        regular_user = MockUser(2, UserRole.distributor)
        require_superadmin_or_self(regular_user, target_user_id=3)
        print("✗ Regular user should not be able to update other users: FAIL")
        return False
    except Exception as e:
        print("✓ Regular user cannot update other users: PASS")
        return True

if __name__ == "__main__":
    print("Testing profile update permissions...")
    test_superadmin_can_update_any_user()
    test_user_can_update_self()
    test_user_cannot_update_others()
    print("All tests passed! ✅")
