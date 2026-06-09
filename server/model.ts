import type { AnalysisResult, ContinueResult, ContinuationPlan } from "../shared/types.js";

const endpoint = process.env.LLM_BASE_URL?.replace(/\/$/, "");
const apiKey = process.env.LLM_API_KEY;
const model = process.env.LLM_MODEL ?? "gpt-4.1-mini";

async function chat(system: string, user: string): Promise<string | null> {
  if (!endpoint || !apiKey) return null;
  const response = await fetch(`${endpoint}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, temperature: 0.75, messages: [{ role: "system", content: system }, { role: "user", content: user }] }) });
  if (!response.ok) throw new Error(`模型请求失败：${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? null;
}

function localContinuation(analysis: AnalysisResult, instruction: string, length: number): ContinueResult {
  const last = analysis.chapters.at(-1);
  const lead = analysis.bible.characters[0]?.name ?? "主角";
  const title = `第${analysis.chapters.length + 1}章 未落定的回声`;
  const plan: ContinuationPlan = { title, objective: instruction || `承接${last?.title ?? "前文"}，让当前矛盾向前推进`, beats: ["由上一章遗留的细节重新进入场景", "人物作出带来代价的选择", "揭示一条新线索但保留核心答案"], hook: "一个此前被忽略的细节改变了人物对局势的判断。", constraints: analysis.bible.continuityRules };
  const paragraphs = [`${lead}没有立刻开口。${last?.summary ?? "眼前的一切仍悬而未决"}，那句话像一枚没有落地的棋子，停在所有人的目光之间。`, `窗外的声音近了一些。空气里原本被忽略的细节忽然变得清晰，逼着${lead}重新衡量刚才的判断。事情并没有结束，只是换了一种更安静的方式继续。`, `“先别动。”${lead}说。声音不高，却让场面短暂地停了下来。这个选择会带来什么，没有人知道；但继续等待，显然已经不是答案。`, `他沿着那条新出现的线索向前走去。就在伸手触及真相之前，背后传来一个本不该在此刻出现的声音。`];
  let prose = paragraphs.join("\n\n");
  while (prose.length < Math.min(length, 2400)) prose += `\n\n${paragraphs[(prose.length / 100) % paragraphs.length | 0]}`;
  return { plan, prose: `# ${title}\n\n${prose}`, review: ["本地模式已保持叙事视角", "建议接入模型以获得更准确的人物语言和情节推进"], mode: "local" };
}

export async function createContinuation(analysis: AnalysisResult, instruction: string, length: number): Promise<ContinueResult> {
  const recent = analysis.chapters.slice(-3).map((chapter) => `${chapter.title}\n${chapter.content}`).join("\n\n");
  const prompt = `作品画像：${JSON.stringify(analysis.profile)}\n作品圣经：${JSON.stringify(analysis.bible)}\n最近章节：${recent.slice(-14000)}\n用户意图：${instruction || "自然承接前文"}\n目标字数：约${length}字\n\n请输出下一章。先用 <plan>...</plan> 写简短章节计划，再用 <prose>...</prose> 写正文，最后用 <review>...</review> 列出一致性检查。避免照抄原文，保持人物逻辑、节奏和叙事视角。`;
  const output = await chat("你是一名小说续写编辑，擅长提炼叙事规律并保持长篇小说的一致性。", prompt);
  if (!output) return localContinuation(analysis, instruction, length);
  const get = (tag: string) => output.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1].trim() ?? "";
  return { plan: { title: `第${analysis.chapters.length + 1}章`, objective: instruction || "自然承接前文", beats: get("plan").split("\n").filter(Boolean), hook: "由正文结尾生成", constraints: analysis.bible.continuityRules }, prose: get("prose") || output, review: get("review").split("\n").filter(Boolean), mode: "model" };
}
