# 건설장비 및 인력관리 시스템(ERMS) - 문제점 분석

**작성일**: 2025-10-26  
**분석자**: AI Assistant

---

## 📋 프로젝트 개요

건설장비 및 인력 관리 시스템(ERMS)은 건설 현장에서 장비 및 인력을 효율적으로 관리하고, 실시간 위치 추적, 긴급 상황 대응, 작업 현황 모니터링을 지원하는 통합 관리 시스템입니다.

**기술 스택**:
- 프론트엔드: React 19.1.1 + TypeScript + Vite + TailwindCSS
- 백엔드: Node.js + Express + tRPC 11.6.0
- 데이터베이스: PostgreSQL (Supabase)
- 파일 저장소: Supabase Storage

---

## 🔍 발견된 주요 문제점

### 1. 문서와 실제 코드 간의 불일치

#### 1.1. 라우터 파일 누락

**문제**: 프로젝트 문서에는 다음 라우터들이 명시되어 있으나, 실제 코드에서는 존재하지 않습니다.

| 문서에 명시된 라우터 | 실제 존재 여부 | 비고 |
|-------------------|--------------|------|
| `equipment-types-router.ts` | ❌ 없음 | `routers.ts`에 인라인으로 구현됨 |
| `worker-types-router.ts` | ❌ 없음 | `routers.ts`에 인라인으로 구현됨 |
| `entry-request-router-v2.ts` | ❌ 없음 | `entry-request-router-new.ts`로 존재 |
| `deployment-router.ts` | ❌ 없음 | 구현되지 않음 |
| `work-confirmation-router.ts` | ❌ 없음 | 구현되지 않음 |
| `system-router.ts` | ✅ 있음 | `_core/systemRouter.ts`로 존재 |

**실제 존재하는 라우터**:
- `auth-pin-router.ts` ✅
- `companies-router.ts` ✅
- `emergency-router.ts` ✅
- `location-router.ts` ✅
- `mobile-router.ts` ✅
- `users-router.ts` ✅
- `entry-request-router-new.ts` ✅

**영향**:
- 문서를 보고 코드를 이해하려는 개발자가 혼란을 겪을 수 있음
- 투입 관리(deployment) 및 작업확인서(work-confirmation) 기능이 구현되지 않았을 가능성

---

#### 1.2. 페이지 파일 누락

**문제**: 문서에는 다음 페이지들이 명시되어 있으나, 실제로는 존재하지 않거나 다른 이름으로 존재합니다.

| 문서에 명시된 페이지 | 실제 존재 여부 | 비고 |
|-------------------|--------------|------|
| `Companies.tsx` | ❌ 없음 | 구현되지 않음 |
| `Users.tsx` | ❌ 없음 | 구현되지 않음 |
| `EquipmentTypes.tsx` | ❌ 없음 | 구현되지 않음 |
| `WorkerTypes.tsx` | ❌ 없음 | 구현되지 않음 |
| `Deployments.tsx` | ❌ 없음 | 구현되지 않음 |
| `WorkConfirmation.tsx` | ❌ 없음 | 구현되지 않음 |
| `Dashboard.tsx` | ❌ 없음 | `Home.tsx`로 존재 가능 |
| `mobile/WorkerMain.tsx` | ❌ 없음 | 별도 모바일 앱 구조 확인 필요 |
| `mobile/InspectorMain.tsx` | ❌ 없음 | 별도 모바일 앱 구조 확인 필요 |

**실제 존재하는 페이지**:
- `Home.tsx` ✅
- `Equipment.tsx`, `Equipment-new.tsx` ✅
- `Workers.tsx`, `Workers-new.tsx` ✅
- `EntryRequests.tsx`, `EntryRequestsNew.tsx` ✅
- `EntryRequestCreate.tsx`, `EntryRequestBpApprove.tsx`, `EntryRequestEpApprove.tsx` ✅
- `Documents.tsx` ✅
- `LocationTracking.tsx` ✅
- `EmergencyAlerts.tsx` ✅
- `WorkMonitoring.tsx` ✅
- `Approvals.tsx`, `Inspections.tsx`, `Statistics.tsx`, `WorkJournal.tsx` ✅

**영향**:
- Admin 전용 관리 페이지(회사 관리, 사용자 관리, 장비 유형 관리 등)가 구현되지 않음
- 투입 관리 및 작업확인서 페이지가 구현되지 않음

---

### 2. 핵심 기능 미구현

#### 2.1. 투입 관리 (Deployment) 기능 미구현

**문제**: 문서에는 투입 관리 기능이 핵심 기능으로 명시되어 있으나, 실제로는 구현되지 않았습니다.

**문서 내용**:
- 투입 관리 페이지 (`Deployments.tsx`)
- 투입 관리 API (`deployment-router.ts`)
- 데이터베이스 테이블 (`deployments`, `deployment_items`)

**실제 상황**:
- 라우터 파일 없음 ❌
- 페이지 파일 없음 ❌
- 데이터베이스 테이블 존재 여부 확인 필요

**영향**:
- 반입 요청 승인 후 실제 투입 관리를 할 수 없음
- 작업 현황과 투입 정보를 연결할 수 없음

---

#### 2.2. 작업확인서 (Work Confirmation) 기능 미구현

**문제**: 문서에는 작업확인서 기능이 명시되어 있으나, 실제로는 구현되지 않았습니다.

**문서 내용**:
- 작업확인서 페이지 (`WorkConfirmation.tsx`)
- 작업확인서 API (`work-confirmation-router.ts`)
- 데이터베이스 테이블 (`work_confirmations`)
- BP의 전자서명 기능

**실제 상황**:
- 라우터 파일 없음 ❌
- 페이지 파일 없음 ❌
- 데이터베이스 테이블 존재 여부 확인 필요

**영향**:
- 작업 완료 후 BP의 확인 및 서명을 받을 수 없음
- 작업 내역 증빙이 불가능함

---

#### 2.3. Admin 관리 페이지 미구현

**문제**: Admin 전용 관리 페이지들이 구현되지 않았습니다.

**미구현 페이지**:
- 회사 관리 (`Companies.tsx`)
- 사용자 관리 (`Users.tsx`)
- 장비 유형 관리 (`EquipmentTypes.tsx`)
- 인력 유형 관리 (`WorkerTypes.tsx`)

**실제 상황**:
- API는 `routers.ts`에 구현되어 있음 ✅
- 프론트엔드 페이지가 없음 ❌

**영향**:
- Admin이 웹 UI를 통해 회사, 사용자, 장비/인력 유형을 관리할 수 없음
- 데이터베이스에 직접 접근하거나 API를 직접 호출해야 함

---

### 3. 데이터베이스 스키마 불일치 가능성

#### 3.1. 테이블 존재 여부 확인 필요

**문제**: 문서에 명시된 테이블들이 실제 데이터베이스에 존재하는지 확인이 필요합니다.

**확인 필요한 테이블**:
- `deployments` (투입 정보)
- `deployment_items` (투입 항목)
- `work_confirmations` (작업확인서)
- `companies` (회사 정보)
- `work_sessions` (작업 세션)
- `location_logs` (위치 기록)
- `emergency_alerts` (긴급 알림)

**확인 방법**:
- Drizzle 스키마 파일 (`drizzle/schema.ts`) 전체 확인
- 또는 데이터베이스에 직접 쿼리

---

### 4. 환경 변수 및 설정 문제

#### 4.1. OAuth 설정 누락

**문제**: 서버 시작 시 다음 경고가 발생합니다.

```
[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable.
```

**원인**:
- `.env` 파일에 `OAUTH_SERVER_URL` 환경 변수가 설정되지 않음

**영향**:
- OAuth 로그인 기능을 사용할 수 없음
- 현재는 이메일/비밀번호 및 PIN 로그인만 사용 가능

**해결 방법**:
- OAuth 기능이 필요하지 않다면 관련 코드 제거
- OAuth 기능이 필요하다면 `.env`에 `OAUTH_SERVER_URL` 추가

---

#### 4.2. JWT Secret 설정

**문제**: `.env` 파일에 JWT Secret이 `SESSION_SECRET`로 명명되어 있습니다.

```env
SESSION_SECRET="test-secret-key-for-development-only"
```

**확인 필요**:
- 코드에서 `JWT_SECRET` 또는 `SESSION_SECRET` 중 어느 것을 사용하는지 확인
- 문서에는 `JWT_SECRET`로 명시되어 있음

---

### 5. 프로젝트 구조 및 네이밍 불일치

#### 5.1. 반입 요청 라우터 네이밍

**문제**: 반입 요청 라우터가 여러 버전으로 존재합니다.

- `entry-request-router-new.ts` (실제 존재)
- `entry-request-router-v2.ts` (문서에 명시)

**확인 필요**:
- 어느 파일이 실제로 사용되는지 확인
- `routers.ts`에서 어느 라우터를 import하는지 확인

---

#### 5.2. 페이지 파일 중복

**문제**: 일부 페이지가 두 가지 버전으로 존재합니다.

- `Equipment.tsx` vs `Equipment-new.tsx`
- `Workers.tsx` vs `Workers-new.tsx`

**확인 필요**:
- 어느 파일이 실제로 사용되는지 확인
- 라우팅 설정 확인

---

### 6. 모바일 앱 구조 불명확

#### 6.1. 모바일 앱 페이지 위치

**문제**: 문서에는 모바일 앱 페이지가 `client/src/pages/mobile/` 디렉토리에 있다고 명시되어 있으나, 실제 구조를 확인할 수 없습니다.

**확인 필요**:
- `client/src/pages/mobile/` 디렉토리 존재 여부
- Worker 앱 및 Inspector 앱의 실제 구현 위치

---

### 7. 무한 로딩 문제 (문서에 명시된 알려진 문제)

**문제**: 프로젝트 리포트에 "무한 로딩 문제"가 향후 계획의 최우선 과제로 명시되어 있습니다.

**문서 내용** (Week 1: 우선순위 높음):
- 브라우저 접속 시 무한 로딩 문제 해결
- 프론트엔드 빌드 최적화
- 백엔드 API 응답 속도 개선
- 에러 로그 분석

**확인 필요**:
- 실제로 무한 로딩 문제가 발생하는지 브라우저에서 테스트
- 브라우저 콘솔 에러 확인
- 네트워크 요청 분석

---

### 8. 파일 삭제 시 Storage 정리 미구현

**문제**: 문서에 명시된 알려진 문제입니다.

**문서 내용**:
- 서류 삭제 시 Supabase Storage에서도 파일 삭제 필요
- 현재는 DB에서만 삭제되고 Storage에는 파일이 남아있음

**영향**:
- Storage 용량 낭비
- 불필요한 파일 누적

---

## 🎯 우선순위별 해결 방안

### 우선순위 1: 핵심 기능 구현 (높음)

#### 1.1. Admin 관리 페이지 구현

**작업 내용**:
1. 회사 관리 페이지 (`Companies.tsx`) 구현
   - 회사 목록 조회
   - 회사 등록/수정/삭제
   - 회사 유형별 필터링

2. 사용자 관리 페이지 (`Users.tsx`) 구현
   - 사용자 목록 조회
   - 사용자 등록/수정/삭제
   - 역할별 필터링
   - PIN 설정 (Worker용)

3. 장비 유형 관리 페이지 (`EquipmentTypes.tsx`) 구현
   - 장비 유형 목록 조회
   - 장비 유형 등록/수정/삭제
   - 필수 서류 설정

4. 인력 유형 관리 페이지 (`WorkerTypes.tsx`) 구현
   - 인력 유형 목록 조회
   - 인력 유형 등록/수정/삭제
   - 필수 서류 설정

**예상 소요 시간**: 2-3일

---

#### 1.2. 투입 관리 기능 구현

**작업 내용**:
1. 데이터베이스 테이블 확인 및 생성
   - `deployments` 테이블
   - `deployment_items` 테이블

2. 투입 관리 API 구현 (`deployment-router.ts`)
   - 투입 등록 (create)
   - 투입 목록 조회 (list)
   - 투입 상세 조회 (getById)
   - 투입 수정 (update)

3. 투입 관리 페이지 구현 (`Deployments.tsx`)
   - 투입 목록 조회
   - 투입 등록 (장비 및 인력 선택)
   - 작업 유형 선택 (일대/월대/O/T/철야)

**예상 소요 시간**: 1-2일

---

#### 1.3. 작업확인서 기능 구현

**작업 내용**:
1. 데이터베이스 테이블 확인 및 생성
   - `work_confirmations` 테이블

2. 작업확인서 API 구현 (`work-confirmation-router.ts`)
   - 작업확인서 생성 (create)
   - 작업확인서 목록 조회 (list)
   - 작업확인서 상세 조회 (getById)
   - BP 확인 및 서명 (bpConfirm)

3. 작업확인서 페이지 구현 (`WorkConfirmation.tsx`)
   - 작업확인서 목록 조회
   - 작업 내용 확인
   - 전자서명 (Canvas 기반)
   - 승인/반려

**예상 소요 시간**: 1-2일

---

### 우선순위 2: 문서 업데이트 (중간)

#### 2.1. 프로젝트 구조 문서 업데이트

**작업 내용**:
- 실제 존재하는 파일 목록으로 업데이트
- 누락된 파일 및 기능 명시
- 파일 네이밍 통일

**예상 소요 시간**: 0.5일

---

#### 2.2. 사용자 매뉴얼 업데이트

**작업 내용**:
- 실제 구현된 기능 기준으로 업데이트
- 미구현 기능 제거 또는 "준비 중" 표시

**예상 소요 시간**: 0.5일

---

### 우선순위 3: 버그 수정 및 최적화 (높음)

#### 3.1. 무한 로딩 문제 해결

**작업 내용**:
1. 브라우저에서 실제 테스트
2. 브라우저 콘솔 에러 확인
3. 네트워크 요청 분석
4. 프론트엔드 빌드 최적화
5. 백엔드 API 응답 속도 개선

**예상 소요 시간**: 1-2일

---

#### 3.2. 파일 삭제 시 Storage 정리

**작업 내용**:
- `docsCompliance.delete` API 수정
- DB 삭제 전에 Storage에서 파일 삭제
- 에러 처리 추가

**예상 소요 시간**: 0.5일

---

### 우선순위 4: 환경 설정 정리 (낮음)

#### 4.1. OAuth 설정 정리

**작업 내용**:
- OAuth 기능이 필요한지 확인
- 필요 없다면 관련 코드 제거
- 필요하다면 `.env`에 `OAUTH_SERVER_URL` 추가

**예상 소요 시간**: 0.5일

---

## 📊 예상 일정 요약

| 우선순위 | 작업 내용 | 예상 소요 시간 |
|---------|----------|--------------|
| 높음 | Admin 관리 페이지 구현 | 2-3일 |
| 높음 | 투입 관리 기능 구현 | 1-2일 |
| 높음 | 작업확인서 기능 구현 | 1-2일 |
| 높음 | 무한 로딩 문제 해결 | 1-2일 |
| 중간 | 문서 업데이트 | 1일 |
| 중간 | 파일 삭제 시 Storage 정리 | 0.5일 |
| 낮음 | 환경 설정 정리 | 0.5일 |

**총 예상 소요 시간**: 약 7-12일

---

## 🔍 추가 확인 필요 사항

### 1. 데이터베이스 스키마 전체 확인

**확인 방법**:
```bash
# Drizzle 스키마 파일 전체 읽기
cat /home/ubuntu/construction-equipment-management/drizzle/schema.ts
```

**확인 항목**:
- `deployments`, `deployment_items` 테이블 존재 여부
- `work_confirmations` 테이블 존재 여부
- `companies` 테이블 존재 여부
- 모든 테이블의 컬럼 구조

---

### 2. 라우팅 설정 확인

**확인 방법**:
```bash
# 클라이언트 라우팅 설정 파일 찾기
find /home/ubuntu/construction-equipment-management/client -name "*route*" -o -name "*router*" -o -name "App.tsx"
```

**확인 항목**:
- 어느 페이지가 실제로 사용되는지 (예: `Equipment.tsx` vs `Equipment-new.tsx`)
- 모바일 앱 라우팅 설정

---

### 3. 모바일 앱 구조 확인

**확인 방법**:
```bash
# 모바일 앱 디렉토리 확인
ls -la /home/ubuntu/construction-equipment-management/client/src/pages/mobile/
```

**확인 항목**:
- Worker 앱 페이지 존재 여부
- Inspector 앱 페이지 존재 여부

---

### 4. 브라우저 테스트

**확인 방법**:
- 브라우저에서 https://3000-ijx68fd5dtrzrssg1994l-1134f170.manus-asia.computer 접속
- 로그인 시도
- 각 페이지 접속 테스트
- 브라우저 콘솔 에러 확인

**확인 항목**:
- 무한 로딩 문제 발생 여부
- 에러 메시지
- API 응답 시간

---

## 📝 결론

건설장비 및 인력관리 시스템(ERMS) 프로젝트는 **문서와 실제 코드 간의 불일치**가 주요 문제입니다. 특히 다음 기능들이 문서에는 명시되어 있으나 실제로는 구현되지 않았습니다:

1. **Admin 관리 페이지** (회사, 사용자, 장비/인력 유형 관리)
2. **투입 관리 기능**
3. **작업확인서 기능**

또한 **무한 로딩 문제** 및 **파일 삭제 시 Storage 정리** 등의 버그가 알려져 있습니다.

우선순위에 따라 핵심 기능을 구현하고, 문서를 업데이트하며, 버그를 수정하는 것이 필요합니다.

---

**작성일**: 2025-10-26  
**작성자**: AI Assistant

