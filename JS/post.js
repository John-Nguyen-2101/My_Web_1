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
  } // <- thiếu cái này là lỗi cú pháp

  (async function () {
    const app = document.getElementById("app");
    if (!app) return;

    const slug = new URL(location.href).searchParams.get("slug");

    if (!slug) {
      app.innerHTML = `
        <h1>Thiếu slug</h1>
        <p>Mở đúng dạng: <code>post.html?slug=passing-chord-la-gi</code></p>
      `;
      return;
    }

    try {
      const res = await fetch("./posts.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch posts.json failed: " + res.status);

      const posts = await res.json();
      const post = posts.find((p) => p.slug === slug);

      if (!post) {
        app.innerHTML = `<h1>Không tìm thấy bài</h1><p>Slug: <code>${slug}</code></p>`;
        return;
      }

      app.innerHTML = `
        <article class="card">
          <h1>${post.title}</h1>
          <div class="meta">${post.date || ""}</div>
          <div class="content">${post.content || ""}</div>
        </article>
      `;
    } catch (err) {
      console.error(err);
      app.innerHTML = `
        <h1>Lỗi render</h1>
        <p>Mở Console (F12) để xem lỗi.</p>
        <pre>${String(err?.message || err)}</pre>
      `;
    }
  })();
});