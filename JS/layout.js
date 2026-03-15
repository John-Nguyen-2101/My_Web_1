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
  });