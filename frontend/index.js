// --- Constants ---
const API_BASE_URL = "/api";

// --- State Management ---
const appState = {
    gameState: null,
    lastRollEventId: null,  // 用于检测骰子事件变化
    isLoading: false,
    isLoggingIn: false,
    isSendingAction: false,
    connectionStatus: 'idle',
    connectionMessage: '正在检查试玩会话...',
};

// --- Smooth Scroll State ---
const scrollState = {
    animationId: null,
    isUserScrolling: false,
    lastScrollTop: 0,
    scrollTimeout: null,
    isFirstRender: true,  // 标记是否为首次渲染（重连后）
};

// --- DOM Elements ---
const DOMElements = {
    loginView: document.getElementById('login-view'),
    gameView: document.getElementById('game-view'),
    loginForm: document.getElementById('login-form'),
    loginUsername: document.getElementById('login-username'),
    loginInviteCode: document.getElementById('login-invite-code'),
    loginButton: document.getElementById('login-button'),
    loginStatus: document.getElementById('login-status'),
    loginError: document.getElementById('login-error'),
    logoutButton: document.getElementById('logout-button'),
    connectionBanner: document.getElementById('connection-banner'),
    sceneBackgroundImage: document.getElementById('scene-background-image'),
    statusToggleButton: document.getElementById('status-toggle-button'),
    statusCloseButton: document.getElementById('status-close-button'),
    statusRailButton: document.getElementById('status-rail-button'),
    narrativeWindow: document.getElementById('narrative-window'),
    characterStatus: document.getElementById('character-status'),
    opportunitiesSpan: document.getElementById('opportunities'),
    actionInput: document.getElementById('action-input'),
    actionButton: document.getElementById('action-button'),
    actionStatus: document.getElementById('action-status'),
    startTrialButton: document.getElementById('start-trial-button'),
    loadingSpinner: document.getElementById('loading-spinner'),
    rollOverlay: document.getElementById('roll-overlay'),
    rollPanel: document.getElementById('roll-panel'),
    rollType: document.getElementById('roll-type'),
    rollTarget: document.getElementById('roll-target'),
    rollResultDisplay: document.getElementById('roll-result-display'),
    rollOutcome: document.getElementById('roll-outcome'),
    rollValue: document.getElementById('roll-value'),
};

// --- API Client ---
const api = {
    async loginSimple(username, inviteCode) {
        const response = await fetch(`${API_BASE_URL}/login/simple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, invite_code: inviteCode }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.detail || '登录失败');
        }
        return data;
    },
    async initGame() {
        const response = await fetch(`${API_BASE_URL}/game/init`, {
            method: 'POST',
            // No Authorization header needed, relies on HttpOnly cookie
        });
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        if (!response.ok) throw new Error('Failed to initialize game session');
        return response.json();
    },
    async logout() {
        await fetch(`${API_BASE_URL}/logout`, { method: 'POST' });
        window.location.href = '/';
    }
};

// --- WebSocket Manager ---
const socketManager = {
    socket: null,
    connect({ reconnecting = false } = {}) {
        return new Promise((resolve, reject) => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                setConnectionStatus('connected', '已连接，可以继续试炼。');
                resolve();
                return;
            }
            setConnectionStatus(
                reconnecting ? 'reconnecting' : 'connecting',
                reconnecting ? '连接中断，正在尝试重连...' : '正在连接命运之书...'
            );
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            // The token is no longer in the URL; it's read from the cookie by the server.
            const wsUrl = `${protocol}//${host}${API_BASE_URL}/ws`;
            const socket = new WebSocket(wsUrl);
            this.socket = socket;
            socket.binaryType = 'arraybuffer'; // Important for receiving binary data
            let hasOpened = false;

            socket.onopen = () => {
                hasOpened = true;
                console.log("WebSocket established.");
                setConnectionStatus('connected', '已连接，可以继续试炼。');
                resolve();
            };
            socket.onmessage = (event) => {
                let message;
                // Check if the data is binary (ArrayBuffer)
                if (event.data instanceof ArrayBuffer) {
                    try {
                        // Decompress the gzip data using pako.ungzip
                        const decompressed = pako.ungzip(new Uint8Array(event.data), { to: 'string' });
                        message = JSON.parse(decompressed);
                    } catch (err) {
                        console.error('Failed to decompress or parse message:', err);
                        return;
                    }
                } else {
                    // Fallback for non-binary messages
                    message = JSON.parse(event.data);
                }
                
                switch (message.type) {
                    case 'full_state':
                        appState.isSendingAction = false;
                        appState.gameState = message.data;
                        checkAndShowRollEvent();
                        render();
                        break;
                    case 'patch':
                        // Apply JSON Patch
                        if (appState.gameState && message.patch) {
                            try {
                                appState.isSendingAction = false;
                                const result = jsonpatch.applyPatch(appState.gameState, message.patch, true, false);
                                appState.gameState = result.newDocument;
                                checkAndShowRollEvent();
                                render();
                            } catch (err) {
                                console.error('Failed to apply patch:', err);
                            }
                        }
                        break;
                    case 'error':
                        appState.isSendingAction = false;
                        console.error('WebSocket message error received.');
                        setConnectionStatus('error', '命运记录暂时无法回应，请稍后再试。');
                        updateActionControls();
                        break;
                }
            };
            socket.onclose = () => {
                if (this.socket !== socket) return;
                appState.isSendingAction = false;
                if (!hasOpened) {
                    setConnectionStatus('disconnected', '无法连接服务器，请检查网络后重试。');
                    reject(new Error('WebSocket closed before connecting'));
                    return;
                }
                console.log("Reconnecting...");
                setConnectionStatus('reconnecting', '连接中断，5 秒后自动重连。');
                setTimeout(() => {
                    this.connect({ reconnecting: true }).catch(() => {
                        setConnectionStatus('disconnected', '重连失败，请稍后刷新页面。');
                    });
                }, 5000);
            };
            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                if (!hasOpened) {
                    setConnectionStatus('error', '无法连接服务器，请确认试玩地址可访问。');
                }
            };
        });
    },
    sendAction(action) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ action }));
            return true;
        }
        setConnectionStatus('disconnected', '连接已断开，正在尝试重连。');
        return false;
    }
};

// --- UI & Rendering ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

function setConnectionStatus(status, message) {
    appState.connectionStatus = status;
    appState.connectionMessage = message;
    renderConnectionStatus();
    updateActionControls();
}

function getEffectiveConnectionStatus() {
    return appState.isSendingAction ? 'sending' : appState.connectionStatus;
}

function renderConnectionStatus() {
    if (!DOMElements.connectionBanner) return;
    const status = getEffectiveConnectionStatus();
    const fallbackMessages = {
        idle: '正在检查试玩会话...',
        connecting: '正在连接命运之书...',
        connected: '已连接，可以继续试炼。',
        reconnecting: '连接中断，正在尝试重连...',
        disconnected: '连接已断开，请稍后重试。',
        error: '连接出现问题，请稍后重试。',
        sending: '行动已送出，等待命运回应...',
    };
    DOMElements.connectionBanner.textContent = status === 'sending'
        ? fallbackMessages.sending
        : (appState.connectionMessage || fallbackMessages[status] || fallbackMessages.idle);
    DOMElements.connectionBanner.className = `connection-banner connection-${status}`;
}

function setLoginBusy(isBusy) {
    appState.isLoggingIn = isBusy;
    DOMElements.loginUsername.disabled = isBusy;
    DOMElements.loginInviteCode.disabled = isBusy;
    DOMElements.loginButton.disabled = isBusy;
    DOMElements.loginButton.textContent = isBusy ? '进入中...' : '进入试炼';
    DOMElements.loginStatus.textContent = isBusy ? '正在进入试玩会话...' : '';
}

function formatLoginError(error) {
    const message = error?.message || '';
    if (/invalid invite code/i.test(message)) {
        return '邀请码不正确，请确认朋友分享的试玩码。';
    }
    if (/failed to fetch|network/i.test(message)) {
        return '无法连接服务器，请确认试玩地址可访问。';
    }
    if (/username|道号/i.test(message)) {
        return message;
    }
    return message || '登录失败，请稍后再试。';
}

function canUseConnection() {
    return appState.connectionStatus === 'connected';
}

function canSendAction(isStartTrialAction) {
    if (!appState.gameState) return false;
    if (!canUseConnection() || appState.isLoading || appState.isSendingAction || appState.gameState.is_processing) {
        return false;
    }
    const { is_in_trial, daily_success_achieved, opportunities_remaining } = appState.gameState;
    if (daily_success_achieved) {
        return false;
    }
    if (isStartTrialAction) {
        return !is_in_trial && opportunities_remaining > 0;
    }
    return Boolean(is_in_trial);
}

function getActionStatusMessage() {
    if (!appState.gameState) {
        return '正在载入试玩会话...';
    }
    if (appState.isSendingAction) {
        return '行动已送出，等待命运回应...';
    }
    if (appState.gameState.is_processing) {
        return '命运正在回应，请稍候...';
    }
    if (appState.connectionStatus === 'idle') {
        return '正在建立实时连接...';
    }
    if (appState.connectionStatus === 'connecting') {
        return '正在连接命运之书...';
    }
    if (appState.connectionStatus === 'reconnecting') {
        return '连接中断，正在自动重连；重连前不能提交行动。';
    }
    if (appState.connectionStatus === 'disconnected' || appState.connectionStatus === 'error') {
        return appState.connectionMessage || '连接不可用，请稍后重试。';
    }

    const { is_in_trial, daily_success_achieved, opportunities_remaining } = appState.gameState;
    if (daily_success_achieved) {
        return '今日功德圆满，明日可再入梦。';
    }
    if (!is_in_trial && opportunities_remaining <= 0) {
        return '今日机缘已尽，明日可再试炼。';
    }
    if (!is_in_trial) {
        return opportunities_remaining === 10 ? '准备好后开始第一次试炼。' : '可开启下一次试炼。';
    }
    return '输入你要采取的行动，按 Enter 或点击「定」。';
}

function updateActionControls() {
    const canAct = canSendAction(false);
    const canStartTrial = canSendAction(true);
    DOMElements.actionInput.disabled = !canAct;
    DOMElements.actionButton.disabled = !canAct;
    DOMElements.startTrialButton.disabled = !canStartTrial;
    DOMElements.actionButton.textContent = (appState.isLoading || appState.isSendingAction || appState.gameState?.is_processing)
        ? '等待'
        : '定';
    DOMElements.actionStatus.textContent = getActionStatusMessage();
}

function renderMarkdownSafe(markdownText) {
    const rawHtml = marked.parse(markdownText || "", { mangle: false, headerIds: false });
    return DOMPurify.sanitize(rawHtml, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "link", "meta"],
        FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onmouseenter", "onmouseleave", "style"],
    });
}

// --- Smooth Scroll Functions ---
function stopSmoothScroll() {
    if (scrollState.animationId) {
        cancelAnimationFrame(scrollState.animationId);
        scrollState.animationId = null;
    }
}

function smoothScrollToBottom(element, pixelsPerSecond = 150) {
    // 停止之前的滚动动画
    stopSmoothScroll();
    
    // 如果用户正在手动滚动，不启动自动滚动
    if (scrollState.isUserScrolling) {
        return;
    }
    
    const startScrollTop = element.scrollTop;
    const minScrollDistance = 50; // 最小滚动距离阈值
    
    function tryStartScroll(retryCount = 0) {
        const targetScrollTop = element.scrollHeight - element.clientHeight;
        const distance = targetScrollTop - startScrollTop;
        
        // 如果滚动空间太小，等待内容加载（最多等1秒，每100ms检查一次）
        if (distance < minScrollDistance && retryCount < 10) {
            setTimeout(() => tryStartScroll(retryCount + 1), 100);
            return;
        }
        
        // 如果等了1秒还是没有足够的滚动空间，放弃
        if (distance <= 0) {
            return;
        }
        
        // 再次检查用户是否开始手动滚动
        if (scrollState.isUserScrolling) {
            return;
        }
        
        const startTime = performance.now();
        const duration = (distance / pixelsPerSecond) * 1000;
        
        function animateScroll(currentTime) {
            if (scrollState.isUserScrolling) {
                scrollState.animationId = null;
                return;
            }
            
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            
            element.scrollTop = startScrollTop + (distance * easeProgress);
            
            if (progress < 1) {
                scrollState.animationId = requestAnimationFrame(animateScroll);
            } else {
                scrollState.animationId = null;
            }
        }
        
        scrollState.animationId = requestAnimationFrame(animateScroll);
    }
    
    tryStartScroll();
}

function setupScrollInterruptListener(element) {
    // 检测用户滚轮滚动
    element.addEventListener('wheel', () => {
        scrollState.isUserScrolling = true;
        stopSmoothScroll();
        
        // 清除之前的超时
        if (scrollState.scrollTimeout) {
            clearTimeout(scrollState.scrollTimeout);
        }
        
        // 2秒后重置用户滚动状态，允许下次自动滚动
        scrollState.scrollTimeout = setTimeout(() => {
            scrollState.isUserScrolling = false;
        }, 2000);
    }, { passive: true });
    
    // 检测触摸滚动
    element.addEventListener('touchstart', () => {
        scrollState.isUserScrolling = true;
        stopSmoothScroll();
    }, { passive: true });
    
    element.addEventListener('touchend', () => {
        if (scrollState.scrollTimeout) {
            clearTimeout(scrollState.scrollTimeout);
        }
        scrollState.scrollTimeout = setTimeout(() => {
            scrollState.isUserScrolling = false;
        }, 2000);
    }, { passive: true });
}

function showLoading(isLoading) {
    appState.isLoading = isLoading;
    // 只在初始化时显示全屏加载（gameState 为空时）
    const showFullscreenSpinner = isLoading && !appState.gameState;
    DOMElements.loadingSpinner.style.display = showFullscreenSpinner ? 'flex' : 'none';
    updateActionControls();
}

function render() {
    if (!appState.gameState) { showLoading(true); return; }
    showLoading(appState.gameState.is_processing);
    renderConnectionStatus();
    DOMElements.opportunitiesSpan.textContent = appState.gameState.opportunities_remaining;
    renderCharacterStatus();

    const historyContainer = document.createDocumentFragment();
    (appState.gameState.display_history || []).forEach(text => {
        const p = document.createElement('div');
        p.innerHTML = renderMarkdownSafe(text);
        if (text.startsWith('> ')) p.classList.add('user-input-message');
        else if (text.startsWith('【')) p.classList.add('system-message');
        historyContainer.appendChild(p);
    });
    DOMElements.narrativeWindow.innerHTML = '';
    DOMElements.narrativeWindow.appendChild(historyContainer);
    scheduleSceneBackgroundUpdate();
    
    // 首次渲染直接跳到底部，之后使用平滑滚动
    if (scrollState.isFirstRender) {
        DOMElements.narrativeWindow.scrollTop = DOMElements.narrativeWindow.scrollHeight;
        scrollState.isFirstRender = false;
    } else {
        smoothScrollToBottom(DOMElements.narrativeWindow, 150);
    }
    
    const { is_in_trial, daily_success_achieved, opportunities_remaining } = appState.gameState;
    DOMElements.actionInput.parentElement.classList.toggle('hidden', !is_in_trial);
    const startButton = DOMElements.startTrialButton;
    startButton.classList.toggle('hidden', is_in_trial);

    if (daily_success_achieved) {
         startButton.textContent = "今日试炼已完成";
    } else if (opportunities_remaining <= 0) {
        startButton.textContent = "机缘已尽";
    } else {
        if (opportunities_remaining === 10) {
            startButton.textContent = "开始第一次试炼";
        } else {
            startButton.textContent = "开启下一次试炼";
        }
    }
    updateActionControls();
}

function scheduleSceneBackgroundUpdate() {
    requestAnimationFrame(updateSceneBackground);
}

function updateSceneBackground() {
    const images = DOMElements.narrativeWindow.querySelectorAll('img[src]');
    const latestImage = Array.from(images).reverse().find(img => img.complete && img.naturalWidth > 0);

    if (!latestImage) {
        images.forEach(img => {
            img.addEventListener('load', scheduleSceneBackgroundUpdate, { once: true });
            img.addEventListener('error', scheduleSceneBackgroundUpdate, { once: true });
        });
        if (!images.length) {
            document.body.classList.remove('has-scene-background');
            DOMElements.sceneBackgroundImage.removeAttribute('src');
        }
        return;
    }

    const imageUrl = latestImage.currentSrc || latestImage.src;
    if (DOMElements.sceneBackgroundImage.src !== imageUrl) {
        DOMElements.sceneBackgroundImage.src = imageUrl;
    }
    document.body.classList.add('has-scene-background');
}

function renderValue(container, value, level = 0) {
    if (Array.isArray(value)) {
        value.forEach(item => renderValue(container, item, level + 1));
    } else if (typeof value === 'object' && value !== null) {
        const subContainer = document.createElement('div');
        subContainer.style.paddingLeft = `${level * 10}px`;
        Object.entries(value).forEach(([key, val]) => {
            const propDiv = document.createElement('div');
            propDiv.classList.add('property-item');
            
            const keySpan = document.createElement('span');
            keySpan.classList.add('property-key');
            keySpan.textContent = `${key}: `;
            propDiv.appendChild(keySpan);

            // Recursively render the value
            renderValue(propDiv, val, level + 1);
            subContainer.appendChild(propDiv);
        });
        container.appendChild(subContainer);
    } else {
        const valueSpan = document.createElement('span');
        valueSpan.classList.add('property-value');
        valueSpan.textContent = value;
        container.appendChild(valueSpan);
    }
}

function renderCharacterStatus() {
    const { current_life } = appState.gameState;
    const container = DOMElements.characterStatus;
    container.innerHTML = ''; // Clear previous content

    if (!current_life) {
        container.textContent = '静待天命...';
        return;
    }

    Object.entries(current_life).forEach(([key, value]) => {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = key;
        details.appendChild(summary);

        const content = document.createElement('div');
        content.classList.add('details-content');
        
        renderValue(content, value);
        
        details.appendChild(content);
        container.appendChild(details);
    });
}

function checkAndShowRollEvent() {
    const rollEvent = appState.gameState?.roll_event;
    if (rollEvent && rollEvent.id && rollEvent.id !== appState.lastRollEventId) {
        appState.lastRollEventId = rollEvent.id;
        renderRollEvent(rollEvent);
    }
}

function renderRollEvent(rollEvent) {
    DOMElements.rollType.textContent = `判定: ${rollEvent.type}`;
    DOMElements.rollTarget.textContent = `(<= ${rollEvent.target})`;
    DOMElements.rollOutcome.textContent = rollEvent.outcome;
    DOMElements.rollOutcome.className = `outcome-${rollEvent.outcome}`;
    DOMElements.rollValue.textContent = rollEvent.result;
    DOMElements.rollResultDisplay.classList.add('hidden');
    DOMElements.rollOverlay.classList.remove('hidden');
    setTimeout(() => DOMElements.rollResultDisplay.classList.remove('hidden'), 1000);
    setTimeout(() => DOMElements.rollOverlay.classList.add('hidden'), 3000);
}

// --- Status Panel Management ---
function setStatusPanelCollapsed(isCollapsed) {
    DOMElements.gameView.classList.toggle('status-collapsed', isCollapsed);
    DOMElements.statusToggleButton.textContent = isCollapsed ? '展开状态' : '收起状态';
    DOMElements.statusToggleButton.setAttribute('aria-expanded', String(!isCollapsed));
    DOMElements.statusRailButton.setAttribute('aria-expanded', String(!isCollapsed));
}

function toggleStatusPanel() {
    setStatusPanelCollapsed(!DOMElements.gameView.classList.contains('status-collapsed'));
}

function initializeStatusPanelLayout() {
    setStatusPanelCollapsed(window.matchMedia('(max-width: 850px)').matches);
}

// --- Event Handlers ---
function handleLogout() {
    api.logout();
}

async function handleSimpleLogin(event) {
    event.preventDefault();
    if (appState.isLoggingIn) return;
    const username = DOMElements.loginUsername.value.trim();
    const inviteCode = DOMElements.loginInviteCode.value.trim();
    DOMElements.loginError.textContent = '';
    if (!username) {
        DOMElements.loginError.textContent = '请先填写一个道号。';
        DOMElements.loginUsername.focus();
        return;
    }
    setLoginBusy(true);

    try {
        await api.loginSimple(username, inviteCode);
        appState.gameState = null;
        scrollState.isFirstRender = true;
        await initializeGame();
    } catch (error) {
        DOMElements.loginError.textContent = formatLoginError(error);
    } finally {
        setLoginBusy(false);
    }
}

function handleAction(actionOverride = null) {
    const action = actionOverride || DOMElements.actionInput.value.trim();
    if (!action) return;
    const isStartTrialAction = action === "开始试炼";

    if (!canSendAction(isStartTrialAction)) {
        updateActionControls();
        return;
    }

    const sent = socketManager.sendAction(action);
    if (!sent) {
        updateActionControls();
        return;
    }
    appState.isSendingAction = true;
    DOMElements.actionInput.value = '';
    renderConnectionStatus();
    updateActionControls();
}

// --- Initialization ---
async function initializeGame() {
    showLoading(true);
    try {
        const initialState = await api.initGame();
        appState.gameState = initialState;
        render();
        showView('game-view');
        const connected = await socketManager.connect().then(() => true).catch((error) => {
            console.error(`WebSocket initialization failed: ${error.message}`);
            return false;
        });
        if (connected) console.log("Initialization complete and WebSocket is ready.");
    } catch (error) {
        // If init fails (e.g. no valid cookie), just show the login view.
        // The api.initGame function no longer redirects, it just throws an error.
        showView('login-view');
        setConnectionStatus('idle', '正在检查试玩会话...');
        if (error.message !== 'Unauthorized') {
             console.error(`Session initialization failed: ${error.message}`);
             DOMElements.loginError.textContent = '无法载入试玩会话，请稍后再试。';
        }
    } finally {
        // Ensure spinner is hidden regardless of outcome
        showLoading(false);
    }
}

function init() {
    initializeStatusPanelLayout();

    // Always try to initialize the game on page load.
    // If the user is logged in, it will show the game view.
    // If not, the catch block in initializeGame will handle showing the login view.
    initializeGame();

    // Setup scroll interrupt listener
    setupScrollInterruptListener(DOMElements.narrativeWindow);

    // Setup event listeners regardless of initial view
    DOMElements.loginForm.addEventListener('submit', handleSimpleLogin);
    DOMElements.logoutButton.addEventListener('click', handleLogout);
    DOMElements.statusToggleButton.addEventListener('click', toggleStatusPanel);
    DOMElements.statusCloseButton.addEventListener('click', () => setStatusPanelCollapsed(true));
    DOMElements.statusRailButton.addEventListener('click', () => setStatusPanelCollapsed(false));
    DOMElements.actionButton.addEventListener('click', () => handleAction());
    DOMElements.actionInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAction(); });
    DOMElements.startTrialButton.addEventListener('click', () => handleAction("开始试炼"));
}

// --- Start the App ---
init();
