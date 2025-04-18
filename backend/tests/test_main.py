import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient
import sys
import os
from pathlib import Path

# Add the parent directory to sys.path if it's not already there
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

# Now import from the correct location
from app.main import app, get_current_user
from app.models import User

# Mock the Supabase client before it's used in main.py
supabase_mock = MagicMock()
supabase_mock.auth.sign_in = MagicMock()
supabase_mock.auth.sign_up = MagicMock()
supabase_mock.auth.get_user = MagicMock()
supabase_mock.table.return_value.insert.return_value.execute = MagicMock()
supabase_mock.table.return_value.select.return_value.eq.return_value.execute = MagicMock()
supabase_mock.table.return_value.delete.return_value.eq.return_value.execute = MagicMock()

# Mock the OpenAI client
openai_client_mock = MagicMock()
openai_client_mock.chat.completions.create = MagicMock()

# Apply patches globally for the test session
@pytest.fixture(scope="session", autouse=True)
def mock_dependencies():
    with patch('app.main.supabase', supabase_mock), \
         patch('app.main.client', openai_client_mock):
        yield

# Corrected client fixture - for use with httpx.AsyncClient
@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

# --- Test Functions ---

@pytest.mark.asyncio
async def test_read_root(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Flashcard Maker API is running"}

@pytest.mark.asyncio
async def test_register_user_success(client: AsyncClient):
    # Mock Supabase response for successful registration
    mock_user = MagicMock()
    mock_user.id = "some-uuid"
    mock_user.user_metadata = {"username": "testuser"}
    mock_response = MagicMock()
    mock_response.user = mock_user
    mock_response.error = None
    supabase_mock.auth.sign_up.return_value = mock_response

    response = await client.post("/register", json={
        "email": "test@example.com",
        "password": "password123",
        "username": "testuser"
    })
    assert response.status_code == 200
    assert response.json() == {"message": "User registered. Please check email to confirm."}
    supabase_mock.auth.sign_up.assert_called_once_with(
        email="test@example.com",
        password="password123",
        options={"data": {"username": "testuser"}}
    )
    supabase_mock.auth.sign_up.reset_mock()

@pytest.mark.asyncio
async def test_register_user_failure(client: AsyncClient):
    # Mock Supabase response for failed registration
    mock_error = MagicMock()
    mock_error.message = "User already exists"
    mock_response = MagicMock()
    mock_response.user = None
    mock_response.error = mock_error
    supabase_mock.auth.sign_up.return_value = mock_response

    response = await client.post("/register", json={
        "email": "test@example.com",
        "password": "password123",
        "username": "testuser"
    })
    assert response.status_code == 400
    assert response.json() == {"detail": "User already exists"}
    supabase_mock.auth.sign_up.reset_mock()

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    # Mock Supabase response for successful login
    mock_session = MagicMock()
    mock_session.access_token = "fake-token"
    mock_response = MagicMock()
    mock_response.session = mock_session
    supabase_mock.auth.sign_in.return_value = mock_response

    response = await client.post("/token", data={
        "username": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert response.json() == {"access_token": "fake-token", "token_type": "bearer"}
    supabase_mock.auth.sign_in.assert_called_once_with(
        email="test@example.com",
        password="password123"
    )
    supabase_mock.auth.sign_in.reset_mock()

@pytest.mark.asyncio
async def test_login_failure(client: AsyncClient):
    # Mock Supabase response for failed login
    mock_response = MagicMock()
    mock_response.session = None
    supabase_mock.auth.sign_in.return_value = mock_response

    response = await client.post("/token", data={
        "username": "wrong@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid credentials"}
    supabase_mock.auth.sign_in.reset_mock()

# --- Tests for Authenticated Endpoints ---

# Fixture to override the get_current_user dependency
@pytest.fixture
def override_get_current_user():
    async def mock_get_current_user():
        return User(id="test-user-id", username="testuser") # Return a User model instance
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    # Clean up override after test
    app.dependency_overrides = {}

@pytest.mark.asyncio
async def test_read_users_me(client: AsyncClient, override_get_current_user):
    # No need to mock supabase.auth.get_user here because we override the dependency
    response = await client.get("/users/me", headers={"Authorization": "Bearer fake-token"})
    assert response.status_code == 200
    assert response.json() == {"id": "test-user-id", "username": "testuser"}

# --- TODO: Add tests for /upload ---
# This will involve mocking:
# - get_current_user (using the fixture above)
# - openai_client_mock.chat.completions.create (to return mock transcription and flashcards)
# - supabase_mock.table().insert().execute() (for both sets and flashcards)
# - Handling file uploads with AsyncClient

# Example structure for /upload test
# @pytest.mark.asyncio
# async def test_upload_images_success(client: AsyncClient, override_get_current_user):
#     # 1. Mock OpenAI responses
#     mock_transcription = MagicMock()
#     mock_transcription.choices = [MagicMock(message=MagicMock(content="Mock transcription"))]
#     mock_flashcards = MagicMock()
#     mock_flashcards.choices = [MagicMock(message=MagicMock(content='[{"front": "Q1", "back": "A1"}]'))]
#     openai_client_mock.chat.completions.create.side_effect = [mock_transcription, mock_flashcards]

#     # 2. Mock Supabase insert responses
#     mock_set_insert_result = MagicMock()
#     mock_set_insert_result.data = [{"id": 123}] # Simulate returning the new set ID
#     mock_cards_insert_result = MagicMock()
#     mock_cards_insert_result.data = [{"id": 1, "front": "Q1", "back": "A1", "set_id": 123}] # Simulate card insertion
#     supabase_mock.table.return_value.insert.return_value.execute.side_effect = [
#         mock_set_insert_result,
#         mock_cards_insert_result
#     ]

#     # 3. Prepare mock file data
#     mock_file_content = b"fake image data"
#     files = {'files': ('test.jpg', mock_file_content, 'image/jpeg')}

#     # 4. Make the request
#     response = await client.post("/upload", files=files, headers={"Authorization": "Bearer fake-token"})

#     # 5. Assertions
#     assert response.status_code == 200
#     data = response.json()
#     assert data["transcription"] == "Mock transcription"
#     assert len(data["flashcards"]) == 1
#     assert data["flashcards"][0]["front"] == "Q1"

#     # Reset mocks if needed
#     openai_client_mock.chat.completions.create.reset_mock(side_effect=True)
#     supabase_mock.table.return_value.insert.return_value.execute.reset_mock(side_effect=True)


# --- TODO: Add tests for /flashcard-sets (GET all) ---
# Mock supabase_mock.table().select()...execute() to return a list of sets/cards
# Use override_get_current_user fixture

# --- TODO: Add tests for /flashcard-sets/{set_id} (GET one) ---
# Mock supabase_mock.table().select()...execute() to return a single set or empty list for not found
# Use override_get_current_user fixture

# --- TODO: Add tests for /flashcard-sets/{set_id} (DELETE) ---
# Mock supabase_mock.table().delete()...execute() to simulate success or failure (not found)
# Use override_get_current_user fixture