# The Fate Cycle

**The Fate Cycle** 是基于 [CassiopeiaCode/TenCyclesofFate](https://github.com/CassiopeiaCode/TenCyclesofFate) / 《浮生十梦》改造而来的 fork 版本。

## 📜 Fork 说明

**原项目**：
- 作者：CassiopeiaCode
- 仓库：https://github.com/CassiopeiaCode/TenCyclesofFate
- 原名：《浮生十梦》

**本 fork 的主要改动**：
- ✅ **Admin Management Console** - 后台管理界面，支持 LLM 配置、Runtime Config、Prompts 管理、Players 概览、System 状态监控
- ✅ **Runtime Config System** - 运行时配置系统，支持表单化编辑和 JSON 高级模式
- ✅ **Prompt Override System** - Prompt 覆盖系统，支持查看 default/override/effective 三层 prompt
- ✅ **LLM Secret Store** - API 密钥安全存储和管理
- ✅ **简化登录流程** - 朋友试玩优先的简化登录（Simple Login + Invite Code）
- ✅ **前端体验优化** - Dashboard、状态卡片、响应式布局等
- ✅ **可维护性提升** - 模块化代码结构、测试脚本、配置分离

**许可说明**：

上游仓库当前未提供明确的 LICENSE 文件。本 fork 保留原项目来源说明和作者信息。

⚠️ **重要**：若要将本项目作为正式开源软件发布、商用或再分发，建议先向上游作者确认 License 或请求其补充开源协议。

---

## 🎮 游戏介绍

**《浮生十梦》/ The Fate Cycle** 是一款基于 Web 的沉浸式文字冒险游戏。玩家在游戏中扮演一个与命运博弈的角色，每天有十次机会进入不同的"梦境"（即生命轮回），体验由 AI 动态生成的、独一无二的人生故事。游戏的核心在于"知足"与"贪欲"之间的抉择：是见好就收，还是追求更高的回报但可能失去一切？

## ✨ 功能特性

- **动态 AI 生成内容**:每一次游戏体验都由大型语言模型（如 GPT）实时生成，确保了故事的独特性和不可预测性。
- **实时交互**: 通过 WebSocket 实现前端与后端的实时通信，提供流畅的游戏体验。
- **OAuth2 认证**: 集成 Linux.do OAuth2 服务，实现安全便捷的用户登录。
- **Simple Login**: 支持 Invite Code 简化登录，适合朋友试玩场景。
- **精美的前端界面**: 采用具有"江南园林"风格的 UI 设计，提供沉浸式的视觉体验。
- **互动式判定系统**: 游戏中的关键行动可能触发"天命判定"。AI 会根据情境请求一次 D100 投骰，其"成功"、"失败"、"大成功"或"大失败"的结果将实时影响叙事走向，增加了游戏的随机性和戏剧性。
- **智能反作弊机制**: 内置一套基于 AI 的反作弊系统。它会分析玩家的输入行为，以识别并惩罚那些试图使用"奇巧咒语"（如 Prompt 注入）来破坏游戏平衡或牟取不当利益的玩家，确保了游戏的公平性。
- **Admin Console**: 后台管理界面，支持 LLM 配置测试、Runtime Config 管理、Prompt 覆盖、玩家统计、系统状态监控等。
- **数据持久化**: 游戏状态会定期保存，并在应用重启时加载，保证玩家进度不丢失。

## 🛠️ 技术栈

- **后端**:
  - **框架**: FastAPI
  - **Web 服务器**: Uvicorn
  - **实时通信**: WebSockets
  - **认证**: Python-JOSE (JWT), Authlib (OAuth)
  - **数据库**: SQLite (用于存储兑换码)
  - **AI 集成**: OpenAI API
  - **依赖管理**: uv / pip

- **前端**:
  - **语言**: HTML, CSS, JavaScript (ESM)
  - **库**:
    - `marked.js`: 用于在前端渲染 Markdown 格式的叙事文本。
    - `pako.js`: 用于解压缩从 WebSocket 服务器接收的 Gzip 数据，提高传输效率。

## 🚀 部署指南

请遵循以下步骤在您的本地环境或服务器上部署 The Fate Cycle。

### 1. 环境准备

确保您的系统已安装以下软件：

- **Python 3.8+**
- **Git**
- **uv** (推荐, 用于快速安装依赖):
  ```bash
  pip install uv
  ```

### 2. 获取项目代码

使用 `git` 克隆本仓库到您的本地机器：

```bash
git clone https://github.com/SohriCarryU/The-Fate-Cycle.git
cd The-Fate-Cycle
```

### 3. 安装后端依赖

项目使用 `uv`（或 `pip`）来管理 Python 依赖。在项目根目录下运行：

```bash
# 使用 uv (推荐)
uv pip install -r backend/requirements.txt

# 或者使用 pip
pip install -r backend/requirements.txt
```

### 4. 配置环境变量

项目的所有配置都通过环境变量进行管理。

1.  **创建 `.env` 文件**:
    在 `backend/` 目录下，复制示例文件 `.env.example` 并重命名为 `.env`。

    ```bash
    cp backend/.env.example backend/.env
    ```

2.  **编辑 `.env` 文件**:
    使用文本编辑器打开 `backend/.env` 文件，并填入以下必要信息：

    ```dotenv
    # OpenAI API Settings
    # 必填。你的 OpenAI API 密钥。
    OPENAI_API_KEY="your_openai_api_key_here"
    # 如果你使用代理或第三方服务，请修改此 URL。
    OPENAI_BASE_URL="https://api.openai.com/v1"
    # 指定用于生成游戏内容的模型。
    OPENAI_MODEL="gpt-4o"
    # 指定用于作弊检查的模型。
    OPENAI_MODEL_CHEAT_CHECK="gpt-3.5-turbo"

    # JWT Settings for OAuth2
    # 必填。一个长而随机的字符串，用于签名 JWT。
    # 你可以使用 `openssl rand -hex 32` 生成。
    SECRET_KEY="a_very_secret_key_that_should_be_changed"
    ALGORITHM="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES=600

    # Linux.do OAuth Settings
    # 必填。在 Linux.do 注册应用后获取的 Client ID。
    LINUXDO_CLIENT_ID="your_linuxdo_client_id"
    # 必填。在 Linux.do 注册应用后获取的 Client Secret。
    LINUXDO_CLIENT_SECRET="your_linuxdo_client_secret"
    LINUXDO_SCOPE="read"

    # Simple Login Settings
    # 选填。用于简化登录的邀请码。
    SIMPLE_LOGIN_INVITE_CODE="your_invite_code_here"

    # Admin Settings
    # 选填。Admin 后台密码。
    ADMIN_PASSWORD="your_admin_password_here"

    # Database
    # 数据库文件路径。默认指向项目根目录下的 veloera.db 文件。
    DATABASE_URL="sqlite:///veloera.db"

    # Server Settings
    # 服务器监听的主机和端口。
    HOST="0.0.0.0"
    PORT=8000
    # 是否开启热重载。在生产环境中建议设为 false。
    UVICORN_RELOAD=true
    ```

    **重要**:
    - **`SECRET_KEY`**: 必须更改为一个强随机字符串，否则会存在安全风险。
    - **`LINUXDO_CLIENT_ID` / `SECRET`**: 你需要在 [Linux.do](https://linux.do/) 的用户设置中注册一个新的 OAuth2 应用来获取这些凭证。**回调 URL (Redirect URI)** 必须设置为 `http://<你的域名或IP>:<端口>/callback`。例如：`http://localhost:8000/callback`。
    - **`SIMPLE_LOGIN_INVITE_CODE`**: 可选，用于朋友试玩的简化登录。
    - **`ADMIN_PASSWORD`**: 可选，用于访问 Admin 后台管理界面 (`/admin.html`)。

### 5. 运行应用

提供了一个 `run.sh` 脚本来方便地启动应用。

首先，给脚本添加执行权限：
```bash
chmod +x run.sh
```

然后，运行脚本：
```bash
./run.sh
```

脚本会自动加载 `backend/.env` 文件中的环境变量，并使用 `uvicorn` 启动 FastAPI 服务器。

服务器成功启动后，您应该会看到类似以下的输出：
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

现在，在您的浏览器中打开以下页面：
- **游戏首页**: `http://localhost:8000`
- **Admin 后台**: `http://localhost:8000/admin.html` (需要 ADMIN_PASSWORD)

### 6. 朋友试玩 Quickstart

若要让同一局域网内的朋友试玩：

1. 在 `backend/.env` 中设置 `HOST="0.0.0.0"` 让服务监听局域网地址；只在本机试玩时可以继续用 `HOST="127.0.0.1"`。
2. 设置一个临时 `SIMPLE_LOGIN_INVITE_CODE`。试玩者只需要填写一个道号和这个邀请码即可进入，不需要 OAuth。
3. 启动服务后，把 `http://<你的局域网IP>:8000` 和邀请码发给试玩者；不要写入或分享真实 API key、真实邀请码、Admin 密码、数据库文件或任何 `.env` 内容。
4. Admin 后台是可选管理入口，仅供房主使用；没有管理需求时可以不分享 `/admin.html`。
5. 试玩结束后可以更换或清空邀请码。

## 📁 项目结构

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI 应用入口
│   │   ├── config.py            # 环境变量配置
│   │   ├── auth.py              # OAuth2 / Simple Login 认证
│   │   ├── admin.py             # Admin API 端点
│   │   ├── game_logic.py        # 游戏核心逻辑
│   │   ├── state_manager.py     # 游戏状态管理
│   │   ├── openai_client.py     # OpenAI API 客户端
│   │   ├── runtime_config.py    # Runtime Config 管理
│   │   ├── llm_secret_store.py  # LLM Secret Store
│   │   ├── websocket_manager.py # WebSocket 连接管理
│   │   ├── cheat_check.py       # 反作弊系统
│   │   ├── redemption.py        # 兑换码系统
│   │   ├── live_system.py       # Live 观战系统
│   │   ├── image_store.py       # 图片生成存储
│   │   ├── security.py          # 安全工具
│   │   ├── db.py                # 数据库连接
│   │   └── prompts/             # 默认 Prompts
│   ├── tests/                   # 后端测试
│   ├── requirements.txt         # Python 依赖
│   └── .env.example             # 环境变量示例
├── frontend/
│   ├── index.html               # 游戏主页面
│   ├── index.js                 # 游戏前端逻辑
│   ├── index.css                # 游戏样式
│   ├── admin.html               # Admin 后台页面
│   ├── admin.js                 # Admin 前端逻辑
│   ├── admin.css                # Admin 样式
│   ├── live.html                # Live 观战页面
│   ├── live.js                  # Live 前端逻辑
│   ├── live.css                 # Live 样式
│   └── favicon.svg              # 网站图标
├── tests/
│   ├── frontend_layout_check.mjs # 前端布局检查
│   └── admin_console_check.mjs   # Admin 控制台检查
├── run.sh                       # 启动脚本
├── .gitignore                   # Git 忽略规则
└── README.md                    # 本文件
```

## 🎯 Admin 后台功能

访问 `http://localhost:8000/admin.html`，使用 `ADMIN_PASSWORD` 登录后，可以：

- **Dashboard**: 查看 LLM 配置状态、Runtime Config 状态、系统健康、玩家统计、Prompts 概览
- **LLM Config**: 配置和测试 OpenAI API Key、Base URL、模型选择
- **Runtime Config**: 管理运行时配置（表单模式 / JSON 模式）
- **Prompts**: 查看和覆盖系统 Prompts（game_master、start_game、start_trial、cheat_check）
- **Players**: 查看玩家列表、会话统计、活跃度
- **System**: 查看系统状态、数据库连接、环境变量、警告信息

## 🔧 开发与测试

```bash
# 编译 Python 代码检查语法
python -m compileall backend/app

# 运行前端布局检查
node tests/frontend_layout_check.mjs
node tests/admin_console_check.mjs

# 运行后端测试
pytest backend/tests/
```

## 🤝 贡献

本项目是 fork 自 CassiopeiaCode/TenCyclesofFate。欢迎提交 Issue 和 Pull Request。

## 📄 许可

本项目基于 [CassiopeiaCode/TenCyclesofFate](https://github.com/CassiopeiaCode/TenCyclesofFate) 开发。上游项目当前未提供明确的 LICENSE 文件。

⚠️ 使用本项目前，建议联系原作者确认许可协议。

## 🙏 致谢

- 感谢 [CassiopeiaCode](https://github.com/CassiopeiaCode) 创建原项目《浮生十梦》
- 感谢 OpenAI 提供强大的 AI 能力
- 感谢 Linux.do 社区的支持

---

**Enjoy The Fate Cycle! 🎲**
