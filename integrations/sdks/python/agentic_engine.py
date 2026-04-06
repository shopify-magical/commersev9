"""
Agentic Engine Python SDK
Production-ready client for enterprise integrations
"""

import json
import time
from typing import Any, Optional, Dict, List
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


class AgenticEngineClient:
    """
    Python SDK client for Agentic Engine.

    Example:
        client = AgenticEngineClient(
            base_url="https://api.example.com",
            api_key="your-api-key"
        )
        result = client.submit_goal("Process customer order")
    """

    PRIORITY_CRITICAL = 0
    PRIORITY_HIGH = 1
    PRIORITY_MEDIUM = 2
    PRIORITY_LOW = 3

    def __init__(
        self,
        base_url: str,
        api_key: str,
        tenant_id: str = "default",
        timeout: int = 30,
        max_retries: int = 3,
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.tenant_id = tenant_id
        self.timeout = timeout
        self.max_retries = max_retries

        self._headers = {"Content-Type": "application/json", "X-API-Key": self.api_key}

    def _request(
        self, endpoint: str, method: str = "GET", data: Optional[Dict] = None
    ) -> Dict:
        url = f"{self.base_url}{endpoint}"
        last_error = None

        for attempt in range(self.max_retries + 1):
            try:
                body = json.dumps(data).encode() if data else None
                request = Request(url, data=body, headers=self._headers, method=method)

                with urlopen(request, timeout=self.timeout) as response:
                    return json.loads(response.read().decode())

            except HTTPError as e:
                last_error = e
                body = e.read().decode() if e.fp else "{}"
                try:
                    error_data = json.loads(body)
                    raise AgenticEngineError(error_data.get("error", f"HTTP {e.code}"))
                except json.JSONDecodeError:
                    raise AgenticEngineError(f"HTTP {e.code}: {e.reason}")

            except URLError as e:
                last_error = e
                if attempt < self.max_retries:
                    time.sleep(2**attempt)
                    continue
                raise AgenticEngineError(f"Connection failed: {e.reason}")

            except Exception as e:
                last_error = e
                if attempt < self.max_retries:
                    time.sleep(2**attempt)
                    continue
                raise AgenticEngineError(str(e))

        raise AgenticEngineError(str(last_error))

    def submit_goal(
        self, description: str, priority: int = 2, constraints: Optional[Dict] = None
    ) -> Dict:
        """
        Submit a goal to the engine for processing.

        Args:
            description: Goal description
            priority: 0=CRITICAL, 1=HIGH, 2=MEDIUM, 3=LOW
            constraints: Optional constraints dict

        Returns:
            Dict with goal info

        Example:
            result = client.submit_goal(
                description="Process order #12345",
                priority=PRIORITY_HIGH
            )
        """
        return self._request(
            "/v1/goals",
            method="POST",
            data={
                "description": description,
                "priority": priority,
                "constraints": constraints or {},
            },
        )

    def get_metrics(self) -> Dict:
        """Get engine metrics."""
        return self._request("/v1/metrics")

    def get_tenant_info(self) -> Dict:
        """Get current tenant information."""
        return self._request("/v1/tenants/me")

    def get_usage(self, limit: int = 100) -> Dict:
        """Get usage statistics."""
        return self._request(f"/v1/usage?limit={limit}")

    def health_check(self) -> Dict:
        """Check API health."""
        return self._request("/health")

    def list_goals(self, status: Optional[str] = None) -> Dict:
        """List goals with optional status filter."""
        endpoint = "/v1/goals"
        if status:
            endpoint += f"?status={status}"
        return self._request(endpoint)

    def get_goal(self, goal_id: str) -> Dict:
        """Get goal details by ID."""
        return self._request(f"/v1/goals/{goal_id}")


class AgenticEngineError(Exception):
    """SDK error class."""

    pass


def create_client(base_url: str, api_key: str, **kwargs) -> AgenticEngineClient:
    """Factory function to create client."""
    return AgenticEngineClient(base_url, api_key, **kwargs)
