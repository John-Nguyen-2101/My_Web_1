// JS/main.js
document.addEventListener("DOMContentLoaded", () => {
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
  
    // ====== Footer year ======
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  
    // ====== Helpers ======
    const safeLink = (href) => (href && href.trim() ? href : "#");
    const escapeHTML = (s) =>
      String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
  
    function renderCards(list, targetId, options = {}) {
      const el = document.getElementById(targetId);
      if (!el) return;
  
      if (!Array.isArray(list) || list.length === 0) {
        el.innerHTML = `
          <div class="card">
            <div class="card-top">
              <p class="card-title">Đang cập nhật</p>
              <span class="chip">Soon</span>
            </div>
            <p class="card-desc">Anh sẽ thêm nội dung sau.</p>
            <div class="card-actions">
              <a class="link" href="#">Xem</a>
            </div>
          </div>
        `;
        return;
      }
      el.innerHTML = list
      .map((item) => {
        const title = escapeHTML(item.title);
        const desc = escapeHTML(item.desc);
        const chip = escapeHTML(item.chip || item.status || "Update");
        const link = safeLink(item.link);
    
        const primaryText = options.primaryText || "Xem";
    
        const isEmpty = !item.link || !item.link.trim();
        const linkAttr = isEmpty ? `href="#" aria-disabled="true"` : `href="${link}"`;
        const linkClass = isEmpty ? "link is-disabled" : "link";
    
        // album cover
        const cover = safeLink(item.cover || item.image || "");
        const coverHtml = cover
          ? `<div class="card-media"><img src="${cover}" alt="${title} cover" loading="lazy"></div>`
          : "";
    
        if (item.type === "album") {
          return `
            <div class="card">
              ${coverHtml}
              <div class="card-top">
                <p class="card-title">${title}</p>
                <span class="chip">${chip}</span>
              </div>
              <p class="card-desc">${desc}</p>
              <div class="card-actions">
                <a class="${linkClass}" ${linkAttr}>
                  ${primaryText} <i class="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
          `;
        }
    
        // default card (không có ảnh)
        return `
          <div class="card">
            <div class="card-top">
              <p class="card-title">${title}</p>
              <span class="chip">${chip}</span>
            </div>
            <p class="card-desc">${desc}</p>
            <div class="card-actions">
              <a class="${linkClass}" ${linkAttr}>
                ${primaryText} <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
        `;
      })
      .join("");
    }
    function renderSocial(socialList) {
        const wrap = document.getElementById("socialIcons");
        if (!wrap) return;
      
        const toSocialClass = (name = "") => {
          const n = String(name).toLowerCase();
          if (n.includes("facebook") || n.includes("fb")) return "facebook";
          if (n.includes("tiktok") || n.includes("tt")) return "tiktok";
          if (n.includes("youtube") || n.includes("yt")) return "youtube";
          if (n.includes("instagram") || n.includes("insta") || n.includes("ig")) return "instagram";
          return "other";
        };
      
        if (!Array.isArray(socialList) || socialList.length === 0) {
          wrap.innerHTML = `
            <a class="icon-btn other" href="#" aria-label="Social">
              <i class="fa-solid fa-link"></i>
            </a>
          `;
          return;
        }
      
        wrap.innerHTML = socialList
          .map((s) => {
            const name = escapeHTML(s.name || "Social");
            const icon = escapeHTML(s.icon || "fa-solid fa-link");
            const link = safeLink(s.link);
            const isEmpty = !s.link || !s.link.trim();
            const href = isEmpty ? "#" : link;
      
            const socialClass = toSocialClass(s.name);
      
            return `
              <a class="icon-btn ${socialClass} ${isEmpty ? "is-disabled" : ""}"
                 href="${href}"
                 target="_blank"
                 rel="noopener"
                 aria-label="${name}">
                <i class="${icon}"></i>
              </a>
            `;
          })
          .join("");
      }
  
    function fillDonate(donate) {
      const bankName = document.getElementById("bankName");
      const bankOwner = document.getElementById("bankOwner");
      const bankNumber = document.getElementById("bankNumber");
  
      if (bankName) bankName.textContent = donate?.bankName || "—";
      if (bankOwner) bankOwner.textContent = donate?.bankOwner || "—";
      if (bankNumber) bankNumber.textContent = donate?.bankNumber || "—";
  
      const copyBtn = document.getElementById("copyBank");
      const hint = document.getElementById("copyHint");
  
      if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
          const text = `Ngân hàng: ${donate?.bankName || ""}\nChủ TK: ${donate?.bankOwner || ""}\nSố TK: ${donate?.bankNumber || ""}`.trim();
          try {
            await navigator.clipboard.writeText(text);
            if (hint) hint.textContent = "✅ Đã copy thông tin donate!";
          } catch (e) {
            if (hint) hint.textContent = "⚠️ Không copy được (trình duyệt chặn). Anh copy thủ công nhé.";
          }
          setTimeout(() => {
            if (hint) hint.textContent = "";
          }, 2500);
        });
      }
    }
  
    // ====== Optional: style disabled links (inject small css) ======
    const style = document.createElement("style");
    style.textContent = `
      .is-disabled, .link.is-disabled{
        opacity: .6;
        cursor: not-allowed;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  
    // ====== Fetch data.json ======
    // Anh sửa path này cho đúng vị trí file data.json
    const DATA_PATH = "../HTML/data/data.json";
  
    fetch(DATA_PATH)
      .then((res) => {
        if (!res.ok) throw new Error("Không load được data.json");
        return res.json();
      })
      .then((data) => {
        renderSocial(data.social);
  
        renderCards(data.tools, "toolsGrid", { primaryText: "Mở tool" });
        renderCards(data.albums, "albumsGrid", { primaryText: "Nghe" });
        renderCards(data.products, "productsGrid", { primaryText: "Xem sản phẩm" });
        renderCards(data.posts, "postsGrid", { primaryText: "Đọc bài" });
  
        fillDonate(data.donate);
      })
      .catch((err) => {
        console.error(err);
        // fallback: render mock nếu fetch fail
        renderSocial([]);
        renderCards([], "toolsGrid");
        renderCards([], "albumsGrid");
        renderCards([], "productsGrid");
        renderCards([], "postsGrid");
        fillDonate(null);
      });
  });