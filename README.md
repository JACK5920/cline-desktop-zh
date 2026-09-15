# Cline 桌面端中文汉化补丁 (cline-desktop-zh)

基于 WebView2 远程调试协议 (CDP) 的 **运行时 DOM 动态注入汉化方案**。

专为 Cline 桌面客户端（基于 Tauri + WebView2 架构）量身打造，具备 **零侵入二进制、防官方更新失效、无黑框后台静默运行、随软件退出自动回收** 等核心特性。

---

## 🌟 核心特性

- **🛡️ 零侵入与防更新失效**：不修改任何官方 `.exe`、动态链接库或核心文件。官方客户端发布新版本自动覆盖更新后，汉化依然稳定生效。
- **🤫 零黑框后台静默运行**：提供经过优化的 VBS 启动器，彻底消除终端黑框，静默守护进程并在后台透明完成中文化。
- **🌐 双栈网络与端口自适应**：智能探测 `127.0.0.1` (IPv4) 与 `[::1]` (IPv6) 的 9333 端口，杜绝端口占用与连接失败。
- **🔄 生命周期自动化感知**：注入器自动监听 Cline 窗口状态。当 Cline 客户端关闭退出后，后台注入进程在 15 秒内自动安全终止，零资源残留。
- **🧩 深度组件级汉化 (400+ 词条)**：
  - **定时任务 (Routine / Schedule)**：任务列表、执行频率（每天/每周/单次）、预设模板（查找关键缺陷、安全扫描、每日变更简报、更新文档）及表单全汉化。
  - **自定义与扩展 (Customize / Extensions)**：
    - 选项卡：工具 (Tools)、插件 (Plugins)、技能 (Skills)、规则 (Rules)、MCP、钩子 (Hooks)。
    - **内置工具 (BuiltIn Tools)**：全量内置工具（`ask_question`、`editor`、`fetch_web_content`、`read_files`、`run_commands`、`search_codebase`、`skills`、`tasks`、`spawn_agent`、`teams` 等）详细行为说明全部中文化。
    - 开关、搜索框与批量控制（全部启用 / 全部禁用）。
  - **添加提供商 (Add Provider)**：兼容 OpenAI 提供商表单、API Key 密钥管理、模型能力标签（流式传输、工具调用、深度思考/推理、视觉识别、提示词缓存）、高级网络设置（超时、自定义请求头）等。
  - **模型提供商列表 (Providers)**：状态指示、动态计数（如 `X 已配置 · Y 可用`）、模型选择与校验。
  - **语音输入 (Voice Input)**：麦克风权限、听写设置、语言与灵敏度调节。
  - **常规与系统设置 (General Settings)**：通知渠道（系统横幅/音效）、运行环境、终端配置等。
  - **聊天栏与交互界面**：输入框占位符、操作按钮、提示标签、快捷键提示。
- **⚡ React/JSX 空白字符折叠归一化**：内置对 React JSX 模板渲染中换行符与制表符的归一化处理引擎，杜绝多行长文本匹配失效。

---

## 📂 目录结构

```text
cline-zh/
├── dictionary.json                 # 核心汉化词典 (含 texts、attrs、textPatterns、attrPatterns)
├── inject.js                       # 基于 WebView2 CDP 的核心注入器
├── launch-silent.vbs               # 智能静默启动脚本 (无黑框、防多开、自动拉起)
├── 启动 Cline 中文版.cmd            # 调试运行脚本 (显示控制台输出，便于调试)
├── 停止后台汉化.cmd                 # 一键结束后台注入器进程
├── .gitignore                      # Git 忽略文件
├── LICENSE                         # MIT 开源许可证
└── README.md                       # 说明文档
```

---

## 🚀 快速上手

### 前置条件
- 已安装 [Node.js](https://nodejs.org/) (建议 LTS 版本)。
- 已安装 [Cline 桌面客户端](https://cline.bot/)。

### 安装与部署
1. 将 `cline-zh` 文件夹放置在 Cline 应用程序根目录下（通常为 `E:\Program Files\Cline\cline-zh` 或 `C:\Program Files\Cline\cline-zh`）。
2. 在桌面创建快捷方式，目标指向 `launch-silent.vbs`：
   - **目标 (Target)**：`wscript.exe "E:\Program Files\Cline\cline-zh\launch-silent.vbs"`
   - **起始位置 (Start in)**：`"E:\Program Files\Cline\cline-zh"`
   - **图标 (Icon)**：选择 `E:\Program Files\Cline\cline-app.exe`
3. 以后直接双击该桌面快捷方式，即可享受纯净无黑框的中文版 Cline！

---

## ❓ 常见问题 (FAQ)

### Q: Cline 客户端更新后汉化会失效吗？
**不会失效**。本补丁采用独立的外部挂载和动态注入设计，更新时官方安装包仅覆盖自身程序文件，不会影响 `cline-zh` 目录与桌面快捷方式。

### Q: 如何恢复原版英文界面？
直接运行原版 `cline-app.exe` 启动，或运行 `停止后台汉化.cmd` 即可恢复原版。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。
