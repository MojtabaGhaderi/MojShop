"""
Test user profile and address management.
Broken profile = angry customers who can't update their info.
"""

import pytest


class TestProfile:
    """Profile read/update and address CRUD."""
    
    @pytest.fixture
    async def user_token(self, async_client):
        """Regular user."""
        await async_client.post("/auth/register", json={
            "email": "profile@example.com",
            "password": "profilepass",
            "full_name": "Original Name",
            "phone": "+989111111111",
        })
        login = await async_client.post("/auth/login", json={
            "email": "profile@example.com",
            "password": "profilepass",
            "phone": "+989111111111",
        })
        return login.json()["access_token"]
    
    async def test_get_profile(self, async_client, user_token):
        """Can read own profile."""
        response = await async_client.get("/profile/", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "profile@example.com"
        assert data["full_name"] == "Original Name"
        assert data["phone"] == "+989111111111"
        assert data["is_admin"] is False
    
    async def test_update_profile(self, async_client, user_token):
        """Can update name and phone."""
        response = await async_client.put("/profile/", 
            json={"full_name": "Updated Name", "phone": "+989222222222"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Name"
        assert data["phone"] == "+989222222222"
        # Email unchanged
        assert data["email"] == "profile@example.com"
    
    async def test_change_password(self, async_client, user_token):
        """Can change password with current password verification."""
        response = await async_client.put("/profile/", 
            json={
                "current_password": "profilepass",
                "new_password": "newpassword123",
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 200
        
        # Can login with new password
        login = await async_client.post("/auth/login", json={
            "email": "profile@example.com",
            "password": "newpassword123",
            "phone": "+989111111111",
        })
        assert login.status_code == 200
        assert "access_token" in login.json()
    
    async def test_change_password_wrong_current(self, async_client, user_token):
        """Cannot change password without correct current password."""
        response = await async_client.put("/profile/", 
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword123",
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 400
        assert "Current password" in response.json()["detail"]
    
    async def test_change_password_missing_current(self, async_client, user_token):
        """New password requires current password."""
        response = await async_client.put("/profile/", 
            json={"new_password": "newpassword123"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 400
    
    async def test_update_email_unique(self, async_client, user_token):
        """Cannot change to email already in use."""
        # Create another user
        await async_client.post("/auth/register", json={
            "email": "taken@example.com",
            "password": "takenpass",
            "phone": "+989333333333",
        })
        
        response = await async_client.put("/profile/", 
            json={"email": "taken@example.com"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 400
        assert "already in use" in response.json()["detail"]


class TestAddresses:
    """Address CRUD for shipping."""
    
    @pytest.fixture
    async def user_token(self, async_client):
        """User with no addresses."""
        await async_client.post("/auth/register", json={
            "email": "address@example.com",
            "password": "addresspass",
            "phone": "+989123456789",
        })
        login = await async_client.post("/auth/login", json={
            "email": "address@example.com",
            "password": "addresspass",
            "phone": "+989123456789",
        })
        return login.json()["access_token"]
    
    async def test_list_addresses_empty(self, async_client, user_token):
        """New user has no addresses."""
        response = await async_client.get("/profile/addresses/", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert response.status_code == 200
        assert response.json() == []
    
    async def test_create_address(self, async_client, user_token):
        """Can add shipping address."""
        response = await async_client.post("/profile/addresses/", 
            json={
                "label": "Home",
                "line_1": "123 Main St",
                "line_2": "Apt 4B",
                "city": "Tehran",
                "postal_code": "12345",
                "country": "Iran",
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["label"] == "Home"
        assert data["line_1"] == "123 Main St"
        assert data["city"] == "Tehran"
        assert data["is_default"] is False  # First address, not auto-default
    
    async def test_default_address(self, async_client, user_token):
        """Setting address as default unsets others."""
        # Create first address
        await async_client.post("/profile/addresses/", 
            json={"line_1": "First", "city": "Tehran", "postal_code": "11111"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        
        # Create second as default
        response = await async_client.post("/profile/addresses/", 
            json={
                "line_1": "Second",
                "city": "Tehran",
                "postal_code": "22222",
                "is_default": True,
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.json()["is_default"] is True
        
        # Verify first is no longer default
        addresses = await async_client.get("/profile/addresses/", headers={
            "Authorization": f"Bearer {user_token}",
        })
        first = [a for a in addresses.json() if a["line_1"] == "First"][0]
        assert first["is_default"] is False
    
    async def test_update_address(self, async_client, user_token):
        """Can edit existing address."""
        created = await async_client.post("/profile/addresses/", 
            json={"line_1": "Old", "city": "Tehran", "postal_code": "33333"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        addr_id = created.json()["id"]
        
        response = await async_client.put(f"/profile/addresses/{addr_id}", 
            json={"line_1": "Updated", "city": "Isfahan"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 200
        assert response.json()["line_1"] == "Updated"
        assert response.json()["city"] == "Isfahan"
        # Postal code unchanged
        assert response.json()["postal_code"] == "33333"
    
    async def test_delete_address(self, async_client, user_token):
        """Can remove address."""
        created = await async_client.post("/profile/addresses/", 
            json={"line_1": "Delete Me", "city": "Tehran", "postal_code": "44444"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        addr_id = created.json()["id"]
        
        response = await async_client.delete(f"/profile/addresses/{addr_id}", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert response.status_code == 204
        
        # Verify gone
        addresses = await async_client.get("/profile/addresses/", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert len(addresses.json()) == 0
    
    async def test_cannot_delete_others_address(self, async_client, user_token):
        """Users cannot delete each other's addresses."""
        # Create address
        created = await async_client.post("/profile/addresses/", 
            json={"line_1": "Mine", "city": "Tehran", "postal_code": "55555"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        addr_id = created.json()["id"]
        
        # Create other user
        await async_client.post("/auth/register", json={
            "email": "other2@example.com",
            "password": "otherpass",
            "phone": "+989333333333",
        })
        other_login = await async_client.post("/auth/login", json={
            "email": "other2@example.com",
            "password": "otherpass",
            "phone": "+989333333333",
        })
        other_token = other_login.json()["access_token"]
        
        # Try to delete
        response = await async_client.delete(f"/profile/addresses/{addr_id}", headers={
            "Authorization": f"Bearer {other_token}",
        })
        assert response.status_code == 404  # Not found for this user