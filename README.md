# 续章 · Novel Continuation Agent

本地优先的小说续写工作台：检索公开资料或导入授权文本，整理人物与世界观约束，先生成提纲，经用户修改确认后再生成正文。

> 请只处理你拥有版权或授权的文本。联网模式不下载小说全文，只使用公开搜索摘要，并要求正文采用原创表达。

## 当前能力

- 按作品名自动检索公开简介、人物和剧情摘要
- 内置《我在精神病院学斩神》公开资料演示预设
- 导入 TXT / Markdown 授权文本并分析章节、人物、节奏
- 强制先填写目标字数并生成提纲
- 用户提交提纲修改建议后才生成正文
- 支持 OpenAI-compatible Chat Completions 与 Brave Search
- 无 API Key 时可体验完整本地演示流程

## 快速开始

```bash
npm install
cp .env.example .env
npm run dev
```

打开 http://localhost:5173。实时搜索和模型写作配置：

```dotenv
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=your-key
LLM_MODEL=gpt-4.1-mini
BRAVE_SEARCH_API_KEY=your-key
```

未配置 `BRAVE_SEARCH_API_KEY` 时，目标作品仍可使用内置演示资料。未配置模型时，正文仅用于流程演示。

## 命令

```bash
npm run dev
npm run test
npm run build
npm start
```

## License

MIT
