import importlib
import json

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


ADMIN_PASSWORD = "correct-admin-password"
SECRET_KEY = "test-secret-key-for-openai-client-reload"


def login_admin(client: TestClient):
    response = client.post("/api/admin/login", json={"password": ADMIN_PASSWORD})
    assert response.status_code == 200
    return response


class FakeAsyncOpenAI:
    instances = []

    def __init__(self, api_key=None, base_url=None, **_kwargs):
        self.api_key = api_key
        self.base_url = base_url
        FakeAsyncOpenAI.instances.append(self)


@pytest.fixture(autouse=True)
def restore_openai_client_global():
    openai_client = importlib.import_module("backend.app.openai_client")
    original_client = openai_client.client
    yield
    openai_client.client = original_client
    FakeAsyncOpenAI.instances.clear()


def _isolate_llm_secret_store(tmp_path, monkeypatch):
    secret_store = importlib.import_module("backend.app.llm_secret_store")
    secrets_dir = tmp_path / "game_data" / "secrets"
    secret_file = secrets_dir / "llm.json"
    monkeypatch.setattr(secret_store, "SECRETS_DIR", secrets_dir)
    monkeypatch.setattr(secret_store, "LLM_SECRET_FILE", secret_file)
    return secret_store, secret_file


def test_rebuild_openai_client_prefers_secret_store(tmp_path, monkeypatch):
    secret_store, secret_file = _isolate_llm_secret_store(tmp_path, monkeypatch)
    secret_file.parent.mkdir(parents=True)
    secret_file.write_text(
        json.dumps(
            {
                "base_url": "https://example.invalid/v1",
                "api_key": "test-secret-store-key",
                "main_model": "secret-main-model",
                "cheat_check_model": "secret-cheat-model",
            }
        ),
        encoding="utf-8",
    )

    openai_client = importlib.import_module("backend.app.openai_client")
    monkeypatch.setattr(openai_client, "AsyncOpenAI", FakeAsyncOpenAI)
    monkeypatch.setattr(openai_client.settings, "OPENAI_API_KEY", "your_openai_api_key_here")
    monkeypatch.setattr(openai_client.settings, "OPENAI_BASE_URL", "https://env.invalid/v1")
    FakeAsyncOpenAI.instances.clear()

    assert openai_client.rebuild_openai_client() is True

    assert openai_client.client is FakeAsyncOpenAI.instances[-1]
    assert openai_client.client.api_key == "test-secret-store-key"
    assert str(openai_client.client.base_url) == "https://example.invalid/v1"
    assert secret_store.get_effective_llm_config()["main_model"] == "secret-main-model"
    assert secret_store.get_effective_llm_config()["cheat_check_model"] == "secret-cheat-model"

    monkeypatch.setattr(secret_store, "LLM_SECRET_FILE", secret_file)


def test_rebuild_openai_client_falls_back_to_env_when_secret_missing(tmp_path, monkeypatch):
    _isolate_llm_secret_store(tmp_path, monkeypatch)
    openai_client = importlib.import_module("backend.app.openai_client")
    monkeypatch.setattr(openai_client, "AsyncOpenAI", FakeAsyncOpenAI)
    monkeypatch.setattr(openai_client.settings, "OPENAI_API_KEY", "test-env-key")
    monkeypatch.setattr(openai_client.settings, "OPENAI_BASE_URL", "https://env.invalid/v1")
    FakeAsyncOpenAI.instances.clear()

    assert openai_client.rebuild_openai_client() is True

    assert openai_client.client is FakeAsyncOpenAI.instances[-1]
    assert openai_client.client.api_key == "test-env-key"
    assert str(openai_client.client.base_url) == "https://env.invalid/v1"


def test_admin_llm_config_save_hot_reloads_openai_client(tmp_path, monkeypatch):
    _isolate_llm_secret_store(tmp_path, monkeypatch)
    admin = importlib.import_module("backend.app.admin")
    openai_client = importlib.import_module("backend.app.openai_client")

    monkeypatch.setattr(admin.settings, "SECRET_KEY", SECRET_KEY)
    monkeypatch.setattr(admin.settings, "ALGORITHM", "HS256")
    monkeypatch.setattr(admin.settings, "ADMIN_PASSWORD", ADMIN_PASSWORD)
    monkeypatch.setattr(admin.settings, "ADMIN_SESSION_COOKIE", "admin_test_cookie")
    monkeypatch.setattr(admin.settings, "ADMIN_SESSION_EXPIRE_MINUTES", 5)
    monkeypatch.setattr(openai_client, "AsyncOpenAI", FakeAsyncOpenAI)
    FakeAsyncOpenAI.instances.clear()

    app = FastAPI()
    app.include_router(admin.router)
    with TestClient(app) as client:
        login_admin(client)
        response = client.post(
            "/api/admin/llm-config",
            json={
                "base_url": "https://saved.invalid/v1",
                "api_key": "test-saved-key",
                "main_model": "saved-main-model",
                "cheat_check_model": "saved-cheat-model",
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["hot_applied"] is True
    assert payload["config"]["api_key_configured"] is True
    assert "test-saved-key" not in json.dumps(payload)
    assert openai_client.client is FakeAsyncOpenAI.instances[-1]
    assert openai_client.client.api_key == "test-saved-key"
    assert str(openai_client.client.base_url) == "https://saved.invalid/v1"


def test_cheat_check_model_uses_effective_secret_store_config(tmp_path, monkeypatch):
    _secret_store, secret_file = _isolate_llm_secret_store(tmp_path, monkeypatch)
    secret_file.parent.mkdir(parents=True)
    secret_file.write_text(
        json.dumps({"api_key": "test-key", "cheat_check_model": "secret-cheat-model"}),
        encoding="utf-8",
    )

    cheat_check = importlib.import_module("backend.app.cheat_check")
    captured = {}

    monkeypatch.setattr(cheat_check.runtime_config, "get_runtime_config", lambda: {"llm": {}})
    monkeypatch.setattr(cheat_check.runtime_config, "load_prompt", lambda _name: "system")

    async def fake_get_ai_response(**kwargs):
        captured.update(kwargs)
        return "<verdict><level>正常</level><reason>ok</reason></verdict>"

    monkeypatch.setattr(cheat_check.openai_client, "get_ai_response", fake_get_ai_response)
    async def fake_get_session(_player_id):
        return None

    monkeypatch.setattr(cheat_check.state_manager, "get_session", fake_get_session)

    import asyncio

    result = asyncio.run(cheat_check.run_cheat_check("player", ["hello"]))

    assert result == "正常"
    assert captured["model"] == "secret-cheat-model"
