const STORAGE_KEY = "misk-perfumes-products-v1";
const seedProducts = [
  {
    id: "p1",
    name: "ميس ديور",
    category: "نسائي",
    price: 45,
    image: "../assets/perfume-feminine.jpg",
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
    image: "../assets/perfume-masculine.jpg",
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
    image: "../assets/perfume-feminine.jpg",
    description: "عطر ناعم بحلاوة متوازنة، يرافقك بنفحات رقيقة ومميزة.",
    extra: "رائحة زهرية فاكهية بطابع دافئ. خيار جميل للنهار وللإهداء.",
    offer: false,
  },
  {
    id: "p4",
    name: "بلو دو شانيل",
    category: "رجالي",
    price: 65,
    image: "../assets/perfume-masculine.jpg",
    description: "عطر أنيق بنفحات عميقة تعبّر عن الثقة والحرية.",
    extra: "مزيج منعش من الحمضيات والأخشاب العطرية. مناسب لكل المواسم.",
    offer: false,
  },
  {
    id: "p5",
    name: "بوكس مسك الذهبي",
    category: "بوكس",
    price: 75,
    image: "../assets/perfume-gift.jpg",
    description: "هدية متكاملة بتفاصيل أنيقة، تجمع بين العطر والتغليف الفاخر.",
    extra: "بوكس هدايا فاخر بتغليف أسود وشريط ذهبي. مثالي للمناسبات الخاصة.",
    offer: true,
  },
  {
    id: "p6",
    name: "كهرمان",
    category: "رجالي",
    price: 45,
    image: "../assets/perfume-masculine.jpg",
    description: "نفحات شرقية دافئة تمنح إطلالتك لمسة من الفخامة.",
    extra: "مزيج من العنبر والأخشاب والتوابل. رائحة ثابتة للأمسيات والمناسبات.",
    offer: false,
  },
];
let products = loadProducts();
let activeFilter = "الكل";
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
    <div class="product-image-wrap"><img src="${escapeHtml(p.image || "../assets/perfume-masculine.jpg")}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='../assets/perfume-masculine.jpg'" />${p.offer ? '<span class="product-tag sale">عرض مميز</span>' : `<span class="product-tag">${escapeHtml(p.category)}</span>`}<button class="favorite-button" data-favorite="${escapeHtml(p.id)}" aria-label="إضافة إلى المفضلة">♡</button></div>
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
function showDetails(product) {
  document.getElementById("modalImage").src =
    product.image || "../assets/perfume-masculine.jpg";
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