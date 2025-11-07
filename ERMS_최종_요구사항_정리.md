# 건설장비 및 인력관리 시스템(ERMS) - 최종 요구사항 정리

**작성일**: 2025-10-27  
**목적**: 실제 현장 업무 프로세스에 맞는 완벽한 요구사항 정리

---

## 📋 시스템 개요

건설 현장에서 **장비 임대 사업자(Owner)**가 장비와 운전자를 관리하고, **시공사(BP)**와 **발주처(EP)**가 이를 승인하고 관리하는 통합 시스템입니다.

### 핵심 사용자

| 역할 | 설명 | 로그인 방식 |
|------|------|-----------|
| **Admin** | 시스템 관리자 | 이메일/비밀번호 |
| **Owner** | 장비 임대 사업자 | 이메일/비밀번호 |
| **BP** | 시공사 (협력사) | 이메일/비밀번호 |
| **EP** | 발주처 | 이메일/비밀번호 |
| **Worker** | 장비 운전자 | 차량번호 + PIN |
| **Inspector** | 안전 점검원 | PIN |

---

## 🎯 핵심 업무 프로세스

### 1. 반입 요청 프로세스

```
Owner → BP → EP
  ↓      ↓     ↓
요청   승인  최종승인
```

#### 1.1. Owner: 반입 요청 생성
- 장비 및 인력 선택
- 투입 예정일, 철수 예정일 입력
- 투입 목적 입력
- **서류 자동 검증** (만료일 체크)
- BP에게 요청 전송
- **메일로도 전송** (현재 업무 방식 유지)

#### 1.2. BP: 1차 승인
- 반입 요청 확인
- 서류 다운로드 (PDF)
- **장비 사용 계획서 첨부**
- EP에게 승인 요청

#### 1.3. EP: 최종 승인
- 반입 요청 확인
- 서류 다운로드 (PDF)
- 최종 승인 → **투입 시작**

---

### 2. 투입 관리 프로세스

#### 2.1. 투입 등록 (자동)
- EP 승인 시 자동으로 투입 등록
- 투입 기간: 반입 요청의 예정일 기준
- 상태: `active` (투입 중)

#### 2.2. Owner: 투입 관리
- **투입 중인 장비/인력 목록 조회**
- **투입 기간 연장**
  - 예정 반출일 변경
  - 연장 사유 입력
  - BP 승인 필요 (선택사항)
- **운전자 교체**
  - 새 운전자 선택 (검증된 인력만)
  - 교체 사유 입력
  - 교체 이력 저장

#### 2.3. BP/EP: 투입 현황 조회
- 투입 중인 장비 목록
- 투입 기간, 남은 기간
- 서류 만료일 확인
- 작업 현황 (작업확인서 연동)

---

### 3. Worker 모바일 앱 - 작업 관리

#### 3.1. 로그인
**새로운 방식** (제안):
1. 차량 번호 뒷자리 4자리 입력 (예: 1234)
2. 해당 차량 목록 표시
3. 본인 차량 선택
4. PIN 입력 (기본: 0000)
5. 첫 로그인 시 PIN 변경 권장

**장점**:
- 차량 번호는 쉽게 기억
- PIN 분실 시 차량 번호로 찾기 가능
- 보안 강화 (차량 + PIN 2단계)

#### 3.2. 작업 시작
- "작업 시작" 버튼 클릭
- 시작 시간 자동 기록
- **GPS 위치 전송 시작** (5분 간격, 조정 가능)
- 작업 세션 생성

#### 3.3. 휴식
- "휴식" 버튼 클릭
- 휴식 시작 시간 기록
- "휴식 종료" 버튼 클릭
- 휴식 시간 자동 계산

#### 3.4. 작업 종료
- "작업 종료" 버튼 클릭
- 종료 시간 자동 기록
- GPS 위치 전송 중지
- **작업확인서 자동 생성**
  - 작업 시간 자동 계산
  - 휴식 시간 제외
  - 초과 근무 시간 자동 계산

#### 3.5. 작업확인서 작성
- 자동 생성된 작업확인서 확인
- **작업 위치** 입력 ✏️
- **작업 내용** 입력 ✏️
- 시간 수정 가능 (필요 시)
- 확인 버튼 클릭 → Owner에게 제출

#### 3.6. 장비 일일 점검표 작성
- 작업 시작 전 점검표 작성
- **운행 시간** 입력 (계기판 확인)
- **가동 시간** 입력 (아워미터 확인)
- 점검 항목 체크 (장비 종류별로 다름)
- 이상 발견 시 상세 입력
- 사진 첨부 (선택)
- Owner에게 제출

**목적**:
- 차량 정비 예정일 관리
- 사고 방지
- 장비 상태 기록

---

### 4. Owner - 작업확인서 관리

#### 4.1. 일별 작업확인서
- Worker가 제출한 작업확인서 확인
- 내용 검토
- **BP에게 서명 요청**
  - 옵션 A: 시스템 내에서 직접 서명 요청
  - 옵션 B: 메일로 서명 요청 (PDF 첨부)

#### 4.2. 월별 작업확인서
- 일별 작업확인서 자동 취합
- 월별 요약 (총 작업 시간, 초과 근무 등)
- BP에게 서명 요청

#### 4.3. 작업확인서 조회
- 날짜별, 장비별, 운전자별 조회
- BP 서명 상태 확인
- PDF 다운로드

---

### 5. BP - 작업확인서 서명

#### 5.1. 작업확인서 목록
- Owner가 제출한 작업확인서 목록
- 서명 대기 중인 작업확인서 표시
- 날짜별, Owner별 필터링

#### 5.2. 작업확인서 서명
- 작업확인서 내용 확인
- **전자서명** (터치/마우스)
- 담당자명 입력
- 의견 입력 (선택)
- 서명 완료 → **PDF 자동 생성 및 저장**

#### 5.3. 서명 완료 후
- Owner에게 알림
- PDF 다운로드 가능
- 서명된 작업확인서 보관

---

### 6. 장비 점검표 관리

#### 6.1. Worker: 장비 일일 점검표
- **목적**: 차량 정비 예정일 관리, 사고 방지
- 작업 시작 전 작성
- 운행 시간, 가동 시간 입력
- 점검 항목 체크 (장비 종류별)
- Owner에게 제출

#### 6.2. Inspector: 안전 점검표
- **목적**: 현장 안전 관리
- EP 요구사항
- 현장 안전 점검 항목 체크
- BP 및 EP에게 제출

**차이점**:
- Worker 점검표: 장비 상태 중심
- Inspector 점검표: 현장 안전 중심

---

### 7. 실시간 위치 추적

#### 7.1. GPS 위치 전송
- Worker가 작업 시작 시 자동 전송 시작
- **5분 간격** (조정 가능)
- 위치 정보: 위도, 경도, 정확도, 시간
- 작업 종료 시 전송 중지

#### 7.2. Owner: 위치 추적
- 투입 중인 장비/인력 실시간 위치 표시
- 지도에 마커 표시
- 마지막 위치 업데이트 시간 표시

#### 7.3. BP: 위치 추적
- Owner별 장비 위치 표시
- 장비별 필터링

#### 7.4. EP: 위치 추적
- BP별, Owner별, 장비별 필터링
- 전체 현장 장비 위치 한눈에 확인

---

### 8. 긴급 상황 알림

#### 8.1. Worker: 긴급 버튼
- 모바일 앱에 긴급 버튼 배치
- 버튼 클릭 시:
  - 현재 위치 전송
  - Owner, BP, EP에게 즉시 알림
  - 긴급 상황 유형 선택 (사고, 고장, 기타)

#### 8.2. 긴급 알림 수신
- 실시간 알림 (푸시, 메일)
- 긴급 상황 목록 조회
- 위치 확인
- 상태 업데이트 (처리 중, 완료)

---

## 📊 데이터베이스 구조

### 핵심 테이블

#### 1. users (사용자)
```sql
- id, name, email, password, pin
- role (admin, owner, bp, ep, worker, inspector)
- company_id (소속 회사)
```

#### 2. companies (회사)
```sql
- id, name, type (owner, bp, ep)
- business_number, phone, address
- contact_person, contact_phone
```

#### 3. equipment (장비)
```sql
- id, name, type, license_plate
- license_plate_last4 (뒷자리 4자리, 검색용)
- owner_id, current_driver_id
```

#### 4. workers (인력)
```sql
- id, name, phone, pin (기본: 0000)
- owner_id, equipment_id (현재 배정 장비)
- license_number, license_type
```

#### 5. entry_requests (반입 요청)
```sql
- id, request_number, status
- bp_company_id, owner_id
- requested_start_date, requested_end_date
- owner_approved_at, bp_approved_at, ep_approved_at
```

#### 6. entry_request_items (반입 요청 아이템)
```sql
- id, entry_request_id
- item_type (equipment/worker)
- item_id, document_status
```

#### 7. deployments (투입 관리)
```sql
- id, entry_request_id
- equipment_id, worker_id
- owner_id, bp_company_id, ep_company_id
- start_date, planned_end_date, actual_end_date
- status (active, extended, completed)
```

#### 8. work_sessions (작업 세션)
```sql
- id, deployment_id, worker_id, equipment_id
- start_time, end_time
- break_start_time, break_end_time, break_duration
- status (started, break, ended)
```

#### 9. location_logs (GPS 위치 로그)
```sql
- id, worker_id, equipment_id, work_session_id
- latitude, longitude, accuracy
- logged_at
```

#### 10. daily_work_confirmations (일별 작업확인서)
```sql
- id, work_session_id, deployment_id
- owner_id, bp_company_id, worker_id, equipment_id
- work_date, work_location, work_content
- start_time, end_time, break_duration
- total_work_minutes, overtime_minutes
- worker_confirmed, submitted_at
- bp_signature, bp_confirmed_at
- pdf_file_path, status
```

#### 11. monthly_work_confirmations (월별 작업확인서)
```sql
- id, owner_id, bp_company_id, worker_id, equipment_id
- year, month
- total_days, total_work_minutes, total_overtime_minutes
- bp_signature, bp_confirmed_at
- pdf_file_path, status
```

#### 12. equipment_daily_inspections (장비 일일 점검표)
```sql
- id, equipment_id, worker_id, deployment_id
- inspection_date
- odometer_reading (운행 시간)
- hour_meter_reading (가동 시간)
- checklist_items (JSON)
- issues_found, issue_details
- photos (JSON array)
- status
```

#### 13. safety_inspections (안전 점검표)
```sql
- id, inspector_id, bp_company_id, ep_company_id
- inspection_date, site_name
- checklist_items (JSON)
- issues_found, issue_details
- photos (JSON array)
- status
```

#### 14. emergency_alerts (긴급 알림)
```sql
- id, worker_id, equipment_id
- alert_type (accident, breakdown, other)
- latitude, longitude
- description, status
- created_at, resolved_at
```

---

## 🎨 UI/UX 요구사항

### Worker 모바일 앱
- **큰 버튼** (터치하기 쉽게)
- **간단한 입력** (최소한의 입력)
- **명확한 상태 표시** (작업 중, 휴식 중 등)
- **오프라인 대응** (GPS 로그 임시 저장 후 전송)

### Owner 대시보드
- **투입 현황 한눈에**
- **작업확인서 서명 대기 목록**
- **장비 서류 만료일 알림**
- **실시간 위치 지도**

### BP 대시보드
- **작업확인서 서명 대기 목록**
- **Owner별 투입 현황**
- **안전 점검표 확인**

### EP 대시보드
- **BP별 장비 임대 현황**
- **전체 현장 위치 추적**
- **서류 만료 현황**

---

## 🔐 보안 요구사항

1. **역할별 접근 권한**
   - Admin: 모든 기능
   - Owner: 자신의 장비/인력만
   - BP: 자신이 관리하는 현장만
   - EP: 자신이 발주한 현장만
   - Worker: 자신의 작업만

2. **데이터 암호화**
   - 비밀번호: SHA-256 해싱
   - JWT 토큰: HS256

3. **파일 보안**
   - Supabase Storage 사용
   - 서명된 URL (만료 시간 설정)

---

## 📧 메일 기능

1. **반입 요청 메일**
   - Owner → BP
   - BP → EP

2. **작업확인서 서명 요청 메일**
   - Owner → BP
   - PDF 첨부
   - 서명 링크

3. **긴급 알림 메일**
   - Worker → Owner, BP, EP

---

## 📱 푸시 알림 (선택사항)

1. 반입 요청 승인/반려
2. 작업확인서 서명 완료
3. 긴급 상황 알림
4. 서류 만료 임박

---

## 🚀 개발 우선순위

### Phase 1: 로그인 및 인증 ✅ (완료)
- 이메일/비밀번호 로그인
- PIN 로그인 (4자리)
- JWT 토큰 인증

### Phase 2: 데이터베이스 마이그레이션 (다음)
- 새 테이블 생성
- 기존 테이블 수정
- 테스트 데이터 생성

### Phase 3: 반입 요청 및 투입 관리
- 반입 요청 생성/승인
- 투입 자동 등록
- 투입 관리 (연장, 운전자 교체)

### Phase 4: Worker 모바일 앱
- 작업 시작/종료
- GPS 위치 전송
- 작업확인서 자동 생성
- 장비 일일 점검표

### Phase 5: 작업확인서 관리
- 일별/월별 작업확인서
- BP 전자서명
- PDF 생성 및 저장

### Phase 6: 실시간 위치 추적
- GPS 로그 저장
- 지도 표시
- 역할별 필터링

### Phase 7: 긴급 알림
- 긴급 버튼
- 실시간 알림
- 상태 관리

### Phase 8: Admin 관리 페이지
- 회사 관리
- 사용자 관리
- 장비/인력 유형 관리

### Phase 9: 테스트 및 버그 수정
- 통합 테스트
- 성능 최적화
- 버그 수정

### Phase 10: 배포
- 프로덕션 배포
- 사용자 교육
- 문서 작성

---

## ✅ 체크리스트

### 기능 완성도
- [ ] 로그인 및 인증
- [ ] 반입 요청 및 승인
- [ ] 투입 관리
- [ ] Worker 작업 관리
- [ ] 작업확인서 관리
- [ ] 장비 점검표
- [ ] 실시간 위치 추적
- [ ] 긴급 알림
- [ ] Admin 관리 페이지

### 역할별 기능
- [ ] Admin: 전체 관리
- [ ] Owner: 장비/인력/투입 관리
- [ ] BP: 승인 및 서명
- [ ] EP: 최종 승인 및 모니터링
- [ ] Worker: 작업 및 점검
- [ ] Inspector: 안전 점검

---

**작성일**: 2025-10-27  
**작성자**: AI Assistant  
**상태**: 최종 확정 대기

