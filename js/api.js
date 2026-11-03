const WHATSAPP_NUMBER = "306993027531";
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
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("تعذرت قراءة الصورة بعد ضغطها."));
    reader.readAsDataURL(blob);
  });
}

async function compressImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("الملف المختار ليس صورة.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("حجم الصورة الأصلية كبير جداً؛ اختر صورة أقل من 20 MB.");
  }
  if (typeof createImageBitmap !== "function") {
    throw new Error("متصفحك لا يدعم ضغط الصور تلقائياً؛ جرّب متصفحاً أحدث.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 50_000_000) {
      throw new Error("أبعاد الصورة كبيرة جداً؛ اختر صورة بأبعاد أقل.");
    }

    const maxDimension = 1600;
    let scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const targetBytes = 450 * 1024;

    for (let resizeAttempt = 0; resizeAttempt < 7; resizeAttempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("تعذرت معالجة الصورة في هذا المتصفح.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.9, 0.84, 0.78, 0.7, 0.62]) {
        let blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/webp", quality),
        );
        if (!blob) continue;

        // بعض المتصفحات لا تدعم WebP، فنستخدم JPEG كخيار احتياطي.
        if (blob.type !== "image/webp") {
          blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", quality),
          );
        }
        if (blob && blob.size <= targetBytes) return await blobToDataURL(blob);
      }
      scale *= 0.82;
    }
    throw new Error("تعذر ضغط الصورة إلى الحجم المطلوب؛ جرّب صورة أخرى.");
  } finally {
    bitmap.close?.();
  }
}