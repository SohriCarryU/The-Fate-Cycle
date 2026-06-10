import importlib
import json

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


ADMIN_PASSWORD = "correct-admin-password"
SECRET_KEY = "test-secret-key-for-admin-api"


@pytest.fixture()
def admin_client(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv("SECRET_KEY", SECRET_KEY)

    admin = importlib.import_module("backend.app.admin")

    monkeypatch.setattr(admin.settings, "SECRET_KEY", SECRET_KEY)
    monkeypatch.setattr(admin.settings, "ALGORITHM", "HS256")
    monkeypatch.setattr(admin.settings, "ADMIN_PASSWORD", ADMIN_PASSWORD)
    monkeypatch.setattr(admin.settings, "ADMIN_SESSION_COOKIE", "admin_test_cookie")
    monkeypatch.setattr(admin.settings, "ADMIN_SESSION_EXPIRE_MINUTES", 5)
    monkeypatch.setattr(admin.settings, "DATABASE_URL", "sqlite:///isolated-test.db")

    class FakeConnection:
        def close(self):
            pass

    monkeypatch.setattr(admin.db, "get_db_connection", lambda: FakeConnection())

    app = FastAPI()
    app.include_router(admin.router)
    with TestClient(app) as client:
        yield client, tmp_path, admin


def login_admin(client: TestClient):
    response = client.post("/api/admin/login", json={"password": ADMIN_PASSWORD})
    assert response.status_code == 200
    assert response.json() == {"ok": True, "admin": {"authenticated": True}}
    return response


def test_admin_status_reports_guest_then_authenticated(admin_client):
    client, _tmp_path, _admin = admin_client

    guest_response = client.get("/api/admin/status")
    assert guest_response.status_code == 200
    assert guest_response.json() == {
        "authenticated": False,
        "admin_enabled": True,
    }

    login_admin(client)

    auth_response = client.get("/api/admin/status")
    assert auth_response.status_code == 200
    assert auth_response.json() == {
        "authenticated": True,
        "admin_enabled": True,
    }


def test_admin_login_failure_paths(admin_client, monkeypatch):
    client, _tmp_path, admin = admin_client

    monkeypatch.setattr(admin.settings, "ADMIN_PASSWORD", "")
    disabled_response = client.post("/api/admin/login", json={"password": "anything"})
    assert disabled_response.status_code == 503
    assert disabled_response.json()["detail"] == "Admin login is disabled"

    monkeypatch.setattr(admin.settings, "ADMIN_PASSWORD", ADMIN_PASSWORD)
    blank_response = client.post("/api/admin/login", json={"password": "   "})
    assert blank_response.status_code == 400
    assert blank_response.json()["detail"] == "password is required"

    wrong_response = client.post("/api/admin/login", json={"password": "wrong"})
    assert wrong_response.status_code == 401
    assert wrong_response.json()["detail"] == "Invalid admin password"


def test_runtime_config_validate_requires_admin(admin_client):
    client, _tmp_path, _admin = admin_client

    response = client.post("/api/admin/runtime-config/validate", json={"config": {}})

    assert response.status_code == 401
    assert response.json()["detail"] == "Admin authentication required"


def test_runtime_config_validate_success_and_failure(admin_client):
    client, _tmp_path, _admin = admin_client
    login_admin(client)

    valid_response = client.post(
        "/api/admin/runtime-config/validate",
        json={
            "config": {
                "llm": {"openai_model": "  gpt-4o  "},
                "image_generation": {"image_gen_idle_seconds": 10},
                "feature_flags": {"live_view_enabled": True},
            }
        },
    )
    assert valid_response.status_code == 200
    valid_payload = valid_response.json()
    assert valid_payload["ok"] is True
    assert valid_payload["normalized"]["llm"]["openai_model"] == "gpt-4o"
    assert valid_payload["normalized"]["image_generation"]["image_gen_idle_seconds"] == 10
    assert valid_payload["normalized"]["feature_flags"]["live_view_enabled"] is True
    assert isinstance(valid_payload["warnings"], list)

    sensitive_response = client.post(
        "/api/admin/runtime-config/validate",
        json={"config": {"llm": {"openai_model": "gpt-4o"}, "secret": "blocked"}},
    )
    assert sensitive_response.status_code == 422
    assert "sensitive fields are not allowed" in sensitive_response.json()["detail"]

    invalid_response = client.post(
        "/api/admin/runtime-config/validate",
        json={"config": {"image_generation": {"image_gen_idle_seconds": 0}}},
    )
    assert invalid_response.status_code == 422
    assert "image_generation.image_gen_idle_seconds" in invalid_response.json()["detail"]


@pytest.mark.parametrize(
    ("method", "path", "kwargs"),
    [
        ("get", "/api/admin/prompts/%2E%2E%2Fconfig.py", {}),
        ("put", "/api/admin/prompts/%2E%2E%2Fconfig.py", {"json": {"content": "blocked"}}),
        ("delete", "/api/admin/prompts/%2E%2E%2Fconfig.py/override", {}),
    ],
)
def test_prompt_filename_path_traversal_is_rejected(admin_client, method, path, kwargs):
    client, _tmp_path, _admin = admin_client
    login_admin(client)

    response = getattr(client, method)(path, **kwargs)

    assert response.status_code in {400, 404}
    assert response.status_code != 200


def test_players_returns_masked_read_only_summary_from_isolated_game_data(admin_client):
    client, tmp_path, _admin = admin_client
    login_admin(client)

    player_id = "player-1234567890"
    player_dir = tmp_path / "game_data" / "sessions" / player_id
    player_dir.mkdir(parents=True)
    (player_dir / "meta.json").write_text(
        json.dumps(
            {
                "last_modified": 1_700_000_000,
                "session_date": "2026-01-01",
                "current_chapter": 3,
                "status": "playing",
                "internal_history_count": 2,
                "display_history_count": 1,
            }
        ),
        encoding="utf-8",
    )

    response = client.get("/api/admin/players")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["summary"]["player_count"] == 1
    assert payload["summary"]["session_count"] == 2
    assert payload["warnings"] == []
    assert len(payload["players"]) == 1

    player = payload["players"][0]
    assert player["player_id"] != player_id
    assert player["latest_session_id"] != player_id
    assert player["player_id"].startswith("player")
    assert player["player_id"].endswith("7890")
    assert "..." in player["player_id"]
    assert player["latest_chapter"] == "3"
    assert player["latest_status"] == "playing"
    assert player["data_sources"] == ["meta.json"]


def test_system_status_uses_isolated_paths_and_masks_sensitive_values(admin_client):
    client, tmp_path, _admin = admin_client
    login_admin(client)

    (tmp_path / "game_data" / "sessions").mkdir(parents=True)
    (tmp_path / "game_data" / "prompts").mkdir(parents=True)
    (tmp_path / "game_data" / "generated_images").mkdir(parents=True)

    response = client.get("/api/admin/system/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["app"]["admin_enabled"] is True
    assert payload["env"]["secret_key_configured"] is True
    assert payload["env"]["admin_password_configured"] is True
    assert payload["database"]["type"] == "sqlite"
    assert payload["database"]["connected"] is True
    assert payload["game_data"]["exists"] is True
    assert payload["game_data"]["sessions_dir_exists"] is True
    assert payload["counts"]["sessions"] == 0

    serialized_payload = json.dumps(payload)
    assert ADMIN_PASSWORD not in serialized_payload
    assert SECRET_KEY not in serialized_payload
    assert "isolated-test.db" not in serialized_payload
