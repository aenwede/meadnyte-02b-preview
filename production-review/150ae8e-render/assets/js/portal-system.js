(() => {
  const canvas = document.querySelector('.portal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width, height, dpr, stars, time = 0;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2); width = innerWidth; height = innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr; canvas.style.width = width+'px'; canvas.style.height = height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.max(180, Math.floor(width * height / 3200));
    stars = Array.from({length:count}, () => ({x:Math.random()*width,y:Math.random()*height,r:Math.random()*1.25+.15,a:Math.random()*.72+.12,p:Math.random()*6.28}));
  };
  const draw = () => {
    ctx.clearRect(0,0,width,height); ctx.fillStyle='#01030a'; ctx.fillRect(0,0,width,height);
    const gx=width*.54, gy=height*.47, radius=Math.min(width,height)*.16;
    const glow=ctx.createRadialGradient(gx,gy,0,gx,gy,radius*2.8); glow.addColorStop(0,'rgba(0,0,0,.98)');glow.addColorStop(.42,'rgba(1,4,10,.94)');glow.addColorStop(.63,'rgba(32,72,104,.15)');glow.addColorStop(.75,'rgba(218,170,79,.07)');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    stars.forEach(s=>{const alpha=s.a*(.78+.22*Math.sin(time*.001+s.p));ctx.globalAlpha=alpha;ctx.fillStyle=s.r>.95?'#f5d899':'#c7deef';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.29);ctx.fill()});ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(84,142,180,.14)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(gx,gy,radius*2.15,radius*.55,-.18,0,6.29);ctx.stroke();
    if(!reduced){time=performance.now();requestAnimationFrame(draw)}
  };
  addEventListener('resize',resize,{passive:true});resize();draw();
  const target=document.querySelector('[data-status-sequence]');
  if(target && !reduced){const lines=['SCANNING DEEP-FIELD ACTIVITY...','TEMPORAL EVENT IN FORMATION...','CHAMBER STABILIZATION IN PROGRESS...'];let i=0;target.textContent=lines[0];setInterval(()=>{i=(i+1)%lines.length;target.textContent=lines[i]},2600)}
})();
