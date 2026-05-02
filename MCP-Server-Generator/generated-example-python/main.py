#!/usr/bin/env python3
"""
GitHub API (Simplified) MCP Server
Generated MCP server for GitHub API (Simplified)
"""

from mcp.server.fastmcp import FastMCP
import httpx
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
import os
import asyncio
from functools import wraps

# Initialize FastMCP server
mcp = FastMCP("GitHub API (Simplified)")

# API client configuration
BASE_URL = "https://api.github.com"
API_KEY = os.getenv("API_KEY", "")

# Create HTTP client with authentication
headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
}

client = httpx.AsyncClient(base_url=BASE_URL, timeout=30.0, headers=headers)

# Retry decorator
def retry_on_failure(max_retries: int = 3):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except httpx.HTTPError as e:
                    if attempt == max_retries - 1:
                        raise
                    wait_time = 2 ** attempt
                    await asyncio.sleep(wait_time)
            return None
        return wrapper
    return decorator

# Pydantic models for validation

# Tool implementations

# Resource implementations
@mcp.resource("resource:///users/{username}")
@retry_on_failure()
async def getUser() -> str:
    """Retrieve information about a GitHub user"""
    try:
        response = await client.request(
            method="GET",
            url="/users/{username}"
        )
        response.raise_for_status()
        return response.text
    except httpx.HTTPError as e:
        return f"HTTP error occurred: {str(e)}"
    except Exception as e:
        return f"An error occurred: {str(e)}"

@mcp.resource("resource:///users/{username}/repos")
@retry_on_failure()
async def listUserRepos() -> str:
    """List public repositories for a user"""
    try:
        response = await client.request(
            method="GET",
            url="/users/{username}/repos"
        )
        response.raise_for_status()
        return response.text
    except httpx.HTTPError as e:
        return f"HTTP error occurred: {str(e)}"
    except Exception as e:
        return f"An error occurred: {str(e)}"

@mcp.resource("resource:///repos/{owner}/{repo}")
@retry_on_failure()
async def getRepository() -> str:
    """Get information about a repository"""
    try:
        response = await client.request(
            method="GET",
            url="/repos/{owner}/{repo}"
        )
        response.raise_for_status()
        return response.text
    except httpx.HTTPError as e:
        return f"HTTP error occurred: {str(e)}"
    except Exception as e:
        return f"An error occurred: {str(e)}"

@mcp.resource("resource:///repos/{owner}/{repo}/issues")
@retry_on_failure()
async def listIssues() -> str:
    """List issues for a repository"""
    try:
        response = await client.request(
            method="GET",
            url="/repos/{owner}/{repo}/issues"
        )
        response.raise_for_status()
        return response.text
    except httpx.HTTPError as e:
        return f"HTTP error occurred: {str(e)}"
    except Exception as e:
        return f"An error occurred: {str(e)}"


if __name__ == "__main__":
    mcp.run()