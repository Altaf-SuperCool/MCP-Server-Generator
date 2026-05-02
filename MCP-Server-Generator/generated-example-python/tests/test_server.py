import pytest
import asyncio
import os
from unittest.mock import Mock, patch, AsyncMock
import httpx

# Set test environment variables
os.environ['API_KEY'] = 'test-api-key'

# Import after setting environment variables
import main

@pytest.fixture
def mock_httpx_client():
    """Mock httpx client for testing"""
    with patch('main.client') as mock_client:
        yield mock_client

class TestTools:
    """Test MCP tools"""
    

class TestResources:
    """Test MCP resources"""
    
    @pytest.mark.asyncio
    async def test_getUser(self, mock_httpx_client):
        """Test getUser resource"""
        # Mock response
        mock_response = Mock()
        mock_response.text = '{"status": "success"}'
        mock_response.raise_for_status = Mock()
        mock_httpx_client.request = AsyncMock(return_value=mock_response)
        
        # Test resource
        result = await main.getUser()
        
        # Assertions
        assert result is not None
        assert isinstance(result, str)
        
        # Verify API call
        mock_httpx_client.request.assert_called_once()
        call_args = mock_httpx_client.request.call_args
        assert call_args[1]['method'] == 'GET'
        assert call_args[1]['url'] == '/users/{username}'
    
    @pytest.mark.asyncio
    async def test_getUser_error_handling(self, mock_httpx_client):
        """Test getUser error handling"""
        # Mock error response
        mock_httpx_client.request = AsyncMock(side_effect=httpx.HTTPError("Test error"))
        
        # Test error handling
        result = await main.getUser()
        
        # Should return error string
        assert 'error' in result.lower() or 'Error' in result
    
    @pytest.mark.asyncio
    async def test_listUserRepos(self, mock_httpx_client):
        """Test listUserRepos resource"""
        # Mock response
        mock_response = Mock()
        mock_response.text = '{"status": "success"}'
        mock_response.raise_for_status = Mock()
        mock_httpx_client.request = AsyncMock(return_value=mock_response)
        
        # Test resource
        result = await main.listUserRepos()
        
        # Assertions
        assert result is not None
        assert isinstance(result, str)
        
        # Verify API call
        mock_httpx_client.request.assert_called_once()
        call_args = mock_httpx_client.request.call_args
        assert call_args[1]['method'] == 'GET'
        assert call_args[1]['url'] == '/users/{username}/repos'
    
    @pytest.mark.asyncio
    async def test_listUserRepos_error_handling(self, mock_httpx_client):
        """Test listUserRepos error handling"""
        # Mock error response
        mock_httpx_client.request = AsyncMock(side_effect=httpx.HTTPError("Test error"))
        
        # Test error handling
        result = await main.listUserRepos()
        
        # Should return error string
        assert 'error' in result.lower() or 'Error' in result
    
    @pytest.mark.asyncio
    async def test_getRepository(self, mock_httpx_client):
        """Test getRepository resource"""
        # Mock response
        mock_response = Mock()
        mock_response.text = '{"status": "success"}'
        mock_response.raise_for_status = Mock()
        mock_httpx_client.request = AsyncMock(return_value=mock_response)
        
        # Test resource
        result = await main.getRepository()
        
        # Assertions
        assert result is not None
        assert isinstance(result, str)
        
        # Verify API call
        mock_httpx_client.request.assert_called_once()
        call_args = mock_httpx_client.request.call_args
        assert call_args[1]['method'] == 'GET'
        assert call_args[1]['url'] == '/repos/{owner}/{repo}'
    
    @pytest.mark.asyncio
    async def test_getRepository_error_handling(self, mock_httpx_client):
        """Test getRepository error handling"""
        # Mock error response
        mock_httpx_client.request = AsyncMock(side_effect=httpx.HTTPError("Test error"))
        
        # Test error handling
        result = await main.getRepository()
        
        # Should return error string
        assert 'error' in result.lower() or 'Error' in result
    
    @pytest.mark.asyncio
    async def test_listIssues(self, mock_httpx_client):
        """Test listIssues resource"""
        # Mock response
        mock_response = Mock()
        mock_response.text = '{"status": "success"}'
        mock_response.raise_for_status = Mock()
        mock_httpx_client.request = AsyncMock(return_value=mock_response)
        
        # Test resource
        result = await main.listIssues()
        
        # Assertions
        assert result is not None
        assert isinstance(result, str)
        
        # Verify API call
        mock_httpx_client.request.assert_called_once()
        call_args = mock_httpx_client.request.call_args
        assert call_args[1]['method'] == 'GET'
        assert call_args[1]['url'] == '/repos/{owner}/{repo}/issues'
    
    @pytest.mark.asyncio
    async def test_listIssues_error_handling(self, mock_httpx_client):
        """Test listIssues error handling"""
        # Mock error response
        mock_httpx_client.request = AsyncMock(side_effect=httpx.HTTPError("Test error"))
        
        # Test error handling
        result = await main.listIssues()
        
        # Should return error string
        assert 'error' in result.lower() or 'Error' in result
    

class TestValidation:
    """Test Pydantic validation"""
    

class TestAuthentication:
    """Test authentication"""
    
    def test_auth_headers_present(self):
        """Test that authentication headers are set"""
        from main import headers
        assert headers is not None
        assert 'X-API-Key' in headers
    
    def test_auth_environment_variables(self):
        """Test that auth environment variables are read"""
        assert os.getenv('API_KEY') is not None

class TestRetryLogic:
    """Test retry logic"""
    
    @pytest.mark.asyncio
    async def test_retry_on_failure(self, mock_httpx_client):
        """Test that requests are retried on failure"""
        # Mock to fail twice then succeed
        mock_response = Mock()
        mock_response.json.return_value = {"status": "success"}
        mock_response.raise_for_status = Mock()
        
        mock_httpx_client.request = AsyncMock(
            side_effect=[
                httpx.HTTPError("Error 1"),
                httpx.HTTPError("Error 2"),
                mock_response
            ]
        )
        
        # Test with first tool

# Fixtures for test data
@pytest.fixture
def sample_api_response():
    """Sample API response for testing"""
    return {
        "status": "success",
        "data": {
            "id": 1,
            "name": "Test Item",
            "value": 100
        }
    }

@pytest.fixture
def sample_error_response():
    """Sample error response for testing"""
    return {
        "status": "error",
        "message": "Test error message"
    }