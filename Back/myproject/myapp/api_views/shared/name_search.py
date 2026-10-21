"""Shared name filters supporting Hangul initials without matching finals."""

import re


HANGUL_INITIALS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"


def name_search_pattern(keyword):
    parts = []
    for character in keyword:
        if character in HANGUL_INITIALS:
            start = 0xAC00 + HANGUL_INITIALS.index(character) * 588
            parts.append(f"[{character}{chr(start)}-{chr(start + 587)}]")
        else:
            parts.append(re.escape(character))
    return "".join(parts)


def filter_by_name(queryset, keyword):
    """Keep filtering in SQL so employee pagination uses the filtered count."""
    if not keyword:
        return queryset
    if any(character in HANGUL_INITIALS for character in keyword):
        return queryset.filter(user_name__iregex=name_search_pattern(keyword))
    return queryset.filter(user_name__icontains=keyword)
