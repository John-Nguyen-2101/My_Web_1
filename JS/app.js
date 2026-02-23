let elTitle, elAuthor, elStyle, elTimeSig, elTempoHint, elBpmNow;
let elBeatBox, elSongRoot;
let btnPlay, btnStop;
let bpmRange, bpmLabel;
let btnUp, btnDown, btnReset, transposeLabel;
// ------------------------ DATA ------------------------
let demoSong = null;

// các biến phụ thuộc bài hát -> để let, set sau khi load JSON
let meter = null;
let beatsPerBar = 4;
let bpm = 80;

let tokenLineIndexes = [];
let posRef = 0;

// ------------------------ STATE (chung) ------------------------
let isPlaying = false;
let phase = "idle";
let countIn = null;

let beat = 1;
let activeLine = 0;

let timerId = null;

let phaseRef = "idle";
let remainingRef = 0;
let currentBeatRef = 1;
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
  
 
  
  // ------------------------ DOM ------------------------

  //transpose
  let transpose = 0;

const NOTE_SHARPS = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function transposeRoot(root, semis) {
  const idx = NOTE_SHARPS.indexOf(root);
  if (idx === -1) return root;
  let newIdx = (idx + semis) % 12;
  if (newIdx < 0) newIdx += 12;
  return NOTE_SHARPS[newIdx];
}

function transposeChord(chord, semis) {
  if (!chord) return chord;

  const m = chord.match(/^([A-G])([#b]?)(.*)$/);
  if (!m) return chord;

  const root = m[1] + (m[2] || "");
  const rest = m[3] || "";

  const newRoot = transposeRoot(root, semis);
  return newRoot + rest;
}

function getDisplayChord(chord) {
  return transposeChord(chord, transpose);
}
  
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
      cell.textContent = hasChord ? getDisplayChord(t.chord) : "\u00A0";
  
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
//   loadSong(); // load song ngay khi script chạy

async function loadSong() {
    try {
      const res = await fetch("./songs.json"); // ✅ path tính từ home.html
      if (!res.ok) throw new Error(`Fetch songs.json failed: ${res.status}`);
  
      const allSongs = await res.json();
      demoSong = allSongs[0]; // lấy bài đầu tiên
  
      // ✅ set các biến phụ thuộc demoSong tại đây
      meter = getMeterConfig(demoSong);
      beatsPerBar = meter.beatsPerBar;
  
      bpm = demoSong.bpm;
  
      tokenLineIndexes = demoSong.lines
        .map((l, i) => (l.tokens ? i : -1))
        .filter((i) => i !== -1);
  
      posRef = 0;
      activeLine = tokenLineIndexes[0] ?? 0;
  
      init(); // ✅ chỉ init sau khi đã có demoSong
    } catch (err) {
      console.error(err);
      alert("Không load được songs.json. Kiểm tra đường dẫn và mở bằng Live Server/GitHub Pages.");
    }
  }
  // ------------------------ INIT ------------------------
  function init() {
    elTitle = document.getElementById("songTitle");
    elAuthor = document.getElementById("songAuthor");
    elStyle = document.getElementById("songStyle");
    elTimeSig = document.getElementById("songTimeSig");
    elTempoHint = document.getElementById("songTempoHint");
    elBpmNow = document.getElementById("songBpmNow");
  
    elBeatBox = document.getElementById("beatBox");
    elSongRoot = document.getElementById("songRoot");
  
    btnPlay = document.getElementById("btnPlay");
    btnStop = document.getElementById("btnStop");
  
    bpmRange = document.getElementById("bpmRange");
    bpmLabel = document.getElementById("bpmLabel");
  
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
      // --- TRANSPOSE CONTROLS ---
  const btnUp = document.getElementById("btnUp");
  const btnDown = document.getElementById("btnDown");
  const btnReset = document.getElementById("btnReset");
  const transposeLabel = document.getElementById("transposeLabel");

  function updateTransposeLabel() {
    if (transposeLabel) transposeLabel.textContent = `🎚 Transpose: ${transpose}`;
  }

  btnUp?.addEventListener("click", () => {
    transpose += 1;
    updateTransposeLabel();
    renderSong();
  });

  btnDown?.addEventListener("click", () => {
    transpose -= 1;
    updateTransposeLabel();
    renderSong();
  });

  btnReset?.addEventListener("click", () => {
    transpose = 0;
    updateTransposeLabel();
    renderSong();
  });

  updateTransposeLabel();
  }
  
  document.addEventListener("DOMContentLoaded", loadSong);
  