<script>
  import { onMount, onDestroy } from 'svelte';

  let canvas;
  let w = 1, h = 1;
  let raf;
  let isDark = true;

  // ── Per-theme tokens ──────────────────────────────────────────────────────
  const THEMES = {
    dark: {
      bg:        ['#030B1A', '#071428', '#050E1E'],
      blobs:     ['#1844AA', '#005fa0', '#550099'],
      blobA:     0.095,
      city0:     'rgba(5,14,32,0.88)',
      city1:     'rgba(3,9,22,0.94)',
      ground0:   'rgba(3,9,22,0.94)',
      ground1:   '#020810',
      cityAlpha: 0.15,
      horizon:   'rgba(0,160,255,0.12)',
      beam:      0.044,
      bokeh:     ['#00C8FF','#247FFF','#BB44FF','#FF8C40','#00EED0'],
      trails:    ['#00D4FF','#247FFF','#FF4FD8','#00EEFF','#7B5EFF'],
      btPairs:   [['#00FFFF','#FF80FF'],['#40C0FF','#FF60CC'],['#90AAFF','#FF90DD']],
      btBody:    'rgba(180,230,255,0.55)',
    },
    light: {
      bg:        ['#EBF5FF','#F3F9FF','#E6F2FF'],
      blobs:     ['#5AAAFF','#88C4FF','#AA88FF'],
      blobA:     0.055,
      city0:     'rgba(120,170,220,0.14)',
      city1:     'rgba(100,155,210,0.20)',
      ground0:   'rgba(100,155,210,0.20)',
      ground1:   'rgba(80,140,200,0.28)',
      cityAlpha: 0.09,
      horizon:   'rgba(36,127,255,0.15)',
      beam:      0.028,
      bokeh:     ['#3EA8FF','#70BEFF','#BB80FF','#FFB055'],
      trails:    ['#0090FF','#2050EE','#FF40AA','#00BBFF','#5030EE'],
      btPairs:   [['#FF70AA','#40C8FF'],['#AA60FF','#60D8FF'],['#FF90CC','#60FFD0']],
      btBody:    'rgba(50,90,180,0.40)',
    },
  };

  // ── Scene state ───────────────────────────────────────────────────────────
  let blobs       = [];
  let bokeh       = [];
  let buildings   = [];
  let trails      = [];
  let butterflies = [];

  const ROAD_PATHS = [
    { s:[-0.05,0.82], c1:[0.20,0.70], c2:[0.45,0.52], e:[0.65,0.38] },
    { s:[ 0.22,0.92], c1:[0.35,0.76], c2:[0.52,0.57], e:[0.65,0.38] },
    { s:[ 0.65,0.38], c1:[0.78,0.32], c2:[0.90,0.28], e:[1.10,0.25] },
  ];

  const BLDG = [
    {x:0.020,w:0.038,h:0.18},{x:0.055,w:0.022,h:0.27},{x:0.080,w:0.028,h:0.21},
    {x:0.110,w:0.038,h:0.14},{x:0.145,w:0.018,h:0.31},{x:0.165,w:0.032,h:0.23},
    {x:0.550,w:0.028,h:0.15},{x:0.582,w:0.022,h:0.21},{x:0.620,w:0.028,h:0.11},
    {x:0.760,w:0.028,h:0.18},{x:0.790,w:0.022,h:0.13},{x:0.825,w:0.038,h:0.25},
    {x:0.865,w:0.022,h:0.16},{x:0.890,w:0.032,h:0.21},{x:0.925,w:0.028,h:0.29},
    {x:0.955,w:0.038,h:0.17},
  ];

  // ── Helpers ───────────────────────────────────────────────────────────────
  function h2(n) { return Math.round(Math.min(255,Math.max(0,n))).toString(16).padStart(2,'0'); }
  function ac(col, a) { return col + h2(a * 255); }
  function T() { return THEMES[isDark ? 'dark' : 'light']; }

  function evalBez([sx,sy],[c1x,c1y],[c2x,c2y],[ex,ey], t) {
    const m = 1 - t;
    return [
      m*m*m*sx + 3*m*m*t*c1x + 3*m*t*t*c2x + t*t*t*ex,
      m*m*m*sy + 3*m*m*t*c1y + 3*m*t*t*c2y + t*t*t*ey,
    ];
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function initScene() {
    const t = T();

    // 3 large slow-drifting mesh blobs
    blobs = [[0.18,0.22],[0.84,0.15],[0.52,0.80]].map(([nx,ny], i) => ({
      x: nx*w, y: ny*h,
      r: Math.min(w,h) * (0.42 + i*0.06),
      color: t.blobs[i],
      a: t.blobA + Math.random()*0.025,
      dx: (Math.random()-0.5)*0.10,
      dy: (Math.random()-0.5)*0.07,
    }));

    // 12 soft bokeh orbs
    bokeh = Array.from({length:12}, () => ({
      x: Math.random()*w, y: Math.random()*h*0.90,
      r: 9+Math.random()*22,
      color: t.bokeh[Math.floor(Math.random()*t.bokeh.length)],
      a: 0.030+Math.random()*0.065,
      dx: (Math.random()-0.5)*0.15,
      dy: -0.030-Math.random()*0.085,
    }));

    // Building rects
    const baseY = h*0.74;
    buildings = BLDG.map(s => ({
      bx:s.x*w, bw:s.w*w, bh:s.h*h, by:baseY-s.h*h,
    }));

    // 8 light trails — staggered start positions
    trails = Array.from({length:8}, (_,i) => mkTrail(i/8));

    // 3 glass butterflies
    butterflies = Array.from({length:3}, () => mkButterfly());
  }

  function mkTrail(t0 = Math.random()) {
    const t = T();
    return {
      pi: Math.floor(Math.random()*3), t: t0,
      speed: 0.0014+Math.random()*0.0022,        // slower = smoother
      color: t.trails[Math.floor(Math.random()*t.trails.length)],
      tail: [], tailLen: 14+Math.floor(Math.random()*16),
      width: 1.0+Math.random()*1.5,
    };
  }

  function mkButterfly(x0, y0) {
    const t = T();
    const [c1,c2] = t.btPairs[Math.floor(Math.random()*t.btPairs.length)];
    return {
      x: x0 ?? Math.random()*w,
      y: y0 ?? (h*0.10 + Math.random()*h*0.65),
      size: 10+Math.random()*20,
      dx: (Math.random()-0.5)*0.40,
      dy: (Math.random()-0.5)*0.20 - 0.05,
      rot: (Math.random()-0.5)*0.28,
      wingPhase: Math.random()*Math.PI*2,
      wingSpeed: 0.038+Math.random()*0.045,      // gentle flap
      shimmer: Math.random()*Math.PI*2,
      c1, c2,
    };
  }

  // ── Draw butterfly (glass — kept subtle) ──────────────────────────────────
  function drawButterfly(ctx, b) {
    const wo = Math.abs(Math.sin(b.wingPhase));
    const sh = (Math.sin(b.shimmer)+1)*0.5;
    const s  = b.size;
    const t  = T();

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot);

    [1,-1].forEach(side => {
      ctx.save();
      ctx.scale(side, 1);

      // Upper wing — max 0.28 alpha (was 0.52)
      const ug = ctx.createLinearGradient(0,-s*0.88, s*wo, 0);
      ug.addColorStop(0,   ac(b.c1, 0.26+sh*0.09));
      ug.addColorStop(0.45,ac(b.c2, 0.16+sh*0.05));
      ug.addColorStop(1,   ac(b.c1, 0.05));
      ctx.beginPath();
      ctx.moveTo(0,-2);
      ctx.bezierCurveTo(s*0.24*wo,-s*0.88, s*0.88*wo,-s*0.68, s*0.84*wo,-s*0.04);
      ctx.bezierCurveTo(s*0.74*wo, s*0.20, s*0.14*wo, s*0.10, 0, 2);
      ctx.fillStyle = ug; ctx.fill();

      // Leading-edge shimmer
      ctx.beginPath();
      ctx.moveTo(0,-2);
      ctx.bezierCurveTo(s*0.24*wo,-s*0.88, s*0.88*wo,-s*0.68, s*0.84*wo,-s*0.04);
      ctx.strokeStyle = `rgba(255,255,255,${0.10+sh*0.12})`;
      ctx.lineWidth = 0.7; ctx.stroke();

      // Lower wing — max 0.22 alpha
      const lg = ctx.createLinearGradient(0, 2, s*0.48*wo, s*0.66);
      lg.addColorStop(0,  ac(b.c2, 0.22+sh*0.07));
      lg.addColorStop(1,  ac(b.c2, 0.04));
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.bezierCurveTo(s*0.11*wo,s*0.11, s*0.55*wo,s*0.14, s*0.46*wo,s*0.64);
      ctx.bezierCurveTo(s*0.26*wo,s*0.74, s*0.05*wo,s*0.45, 0, 2);
      ctx.fillStyle = lg; ctx.fill();

      ctx.restore();
    });

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 1.3, s*0.26, 0, 0, Math.PI*2);
    ctx.fillStyle = t.btBody; ctx.fill();

    ctx.restore();
  }

  // ── Main draw ─────────────────────────────────────────────────────────────
  function draw() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const t   = T();
    ctx.clearRect(0, 0, w, h);

    // 1 ─ Background gradient
    const bg = ctx.createLinearGradient(0, 0, w*0.4, h);
    bg.addColorStop(0, t.bg[0]); bg.addColorStop(0.6, t.bg[1]); bg.addColorStop(1, t.bg[2]);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    // 2 ─ Mesh blobs (slow colour pools — primary depth layer)
    blobs.forEach(b => {
      const rg = ctx.createRadialGradient(b.x,b.y,0, b.x,b.y,b.r);
      rg.addColorStop(0,    ac(b.color, b.a));
      rg.addColorStop(0.55, ac(b.color, b.a*0.30));
      rg.addColorStop(1,    ac(b.color, 0));
      ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
      b.x += b.dx; b.y += b.dy;
      if (b.x<-b.r*0.4 || b.x>w+b.r*0.4) b.dx *= -1;
      if (b.y<-b.r*0.4 || b.y>h+b.r*0.4) b.dy *= -1;
    });

    // 3 ─ Single diagonal soft-glow band
    const beam = ctx.createLinearGradient(0, h*0.88, w*0.88, 0);
    beam.addColorStop(0,    'transparent');
    beam.addColorStop(0.38, `rgba(36,127,255,${t.beam})`);
    beam.addColorStop(0.52, `rgba(100,190,255,${t.beam*0.48})`);
    beam.addColorStop(0.68, `rgba(36,127,255,${t.beam*0.20})`);
    beam.addColorStop(1,    'transparent');
    ctx.fillStyle = beam; ctx.fillRect(0, 0, w, h);

    // 4 ─ City silhouette (10-15% opacity — suggestion of depth, not dominant)
    const baseY = h*0.74;
    ctx.globalAlpha = t.cityAlpha;
    buildings.forEach(({bx,by,bw,bh}) => {
      const cg = ctx.createLinearGradient(bx,by,bx,by+bh);
      cg.addColorStop(0, t.city0); cg.addColorStop(1, t.city1);
      ctx.fillStyle = cg; ctx.fillRect(bx,by,bw,bh);
    });
    const gg = ctx.createLinearGradient(0,baseY,0,h);
    gg.addColorStop(0, t.ground0); gg.addColorStop(1, t.ground1);
    ctx.fillStyle = gg; ctx.fillRect(0,baseY,w,h-baseY);
    ctx.globalAlpha = 1;

    // 5 ─ Horizon glow line
    const hl = ctx.createLinearGradient(0,baseY-1,0,baseY+5);
    hl.addColorStop(0, t.horizon); hl.addColorStop(1,'transparent');
    ctx.fillStyle = hl; ctx.fillRect(0,baseY-1,w,6);

    // 6 ─ Road paths (barely visible — guide for the trail particles)
    ROAD_PATHS.forEach((p,i) => {
      const pts = [[p.s[0]*w,p.s[1]*h],[p.c1[0]*w,p.c1[1]*h],[p.c2[0]*w,p.c2[1]*h],[p.e[0]*w,p.e[1]*h]];
      const lw  = [18,12,7][i];
      ctx.beginPath();
      ctx.moveTo(pts[0][0],pts[0][1]);
      ctx.bezierCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1],pts[3][0],pts[3][1]);
      ctx.strokeStyle = 'rgba(36,127,255,0.035)';
      ctx.lineWidth = lw*2.2; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pts[0][0],pts[0][1]);
      ctx.bezierCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1],pts[3][0],pts[3][1]);
      ctx.strokeStyle = 'rgba(0,140,220,0.055)';
      ctx.lineWidth = lw; ctx.stroke();
    });

    // 7 ─ Bokeh orbs (soft bloom via multi-stop radial — no filter needed)
    bokeh.forEach(b => {
      const rg = ctx.createRadialGradient(b.x,b.y,0, b.x,b.y,b.r);
      rg.addColorStop(0,    ac(b.color, b.a));
      rg.addColorStop(0.42, ac(b.color, b.a*0.36));
      rg.addColorStop(1,    ac(b.color, 0));
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
      b.x+=b.dx; b.y+=b.dy;
      if (b.y+b.r<0) { b.y=h+b.r; b.x=Math.random()*w; }
      if (b.x+b.r<0) b.x=w+b.r;
      if (b.x-b.r>w) b.x=-b.r;
    });

    // 8 ─ Light trails — double-pass glow instead of per-segment shadowBlur
    trails.forEach(tr => {
      const p = ROAD_PATHS[tr.pi];
      const [px,py] = evalBez(
        [p.s[0]*w,p.s[1]*h],[p.c1[0]*w,p.c1[1]*h],
        [p.c2[0]*w,p.c2[1]*h],[p.e[0]*w,p.e[1]*h],
        Math.min(tr.t,1));
      tr.tail.unshift({x:px,y:py});
      if (tr.tail.length>tr.tailLen) tr.tail.pop();

      for (let i=0; i<tr.tail.length-1; i++) {
        const a  = (1-i/tr.tail.length) * 0.62;
        const lw = tr.width*(1-(i/tr.tail.length)*0.60);
        // Pass 1: wide soft glow (no shadowBlur)
        ctx.beginPath();
        ctx.moveTo(tr.tail[i].x,tr.tail[i].y);
        ctx.lineTo(tr.tail[i+1].x,tr.tail[i+1].y);
        ctx.strokeStyle = ac(tr.color, a*0.22);
        ctx.lineWidth = lw*3.2; ctx.lineCap='round'; ctx.stroke();
        // Pass 2: bright core
        ctx.beginPath();
        ctx.moveTo(tr.tail[i].x,tr.tail[i].y);
        ctx.lineTo(tr.tail[i+1].x,tr.tail[i+1].y);
        ctx.strokeStyle = ac(tr.color, a);
        ctx.lineWidth = lw; ctx.stroke();
      }

      // Head glow dot — single shadowBlur per trail (cheap)
      if (tr.tail.length>0) {
        const {x,y} = tr.tail[0];
        ctx.beginPath(); ctx.arc(x,y,tr.width*1.4,0,Math.PI*2);
        ctx.fillStyle = ac(tr.color,0.78);
        ctx.shadowBlur=14; ctx.shadowColor=tr.color;
        ctx.fill(); ctx.shadowBlur=0;
      }

      tr.t += tr.speed;
      if (tr.t>1.05) Object.assign(tr, mkTrail(0));
    });

    // 9 ─ Glass butterflies (translucent, gentle motion)
    butterflies.forEach(b => {
      drawButterfly(ctx, b);
      b.wingPhase += b.wingSpeed;
      b.shimmer   += 0.020;
      b.x += b.dx; b.y += b.dy;
      b.rot += (Math.random()-0.5)*0.005;
      if (Math.random()<0.009) { b.dx+=(Math.random()-0.5)*0.35; b.dy+=(Math.random()-0.5)*0.15; }
      b.dx*=0.994; b.dy*=0.994;
      const spd = Math.hypot(b.dx,b.dy);
      if (spd>0.85) { b.dx*=0.85/spd; b.dy*=0.85/spd; }
      if (b.x<-b.size*3||b.x>w+b.size*3||b.y<-b.size*3||b.y>h+b.size*3)
        Object.assign(b, mkButterfly(Math.random()*w, h*0.10+Math.random()*h*0.65));
    });
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio||1;
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width=w*dpr; canvas.height=h*dpr;
    canvas.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
    initScene();
  }

  let mq;
  function onThemeChange(e) { isDark=e.matches; initScene(); }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMount(() => {
    mq = window.matchMedia('(prefers-color-scheme: dark)');
    isDark = mq.matches;
    mq.addEventListener('change', onThemeChange);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    resize();
    window.addEventListener('resize', resize);
    if (reduced.matches) { draw(); return; }
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    loop();
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      mq?.removeEventListener('change', onThemeChange);
    }
  });
</script>

<canvas bind:this={canvas} class="absolute inset-0 h-full w-full" aria-hidden="true" />
