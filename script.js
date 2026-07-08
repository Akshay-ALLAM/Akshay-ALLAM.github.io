const canvas = document.getElementById("neural-canvas");
const ctx = canvas.getContext("2d");
const cursorGlow = document.querySelector(".cursor-glow");
const cursorDot = document.querySelector(".cursor-dot");
const scrollProgress = document.querySelector(".scroll-progress");
const reveals = document.querySelectorAll(".reveal");
const loader = document.querySelector(".loader");
const loaderCount = document.querySelector(".loader-count");
const magneticItems = document.querySelectorAll("a, button, .system-card, .stack-item, .timeline article, .education-card");

let width = 0;
let height = 0;
let particles = [];
let pointer = { x: 0, y: 0, active: false };

document.body.classList.add("loading");

function runLoader() {
  if (!loader || !loaderCount) return;

  let progress = 0;
  const timer = window.setInterval(() => {
    progress = Math.min(100, progress + Math.ceil(Math.random() * 9));
    loaderCount.textContent = `${progress}%`;
    if (progress >= 100) {
      window.clearInterval(timer);
      window.setTimeout(() => {
        loader.classList.add("done");
        document.body.classList.remove("loading");
      }, 220);
    }
  }, 70);
}

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(54, Math.max(24, Math.floor(width / 28)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: Math.random() * 1.2 + 0.55,
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;
  }

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 135) {
        const alpha = (1 - dist / 135) * 0.14;
        ctx.strokeStyle = `rgba(86, 97, 61, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  if (pointer.active) {
    for (const p of particles) {
      const dist = Math.hypot(p.x - pointer.x, p.y - pointer.y);
      if (dist < 180) {
        ctx.strokeStyle = `rgba(185, 107, 75, ${(1 - dist / 180) * 0.22})`;
        ctx.beginPath();
        ctx.moveTo(pointer.x, pointer.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }
  }

  for (const p of particles) {
    ctx.fillStyle = "rgba(23, 24, 19, 0.36)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

function updateScrollProgress() {
  if (!scrollProgress) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

window.addEventListener("resize", resize);
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
  if (cursorGlow) {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }
  if (cursorDot) {
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
  }
});

window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    }
  },
  { threshold: 0.14 }
);

for (const item of reveals) {
  observer.observe(item);
}

for (const item of magneticItems) {
  item.addEventListener("pointerenter", () => cursorDot?.classList.add("active"));
  item.addEventListener("pointerleave", () => cursorDot?.classList.remove("active"));
}

runLoader();
resize();
updateScrollProgress();
draw();
