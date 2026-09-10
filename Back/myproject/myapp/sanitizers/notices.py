# 악성 HTML을 제거해 XSS 공격을 막는 로직, 백엔드 검증의 최종 방어선
from html.parser import HTMLParser
import re

import nh3


NOTICE_HTML_MAX_LENGTH = 50_000
NOTICE_TEXT_MAX_LENGTH = 5_000

NOTICE_CLEANER = nh3.Cleaner(
    tags={
        "img",
        "p",
        "br",
        "span",
        "strong",
        "em",
        "u",
        "s",
        "h1",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "blockquote",
        "a",
    },
    clean_content_tags={"script", "style", "iframe"},
    attributes={
        "img": {"data-notice-image"},
        "p": {"style"},
        "span": {"style"},
        "h1": {"style"},
        "h2": {"style"},
        "h3": {"style"},
        "a": {"href", "target"},
    },
    filter_style_properties={"color", "text-align"},
    url_schemes={"http", "https", "mailto"},
    url_relative="deny",
    link_rel="noopener noreferrer",
    strip_comments=True,
)


class _NoticeTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def sanitize_notice_html(value):
    return NOTICE_CLEANER.clean(value)


def extract_notice_text(value):
    parser = _NoticeTextExtractor()
    parser.feed(value)
    parser.close()
    return "".join(parser.parts)


class _NoticeImageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.references = []
        self.spans = []

    def handle_starttag(self, tag, attrs):
        if tag != "img":
            return
        reference = dict(attrs).get("data-notice-image")
        if reference is None or re.fullmatch(r"order:(0|[1-9][0-9]*)", reference) is None:
            raise ValueError("Image references must use order:N with a non-negative integer.")
        self.references.append(reference)
        self.spans.append((self.getpos(), self.get_starttag_text(), reference))

    handle_startendtag = handle_starttag


def notice_image_references(value):
    parser = _NoticeImageParser()
    parser.feed(value)
    parser.close()
    return parser.references


def remove_notice_image_reference(value, display_order):
    parser = _NoticeImageParser()
    parser.feed(value)
    parser.close()
    offsets = [0] + [match.end() for match in re.finditer("\n", value)]
    for (line, column), tag, reference in reversed(parser.spans):
        if reference == f"order:{display_order}":
            start = offsets[line - 1] + column
            value = value[:start] + value[start + len(tag):]
    return value
