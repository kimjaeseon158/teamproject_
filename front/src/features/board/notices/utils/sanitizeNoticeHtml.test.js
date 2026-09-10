import sanitizeNoticeHtml from "./sanitizeNoticeHtml";

describe("sanitizeNoticeHtml", () => {
  test("허용된 공지 서식은 유지한다", () => {
    const result = sanitizeNoticeHtml(
      '<h2>제목</h2><p style="color:#e53e3e;text-align:center"><strong>내용</strong></p>'
    );
    const documentNode = new DOMParser().parseFromString(result, "text/html");
    const paragraph = documentNode.querySelector("p");

    expect(documentNode.querySelector("h2")?.textContent).toBe("제목");
    expect(documentNode.querySelector("strong")?.textContent).toBe("내용");
    expect(paragraph?.style.color).toBe("rgb(229, 62, 62)");
    expect(paragraph?.style.textAlign).toBe("center");
  });

  test("위험한 태그와 속성은 제거한다", () => {
    const result = sanitizeNoticeHtml(
      '<p onclick="alert(1)" style="position:fixed">안전한 내용</p><script>alert(1)</script><iframe src="https://example.com"></iframe>'
    );

    expect(result).toContain("안전한 내용");
    expect(result).not.toMatch(/script|iframe|onclick|position/i);
  });

  test("안전한 링크만 새 창 링크로 유지한다", () => {
    const result = sanitizeNoticeHtml(
      '<a href="javascript:alert(1)">위험</a><a href="https://example.com">안전</a>'
    );
    const documentNode = new DOMParser().parseFromString(result, "text/html");
    const links = documentNode.querySelectorAll("a");

    expect(links[0].hasAttribute("href")).toBe(false);
    expect(links[1].getAttribute("href")).toBe("https://example.com");
    expect(links[1].getAttribute("target")).toBe("_blank");
    expect(links[1].getAttribute("rel")).toBe("noopener noreferrer");
  });
});
