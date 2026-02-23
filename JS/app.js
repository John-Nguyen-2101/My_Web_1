// app.js
/**
 * Static HTML/CSS/JS version of your React page
 * - Metronome (WebAudio)
 * - Count-in 1 bar
 * - Beat chips
 * - 2-lane grid (chord row + lyric row) with perfect column alignment
 */

// ------------------------ DATA ------------------------
const demoSong = {
    title: "Ngày xuân long phụng sum vầy",
    author: "Quang Huy",
    style: "Ballad (demo nhiều nhịp)",
    recommendedTempo: "60–80 BPM (mới tập), 80–96 BPM (chuẩn hơn)",
    bpm: 80,
    timeSigTop: 2, // 2 | 3 | 4 | 6
    timeSigBottom: 4, // 4 | 8
    meterMode: "simple", // "simple" | "sixEighth-eighth" | "sixEighth-dottedQuarter"
    lines: [
      { section: "ĐIỆP KHÚC", id: "section1" },
  
      {
        tokens: [
          { lyric: "Mừng", chord: "C", beatIndex: 1 },
          { lyric: "tết", chord: null, beatIndex: 1 },
          { lyric: "đến", chord: "2", beatIndex: 2 },
          { lyric: "mang", chord: null, beatIndex: 2 },
          { lyric: "lộc", chord: null, beatIndex: 2 },
        ],
      },
      {
        tokens: [
          { lyric: "đến", chord: "G", beatIndex: 1 },
          { lyric: "nhà", chord: null, beatIndex: 1 },
          { lyric: "nhà", chord: "2", beatIndex: 2 },
          { lyric: "cánh", chord: null, beatIndex: 2 },
          { lyric: "mai", chord: null, beatIndex: 2 },
        ],
      },
      {
        tokens: [
          { lyric: "vàng", chord: "Am", beatIndex: 1 },
          { lyric: "cành", chord: null, beatIndex: 1 },
          { lyric: "đào", chord: null, beatIndex: 1 },
          { lyric: "hồng", chord: "2", beatIndex: 2 },
          { lyric: "thắm", chord: null, beatIndex: 2 },
        ],
      },
      { tokens: [{ lyric: "tươi", chord: "Em", beatIndex: 1 }, { lyric: "", chord: "2", beatIndex: 2 }] },
  
      {
        tokens: [
          { lyric: "Chúc", chord: "F", beatIndex: 1 },
          { lyric: "cụ", chord: null, beatIndex: 1 },
          { lyric: "già", chord: "2", beatIndex: 2 },
          { lyric: "được", chord: null, beatIndex: 2 },
          { lyric: "sống", chord: null, beatIndex: 2 },
        ],
      },
      {
        tokens: [
          { lyric: "lâu", chord: "C", beatIndex: 1 },
          { lyric: "sống", chord: null, beatIndex: 1 },
          { lyric: "khỏe", chord: "2", beatIndex: 2 },
          { lyric: "cùng", chord: null, beatIndex: 2 },
          { lyric: "con", chord: null, beatIndex: 2 },
        ],
      },
      {
        tokens: [
          { lyric: "Cháu", chord: "F", beatIndex: 1 },
          { lyric: "sang", chord: null, beatIndex: 1 },
          { lyric: "năm", chord: "2", beatIndex: 2 },
          { lyric: "lại", chord: null, beatIndex: 2 },
        ],
      },
      { tokens: [{ lyric: "đón", chord: "G", beatIndex: 1 }, { lyric: "tết", chord: null, beatIndex: 1 }, { lyric: "sang", chord: "2", beatIndex: 2 }] },
  
      {
        tokens: [
          { lyric: "Và", chord: "C", beatIndex: 1 },
          { lyric: "kính", chord: null, beatIndex: 1 },
          { lyric: "chúc", chord: "2", beatIndex: 2 },
          { lyric: "người", chord: null, beatIndex: 2 },
          { lyric: "người", chord: null, beatIndex: 2 },
        ],
      },
      {
        tokens: [
          { lyric: "sẽ", chord: "G", beatIndex: 1 },
          { lyric: "gặp", chord: null, beatIndex: 1 },
          { lyric: "lành", chord: "2", beatIndex: 2 },
          { lyric: "tết", chord: null, beatIndex: 2 },
          { lyric: "sau", chord: null, beatIndex: 2 },
        ],
      },
      { tokens: [{ lyric: "được", chord: "Am", beatIndex: 1 }, { lyric: "nhiều", chord: null, beatIndex: 1 }, { lyric: "lộc", chord: null, beatIndex: 1 }, { lyric: "hơn", chord: "2", beatIndex: 2 }] },
      { tokens: [{ lyric: "tết", chord: null, beatIndex: 2 }, { lyric: "nay", chord: "Em", beatIndex: 1 }, { lyric: "", chord: "2", beatIndex: 2 }] },
  
      { tokens: [{ lyric: "tết", chord: "F", beatIndex: 1 }, { lyric: "đến", chord: null, beatIndex: 1 }, { lyric: "đoàn", chord: null, beatIndex: 1 }, { lyric: "tụ", chord: "2", beatIndex: 2 }, { lyric: "cùng", chord: null, beatIndex: 2 }] },
      { tokens: [{ lyric: "ở", chord: null, beatIndex: 2 }, { lyric: "bên", chord: "C", beatIndex: 1 }, { lyric: "bếp", chord: null, beatIndex: 1 }, { lyric: "hồng", chord: "2", beatIndex: 2 }, { lyric: "và", chord: null, beatIndex: 2 }] },
      { tokens: [{ lyric: "nồi", chord: null, beatIndex: 2 }, { lyric: "bánh", chord: "F", beatIndex: 1 }, { lyric: "chưng", chord: null, beatIndex: 1 }, { lyric: "xanh", chord: "2", beatIndex: 2 }] },
      { tokens: [{ lyric: "chờ", chord: null, beatIndex: 2 }, { lyric: "xuân", chord: "F", beatIndex: 1 }, { lyric: "đang", chord: null, beatIndex: 1 }, { lyric: "sang", chord: "2", beatIndex: 2 }] },
  
      { section: "VERSE", id: "verse" },
  
      { tokens: [{ lyric: "Cánh", chord: "C", beatIndex: 1 }, { lyric: "én", chord: null, beatIndex: 1 }, { lyric: "nơi", chord: "2", beatIndex: 2 }, { lyric: "nơi", chord: null, beatIndex: 2 }, { lyric: "khắp", chord: null, beatIndex: 2 }] },
      { tokens: [{ lyric: "phố", chord: "G", beatIndex: 1 }, { lyric: "phường", chord: null, beatIndex: 1 }, { lyric: "nhà", chord: "2", beatIndex: 2 }, { lyric: "nhà", chord: null, beatIndex: 2 }] },
    ],
  };
  
  // ------------------------ METER ------------------------
  function getMeterConfig(song) {
    if (song.timeSigTop === 6 && song.timeSigBottom === 8) {
      if (song.meterMode === "sixEighth-dottedQuarter") {
        return { beatsPerBar: 2, accentStrong: [1], accentWeak: [2], timeSigLabel: "6/8 (đếm 2 phách ♩.)" };
      }
      return { beatsPerBar: 6, accentStrong: [1], accentWeak: [4], timeSigLabel: "6/8 (đếm 6 phách ♪)" };
    }
    return { beatsPerBar: song.timeSigTop, accentStrong: [1], accentWeak: [], timeSigLabel: `${song.timeSigTop}/${song.timeSigBottom}` };
  }
  
  // ------------------------ AUDIO ------------------------
  let audioCtx = null;
  function ensureAudioContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    return audioCtx;
  }
  
  function click(level) {
    const ctx = ensureAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
  
    osc.type = "square";
    const freq = level === "strong" ? 1200 : level === "weak" ? 900 : 800;
    const amp = level === "strong" ? 0.25 : level === "weak" ? 0.12 : 0.18;
    osc.frequency.value = freq;
  
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(amp, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
  
    osc.connect(gain);
    gain.connect(ctx.destination);
  
    osc.start(now);
    osc.stop(now + 0.035);
  }
  
  // ------------------------ STATE ------------------------
  const meter = getMeterConfig(demoSong);
  const beatsPerBar = meter.beatsPerBar;
  
  let bpm = demoSong.bpm;
  let isPlaying = false;
  let phase = "idle"; // "idle" | "countin" | "play"
  let countIn = null;
  
  let beat = 1; // 1..beatsPerBar
  let activeLine = 0;
  
  let timerId = null;
  
  let phaseRef = "idle";
  let remainingRef = 0;
  let currentBeatRef = 1;
  
  const tokenLineIndexes = demoSong.lines
    .map((l, i) => (l.tokens ? i : -1))
    .filter((i) => i !== -1);
  
  let posRef = 0;
  
  // ------------------------ DOM ------------------------
  const elTitle = document.getElementById("songTitle");
  const elAuthor = document.getElementById("songAuthor");
  const elStyle = document.getElementById("songStyle");
  const elTimeSig = document.getElementById("songTimeSig");
  const elTempoHint = document.getElementById("songTempoHint");
  const elBpmNow = document.getElementById("songBpmNow");
  
  const elBeatBox = document.getElementById("beatBox");
  const elSongRoot = document.getElementById("songRoot");
  
  const btnPlay = document.getElementById("btnPlay");
  const btnStop = document.getElementById("btnStop");
  
  const bpmRange = document.getElementById("bpmRange");
  const bpmLabel = document.getElementById("bpmLabel");
  
  // ------------------------ RENDER HELPERS ------------------------
  function beatClickLevel(b) {
    if (meter.accentStrong.includes(b)) return "strong";
    if (meter.accentWeak.includes(b)) return "weak";
    return "normal";
  }
  
  function nextBeat(b) {
    return b >= beatsPerBar ? 1 : b + 1;
  }
  
  function clearTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }
  
  function setPlayUi(playing) {
    btnPlay.disabled = playing;
    btnStop.disabled = !playing;
  }
  
  function renderMeta() {
    elTitle.textContent = demoSong.title;
    elAuthor.textContent = `👤 ${demoSong.author}`;
    elStyle.textContent = `🎼 ${demoSong.style}`;
    elTimeSig.textContent = `🕒 Nhịp: ${meter.timeSigLabel}`;
    elTempoHint.textContent = `✅ Tempo gợi ý: ${demoSong.recommendedTempo}`;
    elBpmNow.textContent = `⏱ Đang tập: ${bpm} BPM`;
  
    bpmRange.value = String(bpm);
    bpmLabel.textContent = String(bpm);
  }
  
  function renderBeatChips() {
    elBeatBox.innerHTML = "";
    for (let i = 1; i <= beatsPerBar; i++) {
      const chip = document.createElement("span");
      chip.className = "beatChip" + (beat === i ? " active" : "");
      chip.textContent = String(i);
      elBeatBox.appendChild(chip);
    }
  }
  
  function makeSectionNode(sectionLine) {
    const wrap = document.createElement("div");
    wrap.className = "sectionWrapper";
  
    const title = document.createElement("div");
    title.className = "sectionTitle";
    title.textContent = sectionLine.section;
  
    wrap.appendChild(title);
  
    if (phase === "countin" && countIn !== null && sectionLine.id === "section1") {
      const ci = document.createElement("div");
      ci.className = "sectionCountIn";
      ci.textContent = String(countIn);
      wrap.appendChild(ci);
    }
  
    return wrap;
  }
  
  function makeLineGridNode(tokens, lineIdx) {
    const grid = document.createElement("div");
    grid.className = "lineGrid";
    const cols = tokens.length;
  
    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(44px, 1fr))`;
    if (isPlaying && lineIdx !== activeLine) grid.style.opacity = "0.9";
  
    // Row 1: chords
    tokens.forEach((t) => {
      const cell = document.createElement("div");
      cell.className = "gridCell chordCell";
  
      const hasChord = !!t.chord;
      const isCurrentLine = lineIdx === activeLine;
      const chordBeatActive =
        isPlaying && phase !== "countin" && isCurrentLine && hasChord && t.beatIndex === beat;
  
      if (chordBeatActive) cell.classList.add("cellActive");
      cell.textContent = hasChord ? t.chord : "\u00A0";
  
      grid.appendChild(cell);
    });
  
    // Row 2: lyrics
    tokens.forEach((t) => {
      const cell = document.createElement("div");
      cell.className = "gridCell lyricCell";
      cell.textContent = t.lyric && t.lyric.length ? t.lyric : "\u00A0";
      grid.appendChild(cell);
    });
  
    return grid;
  }
  
  function renderSong() {
    elSongRoot.innerHTML = "";
  
    // group 3 token-lines per row (like your React)
    let buffer = [];
    let groupCount = 0;
  
    demoSong.lines.forEach((line, index) => {
      // section
      if (line.section) {
        if (buffer.length > 0) {
          const groupRow = document.createElement("div");
          groupRow.className = "groupRow";
  
          buffer.forEach((b) => groupRow.appendChild(makeLineGridNode(b.tokens, b.__lineIdx)));
          elSongRoot.appendChild(groupRow);
  
          buffer = [];
          groupCount++;
        }
  
        elSongRoot.appendChild(makeSectionNode(line));
        return;
      }
  
      // token line
      buffer.push({ tokens: line.tokens, __lineIdx: index });
      if (buffer.length === 3) {
        const groupRow = document.createElement("div");
        groupRow.className = "groupRow";
  
        buffer.forEach((b) => groupRow.appendChild(makeLineGridNode(b.tokens, b.__lineIdx)));
        elSongRoot.appendChild(groupRow);
  
        buffer = [];
        groupCount++;
      }
    });
  
    if (buffer.length > 0) {
      const groupRow = document.createElement("div");
      groupRow.className = "groupRow";
      buffer.forEach((b) => groupRow.appendChild(makeLineGridNode(b.tokens, b.__lineIdx)));
      elSongRoot.appendChild(groupRow);
    }
  }
  
  // ------------------------ TICK ------------------------
  function tick() {
    const ctx = ensureAudioContext();
  
    // PHASE COUNT-IN
    if (phaseRef === "countin") {
      click(beatClickLevel(currentBeatRef));
      beat = currentBeatRef;
      renderBeatChips();
  
      currentBeatRef = nextBeat(currentBeatRef);
  
      remainingRef -= 1;
      if (remainingRef > 0) {
        countIn = remainingRef;
        renderSong();
        return;
      }
  
      // into play
      countIn = null;
      phase = "play";
      phaseRef = "play";
  
      currentBeatRef = 1;
      beat = 1;
  
      posRef = 0;
      activeLine = tokenLineIndexes[0] ?? 0;
  
      click("strong");
      renderBeatChips();
      renderSong();
      return;
    }
  
    // PHASE PLAY
    if (phaseRef === "play") {
      if (currentBeatRef === beatsPerBar) {
        posRef = (posRef + 1) % tokenLineIndexes.length;
        activeLine = tokenLineIndexes[posRef];
      }
  
      currentBeatRef = nextBeat(currentBeatRef);
  
      beat = currentBeatRef;
      click(beatClickLevel(currentBeatRef));
  
      renderBeatChips();
      renderSong();
    }
  }
  
  // ------------------------ CONTROLS ------------------------
  async function start() {
    const ctx = ensureAudioContext();
    if (ctx.state === "suspended") await ctx.resume();
  
    clearTimer();
    isPlaying = true;
    setPlayUi(true);
  
    phase = "countin";
    phaseRef = "countin";
  
    remainingRef = beatsPerBar;
    countIn = beatsPerBar;
  
    currentBeatRef = 1;
    beat = 1;
  
    posRef = 0;
    activeLine = tokenLineIndexes[0] ?? 0;
  
    click("strong");
  
    renderBeatChips();
    renderSong();
  
    timerId = window.setInterval(tick, 60000 / bpm);
  }
  
  function stop() {
    clearTimer();
    isPlaying = false;
    setPlayUi(false);
  
    phase = "idle";
    phaseRef = "idle";
  
    countIn = null;
    remainingRef = 0;
  
    beat = 1;
    currentBeatRef = 1;
  
    posRef = 0;
    activeLine = tokenLineIndexes[0] ?? 0;
  
    renderBeatChips();
    renderSong();
  }
  
  function restartInterval() {
    if (!isPlaying) return;
    clearTimer();
    timerId = window.setInterval(tick, 60000 / bpm);
  }
  
  // ------------------------ INIT ------------------------
  function init() {
    renderMeta();
    renderBeatChips();
    renderSong();
    setPlayUi(false);
  
    btnPlay.addEventListener("click", () => start());
    btnStop.addEventListener("click", () => stop());
  
    bpmRange.addEventListener("input", (e) => {
      bpm = Number(e.target.value);
      bpmLabel.textContent = String(bpm);
      elBpmNow.textContent = `⏱ Đang tập: ${bpm} BPM`;
      restartInterval();
    });
  }
  
  document.addEventListener("DOMContentLoaded", init);