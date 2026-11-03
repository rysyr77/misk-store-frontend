let toastTimer;

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
}
function money(amount) {
  return `$${Number(amount).toFixed(Number(amount) % 1 ? 2 : 0)}`;
}
function showToast(text) {
  const t = document.getElementById("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2300);
}
function openModal(id) {
  document.getElementById(id)?.classList.add("open");
  document.body.classList.add("modal-open");
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
  if (!document.querySelector(".modal-backdrop.open"))
    document.body.classList.remove("modal-open");
}

// Storefront events
renderProducts();
document
  .querySelectorAll(".filter-tab")
  .forEach((button) =>
    button.addEventListener("click", () => setFilter(button.dataset.filter)),
  );
document
  .getElementById("sortSelect")
  .addEventListener("change", renderProducts);
document.getElementById("productGrid").addEventListener("click", (e) => {
  const details = e.target.closest("[data-details]");
  if (details) {
    const p = products.find((x) => x.id === details.dataset.details);
    if (p) showDetails(p);
    return;
  }
  const fav = e.target.closest("[data-favorite]");
  if (fav) {
    fav.classList.toggle("active");
    fav.textContent = fav.classList.contains("active") ? "♥" : "♡";
    showToast(
      fav.classList.contains("active")
        ? "أُضيف إلى المفضلة"
        : "أُزيل من المفضلة",
    );
  }
});
document.querySelectorAll("[data-filter-link]").forEach((link) =>
  link.addEventListener("click", () => {
    setFilter(link.dataset.filterLink);
    document.getElementById("mainNav").classList.remove("open");
  }),
);
document.getElementById("contactWhatsApp").href = whatsappUrl();
document
  .getElementById("mobileMenu")
  .addEventListener("click", () =>
    document.getElementById("mainNav").classList.toggle("open"),
  );
document
  .querySelectorAll("[data-close]")
  .forEach((btn) =>
    btn.addEventListener("click", () => closeModal(btn.dataset.close)),
  );
document.querySelectorAll(".modal-backdrop").forEach((backdrop) =>
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal(backdrop.id);
  }),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document
      .querySelectorAll(".modal-backdrop.open")
      .forEach((modal) => closeModal(modal.id));
  }
});