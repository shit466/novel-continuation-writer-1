import { describe, expect, it } from "vitest";
import { analyzeLocally, splitChapters } from "./analyzer.js";

const novel = `第一章 初见

沈砚走进雨里。“等等。”陆青说道。沈砚没有回头，他知道这件事还没有结束。

第二章 来信

陆青看着桌上的信，沈砚问：“是谁送来的？”窗外没有人回答。`;

describe("splitChapters", () => {
  it("splits Chinese chapter headings", () => {
    const chapters = splitChapters(novel);
    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toBe("第一章 初见");
    expect(chapters[1].content).toContain("桌上的信");
  });
  it("keeps unstructured text as one chapter", () => {
    expect(splitChapters("这是一段没有标题的长文本。").map((item) => item.title)).toEqual(["正文"]);
  });
});

describe("analyzeLocally", () => {
  it("creates a usable story profile", () => {
    const result = analyzeLocally(novel);
    expect(result.profile.averageSentenceLength).toBeGreaterThan(0);
    expect(result.bible.continuityRules.length).toBeGreaterThan(0);
    expect(result.chapters.at(-1)?.title).toBe("第二章 来信");
    expect(result.bible.characters.map((item) => item.name)).toContain("沈砚");
  });
});
