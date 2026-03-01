// chords-page.js
(function () {
    // -------------------- Utils --------------------
    function escapeHTML(str) {
      return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
  
    function safeLink(url) {
      const s = String(url ?? "").trim();
      if (!s) return "";
      // allow: http(s), mailto, tel, relative, hash
      const ok =
        s.startsWith("http://") ||
        s.startsWith("https://") ||
        s.startsWith("mailto:") ||
        s.startsWith("tel:") ||
        s.startsWith("/") ||
        s.startsWith("./") ||
        s.startsWith("../") ||
        s.startsWith("#");
      return ok ? s : "#";
    }
  
    function $(id) {
      return document.getElementById(id);
    }
    // ====== Header mobile toggle ======
    const navToggle = document.getElementById("navToggle");
    const mobileNav = document.getElementById("mobileNav");
  
    if (navToggle && mobileNav) {
      navToggle.addEventListener("click", () => {
        mobileNav.classList.toggle("is-open");
        navToggle.setAttribute(
          "aria-label",
          mobileNav.classList.contains("is-open") ? "Đóng menu" : "Mở menu"
        );
      });
    }
    // -------------------- Data (mock) --------------------
    const data = {
      social: [
        { name: "Facebook", icon: "fa-brands fa-facebook", link: "https://www.facebook.com/guitaristVN/" },
        { name: "TikTok", icon: "fa-brands fa-tiktok", link: "https://www.tiktok.com/@jblufe.studio" },
        { name: "YouTube", icon: "fa-brands fa-youtube", link: "https://www.youtube.com/@lufeaudio1526" },
        { name: "Instagram", icon: "fa-brands fa-instagram", link: "https://www.instagram.com/jb_lufe.audio/" }
      ],
      donate: {
        bankName: "Vietcombank (Mock)",
        bankOwner: "JOHN THANH LỊCH",
        bankNumber: "0123 456 789"
      },
      tools: [
        {
          title: "Tra cứu hợp âm + Metronome",
          desc: "Tìm hợp âm theo bài + chạy metronome, phù hợp để tập nhịp khi đệm hát.",
          status: "Live/Update",
          link: "#"
        },
        {
          title: "Luyện nghe hợp âm",
          desc: "Bài tập nhận diện quality: maj/min/dim/aug/7... (sắp có).",
          status: "Coming soon",
          link: "#"
        },
        {
          title: "Mixing & Master",
          desc: "Tổng hợp bài học + checklist + bài tập thực hành (sắp có).",
          status: "Coming soon",
          link: "#"
        }
      ],
      albums: [
        {
          type: "album",
          title: "Ước mơ tuổi 17 ",
          desc: "Release 27/09/2025. Jb-Lufe",
          chip: "Single",
          link: "https://youtu.be/FgIijOdivPk?si=pOOiFNZazCiZJPTw",
          cover: "../IMG/album2.jpg"
        },
        {
          type: "album",
          title: "Đã đủ rồi",
          desc: "Release 5/03/2025. Jb-Lufe feat. Fei Nguyen",
          chip: "Single",
          link: "https://youtu.be/m95H8jcECBw?si=gx1znzB-0ylaavEC",
          cover: "../IMG/album1.jpg"
        },
        {
          type: "album",
          title: "Tương tư",
          desc: "Coming soon 2026. Jb-Lufe feat. Fei Nguyen, Quynh Trang",
          chip: "Single",
          link: "#",
          cover: "../IMG/album3.jpeg"
        }
      ],
      products: [
        { title: "Guitar Pick Set", desc: "Mock sản phẩm affiliate sau này.", chip: "Affiliate", link: "#" },
        { title: "Audio Interface", desc: "Mock sản phẩm affiliate sau này.", chip: "Gear", link: "#" },
        { title: "Course Bundle", desc: "Mock khóa học/ebook sau này.", chip: "Digital", link: "#" }
      ],
      posts: [
        { title: "Passing chord là gì?", desc: "Giải thích dễ hiểu + ví dụ thực tế.", chip: "Harmony", link: "#" },
        { title: "Cách đệm hát không bị lạc tone", desc: "Checklist tai nghe + hợp âm + nhịp.", chip: "Guitar", link: "#" },
        { title: "Attack/Decay/Sustain/Release", desc: "Hiểu ADSR để mix nhạc tốt hơn.", chip: "Mixing", link: "#" }
      ]
    };
  
    // Mock songs list (anh có thể thay bằng fetch songs.json sau)
    // Link tạm thời để "#"; sau này anh đổi thành: `../HTML/chord.html?song=${encodeURIComponent(s.id)}`
    const songs = [
      { id: "Ngayxuanlpxv", title: "Ngày xuân long phụng xum vầy", author: "Quang Minh" },
      { id: "da-du-roi", title: "Đã đủ rồi", author: "Jb-Lufe"},
      
    ];
  
    // -------------------- Renderers --------------------
    function renderTools(list) {
      const el = $("toolsList");
      if (!el) return;
  
      el.innerHTML = (list || [])
        .map((t) => {
          const title = escapeHTML(t.title);
          const desc = escapeHTML(t.desc);
          const chip = escapeHTML(t.status || t.chip || "Update");
          const link = safeLink(t.link);
          const isEmpty = !t.link || !String(t.link).trim();
          const href = isEmpty ? "#" : link;
          const cls = "toolCard" + (isEmpty ? " is-disabled" : "");
  
          return `
            <a class="${cls}" href="${href}" ${isEmpty ? 'aria-disabled="true"' : ""}>
              <div class="toolTitle">${title}</div>
              <div class="toolDesc muted small">${desc}</div>
              <div class="toolChip">${chip}</div>
            </a>
          `;
        })
        .join("");
    }
  
    function renderAlbums(list) {
        const el = $("albumsGrid");
        if (!el) return;
      
        el.innerHTML = (list || [])
          .map((a) => {
            const title = escapeHTML(a.title);
            const desc = escapeHTML(a.desc);
            const chip = escapeHTML(a.chip || a.status || "Single");
            const link = safeLink(a.link);
      
            const cover = safeLink(a.cover || a.image || "");
            const isEmpty = !a.link || !String(a.link).trim();
            const href = isEmpty ? "#" : link;
      
            const coverHtml = cover
              ? `<div class="albumMedia">
                   <img src="${cover}" alt="${title} cover" loading="lazy">
                 </div>`
              : "";
      
            return `
              <a class="albumCardRow ${isEmpty ? "is-disabled" : ""}" href="${href}" ${isEmpty ? 'aria-disabled="true"' : ""}>
                <div class="albumLeft">
                  <div class="albumTop">
                    <div class="albumTitle">${title}</div>
                    <div class="albumChip">${chip}</div>
                  </div>
                  <div class="albumDesc muted small">${desc}</div>
                </div>
      
                ${coverHtml}
              </a>
            `;
          })
          .join("");
      }
  
      function renderSongs(list, activeId = null) {
        const el = $("songsList");
        const elCount = $("songCount");
        if (!el) return;
      
        const safeList = list || [];
        if (elCount) elCount.textContent = `${safeList.length} bài`;
      
        el.innerHTML = safeList
          .map((s) => {
            const title = escapeHTML(s.title);
            const meta = escapeHTML(
              `${s.author || ""}${s.bpm ? " • " + s.bpm + " BPM" : ""}${s.timeSig ? " • " + s.timeSig : ""}`
            );
      
            // 👇 BUILD LINK THEO ID
            const link = `../HTML/chord.html?song=${encodeURIComponent(s.id)}`;
      
            const isActive = activeId && s.id === activeId;
      
            return `
              <a class="listItem ${isActive ? "is-active" : ""}" 
                 href="${link}" 
                 data-song-id="${escapeHTML(s.id)}">
                <div class="listItemTitle">${title}</div>
                <div class="listItemMeta muted small">${meta}</div>
              </a>
            `;
          })
          .join("");
      }
  
    // -------------------- Search --------------------
    function normalize(text) {
      return String(text ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }
  
    function bindSearch() {
      const input = $("songSearch");
      const btn = $("btnSearch");
      if (!input && !btn) return;
  
      const doFilter = () => {
        const q = normalize(input?.value || "");
        const filtered = !q
          ? songs
          : songs.filter((s) => {
              const hay = normalize(`${s.title} ${s.author}`);
              return hay.includes(q);
            });
  
        renderSongs(filtered);
      };
  
      input?.addEventListener("input", doFilter);
      btn?.addEventListener("click", doFilter);
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
    // -------------------- Minimal styles for album cards (optional) --------------------
    // Nếu anh chưa có CSS cho albumCard/card-media, thêm nhanh bằng JS injection để khỏi phải sửa CSS file.
    // Anh có thể xoá đoạn này nếu đã style rồi.
    function injectAlbumCss() {
      const css = `
         
    .albumCardRow{
      display:flex;
      justify-content:space-between;
      gap:12px;
      align-items:center;
      border:1px solid rgba(0,0,0,0.08);
      border-radius:14px;
      padding:12px;
      background:#fafafa;
      text-decoration:none;
      color:inherit;
      min-width:0;
    }
    .albumCardRow:hover{ background:#f3f3f3; }
    .albumCardRow.is-disabled{ opacity:.7; pointer-events:none; }

    .albumLeft{ min-width:0; flex:1; }
    .albumTop{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:10px;
    }
    .albumTitle{
      font-weight:800;
      line-height:1.2;
      min-width:0;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }
    .albumChip{
      font-size:11px;
      padding:4px 8px;
      border-radius:999px;
      border:1px solid rgba(0,0,0,0.12);
      background:#fff;
      white-space:nowrap;
      flex:0 0 auto;
    }
    .albumDesc{
      margin-top:6px;
      line-height:1.4;
      overflow:hidden;
      display:-webkit-box;
      -webkit-line-clamp:2;
      -webkit-box-orient:vertical;
    }

    .albumMedia{
      width:64px;
      height:64px;
      border-radius:12px;
      overflow:hidden;
      background:#000;
      flex:0 0 auto;
    }
    .albumMedia img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }

    .toolCard.is-disabled{ pointer-events:none; opacity:.7; }
      `;
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    }
  
    // -------------------- Init --------------------
    function init() {
      injectAlbumCss(); // optional
      renderTools(data.tools);
      renderAlbums(data.albums);
      renderSongs(songs);
      bindSearch();
    }
  
    document.addEventListener("DOMContentLoaded", init);
  })();