const ADMIN_SESSION_KEY = "misk-store-admin-logged-in-v1";
let editingProductId = null;
let uploadData = "";

function adminTable() {
  if (!products.length)
    return '<div class="empty-products">لا توجد منتجات. أضف منتجاً جديداً للبدء.</div>';
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>المنتج</th><th>القسم</th><th>السعر</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>${products.map((p) => `<tr><td><div class="admin-product"><img src="${escapeHtml(p.image)}" onerror="this.src='../assets/perfume-masculine.jpg'" alt="" /><span>${escapeHtml(p.name)}</span></div></td><td>${escapeHtml(p.category)}</td><td>$${escapeHtml(p.price)}</td><td>${p.offer ? "عرض مميز" : "عادي"}</td><td><button class="table-action" data-edit="${escapeHtml(p.id)}">تعديل</button><button class="table-action delete" data-delete="${escapeHtml(p.id)}">حذف</button></td></tr>`).join("")}</tbody></table></div>`;
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
    content.innerHTML = `<form class="product-form" id="productForm"><div class="form-grid"><label>اسم المنتج<input name="name" required maxlength="60" value="${escapeHtml(product?.name || "")}" placeholder="مثال: عطر ميس ديور" /></label><label>السعر<input name="price" type="number" min="0" step="0.01" required value="${escapeHtml(product?.price ?? "")}" placeholder="45" /></label></div><label>القسم<select name="category"><option ${product?.category === "نسائي" ? "selected" : ""}>نسائي</option><option ${product?.category === "رجالي" ? "selected" : ""}>رجالي</option><option ${product?.category === "بوكس" ? "selected" : ""}>بوكس</option></select></label><label>رفع صورة من جهازك<input id="imageFile" type="file" accept="image/*" /></label><img class="upload-preview" id="uploadPreview" src="${escapeHtml(product?.image || "")}" style="${product?.image ? "display:block" : ""}" alt="معاينة الصورة" /><label>الوصف<input name="description" required value="${escapeHtml(product?.description || "")}" placeholder="وصف قصير للمنتج" /></label><label>تفاصيل أكثر<textarea name="extra" placeholder="الموسم المناسب، النفحات، الثبات...">${escapeHtml(product?.extra || "")}</textarea></label><label class="form-check"><input type="checkbox" name="offer" ${product?.offer ? "checked" : ""} /> هذا المنتج عرض مميز</label><div class="form-buttons"><button class="button button-gold">${product ? "حفظ التعديلات" : "حفظ المنتج"} <span>✓</span></button><button type="button" class="button button-light" data-open-pane="manage">إلغاء</button></div></form>`;
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
        uploadData ||
        existing?.image ||
        "../assets/perfume-masculine.jpg";
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
    document.getElementById("imageFile")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const input = e.target;
      input.disabled = true;
      showToast("جارٍ ضغط الصورة...");
      try {
        uploadData = await compressImage(file);
        const preview = document.getElementById("uploadPreview");
        preview.src = uploadData;
        preview.style.display = "block";
        const sizeKB = Math.round((uploadData.length * 0.75) / 1024);
        showToast(`تم ضغط الصورة وتجهيزها — حوالي ${sizeKB} KB`);
      } catch (error) {
        console.error(error);
        showToast(error.message || "تعذرت معالجة الصورة.");
        input.value = "";
      } finally {
        input.disabled = false;
      }
    });
  }
}
function openDashboard() {
  editingProductId = null;
  renderDashboard("overview");
  openModal("dashboardModal");
}

// Frontend-only demo manager. This is intentionally not real authentication.
document.getElementById("siteBrand").addEventListener("dblclick", (event) => {
  event.preventDefault();
  if (isAdminLoggedIn()) {
    openDashboard();
    return;
  }
  document.getElementById("loginForm").reset();
  document.getElementById("loginError").textContent = "";
  openModal("adminLoginModal");
});
document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value;
  if (username === "admin" && password === "misk123") {
    setAdminLoggedIn(true);
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
  setAdminLoggedIn(false);
  closeModal("dashboardModal");
  showToast("تم تسجيل الخروج من لوحة الإدارة");
});

function isAdminLoggedIn() {
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function setAdminLoggedIn(isLoggedIn) {
  try {
    if (isLoggedIn) localStorage.setItem(ADMIN_SESSION_KEY, "true");
    else localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (error) {
    console.error("تعذر حفظ حالة تسجيل الدخول في هذا المتصفح.", error);
  }
}

// استعادة لوحة الإدارة تلقائياً إذا لم يكن المدير قد سجّل الخروج.
if (isAdminLoggedIn()) openDashboard();