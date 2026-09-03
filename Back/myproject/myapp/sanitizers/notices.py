# 악성 HTML을 제거해 XSS 공격을 막는 로직, 백엔드 검증의 최종 방어선
from html.parser import HTMLParser

import nh3


NOTICE_HTML_MAX_LENGTH = 50_000
NOTICE_TEXT_MAX_LENGTH = 5_000

NOTICE_CLEANER = nh3.Cleaner(
    tags={
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
