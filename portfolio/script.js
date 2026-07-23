const canvas = document.getElementById("neural-canvas");
const ctx = canvas.getContext("2d");
const cursorGlow = document.querySelector(".cursor-glow");
const cursorDot = document.querySelector(".cursor-dot");
const scrollProgress = document.querySelector(".scroll-progress");
const reveals = document.querySelectorAll(".reveal");
const loader = document.querySelector(".loader");
const loaderCount = document.querySelector(".loader-count");
const educationMoment = document.querySelector(".education-moment");
const magneticItems = document.querySelectorAll("a, button, .system-card, .stack-item, .timeline article, .education-card");

let width = 0;
let height = 0;
let particles = [];
let pointer = { x: 0, y: 0, active: false };

document.body.classList.add("loading");

function runLoader() {
  if (!loader || !loaderCount) return;

  const introDuration = 4000;
  const startedAt = Date.now();
  const timer = window.setInterval(() => {
    const progress = Math.min(100, Math.round(((Date.now() - startedAt) / introDuration) * 100));
    loaderCount.textContent = progress < 100 ? `Loading ${progress}%` : "Entering portfolio";
    if (progress >= 100) {
      window.clearInterval(timer);
      window.setTimeout(() => {
        loader.classList.add("done");
        window.setTimeout(() => document.body.classList.remove("loading"), 850);
      }, 250);
    }
  }, 100);
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

  if (educationMoment) {
    const box = educationMoment.getBoundingClientRect();
    const rawProgress = (window.innerHeight - box.top) / (window.innerHeight + box.height * 0.65);
    const momentProgress = Math.min(1, Math.max(0, rawProgress));
    educationMoment.style.setProperty("--moment-progress", momentProgress.toFixed(3));
  }
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
  item.classList.add("magnetic");
  item.addEventListener("pointerenter", () => cursorDot?.classList.add("active"));
  item.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const box = item.getBoundingClientRect();
    const x = (event.clientX - box.left - box.width / 2) * 0.08;
    const y = (event.clientY - box.top - box.height / 2) * 0.08;
    item.style.transform = `translate(${x}px, ${y}px)`;
  });
  item.addEventListener("pointerleave", () => {
    cursorDot?.classList.remove("active");
    item.style.transform = "";
  });
}

const translations = {
  en: {
    "nav.system": "System",
    "nav.work": "Work",
    "nav.profile": "Profile",
    "nav.stack": "Stack",
    "nav.experience": "Experience",
    "nav.contact": "Contact",
    "hero.eyebrow": "AI Automation Builder - Business Analyst - Data Thinker",
    "hero.title": "AI workflows for <em>clearer business operations.</em>",
    "hero.text": "I build practical automations that connect tools, route information, reduce manual work, and help business teams make faster decisions.",
    "hero.focusLabel": "Current focus",
    "hero.focus": "AI workflow systems for business operations",
    "hero.cta": "Start a conversation",
    "hero.cv": "Download CV",
    "hero.metric1": "France based",
    "hero.metric2": "Automation focus",
    "hero.metric3": "Business workflow lens",
    "_roles": ["AI Automation Builder", "Business Analyst", "Workflow Designer", "Data Thinker", "AI Automation Builder", "Business Analyst"],
    "workflow.input": "Input",
    "workflow.ai": "AI",
    "workflow.sheets": "Sheets",
    "workflow.action": "Action",
    "console.status": "Available for opportunities",
    "console.role": "AI Automation Builder | Strategy & Data Analyst",
    "console.step1": "capture business signal",
    "console.step2": "classify, route, enrich",
    "console.step3": "trigger next action",
    "marquee.n8n": "n8n workflows",
    "marquee.make": "Make automation",
    "marquee.agents": "AI agents",
    "marquee.sheets": "Google Sheets systems",
    "marquee.powerbi": "Power BI dashboards",
    "marquee.airtable": "Airtable learning",
    "system.eyebrow": "System thinking",
    "system.title": "From messy process to intelligent workflow.",
    "system.card1Title": "Map the work",
    "system.card1Text": "Understand the manual steps, decision points, handoffs, and where time gets wasted.",
    "system.card2Title": "Build the automation",
    "system.card2Text": "Connect APIs, spreadsheets, AI models, and business tools into a practical workflow.",
    "system.card3Title": "Make it usable",
    "system.card3Text": "Document the process, structure the outputs, and keep the system easy to understand.",
    "profile.eyebrow": "Profile depth",
    "profile.title": "Business analysis, finance, and automation in one operating view.",
    "profile.intro": "MBA candidate in Corporate Finance with experience across market research, competitive intelligence, financial planning, data dashboards, and AI-supported workflow automation.",
    "profile.card1Label": "Market strategy",
    "profile.card1Title": "Research that supports decisions",
    "profile.card1Text": "Researched funding opportunities, grants, market entry points, and competitor positioning for international business development work.",
    "profile.card2Label": "Data analysis",
    "profile.card2Title": "Dashboards and reporting",
    "profile.card2Text": "Built Power BI dashboards, cleaned datasets, validated data quality, and supported senior stakeholders with reporting workflows.",
    "profile.card3Label": "Finance projects",
    "profile.card3Title": "Commercial planning",
    "profile.card3Text": "Worked on market feasibility, strategic financial planning, operational KPIs, and investor-style materials through MBA and internship projects.",
    "casework.eyebrow": "Selected work",
    "casework.title": "Public-safe case studies from business, finance, and automation work.",
    "casework.text": "I use project decks as source evidence, but keep public summaries focused on what recruiters need: problem, analysis, business impact, and implementation thinking.",
    "casework.card1Label": "Market expansion",
    "casework.card1Title": "AgileWater.fr - Kenya entry strategy",
    "casework.card1Text": "Built a market feasibility view covering regulatory context, competitive landscape, operational KPIs, entry cost, revenue potential, and beneficiary impact.",
    "casework.card1Point1": "Modeled EUR70K entry cost and EUR225K revenue at 5% penetration.",
    "casework.card1Point2": "Defined production benchmarks including EUR0.06/L unit cost and 270,000 L/day capacity.",
    "casework.card2Label": "PoC design",
    "casework.card2Title": "SkillsPass - Deutsche Bahn partnership concept",
    "casework.card2Text": "Converted knowledge-retention problems into a structured digital credential wallet concept for Construction and Project Management teams.",
    "casework.card2Point1": "Mapped incomplete handovers, repeated mistakes, and onboarding delays into a clear problem statement.",
    "casework.card2Point2": "Structured a 6-phase, 100-day PoC roadmap from validation to stakeholder reporting.",
    "casework.metaAgile": "This is a public summary based on my project deck.",
    "casework.metaCertiff": "This is a public-safe summary; the full deck can be shared privately if requested.",
    "stack.eyebrow": "Automation stack",
    "stack.title": "Tools I use to connect business logic with AI execution.",
    "stack.n8n": "Workflow orchestration",
    "stack.make": "No-code automation",
    "stack.sheets": "Lightweight operations layer",
    "stack.powerbi": "Business dashboards",
    "stack.ai": "Classification, reasoning, summarization",
    "stack.airtable": "Learning next",
    "certification.eyebrow": "Certification",
    "certification.title": "Credentials that support my business and automation profile.",
    "certification.makeDate": "Issued Jul 2026",
    "certification.makeTitle": "Make Intermediate",
    "certification.makeText": "Completed Make's intermediate certification, strengthening my practical no-code automation and scenario-building foundation.",
    "certification.link": "View certificate",
    "certification.talisDate": "Dated Nov 26, 2025",
    "certification.talisTitle": "Manager du Developpement Commercial",
    "certification.talisText": "Professional business development certification from Talis Competences & Certifications, supporting my commercial strategy and business analysis foundation.",
    "experience.eyebrow": "Background",
    "experience.title": "Business, research, and data experience behind the automation.",
    "experience.certiffDate": "May 2025 - Sep 2025",
    "experience.certiffTitle": "Market Research Analyst - Certiff B.V.",
    "experience.certiffText": "Researched funding opportunities, grants, strategic partnerships, market entry points, and competitors including Accredible, Credly, Certwell, Certif-ID, and HandsHQ.",
    "experience.dataDate": "Mar 2023 - Oct 2023",
    "experience.dataTitle": "Data Analyst - Artificial Penetration Software Solutions Pvt. Ltd.",
    "experience.dataText": "Built Power BI dashboards, cleaned and validated datasets, used SQL and Excel for analysis, and improved reporting workflows for operational decision-making.",
    "education.eyebrow": "Education journey",
    "education.title": "From Hyderabad to Paris.",
    "education.text": "Finance foundation in India, then corporate finance and business strategy in France.",
    "education.hyderabad": "Hyderabad",
    "education.paris": "Paris",
    "education.bbaDate": "Jun 2019 - Jul 2022",
    "education.bba": "BBA in Finance",
    "education.bbaSchool": "Osmania University - Hyderabad, India",
    "education.mbaDate": "Mar 2024 - Jun 2026",
    "education.mba": "MBA in Corporate Finance",
    "education.mbaSchool": "ISTEC Business School - Paris, France",
    "contact.eyebrow": "Contact",
    "contact.title": "Let us build AI systems that actually save time.",
    "contact.text": "I am open to full-time roles, internships, freelance projects, remote work, and collaborations across Europe, India, and AI communities.",
    "contact.linkedin": "Connect on LinkedIn",
  },
  fr: {
    "nav.system": "Système",
    "nav.work": "Travaux",
    "nav.profile": "Profil",
    "nav.stack": "Outils",
    "nav.experience": "Expérience",
    "nav.contact": "Contact",
    "hero.eyebrow": "Créateur d'automatisations IA - Analyste business - Data analyst",
    "hero.title": "Des workflows IA pour des <em>opérations plus claires.</em>",
    "hero.text": "Je construis des automatisations concrètes qui connectent les outils, orientent l'information, réduisent le travail manuel et aident les équipes à décider plus vite.",
    "hero.focusLabel": "Focus actuel",
    "hero.focus": "Systèmes de workflow IA pour les opérations business",
    "hero.cta": "Me contacter",
    "hero.cv": "Télécharger CV",
    "hero.metric1": "Basé en France",
    "hero.metric2": "Focus automatisation",
    "hero.metric3": "Vision business, IA et data",
    "_roles": ["Créateur d'automatisations IA", "Analyste business", "Concepteur de workflows", "Data analyst", "Créateur d'automatisations IA", "Analyste business"],
    "workflow.input": "Signal",
    "workflow.ai": "IA",
    "workflow.sheets": "Sheets",
    "workflow.action": "Action",
    "console.status": "Disponible pour opportunités",
    "console.role": "Créateur d'automatisations IA | Analyste stratégie & data",
    "console.step1": "capturer le signal business",
    "console.step2": "classer, router, enrichir",
    "console.step3": "déclencher l'action suivante",
    "marquee.n8n": "Workflows n8n",
    "marquee.make": "Automatisation Make",
    "marquee.agents": "Agents IA",
    "marquee.sheets": "Systèmes Google Sheets",
    "marquee.powerbi": "Dashboards Power BI",
    "marquee.airtable": "Apprentissage Airtable",
    "system.eyebrow": "Pensée système",
    "system.title": "Du processus manuel au workflow intelligent.",
    "system.card1Title": "Cartographier le travail",
    "system.card1Text": "Comprendre les étapes manuelles, les décisions, les passages de relais et les pertes de temps.",
    "system.card2Title": "Construire l'automatisation",
    "system.card2Text": "Connecter APIs, tableurs, modèles IA et outils business dans un workflow pratique.",
    "system.card3Title": "Rendre le système utilisable",
    "system.card3Text": "Documenter le processus, structurer les sorties et garder le système facile à comprendre.",
    "profile.eyebrow": "Profil détaillé",
    "profile.title": "Analyse business, finance et automatisation dans une même vision opérationnelle.",
    "profile.intro": "Candidat MBA en Corporate Finance avec une expérience en étude de marché, veille concurrentielle, planification financière, dashboards data et automatisation de workflows avec l'IA.",
    "profile.card1Label": "Stratégie marché",
    "profile.card1Title": "Recherche orientée décision",
    "profile.card1Text": "Recherche d'opportunités de financement, de subventions, de points d'entrée marché et de positionnement concurrentiel pour le développement international.",
    "profile.card2Label": "Analyse data",
    "profile.card2Title": "Dashboards et reporting",
    "profile.card2Text": "Création de dashboards Power BI, nettoyage de datasets, validation de la qualité des données et support aux parties prenantes avec des workflows de reporting.",
    "profile.card3Label": "Projets finance",
    "profile.card3Title": "Planification commerciale",
    "profile.card3Text": "Travail sur la faisabilité marché, la planification financière stratégique, les KPIs opérationnels et les supports de type investisseur.",
    "casework.eyebrow": "Travaux sélectionnés",
    "casework.title": "Cas publics et sûrs issus de travaux business, finance et automatisation.",
    "casework.text": "J'utilise les decks de projet comme preuve source, mais je garde les résumés publics centrés sur ce qu'un recruteur doit voir : problème, analyse, impact business et logique d'implémentation.",
    "casework.card1Label": "Expansion marché",
    "casework.card1Title": "AgileWater.fr - stratégie d'entrée au Kenya",
    "casework.card1Text": "Construction d'une analyse de faisabilité couvrant contexte réglementaire, paysage concurrentiel, KPIs opérationnels, coût d'entrée, potentiel de revenus et impact bénéficiaires.",
    "casework.card1Point1": "Modélisation d'un coût d'entrée de EUR70K et de EUR225K de revenus à 5% de pénétration.",
    "casework.card1Point2": "Définition de benchmarks de production incluant EUR0.06/L de coût unitaire et 270,000 L/jour de capacité.",
    "casework.card2Label": "Design PoC",
    "casework.card2Title": "SkillsPass - concept de partenariat Deutsche Bahn",
    "casework.card2Text": "Transformation de problèmes de rétention des connaissances en concept structuré de wallet de credentials digitaux pour les équipes Construction et Project Management.",
    "casework.card2Point1": "Structuration des problèmes de passation incomplète, erreurs répétées et retards d'onboarding en un problème clair.",
    "casework.card2Point2": "Création d'une roadmap PoC en 6 phases sur 100 jours, de la validation au reporting stakeholders.",
    "casework.metaAgile": "Résumé public basé sur mon deck projet.",
    "casework.metaCertiff": "Résumé public sécurisé ; le deck complet peut être partagé en privé sur demande.",
    "stack.eyebrow": "Stack automatisation",
    "stack.title": "Les outils que j'utilise pour connecter la logique business à l'exécution IA.",
    "stack.n8n": "Orchestration de workflows",
    "stack.make": "Automatisation no-code",
    "stack.sheets": "Couche opérationnelle légère",
    "stack.powerbi": "Dashboards business",
    "stack.ai": "Classification, raisonnement, résumé",
    "stack.airtable": "En apprentissage",
    "certification.eyebrow": "Certification",
    "certification.title": "Des certifications qui soutiennent mon profil business et automatisation.",
    "certification.makeDate": "Obtenue en juillet 2026",
    "certification.makeTitle": "Make Intermediate",
    "certification.makeText": "Certification Make Intermediate complétée, renforçant mes bases pratiques en automatisation no-code et construction de scénarios.",
    "certification.link": "Voir le certificat",
    "certification.talisDate": "Datée du 26 novembre 2025",
    "certification.talisTitle": "Manager du Developpement Commercial",
    "certification.talisText": "Certification professionnelle en developpement commercial de Talis Competences & Certifications, renforçant ma base en strategie commerciale et analyse business.",
    "experience.eyebrow": "Parcours",
    "experience.title": "Expérience business, recherche et data derrière l'automatisation.",
    "experience.certiffDate": "Mai 2025 - Sep. 2025",
    "experience.certiffTitle": "Market Research Analyst - Certiff B.V.",
    "experience.certiffText": "Recherche d'opportunités de financement, grants, partenariats stratégiques, points d'entrée marché et concurrents dont Accredible, Credly, Certwell, Certif-ID et HandsHQ.",
    "experience.dataDate": "Mars 2023 - Oct. 2023",
    "experience.dataTitle": "Data Analyst - Artificial Penetration Software Solutions Pvt. Ltd.",
    "experience.dataText": "Création de dashboards Power BI, nettoyage et validation de datasets, usage de SQL et Excel pour l'analyse, et amélioration des workflows de reporting opérationnel.",
    "education.eyebrow": "Parcours académique",
    "education.title": "De Hyderabad à Paris.",
    "education.text": "Base en finance en Inde, puis Corporate Finance et stratégie business en France.",
    "education.hyderabad": "Hyderabad",
    "education.paris": "Paris",
    "education.bbaDate": "Juin 2019 - Juil. 2022",
    "education.bba": "BBA en Finance",
    "education.bbaSchool": "Osmania University - Hyderabad, Inde",
    "education.mbaDate": "Mars 2024 - Juin 2026",
    "education.mba": "MBA en Corporate Finance",
    "education.mbaSchool": "ISTEC Business School - Paris, France",
    "contact.eyebrow": "Contact",
    "contact.title": "Construisons des systèmes IA qui font vraiment gagner du temps.",
    "contact.text": "Je suis ouvert aux rôles full-time, stages, missions freelance, travail remote et collaborations en Europe, en Inde et dans les communautés IA.",
    "contact.linkedin": "Me contacter sur LinkedIn",
  },
};

function setLanguage(lang) {
  const dictionary = translations[lang] || translations.en;
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (dictionary[key]) element.textContent = dictionary[key];
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const key = element.dataset.i18nHtml;
    if (dictionary[key]) element.innerHTML = dictionary[key];
  });

  document.querySelectorAll("[data-lang-switch]").forEach((button) => {
    button.classList.toggle("active", button.dataset.langSwitch === lang);
  });

  document.querySelectorAll(".role-reel span").forEach((element, index) => {
    if (dictionary._roles?.[index]) element.textContent = dictionary._roles[index];
  });

  localStorage.setItem("portfolioLanguage", lang);
}

document.querySelectorAll("[data-lang-switch]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.langSwitch));
});

setLanguage(localStorage.getItem("portfolioLanguage") || "en");

runLoader();
resize();
updateScrollProgress();
draw();
