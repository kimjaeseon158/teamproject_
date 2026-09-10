export function prepareNoticeContent(content, existingImages, files) {
  const doc = new DOMParser().parseFromString(content, "text/html");
  const start = Math.max(-1, ...existingImages.map((image) => image.display_order)) + 1;
  doc.querySelectorAll("img").forEach((image) => {
    const ref = image.getAttribute("data-notice-image");
    const index = files.findIndex((file) => file.noticeRef === ref);
    if (index >= 0) image.setAttribute("data-notice-image", `order:${start + index}`);
    else if (!existingImages.some((item) => ref === `order:${item.display_order}`)) { image.remove(); return; }
    image.removeAttribute("src");
  });
  return doc.body.innerHTML;
}

export function referencedImageOrders(content) {
  const doc = new DOMParser().parseFromString(content || "", "text/html");
  return new Set(Array.from(doc.querySelectorAll("img[data-notice-image]"),
    (image) => image.getAttribute("data-notice-image")));
}
