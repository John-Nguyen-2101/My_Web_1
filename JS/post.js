(async function () {
    const app = document.getElementById("app");
    if (!app) return;
  
    // lấy slug từ URL: post.html?slug=passing-chord-la-gi
    const slug = new URL(location.href).searchParams.get("slug");
  
    if (!slug) {
      app.innerHTML = `
        <h1>Thiếu slug</h1>
        <p>Mở đúng dạng: <code>post.html?slug=passing-chord-la-gi</code></p>
      `;
      return;
    }
  
    try {
      // post.html nằm trong /HTML, posts.json cũng trong /HTML
      const res = await fetch("./posts.json", { cache: "no-store" });
  
      // debug nhanh nếu lỗi
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
        <pre>${String(err.message || err)}</pre>
      `;
    }
  })();