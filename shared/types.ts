export interface Chapter {
  id: string;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
}

export interface StyleProfile {
  pov: string;
  tone: string[];
  averageSentenceLength: number;
  dialogueRatio: number;
  rhythm: string;
  chapterPattern: string;
  signatureHabits: string[];
}

export interface Character {
  name: string;
  appearances: number;
  note: string;
}

export interface StoryBible {
  premise: string;
  characters: Character[];
  openThreads: string[];
  continuityRules: string[];
  latestState: string;
}

export interface AnalysisResult {
  chapters: Chapter[];
  profile: StyleProfile;
  bible: StoryBible;
}

export interface ContinuationPlan {
  title: string;
  objective: string;
  beats: string[];
  hook: string;
  constraints: string[];
}

export interface ContinueResult {
  plan: ContinuationPlan;
  prose: string;
  review: string[];
  mode: "local" | "model";
}
