const WHATSAPP_NUMBER = "306993027531";
const STORAGE_KEY = "misk-perfumes-products-v1";
const seedProducts = [
  {
    id: "p1",
    name: "ميس ديور",
    category: "نسائي",
    price: 45,
    image: "assets/perfume-feminine.jpg",
    description:
      "عطر نسائي فاخر يجمع بين الأناقة والأنوثة في توليفة زهرية دافئة.",
    extra:
      "مناسب لجميع المواسم. نفحات من الورد والياسمين ولمسة فاخرة تدوم طويلاً.",
    offer: true,
  },
  {
    id: "p2",
    name: "سوفاج",
    category: "رجالي",
    price: 50,
    image: "assets/perfume-masculine.jpg",
    description: "حضور قوي ونفحات منعشة للرجل الذي يترك أثراً لا يُنسى.",
    extra:
      "توليفة خشبية منعشة بلمسة من البرغموت والفلفل. مناسب للاستخدام اليومي والمناسبات.",
    offer: false,
  },
  {
    id: "p3",
    name: "يارا",
    category: "نسائي",
    price: 35,
    image: "assets/perfume-feminine.jpg",
    description: "عطر ناعم بحلاوة متوازنة، يرافقك بنفحات رقيقة ومميزة.",
    extra: "رائحة زهرية فاكهية بطابع دافئ. خيار جميل للنهار وللإهداء.",
    offer: false,
  },
  {
    id: "p4",
    name: "بلو دو شانيل",
    category: "رجالي",
    price: 65,
    image: "assets/perfume-masculine.jpg",
    description: "عطر أنيق بنفحات عميقة تعبّر عن الثقة والحرية.",
    extra: "مزيج منعش من الحمضيات والأخشاب العطرية. مناسب لكل المواسم.",
    offer: false,
  },
  {
    id: "p5",
    name: "بوكس مسك الذهبي",
    category: "بوكس",
    price: 75,
    image: "assets/perfume-gift.jpg",
    description: "هدية متكاملة بتفاصيل أنيقة، تجمع بين العطر والتغليف الفاخر.",
    extra: "بوكس هدايا فاخر بتغليف أسود وشريط ذهبي. مثالي للمناسبات الخاصة.",
    offer: true,
  },
  {
    id: "p6",
    name: "كهرمان",
    category: "رجالي",
    price: 45,
    image: "assets/perfume-masculine.jpg",
    description: "نفحات شرقية دافئة تمنح إطلالتك لمسة من الفخامة.",
    extra: "مزيج من العنبر والأخشاب والتوابل. رائحة ثابتة للأمسيات والمناسبات.",
    offer: false,
  },
];
let products = loadProducts();
let activeFilter = "الكل";
let editingProductId = null;
let uploadData = "";
let toastTimer;

function loadProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : seedProducts.map((p) => ({ ...p }));
  } catch {
    return seedProducts.map((p) => ({ ...p }));
  }
}
function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
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
function whatsappUrl(product, quantity = 1) {
  const message = product
    ? [
        "مرحباً، أود طلب المنتج التالي:",
        `الاسم: ${product.name}`,
        `القسم: ${product.category}`,
        `السعر للوحدة: ${product.price} $`,
        `الكمية: ${quantity}`,
        `الإجمالي: ${(Number(product.price) * Number(quantity)).toFixed(Number(product.price) % 1 || Number(quantity) % 1 ? 2 : 0)} $`,
        `الوصف: ${product.description}`,
        `تفاصيل المنتج: ${product.extra || product.description}`,
        `العرض: ${product.offer ? "نعم، عرض مميز" : "لا"}`,
      ].join("\n")
    : "مرحباً، أود الاستفسار عن عطور مسك.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
function visibleProducts() {
  let list = products.filter(
    (p) => activeFilter === "الكل" || p.category === activeFilter,
  );
  const sort = document.getElementById("sortSelect")?.value;
  if (sort === "price-low")
    list.sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === "price-high")
    list.sort((a, b) => Number(b.price) - Number(a.price));
  return list;
}
function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const list = visibleProducts();
  grid.innerHTML = list.length
    ? list
        .map(
          (p, i) => `<article class="product-card" style="--i:${i}">
    <div class="product-image-wrap"><img src="${escapeHtml(p.image || "assets/perfume-masculine.jpg")}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='assets/perfume-masculine.jpg'" />${p.offer ? '<span class="product-tag sale">عرض مميز</span>' : `<span class="product-tag">${escapeHtml(p.category)}</span>`}<button class="favorite-button" data-favorite="${escapeHtml(p.id)}" aria-label="إضافة إلى المفضلة">♡</button></div>
    <div class="product-card-copy"><div class="product-meta"><span>${escapeHtml(p.category)} · مِسك</span><span>✦ ✦ ✦ ✦ ✦</span></div><h3>${escapeHtml(p.name)}</h3><p class="product-desc">${escapeHtml(p.description)}</p><div class="product-card-bottom"><span class="product-price">${money(p.price)}</span><div class="card-actions"><button class="details-button" data-details="${escapeHtml(p.id)}">تفاصيل أكثر</button><a class="add-button order-now-button" href="${whatsappUrl(p, 1)}" target="_blank" rel="noopener noreferrer">اطلب الآن ↗</a></div></div></div></article>`,
        )
        .join("")
    : '<div class="empty-products">لا توجد منتجات في هذا القسم حالياً.</div>';
  document
    .querySelectorAll(".filter-tab")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.filter === activeFilter),
    );
  const allTab = document.querySelector('.filter-tab[data-filter="الكل"] span');
  if (allTab) allTab.textContent = String(products.length).padStart(2, "0");
}
function setFilter(filter) {
  activeFilter = filter;
  renderProducts();
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
function showDetails(product) {
  document.getElementById("modalImage").src =
    product.image || "assets/perfume-masculine.jpg";
  document.getElementById("modalImage").alt = product.name;
  document.getElementById("modalCategory").textContent =
    `${product.category} · مِسك للعطور`;
  document.getElementById("modalName").textContent = product.name;
  document.getElementById("modalPrice").innerHTML = money(product.price);
  document.getElementById("modalDescription").textContent = product.description;
  document.getElementById("modalExtra").textContent =
    product.extra || product.description;
  const quantityInput = document.getElementById("modalQuantity");
  const orderLink = document.getElementById("modalWhatsApp");
  quantityInput.value = "1";
  const updateOrderLink = () => {
    const quantity = Math.min(
      99,
      Math.max(1, Number(quantityInput.value) || 1),
    );
    quantityInput.value = String(quantity);
    orderLink.href = whatsappUrl(product, quantity);
  };
  quantityInput.oninput = updateOrderLink;
  updateOrderLink();
  openModal("productModal");
}
function adminTable() {
  if (!products.length)
    return '<div class="empty-products">لا توجد منتجات. أضف منتجاً جديداً للبدء.</div>';
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>المنتج</th><th>القسم</th><th>السعر</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>${products.map((p) => `<tr><td><div class="admin-product"><img src="${escapeHtml(p.image)}" onerror="this.src='assets/perfume-masculine.jpg'" alt="" /><span>${escapeHtml(p.name)}</span></div></td><td>${escapeHtml(p.category)}</td><td>$${escapeHtml(p.price)}</td><td>${p.offer ? "عرض مميز" : "عادي"}</td><td><button class="table-action" data-edit="${escapeHtml(p.id)}">تعديل</button><button class="table-action delete" data-delete="${escapeHtml(p.id)}">حذف</button></td></tr>`).join("")}</tbody></table></div>`;
}
function renderDashboard(pane = "overview") {
  const content = document.getElementById("dashboardContent");
  if (!content) return;
  const title =
    {
      overview: "نظرة عامة",
      manage: "إدارة المنتجات",
      add: editingProductId ? "تعديل المنتج" : "إضافة منتج جديد",
      edit: "تعديل المنتج",
    }[pane] || "نظرة عامة";
  document.getElementById("dashboardTitle").textContent = title;
  document
    .querySelectorAll(".dash-nav")
    .forEach((b) =>
      b.classList.toggle(
        "active",
        b.dataset.pane === pane ||
          (pane === "edit" && b.dataset.pane === "manage"),
      ),
    );
  if (pane === "overview") {
    content.innerHTML = `<div class="stats-grid"><div class="stat-card"><small>إجمالي المنتجات</small><strong>${products.length}</strong><span>منتج في المتجر</span></div><div class="stat-card"><small>منتجات عليها عرض</small><strong>${products.filter((p) => p.offer).length}</strong><span>تظهر بوسم عرض مميز</span></div><div class="stat-card"><small>أقسام المتجر</small><strong>03</strong><span>نسائي · رجالي · بوكس</span></div></div><div class="dash-section-title"><h3>أحدث المنتجات</h3><button class="dash-action" data-open-pane="manage">عرض الكل ←</button></div>${adminTable()}`;
  } else if (pane === "manage") {
    content.innerHTML = `<div class="dash-section-title" style="margin-top:0"><h3>قائمة منتجات المتجر (${products.length})</h3><button class="dash-action" data-open-pane="add">＋ إضافة منتج</button></div>${adminTable()}`;
  } else if (pane === "add" || pane === "edit") {
    const product = editingProductId
      ? products.find((p) => p.id === editingProductId)
      : null;
    uploadData = product?.image || "";
    content.innerHTML = `<form class="product-form" id="productForm"><div class="form-grid"><label>اسم المنتج<input name="name" required maxlength="60" value="${escapeHtml(product?.name || "")}" placeholder="مثال: عطر ميس ديور" /></label><label>السعر<input name="price" type="number" min="0" step="0.01" required value="${escapeHtml(product?.price ?? "")}" placeholder="45" /></label></div><div class="form-grid"><label>القسم<select name="category"><option ${product?.category === "نسائي" ? "selected" : ""}>نسائي</option><option ${product?.category === "رجالي" ? "selected" : ""}>رجالي</option><option ${product?.category === "بوكس" ? "selected" : ""}>بوكس</option></select></label><label>رابط الصورة (اختياري)<input name="imageUrl" type="url" value="${escapeHtml(product?.image?.startsWith("data:") ? "" : product?.image || "")}" placeholder="https://..." /></label></div><label>رفع صورة من جهازك<input id="imageFile" type="file" accept="image/*" /></label><img class="upload-preview" id="uploadPreview" src="${escapeHtml(product?.image || "")}" style="${product?.image ? "display:block" : ""}" alt="معاينة الصورة" /><label>الوصف<input name="description" required value="${escapeHtml(product?.description || "")}" placeholder="وصف قصير للمنتج" /></label><label>تفاصيل أكثر<textarea name="extra" placeholder="الموسم المناسب، النفحات، الثبات...">${escapeHtml(product?.extra || "")}</textarea></label><label class="form-check"><input type="checkbox" name="offer" ${product?.offer ? "checked" : ""} /> هذا المنتج عرض مميز</label><div class="form-buttons"><button class="button button-gold">${product ? "حفظ التعديلات" : "حفظ المنتج"} <span>✓</span></button><button type="button" class="button button-light" data-open-pane="manage">إلغاء</button></div></form>`;
  }
  content.querySelectorAll("[data-open-pane]").forEach((btn) =>
    btn.addEventListener("click", () => {
      editingProductId = null;
      renderDashboard(btn.dataset.openPane);
    }),
  );
  content.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => {
      editingProductId = btn.dataset.edit;
      renderDashboard("edit");
    }),
  );
  content.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const p = products.find((x) => x.id === btn.dataset.delete);
      if (p && confirm(`حذف المنتج «${p.name}» من العرض المحلي؟`)) {
        products = products.filter((x) => x.id !== p.id);
        saveProducts();
        renderProducts();
        renderDashboard("manage");
        showToast("تم حذف المنتج من بيانات هذا المتصفح");
      }
    }),
  );
  const form = document.getElementById("productForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const existing = editingProductId
        ? products.find((p) => p.id === editingProductId)
        : null;
      const image =
        (fd.get("imageUrl") || "").trim() ||
        uploadData ||
        existing?.image ||
        "assets/perfume-masculine.jpg";
      const item = {
        id: existing?.id || `p${Date.now()}`,
        name: fd.get("name").trim(),
        category: fd.get("category"),
        price: Number(fd.get("price")),
        image,
        description: fd.get("description").trim(),
        extra: (fd.get("extra") || "").trim(),
        offer: fd.get("offer") === "on",
      };
      if (existing)
        products = products.map((p) => (p.id === existing.id ? item : p));
      else products.unshift(item);
      saveProducts();
      editingProductId = null;
      renderProducts();
      renderDashboard("manage");
      showToast(
        existing ? "تم حفظ التعديلات محلياً" : "تمت إضافة المنتج محلياً",
      );
    });
    document.getElementById("imageFile")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 1600000) {
        showToast("حجم الصورة كبير؛ اختر صورة أقل من 1.6 MB");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        uploadData = String(reader.result);
        const preview = document.getElementById("uploadPreview");
        preview.src = uploadData;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }
}
function openDashboard() {
  editingProductId = null;
  renderDashboard("overview");
  openModal("dashboardModal");
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

// Frontend-only demo manager. This is intentionally not real authentication.
document.getElementById("siteBrand").addEventListener("dblclick", (event) => {
  event.preventDefault();
  document.getElementById("loginForm").reset();
  document.getElementById("loginError").textContent = "";
  openModal("adminLoginModal");
});
document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value;
  if (username === "admin" && password === "misk123") {
    closeModal("adminLoginModal");
    openDashboard();
    return;
  }
  document.getElementById("loginError").textContent =
    "اسم المستخدم أو كلمة المرور غير صحيحة.";
});
document.querySelectorAll(".dash-nav").forEach((btn) =>
  btn.addEventListener("click", () => {
    editingProductId = null;
    renderDashboard(btn.dataset.pane);
  }),
);
document.getElementById("adminLogout").addEventListener("click", () => {
  closeModal("dashboardModal");
  showToast("تم إغلاق لوحة الإدارة التجريبية");
});
