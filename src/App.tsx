import { useState } from "react";
import { BookOpenText, Download, Feather, FileText, LoaderCircle, PenLine, Search, Sparkles, Upload, Users, WandSparkles } from "lucide-react";
import type { AnalysisResult, ContinueResult } from "../shared/types";

type Step = "source" | "bible" | "studio";
const sample = `第一章 雨夜来客\n\n临川城下了一整夜的雨。沈砚推开旧书铺的门时，檐下铜铃没有响。\n\n“你来迟了。”柜台后的老人说道。\n\n第二章 没有名字的信\n\n老人把信推到灯下，信封上没有名字。就在指尖碰到火漆的那一刻，门外那枚本该沉默的铜铃，忽然响了。`;

async function api<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "请求失败");
  return data;
}

export function App() {
  const [step, setStep] = useState<Step>("source");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("未命名作品");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [result, setResult] = useState<ContinueResult | null>(null);
  const [instruction, setInstruction] = useState("");
  const [length, setLength] = useState(1200);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setBusy(true); setError("");
    try { setAnalysis(await api("/api/analyze", { text })); setStep("bible"); }
    catch (e) { setError(e instanceof Error ? e.message : "分析失败"); }
    finally { setBusy(false); }
  }
  async function generate() {
    if (!analysis) return;
    setBusy(true); setError("");
    try { setResult(await api("/api/continue", { analysis, instruction, length })); }
    catch (e) { setError(e instanceof Error ? e.message : "生成失败"); }
    finally { setBusy(false); }
  }
  function download() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([result.prose], { type: "text/plain;charset=utf-8" }));
    a.download = `${title}-续写.txt`; a.click();
  }

  return <div className="shell">
    <aside><div className="brand"><Feather /> <b>续章</b><span>Storycraft</span></div><nav>
      <button className={step === "source" ? "active" : ""} onClick={() => setStep("source")}><BookOpenText />原文导入</button>
      <button className={step === "bible" ? "active" : ""} disabled={!analysis} onClick={() => setStep("bible")}><Search />作品蒸馏</button>
      <button className={step === "studio" ? "active" : ""} disabled={!analysis} onClick={() => setStep("studio")}><PenLine />续写工作台</button>
    </nav></aside>
    <main><header><span>当前作品</span><input value={title} onChange={e => setTitle(e.target.value)} /><em>● 自动保存</em></header>
      {step === "source" && <Page kicker="01 · SOURCE" title="先读懂，再动笔" desc="导入原文，建立属于这部作品的叙事档案。">
        <div className="source-grid"><section className="editor"><div className="panel-head">原文内容 <span>{text.replace(/\s/g, "").length} 字</span></div><textarea value={text} onChange={e => setText(e.target.value)} placeholder="粘贴小说正文，或导入 TXT / Markdown 文件…" /></section>
        <section className="import"><label><Upload /><b>导入小说文件</b><small>支持 .txt 与 .md</small><input type="file" accept=".txt,.md" onChange={async e => { const f = e.target.files?.[0]; if (f) { setText(await f.text()); setTitle(f.name.replace(/\.[^.]+$/, "")); } }} /><span><FileText />选择文件</span></label><button className="link" onClick={() => { setText(sample); setTitle("临川夜雨"); }}>使用示例文本</button><p><Sparkles /> 蒸馏章节结构、人物、节奏、未回收线索与连续性规则。</p></section></div>
        <Action busy={busy} disabled={text.length < 100} onClick={analyze} label="开始蒸馏" />
      </Page>}
      {step === "bible" && analysis && <Page kicker="02 · DISTILL" title="作品已经有了自己的指纹" desc="这些信息会成为续写时不可越过的边界。">
        <div className="metrics"><Metric label="章节" value={`${analysis.chapters.length}`} detail={`${analysis.chapters.reduce((n,c)=>n+c.wordCount,0)} 字`} /><Metric label="叙事视角" value={analysis.profile.pov} detail={analysis.profile.rhythm} /><Metric label="平均句长" value={`${analysis.profile.averageSentenceLength} 字`} detail={`对白占比 ${Math.round(analysis.profile.dialogueRatio*100)}%`} /></div>
        <div className="cards"><Card icon={<Feather />} title="风格画像"><div className="tags">{[...analysis.profile.tone,...analysis.profile.signatureHabits].map(x=><span key={x}>{x}</span>)}</div><p>{analysis.profile.chapterPattern}</p></Card><Card icon={<Users />} title="主要人物">{analysis.bible.characters.map(x=><p key={x.name}><b>{x.name}</b> · 出现 {x.appearances} 次</p>)}</Card><Card icon={<Search />} title="连续性约束">{analysis.bible.continuityRules.map(x=><p key={x}>✓ {x}</p>)}</Card><Card icon={<BookOpenText />} title="当前状态"><p>{analysis.bible.latestState}</p><p>{analysis.bible.openThreads[0]}</p></Card></div>
        <Action onClick={() => setStep("studio")} label="去续写" />
      </Page>}
      {step === "studio" && analysis && <Page kicker="03 · CONTINUE" title="下一章，从意图开始" desc="告诉编辑这一章要解决什么，再生成计划与正文。">
        <div className="studio"><section className="brief"><label>本章意图</label><textarea value={instruction} onChange={e=>setInstruction(e.target.value)} placeholder="例如：让主角发现一条新线索，但暂时不要揭示真相。" /><label>目标长度 <b>{length} 字</b></label><input type="range" min="600" max="4000" step="200" value={length} onChange={e=>setLength(+e.target.value)} /><Action busy={busy} onClick={generate} label="生成下一章" />{result && <button className="secondary" onClick={download}><Download />导出 TXT</button>}</section>
        <section className="output">{!result ? <div className="empty"><PenLine /><b>正文会出现在这里</b><p>生成前会参考最近章节、作品圣经与风格画像。</p></div> : <><div className="panel-head">生成稿 <span>{result.mode === "model" ? "模型模式" : "本地演示模式"}</span></div><div className="plan"><b>{result.plan.title}</b><small>{result.plan.objective}</small></div><article>{result.prose}</article><div className="review"><b>一致性检查</b>{result.review.map(x=><span key={x}>✓ {x}</span>)}</div></>}</section></div>
      </Page>}
      {error && <div className="error">{error}</div>}
    </main>
  </div>;
}

function Page({kicker,title,desc,children}:{kicker:string;title:string;desc:string;children:React.ReactNode}) { return <div className="page"><div className="title"><span>{kicker}</span><h1>{title}</h1><p>{desc}</p></div>{children}</div>; }
function Action({busy=false,disabled=false,onClick,label}:{busy?:boolean;disabled?:boolean;onClick:()=>void;label:string}) { return <div className="actions"><button className="primary" disabled={busy||disabled} onClick={onClick}>{busy?<LoaderCircle className="spin"/>:<WandSparkles/>}{busy?"正在处理…":label}</button></div>; }
function Metric({label,value,detail}:{label:string;value:string;detail:string}) { return <div className="metric"><span>{label}</span><b>{value}</b><small>{detail}</small></div>; }
function Card({icon,title,children}:{icon:React.ReactNode;title:string;children:React.ReactNode}) { return <section className="card"><h2>{icon}{title}</h2>{children}</section>; }
