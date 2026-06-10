const API_BASE_URL = "/api/admin";
const MAX_PROMPT_LENGTH = 200000;

const state = {
    authenticated: false,
    adminEnabled: false,
    selectedPrompt: null,
    activeSection: "dashboard",
    loadedPromptContent: "",
    hasUnsavedPromptChanges: false,
    runtimeConfigMode: "form",
};

const el = {
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

function setMessage(element, text, type = "") {
    element.textContent = text || "";
    element.classList.toggle("success", type === "success");
    element.classList.toggle("error", type === "error");
}

function setAuthenticated(authenticated, adminEnabled = state.adminEnabled) {
    state.authenticated = authenticated;
    state.adminEnabled = adminEnabled;
    el.logoutButton.classList.toggle("hidden", !authenticated);
    el.loginPanel.classList.toggle("hidden", authenticated || !adminEnabled);
    el.adminConsole.classList.toggle("hidden", !authenticated);

    if (!adminEnabled) {
        el.authStatus.textContent = "Admin disabled";
        el.authStatus.className = "auth-badge auth-disabled";
    } else if (authenticated) {
        el.authStatus.textContent = "Logged in";
        el.authStatus.className = "auth-badge auth-ok";
    } else {
        el.authStatus.textContent = "Not logged in";
        el.authStatus.className = "auth-badge auth-pending";
    }
}

function switchSection(sectionName) {
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
        throw new Error("Not logged in or session expired.");
    }
    if (!response.ok) {
        throw new Error(data.detail || `Request failed with HTTP ${response.status}`);
    }
    return data;
}

function parseRuntimeConfigText() {
    try {
        const parsed = JSON.parse(el.runtimeConfigText.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error("Runtime config must be a JSON object.");
        }
        return parsed;
    } catch (error) {
        throw new Error(`Invalid JSON: ${error.message}`);
    }
}

function renderJson(element, data) {
    element.textContent = JSON.stringify(data, null, 2);
}

function setRuntimeActionsDisabled(disabled) {
    el.reloadConfigButton.disabled = disabled;
    el.validateConfigButton.disabled = disabled;
    el.saveConfigButton.disabled = disabled;
}

function getRuntimeEditorConfig() {
    if (state.runtimeConfigMode === "form") {
        const config = buildConfigFromForm();
        el.runtimeConfigText.value = JSON.stringify(config, null, 2);
    }
    return parseRuntimeConfigText();
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
        setMessage(el.globalMessage, "Logged in.", "success");
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
    setMessage(el.globalMessage, "Logged out.", "success");
}

async function loadRuntimeConfig() {
    setRuntimeActionsDisabled(true);
    setMessage(el.runtimeMessage, "Loading runtime config...");
    try {
        const data = await api("/runtime-config");
        el.runtimeSource.textContent = data.source;
        el.runtimeExists.textContent = String(data.exists);
        el.runtimeConfigText.value = JSON.stringify(data.config, null, 2);
        loadRuntimeConfigForm(data.config);
        el.runtimeResult.textContent = "";
        setMessage(el.runtimeMessage, "Runtime config loaded.", "success");
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
    el.formCheatCheckEnabled.checked = config.feature_flags?.cheat_check_enabled || false;
    el.formImageGenerationEnabled.checked = config.feature_flags?.image_generation_enabled || false;
    el.formLiveViewEnabled.checked = config.feature_flags?.live_view_enabled || false;
    el.formRedemptionEnabled.checked = config.feature_flags?.redemption_enabled || false;
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
            cheat_check_enabled: el.formCheatCheckEnabled.checked,
            image_generation_enabled: el.formImageGenerationEnabled.checked,
            live_view_enabled: el.formLiveViewEnabled.checked,
            redemption_enabled: el.formRedemptionEnabled.checked,
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

function switchToFormMode() {
    try {
        const config = parseRuntimeConfigText();
        loadRuntimeConfigForm(config);
        state.runtimeConfigMode = "form";
        el.runtimeFormPanel.classList.remove("hidden");
        el.runtimeJsonPanel.classList.add("hidden");
        el.runtimeFormModeButton.classList.add("active");
        el.runtimeJsonModeButton.classList.remove("active");
    } catch (error) {
        setMessage(el.runtimeMessage, `Cannot switch to form mode: ${error.message}`, "error");
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
}

async function validateRuntimeConfig() {
    setRuntimeActionsDisabled(true);
    setMessage(el.runtimeMessage, "Validating runtime config...");
    el.runtimeResult.textContent = "";
    try {
        const config = getRuntimeEditorConfig();
        const result = await api("/runtime-config/validate", {
            method: "POST",
            body: JSON.stringify({ config }),
        });
        renderJson(el.runtimeResult, result);
        setMessage(el.runtimeMessage, "Runtime config is valid.", "success");
    } catch (error) {
        setMessage(el.runtimeMessage, error.message, "error");
    } finally {
        setRuntimeActionsDisabled(false);
    }
}

async function saveRuntimeConfig() {
    setRuntimeActionsDisabled(true);
    setMessage(el.runtimeMessage, "Saving runtime config...");
    el.runtimeResult.textContent = "";
    try {
        const config = getRuntimeEditorConfig();
        const result = await api("/runtime-config", {
            method: "PUT",
            body: JSON.stringify({ config }),
        });
        el.runtimeConfigText.value = JSON.stringify(result.config, null, 2);
        loadRuntimeConfigForm(result.config);
        renderJson(el.runtimeResult, result);
        setMessage(el.runtimeMessage, "Runtime config saved.", "success");
    } catch (error) {
        setMessage(el.runtimeMessage, error.message, "error");
    } finally {
        setRuntimeActionsDisabled(false);
    }
}

function renderPolicyList(title, items) {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    heading.textContent = title;
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
    setMessage(el.llmMessageOutput, "Testing LLM...");
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
        setMessage(
            el.llmMessageOutput,
            result.ok ? "LLM test completed." : "LLM test returned an error.",
            result.ok ? "success" : "error",
        );
    } catch (error) {
        setMessage(el.llmMessageOutput, error.message, "error");
    }
}

async function loadPromptList() {
    setMessage(el.promptListMessage, "Loading prompts...");
    try {
        const data = await api("/prompts");
        el.promptList.innerHTML = "";
        data.prompts.forEach((prompt) => {
            const button = document.createElement("button");
            button.type = "button";
            const badge = prompt.effective_source === "override" ? " [override]" : "";
            button.textContent = `${prompt.filename}${badge}`;
            button.classList.toggle("active", prompt.filename === state.selectedPrompt);
            button.classList.toggle("has-override", prompt.effective_source === "override");
            button.addEventListener("click", () => loadPrompt(prompt.filename));
            el.promptList.appendChild(button);
        });
        setMessage(el.promptListMessage, "Prompts loaded.", "success");
    } catch (error) {
        setMessage(el.promptListMessage, error.message, "error");
    }
}

async function loadPrompt(filename) {
    if (state.hasUnsavedPromptChanges) {
        const confirmed = window.confirm("You have unsaved changes. Discard them and switch to another prompt?");
        if (!confirmed) return;
    }
    setMessage(el.promptMessage, "Loading prompt...");
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
        updatePromptButtons(data.override.exists);
        await loadPromptList();
        setMessage(el.promptMessage, "Prompt loaded.", "success");
    } catch (error) {
        setMessage(el.promptMessage, error.message, "error");
    }
}

function updatePromptButtons(hasOverride) {
    const hasSelection = Boolean(state.selectedPrompt);
    el.savePromptButton.disabled = !hasSelection;
    el.resetPromptButton.disabled = !hasSelection || !hasOverride;
    el.deletePromptButton.disabled = !hasSelection || !hasOverride;
}

function validatePromptContent(content) {
    if (!content || !content.trim()) {
        return "Prompt content cannot be empty or whitespace-only.";
    }
    if (content.length > MAX_PROMPT_LENGTH) {
        return `Prompt content exceeds maximum length of ${MAX_PROMPT_LENGTH.toLocaleString()} characters.`;
    }
    return null;
}

async function savePromptOverride() {
    if (!state.selectedPrompt) return;
    const content = el.promptOverride.value;
    const validationError = validatePromptContent(content);
    if (validationError) {
        setMessage(el.promptMessage, validationError, "error");
        return;
    }
    el.savePromptButton.disabled = true;
    setMessage(el.promptMessage, "");
    try {
        await api(`/prompts/${encodeURIComponent(state.selectedPrompt)}`, {
            method: "PUT",
            body: JSON.stringify({ content: el.promptOverride.value }),
        });
        setMessage(el.promptMessage, "Prompt override saved.", "success");
        await loadPrompt(state.selectedPrompt);
    } catch (error) {
        setMessage(el.promptMessage, error.message, "error");
        el.savePromptButton.disabled = false;
    }
}

async function resetPromptOverride() {
    if (!state.selectedPrompt) return;
    const confirmed = window.confirm(
        `Reset "${state.selectedPrompt}" to default? This will delete the override and cannot be undone.`
    );
    if (!confirmed) return;
    el.resetPromptButton.disabled = true;
    el.deletePromptButton.disabled = true;
    setMessage(el.promptMessage, "");
    try {
        await api(`/prompts/${encodeURIComponent(state.selectedPrompt)}/override`, {
            method: "DELETE",
        });
        setMessage(el.promptMessage, "Prompt reset to default.", "success");
        await loadPrompt(state.selectedPrompt);
    } catch (error) {
        setMessage(el.promptMessage, error.message, "error");
        el.resetPromptButton.disabled = false;
        el.deletePromptButton.disabled = false;
    }
}

async function deletePromptOverride() {
    if (!state.selectedPrompt) return;
    const confirmed = window.confirm(
        `Delete override for "${state.selectedPrompt}"? This will restore the default prompt and cannot be undone.`
    );
    if (!confirmed) return;
    el.deletePromptButton.disabled = true;
    el.resetPromptButton.disabled = true;
    setMessage(el.promptMessage, "");
    try {
        await api(`/prompts/${encodeURIComponent(state.selectedPrompt)}/override`, {
            method: "DELETE",
        });
        setMessage(el.promptMessage, "Prompt override deleted.", "success");
        await loadPrompt(state.selectedPrompt);
    } catch (error) {
        setMessage(el.promptMessage, error.message, "error");
        el.deletePromptButton.disabled = false;
        el.resetPromptButton.disabled = false;
    }
}

async function loadAdminData() {
    await Promise.all([loadRuntimeConfig(), loadRestartPolicy(), loadPromptList(), loadLlmConfig()]);
    loadDashboard();
}

async function loadDashboard() {
    try {
        const llmData = await api("/llm-config");
        el.dashLlmStatus.textContent = llmData.api_key_configured ? "✓ Configured" : "⚠ Not configured";
        el.dashLlmStatus.className = llmData.api_key_configured ? "card-status status-ok" : "card-status status-warning";
        el.dashLlmDetails.innerHTML = `<p><strong>Main:</strong> ${llmData.main_model || "(not set)"}</p><p><strong>Cheat Check:</strong> ${llmData.cheat_check_model || "(not set)"}</p><p><strong>Source:</strong> ${llmData.source}</p>`;
    } catch (error) {
        el.dashLlmStatus.textContent = "✗ Error";
        el.dashLlmStatus.className = "card-status status-error";
        el.dashLlmDetails.textContent = error.message;
    }

    try {
        const runtimeData = await api("/runtime-config");
        el.dashRuntimeStatus.textContent = runtimeData.exists ? "✓ Available" : "⚠ Missing";
        el.dashRuntimeStatus.className = runtimeData.exists ? "card-status status-ok" : "card-status status-warning";
        el.dashRuntimeDetails.innerHTML = `<p><strong>Source:</strong> ${runtimeData.source}</p><p><strong>Exists:</strong> ${runtimeData.exists}</p>`;
    } catch (error) {
        el.dashRuntimeStatus.textContent = "✗ Error";
        el.dashRuntimeStatus.className = "card-status status-error";
        el.dashRuntimeDetails.textContent = error.message;
    }

    try {
        const promptsData = await api("/prompts");
        const total = promptsData.prompts.length;
        const overrides = promptsData.prompts.filter(p => p.effective_source === "override").length;
        if (total === 0) {
            el.dashPromptsStatus.textContent = "⚠ No prompts found";
            el.dashPromptsStatus.className = "card-status status-warning";
            el.dashPromptsDetails.textContent = "Check installation or prompts directory.";
        } else {
            el.dashPromptsStatus.textContent = `${total} ${total === 1 ? 'prompt' : 'prompts'}`;
            el.dashPromptsStatus.className = "card-status status-ok";
            el.dashPromptsDetails.innerHTML = `<p><strong>Total:</strong> ${total}</p><p><strong>Overrides:</strong> ${overrides}</p>`;
        }
    } catch (error) {
        el.dashPromptsStatus.textContent = "✗ Error";
        el.dashPromptsStatus.className = "card-status status-error";
        el.dashPromptsDetails.textContent = error.message;
    }

    if (el.dashPlayersStatus && el.dashPlayersDetails) {
        try {
            const playersData = await api("/players");
            const playerCount = playersData.summary.player_count;
            const sessionCount = playersData.summary.session_count;
            const active24h = playersData.summary.active_recent_24h;
            el.dashPlayersStatus.textContent = `${playerCount} ${playerCount === 1 ? 'player' : 'players'}`;
            el.dashPlayersStatus.className = "card-status status-ok";
            el.dashPlayersDetails.innerHTML = `<p><strong>Sessions:</strong> ${sessionCount}</p><p><strong>Active 24h:</strong> ${active24h}</p><p><strong>Active 7d:</strong> ${playersData.summary.active_recent_7d}</p>`;
        } catch (error) {
            el.dashPlayersStatus.textContent = "✗ Error";
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
            el.dashSystemStatus.textContent = dbOk && envOk && !hasWarnings ? "✓ Healthy" : "⚠ Check status";
            el.dashSystemStatus.className = dbOk && envOk && !hasWarnings ? "card-status status-ok" : "card-status status-warning";
            el.dashSystemDetails.innerHTML = `<p><strong>Database:</strong> ${dbOk ? "connected" : "not connected"}</p><p><strong>Env File:</strong> ${envOk ? "exists" : "missing"}</p><p><strong>Sessions:</strong> ${systemData.counts.sessions}</p>`;
        } catch (error) {
            el.dashSystemStatus.textContent = "✗ Error";
            el.dashSystemStatus.className = "card-status status-error";
            el.dashSystemDetails.textContent = error.message;
        }
    }
}

async function loadLlmConfig() {
    setMessage(el.llmConfigMessage, "Loading LLM config...");
    try {
        const data = await api("/llm-config");
        _applyLlmConfigToForm(data);
        setMessage(el.llmConfigMessage, `Loaded (source: ${data.source}).`, "success");
    } catch (error) {
        setMessage(el.llmConfigMessage, error.message, "error");
    }
}

function _applyLlmConfigToForm(data) {
    el.llmConfigBaseUrl.value = data.base_url || "";
    el.llmConfigApiKey.value = "";
    el.llmConfigClearKey.checked = false;
    el.llmConfigMainModel.value = data.main_model || "";
    el.llmConfigCheatModel.value = data.cheat_check_model || "";

    if (data.api_key_configured && data.api_key_hint) {
        el.llmConfigApiKey.placeholder = `Configured — ends in …${data.api_key_hint}. Leave blank to keep.`;
    } else {
        el.llmConfigApiKey.placeholder = "Not configured. Enter API key to set.";
    }
    el.llmConfigKeyHint.textContent = data.api_key_configured
        ? `API key configured, last 4 chars: ${data.api_key_hint || "(unknown)"}`
        : "No API key configured.";
    el.llmConfigResult.textContent = "";
    el.llmConfigResult.classList.add("hidden");
}

async function saveLlmConfig() {
    setMessage(el.llmConfigMessage, "");
    const clearKey = el.llmConfigClearKey.checked;
    if (clearKey && !confirm("Clear the stored API key? The key cannot be recovered.")) {
        return;
    }
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
        setMessage(el.llmConfigMessage, "LLM config saved.", "success");
    } catch (error) {
        setMessage(el.llmConfigMessage, error.message, "error");
    }
}

async function testLlmFromConfig() {
    setMessage(el.llmConfigMessage, "Testing LLM connection...");
    el.llmConfigResult.textContent = "";
    el.llmConfigResult.classList.add("hidden");
    try {
        const result = await api("/llm-test", {
            method: "POST",
            body: JSON.stringify({ kind: "main", model: null, message: "Respond with exactly: OK" }),
        });
        el.llmConfigResult.textContent = JSON.stringify(result, null, 2);
        el.llmConfigResult.classList.remove("hidden");
        setMessage(
            el.llmConfigMessage,
            result.ok ? "LLM connection OK." : "LLM test returned an error.",
            result.ok ? "success" : "error",
        );
    } catch (error) {
        setMessage(el.llmConfigMessage, error.message, "error");
    }
}

async function loadSystemStatus() {
    setMessage(el.systemMessage, "Loading system status...");
    try {
        const data = await api("/system/status");
        
        el.systemApp.innerHTML = `
            <p><strong>Admin Enabled:</strong> ${data.app.admin_enabled ? "Yes" : "No"}</p>
            <p><strong>Environment:</strong> ${data.app.environment}</p>
            <p><strong>Python:</strong> ${data.app.python_version}</p>
            <p><strong>Platform:</strong> ${data.app.platform}</p>
            <p><strong>Working Dir:</strong> ${data.app.cwd}</p>
        `;
        
        el.systemEnv.innerHTML = `
            <p><strong>.env File:</strong> ${_statusBadge(data.env.env_file_exists)}</p>
            <p><strong>SECRET_KEY:</strong> ${_statusBadge(data.env.secret_key_configured)}</p>
            <p><strong>ADMIN_PASSWORD:</strong> ${_statusBadge(data.env.admin_password_configured)}</p>
            <p><strong>DATABASE_URL:</strong> ${_statusBadge(data.env.database_url_configured)}</p>
            <p><strong>OPENAI_API_KEY:</strong> ${_statusBadge(data.env.openai_api_key_configured)}</p>
            <p><strong>OPENAI_BASE_URL:</strong> ${_statusBadge(data.env.openai_base_url_configured)}</p>
        `;
        
        el.systemDatabase.innerHTML = `
            <p><strong>Type:</strong> ${data.database.type}</p>
            <p><strong>Configured:</strong> ${_statusBadge(data.database.configured)}</p>
            <p><strong>Connected:</strong> ${_statusBadge(data.database.connected)}</p>
            <p><strong>Detail:</strong> ${data.database.detail}</p>
        `;
        
        el.systemGameData.innerHTML = `
            <p><strong>Root:</strong> ${_statusBadge(data.game_data.exists)}</p>
            <p><strong>Config Dir:</strong> ${_statusBadge(data.game_data.config_dir_exists)}</p>
            <p><strong>Runtime Config:</strong> ${_statusBadge(data.game_data.runtime_config_exists)}</p>
            <p><strong>Prompts Dir:</strong> ${_statusBadge(data.game_data.prompts_dir_exists)}</p>
            <p><strong>Sessions Dir:</strong> ${_statusBadge(data.game_data.sessions_dir_exists)}</p>
            <p><strong>Index:</strong> ${_statusBadge(data.game_data.index_exists)}</p>
            <p><strong>Images Dir:</strong> ${_statusBadge(data.game_data.generated_images_dir_exists)}</p>
            <p><strong>Secrets Dir:</strong> ${_statusBadge(data.game_data.secrets_dir_exists)}</p>
            <p><strong>LLM Secret:</strong> ${_statusBadge(data.game_data.llm_secret_exists)}</p>
        `;
        
        el.systemCounts.innerHTML = `
            <p><strong>Sessions:</strong> ${data.counts.sessions}</p>
            <p><strong>Prompt Overrides:</strong> ${data.counts.prompt_overrides}</p>
            <p><strong>Generated Images:</strong> ${data.counts.generated_images}</p>
        `;
        
        if (data.warnings.length > 0) {
            el.systemWarnings.innerHTML = data.warnings.map(w => `<li>${w}</li>`).join("");
            el.systemWarningsPanel.classList.remove("hidden");
        } else {
            el.systemWarningsPanel.classList.add("hidden");
        }
        
        setMessage(el.systemMessage, "System status loaded.", "success");
    } catch (error) {
        setMessage(el.systemMessage, error.message, "error");
    }
}

function _statusBadge(value) {
    if (value === true) return '<span class="status-badge status-ok">✓</span>';
    if (value === false) return '<span class="status-badge status-error">✗</span>';
    return '<span class="status-badge status-unknown">?</span>';
}

async function loadPlayers() {
    setMessage(el.playersMessage, "Loading players...");
    try {
        const data = await api("/players");
        
        el.playersCount.textContent = data.summary.player_count;
        el.sessionsCount.textContent = data.summary.session_count;
        el.active24h.textContent = data.summary.active_recent_24h;
        el.active7d.textContent = data.summary.active_recent_7d;
        
        if (data.players.length === 0) {
            el.playersList.innerHTML = "";
            el.playersEmpty.classList.remove("hidden");
        } else {
            el.playersEmpty.classList.add("hidden");
            el.playersList.innerHTML = data.players.map(p => `
                <div class="player-card">
                    <div class="player-id"><strong>ID:</strong> ${p.player_id}</div>
                    <div class="player-meta">
                        <span><strong>Sessions:</strong> ${p.session_count}</span>
                        <span><strong>Last Activity:</strong> ${p.last_activity ? new Date(p.last_activity).toLocaleString() : "N/A"}</span>
                    </div>
                    ${p.latest_chapter ? `<div class="player-detail"><strong>Chapter:</strong> ${p.latest_chapter}</div>` : ""}
                    ${p.latest_status ? `<div class="player-detail"><strong>Status:</strong> ${p.latest_status}</div>` : ""}
                    <div class="player-sources">${p.data_sources.join(", ")}</div>
                </div>
            `).join("");
        }
        
        if (data.warnings.length > 0) {
            el.playersWarnings.innerHTML = data.warnings.map(w => `<li>${w}</li>`).join("");
            el.playersWarningsPanel.classList.remove("hidden");
        } else {
            el.playersWarningsPanel.classList.add("hidden");
        }
        
        setMessage(el.playersMessage, "Players loaded.", "success");
    } catch (error) {
        setMessage(el.playersMessage, error.message, "error");
    }
}

el.loginForm.addEventListener("submit", login);
el.logoutButton.addEventListener("click", logout);
el.reloadConfigButton.addEventListener("click", loadRuntimeConfig);
el.validateConfigButton.addEventListener("click", validateRuntimeConfig);
el.saveConfigButton.addEventListener("click", saveRuntimeConfig);
el.runtimeFormModeButton.addEventListener("click", switchToFormMode);
el.runtimeJsonModeButton.addEventListener("click", switchToJsonMode);
el.llmConfigLoadButton.addEventListener("click", loadLlmConfig);
el.llmConfigSaveButton.addEventListener("click", saveLlmConfig);
el.llmConfigTestButton.addEventListener("click", testLlmFromConfig);
el.llmTestButton.addEventListener("click", testLlm);
el.savePromptButton.addEventListener("click", savePromptOverride);
el.resetPromptButton.addEventListener("click", resetPromptOverride);
el.deletePromptButton.addEventListener("click", deletePromptOverride);
el.promptOverride.addEventListener("input", () => {
    state.hasUnsavedPromptChanges = el.promptOverride.value !== state.loadedPromptContent;
});
if (el.systemRefreshButton) {
    el.systemRefreshButton.addEventListener("click", loadSystemStatus);
}
if (el.playersRefreshButton) {
    el.playersRefreshButton.addEventListener("click", loadPlayers);
}
if (el.dashboardRefreshButton) {
    el.dashboardRefreshButton.addEventListener("click", async () => {
        el.dashboardRefreshButton.disabled = true;
        el.dashboardRefreshButton.textContent = "Refreshing...";
        await loadDashboard();
        el.dashboardRefreshButton.textContent = "Refresh Dashboard";
        el.dashboardRefreshButton.disabled = false;
    });
}

document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchSection(btn.dataset.section));
});

checkStatus();
