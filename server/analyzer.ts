import type { AnalysisResult, Chapter, Character, StyleProfile, StoryBible } from "../shared/types.js";

const chapterPattern = /(?:^|\n)\s*((?:第[零一二三四五六七八九十百千万0-9]+[章节卷回]|Chapter\s+\d+)[^\n]*)\s*\n/gi;

export function splitChapters(text: string): Chapter[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  const matches = [...normalized.matchAll(chapterPattern)];
  if (!matches.length) return [makeChapter("正文", normalized, 0)];
  const chapters: Chapter[] = [];
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? normalized.length;
    chapters.push(makeChapter(match[1].trim(), normalized.slice(start, end).trim(), index));
  });
  return chapters.filter((chapter) => chapter.content.length > 0);
}

function makeChapter(title: string, content: string, index: number): Chapter {
  const clean = content.trim();
  const firstSentence = clean.split(/[。！？\n]/).find(Boolean)?.trim() ?? "";
  return { id: `chapter-${index + 1}`, title, content: clean, summary: firstSentence.slice(0, 80) || "暂无摘要", wordCount: clean.replace(/\s/g, "").length };
}

function extractCharacters(text: string): Character[] {
  const counts = new Map<string, number>();
  const matches = text.matchAll(/(?:^|[。！？；：\n，“”])([\u4e00-\u9fa5]{2,3})(?=说道|问道|答道|笑道|回答|说|问|答|笑|看着|望向|走进|想到|听见|点头|摇头)/g);
  const stop = new Set(["于是", "只是", "可是", "他们", "自己", "对方", "有人", "没有", "男人", "女人", "这时", "此时"]);
  for (const match of matches) {
    const name = match[1];
    if (!stop.has(name)) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, appearances]) => ({ name, appearances, note: "待在续写中进一步确认人物目标与说话习惯" }));
}

export function analyzeLocally(text: string): AnalysisResult {
  const chapters = splitChapters(text);
  const compact = text.replace(/\s/g, "");
  const sentences = text.split(/[。！？!?]/).map((item) => item.trim()).filter(Boolean);
  const dialogueChars = [...text.matchAll(/[“「](.*?)[”」]/gs)].reduce((sum, match) => sum + match[1].length, 0);
  const avg = sentences.length ? Math.round(compact.length / sentences.length) : 0;
  const ratio = compact.length ? Number((dialogueChars / compact.length).toFixed(2)) : 0;
  const latest = chapters.at(-1);
  const profile: StyleProfile = {
    pov: /我[想说看听走]/.test(text.slice(0, 3000)) ? "第一人称倾向" : "第三人称倾向",
    tone: avg > 32 ? ["舒缓", "细节充足"] : ["紧凑", "动作驱动"],
    averageSentenceLength: avg,
    dialogueRatio: ratio,
    rhythm: ratio > 0.3 ? "对白推动明显，场景切换较快" : "叙述与描写承担主要推进",
    chapterPattern: "承接前情，逐步升级冲突，以未完成动作或新信息收束",
    signatureHabits: [`平均句长约 ${avg} 字`, `对白占比约 ${Math.round(ratio * 100)}%`, chapters.length > 3 ? "具有稳定的分章结构" : "当前样本较短，画像仍需校准"],
  };
  const bible: StoryBible = {
    premise: chapters[0]?.summary ?? "等待导入正文",
    characters: extractCharacters(text),
    openThreads: latest ? [`承接「${latest.title}」结尾尚未完成的行动与冲突`] : [],
    continuityRules: ["保持既有叙事视角", "不得改变已发生事件", "人物能力与信息边界必须延续前文"],
    latestState: latest ? `${latest.title}：${latest.summary}` : "暂无",
  };
  return { chapters, profile, bible };
}
