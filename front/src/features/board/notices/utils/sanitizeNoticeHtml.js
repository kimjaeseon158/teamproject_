import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "span", "strong", "em", "u", "s", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "a"];
const ALLOWED_COLORS = new Set([
  "#e53e3e", "rgb(229, 62, 62)",
  "#dd6b20", "rgb(221, 107, 32)",
  "#2f855a", "rgb(47, 133, 90)",
  "#2b6cb0", "rgb(43, 108, 176)",
  "#6b46c1", "rgb(107, 70, 193)",
]);
const ALLOWED_ALIGNMENTS = new Set(["left", "center", "right"]);

export default function sanitizeNoticeHtml(html = "") {
  const sanitized = DOMPurify.sanitize(String(html), {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel", "style"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
  const template = document.createElement("template");
  template.innerHTML = sanitized;

  template.content.querySelectorAll("[style]").forEach((element) => {
    const color = element.style.color.toLowerCase();
    const textAlign = element.style.textAlign.toLowerCase();
    element.removeAttribute("style");
    if (ALLOWED_COLORS.has(color)) element.style.color = color;
    if (ALLOWED_ALIGNMENTS.has(textAlign)) element.style.textAlign = textAlign;
    if (!element.getAttribute("style")) element.removeAttribute("style");
  });

  template.content.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!/^(https?:\/\/|mailto:)/i.test(href)) link.removeAttribute("href");
    link.setAttribute("rel", "noopener noreferrer");
    if (link.hasAttribute("href")) link.setAttribute("target", "_blank");
    else link.removeAttribute("target");
  });

  return template.innerHTML;
}
