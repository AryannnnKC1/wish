const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const boot = $("#boot");
const app = $("#app");
let soundOn = false;
const hasGsap = typeof window.gsap !== "undefined";
if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const motion = {
  set(targets, vars) {
    return hasGsap ? gsap.set(targets, vars) : null;
  },
  to(targets, vars) {
    return hasGsap ? gsap.to(targets, vars) : null;
  },
};

const terminalLines = [
  "INITIALIZING TEMPORAL SCAN...",
  "VARIANT DETECTED: KRITIKA",
  "NEXUS EVENT: BIRTHDAY — CONFIRMED",
  "PREPARING CASE FILE...",
];
const terminalSpan = $("#terminal span");
let terminalLine = 0;
let terminalCharacter = 0;
let terminalTimer;
const typeTerminal = () => {
  if (terminalLine >= terminalLines.length) {
    $("#boot-button").classList.add("boot-button-ready");
    motion.to("#boot-button", { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" });
    return;
  }
  const line = terminalLines[terminalLine];
  terminalSpan.textContent += line[terminalCharacter] || "";
  terminalCharacter += 1;
  if (terminalCharacter > line.length) {
    terminalSpan.textContent += "\n";
    terminalLine += 1;
    terminalCharacter = 0;
    if (terminalLine >= terminalLines.length) {
      window.clearInterval(terminalTimer);
      $("#boot-button").classList.add("boot-button-ready");
      motion.to("#boot-button", { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" });
    }
  }
};
motion.set("#boot-button", { opacity: 0, y: 12 });
window.setTimeout(() => {
  terminalTimer = window.setInterval(typeTerminal, 34);
}, 450);

const beep = (frequency = 440, duration = 0.06) => {
  if (!soundOn) return;
  const audio = new AudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.04, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
};

const toast = (message) => {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  window.setTimeout(() => $("#toast").classList.remove("show"), 3000);
};

const showScene = (id) => {
  const current = $(".scene.active");
  const next = document.getElementById(id);
  if (!next || current === next) return;
  if (hasGsap) {
    gsap.timeline()
      .to(current, { x: -35, opacity: 0, duration: 0.22, ease: "power2.in" })
      .call(() => {
        current.classList.remove("active");
        next.classList.add("active");
        next.dataset.motionReady = "true";
        window.scrollTo({ top: 0, behavior: "instant" });
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      })
      .fromTo(next, { x: 45, opacity: 0, clipPath: "inset(0 0 0 100%)" }, { x: 0, opacity: 1, clipPath: "inset(0)", duration: 0.65, ease: "power2.out" })
      .fromTo(next.querySelectorAll(".scene-heading,.folder-card,.paper-form,.id-preview,.case-paper,.finding,.memory-node,.memory-display,.loki-visual"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.42, ease: "power2.out" }, "-=0.35");
  } else {
    $$(".scene").forEach((scene) => scene.classList.toggle("active", scene.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  beep(520, 0.08);
};

$("#boot-button").addEventListener("click", () => {
  document.body.classList.add("screen-shake");
  motion.to("#boot-button", { scale: 1.08, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 });
  if (hasGsap) {
    gsap.timeline()
      .to("#boot-button", { scale: 1.1, duration: 0.15, ease: "power2.out" })
      .to(boot, { yPercent: -100, opacity: 0, duration: 0.72, ease: "power2.inOut" })
      .set(boot, { display: "none" })
      .set(app, { display: "block", opacity: 0, scale: 1.03 })
      .to(app, { opacity: 1, scale: 1, duration: 0.72, ease: "power2.out" });
  } else {
    boot.classList.add("leave");
    app.classList.add("open");
    window.setTimeout(() => (boot.hidden = true), 850);
  }
  app.setAttribute("aria-hidden", "false");
  window.setTimeout(() => document.body.classList.remove("screen-shake"), 500);
  beep(660, 0.12);
});
$$("[data-scene]").forEach((button) => button.addEventListener("click", () => showScene(button.dataset.scene)));
$("#sound-toggle").addEventListener("click", () => {
  soundOn = !soundOn;
  $("#sound-toggle").textContent = `SOUND: ${soundOn ? "ON" : "OFF"}`;
  beep(660, 0.08);
});

const clock = () => {
  const date = new Date();
  $("#boot-clock").textContent = date.toLocaleTimeString("en-GB", { hour12: false });
  const seconds = date.getSeconds();
  const minutes = date.getMinutes() + seconds / 60;
  const hours = (date.getHours() % 12) + minutes / 60;
  motion.to(".clock-hand.second", { rotation: seconds * 6, duration: 0.35, ease: "power2.out" });
  motion.to(".clock-hand.minute", { rotation: minutes * 6, duration: 0.5, ease: "power2.out" });
  motion.to(".clock-hand.hour", { rotation: hours * 30, duration: 0.7, ease: "power2.out" });
};
clock();
window.setInterval(clock, 1000);

let cardUrl = "";
$("#intake-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const canvas = $("#id-card");
  const context = canvas.getContext("2d");
  context.fillStyle = "#11100e";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#f28a24";
  context.fillRect(0, 0, 18, canvas.height);
  context.fillStyle = "#f5ecd9";
  context.font = "500 18px 'DM Mono'";
  context.fillText("TIME VARIANCE AUTHORITY", 52, 48);
  context.font = "700 42px 'Space Grotesk'";
  context.fillText("OFFICIAL VARIANT ID", 52, 105);
  context.fillStyle = "#ffc95a";
  context.font = "700 62px 'Space Grotesk'";
  context.fillText(String(data.get("name")).toUpperCase(), 52, 190);
  context.fillStyle = "#b9b3a6";
  context.font = "16px 'DM Mono'";
  context.fillText(`DOB  ${data.get("dob") || "CLASSIFIED"}`, 52, 238);
  context.fillText(`ORIGIN  ${String(data.get("origin")).toUpperCase()}`, 52, 270);
  context.fillText("STATUS  IRREPLACEABLE / DO NOT PRUNE", 52, 302);
  context.strokeStyle = "#f28a24";
  context.strokeRect(50, 335, 620, 48);
  context.font = "14px 'DM Mono'";
  context.fillStyle = "#f28a24";
  context.fillText("REASON FOR VARIANCE", 65, 365);
  context.fillStyle = "#f5ecd9";
  context.font = "13px 'DM Mono'";
  context.fillText(String(data.get("reason")).slice(0, 72), 245, 365);
  cardUrl = canvas.toDataURL("image/png");
  $("#download-card").disabled = false;
  toast("Credential generated. Kritika is officially authorized to be celebrated.");
  beep(760, 0.15);
});
$("#download-card").addEventListener("click", () => {
  if (!cardUrl) return;
  const link = document.createElement("a");
  link.download = "kritika-tva-variant-id.png";
  link.href = cardUrl;
  link.click();
  toast("ID card downloaded from the TVA archives.");
});

$$(".finding").forEach((finding) => finding.addEventListener("click", () => {
  finding.classList.toggle("open");
  beep(390, 0.05);
}));
$("#prune-button").addEventListener("click", (event) => {
  $("#pruned-note").classList.add("stamped");
  toast("Bad days have been pruned from Kritika's timeline.");
  burst(event.clientX || innerWidth / 2, event.clientY || innerHeight / 2);
});

const memories = {
  start: ["THE BEGINNING", "The best plot twist was finding you.", "Somewhere in all the possible universes, ours crossed paths. I would choose that branch again and again.", "tvaalways.jpg"],
  laugh: ["THE LAUGHS", "You make ordinary moments legendary.", "The little jokes, the ridiculous conversations, the moments only we understand — those are the memories I keep closest.", "tvadocs_00006.jpg"],
  today: ["RIGHT NOW", "This is the branch I want to stay in.", "Today, the TVA has one official finding: you are loved more than words, timelines, or universes can measure.", "fa187a7e2433be05742354565ef06711.jpg"],
  future: ["ALL FUTURE VARIANTS", "More birthdays. More adventures. Still us.", "Whatever the future looks like, I hope I get to keep discovering it beside you. Happy birthday, my favorite person.", "loki-miss.gif"],
};
$$(".memory-node").forEach((node) => node.addEventListener("click", () => {
  const memory = memories[node.dataset.memory];
  $$(".memory-node").forEach((item) => item.classList.remove("active"));
  node.classList.add("active");
  $("#memory-label").textContent = memory[0];
  $("#memory-title").textContent = memory[1];
  $("#memory-copy").textContent = memory[2];
  $("#memory-display img").src = memory[3];
  beep(500, 0.08);
}));

const verdicts = [
  "Loki says: “Kritika, you are the plot twist even I could not predict — and the best one in every story.”",
  "Loki says: “I searched every branch. There is no better variant of you. Happy birthday.”",
  "Loki says: “You do not need a crown to be royalty. The room changes when you enter it.”",
];
let verdict = 0;
$("#loki-verdict").addEventListener("click", () => {
  $("#loki-copy").textContent = verdicts[verdict];
  verdict = (verdict + 1) % verdicts.length;
  toast("Loki has issued a new official verdict.");
  burst(innerWidth * 0.75, innerHeight * 0.5);
});

const cameoMessages = ["Miss Minutes says: Kritika, you are the sweetest variance in the whole TVA!", "Reminder: birthday girl gets cake. This is official TVA policy.", "Loki requested that I say: you are absolutely glorious. He was very dramatic about it."];
let cameo = 0;
$("#miss-cameo").addEventListener("click", () => {
  $("#cameo-message").textContent = cameoMessages[cameo];
  $("#cameo-message").classList.add("show");
  cameo = (cameo + 1) % cameoMessages.length;
  window.setTimeout(() => $("#cameo-message").classList.remove("show"), 4500);
  burst(innerWidth - 100, innerHeight - 100);
});

const burst = (x, y) => {
  for (let i = 0; i < 18; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.textContent = i % 2 ? "✦" : "♥";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--x", `${Math.random() * 240 - 120}px`);
    particle.style.setProperty("--y", `${Math.random() * -220 - 20}px`);
    $("#confetti").appendChild(particle);
    window.setTimeout(() => particle.remove(), 1500);
  }
};

$("#secret-tab").addEventListener("click", () => {
  showScene("finale");
  toast("NEXUS EVENT DETECTED. Kritika has unlocked the secret ending.");
  burst(innerWidth / 2, innerHeight / 2);
});
$("#replay").addEventListener("click", () => {
  showScene("hub");
  toast("Transmission reset. The TVA is ready for another birthday adventure.");
});

if (hasGsap) {
  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / innerWidth - 0.5) * 2;
    const y = (event.clientY / innerHeight - 0.5) * 2;
    gsap.to(".timeline-bg", { x: x * 12, y: y * 8, duration: 1.2, ease: "power2.out" });
    gsap.to(".boot-logo,.analog-clock", { x: x * 4, y: y * 3, duration: 1, ease: "power2.out" });
  });

  $$(".stamp-button,.folder-card,.finding,.memory-node,.download-button,.miss-cameo").forEach((button) => {
    button.addEventListener("mouseenter", () => gsap.to(button, { scale: 1.035, duration: 0.18, ease: "power2.out" }));
    button.addEventListener("mouseleave", () => gsap.to(button, { scale: 1, duration: 0.24, ease: "power2.out" }));
  });

  const revealOnScroll = (selector) => {
    if (!window.ScrollTrigger) return;
    gsap.utils.toArray(selector).forEach((element) => {
      gsap.fromTo(element, { y: 28, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 82%", once: true },
      });
    });
  };
  revealOnScroll("#case .case-paper, #case .finding");
  revealOnScroll("#timeline .memory-node, #timeline .memory-display");
}
