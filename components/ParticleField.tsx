"use client";

import { useEffect, useRef } from "react";

export type MotionStyle = "web" | "spotlight" | "orbit";

/** Decorative, bounded canvas. It sleeps offscreen and never captures input. */
export default function ParticleField({ mode = "orbit", paused = false, subtle = false }: { mode?: MotionStyle; paused?: boolean; subtle?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const elapsed = useRef(0);
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const isPaused = () => paused || document.documentElement.dataset.motion === "paused";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 767px)");
    const fine = matchMedia("(pointer: fine)");
    let width = 0, height = 0, raf = 0, time = elapsed.current, last = 0, visible = true;
    let color = "0,102,204";
    const pointer = { x: -1000, y: -1000 };
    const count = subtle ? 140 : 230;
    const particles = Array.from({length: count}, (_, i) => {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = i * Math.PI * (3 - Math.sqrt(5));
      return {x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, phase: i * 2.399};
    });
    let symbol: {x: number; y: number}[] = [];
    function colours() {
      const hex = getComputedStyle(document.documentElement).getPropertyValue("--cb").trim().replace("#", "");
      const n = parseInt(hex,16);
      color = `${(n>>16)&255},${(n>>8)&255},${n&255}`;
    }
    function resize() {
      width = host!.clientWidth; height = host!.clientHeight;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas!.width = Math.round(width * ratio); canvas!.height = Math.round(height * ratio);
      ctx!.setTransform(ratio,0,0,ratio,0,0);
      const mask = document.createElement("canvas"); mask.width=280; mask.height=150;
      const m = mask.getContext("2d"); symbol=[];
      if(m){m.font="700 100px system-ui";m.textAlign="center";m.textBaseline="middle";m.fillText("SW",140,75);const pixels=m.getImageData(0,0,280,150).data;for(let y=20;y<135;y+=5)for(let x=15;x<265;x+=5)if(pixels[(y*280+x)*4+3]>100)symbol.push({x:(x-140)/110,y:(y-75)/110});}
      draw();
    }
    const smooth=(v:number)=>{const x=Math.min(1,Math.max(0,v));return x*x*(3-2*x);};
    function draw() {
      ctx!.clearRect(0,0,width,height);
      const scale=subtle?Math.min(width*.11,height*.27):Math.min(width*.28,height*.34);
      // In the hero the motif stays at the edges; the reading column stays calm.
      const centres=subtle ? [width*.13,width*.87] : [width*.68];
      for(const cx of centres){
        const cy=subtle?height*.37:height*.42;
        const cycle=time%18;
        const gather=reduce.matches?1:smooth((cycle-5)/3)*(1-smooth((cycle-12)/3));
        const points=particles.map((p,i)=>{
          const spin=time*.12;
          const x=p.x*Math.cos(spin)+p.z*Math.sin(spin);
          const z=-p.x*Math.sin(spin)+p.z*Math.cos(spin);
          const target=symbol[(i*7)%Math.max(1,symbol.length)]??{x:0,y:0};
          let px=cx+(x*(1-gather)+target.x*gather)*scale;
          let py=cy+(p.y*(1-gather)+target.y*gather)*scale;
          if(mode!=="orbit"){
            px=(.5+Math.sin(p.phase*13.3)*.49)*width;
            py=(.5+Math.cos(p.phase*7.1)*.49)*height;
            if(!isPaused()&&!reduce.matches){px+=Math.sin(time*.22+p.phase)*8;py+=Math.cos(time*.2+p.phase)*8;}
          }
          const d=Math.hypot(px-pointer.x,py-pointer.y);
          if(!reduce.matches&&fine.matches&&d<100&&d>1){const push=(1-d/100)*12;px+=(px-pointer.x)/d*push;py+=(py-pointer.y)/d*push;}
          return {x:px,y:py,depth:(z+1)/2,d};
        });
        if(mode==="spotlight"){
          if(pointer.x>0){const g=ctx!.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,180);g.addColorStop(0,`rgba(${color},.08)`);g.addColorStop(1,`rgba(${color},0)`);ctx!.fillStyle=g;ctx!.fillRect(0,0,width,height);}
        }
        if(mode==="web")for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
          const a=points[i],b=points[j],d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d<75){const lit=Math.max(0,1-Math.min(a.d,b.d)/170);ctx!.strokeStyle=`rgba(${color},${(1-d/75)*(.035+lit*.3)})`;ctx!.lineWidth=.7;ctx!.beginPath();ctx!.moveTo(a.x,a.y);ctx!.lineTo(b.x,b.y);ctx!.stroke();}
        }
        for(const p of points){const alpha=mode==="orbit"?(subtle?.12:.36)+p.depth*(subtle?.1:.26):.07+Math.max(0,1-p.d/180)*.45;ctx!.fillStyle=`rgba(${color},${alpha})`;ctx!.beginPath();ctx!.arc(p.x,p.y,mode==="orbit"?1+p.depth:1.25,0,Math.PI*2);ctx!.fill();}
      }
    }
    function frame(now:number){raf=0;if(!visible||document.hidden||isPaused()||reduce.matches||(subtle&&compact.matches))return;if(!last)last=now;const dt=Math.min((now-last)/1000,.06);if(now-last>=30){time+=dt;elapsed.current=time;last=now;draw();}raf=requestAnimationFrame(frame);}
    function start(){if(!raf&&visible&&!document.hidden&&!isPaused()&&!reduce.matches&&!(subtle&&compact.matches)){last=0;raf=requestAnimationFrame(frame);}}
    function stop(){cancelAnimationFrame(raf);raf=0;}
    function preference(){stop();draw();start();}
    function move(event:PointerEvent){if(!fine.matches||reduce.matches)return;const r=host!.getBoundingClientRect();pointer.x=event.clientX-r.left;pointer.y=event.clientY-r.top;if(isPaused())draw();}
    function leave(){pointer.x=-1000;pointer.y=-1000;if(isPaused())draw();}
    const observer=new ResizeObserver(resize);
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();});
    const theme=new MutationObserver(()=>{colours();preference();});
    colours();resize();observer.observe(host);intersection.observe(host);theme.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","data-motion"]});
    compact.addEventListener("change",preference);reduce.addEventListener("change",preference);document.addEventListener("visibilitychange",preference);host.addEventListener("pointermove",move,{passive:true});host.addEventListener("pointerleave",leave);start();
    return()=>{stop();observer.disconnect();intersection.disconnect();theme.disconnect();compact.removeEventListener("change",preference);reduce.removeEventListener("change",preference);document.removeEventListener("visibilitychange",preference);host.removeEventListener("pointermove",move);host.removeEventListener("pointerleave",leave);};
  }, [mode,paused,subtle]);
  return <canvas ref={ref} aria-hidden="true" className={subtle?"hero-particles":"particle-canvas"} />;
}
