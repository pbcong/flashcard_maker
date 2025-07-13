import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock
import sys
from pathlib import Path

# Add the parent directory to sys.path if it's not already there
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

# Now import from the correct location
from app.main import app
from app.api.routers.auth import get_current_user
from app.models.models import User

# Mock the Supabase client before it's used
supabase_mock = MagicMock()
supabase_mock.auth.sign_in_with_password = MagicMock()
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
    with patch('app.db.database.supabase', supabase_mock), \
         patch('app.services.services.client', openai_client_mock):
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

    response = await client.post("/v1/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "username": "testuser"
    })
    assert response.status_code == 200
    assert response.json() == {"message": "User registered. Please check email to confirm."}
    supabase_mock.auth.sign_up.assert_called_once()
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

    response = await client.post("/v1/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "username": "testuser"
    })
    assert response.status_code == 400
    assert response.json() == {"detail": "400: User already exists"}
    supabase_mock.auth.sign_up.reset_mock()


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    # Mock Supabase response for successful login
    mock_session = MagicMock()
    mock_session.access_token = "fake-token"
    mock_response = MagicMock()
    mock_response.session = mock_session
    mock_response.error = None
    supabase_mock.auth.sign_in_with_password.return_value = mock_response

    response = await client.post("/v1/auth/token", data={
        "username": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert response.json() == {"access_token": "fake-token", "token_type": "bearer"}
    supabase_mock.auth.sign_in_with_password.assert_called_once()
    supabase_mock.auth.sign_in_with_password.reset_mock()


@pytest.mark.asyncio
async def test_login_failure(client: AsyncClient):
    # Mock Supabase response for failed login
    mock_error = MagicMock()
    mock_error.message = "Invalid credentials"
    mock_response = MagicMock()
    mock_response.session = None
    mock_response.error = mock_error
    supabase_mock.auth.sign_in_with_password.return_value = mock_response

    response = await client.post("/v1/auth/token", data={
        "username": "wrong@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json() == {"detail": "Login failed: 401: Invalid credentials"}
    supabase_mock.auth.sign_in_with_password.reset_mock()


# --- Tests for Authenticated Endpoints ---

# Fixture to override the get_current_user dependency
@pytest.fixture
def override_get_current_user():
    async def mock_get_current_user():
        return User(id="test-user-id", username="testuser")  # Return a User model instance

    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    # Clean up override after test
    app.dependency_overrides = {}


@pytest.mark.asyncio
async def test_read_users_me(client: AsyncClient, override_get_current_user):
    # No need to mock supabase.auth.get_user here because we override the dependency
    response = await client.get("/v1/auth/me", headers={"Authorization": "Bearer fake-token"})
    assert response.status_code == 200
    assert response.json() == {"id": "test-user-id", "username": "testuser"}
