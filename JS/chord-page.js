// ../JS/chord-page.js
(function () {
    function $(id) {
      return document.getElementById(id);
    }
  
    function escapeHTML(str) {
      return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
  
    function getSongIdFromUrl() {
      const params = new URLSearchParams(window.location.search);
      return (params.get("song") || "").trim();
    }
  
    function setText(id, text) {
      const el = $(id);
      if (el) el.textContent = text ?? "";
    }
  
    function setVideo(url) {
      const iframe = $("mainVideo");
      if (!iframe) return;
  
      // nếu sau này anh để trong json dạng youtubeId thì build embed url ở đây
      iframe.src = url || "";
    }
  
    function renderNotFound(songId) {
      setText("songTitle", "Không tìm thấy bài hát");
      const root = $("songRoot");
      if (root) {
        root.innerHTML = `<div class="muted">Không có dữ liệu cho ID: <b>${escapeHTML(songId || "(trống)")}</b></div>`;
      }
    }
  
    function renderSongMeta(song) {
      setText("songTitle", song.title || "");
      setText("songAuthor", song.author ? `👤 ${song.author}` : "");
      setText("songStyle", song.style ? `🎵 ${song.style}` : "");
      setText("songTimeSig", song.timeSigTop && song.timeSigBottom ? `🕒 ${song.timeSigTop}/${song.timeSigBottom}` : "");
      setText("songTempoHint", song.recommendedTempo ? `⚡ ${song.recommendedTempo}` : "");
      setText("songBpmNow", song.bpm ? `BPM: ${song.bpm}` : "");
  
      // set default bpm
      const bpmRange = $("bpmRange");
      const bpmLabel = $("bpmLabel");
      if (bpmRange && song.bpm) {
        bpmRange.value = String(song.bpm);
        if (bpmLabel) bpmLabel.textContent = String(song.bpm);
      }
    }
  
    // Render 1 line tokens thành 1 hàng: chord row + lyric row
    function renderTokensLine(line) {
      const tokens = Array.isArray(line.tokens) ? line.tokens : [];
  
      const chordRow = tokens
        .map((t) => `<span class="tokChord">${escapeHTML((t.chord ?? "").trim())}</span>`)
        .join("");
  
      const lyricRow = tokens
        .map((t) => `<span class="tokLyric">${escapeHTML(t.lyric ?? "")}</span>`)
        .join("");
  
      return `
        <div class="songLine">
          <div class="rowChords">${chordRow}</div>
          <div class="rowLyrics">${lyricRow}</div>
        </div>
      `;
    }
  
    function renderSectionLine(sectionName) {
      return `<div class="songSection">${escapeHTML(sectionName || "")}</div>`;
    }
  
    function renderSongBody(song) {
      const root = $("songRoot");
      if (!root) return;
  
      const lines = Array.isArray(song.lines) ? song.lines : [];
  
      root.innerHTML = lines
        .map((line) => {
          if (line.section) return renderSectionLine(line.section);
          if (line.tokens) return renderTokensLine(line);
          return "";
        })
        .join("");
    }
  
    async function loadSongsJson() {
      // chỉnh path nếu anh để nơi khác
      const res = await fetch("../DATA/songs.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Cannot load songs.json");
      return await res.json();
    }
  
    document.addEventListener("DOMContentLoaded", async () => {
      const songId = getSongIdFromUrl();
      if (!songId) return renderNotFound("");
  
      try {
        const allSongs = await loadSongsJson();
        const song = Array.isArray(allSongs) ? allSongs.find((s) => s.id === songId) : null;
  
        if (!song) return renderNotFound(songId);
  
        renderSongMeta(song);
        renderSongBody(song);
  
        // video: anh chưa đưa field, tạm bỏ trống
        // setVideo(song.videoUrl);
  
      } catch (e) {
        console.error(e);
        renderNotFound(songId);
      }
    });
  })();