# 관리자 위젯 배치 API

`GET/PATCH /api/admin/widget-layout/` — 기존 관리자 access JWT를
`Authorization: Bearer <token>`으로 전달합니다. 관리자 ID는 보내지 않습니다.

## 조회와 최초 이전

미저장 상태는 HTTP 200과 아래 응답입니다. GET은 DB 행을 생성하지 않습니다.

```json
{"layout": null, "version": 0, "updated_at": null, "previous_layout": null}
```

서버 `layout`이 null이 아니면 서버 배치를 사용합니다. 빈 객체 `{}`도 저장된
배치입니다. null인 경우에만 기존 localStorage 배치를 `version: 0`으로 PATCH하여
한 번 이전합니다. 로컬 배치도 없으면 기본 배치를 사용합니다.
인증 오류나 서버 장애를 미저장 상태로 해석하지 마세요.

## 저장

PATCH에서도 `layout`과 `version`은 모두 필수입니다. `layout`은 JSON 내부 병합이
아닌 전체 교체입니다. 생략된 위젯은 제거됩니다. 빈 객체도 허용합니다.

```json
{
  "layout": {
    "kpis": {"x": 0, "y": 0, "w": 12, "h": 2, "visible": true}
  },
  "version": 0
}
```

위젯 ID는 비어 있지 않은 문자열입니다. 각 위젯은 x/y(0 이상 정수),
w/h(1 이상 정수), visible(boolean)을 포함해야 합니다. 추가 위젯 속성은 보존합니다.
version은 0 이상 정수입니다. 요청 최상위의 알 수 없는 필드는 거절합니다.

성공은 HTTP 200이며 `layout`, 증가된 `version`, `updated_at`, `previous_layout`을
반환합니다. 최초 저장 버전은 1입니다. 날짜는 Django TIME_ZONE/USE_TZ 설정을 따릅니다.
현재 프로젝트는 USE_TZ=False이므로 시간대 접미사가 없는 Asia/Seoul 로컬 시각입니다.

## 충돌과 복구

버전이 다르면 HTTP 409를 반환하며 저장하지 않습니다.

```json
{
  "code": "layout_version_conflict",
  "detail": "다른 화면에서 배치가 변경되었습니다. 현재 배치를 덮어쓰거나 서버 배치를 불러오세요.",
  "current": {"layout": {}, "version": 4, "updated_at": "2026-09-09T21:00:00", "previous_layout": {}}
}
```

프론트는 현재 편집 내용을 유지해야 합니다. 서버 배치 불러오기는 `current`를 사용하고,
사용자가 덮어쓰기를 선택하면 편집 배치와 `current.version`으로 다시 PATCH합니다.
그 사이 저장이 발생하면 다시 409가 날 수 있습니다. 자동 강제 덮어쓰기는 하지 않습니다.

`previous_layout`은 직전 성공 저장의 배치이며 최초 저장 시 null입니다.
직전 배치 복구는 이 값을 `layout`에 넣고 현재 버전으로 PATCH합니다.
버전은 복구 시에도 증가합니다. 전체 이력은 보관하지 않습니다.

서버 저장 실패 시 편집 내용과 마지막 확인한 서버 버전을 유지합니다.
localStorage fallback은 관리자 계정별 키로 구분하고, 임시 저장을 서버 저장 성공으로
표시하지 않습니다. 프론트 저장 어댑터·이전·충돌 UI는 프론트에서 연결해야 합니다.

## DB 반영

백엔드 배포 시 `python manage.py migrate`로 0043 마이그레이션을 적용합니다.
관리자 삭제 시 배치도 함께 삭제됩니다. PostgreSQL에서 관리자 행 잠금으로 최초 생성과
버전 검사/저장을 직렬화합니다.
