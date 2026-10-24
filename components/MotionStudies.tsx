"use client";
import { useState } from "react";
import ParticleField, { type MotionStyle } from "@/components/ParticleField";
const studies: {id:MotionStyle;title:string;description:string}[] = [
  {id:"web",title:"01 — Pointer web",description:"A fine network reveals itself around your pointer. Closest to the original site, with quieter lines."},
  {id:"spotlight",title:"02 — Soft spotlight",description:"A gentle pool of light moves across scattered points. The most understated option."},
  {id:"orbit",title:"03 — Gather & scatter",description:"A slow rotating field gathers into SW, holds briefly, then dissolves. An original motif using your initials."},
];
export default function MotionStudies(){
 const [mode,setMode]=useState<MotionStyle>("orbit");const [paused,setPaused]=useState(false);
 const active=studies.find(s=>s.id===mode)!;
 return <><div className="motion-controls" role="group" aria-label="Animation style">{studies.map(s=><button key={s.id} type="button" aria-pressed={s.id===mode} onClick={()=>setMode(s.id)}>{s.title}</button>)}<button type="button" onClick={()=>setPaused(v=>!v)}>{paused?"Play animation":"Pause animation"}</button></div>
 <div className="motion-stage"><ParticleField mode={mode} paused={paused}/><div className="motion-stage-copy"><h2>{active.title}</h2><p>{active.description}</p></div></div>
 <p className="prose-body mt-6" role="status">Move your pointer inside the preview. Switch themes in the header to compare. Reduced Motion keeps the scene static.</p>
 <div className="motion-notes">{studies.map(s=><article key={s.id}><h2>{s.title}</h2><p>{s.description}</p></article>)}</div>
 <p className="prose-body mt-8">These are demos for selection. The homepage uses a faint particle study in the margins; we can keep, replace, or remove it after you compare the options.</p></>;
}
