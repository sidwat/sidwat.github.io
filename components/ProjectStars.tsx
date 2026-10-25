"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/content";
import { clearContent, textClearances } from "@/lib/ambient-space";

type Star = { x:number; y:number; homeX:number; homeY:number; vx:number; vy:number; phase:number; size:number; tone:number; target:number };
const smooth = (v:number) => { const x=Math.max(0,Math.min(1,v)); return x*x*(3-2*x); };

/** A viewport-wide, damped particle simulation. The banner is only its word anchor. */
export default function ProjectStars({label, name = false, accent = "ice"}:{label:string; name?:boolean; accent?:Project["accent"]}) {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;
    const anchor=canvas?.parentElement;
    const ctx=canvas?.getContext("2d");
    if(!canvas||!anchor||!ctx) return;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    const fine=matchMedia("(pointer: fine)");
    const paused=()=>document.documentElement.dataset.motion==="paused";
    let width=0,height=0,raf=0,last=0,time=0,dark=false;
    let stars:Star[]=[];
    let targets:{x:number;y:number}[]=[];
    let boxes=textClearances(name ? "#hero-title" : "");
    let center={x:0,y:0}, wordWidth=0;
    const mouse={x:-9999,y:-9999,vx:0,vy:0};
    function geometry(){
      boxes=textClearances(name ? "#hero-title" : "");
      const r=anchor!.getBoundingClientRect();
      center={x:r.left+r.width/2,y:r.top+r.height/2};
      wordWidth=Math.min(r.width-32,900);
    }
    function makeWord(){
      const mask=document.createElement("canvas"); mask.width=1000;mask.height=200;
      const m=mask.getContext("2d")!;
      m.font="600 150px system-ui";
      const size=Math.min(150,900/m.measureText(label).width*150);
      m.font=`600 ${size}px system-ui`; m.textAlign="center";m.textBaseline="middle";
      m.fillText(label,500,100);
      const data=m.getImageData(0,0,1000,200).data;
      targets=[];
      for(let y=10;y<190;y+=3)for(let x=20;x<980;x+=3){
        if(data[(y*1000+x)*4+3]>140)targets.push({x:(x-500)/1000,y:(y-100)/1000});
      }
    }
    function resize(){
      width=innerWidth;height=innerHeight;
      const dpr=Math.min(devicePixelRatio||1,1.5);
      canvas!.width=Math.round(width*dpr);canvas!.height=Math.round(height*dpr);
      ctx!.setTransform(dpr,0,0,dpr,0,0);
      geometry();
      const count=name ? (width<600?1100:2200) : (width<600?480:850);
      stars=Array.from({length:count},(_,i)=>({x:Math.random()*width,y:Math.random()*height,homeX:Math.random()*width,homeY:Math.random()*height,vx:(Math.random()-.5)*12,vy:(Math.random()-.5)*12,phase:Math.random()*Math.PI*2,size:Math.random()<(name?.005:.025)?1.6:(name?.55:.35)+Math.random()*.65,tone:Math.random(),target:Math.floor(i/count*targets.length)}));
      draw(0);
    }
    function draw(dt:number){
      ctx!.clearRect(0,0,width,height);
      // Drift 0–4s; gather over 8s; hold 7s; release over 5s. No reset or teleport.
      const cycle=time%30;
      const gather=reduced.matches?1:name?smooth((time-.5)/5):smooth((cycle-4)/8)*(1-smooth((cycle-19)/5));
      const accents={ice:dark?"163,194,232":"56,85,125",teal:dark?"141,214,202":"35,112,105",violet:dark?"192,171,232":"103,76,149",amber:dark?"229,199,149":"135,99,44",rose:dark?"229,169,181":"144,70,89",silver:dark?"203,217,233":"83,101,122"};
      for(let i=0;i<stars.length;i++){
        const s=stars[i],t=targets[s.target]||{x:0,y:0};
        // A small distant population remains in space when the foreground forms the word.
        const joins=i%7!==0;
        const g=joins?gather:0;
        const tx=center.x+t.x*wordWidth,ty=center.y+t.y*wordWidth;
        if(reduced.matches){ if(joins){s.x=tx;s.y=ty;} }
        else if(dt>0){
          const dx=s.x-mouse.x,dy=s.y-mouse.y;
          const distance=Math.hypot(dx,dy);
          let ax=(Math.sin(time*.23+s.phase)*2.4+(s.homeX-s.x)*.18)*(1-g)+(tx-s.x)*g*(name?7:1.8);
          let ay=(Math.cos(time*.19+s.phase*1.7)*2.4+(s.homeY-s.y)*.18)*(1-g)+(ty-s.y)*g*(name?7:1.8);
          // Soft repulsion plus a small tangential wake, always active, including the word.
          if(distance<150&&distance>.1){
            const force=(1-distance/150)**2;
            ax+=(dx/distance*520-dy/distance*80+mouse.vx*.3)*force;
            ay+=(dy/distance*520+dx/distance*80+mouse.vy*.3)*force;
          }
          const drag=Math.exp(-(0.22+g*(name?5.1:2.8))*dt);
          s.vx=(s.vx+ax*dt)*drag;s.vy=(s.vy+ay*dt)*drag;
          const speed=Math.hypot(s.vx,s.vy);if(speed>180){s.vx*=180/speed;s.vy*=180/speed;}
          s.x+=s.vx*dt;s.y+=s.vy*dt;
          // Soft boundary forces keep drifting stars in the viewport without wrapping jumps.
          if(s.x<8)s.vx+=18*dt;if(s.x>width-8)s.vx-=18*dt;
          if(s.y<8)s.vy+=18*dt;if(s.y>height-8)s.vy-=18*dt;
        }
        const twinkle=.82+.18*Math.sin(time*.7+s.phase);
        const alpha=(joins?.25+g*.58:.18)*twinkle;

        const rgb=s.tone>.55?accents[accent]:dark?(s.tone<.12?"218,203,180":"222,231,242"):(s.tone<.12?"122,100,73":"56,85,125");
        // Rare bright stars have a soft halo and fine diffraction rays; most remain pinpoints.
        if(s.size>1.5){
          const halo=ctx!.createRadialGradient(s.x,s.y,0,s.x,s.y,7);
          halo.addColorStop(0,`rgba(${rgb},${alpha*.35})`);halo.addColorStop(1,`rgba(${rgb},0)`);
          ctx!.fillStyle=halo;ctx!.fillRect(s.x-7,s.y-7,14,14);
          ctx!.strokeStyle=`rgba(${rgb},${alpha*.25})`;ctx!.lineWidth=.5;
          ctx!.beginPath();ctx!.moveTo(s.x-4,s.y);ctx!.lineTo(s.x+4,s.y);ctx!.moveTo(s.x,s.y-4);ctx!.lineTo(s.x,s.y+4);ctx!.stroke();
        }
        ctx!.fillStyle=`rgba(${rgb},${alpha})`;ctx!.beginPath();ctx!.arc(s.x,s.y,s.size*(.9+g*.15),0,Math.PI*2);ctx!.fill();
      }
      clearContent(ctx!,boxes);
    }
    function frame(now:number){
      raf=0;if(document.hidden||paused()||reduced.matches)return;
      if(!last)last=now;
      const dt=Math.min((now-last)/1000,.04);
      if(dt>=1/60){time+=dt;last=now;draw(dt);mouse.vx*=.9;mouse.vy*=.9;}
      raf=requestAnimationFrame(frame);
    }
    function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
    function start(){if(!raf&&!document.hidden&&!paused()&&!reduced.matches)raf=requestAnimationFrame(frame);}
    function preference(){stop();dark=document.documentElement.dataset.theme==="dark";draw(0);start();}
    function move(e:PointerEvent){
      if(!fine.matches||reduced.matches||paused())return;
      mouse.vx=Math.max(-160,Math.min(160,(e.clientX-mouse.x)*5));mouse.vy=Math.max(-160,Math.min(160,(e.clientY-mouse.y)*5));mouse.x=e.clientX;mouse.y=e.clientY;
    }
    function leave(){mouse.x=mouse.y=-9999;mouse.vx=mouse.vy=0;}
    function scroll(){
      const previous=center;
      geometry();
      const dx=center.x-previous.x,dy=center.y-previous.y;
      // Keep positions in the heading's document space, with no spring lag on scroll.
      for(const star of stars){star.x+=dx;star.y+=dy;star.homeX+=dx;star.homeY+=dy;}
      draw(0);
    }
    if(name) anchor.dataset.particleReady="true";
    makeWord();dark=document.documentElement.dataset.theme==="dark";resize();start();
    const observer=new MutationObserver(preference);observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","data-motion"]});
    window.addEventListener("pointermove",move,{passive:true});window.addEventListener("blur",leave);document.addEventListener("pointerleave",leave);
    window.addEventListener("resize",resize);window.addEventListener("scroll",scroll,{passive:true});document.addEventListener("visibilitychange",preference);reduced.addEventListener("change",preference);
    return()=>{if(name)delete anchor.dataset.particleReady;stop();observer.disconnect();window.removeEventListener("pointermove",move);window.removeEventListener("blur",leave);document.removeEventListener("pointerleave",leave);window.removeEventListener("resize",resize);window.removeEventListener("scroll",scroll);document.removeEventListener("visibilitychange",preference);reduced.removeEventListener("change",preference);};
  },[label,name,accent]);
  return <canvas ref={ref} className={name?"name-stars":"project-stars"} data-particle-label={label} data-particle-accent={accent} aria-hidden="true"/>;
}
