import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync("frontend/admin.html", "utf8");
const css = readFileSync("frontend/admin.css", "utf8");
const js = readFileSync("frontend/admin.js", "utf8");

assert.match(html, /id="players-filter"/, "players search input should exist");
assert.match(html, /id="players-activity-filter"/, "players activity filter should exist");
assert.match(html, /id="players-clear-filters-button"/, "players clear filter button should exist");
assert.match(html, /id="players-filter-count"/, "players filter result count should exist");
assert.match(html, /id="prompt-dirty-indicator"/, "prompt dirty indicator should exist");
assert.match(html, /id="runtime-dirty-indicator"/, "runtime config dirty indicator should exist");

assert.match(css, /\.players-toolbar\s*{[^}]*grid-template-columns:/s, "players toolbar should have a stable grid layout");
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*\.players-toolbar\s*{[^}]*grid-template-columns:\s*1fr/s, "players toolbar should stack on mobile");

assert.match(js, /players:\s*\[\]/, "players state should store the last loaded list");
assert.match(js, /function applyPlayersFilters\(\)/, "players filter function should exist");
assert.match(js, /function renderPlayersList\(players,\s*totalCount\)/, "players list renderer should exist");
assert.match(js, /playersFilter\.addEventListener\("input",\s*applyPlayersFilters\)/, "players search should trigger filtering");
assert.match(js, /playersActivityFilter\.addEventListener\("change",\s*applyPlayersFilters\)/, "players activity filter should trigger filtering");
assert.match(js, /playersClearFiltersButton\.addEventListener\("click",\s*clearPlayerFilters\)/, "players clear button should reset filters");
assert.match(js, /document\.createElement\("div"\)/, "players renderer should create DOM nodes");
assert.doesNotMatch(js, /playersList\.innerHTML\s*=\s*data\.players\.map/, "players list should not render API text via innerHTML templates");
assert.match(js, /function renderDetailRows\(element,\s*rows\)/, "dashboard and system detail rows should use DOM rendering");
assert.match(js, /function createStatusBadge\(value\)/, "system status badges should use DOM rendering");
assert.doesNotMatch(js, /dash[A-Za-z]+Details\.innerHTML/, "dashboard details should not render API text via innerHTML");
assert.doesNotMatch(js, /system(?:App|Env|Database|GameData|Counts|Warnings)\.innerHTML/, "system status should not render API text via innerHTML");
assert.doesNotMatch(js, /function _statusBadge\(/, "system badges should not be returned as HTML strings");
assert.match(js, /function setLlmConfigActionsDisabled\(disabled\)/, "LLM config actions should have a shared disabled-state helper");
assert.match(js, /function setLlmTestActionsDisabled\(disabled\)/, "LLM test action should have a disabled-state helper");
assert.match(js, /finally\s*{\s*setLlmConfigActionsDisabled\(false\);/s, "LLM config actions should be re-enabled after async requests");
assert.match(js, /finally\s*{\s*setLlmTestActionsDisabled\(false\);/s, "LLM test action should be re-enabled after async requests");
assert.match(js, /loadedRuntimeConfigText:\s*""/, "runtime config clean baseline should be tracked");
assert.match(js, /hasUnsavedRuntimeChanges:\s*false/, "runtime config dirty state should be tracked");
assert.match(js, /runtimeDirtyIndicator:\s*document\.getElementById\("runtime-dirty-indicator"\)/, "runtime dirty indicator should be wired");
assert.match(js, /function updateRuntimeDirtyState\(\)/, "runtime config dirty-state updater should exist");
assert.match(js, /function confirmDiscardRuntimeChanges\(message\)/, "runtime config discard confirmation should exist");
assert.match(js, /saveConfigButton\.disabled\s*=\s*state\.runtimeActionsBusy\s*\|\|\s*!hasChanges/, "runtime save button should require unsaved changes");
assert.match(js, /function hasUnsavedAdminChanges\(\)/, "page-level unsaved change detection should exist");
assert.match(js, /window\.addEventListener\("beforeunload",\s*warnBeforeUnload\)/, "admin page should warn before unloading unsaved edits");
assert.match(js, /selectedPromptHasOverride:\s*false/, "prompt override state should be tracked");
assert.match(js, /promptDirtyIndicator:\s*document\.getElementById\("prompt-dirty-indicator"\)/, "prompt dirty indicator should be wired");
assert.match(js, /savePromptButton\.disabled\s*=\s*!hasSelection\s*\|\|\s*!state\.hasUnsavedPromptChanges/, "prompt save button should require unsaved changes");

class FakeClassList {
    constructor() {
        this.values = new Set();
    }

    add(value) {
        this.values.add(value);
    }

    remove(value) {
        this.values.delete(value);
    }

    toggle(value, force) {
        const shouldAdd = force === undefined ? !this.values.has(value) : Boolean(force);
        if (shouldAdd) {
            this.add(value);
        } else {
            this.remove(value);
        }
        return shouldAdd;
    }

    contains(value) {
        return this.values.has(value);
    }
}

class FakeElement {
    constructor(tagName = "div", id = "") {
        this.tagName = tagName;
        this.id = id;
        this.children = [];
        this.classList = new FakeClassList();
        this.dataset = {};
        this.listeners = {};
        this._textContent = "";
        this.className = "";
        this.value = "";
        this.checked = false;
        this.indeterminate = false;
        this.disabled = false;
        this.attributes = new Map();
    }

    get textContent() {
        return this._textContent;
    }

    set textContent(value) {
        this._textContent = String(value);
        this.children = [];
    }

    append(...nodes) {
        this.children.push(...nodes);
    }

    appendChild(node) {
        this.children.push(node);
        return node;
    }

    get firstChild() {
        return this.children[0] || null;
    }

    addEventListener(type, handler) {
        this.listeners[type] = handler;
    }

    getAttribute(name) {
        return this.attributes.get(name) || "";
    }

    setAttribute(name, value) {
        this.attributes.set(name, String(value));
    }
}

function collectText(node) {
    if (typeof node === "string") return node;
    return `${node.textContent || ""}${node.children.map(collectText).join("")}`;
}

const elementIds = [...js.matchAll(/document\.getElementById\("([^"]+)"\)/g)].map((match) => match[1]);
const elements = new Map(elementIds.map((id) => [id, new FakeElement("div", id)]));
elements.get("players-empty").classList.add("hidden");
let confirmResponse = true;
const confirmMessages = [];
const windowListeners = {};
const storage = new Map();

const context = vm.createContext({
    console,
    document: {
        documentElement: new FakeElement("html"),
        getElementById(id) {
            return elements.get(id) || null;
        },
        createElement(tagName) {
            return new FakeElement(tagName);
        },
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
    },
    localStorage: {
        getItem(key) {
            return storage.has(key) ? storage.get(key) : null;
        },
        setItem(key, value) {
            storage.set(key, String(value));
        },
    },
    window: {
        confirm(message) {
            confirmMessages.push(message);
            return confirmResponse;
        },
        addEventListener(type, handler) {
            windowListeners[type] = handler;
        },
    },
    confirm(message) {
        confirmMessages.push(message);
        return confirmResponse;
    },
    fetch: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ authenticated: false, admin_enabled: true }),
    }),
});

vm.runInContext(js, context);

assert.equal(vm.runInContext("translations.zh.Dashboard", context), "仪表盘", "admin translations should include Chinese labels");
assert.equal(vm.runInContext('t("Dashboard")', context), "仪表盘", "t() should translate in the default Chinese locale");
assert.doesNotThrow(() => vm.runInContext('setLanguage("en"); setLanguage("zh");', context), "setLanguage should be callable");
assert.equal(typeof elements.get("language-toggle").listeners.click, "function", "language toggle should register a click handler");
elements.get("language-toggle").listeners.click();
assert.equal(storage.get("adminLanguage"), "en", "language toggle should persist the selected language");
assert.equal(elements.get("language-toggle").textContent, "中文", "English mode should show the Chinese toggle label");

assert.equal(typeof windowListeners.beforeunload, "function", "beforeunload handler should be registered");

const cleanUnloadEvent = {
    prevented: false,
    preventDefault() {
        this.prevented = true;
    },
};
windowListeners.beforeunload(cleanUnloadEvent);
assert.equal(cleanUnloadEvent.prevented, false, "clean admin pages should not warn before unload");

const dirtyUnloadEvent = {
    prevented: false,
    preventDefault() {
        this.prevented = true;
    },
};
vm.runInContext("state.hasUnsavedRuntimeChanges = true;", context);
windowListeners.beforeunload(dirtyUnloadEvent);
assert.equal(dirtyUnloadEvent.prevented, true, "dirty admin pages should warn before unload");
assert.equal(dirtyUnloadEvent.returnValue, "", "dirty admin pages should request a browser unload prompt");
vm.runInContext("state.hasUnsavedRuntimeChanges = false;", context);

vm.runInContext(`
renderDetailRows(el.dashLlmDetails, [
    ["Main", "<img src=x onerror=alert(1)>"],
    ["Source", "test-source"],
]);
renderDetailRows(el.systemEnv, [
    ["SECRET_KEY", createStatusBadge(true)],
    ["DATABASE_URL", createStatusBadge(false)],
]);
`, context);

assert.equal(elements.get("dash-llm-details").children.length, 2, "dashboard detail rows should render as DOM rows");
assert.match(collectText(elements.get("dash-llm-details")), /<img src=x onerror=alert\(1\)>/, "dashboard detail text should remain literal text");
assert.equal(elements.get("system-env").children[0].children[2].className, "status-badge status-ok", "truthy system status should render an OK badge");
assert.equal(elements.get("system-env").children[1].children[2].className, "status-badge status-error", "false system status should render a No badge");

vm.runInContext(`
setLlmConfigActionsDisabled(true);
setLlmTestActionsDisabled(true);
`, context);

assert.equal(elements.get("llm-config-load-button").disabled, true, "LLM config load button should disable during requests");
assert.equal(elements.get("llm-config-save-button").disabled, true, "LLM config save button should disable during requests");
assert.equal(elements.get("llm-config-test-button").disabled, true, "LLM config test button should disable during requests");
assert.equal(elements.get("llm-test-button").disabled, true, "standalone LLM test button should disable during requests");

vm.runInContext(`
setLlmConfigActionsDisabled(false);
setLlmTestActionsDisabled(false);
`, context);

assert.equal(elements.get("llm-config-load-button").disabled, false, "LLM config load button should re-enable after requests");
assert.equal(elements.get("llm-test-button").disabled, false, "standalone LLM test button should re-enable after requests");

vm.runInContext(`
markRuntimeConfigClean({
    llm: { openai_model: null, openai_model_cheat_check: null },
    image_generation: {
        image_gen_model: null,
        image_gen_idle_seconds: null,
        image_gen_global_limit: null,
        image_gen_global_window_seconds: null,
    },
    feature_flags: {
        cheat_check_enabled: null,
        image_generation_enabled: null,
        live_view_enabled: null,
        redemption_enabled: null,
    },
    world_style: {
        game_title: null,
        gm_identity: null,
        world_genre: null,
        resource_name: null,
        opportunity_name: null,
        cycle_name: null,
        end_action_name: null,
        tone: null,
    },
});
loadRuntimeConfigForm(JSON.parse(state.loadedRuntimeConfigText));
`, context);

assert.equal(elements.get("save-config-button").disabled, true, "runtime save should be disabled when loaded config is unchanged");
assert.equal(elements.get("runtime-dirty-indicator").classList.contains("hidden"), true, "runtime dirty indicator should hide when config is unchanged");
assert.equal(elements.get("form-cheat-check-enabled").checked, false, "null runtime feature flags should display as unchecked");
assert.equal(elements.get("form-cheat-check-enabled").indeterminate, true, "null runtime feature flags should keep an indeterminate UI state");

vm.runInContext("switchToJsonMode();", context);

assert.equal(elements.get("save-config-button").disabled, true, "switching unchanged null feature flags to JSON should stay clean");
assert.match(elements.get("runtime-config-text").value, /"cheat_check_enabled": null/, "switching to JSON should preserve null feature flags");

vm.runInContext("switchToFormMode();", context);

vm.runInContext('el.formOpenaiModel.value = "gpt-4o";', context);
elements.get("form-openai-model").listeners.input();

assert.equal(elements.get("save-config-button").disabled, false, "runtime save should enable after form edits");
assert.equal(elements.get("runtime-dirty-indicator").classList.contains("hidden"), false, "runtime dirty indicator should show after form edits");

confirmResponse = false;
confirmMessages.length = 0;
vm.runInContext('state.activeSection = "runtime-config"; switchSection("players");', context);

assert.equal(confirmMessages.length, 1, "leaving runtime config with unsaved changes should ask for confirmation");
assert.equal(vm.runInContext("state.activeSection", context), "runtime-config", "canceling the discard confirmation should keep the runtime config section active");

vm.runInContext('el.formOpenaiModel.value = "";', context);
elements.get("form-openai-model").listeners.input();

assert.equal(elements.get("save-config-button").disabled, true, "runtime save should disable after reverting form edits");
assert.equal(elements.get("runtime-dirty-indicator").classList.contains("hidden"), true, "runtime dirty indicator should hide after reverting form edits");

vm.runInContext('el.formCheatCheckEnabled.checked = true;', context);
elements.get("form-cheat-check-enabled").listeners.change();

assert.equal(elements.get("save-config-button").disabled, false, "changing a null feature flag should make runtime config dirty");
assert.equal(elements.get("form-cheat-check-enabled").indeterminate, false, "editing a null feature flag should clear indeterminate state");
assert.equal(vm.runInContext("buildConfigFromForm().feature_flags.cheat_check_enabled", context), true, "edited feature flags should serialize as booleans");

vm.runInContext(`
state.selectedPrompt = "game_master.txt";
state.selectedPromptHasOverride = true;
state.loadedPromptContent = "base prompt";
state.hasUnsavedPromptChanges = false;
el.promptOverride.value = "base prompt";
updatePromptButtons();
`, context);

assert.equal(elements.get("save-prompt-button").disabled, true, "prompt save should be disabled when content is unchanged");
assert.equal(elements.get("prompt-dirty-indicator").classList.contains("hidden"), true, "prompt dirty indicator should hide when content is unchanged");

vm.runInContext('el.promptOverride.value = "changed prompt";', context);
elements.get("prompt-override").listeners.input();

assert.equal(elements.get("save-prompt-button").disabled, false, "prompt save should enable after editing");
assert.equal(elements.get("prompt-dirty-indicator").classList.contains("hidden"), false, "prompt dirty indicator should show after editing");

vm.runInContext('el.promptOverride.value = "base prompt";', context);
elements.get("prompt-override").listeners.input();

assert.equal(elements.get("save-prompt-button").disabled, true, "prompt save should disable after reverting edits");
assert.equal(elements.get("prompt-dirty-indicator").classList.contains("hidden"), true, "prompt dirty indicator should hide after reverting edits");

const now = Date.now();
vm.runInContext(`
state.players = [
    {
        player_id: "player...1111",
        latest_session_id: "session...1111",
        session_count: 2,
        last_activity: new Date(${now} - 60 * 60 * 1000).toISOString(),
        latest_chapter: "3",
        latest_status: "playing",
        data_sources: ["meta.json"],
    },
    {
        player_id: "player...2222",
        latest_session_id: "session...2222",
        session_count: 1,
        last_activity: new Date(${now} - 8 * 24 * 60 * 60 * 1000).toISOString(),
        latest_chapter: "1",
        latest_status: "paused",
        data_sources: ["index.json"],
    },
];
el.playersFilter.value = "playing";
el.playersActivityFilter.value = "all";
applyPlayersFilters();
`, context);

assert.equal(elements.get("players-list").children.length, 1, "text search should filter the players list");
assert.equal(elements.get("players-filter-count").textContent, "Showing 1 of 2 players", "filtered count should report visible and total players");
assert.match(collectText(elements.get("players-list")), /playing/, "filtered card should include the matching status text");

vm.runInContext(`
el.playersFilter.value = "";
el.playersActivityFilter.value = "inactive";
applyPlayersFilters();
`, context);

assert.equal(elements.get("players-list").children.length, 1, "inactive filter should show players inactive for at least 7 days");
assert.match(collectText(elements.get("players-list")), /player\.\.\.2222/, "inactive filter should keep the older player");

vm.runInContext("clearPlayerFilters();", context);

assert.equal(elements.get("players-filter").value, "", "clear filters should reset the search input");
assert.equal(elements.get("players-activity-filter").value, "all", "clear filters should reset activity filter");
assert.equal(elements.get("players-list").children.length, 2, "clear filters should restore all loaded players");
