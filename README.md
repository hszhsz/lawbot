# ⚖ 法 · Lawbot

> 专业中文法律 AI 智能体 — 律师的助手，普通用户的法律顾问  
> Professional Chinese Legal AI Agent — Your AI-powered legal assistant and advisor

[English](#english) | [中文](#chinese)

---

## Chinese

### 简介

Lawbot 是一个运行在终端中的专业中文法律 AI 智能体。它采用类似 Claude Code 的 TUI（终端用户界面）设计，为律师和普通用户提供：

- **案例咨询** — 输入法律问题，获得专业的法律分析和建议
- **合同审查** — 上传或粘贴合同文本，AI 自动识别风险条款
- **法律检索** — 搜索中国法律法规，提供法条原文和编号
- **文书起草** — 根据需求起草起诉状、协议、律师函等法律文书
- **知识库** — 内置民法典等核心法律文本，支持用户扩展

### 安装

```bash
# 克隆仓库
git clone https://github.com/hszhsz/lawbot.git
cd lawbot

# 安装依赖
pnpm install

# 构建
pnpm build

# 运行
pnpm start

# 或全局安装
npm install -g .
lawbot
```

### 配置

首次运行会自动创建配置模板 `~/.lawbot/config.yaml`：

```yaml
provider:
  type: anthropic              # anthropic | openai | openai-compatible
  apiKey: ${ANTHROPIC_API_KEY} # 从环境变量读取

model:
  default: claude-sonnet-4-20250514

agent:
  maxSteps: 10
  temperature: 0.7

ui:
  language: zh
  theme: dark
```

支持的模型提供商：
- **Anthropic** (Claude Sonnet/Opus) — 推荐，中文法律推理能力最强
- **OpenAI** (GPT-4o, GPT-5)
- **OpenAI 兼容** — 支持 DeepSeek、Qwen、Ollama 等

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+C` | 退出 / 取消当前请求 |
| `Ctrl+S` | 切换侧栏（会话列表） |
| `Ctrl+N` | 新建会话 |
| `Esc` | 取消当前 AI 请求 |

### 使用示例

```
▸ 根据民法典，租房合同到期不续签，房东需要提前多久通知？

⚖ Lawbot
根据《民法典》第七百三十四条，租赁期限届满，承租人继续使用租赁物，
出租人没有提出异议的，原租赁合同继续有效，但是租赁期限为不定期。
对于不定期租赁，当事人可以随时解除合同，但是应当在合理期限之前通知对方。

建议：
1. 查看合同中是否有续租条款
2. "合理期限"通常理解为30日
3. 如涉及商业租赁，建议提前60日通知
...
```

### 扩展知识库

将 Markdown 格式的法律文本放入 `~/.lawbot/knowledge/` 目录：

```markdown
# 法条标题
法条正文内容...

## 法条标题2
正文内容...
```

会自动加载并纳入检索范围。

### 许可证

MIT

---

## English

### Overview

Lawbot is a professional Chinese legal AI agent running in your terminal. With a Claude Code-inspired TUI design, it serves both legal professionals and the general public:

- **Case Consultation** — Get professional legal analysis by describing your situation
- **Contract Review** — Paste contract text for AI-powered risk analysis
- **Legal Research** — Search Chinese laws with precise article citations
- **Document Drafting** — Draft complaints, agreements, demand letters, and more
- **Knowledge Base** — Bundled with key Chinese Civil Code provisions, extensible by users

### Installation

```bash
git clone https://github.com/hszhsz/lawbot.git
cd lawbot
pnpm install
pnpm build
pnpm start

# Or install globally
npm install -g .
lawbot
```

### Configuration

On first run, a default config is created at `~/.lawbot/config.yaml`:

```yaml
provider:
  type: anthropic
  apiKey: ${ANTHROPIC_API_KEY}

model:
  default: claude-sonnet-4-20250514

agent:
  maxSteps: 10
  temperature: 0.7

ui:
  language: zh
  theme: dark
```

Supported providers:
- **Anthropic** (Claude models) — Recommended for Chinese legal reasoning
- **OpenAI** (GPT models)
- **OpenAI-compatible** — DeepSeek, Qwen, Ollama, etc.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+C` | Quit / Cancel request |
| `Ctrl+S` | Toggle sidebar |
| `Ctrl+N` | New session |
| `Esc` | Cancel current request |

### Extending the Knowledge Base

Place markdown-formatted legal texts in `~/.lawbot/knowledge/`:

```markdown
# Article Title
Article content...
```

Files are automatically loaded for retrieval during queries.

### License

MIT

---

> ⚠️ **Disclaimer**: Lawbot provides AI-generated legal information for reference only. It does not constitute formal legal advice. For specific legal matters, please consult a licensed legal practitioner.
>
> ⚠️ **免责声明**: Lawbot 提供 AI 生成的法律信息仅供参考，不构成正式法律意见。具体法律问题请咨询执业律师。
