export interface Chapter { id: string; title: string; content: string; summary: string; wordCount: number; }
export interface StyleProfile { pov: string; tone: string[]; averageSentenceLength: number; dialogueRatio: number; rhythm: string; chapterPattern: string; signatureHabits: string[]; }
export interface Character { name: string; appearances: number; note: string; }
export interface StoryBible { premise: string; characters: Character[]; openThreads: string[]; continuityRules: string[]; latestState: string; }
export interface AnalysisResult { chapters: Chapter[]; profile: StyleProfile; bible: StoryBible; }
export interface ContinuationPlan { title: string; objective: string; beats: string[]; hook: string; constraints: string[]; }
export interface ContinueResult { plan: ContinuationPlan; prose: string; review: string[]; mode: "local" | "model"; }
export interface ResearchSource { title: string; url: string; snippet: string; sourceType: "official" | "reference" | "search"; }
export interface ResearchResult { query: string; sources: ResearchSource[]; facts: string[]; narrativeTraits: string[]; safetyNote: string; mode: "search" | "demo"; }
export interface OutlineResult { title: string; objective: string; beats: string[]; characterChecks: string[]; continuityChecks: string[]; endingHook: string; targetLength: number; mode: "local" | "model"; }
