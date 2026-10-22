# 근무일 기준 단가 이력 API

## 정책

- 사용자·근무지별 단가 기간을 저장한다. `effective_start_date`는 필수이고 `effective_end_date`만 null을 허용한다. 양 끝 날짜를 포함한다.
- 새 이력은 마지막 이력 이후에 추가한다. 마지막 종료일이 null이면 새 시작일 전날로 자동 종료한다. 종료일이 지정되어 있으면 그 이후 시작만 허용한다. 기간 중복은 금지하고 공백은 허용한다.
- 과거 이력 금액·기간 수정은 미승인 급여에만 반영한다. 사용자·근무지는 기존 이력에서 변경할 수 없다.
- 승인 때 단가/기간/항목별 금액/총액을 저장한다. 같은 건을 다시 승인해도 덮어쓰지 않는다. 반려 후 재승인하면 근무일 기준으로 다시 계산한다.
- 승인에 한 번 사용한 이력은 이후 반려되거나 근무가 삭제되어도 삭제할 수 없다.

## 관리자 단가 이력

기존 경로와 사용자별 `users[].rates[]` 응답 구조를 유지한다. rates는 근무지와 시작일 내림차순으로 정렬한다.

- `GET /api/work-place-rate-list-create/`: 전체 이력.
- `GET /api/work-place-rate-list-filtering/?user_name=...&work_place=...`: 이력 검색.
- `POST /api/work-place-rate-list-create/`: 새 기간 등록. 단건 또는 기존 `{"rates": [...]}` 일괄 입력 지원.
- `PATCH /api/work-place-rate-update-delete/`: `rate_uuid`로 기존 이력 일부 수정.
- `DELETE /api/work-place-rate-update-delete/`: `rate_uuid`로 미사용 이력 삭제.

등록 예시 (주간 기본 단가는 8시간 일급, 잔업 등은 기존 시간당 단가):

```json
{
  "user_uuid": "사용자 UUID",
  "work_place": "현장",
  "effective_start_date": "2026-11-01",
  "effective_end_date": null,
  "base_hourly_wage": 120000
}
```

기존처럼 `admin_work_place_uuid`를 사용할 수 있고, 생략한 금액은 해당 관리자 근무지 기본값을 사용한다. 시작일은 자동 추정하지 않으므로 반드시 보낸다.

각 이력에는 날짜 두 필드와 `can_delete`, `delete_block_reason`, 읽기 전용 `used_for_approval`이 추가된다. 저장 뒤 users 목록을 다시 반영해야 자동 종료된 기존 이력이 갱신된다.

등록의 기존 호환 응답은 실패해도 HTTP 200 + `success:false, errors:{필드:오류}`이며 일괄 등록은 항목별 성공/실패와 `partial_success`를 유지한다. PATCH 필드 검증은 HTTP 400 + `success:false, errors`이고 서비스 기간 검증/삭제 제한은 DRF 기본 HTTP 400 필드 오류 객체다. 프론트는 `errors`가 있으면 그 값을, 없으면 응답 객체의 필드 오류를 표시한다.

## 급여 조회

`GET /api/user-monthly-work-summary/?date=YYYY-MM`의 기존 합계/`daily_list`를 유지하며 아래 필드를 추가한다.

```json
{
  "amount": null,
  "amount_breakdown": {},
  "detail_amounts": [],
  "calculation_status": "rate_missing",
  "details_available": false,
  "is_final": false
}
```

- `calculated`: 근무일 단가로 계산된 대기 예상 급여.
- `confirmed`: 저장된 승인 급여. 현재 단가로 재계산하지 않는다.
- `rate_missing`: 해당 날짜에 단가 없음. amount=null.
- `rate_overlap`: 비정상 중복 단가. amount=null.
- `final_amount_missing`: 승인 확정 금액 누락. amount=null, 관리자 확인 필요.
- `rejected`: 반려 건, amount=0.

월 합계는 null 금액을 제외하며 `uncalculated_count`로 미계산 건수를 제공한다. null을 프론트에서 0원으로 표시하지 않는다. 기존 승인 건은 총액만 복원하므로 `details_available=false`일 수 있다.

관리자 `GET /api/admin-page-workday/`의 각 근무에 같은 구조의 `salary` 객체를 추가한다. 기존 근무 필드와 페이지네이션은 유지한다.

사용자 근무지 선택 API는 같은 근무지를 중복 반환하지 않는다. 각 근무지의 가장 최근 이력 UUID/기간을 전달하지만 급여 계산에는 이 UUID를 사용하지 않고 근무일을 사용한다.

## 승인 및 지출

`PATCH /api/admin-workday-status-update/`의 요청 구조를 유지한다. 단가 없는 건의 승인은 HTTP 400으로 거부한다.

```json
{
  "code": "rate_missing",
  "work_date": "2026-11-01",
  "message": "근무일에 적용할 단가가 없거나 적용 기간이 겹칩니다."
}
```

일괄 승인은 전체 트랜잭션이다. 한 건이 실패하면 전체 변경을 취소한다. 프론트는 승인 가능한 건만 선택하되 실패 시 목록을 재조회한다. 승인 상태는 사용자 근무 등록/수정으로 설정할 수 없다.

급여 지출은 승인 경로에서만 생성한다. 연결된 급여 지출을 일반 지출 API에서 직접 수정·삭제할 수 없다. 반려 시 급여 지출을 제거한다.

급여명세서는 승인 스냅샷 금액을 합산한다. 한 달에 단가가 여러 개면 단가 칸에 ‘복수 단가’를 표시한다. 상세 없는 기존 건은 ‘기존 확정 급여(상세 없음)’로 따로 합산한다.

## 데이터 전환과 검증

`0046_rate_history_salary_snapshot` 마이그레이션:

- 기존 단가 시작일은 사용자·근무지의 최초 근무일, 근무가 없으면 한국 날짜 기준 전환일. 종료일 null.
- 기존 승인 금액은 연결된 Expense.amount에서 보존. 과거 상세/단가는 임의 복원하지 않음.
- 승인인데 연결된 지출이 없는 데이터가 있으면 오류로 전환을 중단한다. 해당 건을 확인·정리하고 다시 실행한다.
- 스키마 변경을 되돌릴 때는 이력 다중 행 때문에 이전의 사용자·근무지 유일 조건 복원이 실패할 수 있다. 롤백은 배포 전 DB 백업 복원을 기준으로 한다.

운영 적용 전 백업과 누락 승인 건 점검 후 `python manage.py migrate`를 실행하고 프론트 연동을 배포한다. 이 작업에서는 운영 DB 마이그레이션을 실행하지 않았다.

격리 테스트:

```powershell
python manage.py test myapp.test_rate_history --settings=myproject.test_settings --noinput
```

SQLite 메모리 DB로 업무 규칙/API/전환 함수를 검증한다. PostgreSQL 실제 마이그레이션 및 동시 요청 잠금은 배포 전 별도 검증이 필요하다.
