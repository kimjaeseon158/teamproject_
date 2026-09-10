import { Node, mergeAttributes } from "@tiptap/core";

export default Node.create({
  name: "noticeImage", group: "block", atom: true, draggable: true,
  addAttributes() {
    return {
      imageRef: { default: null, parseHTML: (el) => el.getAttribute("data-notice-image"), renderHTML: (attrs) => ({ "data-notice-image": attrs.imageRef }) },
      src: { default: null }, alt: { default: "첨부 이미지" },
    };
  },
  parseHTML() { return [{ tag: "img[data-notice-image]" }]; },
  renderHTML({ HTMLAttributes }) { return ["img", mergeAttributes(HTMLAttributes)]; },
});
