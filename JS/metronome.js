// metronome.js
(function () {
    // ---------- DOM ----------
    const timeSig = document.getElementById("timeSig");
    const accentMode = document.getElementById("accentMode");
  
    const bpmRange = document.getElementById("bpmRange");
    const bpmLabel = document.getElementById("bpmLabel");
    const bpmInput = document.getElementById("bpmInput");
  
    const volRange = document.getElementById("volRange");
    const volLabel = document.getElementById("volLabel");
  
    const toggleBtn = document.getElementById("toggleBtn");
    const tapBtn = document.getElementById("tapBtn");
    const resetBtn = document.getElementById("resetBtn");
  
    const chips = document.getElementById("chips");
    const sigPill = document.getElementById("sigPill");
    const modePill = document.getElementById("modePill");
    const subPill = document.getElementById("subPill");
    const tempoNote = document.getElementById("tempoNote");
  
    // ---------- AUDIO ----------
    let audioCtx = null;
    function ensureAudio() {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtx = new Ctx();
      }
      return audioCtx;
    }
  
    // click tone
    function click(kind, volume01) {
      const ctx = ensureAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
  
      // tone map
      const freq =
        kind === "strong" ? 1300 : kind === "weak" ? 950 : 820;
  
      // amp map
      const base =
        kind === "strong" ? 0.28 : kind === "weak" ? 0.16 : 0.20;
  
      const amp = base * Math.max(0, Math.min(1, volume01));
  
      osc.type = "square";
      osc.frequency.value = freq;
  
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, amp), now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
  
      osc.connect(gain);
      gain.connect(ctx.destination);
  
      osc.start(now);
      osc.stop(now + 0.04);
    }
  
    // ---------- STATE ----------
    let bpm = 80;
    let volume01 = 0.7;
  
    // timer
    let timerId = null;
    let isPlaying = false;
  
    // step model:
    // - For 2/4,3/4,4/4: one bar = N steps, each step is a quarter note
    // - For 6/8: one bar = 6 steps (triplets), but "beat" shown as 1..2 with sub 1..3
    let sig = "4/4";
    let stepsPerBar = 4;
    let stepIndex = 0; // 0..stepsPerBar-1
  
    // tap tempo
    let tapTimes = [];
  
    function getConfig(signature) {
      if (signature === "6/8") {
        // 2 beats dotted-quarter; each beat has 3 subdivisions => 6 steps total
        return {
          sigPill: "6/8",
          mode: "Dotted-quarter beats (2)",
          sub: "Triplet subdivision (3/beat)",
          stepsPerBar: 6,
          // interval per step: dotted-quarter beat duration / 3
          // dotted-quarter = 3 eighths = 1.5 quarter
          // but we base bpm as "dotted-quarter BPM" for 6/8 (common practice)
          // => one beat duration = 60/bpm, each step = (60/bpm)/3
          msPerStep: (bpmNow) => (60000 / bpmNow) / 2,
          labelForStep: (i) => {
            // i: 0..5 => "1", "trip", "let", "2", "trip", "let"
            const map = ["1", "tri", "let", "2", "tri", "let"];
            return map[i] || String(i + 1);
          },
          kindForStep: (i, accent) => {
            // strong on first step of beat 1
            // weak on first step of beat 2
            // normal on other triplet parts
            if (accent === "none") return "normal";
            if (accent === "soft") {
              if (i === 0) return "strong";
              if (i === 3) return "normal";
              return "normal";
            }
            // classic
            if (i === 0) return "strong";
            if (i === 3) return "weak";
            return "normal";
          },
          tempoNote: "BPM đang tính theo ♩. (dotted quarter) cho 6/8",
        };
      }
  
      // default: x/4 quarter-note steps
      const top = Number(String(signature).split("/")[0]) || 4;
  
      return {
        sigPill: signature,
        mode: "Quarter notes",
        sub: "—",
        stepsPerBar: top,
        msPerStep: (bpmNow) => 60000 / bpmNow,
        labelForStep: (i) => String(i + 1),
        kindForStep: (i, accent) => {
          if (accent === "none") return "normal";
          if (accent === "soft") return i === 0 ? "weak" : "normal";
          return i === 0 ? "strong" : "normal";
        },
        tempoNote: "",
      };
    }
  
    function clearTimer() {
      if (timerId) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }
  
    function setUiPlaying(playing) {
        if (!toggleBtn) return;
      
        if (playing) {
          toggleBtn.innerHTML = `<i class="fa-solid fa-stop"></i> Stop`;
          toggleBtn.classList.remove("btnPrimary");
          toggleBtn.classList.add("btnDanger");
        } else {
          toggleBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
          toggleBtn.classList.remove("btnDanger");
          toggleBtn.classList.add("btnPrimary");
        }
      }
  
    function renderChips(cfg) {
      chips.innerHTML = "";
      for (let i = 0; i < cfg.stepsPerBar; i++) {
        const el = document.createElement("div");
        el.className = "chipBeat" + (i === stepIndex ? " active" : "");
        el.textContent = cfg.labelForStep(i);
        chips.appendChild(el);
      }
    }
  
    function renderMeta(cfg) {
      sigPill.textContent = cfg.sigPill;
      modePill.textContent = cfg.mode;
      subPill.textContent = cfg.sub;
      tempoNote.textContent = cfg.tempoNote ? `• ${cfg.tempoNote}` : "";
    }
  
    function tick() {
      const cfg = getConfig(sig);
      const accent = accentMode.value;
  
      // play click for current step
      const kind = cfg.kindForStep(stepIndex, accent);
      click(kind, volume01);
  
      // update UI
      renderMeta(cfg);
      renderChips(cfg);
  
      // next step
      stepIndex = (stepIndex + 1) % cfg.stepsPerBar;
    }
  
    async function start() {
      const ctx = ensureAudio();
      if (ctx.state === "suspended") await ctx.resume();
  
      clearTimer();
      isPlaying = true;
      setUiPlaying(true);
  
      stepIndex = 0;
      tick(); // immediate click
  
      const cfg = getConfig(sig);
      timerId = window.setInterval(() => tick(), cfg.msPerStep(bpm));
    }
  
    function stop() {
      clearTimer();
      isPlaying = false;
      setUiPlaying(false);
  
      stepIndex = 0;
      const cfg = getConfig(sig);
      renderMeta(cfg);
      renderChips(cfg);
    }
  
    function restartIfPlaying() {
      if (!isPlaying) {
        const cfg = getConfig(sig);
        renderMeta(cfg);
        renderChips(cfg);
        return;
      }
      // restart timer with new interval
      clearTimer();
      const cfg = getConfig(sig);
      timerId = window.setInterval(() => tick(), cfg.msPerStep(bpm));
    }
  
    function setBpm(next) {
      const n = Math.max(30, Math.min(240, Number(next || 80)));
      bpm = n;
      bpmLabel.textContent = String(n);
      bpmRange.value = String(n);
      bpmInput.value = String(n);
      restartIfPlaying();
    }
  
    function setVolume(nextPct) {
      const p = Math.max(0, Math.min(100, Number(nextPct || 70)));
      volLabel.textContent = String(p);
      volRange.value = String(p);
      volume01 = p / 100;
    }
  
    function onChangeSig(nextSig) {
      sig = nextSig;
      stepIndex = 0;
      restartIfPlaying();
    }
  
    // ---------- TAP TEMPO ----------
    function tap() {
      const now = performance.now();
      tapTimes.push(now);
  
      // keep last 8 taps
      if (tapTimes.length > 8) tapTimes.shift();
  
      if (tapTimes.length < 2) return;
  
      // average interval
      const intervals = [];
      for (let i = 1; i < tapTimes.length; i++) {
        intervals.push(tapTimes[i] - tapTimes[i - 1]);
      }
  
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (!avgMs || avgMs < 120 || avgMs > 2000) return;
  
      const estBpm = Math.round(60000 / avgMs);
      setBpm(estBpm);
    }
  
    function resetAll() {
      tapTimes = [];
      accentMode.value = "classic";
      timeSig.value = "4/4";
      onChangeSig("4/4");
      setBpm(80);
      setVolume(70);
    }
  
    // ---------- Wire up ----------
    timeSig.addEventListener("change", (e) => onChangeSig(e.target.value));
    accentMode.addEventListener("change", () => restartIfPlaying());
  
    bpmRange.addEventListener("input", (e) => setBpm(e.target.value));
    bpmInput.addEventListener("input", (e) => setBpm(e.target.value));
  
    volRange.addEventListener("input", (e) => setVolume(e.target.value));
  
    toggleBtn.addEventListener("click", async () => {
        if (isPlaying) {
          stop();
        } else {
          await start();
        }
      });
  
    tapBtn.addEventListener("click", tap);
    resetBtn.addEventListener("click", resetAll);
  
    // initial render
    setBpm(80);
    setVolume(70);
    onChangeSig("4/4");
    setUiPlaying(false);
  })();