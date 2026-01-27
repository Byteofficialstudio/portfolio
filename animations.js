// Scroll Animations
const sections = document.querySelectorAll('.section');
window.addEventListener('scroll', ()=>{
  const triggerBottom = window.innerHeight / 5 * 4;
  sections.forEach(section=>{
    const sectionTop = section.getBoundingClientRect().top;
    if(sectionTop < triggerBottom){
      section.style.opacity = 1;
      section.style.transform = 'translateY(0)';
      section.style.transition = '0.8s ease-out';
    } else {
      section.style.opacity = 0;
      section.style.transform = 'translateY(40px)';
    }
  });
});

// Portfolio Card Scroll Animations
const cards = document.querySelectorAll('.card');
window.addEventListener('scroll', ()=>{
  const triggerBottom = window.innerHeight / 5 * 4;
  cards.forEach((card, index)=>{
    const cardTop = card.getBoundingClientRect().top;
    if(cardTop < triggerBottom){
      setTimeout(() => {
        card.style.opacity = 1;
        card.style.transform = 'translateY(0) scale(1)';
        card.style.transition = '0.6s ease-out';
      }, index * 100); // Stagger animation
    } else {
      card.style.opacity = 0;
      card.style.transform = 'translateY(50px) scale(0.95)';
    }
  });
});

// Floating Mascot Interaction (guarded)
const mascot = document.querySelector('.mascot') || document.querySelector('.hero-mascot');
if (mascot){
  document.addEventListener('mousemove', e=>{
      const x = e.clientX;
      const y = e.clientY;
      const rect = mascot.getBoundingClientRect();
      const dx = (x - (rect.left + rect.width/2))/40;
      const dy = (y - (rect.top + rect.height/2))/40;
      mascot.style.transform = `translate(${dx}px, ${dy}px)`;
  });
}

// Cursor Neon Trail (guarded)
const trail = document.querySelector('.cursor-trail');
if (trail){
  document.addEventListener('mousemove', e=>{
    trail.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}

/* Floating particle animation on fullscreen canvas */
(function(){
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, particles = [];

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  function rand(min, max){ return Math.random() * (max - min) + min }

  function createParticle(){
    // style: soft colored blob / petal
    const size = rand(8, 28);
    return {
      x: rand(-w*0.1, w * 1.1),
      y: rand(-h*0.2, h),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.15, -0.6),
      size,
      life: rand(18, 40),
      age: 0,
      // hue range tuned to cyan -> indigo (professional game portfolio)
      hue: rand(190, 245),
      alpha: rand(0.14, 0.5),
      wobble: rand(0.2, 1.2),
      tilt: rand(-0.8, 0.8)
    };
  }

  function init(n){ particles = []; for(let i=0;i<n;i++) particles.push(createParticle()) }

  function drawParticle(p, t){
    const lifePct = p.age / p.life;
    const s = p.size * (0.9 + 0.5 * Math.sin(t * 0.002 + p.wobble));
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.tilt + Math.sin(t*0.001 + p.wobble) * 0.6);
    const grad = ctx.createRadialGradient(0,0,s*0.1,0,0,s);
    grad.addColorStop(0, `hsla(${p.hue},85%,60%,${p.alpha})`);
    grad.addColorStop(0.55, `hsla(${(p.hue+36)%360},68%,50%,${Math.max(0.12, p.alpha*0.62)})`);
    grad.addColorStop(1, `hsla(${(p.hue+72)%360},48%,36%,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s*0.66, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function step(t){
    ctx.clearRect(0,0,w,h);
    // soft overlay glow
    ctx.globalCompositeOperation = 'lighter';
    for(let i=0;i<particles.length;i++){
      const p = particles[i];
      p.x += p.vx + Math.sin(t*0.0006 + i) * 0.2;
      p.y += p.vy - Math.cos(t*0.0003 + i) * 0.1;
      p.age += 0.016;
      drawParticle(p, t);
      // respawn when past top or aged
      if (p.y < -60 || p.age > p.life){ particles[i] = createParticle(); particles[i].y = h + rand(0, 60); }
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(step);
  }

  // initialize particle count based on viewport size (denser on large screens)
  (function determineAndInit(){
    const area = window.innerWidth * window.innerHeight;
    // base divisor controls density; larger divisor => fewer particles
    let divisor = 90000;
    if (window.innerWidth >= 1600) divisor = 70000; // denser on widescreens
    if (window.innerWidth >= 2560) divisor = 52000; // extra dense on very large screens
    const count = Math.max(28, Math.min(180, Math.floor(area / divisor)));
    init(count);
  })();
  requestAnimationFrame(step);
})();
