/* فكّر — بيانات مشتركة: المستويات، الألعاب، الملف الشخصي، التقدم، مؤثرات الاحتفال */

const FAKKER_LEVELS = [
  { id: 1, grade: "الصف الأول الابتدائي", short: "أول ابتدائي", color: "var(--level-1)", soft: "var(--level-1-soft)", emoji: "🟢", icon: "🎈", stage: "المرحلة ١" },
  { id: 2, grade: "الصف الثاني والثالث الابتدائي", short: "ثاني وثالث", color: "var(--level-2)", soft: "var(--level-2-soft)", emoji: "🔵", icon: "📚", stage: "المرحلة ٢" },
  { id: 3, grade: "الصف الرابع والخامس والسادس", short: "رابع إلى سادس", color: "var(--level-3)", soft: "var(--level-3-soft)", emoji: "🟣", icon: "🔬", stage: "المرحلة ٣" },
  { id: 4, grade: "المرحلة المتوسطة", short: "متوسط", color: "var(--level-4)", soft: "var(--level-4-soft)", emoji: "🟠", icon: "💡", stage: "المرحلة ٤" },
  { id: 5, grade: "المرحلة الثانوية", short: "ثانوي", color: "var(--level-5)", soft: "var(--level-5-soft)", emoji: "🔴", icon: "🎓", stage: "المرحلة ٥" },
];

const FAKKER_GAMES = [
  { id: "memory", name: "لعبة الذاكرة", emoji: "🧠", file: "games/memory.html", desc: "قلّب البطاقات ولاقِ الأزواج" },
  { id: "xo", name: "إكس أو", emoji: "⭕", file: "games/xo.html", desc: "تحدَّ الحاسوب أو صديقك" },
  { id: "sudoku", name: "سودوكو", emoji: "🔢", file: "games/sudoku.html", desc: "رتّب الأرقام بلا تكرار" },
  { id: "logic", name: "ألغاز التفكير", emoji: "🧩", file: "games/logic.html", desc: "أنماط واستنتاج وتحدّي ذهني" },
  { id: "fasihoon", name: "فصحون", emoji: "📖", file: "games/fasihoon.html", desc: "مع الأستاذ فصيح: حروف وكلمات وجُمل وقدرات لغوية" },
  { id: "battle", name: "ساحة الأبطال", emoji: "⚔️", file: "games/battle.html", desc: "بارز الوحش! كل إجابة صحيحة ضربة قوية" },
  { id: "abaqreeno", name: "عبقرينو", emoji: "➕", external: true, src: "https://zaytoon304.github.io/abaqreeno/", desc: "حلّ المسائل الحسابية بسرعة — اللعبة الأصلية" },
  { id: "number-journey", name: "رحلة الأرقام", emoji: "🚀", external: true, src: "https://zaytoon304.github.io/number-journey/", desc: "تنمية الحساب الذهني برحلة تفاعلية" },
  { id: "math-puzzle", name: "بازل رياضي", emoji: "🧩", external: true, src: "https://zaytoon304.github.io/math-puzzle/puzzle.html", desc: "حل المسائل واسحب الإجابة لتكمل الصورة" },
  { id: "arqam-math-grid", name: "شبكة الحساب", emoji: "🕸️", external: true, src: "https://zaytoon304.github.io/arqam-math-grid/", desc: "ألغاز الضرب والقسمة على شكل شبكة" },
  { id: "mental-math-flash", name: "الحساب الذهني", emoji: "⚡", external: true, src: "https://zaytoon304.github.io/mental-math-flash/", desc: "بطاقات سريعة لتقوية الحساب الذهني" },
];

const Fakker = {};

Fakker.Profile = {
  KEY: "fakker_profile",
  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)); } catch (e) { return null; }
  },
  save(profile) { localStorage.setItem(this.KEY, JSON.stringify(profile)); },
  create(name, avatar) {
    const profile = {
      id: "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      avatar: avatar || "🦊",
      createdAt: Date.now(),
    };
    this.save(profile);
    return profile;
  },
  clear() { localStorage.removeItem(this.KEY); },
};

Fakker.Progress = {
  db: null,
  init() {
    if (typeof fakkerInitFirebase === "function") this.db = fakkerInitFirebase();
  },
  KEY: "fakker_progress",
  _all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { return {}; }
  },
  _save(all) {
    localStorage.setItem(this.KEY, JSON.stringify(all));
    const profile = Fakker.Profile.get();
    if (this.db && profile) {
      this.db.ref("students/" + profile.id).set({
        name: profile.name,
        avatar: profile.avatar,
        updatedAt: Date.now(),
        progress: all,
      }).catch((e) => console.warn("فكّر: تعذّر الحفظ على Firebase", e));
    }
  },
  record(gameId, levelId, opts) {
    opts = opts || {};
    const stars = opts.stars || 0;
    const score = opts.score || 0;
    const all = this._all();
    const key = gameId + "_" + levelId;
    const prev = all[key] || { bestStars: 0, bestScore: 0, plays: 0 };
    all[key] = {
      bestStars: Math.max(prev.bestStars, stars),
      bestScore: Math.max(prev.bestScore, score),
      plays: prev.plays + 1,
      lastPlayed: Date.now(),
    };
    this._save(all);
    return all[key];
  },
  get(gameId, levelId) {
    const all = this._all();
    return all[gameId + "_" + levelId] || { bestStars: 0, bestScore: 0, plays: 0 };
  },
  totalStars() {
    const all = this._all();
    return Object.values(all).reduce((sum, v) => sum + (v.bestStars || 0), 0);
  },
  allForGame(gameId) {
    const all = this._all();
    const out = {};
    FAKKER_LEVELS.forEach((lv) => {
      out[lv.id] = all[gameId + "_" + lv.id] || { bestStars: 0, bestScore: 0, plays: 0 };
    });
    return out;
  },
};

// بوابة حصة الانتظار — تُطلب مرة كل جلسة متصفح (بورد مشترك بين فصول مختلفة طول اليوم)
Fakker.CheckIns = {
  LOG_KEY: "fakker_checkins",
  SESSION_FLAG: "fakker_checkin_active",
  SESSION_INFO: "fakker_checkin_info",
  isCheckedIn() { return sessionStorage.getItem(this.SESSION_FLAG) === "1"; },
  currentSession() {
    try { return JSON.parse(sessionStorage.getItem(this.SESSION_INFO)); } catch (e) { return null; }
  },
  log(className, period, note) {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(this.LOG_KEY)) || []; } catch (e) { list = []; }
    list.push({ className, period, note, ts: Date.now() });
    if (list.length > 300) list = list.slice(-300);
    localStorage.setItem(this.LOG_KEY, JSON.stringify(list));
    sessionStorage.setItem(this.SESSION_FLAG, "1");
    sessionStorage.setItem(this.SESSION_INFO, JSON.stringify({ className, period, note }));
  },
  list(limit) {
    let all = [];
    try { all = JSON.parse(localStorage.getItem(this.LOG_KEY)) || []; } catch (e) { all = []; }
    return all.slice(-(limit || 100)).reverse();
  },
  endSession() { sessionStorage.removeItem(this.SESSION_FLAG); sessionStorage.removeItem(this.SESSION_INFO); },
};

// تحدي اليوم — ستريك يومي بأسلوب Wordle/Duolingo (يعمل بمعزل عن نجوم الألعاب)
Fakker.Daily = {
  KEY: "fakker_daily",
  _state() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || { lastDate: null, streak: 0, freezes: 1, history: {} };
    } catch (e) {
      return { lastDate: null, streak: 0, freezes: 1, history: {} };
    }
  },
  _save(s) { localStorage.setItem(this.KEY, JSON.stringify(s)); },
  todayStr() { return new Date().toISOString().slice(0, 10); },
  yesterdayStr() { return new Date(Date.now() - 86400000).toISOString().slice(0, 10); },
  isCompletedToday() { return this._state().lastDate === this.todayStr(); },
  getStreak() { return this._state().streak; },
  getFreezes() { return this._state().freezes; },
  last7Days() {
    const s = this._state();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, done: !!(s.history[key] && s.history[key].completed) });
    }
    return days;
  },
  // يختار سؤال اليوم بشكل ثابت لنفس اليوم بالاعتماد على تاريخ اليوم كبذرة عشوائية
  pickIndex(poolLength) {
    const str = this.todayStr();
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    return hash % poolLength;
  },
  complete(correct) {
    const s = this._state();
    const today = this.todayStr();
    if (s.lastDate === today) return s; // اليوم مُسجَّل من قبل
    if (s.lastDate === this.yesterdayStr()) {
      s.streak += 1;
    } else if (s.lastDate === null) {
      s.streak = 1;
    } else if (s.freezes > 0) {
      s.freezes -= 1; s.streak += 1; // حماية الستريك تغطي يوم فائت
    } else {
      s.streak = 1;
    }
    if (s.streak > 0 && s.streak % 7 === 0) s.freezes += 1; // مكافأة أسبوع متواصل
    s.lastDate = today;
    s.history[today] = { completed: true, correct };
    this._save(s);
    return s;
  },
};

// إعدادات إتاحة: كتم الصوت وتقليل الحركة (يحترمها كل مكان بالمنصة)
Fakker.Settings = {
  KEY: "fakker_settings",
  _state() {
    try { return Object.assign({ sound: true, reduceMotion: false }, JSON.parse(localStorage.getItem(this.KEY)) || {}); }
    catch (e) { return { sound: true, reduceMotion: false }; }
  },
  _save(s) { localStorage.setItem(this.KEY, JSON.stringify(s)); },
  get() { return this._state(); },
  setSound(on) { const s = this._state(); s.sound = on; this._save(s); },
  setReduceMotion(on) { const s = this._state(); s.reduceMotion = on; this._save(s); },
};

// يضيف زر إعدادات صغير (⚙️) لأي شريط علوي — نداء واحد من كل صفحة لعبة
Fakker.mountSettingsToggle = function (containerSelector) {
  const host = document.querySelector(containerSelector || ".topbar");
  if (!host || document.getElementById("fk-settings-btn")) return;
  const wrap = document.createElement("div");
  wrap.style.position = "relative";
  const btn = document.createElement("div");
  btn.id = "fk-settings-btn";
  btn.className = "icon-btn";
  btn.textContent = "⚙️";
  const panel = document.createElement("div");
  panel.style.cssText = "position:absolute;top:52px;left:0;background:var(--card-bg);border-radius:14px;box-shadow:0 8px 20px var(--shadow);padding:12px;min-width:180px;display:none;z-index:80;font-size:14px;";
  function renderPanel() {
    const s = Fakker.Settings.get();
    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0;cursor:pointer;" id="fk-toggle-sound">
        <span>${s.sound ? "🔊" : "🔇"} الأصوات</span><span>${s.sound ? "تشغيل" : "مكتوم"}</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0;cursor:pointer;" id="fk-toggle-motion">
        <span>${s.reduceMotion ? "⏸️" : "🎬"} الحركة</span><span>${s.reduceMotion ? "مخفّضة" : "كاملة"}</span>
      </div>`;
    panel.querySelector("#fk-toggle-sound").onclick = () => { Fakker.Settings.setSound(!Fakker.Settings.get().sound); renderPanel(); };
    panel.querySelector("#fk-toggle-motion").onclick = () => { Fakker.Settings.setReduceMotion(!Fakker.Settings.get().reduceMotion); renderPanel(); };
  }
  renderPanel();
  btn.onclick = (e) => { e.stopPropagation(); panel.style.display = panel.style.display === "none" ? "block" : "none"; };
  document.addEventListener("click", () => { panel.style.display = "none"; });
  wrap.appendChild(btn); wrap.appendChild(panel);
  host.appendChild(wrap);
};

Fakker.FX = {
  messages: ["أحسنت!", "رائع!", "ممتاز!", "عبقري!", "شغل نظيف!", "استمر كذا!", "مبدع!"],
  encourage: ["حاول مرة ثانية!", "قريب جداً، كمّل!", "لا بأس، المرة الجاية أفضل!"],

  randomPraise() { return this.messages[Math.floor(Math.random() * this.messages.length)]; },
  randomEncourage() { return this.encourage[Math.floor(Math.random() * this.encourage.length)]; },

  confetti(container, count) {
    if (Fakker.Settings.get().reduceMotion) return;
    container = container || document.body;
    count = count || 40;
    const colors = ["#f97316", "#22c55e", "#3b82f6", "#a855f7", "#ef4444", "#eab308"];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      const size = 6 + Math.random() * 6;
      piece.style.width = size + "px";
      piece.style.height = size * 0.6 + "px";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      piece.style.animationDelay = Math.random() * 0.3 + "s";
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 3200);
    }
  },

  _ctx: null,
  _getCtx() {
    if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this._ctx;
  },
  playTone(freqs, duration) {
    if (!Fakker.Settings.get().sound) return;
    freqs = freqs || [660];
    duration = duration || 0.12;
    try {
      const ctx = this._getCtx();
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const start = ctx.currentTime + i * duration;
        osc.start(start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.stop(start + duration + 0.02);
      });
    } catch (e) { /* المتصفح ما يدعم الصوت، تجاهل بهدوء */ }
  },
  success() { this.playTone([523, 659, 784], 0.11); },
  wrong() { this.playTone([220], 0.15); },
  win() { this.playTone([523, 659, 784, 1046], 0.13); },
};

Fakker.Progress.init();
