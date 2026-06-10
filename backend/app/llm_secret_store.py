"""
LLM Secret Store Module

Provides secure storage and retrieval of LLM API credentials.
Priority: game_data/secrets/llm.json > settings (env) > defaults
"""
import json
import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from .config import settings

logger = logging.getLogger(__name__)

SECRETS_DIR = Path("game_data/secrets")
LLM_SECRET_FILE = SECRETS_DIR / "llm.json"


def _ensure_secrets_dir():
    """Create secrets directory with restricted permissions if it doesn't exist."""
    if not SECRETS_DIR.exists():
        SECRETS_DIR.mkdir(parents=True, exist_ok=True)
        try:
            os.chmod(SECRETS_DIR, 0o700)
            logger.info(f"Created secrets directory with mode 700: {SECRETS_DIR}")
        except (OSError, NotImplementedError) as e:
            logger.warning(f"Could not set chmod 700 on {SECRETS_DIR}: {e}")


def _read_llm_secret() -> dict[str, Any] | None:
    """Read LLM secret from file."""
    if not LLM_SECRET_FILE.exists():
        return None
    try:
        with open(LLM_SECRET_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            logger.warning(f"Invalid secret file format: {LLM_SECRET_FILE}")
            return None
        return data
    except (json.JSONDecodeError, OSError) as e:
        logger.error(f"Failed to read LLM secret: {e}")
        return None


def _write_llm_secret(data: dict[str, Any]):
    """Write LLM secret to file with atomic replacement."""
    _ensure_secrets_dir()
    temp_file = LLM_SECRET_FILE.with_name(f"{LLM_SECRET_FILE.name}.{uuid.uuid4().hex}.tmp")
    try:
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        try:
            os.chmod(temp_file, 0o600)
        except (OSError, NotImplementedError) as e:
            logger.warning(f"Could not set chmod 600 on temp file: {e}")
        
        temp_file.replace(LLM_SECRET_FILE)
        logger.info(f"LLM secret saved to {LLM_SECRET_FILE}")
    except OSError as e:
        logger.error(f"Failed to write LLM secret: {e}")
        raise
    finally:
        try:
            temp_file.unlink()
        except FileNotFoundError:
            pass


def get_effective_llm_config() -> dict[str, Any]:
    """
    Get effective LLM configuration with priority:
    1. game_data/secrets/llm.json
    2. settings (from .env)
    3. defaults
    
    Returns:
        {
            "base_url": str,
            "api_key": str | None,
            "main_model": str,
            "cheat_check_model": str,
            "source": "secret_store" | "env" | "default"
        }
    """
    secret = _read_llm_secret()
    
    if secret:
        base_url = (secret.get("base_url") or "").strip()
        api_key = (secret.get("api_key") or "").strip()
        main_model = (secret.get("main_model") or "").strip()
        cheat_check_model = (secret.get("cheat_check_model") or "").strip()
        
        if base_url or api_key or main_model or cheat_check_model:
            return {
                "base_url": base_url or settings.OPENAI_BASE_URL,
                "api_key": api_key or settings.OPENAI_API_KEY,
                "main_model": main_model or settings.OPENAI_MODEL,
                "cheat_check_model": cheat_check_model or settings.OPENAI_MODEL_CHEAT_CHECK,
                "source": "secret_store",
            }
    
    # Fallback to settings
    return {
        "base_url": settings.OPENAI_BASE_URL,
        "api_key": settings.OPENAI_API_KEY,
        "main_model": settings.OPENAI_MODEL,
        "cheat_check_model": settings.OPENAI_MODEL_CHEAT_CHECK,
        "source": "env",
    }


def get_masked_llm_config() -> dict[str, Any]:
    """
    Get LLM configuration with masked API key for admin display.
    
    Returns:
        {
            "base_url": str,
            "api_key_configured": bool,
            "api_key_hint": str | None,  # last 4 chars
            "main_model": str,
            "cheat_check_model": str,
            "source": str
        }
    """
    config = get_effective_llm_config()
    api_key = config.get("api_key") or ""
    
    api_key_configured = bool(api_key and api_key != "your_openai_api_key_here")
    api_key_hint = None
    if api_key_configured and len(api_key) >= 4:
        api_key_hint = api_key[-4:]
    
    return {
        "base_url": config["base_url"],
        "api_key_configured": api_key_configured,
        "api_key_hint": api_key_hint,
        "main_model": config["main_model"],
        "cheat_check_model": config["cheat_check_model"],
        "source": config["source"],
    }


def save_llm_config(
    base_url: str | None = None,
    api_key: str | None = None,
    main_model: str | None = None,
    cheat_check_model: str | None = None,
    clear_api_key: bool = False,
) -> dict[str, Any]:
    """
    Save LLM configuration to secret store.
    
    Args:
        base_url: Base URL for LLM API
        api_key: API key (empty/None means don't update unless clear_api_key=True)
        main_model: Main model name
        cheat_check_model: Cheat check model name
        clear_api_key: If True, explicitly clear the API key
        
    Returns:
        Masked configuration after save
    """
    existing = _read_llm_secret() or {}
    
    # Prepare new data
    new_data = {
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }
    
    # Base URL
    if base_url is not None:
        base_url = base_url.strip()
        if base_url:
            # Basic URL validation
            if not (base_url.startswith("http://") or base_url.startswith("https://")):
                raise ValueError("base_url must start with http:// or https://")
            new_data["base_url"] = base_url
        else:
            new_data["base_url"] = ""
    else:
        new_data["base_url"] = existing.get("base_url", "")
    
    # API Key
    if clear_api_key:
        new_data["api_key"] = ""
    elif api_key is not None:
        api_key = api_key.strip()
        if api_key:
            new_data["api_key"] = api_key
        else:
            # Empty string means keep existing
            new_data["api_key"] = existing.get("api_key", "")
    else:
        new_data["api_key"] = existing.get("api_key", "")
    
    # Main Model
    if main_model is not None:
        main_model = main_model.strip()
        if main_model:
            new_data["main_model"] = main_model
        else:
            new_data["main_model"] = ""
    else:
        new_data["main_model"] = existing.get("main_model", "")
    
    # Cheat Check Model
    if cheat_check_model is not None:
        cheat_check_model = cheat_check_model.strip()
        if cheat_check_model:
            new_data["cheat_check_model"] = cheat_check_model
        else:
            new_data["cheat_check_model"] = ""
    else:
        new_data["cheat_check_model"] = existing.get("cheat_check_model", "")
    
    _write_llm_secret(new_data)
    
    return get_masked_llm_config()
