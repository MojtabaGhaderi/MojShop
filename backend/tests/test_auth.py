"""
Test authentication flow.
Broken auth = unauthorized admin access or locked-out customers.
"""

import pytest


class TestAuth:
    """Integration tests for registration, login, and token validation."""
    
    async def test_register_new_user(self, async_client):
        """New user can register with email and password."""
        response = await async_client.post("/auth/register", json={
            "email": "customer@example.com",
            "password": "secret123",
            "full_name": "Test Customer",
            "phone": "+989123456789",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "customer@example.com"
        assert data["full_name"] == "Test Customer"
        assert data["is_admin"] is False
        assert "id" in data
        # Password must never be returned
        assert "password" not in data
        assert "hashed_password" not in data
    
    async def test_register_duplicate_email(self, async_client):
        """Cannot register with email already in use."""
        # First registration
        await async_client.post("/auth/register", json={
            "email": "dup@example.com",
            "password": "secret123",
            "phone": "+989123456789",
        })
        
        # Second registration with same email
        response = await async_client.post("/auth/register", json={
            "email": "dup@example.com",
            "password": "different456",
            "phone": "+989123456788",
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    async def test_login_success(self, async_client):
        """Registered user can login and receives JWT token."""
        # Register
        await async_client.post("/auth/register", json={
            "email": "login@example.com",
            "password": "mypassword",
            "phone": "+989123456789",
        })
        
        # Login
        response = await async_client.post("/auth/login", json={
            "email": "login@example.com",
            "password": "mypassword",
            "phone": "+989123456789",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 20  # JWT should be long
    
    async def test_login_wrong_password(self, async_client):
        """Login with wrong password returns 400, not 401 (don't leak user existence)."""
        await async_client.post("/auth/register", json={
            "email": "wrongpass@example.com",
            "password": "correctpass",
            "phone": "+989123456789",
        })
        
        response = await async_client.post("/auth/login", json={
            "email": "wrongpass@example.com",
            "password": "wrongpass",
            "phone": "+989123456789",
        })
        assert response.status_code == 400
        assert "Invalid" in response.json()["detail"]
    
    async def test_login_nonexistent_user(self, async_client):
        """Login with email that doesn't exist returns same error as wrong password."""
        response = await async_client.post("/auth/login", json={
            "email": "nobody@example.com",
            "password": "anypassword",
            "phone": "+989123456789",
        })
        assert response.status_code == 400
        assert "Invalid" in response.json()["detail"]
    
    async def test_me_endpoint_with_token(self, async_client):
        """GET /auth/me returns user data with valid token."""
        # Register and login
        await async_client.post("/auth/register", json={
            "email": "me@example.com",
            "password": "secret123",
            "full_name": "Me User",
            "phone": "+989123456789",
        })
        login = await async_client.post("/auth/login", json={
            "email": "me@example.com",
            "password": "secret123",
            "phone": "+989123456789",
        })
        token = login.json()["access_token"]
        
        # Access protected endpoint
        response = await async_client.get("/auth/me", headers={
            "Authorization": f"Bearer {token}",
        })
        assert response.status_code == 200
        assert response.json()["email"] == "me@example.com"
    
    async def test_me_endpoint_without_token(self, async_client):
        """No token = 401 Unauthorized."""
        response = await async_client.get("/auth/me")
        assert response.status_code == 401
    
    async def test_me_endpoint_invalid_token(self, async_client):
        """Garbage token = 401."""
        response = await async_client.get("/auth/me", headers={
            "Authorization": "Bearer invalidtoken123",
        })
        assert response.status_code == 401
    
    async def test_password_too_short(self, async_client):
        """Password must be at least 6 characters."""
        response = await async_client.post("/auth/register", json={
            "email": "short@example.com",
            "password": "12345",  # 5 chars
            "phone": "+989123456789",
        })
        assert response.status_code == 422  # Validation error