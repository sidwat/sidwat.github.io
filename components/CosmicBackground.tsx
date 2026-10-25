"use client";

import { useEffect, useRef } from "react";
import { clearContent, textClearances } from "@/lib/ambient-space";

type Meteor = {x:number;y:number;vx:number;vy:number;age:number;life:number;trail:{x:number;y:number}[]};

type Body = {x:number;y:number;vx:number;vy:number;homeX:number;homeY:number;phase:number;radius:number;tone:number};

/** Persistent ambient sky. Separate from project-name formation. */
export default function CosmicBackground(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas?.getContext("2d");
    if(!canvas||!ctx)return;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    const fine=matchMedia("(pointer: fine)");
    let width=0,height=0,time=0,last=0,raf=0,dark=false;
    let stars:Body[]=[],planets:Body[]=[];
    let boxes=textClearances();
    let meteors:Meteor[]=[],nextMeteor=3+Math.random()*4;
    const pointer={x:-9999,y:-9999,vx:0,vy:0};
    const paused=()=>document.documentElement.dataset.motion==="paused";
    const free=(x:number,y:number,r:number)=>!boxes.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h);
    function body(x:number,y:number,radius:number,tone:number):Body{return{x,y,homeX:x,homeY:y,vx:0,vy:0,phase:Math.random()*Math.PI*2,radius,tone};}
    function openPosition(preferredX:number,preferredY:number,r:number){
      let best={x:preferredX,y:preferredY},score=Infinity;
      for(let y=r+24;y<height-r-12;y+=24)for(let x=r+16;x<width-r-12;x+=24){
        if(!free(x,y,r+12))continue;
        const distance=Math.hypot(x-preferredX,y-preferredY);
        if(distance<score){score=distance;best={x,y};}
      }
      return best;
    }
    function geometry(){
      boxes=textClearances();
      for(const p of planets){
        if(!free(p.homeX,p.homeY,p.radius+12)){
          const next=openPosition(p.homeX,p.homeY,p.radius);
          p.homeX=next.x;p.homeY=next.y;
          if(reduced.matches){p.x=next.x;p.y=next.y;}
        }
      }
    }
    function resize(){
      width=innerWidth;height=innerHeight;
      const dpr=Math.min(devicePixelRatio||1,1.5);
      canvas!.width=Math.round(width*dpr);canvas!.height=Math.round(height*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);
      boxes=textClearances();
      stars=Array.from({length:width<600?240:520},()=>body(Math.random()*width,Math.random()*height,Math.random()<.018?1.45:.3+Math.random()*.65,Math.random()));
      planets=[[.89,.23,19],[.08,.62,12],[.9,.85,15]].slice(0,width<600?2:3).map(([x,y,r],i)=>{
        const point=openPosition(width*x,height*y,r);return body(point.x,point.y,r,i);
      });
      draw(0);
    }
    function integrate(b:Body,dt:number,planet=false){
      let ax=(b.homeX+Math.sin(time*.13+b.phase)*(planet?15:35)-b.x)*(planet?.13:.025);
      let ay=(b.homeY+Math.cos(time*.11+b.phase)*(planet?12:30)-b.y)*(planet?.13:.025);
      const dx=b.x-pointer.x,dy=b.y-pointer.y,d=Math.hypot(dx,dy),reach=planet?190:135;
      if(d<reach&&d>.1){
        const f=(1-d/reach)**2*(planet?100:280);
        ax+=dx/d*f+pointer.vx*(planet?.04:.12)*(1-d/reach);
        ay+=dy/d*f+pointer.vy*(planet?.04:.12)*(1-d/reach);
      }
      if(planet){
        // Avoid writing with the entire sphere, not just its centre.
        for(const box of boxes){
          const nearestX=Math.max(box.x,Math.min(b.x,box.x+box.w));
          const nearestY=Math.max(box.y,Math.min(b.y,box.y+box.h));
          const ex=b.x-nearestX,ey=b.y-nearestY,dist=Math.hypot(ex,ey),margin=b.radius+18;
          if(dist>0&&dist<margin){const f=(1-dist/margin)*95;ax+=ex/dist*f;ay+=ey/dist*f;}
        }
      }
      if(b.x<b.radius+10)ax+=25;if(b.x>width-b.radius-10)ax-=25;
      if(b.y<b.radius+10)ay+=25;if(b.y>height-b.radius-10)ay-=25;
      const drag=Math.exp(-(planet?1.35:.65)*dt);
      b.vx=(b.vx+ax*dt)*drag;b.vy=(b.vy+ay*dt)*drag;
      b.x+=b.vx*dt;b.y+=b.vy*dt;
    }
    function draw(dt:number){
      ctx!.clearRect(0,0,width,height);
      ctx!.lineCap="butt";
      for(const s of stars){
        if(dt)integrate(s,dt);
        const rgb=dark?(s.tone<.12?"226,207,180":s.tone>.85?"162,195,232":"223,232,244"):"64,88,124";
        const alpha=(s.radius>1?.48:.19+s.tone*.2)*(.85+.15*Math.sin(time*.65+s.phase));
        if(s.radius>1){
          const glow=ctx!.createRadialGradient(s.x,s.y,0,s.x,s.y,6);glow.addColorStop(0,`rgba(${rgb},${alpha*.32})`);glow.addColorStop(1,`rgba(${rgb},0)`);
          ctx!.fillStyle=glow;ctx!.fillRect(s.x-6,s.y-6,12,12);
        }
        ctx!.fillStyle=`rgba(${rgb},${alpha})`;ctx!.beginPath();ctx!.arc(s.x,s.y,s.radius,0,Math.PI*2);ctx!.fill();
      }
      if(dt>0){
        nextMeteor-=dt;
        if(nextMeteor<=0){
          nextMeteor=7+Math.random()*9;
          const x=width*(.08+Math.random()*.7),y=height*(.05+Math.random()*.22);
          if(free(x,y,12))meteors.push({x,y,vx:110+Math.random()*100,vy:35+Math.random()*55,age:0,life:2.5+Math.random()*1.5,trail:[]});
        }
        for(const m of meteors){
          m.age+=dt;
          const dx=m.x-pointer.x,dy=m.y-pointer.y,d=Math.hypot(dx,dy);
          if(d>0.1&&d<180){const force=(1-d/180)**2*320;m.vx+=dx/d*force*dt;m.vy+=dy/d*force*dt;}
          m.vy+=12*dt; // Slight gravity curves the descent; pointer forces bend the same trajectory.
          m.x+=m.vx*dt;m.y+=m.vy*dt;
          m.trail.push({x:m.x,y:m.y});if(m.trail.length>19)m.trail.shift();
        }
        meteors=meteors.filter(m=>m.age<m.life&&m.x<width+100&&m.y<height+100);
      }
      for(const m of meteors){
        const fade=Math.min(1,m.age/.25)*Math.min(1,(m.life-m.age)/.6);
        const rgb=dark?"208,226,250":"76,107,150";
        ctx!.lineCap="round";
        for(let i=1;i<m.trail.length;i++){
          ctx!.strokeStyle=`rgba(${rgb},${fade*(i/m.trail.length)**2*.5})`;ctx!.lineWidth=.3+i/m.trail.length;
          ctx!.beginPath();ctx!.moveTo(m.trail[i-1].x,m.trail[i-1].y);ctx!.lineTo(m.trail[i].x,m.trail[i].y);ctx!.stroke();
        }
        ctx!.fillStyle=`rgba(${rgb},${fade*.8})`;ctx!.beginPath();ctx!.arc(m.x,m.y,1.25,0,Math.PI*2);ctx!.fill();
      }
      for(const p of planets){
        if(dt)integrate(p,dt,true);
        // Steering moves planets toward open space without popping the entire sphere out.
        ctx!.save();ctx!.translate(p.x,p.y);
        const colors=dark?[['#8eafc1','#344f68','#101722'],['#c4b08f','#776751','#201d19'],['#aaa2be','#554d71','#181622']]:[['#adc7d7','#7297ad','#465f76'],['#d8c5a8','#ac9470','#75664f'],['#c7bed9','#9c8cb9','#6f608b']];
        const palette=colors[p.tone];
        const shade=ctx!.createRadialGradient(-p.radius*.45,-p.radius*.5,1,p.radius*.25,p.radius*.2,p.radius*1.35);
        shade.addColorStop(0,palette[0]);shade.addColorStop(.48,palette[1]);shade.addColorStop(1,palette[2]);
        ctx!.globalAlpha=dark?.65:.42;
        if(p.tone===1){ctx!.strokeStyle=palette[0];ctx!.lineWidth=1.5;ctx!.beginPath();ctx!.ellipse(0,0,p.radius*1.85,p.radius*.35,-.35,0,Math.PI*2);ctx!.stroke();}
        ctx!.fillStyle=shade;ctx!.beginPath();ctx!.arc(0,0,p.radius,0,Math.PI*2);ctx!.fill();
        ctx!.save();ctx!.clip();
        // Surface marks rotate on a sphere; the night-side marks disappear over the limb.
        for(let j=0;j<9;j++){
          const latitude=Math.sin(j*2.4)*.85,longitude=j*2.399+time*.075+p.phase;
          const depth=Math.cos(latitude)*Math.cos(longitude);
          if(depth<=0)continue;
          const x=p.radius*Math.cos(latitude)*Math.sin(longitude),y=p.radius*Math.sin(latitude);
          ctx!.fillStyle=j%2?"rgba(235,238,247,.12)":"rgba(12,20,34,.16)";
          ctx!.beginPath();ctx!.ellipse(x,y,p.radius*.16*depth,p.radius*.075,0,0,Math.PI*2);ctx!.fill();
        }
        ctx!.restore();ctx!.restore();
      }
      clearContent(ctx!,boxes);

    }
    function frame(now:number){
      raf=0;if(document.hidden||paused()||reduced.matches)return;
      if(!last)last=now;
      const dt=Math.min((now-last)/1000,.05);
      if(dt>=1/30){time+=dt;last=now;draw(dt);pointer.vx*=.8;pointer.vy*=.8;}
      raf=requestAnimationFrame(frame);
    }
    function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
    function start(){if(!raf&&!document.hidden&&!paused()&&!reduced.matches)raf=requestAnimationFrame(frame);}
    function preference(){stop();dark=document.documentElement.dataset.theme==="dark";geometry();draw(0);start();}
    function move(e:PointerEvent){
      if(!fine.matches||reduced.matches||paused())return;
      pointer.vx=Math.max(-120,Math.min(120,(e.clientX-pointer.x)*4));pointer.vy=Math.max(-120,Math.min(120,(e.clientY-pointer.y)*4));pointer.x=e.clientX;pointer.y=e.clientY;
    }
    function leave(){pointer.x=pointer.y=-9999;pointer.vx=pointer.vy=0;}
    function refresh(){geometry();draw(0);}
    dark=document.documentElement.dataset.theme==="dark";resize();start();
    const theme=new MutationObserver(preference);theme.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","data-motion"]});
    const content=new MutationObserver(refresh);content.observe(document.body,{childList:true,subtree:true,characterData:true});
    const layout=new ResizeObserver(refresh);layout.observe(document.body);
    window.addEventListener("pointermove",move,{passive:true});window.addEventListener("blur",leave);document.addEventListener("pointerleave",leave);
    window.addEventListener("resize",resize);window.addEventListener("scroll",refresh,{passive:true});document.addEventListener("visibilitychange",preference);reduced.addEventListener("change",preference);
    return()=>{stop();theme.disconnect();content.disconnect();layout.disconnect();window.removeEventListener("pointermove",move);window.removeEventListener("blur",leave);document.removeEventListener("pointerleave",leave);window.removeEventListener("resize",resize);window.removeEventListener("scroll",refresh);document.removeEventListener("visibilitychange",preference);reduced.removeEventListener("change",preference);};
  },[]);
  return <><div className="cosmic-haze" aria-hidden="true"/><canvas ref={ref} className="cosmic-background" data-testid="cosmic-background" aria-hidden="true"/></>;
}
