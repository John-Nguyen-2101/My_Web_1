// =========================
// QUICK AUTHORING PARSER
// =========================
// Quy ước mới:
// - Mỗi dấu "/" = 1 ô hiển thị
// - Số ô mỗi bar phụ thuộc vào nhịp:
//   2/4 -> 4 ô  (mỗi ô = 1 nốt đơn)
//   3/4 -> 3 ô  (mỗi ô = 1 nốt đen)
//   4/4 -> 4 ô  (mỗi ô = 1 nốt đen)
//   6/8 -> 6 ô  (mỗi ô = 1 nốt đơn)
//
// Ví dụ:
// 2/4
// C|Cmaj7 : Mừng / tết / đến / {vạn lộc}
//
// 4/4
// C : anh / đi / qua / đây
//
// 3/4
// Am : mưa / rơi / rồi
//
// 6/8
// C : em / đi / trong / cơn / mưa / chiều
// =========================

function slugifySection(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim() || "section";
}

function parseChordSpec(chordSpecRaw) {
  const raw = String(chordSpecRaw || "").trim();
  if (!raw) {
    return { chordBasic: null, chordAdv: null };
  }

  const parts = raw.split("|").map((s) => s.trim());
  const basic = parts[0] || null;
  const adv = parts[1] || null;

  return {
    chordBasic: basic,
    chordAdv: adv
  };
}

function getBarGridConfig(song) {
  const top = song?.timeSigTop;
  const bottom = song?.timeSigBottom;

  // 2/4: 4 ô
  if (top === 2 && bottom === 4) {
    return {
      cellsPerBar: 4,
      cellToBeatMap: [1, 1, 2, 2]
    };
  }

  // 3/4: 3 ô
  if (top === 3 && bottom === 4) {
    return {
      cellsPerBar: 3,
      cellToBeatMap: [1, 2, 3]
    };
  }

  // 4/4: 4 ô
  if (top === 4 && bottom === 4) {
    return {
      cellsPerBar: 4,
      cellToBeatMap: [1, 2, 3, 4]
    };
  }

  // 6/8: 6 ô, chia 2 beat lớn
  if (top === 6 && bottom === 8) {
    return {
      cellsPerBar: 6,
      cellToBeatMap: [1, 1, 1, 2, 2, 2]
    };
  }

  return {
    cellsPerBar: top || 4,
    cellToBeatMap: Array.from({ length: top || 4 }, (_, i) => i + 1)
  };
}

function parseBarLine(line, options = {}) {
  const {
    cellsPerBar = 4,
    cellToBeatMap = [1, 2, 3, 4],
    includeSpacerChord = true
  } = options;

  const colonIndex = line.indexOf(":");
  if (colonIndex === -1) {
    throw new Error(`Bar thiếu dấu ":" -> ${line}`);
  }

  const chordPart = line.slice(0, colonIndex).trim();
  const lyricPart = line.slice(colonIndex + 1).trim();

  const { chordBasic, chordAdv } = parseChordSpec(chordPart);

  // Mỗi dấu "/" = 1 ô hiển thị
  const cellTexts = lyricPart.split("/").map((s) => s.trim());

  if (cellTexts.length > cellsPerBar) {
    throw new Error(
      `Bar có ${cellTexts.length} ô lyric nhưng nhịp này chỉ cho ${cellsPerBar} ô: ${line}`
    );
  }

  while (cellTexts.length < cellsPerBar) {
    cellTexts.push("");
  }

  const tokens = [];

  for (let i = 0; i < cellsPerBar; i++) {
    const lyric = cellTexts[i] || "";
    const beatIndex = cellToBeatMap[i] ?? 1;
  
    let outChordBasic = null;
    let outChordAdv = null;
  
    const isFirstCellOfBar = i === 0;
    const prevBeatIndex = i > 0 ? cellToBeatMap[i - 1] : null;
    const isFirstCellOfBeat = i === 0 || beatIndex !== prevBeatIndex;
  
    if (isFirstCellOfBar) {
      // ô đầu bar mang chord thật
      outChordBasic = chordBasic;
      outChordAdv = chordAdv;
    } else if (isFirstCellOfBeat && includeSpacerChord) {
      // chỉ ô đầu tiên của beat mới mang spacer
      outChordBasic = " ";
      outChordAdv = " ";
    }
  
    tokens.push({
      lyric,
      chordBasic: outChordBasic,
      chordAdv: outChordAdv,
      beatIndex
    });
  }

  return { tokens };
}

function parseQuickLines(inputText, options = {}) {
  const {
    cellsPerBar = 4,
    cellToBeatMap = [1, 2, 3, 4],
    includeSpacerChord = true
  } = options;

  const rawLines = String(inputText || "")
    .split(/\r?\n/)
    .map((line) => line.trim());

  const lines = [];
  const sectionCounter = {};

  for (const rawLine of rawLines) {
    if (!rawLine) continue;
    if (rawLine.startsWith("//")) continue;

    // [ĐIỆP KHÚC]
    const sectionMatch = rawLine.match(/^\[(.+?)\]$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim();
      const baseId = slugifySection(sectionName);

      sectionCounter[baseId] = (sectionCounter[baseId] || 0) + 1;
      const count = sectionCounter[baseId];

      lines.push({
        section: sectionName,
        id: count === 1 ? baseId : `${baseId}${count}`
      });
      continue;
    }

    lines.push(
      parseBarLine(rawLine, {
        cellsPerBar,
        cellToBeatMap,
        includeSpacerChord
      })
    );
  }

  return lines;
}

function buildSongFromQuickText(meta, quickText, options = {}) {
  const grid = getBarGridConfig(meta);

  return {
    ...meta,
    lines: parseQuickLines(quickText, {
      cellsPerBar: options.cellsPerBar ?? grid.cellsPerBar,
      cellToBeatMap: options.cellToBeatMap ?? grid.cellToBeatMap,
      includeSpacerChord: options.includeSpacerChord ?? true
    })
  };
}