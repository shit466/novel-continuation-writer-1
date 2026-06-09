# 续章 · Novel Continuation Agent

一个本地优先的小说续写工作台。它会先从原文中蒸馏作品画像、人物与连续性规则，再规划并生成下一章。

> 请只处理你拥有版权或已获授权的文本。对于受版权保护的他人作品，建议用于结构分析与创作辅助，而非高度复刻作者独特表达。

## 当前能力

- 导入 TXT / Markdown 小说或直接粘贴正文
- 自动识别章节，统计句长、对白比例与叙事节奏
- 提取人物候选、当前故事状态与连续性约束
- 先规划后续写，支持控制章节意图和目标长度
- 无 API Key 时提供本地演示模式
- 支持任意 OpenAI-compatible Chat Completions 接口
- 导出生成稿为 TXT

## 快速开始

```bash
npm install
cp .env.example .env
npm run dev
```

打开 [http://localhost:5173](http://localhost:5173)。

不配置模型也可以体验完整界面和本地分析流程。要启用模型续写，请设置：

```dotenv
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=your-key
LLM_MODEL=gpt-4.1-mini
```

## 项目结构

```text
src/              React 工作台
server/
  analyzer.ts     本地章节切分与作品蒸馏
  model.ts        模型续写与本地回退
  index.ts        Express API
shared/types.ts   前后端共享类型
```

## 命令

```bash
npm run dev       # 同时启动前端与 API
npm run test      # 运行测试
npm run build     # 类型检查并构建前端
npm start         # 启动 API，并在已构建时托管前端
```

## 下一阶段路线

- [ ] 将人物、地点、事件、伏笔保存为持久化作品圣经
- [ ] 使用向量检索召回长篇小说中的相关场景
- [ ] 增加章节计划编辑与局部重写
- [ ] 增加时间线、人设和世界观矛盾检查
- [ ] 支持 EPUB / DOCX 与多作品管理

## License

MIT
