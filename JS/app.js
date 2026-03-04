let elTitle, elAuthor, elStyle, elTimeSig, elTempoHint, elBpmNow;
let elBeatBox, elSongRoot;
let btnPlay;
let bpmRange, bpmLabel;
let btnUp, btnDown, btnReset, transposeLabel;
let elNotesHint;
let btnTone, elToneOut;
// ------------------------ DATA ------------------------
let demoSong = null;

// các biến phụ thuộc bài hát -> để let, set sau khi load JSON
let meter = null;
let beatsPerBar = 4;
let bpm = 80;

let tokenLineIndexes = [];
let posRef = 0;

// ------------------------ STATE (chung) ------------------------
let chordMode = "basic"; // "basic" | "adv"
const savedChordMode = localStorage.getItem("chordMode");
if (savedChordMode === "adv" || savedChordMode === "basic") {
  chordMode = savedChordMode;
}
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
function isRealChord(ch) {
  return !!ch && String(ch).trim() !== "";
}

function findLastChordRaw(song) {
  if (!song?.lines) return null;

  // scan ngược: dòng -> token
  for (let i = song.lines.length - 1; i >= 0; i--) {
    const line = song.lines[i];
    if (!line?.tokens) continue;

    for (let j = line.tokens.length - 1; j >= 0; j--) {
      const t = line.tokens[j];
      const raw = getTokenChord(t); // basic/adv theo mode
      if (isRealChord(raw)) return raw;
    }
  }
  return null;
}

// lấy "root" của chord: C, G#, Bb...
function chordRoot(chord) {
  const m = String(chord).trim().match(/^([A-G])([#b]?)/);
  return m ? (m[1] + (m[2] || "")) : null;
}

function getSongToneDisplay() {

  const toneRaw = demoSong.tone ?? demoSong.key ?? "—";
  const tone = toneRaw !== "—" ? getDisplayChord(toneRaw) : "—";

  const lastRaw = findLastChordRaw(demoSong);
  const lastChord = lastRaw ? getDisplayChord(lastRaw) : "—";

  return { tone, lastChord };
}
function getTokenChord(t) {
  // Nếu anh giữ chord cũ làm basic:
  const basic = t.chordBasic ?? t.chord ?? null;
  const adv = t.chordAdv ?? null;

  if (chordMode === "adv") return adv ?? basic; // thiếu adv thì fallback basic
  return basic;
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
    if (!btnPlay) return;
  
    if (playing) {
      btnPlay.innerHTML = `<i class="fa-solid fa-stop"></i> Stop`;
      btnPlay.classList.add("is-stop");
    } else {
      btnPlay.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
      btnPlay.classList.remove("is-stop");
    }
  }
  function renderNotesHint() {
    if (!elNotesHint || !demoSong) return;
  
    const top = demoSong.timeSigTop;
    const bottom = demoSong.timeSigBottom;
  
    // 2/4
    if (top === 2 && bottom === 4) {
      elNotesHint.textContent = "Notes: Mỗi ô = 1 nốt đơn (♪)";
      return;
    }
  
    // 6/8
    if (top === 6 && bottom === 8) {
      elNotesHint.textContent = "Notes: Mỗi 3 ô = 1 liên ba (1-la-li / 2-la-li)";
      return;
    }
  
    // còn lại
    elNotesHint.textContent = "Notes: Mỗi ô = 1 nốt đen (♩)";
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
  
  let countInShown = false; // reset mỗi lần renderSong()

  function makeSectionNode(sectionLine) {
    const wrap = document.createElement("div");
    wrap.className = "sectionWrapper";
  
    const title = document.createElement("div");
    title.className = "sectionTitle";
    title.textContent = sectionLine.section;
  
    wrap.appendChild(title);
  
    // show count-in ở section đầu tiên gặp được trong bài
    if (phase === "countin" && countIn !== null && !countInShown) {
      const ci = document.createElement("div");
      ci.className = "sectionCountIn";
      ci.textContent = String(countIn);
      wrap.appendChild(ci);
  
      countInShown = true;
    }
  
    return wrap;
  }
  let lastScrolledLine = -1;

    function autoScrollToActiveLine() {
      if (!isPlaying) return;
      if (activeLine === lastScrolledLine) return;

      const target = elSongRoot.querySelector(`[data-line-idx="${activeLine}"]`);
      if (!target) return;

      lastScrolledLine = activeLine;

      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
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
  
      const rawChord = getTokenChord(t);   // <= chord theo mode
      const hasChord = !!rawChord;
      const isCurrentLine = lineIdx === activeLine;
      const chordBeatActive =
        isPlaying && phase !== "countin" && isCurrentLine && hasChord && t.beatIndex === beat;

      if (chordBeatActive) cell.classList.add("cellActive");

      cell.textContent = hasChord ? getDisplayChord(rawChord) : "\u00A0";
  
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
    countInShown = false;
    let buffer = [];
    let groupCount = 0;
  
    demoSong.lines.forEach((line, index) => {
      // section
      if (line.section) {
        if (buffer.length > 0) {
          const groupRow = document.createElement("div");
          groupRow.className = "groupRow";
      
          buffer.forEach((b) => {
            const lineWrap = document.createElement("div");
            lineWrap.className = "lineWrap";
            lineWrap.dataset.lineIdx = String(b.__lineIdx);
      
            lineWrap.appendChild(makeLineGridNode(b.tokens, b.__lineIdx));
            groupRow.appendChild(lineWrap);
          });
      
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
  
        buffer.forEach((b) => {
          const lineWrap = document.createElement("div");
          lineWrap.className = "lineWrap";
          lineWrap.dataset.lineIdx = String(b.__lineIdx);
        
          lineWrap.appendChild(makeLineGridNode(b.tokens, b.__lineIdx));
          groupRow.appendChild(lineWrap);
        });
        elSongRoot.appendChild(groupRow);
  
        buffer = [];
        groupCount++;
      }
    });
  
    if (buffer.length > 0) {
      const groupRow = document.createElement("div");
      groupRow.className = "groupRow";
      buffer.forEach((b) => {
        const lineWrap = document.createElement("div");
        lineWrap.className = "lineWrap";
        lineWrap.dataset.lineIdx = String(b.__lineIdx);
      
        lineWrap.appendChild(makeLineGridNode(b.tokens, b.__lineIdx));
        groupRow.appendChild(lineWrap);
      });
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
      autoScrollToActiveLine();
      return;
    }
  
    // PHASE PLAY
    if (phaseRef === "play") {
      if (currentBeatRef === beatsPerBar) {
        // nếu đang ở bar cuối -> dừng và về đầu
        if (posRef >= tokenLineIndexes.length - 1) {
          stopAndResetToStart();
          return;
        }
      
        // còn bar tiếp theo thì nhảy bình thường
        posRef += 1;
        activeLine = tokenLineIndexes[posRef];
        autoScrollToActiveLine();
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
    lastScrolledLine = -1;
    
  
    click("strong");
  
    renderBeatChips();
    renderSong();
    autoScrollToActiveLine();
  
    timerId = window.setInterval(tick, 60000 / bpm);
  }
  function stopAndResetToStart() {
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
  
    lastScrolledLine = -1;
  
    renderBeatChips();
    renderSong();
    // autoScrollToActiveLine(); // nếu anh muốn tự cuộn về đầu
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
    lastScrolledLine = -1;
  
    renderBeatChips();
    renderSong();
  }
  const scrollTopBtn = document.getElementById("scrollTopBtn");

// hiện nút khi scroll xuống
window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

// bấm để cuộn lên đầu
scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
  
  function restartInterval() {
    if (!isPlaying) return;
    clearTimer();
    timerId = window.setInterval(tick, 60000 / bpm);
  }
//   loadSong(); // load song ngay khi script chạy

async function loadSong() {
    try {
      const res = await fetch("..//HTML/data/songs.json"); // ✅ path tính từ home.html
      if (!res.ok) throw new Error(`Fetch songs.json failed: ${res.status}`);
  
      const allSongs = await res.json();
      const params = new URLSearchParams(window.location.search);
      const songId = (params.get("song") || "").trim();

      demoSong = songId
        ? allSongs.find((s) => s.id === songId)
        : allSongs[0]; // fallback nếu không có ?song=

      if (!demoSong) {
        alert("Không tìm thấy bài hát: " + songId);
        return;
      }
  
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
    elNotesHint = document.getElementById("notesHint");
    elBeatBox = document.getElementById("beatBox");
    elSongRoot = document.getElementById("songRoot");
    btnTone = document.getElementById("btnTone");
    elToneOut = document.getElementById("toneOut");
    btnPlay = document.getElementById("btnPlay");
   
  
    bpmRange = document.getElementById("bpmRange");
    bpmLabel = document.getElementById("bpmLabel");
   
    btnPlay.addEventListener("click", () => {
      if (isPlaying) stop();     // đang chạy thì bấm sẽ stop
      else start();              // đang dừng thì bấm sẽ start
    });
  
  
    renderMeta();
    renderBeatChips();
    renderNotesHint();
    renderSong();
    setPlayUi(false);
    renderTone();
    bpmRange.addEventListener("input", (e) => {
      bpm = Number(e.target.value);
      bpmLabel.textContent = String(bpm);
      elBpmNow.textContent = `⏱ Đang tập: ${bpm} BPM`;
      restartInterval();
    });
    function renderTone() {
      if (!elToneOut) return;
      const { tone, lastChord } = getSongToneDisplay();
      elToneOut.textContent = `Tone: ${tone}`;
    }
    // changing chords
    const btnBasic = document.getElementById("btnBasic");
    const btnAdv = document.getElementById("btnAdv");

    function setChordMode(mode){
      chordMode = mode;
      localStorage.setItem("chordMode", mode);
    
      btnBasic?.classList.toggle("is-active", mode === "basic");
      btnAdv?.classList.toggle("is-active", mode === "adv");
    
      renderSong();
      renderTone();
    }

    btnBasic?.addEventListener("click", () => setChordMode("basic"));
    btnAdv?.addEventListener("click", () => setChordMode("adv"));
    btnTone?.addEventListener("click", renderTone);
    setChordMode(chordMode);
      // --- TRANSPOSE CONTROLS ---
      btnUp = document.getElementById("btnUp");
      btnDown = document.getElementById("btnDown");
      btnReset = document.getElementById("btnReset");
      transposeLabel = document.getElementById("transposeLabel");

  function updateTransposeLabel() {
    if (transposeLabel) transposeLabel.textContent = `🎚 Transpose: ${transpose}`;
  }

  btnUp?.addEventListener("click", () => {
    transpose += 1;
    updateTransposeLabel();
    renderSong();
    renderTone();
  });

  btnDown?.addEventListener("click", () => {
    transpose -= 1;
    updateTransposeLabel();
    renderSong();
    renderTone();
  });

  btnReset?.addEventListener("click", () => {
    transpose = 0;
    updateTransposeLabel();
    renderSong();
    renderTone();
  });

  updateTransposeLabel();
  }
  
  document.addEventListener("DOMContentLoaded", loadSong);
  