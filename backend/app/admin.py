from datetime import timedelta, datetime
import secrets
import sys
import os
import platform
import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from . import auth
from . import openai_client
from . import runtime_config
from . import llm_secret_store
from . import db
from .config import settings


router = APIRouter(prefix="/api/admin")


class AdminLoginRequest(BaseModel):
    password: str = ""


class PromptOverrideRequest(BaseModel):
    content: Any = None


class LlmTestRequest(BaseModel):
    kind: str | None = "main"
    model: str | None = None
    message: str | None = "Respond with exactly: OK"


class LlmConfigRequest(BaseModel):
    base_url: str | None = None
    api_key: str | None = None
    main_model: str | None = None
    cheat_check_model: str | None = None
    clear_api_key: bool = False


def _require_admin(request: Request) -> dict:
    payload = _get_admin_payload(request)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
        )
    return payload


def _admin_enabled() -> bool:
    return bool((settings.ADMIN_PASSWORD or "").strip())


def _get_admin_payload(request: Request) -> dict | None:
    token = request.cookies.get(settings.ADMIN_SESSION_COOKIE)
    if not token:
        return None
    try:
        payload = auth.decode_access_token(token)
    except HTTPException:
        return None
    if (
        payload.get("sub") == "admin"
        and payload.get("login_type") == "admin"
        and payload.get("scope") == "admin"
    ):
        return payload
    return None


async def _read_config_payload(request: Request) -> dict[str, Any]:
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="request body must be a JSON object",
        )
    if not isinstance(body, dict) or not isinstance(body.get("config"), dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="request body must contain a config object",
        )
    return body["config"]


def _validate_runtime_config_response(config: dict[str, Any]) -> dict[str, Any]:
    try:
        normalized, warnings = runtime_config.validate_runtime_config(config)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    return {"ok": True, "normalized": normalized, "warnings": warnings}


def _prompt_not_found_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="prompt not found",
    )


@router.post("/login")
async def admin_login(payload: AdminLoginRequest):
    if not _admin_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin login is disabled",
        )

    password = (payload.password or "").strip()
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="password is required",
        )

    if not secrets.compare_digest(password, settings.ADMIN_PASSWORD or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin password",
        )

    expires_delta = timedelta(minutes=settings.ADMIN_SESSION_EXPIRE_MINUTES)
    token = auth.create_access_token(
        data={"sub": "admin", "login_type": "admin", "scope": "admin"},
        expires_delta=expires_delta,
    )
    response = JSONResponse({"ok": True, "admin": {"authenticated": True}})
    response.set_cookie(
        settings.ADMIN_SESSION_COOKIE,
        value=token,
        httponly=True,
        max_age=int(expires_delta.total_seconds()),
        samesite="lax",
        path="/api/admin",
    )
    return response


@router.post("/logout")
async def admin_logout():
    response = JSONResponse({"ok": True})
    response.delete_cookie(settings.ADMIN_SESSION_COOKIE, path="/api/admin")
    return response


@router.get("/status")
async def admin_status(request: Request):
    admin_enabled = _admin_enabled()
    authenticated = bool(admin_enabled and _get_admin_payload(request))
    return {"authenticated": authenticated, "admin_enabled": admin_enabled}


@router.get("/runtime-config")
async def get_admin_runtime_config(request: Request):
    _require_admin(request)
    return {
        "config": runtime_config.get_runtime_config(),
        "source": str(runtime_config.RUNTIME_CONFIG_PATH),
        "exists": runtime_config.RUNTIME_CONFIG_PATH.exists(),
    }


@router.post("/runtime-config/validate")
async def validate_admin_runtime_config(request: Request):
    _require_admin(request)
    config = await _read_config_payload(request)
    return _validate_runtime_config_response(config)


@router.put("/runtime-config")
async def save_admin_runtime_config(request: Request):
    _require_admin(request)
    config = await _read_config_payload(request)
    validation = _validate_runtime_config_response(config)
    try:
        saved_config = runtime_config.save_runtime_config(validation["normalized"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"failed to save runtime config: {e}",
        )
    return {
        "ok": True,
        "config": saved_config,
        "hot_applied": True,
        "restart_required": runtime_config.get_restart_policy()["restart_required"],
    }


@router.get("/restart-policy")
async def get_admin_restart_policy(request: Request):
    _require_admin(request)
    return runtime_config.get_restart_policy()


@router.post("/llm-test")
async def test_admin_llm(request: Request, payload: LlmTestRequest):
    _require_admin(request)
    kind = (payload.kind or "main").strip()
    if kind not in {"main", "cheat_check"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="kind must be main or cheat_check")

    model = payload.model
    if model is not None:
        model = model.strip()
        if not model:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="model must not be blank")
        if len(model) > 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="model must be at most 200 characters")

    message = (payload.message or "Respond with exactly: OK").strip()
    if not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="message must not be blank")
    if len(message) > 500:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="message must be at most 500 characters")

    return await openai_client.test_llm_connection(kind=kind, model=model, message=message)


@router.get("/prompts")
async def list_admin_prompts(request: Request):
    _require_admin(request)
    return {"prompts": runtime_config.list_prompt_statuses()}


@router.get("/prompts/{filename}")
async def get_admin_prompt(request: Request, filename: str):
    _require_admin(request)
    try:
        return runtime_config.get_prompt_details(filename)
    except (ValueError, FileNotFoundError):
        raise _prompt_not_found_error()


@router.put("/prompts/{filename}")
async def save_admin_prompt_override(
    request: Request,
    filename: str,
    payload: PromptOverrideRequest,
):
    _require_admin(request)
    try:
        runtime_config.save_prompt_override(filename, payload.content)
    except FileNotFoundError:
        raise _prompt_not_found_error()
    except runtime_config.PromptTooLargeError as e:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"ok": True, "filename": filename, "effective_source": "override"}


@router.delete("/prompts/{filename}/override")
async def delete_admin_prompt_override(request: Request, filename: str):
    _require_admin(request)
    try:
        runtime_config.delete_prompt_override(filename)
    except ValueError:
        raise _prompt_not_found_error()
    return {"ok": True, "filename": filename, "effective_source": "default"}


@router.get("/prompts/{filename:path}")
async def reject_unsafe_prompt_get(request: Request, filename: str):
    _require_admin(request)
    raise _prompt_not_found_error()


@router.put("/prompts/{filename:path}")
async def reject_unsafe_prompt_put(request: Request, filename: str):
    _require_admin(request)
    raise _prompt_not_found_error()


@router.delete("/prompts/{filename:path}/override")
async def reject_unsafe_prompt_delete(request: Request, filename: str):
    _require_admin(request)
    raise _prompt_not_found_error()


@router.get("/llm-config")
async def get_llm_config(request: Request):
    """Get current LLM configuration with masked API key."""
    _require_admin(request)
    return llm_secret_store.get_masked_llm_config()


@router.post("/llm-config")
async def save_llm_config(request: Request, payload: LlmConfigRequest):
    """Save LLM configuration to secret store."""
    _require_admin(request)
    try:
        result = llm_secret_store.save_llm_config(
            base_url=payload.base_url,
            api_key=payload.api_key,
            main_model=payload.main_model,
            cheat_check_model=payload.cheat_check_model,
            clear_api_key=payload.clear_api_key,
        )
        hot_applied = openai_client.reload_openai_client()
        return {"ok": True, "config": result, "hot_applied": hot_applied}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save LLM config: {e}",
        )


@router.get("/system/status")
async def get_system_status(request: Request):
    """Get system status including environment, database, and game data."""
    _require_admin(request)
    
    warnings = []
    
    # App info
    app_info = {
        "admin_enabled": bool((settings.ADMIN_PASSWORD or "").strip()),
        "environment": os.getenv("ENVIRONMENT", "unknown"),
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "platform": platform.system(),
        "cwd": Path.cwd().name,
    }
    
    # Env configuration (only check if configured, never return values)
    env_file = Path("backend/.env")
    env_info = {
        "env_file_exists": env_file.exists(),
        "secret_key_configured": bool(settings.SECRET_KEY),
        "admin_password_configured": bool((settings.ADMIN_PASSWORD or "").strip()),
        "database_url_configured": bool(settings.DATABASE_URL and settings.DATABASE_URL != "sqlite:///./veloera.db"),
        "openai_api_key_configured": bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here"),
        "openai_base_url_configured": bool(settings.OPENAI_BASE_URL),
    }
    
    if not env_info["env_file_exists"]:
        warnings.append("backend/.env file not found")
    if not env_info["secret_key_configured"]:
        warnings.append("SECRET_KEY not configured")
    if not env_info["admin_password_configured"]:
        warnings.append("ADMIN_PASSWORD not configured")
    
    # Database info
    db_info = {
        "configured": env_info["database_url_configured"],
        "type": "unknown",
        "connected": False,
        "detail": "not checked",
    }
    
    if settings.DATABASE_URL:
        if "sqlite" in settings.DATABASE_URL.lower():
            db_info["type"] = "sqlite"
        elif "mysql" in settings.DATABASE_URL.lower():
            db_info["type"] = "mysql"
        elif "postgres" in settings.DATABASE_URL.lower():
            db_info["type"] = "postgresql"
        
        try:
            conn = db.get_db_connection()
            if conn:
                db_info["connected"] = True
                db_info["detail"] = "connected"
                conn.close()
            else:
                db_info["detail"] = "connection returned None"
        except Exception as e:
            db_info["detail"] = f"connection failed: {type(e).__name__}"
            warnings.append(f"Database connection failed: {type(e).__name__}")
    
    # Game data directories
    game_data_root = Path("game_data")
    game_data_info = {
        "exists": game_data_root.exists(),
        "config_dir_exists": (game_data_root / "config").exists(),
        "runtime_config_exists": (game_data_root / "config" / "runtime_config.json").exists(),
        "prompts_dir_exists": (game_data_root / "prompts").exists(),
        "sessions_dir_exists": (game_data_root / "sessions").exists(),
        "index_exists": (game_data_root / "index.json").exists(),
        "generated_images_dir_exists": (game_data_root / "generated_images").exists(),
        "secrets_dir_exists": (game_data_root / "secrets").exists(),
        "llm_secret_exists": (game_data_root / "secrets" / "llm.json").exists(),
    }
    
    if not game_data_info["exists"]:
        warnings.append("game_data directory does not exist")
    
    # Counts (lightweight)
    counts_info = {
        "sessions": 0,
        "prompt_overrides": 0,
        "generated_images": 0,
    }
    
    try:
        sessions_dir = game_data_root / "sessions"
        if sessions_dir.exists():
            counts_info["sessions"] = len([d for d in sessions_dir.iterdir() if d.is_dir()])
    except Exception:
        pass
    
    try:
        prompts_dir = game_data_root / "prompts"
        if prompts_dir.exists():
            counts_info["prompt_overrides"] = len([f for f in prompts_dir.iterdir() if f.is_file()])
    except Exception:
        pass
    
    try:
        images_dir = game_data_root / "generated_images"
        if images_dir.exists():
            counts_info["generated_images"] = len([f for f in images_dir.iterdir() if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']])
    except Exception:
        pass
    
    return {
        "ok": True,
        "app": app_info,
        "env": env_info,
        "database": db_info,
        "game_data": game_data_info,
        "counts": counts_info,
        "warnings": warnings,
    }


@router.get("/players")
async def get_players(request: Request):
    """Get players and sessions overview (read-only, masked IDs)."""
    _require_admin(request)
    
    warnings = []
    players_data = []
    
    # Read index.json for player list and metadata
    index_file = Path("game_data/index.json")
    sessions_dir = Path("game_data/sessions")
    
    player_index = {}
    if index_file.exists():
        try:
            with open(index_file, "r", encoding="utf-8") as f:
                player_index = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            warnings.append(f"Failed to read index.json: {type(e).__name__}")
    
    # Collect player info from sessions directory
    if sessions_dir.exists():
        try:
            for player_dir in sessions_dir.iterdir():
                if not player_dir.is_dir():
                    continue
                
                player_id = player_dir.name
                meta_file = player_dir / "meta.json"
                
                player_info = {
                    "player_id": _mask_id(player_id),
                    "display_name": None,
                    "session_count": 0,
                    "last_activity": None,
                    "first_seen": None,
                    "latest_session_id": _mask_id(player_id),
                    "latest_chapter": None,
                    "latest_status": None,
                    "data_sources": [],
                }
                
                # Try to read meta.json
                if meta_file.exists():
                    try:
                        with open(meta_file, "r", encoding="utf-8") as f:
                            meta = json.load(f)
                        
                        player_info["data_sources"].append("meta.json")
                        
                        # Extract safe metadata
                        if "last_modified" in meta:
                            player_info["last_activity"] = datetime.fromtimestamp(meta["last_modified"]).isoformat() + "Z"
                        
                        if "session_date" in meta:
                            player_info["first_seen"] = meta["session_date"]
                        
                        if "current_chapter" in meta:
                            player_info["latest_chapter"] = str(meta["current_chapter"])
                        
                        if "status" in meta:
                            player_info["latest_status"] = str(meta.get("status", ""))[:50]
                        
                        # Count history entries
                        internal_count = meta.get("internal_history_count", 0)
                        display_count = meta.get("display_history_count", 0)
                        player_info["session_count"] = max(internal_count, display_count, 1)
                        
                    except (json.JSONDecodeError, OSError) as e:
                        warnings.append(f"Failed to read meta for {_mask_id(player_id)}: {type(e).__name__}")
                
                # Fallback to index.json
                if player_id in player_index:
                    player_info["data_sources"].append("index.json")
                    if not player_info["last_activity"]:
                        try:
                            ts = player_index[player_id]
                            player_info["last_activity"] = datetime.fromtimestamp(ts).isoformat() + "Z"
                        except Exception:
                            pass
                
                players_data.append(player_info)
        
        except Exception as e:
            warnings.append(f"Failed to scan sessions directory: {type(e).__name__}")
    
    # Sort by last_activity desc
    players_data.sort(key=lambda p: p["last_activity"] or "", reverse=True)
    
    # Calculate summary
    now = datetime.utcnow()
    active_24h = 0
    active_7d = 0
    
    for p in players_data:
        if p["last_activity"]:
            try:
                last_time = datetime.fromisoformat(p["last_activity"].replace("Z", ""))
                diff = now - last_time
                if diff < timedelta(hours=24):
                    active_24h += 1
                if diff < timedelta(days=7):
                    active_7d += 1
            except Exception:
                pass
    
    summary = {
        "player_count": len(players_data),
        "session_count": sum(p["session_count"] for p in players_data),
        "active_recent_24h": active_24h,
        "active_recent_7d": active_7d,
    }
    
    return {
        "ok": True,
        "players": players_data,
        "summary": summary,
        "warnings": warnings,
    }


def _mask_id(full_id: str) -> str:
    """Mask player/session ID for privacy: show first 6 + last 4 chars."""
    if not full_id:
        return ""
    if len(full_id) <= 10:
        return full_id[:3] + "***" + full_id[-2:]
    return full_id[:6] + "..." + full_id[-4:]
