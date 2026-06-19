const API_BASE_URL = "/api/admin";
const MAX_PROMPT_LENGTH = 200000;
const LANGUAGE_STORAGE_KEY = "adminLanguage";

const translations = {
    zh: {
        "The Fate Cycle Admin": "命运轮回后台",
        "Management Console": "管理控制台",
        "Checking...": "检查中...",
        "Logout": "退出",
        "Admin Login": "管理员登录",
        "Password is sent only to the backend login API. It is not stored in localStorage or sessionStorage.": "密码只会发送到后端登录接口，不会存入 localStorage 或 sessionStorage。",
        "Admin password": "管理员密码",
        "Login": "登录",
        "Dashboard": "仪表盘",
        "Players": "玩家",
        "LLM Config": "LLM 配置",
        "Runtime Config": "运行时配置",
        "Prompts": "提示词",
        "LLM Test": "LLM 测试",
        "System": "系统",
        "Refresh Dashboard": "刷新仪表盘",
        "LLM API": "LLM API",
        "Checking LLM configuration...": "正在检查 LLM 配置...",
        "Checking runtime config...": "正在检查运行时配置...",
        "Checking system status...": "正在检查系统状态...",
        "Loading player summary...": "正在加载玩家摘要...",
        "Loading prompt summary...": "正在加载提示词摘要...",
        "Refresh": "刷新",
        "Summary": "摘要",
        "Sessions": "会话",
        "Active 24h": "24 小时活跃",
        "Active 7d": "7 天活跃",
        "Player List": "玩家列表",
        "Player list filters": "玩家列表筛选",
        "Search": "搜索",
        "ID, status, chapter, source": "ID、状态、章节、来源",
        "Activity": "活跃度",
        "All players": "全部玩家",
        "Inactive 7d": "7 天未活跃",
        "Unknown activity": "未知活跃度",
        "Clear": "清除",
        "No players loaded": "尚未加载玩家",
        "No players found": "未找到玩家",
        "Warnings": "警告",
        "LLM API Config": "LLM API 配置",
        "Set the API key, base URL, and model names for LLM calls. The API key is stored server-side only and is never returned in full. Leave API Key blank to keep the existing key. Tick \"Clear API Key\" to remove it entirely.": "设置 LLM 调用使用的 API key、Base URL 和模型名。API key 只保存在服务端，永远不会完整返回。API Key 留空会保留现有 key；勾选“清除 API Key”会彻底移除。",
        "Base URL": "Base URL",
        "API Key": "API Key",
        "Leave blank to keep existing key": "留空以保留现有 key",
        "Clear API Key (requires confirmation)": "清除 API Key（需要确认）",
        "Main Model": "主模型",
        "Cheat Check Model": "反作弊模型",
        "Load Config": "加载配置",
        "Save Config": "保存配置",
        "Test Connection": "测试连接",
        "Form Mode": "表单模式",
        "Advanced JSON": "高级 JSON",
        "Do not put API keys, secrets, passwords, tokens, invite codes, or database URLs here. feature_flags and world_style are currently saved only; they do not change game behavior yet.": "不要在这里填写 API key、secret、password、token、邀请码或数据库 URL。feature_flags 和 world_style 目前只会保存，尚不会改变游戏行为。",
        "LLM": "LLM",
        "Image Generation": "图片生成",
        "Image Model": "图片模型",
        "Idle Seconds": "空闲秒数",
        "Global Limit": "全局上限",
        "Window Seconds": "窗口秒数",
        "Feature Flags": "功能开关",
        "Cheat Check Enabled": "启用反作弊检查",
        "Image Generation Enabled": "启用图片生成",
        "Live View Enabled": "启用 Live 观看",
        "Redemption Enabled": "启用兑换码",
        "World Style": "世界风格",
        "Game Title": "游戏标题",
        "GM Identity": "GM 身份",
        "World Genre": "世界类型",
        "Resource Name": "资源名称",
        "Opportunity Name": "机会名称",
        "Cycle Name": "轮回名称",
        "End Action Name": "结束动作名称",
        "Tone": "语气",
        "Runtime config JSON": "运行时配置 JSON",
        "Source": "来源",
        "Exists": "存在",
        "Reload": "重新加载",
        "Validate": "验证",
        "Save": "保存",
        "Unsaved changes": "未保存的更改",
        "Restart Policy": "重启策略",
        "Some settings apply on the next call; secrets and API client settings still require backend restart.": "部分设置会在下次调用时生效；secret 和 API 客户端设置仍需要后端重启。",
        "Prompt changes affect future calls only. Existing session history is not migrated automatically.": "提示词变更只影响未来调用；现有会话历史不会自动迁移。",
        "Prompt": "提示词",
        "Effective source": "生效来源",
        "Default content (read only)": "默认内容（只读）",
        "Override content (editable)": "覆盖内容（可编辑）",
        "Effective content (read only)": "生效内容（只读）",
        "Save Override": "保存覆盖",
        "Reset to Default": "重置为默认",
        "Delete Override": "删除覆盖",
        "Low-cost ping only. This does not run game prompts, image generation, or gameplay logic.": "只执行低成本连通性测试，不会运行游戏提示词、图片生成或游戏逻辑。",
        "Kind": "类型",
        "Model override": "模型覆盖",
        "Leave blank to use effective model": "留空以使用生效模型",
        "Message": "消息",
        "Test LLM": "测试 LLM",
        "System Status": "系统状态",
        "Refresh Status": "刷新状态",
        "Application": "应用",
        "Environment Configuration": "环境配置",
        "Database": "数据库",
        "Game Data": "游戏数据",
        "Resource Counts": "资源计数",
        "Admin disabled": "后台已禁用",
        "Logged in": "已登录",
        "Not logged in": "未登录",
        "Not logged in or session expired.": "未登录或会话已过期。",
        "Request failed with HTTP {status}": "请求失败，HTTP 状态码 {status}",
        "Logged in.": "已登录。",
        "Logged out.": "已退出。",
        "Runtime config must be a JSON object.": "运行时配置必须是 JSON 对象。",
        "Invalid JSON": "无效 JSON",
        "Loading runtime config...": "正在加载运行时配置...",
        "Runtime config loaded.": "运行时配置已加载。",
        "Validating runtime config...": "正在验证运行时配置...",
        "Runtime config is valid.": "运行时配置有效。",
        "Saving runtime config...": "正在保存运行时配置...",
        "Runtime config saved.": "运行时配置已保存。",
        "Cannot switch to form mode: {message}": "无法切换到表单模式：{message}",
        "Loading LLM config...": "正在加载 LLM 配置...",
        "Loaded (source: {source}).": "已加载（来源：{source}）。",
        "LLM config saved.": "LLM 配置已保存。",
        "Testing LLM connection...": "正在测试 LLM 连接...",
        "LLM connection OK.": "LLM 连接正常。",
        "LLM test returned an error.": "LLM 测试返回错误。",
        "Testing LLM...": "正在测试 LLM...",
        "LLM test completed.": "LLM 测试完成。",
        "Configured — ends in …{hint}. Leave blank to keep.": "已配置，末尾为 …{hint}。留空以保留。",
        "Not configured. Enter API key to set.": "未配置。输入 API Key 以设置。",
        "API key configured, last 4 chars: {hint}": "API Key 已配置，后 4 位：{hint}",
        "No API key configured.": "未配置 API Key。",
        "Loading prompts...": "正在加载提示词...",
        "Prompts loaded.": "提示词已加载。",
        "Loading prompt...": "正在加载提示词...",
        "Prompt loaded.": "提示词已加载。",
        "Prompt override saved.": "提示词覆盖已保存。",
        "Prompt reset to default.": "提示词已重置为默认。",
        "Prompt override deleted.": "提示词覆盖已删除。",
        "Prompt content exceeds maximum length of {count} characters.": "提示词内容超过最大长度 {count} 个字符。",
        "Reset \"{filename}\" to default? This will delete the override and cannot be undone.": "将“{filename}”重置为默认？这会删除覆盖内容且无法撤销。",
        "Delete override for \"{filename}\"? This will restore the default prompt and cannot be undone.": "删除“{filename}”的覆盖内容？这会恢复默认提示词且无法撤销。",
        "override": "覆盖",
        "Loading system status...": "正在加载系统状态...",
        "System status loaded.": "系统状态已加载。",
        "Loading players...": "正在加载玩家...",
        "Players loaded.": "玩家已加载。",
        "Configured": "已配置",
        "Not configured": "未配置",
        "Available": "可用",
        "Missing": "缺失",
        "Error": "错误",
        "No prompts found": "未找到提示词",
        "Check installation or prompts directory.": "请检查安装或提示词目录。",
        "Healthy": "健康",
        "Check status": "检查状态",
        "connected": "已连接",
        "not connected": "未连接",
        "exists": "存在",
        "missing": "缺失",
        "Total": "总数",
        "Overrides": "覆盖",
        "Env File": "环境文件",
        ".env File": ".env 文件",
        "Admin Enabled": "后台启用",
        "Environment": "环境",
        "Python": "Python",
        "Platform": "平台",
        "Working Dir": "工作目录",
        "Connected": "已连接",
        "Detail": "详情",
        "Type": "类型",
        "Root": "根目录",
        "Config Dir": "配置目录",
        "Prompts Dir": "提示词目录",
        "Sessions Dir": "会话目录",
        "Index": "索引",
        "Images Dir": "图片目录",
        "Secrets Dir": "密钥目录",
        "LLM Secret": "LLM 密钥",
        "Prompt Overrides": "提示词覆盖",
        "Generated Images": "生成图片",
        "Yes": "是",
        "No": "否",
        "OK": "正常",
        "N/A": "无",
        "Main": "主模型",
        "Cheat Check": "反作弊",
        "(not set)": "（未设置）",
        "{count} prompt": "{count} 个提示词",
        "{count} prompts": "{count} 个提示词",
        "{count} player": "{count} 个玩家",
        "{count} players": "{count} 个玩家",
        "Showing all {count} {noun}": "显示全部 {count} 个{noun}",
        "Showing {visible} of {total} players": "显示 {visible} / {total} 个玩家",
        "player": "玩家",
        "players": "玩家",
        "Last Activity": "最后活跃",
        "Chapter": "章节",
        "Status": "状态",
        "No metadata sources": "无元数据来源",
        "No players match the current filters": "没有玩家匹配当前筛选",
        "Refreshing...": "刷新中...",
        "Clear the stored API key? The key cannot be recovered.": "清除已保存的 API Key？该 key 无法恢复。",
        "Reload runtime config and discard unsaved changes?": "重新加载运行时配置并放弃未保存的更改？",
        "You have unsaved runtime config changes. Leave this section without saving?": "运行时配置有未保存的更改。确定不保存就离开吗？",
        "You have unsaved changes. Discard them and switch to another prompt?": "有未保存的更改。确定放弃并切换到其他提示词吗？",
        "Prompt content cannot be empty or whitespace-only.": "提示词内容不能为空或只包含空白。",
        "Hot effective": "热生效",
        "Conditional hot effective": "有条件热生效",
        "Restart required": "需要重启",
        "Not allowed in runtime_config": "不允许写入 runtime_config",
        "Notes": "备注",
        "main": "main",
        "cheat_check": "cheat_check"
    },
    en: {},
};

Object.keys(translations.zh).forEach((key) => {
    translations.en[key] = key;
});

const state = {
    authenticated: false,
    adminEnabled: false,
    authStatusKnown: false,
    selectedPrompt: null,
    activeSection: "dashboard",
    loadedPromptContent: "",
    hasUnsavedPromptChanges: false,
    selectedPromptHasOverride: false,
    runtimeConfigMode: "form",
    loadedRuntimeConfigText: "",
    hasUnsavedRuntimeChanges: false,
    runtimeActionsBusy: false,
    runtimeFeatureFlags: {
        cheat_check_enabled: null,
        image_generation_enabled: null,
        live_view_enabled: null,
        redemption_enabled: null,
    },
    prompts: [],
    players: [],
    language: "zh",
};

const el = {
    languageToggle: document.getElementById("language-toggle"),
    logoutButton: document.getElementById("logout-button"),
    authStatus: document.getElementById("auth-status"),
    globalMessage: document.getElementById("global-message"),
    loginPanel: document.getElementById("login-panel"),
    loginForm: document.getElementById("login-form"),
    password: document.getElementById("admin-password"),
    loginMessage: document.getElementById("login-message"),
    adminConsole: document.getElementById("admin-console"),
    runtimeSource: document.getElementById("runtime-source"),
    runtimeExists: document.getElementById("runtime-exists"),
    runtimeConfigText: document.getElementById("runtime-config-text"),
    runtimeFormModeButton: document.getElementById("runtime-form-mode-button"),
    runtimeJsonModeButton: document.getElementById("runtime-json-mode-button"),
    runtimeFormPanel: document.getElementById("runtime-form-panel"),
    runtimeJsonPanel: document.getElementById("runtime-json-panel"),
    formOpenaiModel: document.getElementById("form-openai-model"),
    formOpenaiModelCheatCheck: document.getElementById("form-openai-model-cheat-check"),
    formImageGenModel: document.getElementById("form-image-gen-model"),
    formImageGenIdleSeconds: document.getElementById("form-image-gen-idle-seconds"),
    formImageGenGlobalLimit: document.getElementById("form-image-gen-global-limit"),
    formImageGenGlobalWindowSeconds: document.getElementById("form-image-gen-global-window-seconds"),
    formCheatCheckEnabled: document.getElementById("form-cheat-check-enabled"),
    formImageGenerationEnabled: document.getElementById("form-image-generation-enabled"),
    formLiveViewEnabled: document.getElementById("form-live-view-enabled"),
    formRedemptionEnabled: document.getElementById("form-redemption-enabled"),
    formGameTitle: document.getElementById("form-game-title"),
    formGmIdentity: document.getElementById("form-gm-identity"),
    formWorldGenre: document.getElementById("form-world-genre"),
    formResourceName: document.getElementById("form-resource-name"),
    formOpportunityName: document.getElementById("form-opportunity-name"),
    formCycleName: document.getElementById("form-cycle-name"),
    formEndActionName: document.getElementById("form-end-action-name"),
    formTone: document.getElementById("form-tone"),
    reloadConfigButton: document.getElementById("reload-config-button"),
    validateConfigButton: document.getElementById("validate-config-button"),
    saveConfigButton: document.getElementById("save-config-button"),
    runtimeDirtyIndicator: document.getElementById("runtime-dirty-indicator"),
    runtimeMessage: document.getElementById("runtime-message"),
    runtimeResult: document.getElementById("runtime-result"),
    restartPolicy: document.getElementById("restart-policy"),
    llmConfigBaseUrl: document.getElementById("llm-config-base-url"),
    llmConfigApiKey: document.getElementById("llm-config-api-key"),
    llmConfigClearKey: document.getElementById("llm-config-clear-key"),
    llmConfigMainModel: document.getElementById("llm-config-main-model"),
    llmConfigCheatModel: document.getElementById("llm-config-cheat-model"),
    llmConfigKeyHint: document.getElementById("llm-config-key-hint"),
    llmConfigLoadButton: document.getElementById("llm-config-load-button"),
    llmConfigSaveButton: document.getElementById("llm-config-save-button"),
    llmConfigTestButton: document.getElementById("llm-config-test-button"),
    llmConfigMessage: document.getElementById("llm-config-message"),
    llmConfigResult: document.getElementById("llm-config-result"),
    llmKind: document.getElementById("llm-kind"),
    llmModel: document.getElementById("llm-model"),
    llmMessage: document.getElementById("llm-message"),
    llmTestButton: document.getElementById("llm-test-button"),
    llmMessageOutput: document.getElementById("llm-message-output"),
    llmResult: document.getElementById("llm-result"),
    promptList: document.getElementById("prompt-list"),
    promptListMessage: document.getElementById("prompt-list-message"),
    promptEditor: document.getElementById("prompt-editor"),
    promptTitle: document.getElementById("prompt-title"),
    promptEffectiveSource: document.getElementById("prompt-effective-source"),
    promptDefault: document.getElementById("prompt-default"),
    promptOverride: document.getElementById("prompt-override"),
    promptEffective: document.getElementById("prompt-effective"),
    savePromptButton: document.getElementById("save-prompt-button"),
    resetPromptButton: document.getElementById("reset-prompt-button"),
    deletePromptButton: document.getElementById("delete-prompt-button"),
    promptDirtyIndicator: document.getElementById("prompt-dirty-indicator"),
    promptMessage: document.getElementById("prompt-message"),
    dashLlmStatus: document.getElementById("dash-llm-status"),
    dashLlmDetails: document.getElementById("dash-llm-details"),
    dashRuntimeStatus: document.getElementById("dash-runtime-status"),
    dashRuntimeDetails: document.getElementById("dash-runtime-details"),
    dashPromptsStatus: document.getElementById("dash-prompts-status"),
    dashPromptsDetails: document.getElementById("dash-prompts-details"),
    dashPlayersStatus: document.getElementById("dash-players-status"),
    dashPlayersDetails: document.getElementById("dash-players-details"),
    dashSystemStatus: document.getElementById("dash-system-status"),
    dashSystemDetails: document.getElementById("dash-system-details"),
    dashboardRefreshButton: document.getElementById("dashboard-refresh-button"),
    playersRefreshButton: document.getElementById("players-refresh-button"),
    playersMessage: document.getElementById("players-message"),
    playersCount: document.getElementById("players-count"),
    sessionsCount: document.getElementById("sessions-count"),
    active24h: document.getElementById("active-24h"),
    active7d: document.getElementById("active-7d"),
    playersList: document.getElementById("players-list"),
    playersEmpty: document.getElementById("players-empty"),
    playersFilter: document.getElementById("players-filter"),
    playersActivityFilter: document.getElementById("players-activity-filter"),
    playersClearFiltersButton: document.getElementById("players-clear-filters-button"),
    playersFilterCount: document.getElementById("players-filter-count"),
    playersWarnings: document.getElementById("players-warnings"),
    playersWarningsPanel: document.getElementById("players-warnings-panel"),
    systemRefreshButton: document.getElementById("system-refresh-button"),
    systemMessage: document.getElementById("system-message"),
    systemApp: document.getElementById("system-app"),
    systemEnv: document.getElementById("system-env"),
    systemDatabase: document.getElementById("system-database"),
    systemGameData: document.getElementById("system-game-data"),
    systemCounts: document.getElementById("system-counts"),
    systemWarnings: document.getElementById("system-warnings"),
    systemWarningsPanel: document.getElementById("system-warnings-panel"),
};

function normalizeLanguage(language) {
    return language === "en" ? "en" : "zh";
}

function t(key, replacements = {}) {
    const language = normalizeLanguage(state.language);
    let text = translations[language]?.[key] ?? translations.en[key] ?? key;
    Object.entries(replacements).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value));
    });
    return text;
}

function getStoredTranslationReplacements(element) {
    if (!element?.dataset?.i18nReplacements) return {};
    try {
        return JSON.parse(element.dataset.i18nReplacements);
    } catch (_error) {
        return {};
    }
}

function setTranslatedText(element, key, replacements = {}) {
    if (!element) return;
    element.dataset.i18n = key;
    element.dataset.i18nReplacements = JSON.stringify(replacements);
    element.textContent = `${element.dataset.i18nPrefix || ""}${t(key, replacements)}${element.dataset.i18nSuffix || ""}`;
}

function setTranslatedStatus(element, icon, key, replacements = {}) {
    if (!element) return;
    element.dataset.i18nPrefix = `${icon} `;
    setTranslatedText(element, key, replacements);
}

function createTranslatedValue(key, replacements = {}) {
    const element = document.createElement("span");
    setTranslatedText(element, key, replacements);
    return element;
}

function setTranslatedPlaceholder(element, key, replacements = {}) {
    if (!element) return;
    element.dataset.i18nPlaceholder = key;
    element.dataset.i18nPlaceholderReplacements = JSON.stringify(replacements);
    element.placeholder = t(key, replacements);
}

function clearTranslationState(element) {
    if (!element?.dataset) return;
    delete element.dataset.i18n;
    delete element.dataset.i18nReplacements;
    delete element.dataset.i18nPrefix;
    delete element.dataset.i18nSuffix;
}

function setMessage(element, text, type = "") {
    clearTranslationState(element);
    element.textContent = text || "";
    element.classList.toggle("success", type === "success");
    element.classList.toggle("error", type === "error");
}

function setTranslatedMessage(element, key, type = "", replacements = {}) {
    setTranslatedText(element, key, replacements);
    element.classList.toggle("success", type === "success");
    element.classList.toggle("error", type === "error");
}

function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = `${element.dataset.i18nPrefix || ""}${t(element.dataset.i18n, getStoredTranslationReplacements(element))}${element.dataset.i18nSuffix || ""}`;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        let replacements = {};
        try {
            replacements = element.dataset.i18nPlaceholderReplacements
                ? JSON.parse(element.dataset.i18nPlaceholderReplacements)
                : {};
        } catch (_error) {
            replacements = {};
        }
        element.placeholder = t(element.dataset.i18nPlaceholder, replacements);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        if (typeof element.setAttribute === "function") {
            element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
        }
    });
    document.querySelectorAll("[data-i18n-template='Effective source']").forEach((element) => {
        if (element.firstChild) {
            element.firstChild.textContent = `${t("Effective source")}: `;
        }
    });
    document.querySelectorAll("[data-i18n-label-prefix]").forEach((element) => {
        const label = `${t(element.dataset.i18nLabelPrefix)}: `;
        if (element.firstChild) {
            element.firstChild.textContent = label;
        }
    });
    if (document.documentElement) {
        document.documentElement.lang = state.language === "en" ? "en" : "zh-CN";
    }
    if (el.languageToggle) {
        el.languageToggle.textContent = state.language === "zh" ? "English" : "中文";
        if (typeof el.languageToggle.setAttribute === "function") {
            el.languageToggle.setAttribute("aria-label", state.language === "zh" ? "Switch to English" : "切换到中文");
        }
    }
}

function initializeStaticTranslations() {
    document.querySelectorAll("title, h1, h2, h3, legend, button, .summary-label, .note, .header-subtitle, .dirty-indicator, .filter-count, .empty-state, label[for], label span, option").forEach((element) => {
        const text = element.textContent.trim();
        if (translations.zh[text]) {
            element.dataset.i18n = text;
        }
    });
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((element) => {
        const text = element.getAttribute("placeholder");
        if (text && translations.zh[text]) {
            element.dataset.i18nPlaceholder = text;
        }
    });
    document.querySelectorAll("[aria-label]").forEach((element) => {
        const text = element.getAttribute("aria-label");
        if (text && translations.zh[text]) {
            element.dataset.i18nAriaLabel = text;
        }
    });

    const effectiveSourceLabel = document.querySelector("#prompt-editor p");
    if (effectiveSourceLabel) {
        effectiveSourceLabel.dataset.i18nTemplate = "Effective source";
    }
    document.querySelectorAll(".meta-row span").forEach((element) => {
        const label = element.textContent.split(":")[0]?.trim();
        if (translations.zh[label]) {
            element.dataset.i18nLabelPrefix = label;
        }
    });
    applyStaticTranslations();
}

function setLanguage(language) {
    state.language = normalizeLanguage(language);
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language);
    } catch (_error) {
        // Language switching still works for the current page when storage is unavailable.
    }
    applyStaticTranslations();
    if (state.authStatusKnown) {
        setAuthenticated(state.authenticated, state.adminEnabled);
    }
    updateRuntimeDirtyState();
    updatePromptButtons();
    if (state.prompts.length > 0) {
        renderPromptList();
    }
    if (state.players.length > 0) {
        applyPlayersFilters();
    }
}

function loadStoredLanguage() {
    try {
        return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
    } catch (_error) {
        return "zh";
    }
}

function setAuthenticated(authenticated, adminEnabled = state.adminEnabled) {
    state.authStatusKnown = true;
    state.authenticated = authenticated;
    state.adminEnabled = adminEnabled;
    el.logoutButton.classList.toggle("hidden", !authenticated);
    el.loginPanel.classList.toggle("hidden", authenticated || !adminEnabled);
    el.adminConsole.classList.toggle("hidden", !authenticated);

    if (!adminEnabled) {
        setTranslatedText(el.authStatus, "Admin disabled");
        el.authStatus.className = "auth-badge auth-disabled";
    } else if (authenticated) {
        setTranslatedText(el.authStatus, "Logged in");
        el.authStatus.className = "auth-badge auth-ok";
    } else {
        setTranslatedText(el.authStatus, "Not logged in");
        el.authStatus.className = "auth-badge auth-pending";
    }
}

function switchSection(sectionName) {
    if (
        state.activeSection === "runtime-config"
        && sectionName !== "runtime-config"
        && !confirmDiscardRuntimeChanges(t("You have unsaved runtime config changes. Leave this section without saving?"))
    ) {
        return;
    }
    state.activeSection = sectionName;
    document.querySelectorAll(".nav-item").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.section === sectionName);
    });
    document.querySelectorAll(".content-section").forEach(section => {
        section.classList.toggle("active", section.id === `section-${sectionName}`);
    });
    if (sectionName === "dashboard") {
        loadDashboard();
    } else if (sectionName === "players") {
        loadPlayers();
    } else if (sectionName === "system") {
        loadSystemStatus();
    }
}

async function api(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });

    let data = null;
    try {
        data = await response.json();
    } catch (_error) {
        data = {};
    }

    if (response.status === 401) {
        setAuthenticated(false, true);
        throw new Error(t("Not logged in or session expired."));
    }
    if (!response.ok) {
        throw new Error(data.detail || t("Request failed with HTTP {status}", { status: response.status }));
    }
    return data;
}

function parseRuntimeConfigText() {
    try {
        const parsed = JSON.parse(el.runtimeConfigText.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error(t("Runtime config must be a JSON object."));
        }
        return parsed;
    } catch (error) {
        throw new Error(`${t("Invalid JSON")}: ${error.message}`);
    }
}

function renderJson(element, data) {
    element.textContent = JSON.stringify(data, null, 2);
}

function appendLabeledRow(container, label, value) {
    const row = document.createElement("p");
    const labelElement = document.createElement("strong");
    if (translations.zh[label]) {
        labelElement.dataset.i18n = label;
        labelElement.dataset.i18nSuffix = ":";
        labelElement.textContent = `${t(label)}:`;
    } else {
        labelElement.textContent = `${label}:`;
    }
    row.append(labelElement, " ");
    if (value && typeof value === "object" && typeof value.appendChild === "function") {
        row.appendChild(value);
    } else {
        row.append(String(value ?? ""));
    }
    container.appendChild(row);
}

function renderDetailRows(element, rows) {
    element.textContent = "";
    rows.forEach(([label, value]) => appendLabeledRow(element, label, value));
}

function setRuntimeActionsDisabled(disabled) {
    state.runtimeActionsBusy = disabled;
    el.reloadConfigButton.disabled = disabled;
    el.validateConfigButton.disabled = disabled;
    el.saveConfigButton.disabled = disabled || !state.hasUnsavedRuntimeChanges;
}

function setLlmConfigActionsDisabled(disabled) {
    el.llmConfigLoadButton.disabled = disabled;
    el.llmConfigSaveButton.disabled = disabled;
    el.llmConfigTestButton.disabled = disabled;
}

function setLlmTestActionsDisabled(disabled) {
    el.llmTestButton.disabled = disabled;
}

function getRuntimeEditorConfig() {
    if (state.runtimeConfigMode === "form") {
        const config = buildConfigFromForm();
        el.runtimeConfigText.value = JSON.stringify(config, null, 2);
    }
    return parseRuntimeConfigText();
}

function getRuntimeEditorText() {
    if (state.runtimeConfigMode === "form") {
        return JSON.stringify(buildConfigFromForm(), null, 2);
    }
    return el.runtimeConfigText.value;
}

function setRuntimeDirtyState(hasChanges) {
    state.hasUnsavedRuntimeChanges = hasChanges;
    el.saveConfigButton.disabled = state.runtimeActionsBusy || !hasChanges;
    if (el.runtimeDirtyIndicator) {
        el.runtimeDirtyIndicator.classList.toggle("hidden", !hasChanges);
    }
}

function updateRuntimeDirtyState() {
    if (!state.loadedRuntimeConfigText) {
        setRuntimeDirtyState(false);
        return;
    }
    setRuntimeDirtyState(getRuntimeEditorText() !== state.loadedRuntimeConfigText);
}

function markRuntimeConfigClean(config) {
    state.loadedRuntimeConfigText = JSON.stringify(config, null, 2);
    setRuntimeDirtyState(false);
}

function confirmDiscardRuntimeChanges(message) {
    if (!state.hasUnsavedRuntimeChanges) return true;
    return window.confirm(message);
}

function hasUnsavedAdminChanges() {
    return state.hasUnsavedPromptChanges || state.hasUnsavedRuntimeChanges;
}

function warnBeforeUnload(event) {
    if (!hasUnsavedAdminChanges()) return;
    event.preventDefault();
    event.returnValue = "";
}

async function checkStatus() {
    try {
        const status = await api("/status");
        setAuthenticated(status.authenticated, status.admin_enabled);
        if (status.authenticated) {
            await loadAdminData();
        }
    } catch (error) {
        setAuthenticated(false, true);
        setMessage(el.globalMessage, error.message, "error");
    }
}

async function login(event) {
    event.preventDefault();
    setMessage(el.loginMessage, "");
    try {
        await api("/login", {
            method: "POST",
            body: JSON.stringify({ password: el.password.value }),
        });
        el.password.value = "";
        setAuthenticated(true, true);
        setTranslatedMessage(el.globalMessage, "Logged in.", "success");
        await loadAdminData();
    } catch (error) {
        setMessage(el.loginMessage, error.message, "error");
    }
}

async function logout() {
    try {
        await api("/logout", { method: "POST" });
    } catch (_error) {
        // The local UI should still return to a logged-out state.
    }
    setAuthenticated(false, true);
    setTranslatedMessage(el.globalMessage, "Logged out.", "success");
}

async function loadRuntimeConfig() {
    if (!confirmDiscardRuntimeChanges(t("Reload runtime config and discard unsaved changes?"))) {
        return;
    }
    setRuntimeActionsDisabled(true);
    setTranslatedMessage(el.runtimeMessage, "Loading runtime config...");
    try {
        const data = await api("/runtime-config");
        el.runtimeSource.textContent = data.source;
        setTranslatedText(el.runtimeExists, data.exists ? "exists" : "missing");
        el.runtimeConfigText.value = JSON.stringify(data.config, null, 2);
        loadRuntimeConfigForm(data.config);
        markRuntimeConfigClean(data.config);
        el.runtimeResult.textContent = "";
        setTranslatedMessage(el.runtimeMessage, "Runtime config loaded.", "success");
    } catch (error) {
        setMessage(el.runtimeMessage, error.message, "error");
    } finally {
        setRuntimeActionsDisabled(false);
    }
}

function loadRuntimeConfigForm(config) {
    el.formOpenaiModel.value = config.llm?.openai_model || "";
    el.formOpenaiModelCheatCheck.value = config.llm?.openai_model_cheat_check || "";
    el.formImageGenModel.value = config.image_generation?.image_gen_model || "";
    el.formImageGenIdleSeconds.value = config.image_generation?.image_gen_idle_seconds || "";
    el.formImageGenGlobalLimit.value = config.image_generation?.image_gen_global_limit || "";
    el.formImageGenGlobalWindowSeconds.value = config.image_generation?.image_gen_global_window_seconds || "";
    setRuntimeFeatureFlagValue("cheat_check_enabled", config.feature_flags?.cheat_check_enabled ?? null);
    setRuntimeFeatureFlagValue("image_generation_enabled", config.feature_flags?.image_generation_enabled ?? null);
    setRuntimeFeatureFlagValue("live_view_enabled", config.feature_flags?.live_view_enabled ?? null);
    setRuntimeFeatureFlagValue("redemption_enabled", config.feature_flags?.redemption_enabled ?? null);
    el.formGameTitle.value = config.world_style?.game_title || "";
    el.formGmIdentity.value = config.world_style?.gm_identity || "";
    el.formWorldGenre.value = config.world_style?.world_genre || "";
    el.formResourceName.value = config.world_style?.resource_name || "";
    el.formOpportunityName.value = config.world_style?.opportunity_name || "";
    el.formCycleName.value = config.world_style?.cycle_name || "";
    el.formEndActionName.value = config.world_style?.end_action_name || "";
    el.formTone.value = config.world_style?.tone || "";
}

function buildConfigFromForm() {
    return {
        llm: {
            openai_model: el.formOpenaiModel.value.trim() || null,
            openai_model_cheat_check: el.formOpenaiModelCheatCheck.value.trim() || null,
        },
        image_generation: {
            image_gen_model: el.formImageGenModel.value.trim() || null,
            image_gen_idle_seconds: el.formImageGenIdleSeconds.value ? parseInt(el.formImageGenIdleSeconds.value, 10) : null,
            image_gen_global_limit: el.formImageGenGlobalLimit.value ? parseInt(el.formImageGenGlobalLimit.value, 10) : null,
            image_gen_global_window_seconds: el.formImageGenGlobalWindowSeconds.value ? parseInt(el.formImageGenGlobalWindowSeconds.value, 10) : null,
        },
        feature_flags: {
            cheat_check_enabled: state.runtimeFeatureFlags.cheat_check_enabled,
            image_generation_enabled: state.runtimeFeatureFlags.image_generation_enabled,
            live_view_enabled: state.runtimeFeatureFlags.live_view_enabled,
            redemption_enabled: state.runtimeFeatureFlags.redemption_enabled,
        },
        world_style: {
            game_title: el.formGameTitle.value.trim() || null,
            gm_identity: el.formGmIdentity.value.trim() || null,
            world_genre: el.formWorldGenre.value.trim() || null,
            resource_name: el.formResourceName.value.trim() || null,
            opportunity_name: el.formOpportunityName.value.trim() || null,
            cycle_name: el.formCycleName.value.trim() || null,
            end_action_name: el.formEndActionName.value.trim() || null,
            tone: el.formTone.value.trim() || null,
        },
    };
}

function getRuntimeFeatureFlagFields() {
    return [
        ["cheat_check_enabled", el.formCheatCheckEnabled],
        ["image_generation_enabled", el.formImageGenerationEnabled],
        ["live_view_enabled", el.formLiveViewEnabled],
        ["redemption_enabled", el.formRedemptionEnabled],
    ];
}

function setRuntimeFeatureFlagValue(name, value) {
    const field = getRuntimeFeatureFlagFields().find(([fieldName]) => fieldName === name)?.[1];
    const normalizedValue = value === true ? true : value === false ? false : null;
    state.runtimeFeatureFlags[name] = normalizedValue;
    if (!field) return;
    field.checked = normalizedValue === true;
    field.indeterminate = normalizedValue === null;
}

function syncRuntimeFeatureFlagFromInput(fieldName, field) {
    state.runtimeFeatureFlags[fieldName] = field.checked;
    field.indeterminate = false;
}

function getRuntimeFormFields() {
    return [
        el.formOpenaiModel,
        el.formOpenaiModelCheatCheck,
        el.formImageGenModel,
        el.formImageGenIdleSeconds,
        el.formImageGenGlobalLimit,
        el.formImageGenGlobalWindowSeconds,
        el.formGameTitle,
        el.formGmIdentity,
        el.formWorldGenre,
        el.formResourceName,
        el.formOpportunityName,
        el.formCycleName,
        el.formEndActionName,
        el.formTone,
    ];
}

function switchToFormMode() {
    try {
        const config = parseRuntimeConfigText();
        loadRuntimeConfigForm(config);
        state.runtimeConfigMode = "form";
        el.runtimeFormPanel.classList.remove("hidden");
        el.runtimeJsonPanel.classList.add("hidden");
        el.runtimeFormModeButton.classList.add("active");
        el.runtimeJsonModeButton.classList.remove("active");
        updateRuntimeDirtyState();
    } catch (error) {
        setTranslatedMessage(el.runtimeMessage, "Cannot switch to form mode: {message}", "error", { message: error.message });
    }
}

function switchToJsonMode() {
    const config = buildConfigFromForm();
    el.runtimeConfigText.value = JSON.stringify(config, null, 2);
    state.runtimeConfigMode = "json";
    el.runtimeFormPanel.classList.add("hidden");
    el.runtimeJsonPanel.classList.remove("hidden");
    el.runtimeFormModeButton.classList.remove("active");
    el.runtimeJsonModeButton.classList.add("active");
    updateRuntimeDirtyState();
}

async function validateRuntimeConfig() {
    setRuntimeActionsDisabled(true);
    setTranslatedMessage(el.runtimeMessage, "Validating runtime config...");
    el.runtimeResult.textContent = "";
    try {
        const config = getRuntimeEditorConfig();
        const result = await api("/runtime-config/validate", {
            method: "POST",
            body: JSON.stringify({ config }),
        });
        renderJson(el.runtimeResult, result);
        setTranslatedMessage(el.runtimeMessage, "Runtime config is valid.", "success");
    } catch (error) {
        setMessage(el.runtimeMessage, error.message, "error");
    } finally {
        setRuntimeActionsDisabled(false);
    }
}

async function saveRuntimeConfig() {
    setRuntimeActionsDisabled(true);
    setTranslatedMessage(el.runtimeMessage, "Saving runtime config...");
    el.runtimeResult.textContent = "";
    try {
        const config = getRuntimeEditorConfig();
        const result = await api("/runtime-config", {
            method: "PUT",
            body: JSON.stringify({ config }),
        });
        el.runtimeConfigText.value = JSON.stringify(result.config, null, 2);
        loadRuntimeConfigForm(result.config);
        markRuntimeConfigClean(result.config);
        renderJson(el.runtimeResult, result);
        setTranslatedMessage(el.runtimeMessage, "Runtime config saved.", "success");
    } catch (error) {
        setMessage(el.runtimeMessage, error.message, "error");
    } finally {
        setRuntimeActionsDisabled(false);
    }
}

function renderPolicyList(titleKey, items) {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    setTranslatedText(heading, titleKey);
    section.appendChild(heading);
    const list = document.createElement("ul");
    (items || []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });
    section.appendChild(list);
    return section;
}

async function loadRestartPolicy() {
    try {
        const policy = await api("/restart-policy");
        el.restartPolicy.innerHTML = "";
        el.restartPolicy.appendChild(renderPolicyList("Hot effective", policy.hot_effective));
        el.restartPolicy.appendChild(renderPolicyList("Conditional hot effective", policy.conditional_hot_effective));
        el.restartPolicy.appendChild(renderPolicyList("Restart required", policy.restart_required));
        el.restartPolicy.appendChild(renderPolicyList("Not allowed in runtime_config", policy.not_allowed_in_runtime_config));
        el.restartPolicy.appendChild(renderPolicyList("Notes", policy.notes));
    } catch (error) {
        el.restartPolicy.textContent = error.message;
    }
}

async function testLlm() {
    setLlmTestActionsDisabled(true);
    setTranslatedMessage(el.llmMessageOutput, "Testing LLM...");
    el.llmResult.textContent = "";
    try {
        const model = el.llmModel.value.trim();
        const message = el.llmMessage.value.trim();
        const result = await api("/llm-test", {
            method: "POST",
            body: JSON.stringify({
                kind: el.llmKind.value,
                model: model || null,
                message: message || "Respond with exactly: OK",
            }),
        });
        renderJson(el.llmResult, result);
        setTranslatedMessage(
            el.llmMessageOutput,
            result.ok ? "LLM test completed." : "LLM test returned an error.",
            result.ok ? "success" : "error",
        );
    } catch (error) {
        setMessage(el.llmMessageOutput, error.message, "error");
    } finally {
        setLlmTestActionsDisabled(false);
    }
}

function renderPromptList() {
    el.promptList.innerHTML = "";
    state.prompts.forEach((prompt) => {
        const button = document.createElement("button");
        button.type = "button";
        const badge = prompt.effective_source === "override" ? ` [${t("override")}]` : "";
        button.textContent = `${prompt.filename}${badge}`;
        button.classList.toggle("active", prompt.filename === state.selectedPrompt);
        button.classList.toggle("has-override", prompt.effective_source === "override");
        button.addEventListener("click", () => loadPrompt(prompt.filename));
        el.promptList.appendChild(button);
    });
}

async function loadPromptList() {
    setTranslatedMessage(el.promptListMessage, "Loading prompts...");
    try {
        const data = await api("/prompts");
        state.prompts = Array.isArray(data.prompts) ? data.prompts : [];
        renderPromptList();
        setTranslatedMessage(el.promptListMessage, "Prompts loaded.", "success");
    } catch (error) {
        setMessage(el.promptListMessage, error.message, "error");
    }
}

async function loadPrompt(filename) {
    if (state.hasUnsavedPromptChanges) {
        const confirmed = window.confirm(t("You have unsaved changes. Discard them and switch to another prompt?"));
        if (!confirmed) return;
    }
    setTranslatedMessage(el.promptMessage, "Loading prompt...");
    try {
        const data = await api(`/prompts/${encodeURIComponent(filename)}`);
        state.selectedPrompt = filename;
        el.promptEditor.classList.remove("hidden");
        el.promptTitle.textContent = data.filename;
        el.promptEffectiveSource.textContent = data.effective.source;
        el.promptDefault.value = data.default.content || "";
        el.promptOverride.value = data.override.exists ? data.override.content : data.effective.content || "";
        el.promptEffective.value = data.effective.content || "";
        state.loadedPromptContent = el.promptOverride.value;
        state.hasUnsavedPromptChanges = false;
        state.selectedPromptHasOverride = data.override.exists;
        updatePromptButtons(data.override.exists);
        await loadPromptList();
        setTranslatedMessage(el.promptMessage, "Prompt loaded.", "success");
    } catch (error) {
        setMessage(el.promptMessage, error.message, "error");
    }
}

function updatePromptButtons(hasOverride = state.selectedPromptHasOverride) {
    state.selectedPromptHasOverride = Boolean(hasOverride);
    const hasSelection = Boolean(state.selectedPrompt);
    el.savePromptButton.disabled = !hasSelection || !state.hasUnsavedPromptChanges;
    el.resetPromptButton.disabled = !hasSelection || !state.selectedPromptHasOverride;
    el.deletePromptButton.disabled = !hasSelection || !state.selectedPromptHasOverride;
    if (el.promptDirtyIndicator) {
        el.promptDirtyIndicator.classList.toggle("hidden", !state.hasUnsavedPromptChanges);
    }
}

function validatePromptContent(content) {
    if (!content || !content.trim()) {
        return { key: "Prompt content cannot be empty or whitespace-only." };
    }
    if (content.length > MAX_PROMPT_LENGTH) {
        return {
            key: "Prompt content exceeds maximum length of {count} characters.",
            replacements: { count: MAX_PROMPT_LENGTH.toLocaleString() },
        };
    }
    return null;
}

async function savePromptOverride() {
    if (!state.selectedPrompt) return;
    const content = el.promptOverride.value;
    const validationError = validatePromptContent(content);
    if (validationError) {
        setTranslatedMessage(el.promptMessage, validationError.key, "error", validationError.replacements || {});
        return;
    }
    el.savePromptButton.disabled = true;
    setMessage(el.promptMessage, "");
    try {
        await api(`/prompts/${encodeURIComponent(state.selectedPrompt)}`, {
            method: "PUT",
            body: JSON.stringify({ content: el.promptOverride.value }),
        });
        setTranslatedMessage(el.promptMessage, "Prompt override saved.", "success");
        await loadPrompt(state.selectedPrompt);
    } catch (error) {
        setMessage(el.promptMessage, error.message, "error");
        updatePromptButtons();
    }
}

async function resetPromptOverride() {
    if (!state.selectedPrompt) return;
    const confirmed = window.confirm(
        t("Reset \"{filename}\" to default? This will delete the override and cannot be undone.", {
            filename: state.selectedPrompt,
        })
    );
    if (!confirmed) return;
    el.resetPromptButton.disabled = true;
    el.deletePromptButton.disabled = true;
    setMessage(el.promptMessage, "");
    try {
        await api(`/prompts/${encodeURIComponent(state.selectedPrompt)}/override`, {
            method: "DELETE",
        });
        setTranslatedMessage(el.promptMessage, "Prompt reset to default.", "success");
        await loadPrompt(state.selectedPrompt);
    } catch (error) {
        setMessage(el.promptMessage, error.message, "error");
        updatePromptButtons();
    }
}

async function deletePromptOverride() {
    if (!state.selectedPrompt) return;
    const confirmed = window.confirm(
        t("Delete override for \"{filename}\"? This will restore the default prompt and cannot be undone.", {
            filename: state.selectedPrompt,
        })
    );
    if (!confirmed) return;
    el.deletePromptButton.disabled = true;
    el.resetPromptButton.disabled = true;
    setMessage(el.promptMessage, "");
    try {
        await api(`/prompts/${encodeURIComponent(state.selectedPrompt)}/override`, {
            method: "DELETE",
        });
        setTranslatedMessage(el.promptMessage, "Prompt override deleted.", "success");
        await loadPrompt(state.selectedPrompt);
    } catch (error) {
        setMessage(el.promptMessage, error.message, "error");
        updatePromptButtons();
    }
}

async function loadAdminData() {
    await Promise.all([loadRuntimeConfig(), loadRestartPolicy(), loadPromptList(), loadLlmConfig()]);
    loadDashboard();
}

async function loadDashboard() {
    try {
        const llmData = await api("/llm-config");
        setTranslatedStatus(el.dashLlmStatus, llmData.api_key_configured ? "✓" : "⚠", llmData.api_key_configured ? "Configured" : "Not configured");
        el.dashLlmStatus.className = llmData.api_key_configured ? "card-status status-ok" : "card-status status-warning";
        renderDetailRows(el.dashLlmDetails, [
            ["Main", llmData.main_model || createTranslatedValue("(not set)")],
            ["Cheat Check", llmData.cheat_check_model || createTranslatedValue("(not set)")],
            ["Source", llmData.source],
        ]);
    } catch (error) {
        setTranslatedStatus(el.dashLlmStatus, "✗", "Error");
        el.dashLlmStatus.className = "card-status status-error";
        el.dashLlmDetails.textContent = error.message;
    }

    try {
        const runtimeData = await api("/runtime-config");
        setTranslatedStatus(el.dashRuntimeStatus, runtimeData.exists ? "✓" : "⚠", runtimeData.exists ? "Available" : "Missing");
        el.dashRuntimeStatus.className = runtimeData.exists ? "card-status status-ok" : "card-status status-warning";
        renderDetailRows(el.dashRuntimeDetails, [
            ["Source", runtimeData.source],
            ["Exists", createTranslatedValue(runtimeData.exists ? "exists" : "missing")],
        ]);
    } catch (error) {
        setTranslatedStatus(el.dashRuntimeStatus, "✗", "Error");
        el.dashRuntimeStatus.className = "card-status status-error";
        el.dashRuntimeDetails.textContent = error.message;
    }

    try {
        const promptsData = await api("/prompts");
        const total = promptsData.prompts.length;
        const overrides = promptsData.prompts.filter(p => p.effective_source === "override").length;
        if (total === 0) {
            setTranslatedStatus(el.dashPromptsStatus, "⚠", "No prompts found");
            el.dashPromptsStatus.className = "card-status status-warning";
            setTranslatedText(el.dashPromptsDetails, "Check installation or prompts directory.");
        } else {
            setTranslatedText(el.dashPromptsStatus, total === 1 ? "{count} prompt" : "{count} prompts", { count: total });
            el.dashPromptsStatus.className = "card-status status-ok";
            renderDetailRows(el.dashPromptsDetails, [
                ["Total", total],
                ["Overrides", overrides],
            ]);
        }
    } catch (error) {
        setTranslatedStatus(el.dashPromptsStatus, "✗", "Error");
        el.dashPromptsStatus.className = "card-status status-error";
        el.dashPromptsDetails.textContent = error.message;
    }

    if (el.dashPlayersStatus && el.dashPlayersDetails) {
        try {
            const playersData = await api("/players");
            const playerCount = playersData.summary.player_count;
            const sessionCount = playersData.summary.session_count;
            const active24h = playersData.summary.active_recent_24h;
            setTranslatedText(el.dashPlayersStatus, playerCount === 1 ? "{count} player" : "{count} players", { count: playerCount });
            el.dashPlayersStatus.className = "card-status status-ok";
            renderDetailRows(el.dashPlayersDetails, [
                ["Sessions", sessionCount],
                ["Active 24h", active24h],
                ["Active 7d", playersData.summary.active_recent_7d],
            ]);
        } catch (error) {
            setTranslatedStatus(el.dashPlayersStatus, "✗", "Error");
            el.dashPlayersStatus.className = "card-status status-error";
            el.dashPlayersDetails.textContent = error.message;
        }
    }

    if (el.dashSystemStatus && el.dashSystemDetails) {
        try {
            const systemData = await api("/system/status");
            const dbOk = systemData.database.connected;
            const envOk = systemData.env.env_file_exists;
            const hasWarnings = systemData.warnings.length > 0;
            setTranslatedStatus(el.dashSystemStatus, dbOk && envOk && !hasWarnings ? "✓" : "⚠", dbOk && envOk && !hasWarnings ? "Healthy" : "Check status");
            el.dashSystemStatus.className = dbOk && envOk && !hasWarnings ? "card-status status-ok" : "card-status status-warning";
            renderDetailRows(el.dashSystemDetails, [
                ["Database", createTranslatedValue(dbOk ? "connected" : "not connected")],
                ["Env File", createTranslatedValue(envOk ? "exists" : "missing")],
                ["Sessions", systemData.counts.sessions],
            ]);
        } catch (error) {
            setTranslatedStatus(el.dashSystemStatus, "✗", "Error");
            el.dashSystemStatus.className = "card-status status-error";
            el.dashSystemDetails.textContent = error.message;
        }
    }
}

async function loadLlmConfig() {
    setLlmConfigActionsDisabled(true);
    setTranslatedMessage(el.llmConfigMessage, "Loading LLM config...");
    try {
        const data = await api("/llm-config");
        _applyLlmConfigToForm(data);
        setTranslatedMessage(el.llmConfigMessage, "Loaded (source: {source}).", "success", { source: data.source });
    } catch (error) {
        setMessage(el.llmConfigMessage, error.message, "error");
    } finally {
        setLlmConfigActionsDisabled(false);
    }
}

function _applyLlmConfigToForm(data) {
    el.llmConfigBaseUrl.value = data.base_url || "";
    el.llmConfigApiKey.value = "";
    el.llmConfigClearKey.checked = false;
    el.llmConfigMainModel.value = data.main_model || "";
    el.llmConfigCheatModel.value = data.cheat_check_model || "";

    if (data.api_key_configured && data.api_key_hint) {
        setTranslatedPlaceholder(el.llmConfigApiKey, "Configured — ends in …{hint}. Leave blank to keep.", { hint: data.api_key_hint });
    } else {
        setTranslatedPlaceholder(el.llmConfigApiKey, "Not configured. Enter API key to set.");
    }
    if (data.api_key_configured) {
        setTranslatedText(el.llmConfigKeyHint, "API key configured, last 4 chars: {hint}", { hint: data.api_key_hint || "(unknown)" });
    } else {
        setTranslatedText(el.llmConfigKeyHint, "No API key configured.");
    }
    el.llmConfigResult.textContent = "";
    el.llmConfigResult.classList.add("hidden");
}

async function saveLlmConfig() {
    setMessage(el.llmConfigMessage, "");
    const clearKey = el.llmConfigClearKey.checked;
    if (clearKey && !confirm(t("Clear the stored API key? The key cannot be recovered."))) {
        return;
    }
    setLlmConfigActionsDisabled(true);
    try {
        const body = {
            base_url: el.llmConfigBaseUrl.value.trim() || null,
            api_key: el.llmConfigApiKey.value || null,
            main_model: el.llmConfigMainModel.value.trim() || null,
            cheat_check_model: el.llmConfigCheatModel.value.trim() || null,
            clear_api_key: clearKey,
        };
        const result = await api("/llm-config", {
            method: "POST",
            body: JSON.stringify(body),
        });
        _applyLlmConfigToForm(result.config);
        el.llmConfigResult.textContent = JSON.stringify(result.config, null, 2);
        el.llmConfigResult.classList.remove("hidden");
        setTranslatedMessage(el.llmConfigMessage, "LLM config saved.", "success");
    } catch (error) {
        setMessage(el.llmConfigMessage, error.message, "error");
    } finally {
        setLlmConfigActionsDisabled(false);
    }
}

async function testLlmFromConfig() {
    setLlmConfigActionsDisabled(true);
    setTranslatedMessage(el.llmConfigMessage, "Testing LLM connection...");
    el.llmConfigResult.textContent = "";
    el.llmConfigResult.classList.add("hidden");
    try {
        const result = await api("/llm-test", {
            method: "POST",
            body: JSON.stringify({ kind: "main", model: null, message: "Respond with exactly: OK" }),
        });
        el.llmConfigResult.textContent = JSON.stringify(result, null, 2);
        el.llmConfigResult.classList.remove("hidden");
        setTranslatedMessage(
            el.llmConfigMessage,
            result.ok ? "LLM connection OK." : "LLM test returned an error.",
            result.ok ? "success" : "error",
        );
    } catch (error) {
        setMessage(el.llmConfigMessage, error.message, "error");
    } finally {
        setLlmConfigActionsDisabled(false);
    }
}

async function loadSystemStatus() {
    if (el.systemRefreshButton) el.systemRefreshButton.disabled = true;
    setTranslatedMessage(el.systemMessage, "Loading system status...");
    try {
        const data = await api("/system/status");

        renderDetailRows(el.systemApp, [
            ["Admin Enabled", createTranslatedValue(data.app.admin_enabled ? "Yes" : "No")],
            ["Environment", data.app.environment],
            ["Python", data.app.python_version],
            ["Platform", data.app.platform],
            ["Working Dir", data.app.cwd],
        ]);

        renderDetailRows(el.systemEnv, [
            [".env File", createStatusBadge(data.env.env_file_exists)],
            ["SECRET_KEY", createStatusBadge(data.env.secret_key_configured)],
            ["ADMIN_PASSWORD", createStatusBadge(data.env.admin_password_configured)],
            ["DATABASE_URL", createStatusBadge(data.env.database_url_configured)],
            ["OPENAI_API_KEY", createStatusBadge(data.env.openai_api_key_configured)],
            ["OPENAI_BASE_URL", createStatusBadge(data.env.openai_base_url_configured)],
        ]);

        renderDetailRows(el.systemDatabase, [
            ["Type", data.database.type],
            ["Configured", createStatusBadge(data.database.configured)],
            ["Connected", createStatusBadge(data.database.connected)],
            ["Detail", data.database.detail],
        ]);

        renderDetailRows(el.systemGameData, [
            ["Root", createStatusBadge(data.game_data.exists)],
            ["Config Dir", createStatusBadge(data.game_data.config_dir_exists)],
            ["Runtime Config", createStatusBadge(data.game_data.runtime_config_exists)],
            ["Prompts Dir", createStatusBadge(data.game_data.prompts_dir_exists)],
            ["Sessions Dir", createStatusBadge(data.game_data.sessions_dir_exists)],
            ["Index", createStatusBadge(data.game_data.index_exists)],
            ["Images Dir", createStatusBadge(data.game_data.generated_images_dir_exists)],
            ["Secrets Dir", createStatusBadge(data.game_data.secrets_dir_exists)],
            ["LLM Secret", createStatusBadge(data.game_data.llm_secret_exists)],
        ]);

        renderDetailRows(el.systemCounts, [
            ["Sessions", data.counts.sessions],
            ["Prompt Overrides", data.counts.prompt_overrides],
            ["Generated Images", data.counts.generated_images],
        ]);

        renderWarnings(el.systemWarnings, el.systemWarningsPanel, data.warnings || []);
        
        setTranslatedMessage(el.systemMessage, "System status loaded.", "success");
    } catch (error) {
        setMessage(el.systemMessage, error.message, "error");
    } finally {
        if (el.systemRefreshButton) el.systemRefreshButton.disabled = false;
    }
}

function createStatusBadge(value) {
    const badge = document.createElement("span");
    if (value === true) {
        badge.className = "status-badge status-ok";
        setTranslatedText(badge, "OK");
    } else if (value === false) {
        badge.className = "status-badge status-error";
        setTranslatedText(badge, "No");
    } else {
        badge.className = "status-badge status-unknown";
        badge.textContent = "?";
    }
    return badge;
}

function formatPlayerActivity(lastActivity) {
    if (!lastActivity) return t("N/A");
    const date = new Date(lastActivity);
    if (Number.isNaN(date.getTime())) return t("N/A");
    return date.toLocaleString();
}

function getPlayerActivityAgeMs(player) {
    if (!player.last_activity) return null;
    const date = new Date(player.last_activity);
    if (Number.isNaN(date.getTime())) return null;
    return Date.now() - date.getTime();
}

function playerMatchesActivityFilter(player, filterValue) {
    const ageMs = getPlayerActivityAgeMs(player);
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;

    if (filterValue === "active-24h") return ageMs !== null && ageMs < oneDayMs;
    if (filterValue === "active-7d") return ageMs !== null && ageMs < sevenDaysMs;
    if (filterValue === "inactive") return ageMs !== null && ageMs >= sevenDaysMs;
    if (filterValue === "unknown") return ageMs === null;
    return true;
}

function playerMatchesSearch(player, query) {
    if (!query) return true;
    const values = [
        player.player_id,
        player.latest_session_id,
        player.latest_chapter,
        player.latest_status,
        ...(player.data_sources || []),
    ];
    return values.some((value) => String(value || "").toLowerCase().includes(query));
}

function createLabeledText(label, value, className) {
    const element = document.createElement("div");
    if (className) element.className = className;

    const labelElement = document.createElement("strong");
    labelElement.textContent = `${t(label)}:`;
    element.append(labelElement, ` ${value}`);
    return element;
}

function createMetaItem(label, value) {
    const item = document.createElement("span");
    const labelElement = document.createElement("strong");
    labelElement.textContent = `${t(label)}:`;
    item.append(labelElement, ` ${value}`);
    return item;
}

function updatePlayersFilterCount(visibleCount, totalCount) {
    if (!el.playersFilterCount) return;
    if (totalCount === 0) {
        setTranslatedText(el.playersFilterCount, "No players loaded");
    } else if (visibleCount === totalCount) {
        setTranslatedText(el.playersFilterCount, "Showing all {count} {noun}", {
            count: totalCount,
            noun: t(totalCount === 1 ? "player" : "players"),
        });
    } else {
        setTranslatedText(el.playersFilterCount, "Showing {visible} of {total} players", {
            visible: visibleCount,
            total: totalCount,
        });
    }
}

function renderPlayersList(players, totalCount) {
    el.playersList.textContent = "";

    if (totalCount === 0) {
        setTranslatedText(el.playersEmpty, "No players found");
        el.playersEmpty.classList.remove("hidden");
        updatePlayersFilterCount(0, 0);
        return;
    }

    if (players.length === 0) {
        setTranslatedText(el.playersEmpty, "No players match the current filters");
        el.playersEmpty.classList.remove("hidden");
        updatePlayersFilterCount(0, totalCount);
        return;
    }

    el.playersEmpty.classList.add("hidden");
    players.forEach((player) => {
        const card = document.createElement("div");
        card.className = "player-card";

        card.appendChild(createLabeledText("ID", player.player_id || t("N/A"), "player-id"));

        const meta = document.createElement("div");
        meta.className = "player-meta";
        meta.appendChild(createMetaItem("Sessions", player.session_count ?? 0));
        meta.appendChild(createMetaItem("Last Activity", formatPlayerActivity(player.last_activity)));
        card.appendChild(meta);

        if (player.latest_chapter) {
            card.appendChild(createLabeledText("Chapter", player.latest_chapter, "player-detail"));
        }
        if (player.latest_status) {
            card.appendChild(createLabeledText("Status", player.latest_status, "player-detail"));
        }

        const sources = document.createElement("div");
        sources.className = "player-sources";
        sources.textContent = (player.data_sources || []).length > 0
            ? player.data_sources.join(", ")
            : t("No metadata sources");
        card.appendChild(sources);

        el.playersList.appendChild(card);
    });

    updatePlayersFilterCount(players.length, totalCount);
}

function applyPlayersFilters() {
    const query = (el.playersFilter?.value || "").trim().toLowerCase();
    const activityFilter = el.playersActivityFilter?.value || "all";
    const filteredPlayers = state.players.filter((player) => (
        playerMatchesSearch(player, query)
        && playerMatchesActivityFilter(player, activityFilter)
    ));
    renderPlayersList(filteredPlayers, state.players.length);
}

function clearPlayerFilters() {
    if (el.playersFilter) el.playersFilter.value = "";
    if (el.playersActivityFilter) el.playersActivityFilter.value = "all";
    applyPlayersFilters();
}

function renderWarnings(listElement, panelElement, warnings) {
    listElement.textContent = "";
    if (warnings.length === 0) {
        panelElement.classList.add("hidden");
        return;
    }

    warnings.forEach((warning) => {
        const item = document.createElement("li");
        item.textContent = warning;
        listElement.appendChild(item);
    });
    panelElement.classList.remove("hidden");
}

async function loadPlayers() {
    setTranslatedMessage(el.playersMessage, "Loading players...");
    if (el.playersRefreshButton) el.playersRefreshButton.disabled = true;
    try {
        const data = await api("/players");
        state.players = Array.isArray(data.players) ? data.players : [];
        
        el.playersCount.textContent = data.summary.player_count;
        el.sessionsCount.textContent = data.summary.session_count;
        el.active24h.textContent = data.summary.active_recent_24h;
        el.active7d.textContent = data.summary.active_recent_7d;

        applyPlayersFilters();
        renderWarnings(el.playersWarnings, el.playersWarningsPanel, data.warnings || []);
        
        setTranslatedMessage(el.playersMessage, "Players loaded.", "success");
    } catch (error) {
        setMessage(el.playersMessage, error.message, "error");
    } finally {
        if (el.playersRefreshButton) el.playersRefreshButton.disabled = false;
    }
}

el.loginForm.addEventListener("submit", login);
el.logoutButton.addEventListener("click", logout);
el.reloadConfigButton.addEventListener("click", loadRuntimeConfig);
el.validateConfigButton.addEventListener("click", validateRuntimeConfig);
el.saveConfigButton.addEventListener("click", saveRuntimeConfig);
el.runtimeFormModeButton.addEventListener("click", switchToFormMode);
el.runtimeJsonModeButton.addEventListener("click", switchToJsonMode);
el.runtimeConfigText.addEventListener("input", updateRuntimeDirtyState);
getRuntimeFormFields().forEach((field) => {
    field.addEventListener("input", updateRuntimeDirtyState);
});
getRuntimeFeatureFlagFields().forEach(([fieldName, field]) => {
    field.addEventListener("change", () => {
        syncRuntimeFeatureFlagFromInput(fieldName, field);
        updateRuntimeDirtyState();
    });
});
el.llmConfigLoadButton.addEventListener("click", loadLlmConfig);
el.llmConfigSaveButton.addEventListener("click", saveLlmConfig);
el.llmConfigTestButton.addEventListener("click", testLlmFromConfig);
el.llmTestButton.addEventListener("click", testLlm);
el.savePromptButton.addEventListener("click", savePromptOverride);
el.resetPromptButton.addEventListener("click", resetPromptOverride);
el.deletePromptButton.addEventListener("click", deletePromptOverride);
el.promptOverride.addEventListener("input", () => {
    state.hasUnsavedPromptChanges = el.promptOverride.value !== state.loadedPromptContent;
    updatePromptButtons();
});
if (el.systemRefreshButton) {
    el.systemRefreshButton.addEventListener("click", loadSystemStatus);
}
if (el.playersRefreshButton) {
    el.playersRefreshButton.addEventListener("click", loadPlayers);
}
if (el.playersFilter) {
    el.playersFilter.addEventListener("input", applyPlayersFilters);
}
if (el.playersActivityFilter) {
    el.playersActivityFilter.addEventListener("change", applyPlayersFilters);
}
if (el.playersClearFiltersButton) {
    el.playersClearFiltersButton.addEventListener("click", clearPlayerFilters);
}
if (el.dashboardRefreshButton) {
    el.dashboardRefreshButton.addEventListener("click", async () => {
        el.dashboardRefreshButton.disabled = true;
        setTranslatedText(el.dashboardRefreshButton, "Refreshing...");
        await loadDashboard();
        setTranslatedText(el.dashboardRefreshButton, "Refresh Dashboard");
        el.dashboardRefreshButton.disabled = false;
    });
}

document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchSection(btn.dataset.section));
});

window.addEventListener("beforeunload", warnBeforeUnload);

initializeStaticTranslations();
setLanguage(loadStoredLanguage());
if (el.languageToggle) {
    el.languageToggle.addEventListener("click", () => {
        setLanguage(state.language === "zh" ? "en" : "zh");
    });
}

checkStatus();
