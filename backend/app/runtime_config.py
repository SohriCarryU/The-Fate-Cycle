import copy
import json
import logging
from pathlib import Path
import uuid
from typing import Any


logger = logging.getLogger(__name__)

RUNTIME_CONFIG_PATH = Path("game_data/config/runtime_config.json")
USER_PROMPTS_DIR = Path("game_data/prompts")
DEFAULT_PROMPTS_DIR = Path(__file__).parent / "prompts"
ALLOWED_PROMPT_FILENAMES = {
    "game_master.txt",
    "start_game_prompt.txt",
    "start_trial_prompt.txt",
    "cheat_check.txt",
}
MAX_PROMPT_LENGTH = 200_000


class PromptTooLargeError(ValueError):
    pass

DEFAULT_RUNTIME_CONFIG: dict[str, Any] = {
    "llm": {
        "openai_model": None,
        "openai_model_cheat_check": None,
    },
    "image_generation": {
        "image_gen_model": None,
        "image_gen_idle_seconds": None,
        "image_gen_global_limit": None,
        "image_gen_global_window_seconds": None,
    },
    "feature_flags": {
        "cheat_check_enabled": None,
        "image_generation_enabled": None,
        "live_view_enabled": None,
        "redemption_enabled": None,
    },
    "world_style": {
        "game_title": None,
        "gm_identity": None,
        "world_genre": None,
        "resource_name": None,
        "opportunity_name": None,
        "cycle_name": None,
        "end_action_name": None,
        "tone": None,
    },
}

SENSITIVE_RUNTIME_KEYS = {
    "api_key",
    "apikey",
    "secret",
    "password",
    "token",
    "client_secret",
    "database_url",
    "admin_password",
    "invite_code",
}

RUNTIME_CONFIG_SCHEMA: dict[str, dict[str, dict[str, Any]]] = {
    "llm": {
        "openai_model": {"type": "str", "max_length": 200},
        "openai_model_cheat_check": {"type": "str", "max_length": 200},
    },
    "image_generation": {
        "image_gen_model": {"type": "str", "max_length": 200},
        "image_gen_idle_seconds": {"type": "int", "min": 1, "max": 3600},
        "image_gen_global_limit": {"type": "int", "min": 1, "max": 1000},
        "image_gen_global_window_seconds": {"type": "int", "min": 1, "max": 86400},
    },
    "feature_flags": {
        "cheat_check_enabled": {"type": "bool"},
        "image_generation_enabled": {"type": "bool"},
        "live_view_enabled": {"type": "bool"},
        "redemption_enabled": {"type": "bool"},
    },
    "world_style": {
        "game_title": {"type": "str", "max_length": 100},
        "gm_identity": {"type": "str", "max_length": 100},
        "world_genre": {"type": "str", "max_length": 100},
        "resource_name": {"type": "str", "max_length": 50},
        "opportunity_name": {"type": "str", "max_length": 50},
        "cycle_name": {"type": "str", "max_length": 50},
        "end_action_name": {"type": "str", "max_length": 50},
        "tone": {"type": "str", "max_length": 500},
    },
}

HOT_EFFECTIVE_FIELDS = [
    "llm.openai_model",
    "llm.openai_model_cheat_check",
    "image_generation.image_gen_idle_seconds",
    "image_generation.image_gen_global_limit",
    "image_generation.image_gen_global_window_seconds",
]

CONDITIONAL_HOT_EFFECTIVE_FIELDS = [
    "image_generation.image_gen_model",
]

RESTART_REQUIRED_FIELDS = [
    "OPENAI_API_KEY",
    "OPENAI_BASE_URL",
    "IMAGE_GEN_API_KEY",
    "IMAGE_GEN_BASE_URL",
    "SECRET_KEY",
    "DATABASE_URL",
    "LINUXDO_CLIENT_ID",
    "LINUXDO_CLIENT_SECRET",
    "SIMPLE_LOGIN_INVITE_CODE",
    "ADMIN_PASSWORD",
]

RUNTIME_POLICY_NOTES = [
    "feature_flags fields are saved but are not wired into game behavior yet.",
    "world_style fields are saved but are not applied before the world-style phase.",
    "image_generation.image_gen_model is hot-read only if the image client was initialized at startup.",
    "API keys, secrets, passwords, tokens, invite codes, and database URLs must stay in backend/.env/settings.",
]

_runtime_config: dict[str, Any] = copy.deepcopy(DEFAULT_RUNTIME_CONFIG)


def _deep_merge(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def reload_runtime_config() -> dict[str, Any]:
    """Reload non-sensitive runtime config from game_data/config/runtime_config.json."""
    global _runtime_config
    config = copy.deepcopy(DEFAULT_RUNTIME_CONFIG)

    if RUNTIME_CONFIG_PATH.exists():
        try:
            with RUNTIME_CONFIG_PATH.open("r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict):
                config = _deep_merge(config, data)
            else:
                logger.warning("runtime_config.json must contain a JSON object; using defaults")
        except Exception as e:
            logger.error("Failed to load runtime config: %s", e, exc_info=True)

    _runtime_config = config
    return copy.deepcopy(_runtime_config)


def get_runtime_config() -> dict[str, Any]:
    """Return the latest runtime config. API keys and other secrets stay in .env/settings."""
    return reload_runtime_config()


def _find_sensitive_keys(value: Any, path: str = "") -> list[str]:
    found = []
    if isinstance(value, dict):
        for key, child in value.items():
            key_path = f"{path}.{key}" if path else str(key)
            if str(key).lower() in SENSITIVE_RUNTIME_KEYS:
                found.append(key_path)
            found.extend(_find_sensitive_keys(child, key_path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found.extend(_find_sensitive_keys(child, f"{path}[{index}]"))
    return found


def _normalize_str(value: Any, max_length: int, path: str) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError(f"{path} must be a string or null")
    value = value.strip()
    if not value:
        return None
    if len(value) > max_length:
        raise ValueError(f"{path} must be at most {max_length} characters")
    return value


def _normalize_int(value: Any, min_value: int, max_value: int, path: str) -> int | None:
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f"{path} must be an integer or null")
    if value < min_value or value > max_value:
        raise ValueError(f"{path} must be between {min_value} and {max_value}")
    return value


def _normalize_bool(value: Any, path: str) -> bool | None:
    if value is None:
        return None
    if not isinstance(value, bool):
        raise ValueError(f"{path} must be a boolean or null")
    return value


def validate_runtime_config(config: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    if not isinstance(config, dict):
        raise ValueError("config must be a JSON object")

    sensitive_keys = _find_sensitive_keys(config)
    if sensitive_keys:
        raise ValueError("sensitive fields are not allowed in runtime config: " + ", ".join(sensitive_keys))

    unknown_top_keys = sorted(set(config) - set(RUNTIME_CONFIG_SCHEMA))
    if unknown_top_keys:
        raise ValueError("unknown top-level runtime config keys: " + ", ".join(unknown_top_keys))

    normalized = copy.deepcopy(DEFAULT_RUNTIME_CONFIG)
    warnings = []

    for section, section_value in config.items():
        if not isinstance(section_value, dict):
            raise ValueError(f"{section} must be a JSON object")

        allowed_fields = RUNTIME_CONFIG_SCHEMA[section]
        unknown_fields = sorted(set(section_value) - set(allowed_fields))
        if unknown_fields:
            raise ValueError(f"unknown {section} runtime config keys: " + ", ".join(unknown_fields))

        for field, value in section_value.items():
            rule = allowed_fields[field]
            path = f"{section}.{field}"
            if rule["type"] == "str":
                normalized[section][field] = _normalize_str(value, rule["max_length"], path)
            elif rule["type"] == "int":
                normalized[section][field] = _normalize_int(value, rule["min"], rule["max"], path)
            elif rule["type"] == "bool":
                normalized[section][field] = _normalize_bool(value, path)

    if config.get("feature_flags"):
        warnings.append("feature_flags are saved but are not wired into game behavior yet.")
    if config.get("world_style"):
        warnings.append("world_style is saved but is not applied before the world-style phase.")
    if normalized["image_generation"].get("image_gen_model"):
        warnings.append("image_generation.image_gen_model requires the image client to be initialized at startup.")

    return normalized, warnings


def save_runtime_config(config: dict[str, Any]) -> dict[str, Any]:
    normalized, _warnings = validate_runtime_config(config)
    RUNTIME_CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    temp_path = RUNTIME_CONFIG_PATH.with_name(
        f"{RUNTIME_CONFIG_PATH.name}.{uuid.uuid4().hex}.tmp"
    )
    try:
        temp_path.write_text(
            json.dumps(normalized, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        temp_path.replace(RUNTIME_CONFIG_PATH)
    finally:
        try:
            temp_path.unlink()
        except FileNotFoundError:
            pass
    return reload_runtime_config()


def get_restart_policy() -> dict[str, list[str]]:
    return {
        "hot_effective": HOT_EFFECTIVE_FIELDS,
        "conditional_hot_effective": CONDITIONAL_HOT_EFFECTIVE_FIELDS,
        "restart_required": RESTART_REQUIRED_FIELDS,
        "not_allowed_in_runtime_config": sorted(SENSITIVE_RUNTIME_KEYS),
        "notes": RUNTIME_POLICY_NOTES,
    }


def load_prompt(filename: str) -> str:
    """Load a prompt, preferring game_data/prompts over backend/app/prompts."""
    if Path(filename).name != filename:
        raise ValueError("Prompt filename must not contain path separators")

    for prompt_path in (USER_PROMPTS_DIR / filename, DEFAULT_PROMPTS_DIR / filename):
        try:
            if prompt_path.exists():
                return prompt_path.read_text(encoding="utf-8")
        except OSError as e:
            logger.error("Failed to read prompt %s: %s", prompt_path, e, exc_info=True)
            return ""

    logger.error("Prompt file not found: %s", filename)
    return ""


def _validate_prompt_filename(filename: str) -> str:
    if (
        Path(filename).name != filename
        or "/" in filename
        or "\\" in filename
        or ".." in filename
        or filename not in ALLOWED_PROMPT_FILENAMES
    ):
        raise ValueError("prompt filename is not allowed")
    return filename


def _default_prompt_path(filename: str) -> Path:
    return DEFAULT_PROMPTS_DIR / _validate_prompt_filename(filename)


def _override_prompt_path(filename: str) -> Path:
    return USER_PROMPTS_DIR / _validate_prompt_filename(filename)


def _read_prompt_file(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def list_prompt_statuses() -> list[dict[str, Any]]:
    prompts = []
    for filename in sorted(ALLOWED_PROMPT_FILENAMES):
        default_path = _default_prompt_path(filename)
        override_path = _override_prompt_path(filename)
        has_override = override_path.exists()
        prompts.append(
            {
                "filename": filename,
                "has_default": default_path.exists(),
                "has_override": has_override,
                "effective_source": "override" if has_override else "default",
            }
        )
    return prompts


def get_prompt_details(filename: str) -> dict[str, Any]:
    filename = _validate_prompt_filename(filename)
    default_path = _default_prompt_path(filename)
    override_path = _override_prompt_path(filename)
    if not default_path.exists():
        raise FileNotFoundError(f"default prompt not found: {filename}")

    default_content = _read_prompt_file(default_path)
    has_override = override_path.exists()
    override_content = _read_prompt_file(override_path) if has_override else None
    effective_source = "override" if has_override else "default"
    effective_content = override_content if has_override else default_content
    return {
        "filename": filename,
        "default": {"exists": True, "content": default_content},
        "override": {"exists": has_override, "content": override_content},
        "effective": {"source": effective_source, "content": effective_content},
    }


def save_prompt_override(filename: str, content: str) -> None:
    filename = _validate_prompt_filename(filename)
    if not isinstance(content, str):
        raise ValueError("content must be a string")
    if not content.strip():
        raise ValueError("content must not be empty")
    if len(content) > MAX_PROMPT_LENGTH:
        raise PromptTooLargeError(f"content must be at most {MAX_PROMPT_LENGTH} characters")

    default_path = _default_prompt_path(filename)
    if not default_path.exists():
        raise FileNotFoundError(f"default prompt not found: {filename}")

    USER_PROMPTS_DIR.mkdir(parents=True, exist_ok=True)
    override_path = _override_prompt_path(filename)
    temp_path = override_path.with_name(f"{override_path.name}.{uuid.uuid4().hex}.tmp")
    try:
        temp_path.write_text(content, encoding="utf-8")
        temp_path.replace(override_path)
    finally:
        try:
            temp_path.unlink()
        except FileNotFoundError:
            pass


def delete_prompt_override(filename: str) -> None:
    filename = _validate_prompt_filename(filename)
    override_path = _override_prompt_path(filename)
    try:
        override_path.unlink()
    except FileNotFoundError:
        return
