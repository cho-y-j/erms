# 건설장비 및 인력관리 시스템(ERMS) - 프로젝트 인수인계 문서

**작성일**: 2025-10-27  
**목적**: 다른 개발자가 이어서 작업할 수 있도록 완전한 정보 제공

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [현재 작업 상태](#2-현재-작업-상태)
3. [기술 스택 및 환경](#3-기술-스택-및-환경)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [완전한 요구사항](#5-완전한-요구사항)
6. [데이터베이스 설계](#6-데이터베이스-설계)
7. [API 설계](#7-api-설계)
8. [UI/UX 설계](#8-uiux-설계)
9. [남은 작업 목록](#9-남은-작업-목록)
10. [개발 가이드](#10-개발-가이드)

---

## 1. 프로젝트 개요

### 1.1. 프로젝트 목적

건설 현장에서 **장비 임대 사업자(Owner)**가 장비와 운전자를 관리하고, **시공사(BP)**와 **발주처(EP)**가 이를 승인하고 관리하는 통합 시스템입니다.

**핵심 목표**:
- 종이 기반 업무를 디지털화
- 실시간 위치 추적으로 안전 관리
- 작업확인서 전자서명으로 업무 효율화
- 장비 점검 이력 관리로 사고 예방

### 1.2. 주요 사용자

| 역할 | 영문 | 설명 | 소속 |
|------|------|------|------|
| **관리자** | Admin | 시스템 전체 관리 | 시스템 |
| **장비 임대 사업자** | Owner | 장비/인력 관리, 반입 요청 | 임대 회사 |
| **시공사** | BP (Building Partner) | 반입 승인, 작업확인서 서명 | 시공 회사 |
| **발주처** | EP (End Partner) | 최종 승인, 전체 모니터링 | 발주 회사 |
| **장비 운전자** | Worker | 작업 수행, 점검표 작성 | Owner 소속 |
| **안전 점검원** | Inspector | 현장 안전 점검 | EP 소속 |

---

## 2. 현재 작업 상태

### 2.1. 완료된 작업 (Phase 1)

#### ✅ 로그인 및 인증 시스템
- **Admin, Owner, BP, EP**: 전화번호 + 비밀번호 로그인
- **Worker**: 전화번호 + 비밀번호 로그인 (차량 자동 매칭)
- **Inspector**: 전화번호 + 비밀번호 로그인
- JWT 토큰 기반 인증
- 로그아웃 기능

#### ✅ 수정된 파일 목록
1. `drizzle/schema.ts` - users 테이블에 password, pin 필드 추가
2. `server/_core/password.ts` - 비밀번호 해싱 함수 생성
3. `server/_core/jwt.ts` - JWT 토큰 생성/검증 함수 생성
4. `server/db.ts` - getUserByEmail, getWorkerByPin 함수 추가
5. `server/routers.ts` - auth.login API 추가
6. `server/auth-pin-router.ts` - Worker 로그인을 JWT 방식으로 변경
7. `client/src/pages/Login.tsx` - 로그인 페이지 생성
8. `client/src/App.tsx` - 로그인 라우트 추가
9. `client/src/const.ts` - getLoginUrl() 수정
10. `client/src/components/DashboardLayout.tsx` - 로그아웃 버튼 수정
11. `client/src/pages/mobile/PinLogin.tsx` - PIN 로그인 4자리로 변경

#### ✅ 테스트 사용자 생성
- SQL 스크립트: `/home/ubuntu/create-test-users-fixed.sql`
- Supabase에서 실행 완료

### 2.2. 미완료 작업

#### ❌ Phase 2: 데이터베이스 마이그레이션
- 새로운 테이블 생성 (companies, deployments, work_sessions 등)
- 기존 테이블 수정

#### ❌ Phase 3-10: 핵심 기능 구현
- 반입 요청 및 승인
- 투입 관리
- Worker 모바일 앱 (작업 시작/종료, GPS, 작업확인서)
- 작업확인서 관리 (일별/월별, BP 서명, PDF 생성)
- 장비 점검표 (Worker용, Inspector용)
- 실시간 위치 추적
- 긴급 상황 알림
- Admin 관리 페이지

---

## 3. 기술 스택 및 환경

### 3.1. 프론트엔드
- **프레임워크**: React 19.1.1
- **언어**: TypeScript
- **빌드 도구**: Vite
- **스타일링**: TailwindCSS
- **상태 관리**: tRPC (서버 상태)
- **라우팅**: React Router

### 3.2. 백엔드
- **런타임**: Node.js 22.13.0
- **프레임워크**: Express
- **API**: tRPC 11.6.0
- **ORM**: Drizzle ORM
- **인증**: JWT (HS256)

### 3.3. 데이터베이스
- **DBMS**: PostgreSQL
- **호스팅**: Supabase
- **Storage**: Supabase Storage (파일 저장)

### 3.4. 개발 환경
- **패키지 관리자**: pnpm
- **개발 서버**: tsx watch (자동 재시작)
- **포트**: 3000

### 3.5. 환경 변수
```env
# Supabase
SUPABASE_URL=https://zlgehckxiuhjpfjlaycf.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# JWT
JWT_SECRET=...

# 기타
NODE_ENV=development
```

---

## 4. 프로젝트 구조

### 4.1. 디렉토리 구조

```
construction-equipment-management/
├── client/                    # 프론트엔드
│   ├── src/
│   │   ├── pages/            # 페이지 컴포넌트
│   │   │   ├── Login.tsx     # 로그인 페이지 (Admin, Owner, BP, EP)
│   │   │   ├── mobile/       # 모바일 페이지
│   │   │   │   ├── PinLogin.tsx        # Worker/Inspector 로그인
│   │   │   │   ├── WorkerApp.tsx       # Worker 앱
│   │   │   │   └── InspectorApp.tsx    # Inspector 앱
│   │   │   ├── admin/        # Admin 페이지
│   │   │   ├── owner/        # Owner 페이지
│   │   │   ├── bp/           # BP 페이지
│   │   │   └── ep/           # EP 페이지
│   │   ├── components/       # 공통 컴포넌트
│   │   │   ├── DashboardLayout.tsx  # 대시보드 레이아웃
│   │   │   └── ...
│   │   ├── _core/            # 핵심 유틸리티
│   │   │   └── hooks/
│   │   │       └── useAuth.ts  # 인증 Hook
│   │   ├── App.tsx           # 메인 앱 (라우팅)
│   │   └── const.ts          # 상수
│   └── index.html
│
├── server/                    # 백엔드
│   ├── _core/                # 핵심 유틸리티
│   │   ├── trpc.ts           # tRPC 설정
│   │   ├── jwt.ts            # JWT 함수 (createJWT, verifyJWT)
│   │   ├── password.ts       # 비밀번호 해싱 함수
│   │   ├── cookies.ts        # 쿠키 설정
│   │   └── sdk.ts            # Supabase SDK
│   ├── routers.ts            # 메인 라우터 (auth.login 등)
│   ├── auth-pin-router.ts    # Worker/Inspector PIN 로그인
│   ├── db.ts                 # 데이터베이스 함수
│   ├── entry-request-router.ts  # 반입 요청 API
│   ├── equipment-router.ts   # 장비 관리 API
│   ├── worker-router.ts      # 인력 관리 API
│   └── ...
│
├── drizzle/                   # 데이터베이스
│   ├── schema.ts             # 데이터베이스 스키마
│   └── migrations-pg/        # 마이그레이션 파일
│
├── shared/                    # 공유 타입/상수
│   └── const.ts
│
├── package.json
├── .env                       # 환경 변수
└── README.md
```

### 4.2. 주요 파일 역할

#### 프론트엔드

| 파일 경로 | 역할 |
|----------|------|
| `client/src/App.tsx` | 메인 앱, 라우팅 설정 |
| `client/src/pages/Login.tsx` | Admin/Owner/BP/EP 로그인 페이지 |
| `client/src/pages/mobile/PinLogin.tsx` | Worker/Inspector 로그인 페이지 |
| `client/src/components/DashboardLayout.tsx` | 대시보드 레이아웃 (헤더, 사이드바, 로그아웃) |
| `client/src/_core/hooks/useAuth.ts` | 인증 상태 관리 Hook |
| `client/src/const.ts` | 상수 (로그인 URL 등) |

#### 백엔드

| 파일 경로 | 역할 |
|----------|------|
| `server/routers.ts` | 메인 라우터, auth.login API |
| `server/auth-pin-router.ts` | Worker/Inspector PIN 로그인 API |
| `server/db.ts` | 데이터베이스 CRUD 함수 |
| `server/_core/jwt.ts` | JWT 토큰 생성/검증 |
| `server/_core/password.ts` | 비밀번호 해싱/검증 |
| `server/_core/trpc.ts` | tRPC 설정, 미들웨어 |
| `server/_core/sdk.ts` | Supabase 클라이언트 |

#### 데이터베이스

| 파일 경로 | 역할 |
|----------|------|
| `drizzle/schema.ts` | 데이터베이스 스키마 정의 (Drizzle ORM) |
| `drizzle/migrations-pg/` | 마이그레이션 SQL 파일 |

---

## 5. 완전한 요구사항

### 5.1. 사용자 역할 및 권한

#### 5.1.1. Admin (관리자)
**권한**: 모든 기능 접근 가능

**주요 기능**:
- 회사 관리 (Owner, BP, EP 회사 등록/수정/삭제)
- 사용자 관리 (모든 역할 사용자 등록/수정/삭제)
- 장비 유형 관리 (차종 등록, 점검표 템플릿 생성)
- 인력 유형 관리
- 시스템 설정 (GPS 전송 간격 등)
- 전체 데이터 조회

#### 5.1.2. Owner (장비 임대 사업자)
**권한**: 자신의 장비/인력만 관리

**주요 기능**:
1. **장비 관리**
   - 장비 등록/수정/삭제
   - 장비 서류 관리 (등록증, 보험증 등)
   - 장비 서류 만료일 알림

2. **인력 관리**
   - 운전자 등록/수정/삭제
   - 운전자 자격증 관리
   - 운전자 서류 만료일 알림

3. **반입 요청**
   - 반입 요청 생성 (장비 + 인력)
   - 서류 자동 검증
   - BP에게 요청 전송 (시스템 + 메일)
   - 반입 요청 상태 조회

4. **투입 관리** ⭐
   - 투입 중인 장비/인력 목록 조회
   - 투입 기간 연장 (BP 승인 불필요)
   - 운전자 교체 (반입 승인된 인력만, BP 승인 불필요)
   - 투입 이력 조회

5. **작업확인서 관리** ⭐
   - Worker가 제출한 작업확인서 확인
   - 일별/월별 작업확인서 조회
   - BP에게 서명 요청 (시스템 + 메일)
   - 서명 완료된 작업확인서 PDF 다운로드
   - 장비/인력별 급여 정산 자료 활용

6. **장비 점검표 조회**
   - Worker가 작성한 장비 일일 점검표 조회
   - 운행 시간, 가동 시간 확인
   - 장비 정비 예정일 관리

7. **실시간 위치 추적**
   - 투입 중인 장비/인력 실시간 위치 표시
   - 지도에 마커 표시

8. **긴급 상황 알림**
   - Worker의 긴급 신고 수신
   - 위치 확인 및 대응

#### 5.1.3. BP (시공사)
**권한**: 자신이 관리하는 현장만 접근

**주요 기능**:
1. **회사 관리**
   - Owner 회사 등록 (EP 승인 필요 없음)

2. **사용자 관리**
   - BP 사용자 등록/수정/삭제
   - 권한 설정 (읽기 전용, 수정 가능 등)

3. **반입 요청 승인**
   - Owner의 반입 요청 확인
   - 서류 다운로드 (PDF)
   - 장비 사용 계획서 첨부
   - EP에게 승인 요청 전송 (시스템 + 메일)

4. **투입 장비 관리**
   - 투입 중인 장비/인력 목록 조회 (Owner별)
   - 투입 기간, 남은 기간 확인
   - 서류 만료일 확인

5. **작업확인서 서명** ⭐
   - Owner가 제출한 작업확인서 목록 조회
   - 서명 대기 중인 작업확인서 표시
   - 일별 작업확인서 서명 (전자서명)
   - 월별 작업확인서 서명 (매일 해당 날짜 행에 서명)
   - 서명 완료 시 PDF 자동 생성 및 저장

6. **안전 점검표 확인**
   - Inspector가 제출한 안전 점검표 조회
   - 점검 이력 확인

7. **실시간 위치 추적**
   - Owner별 장비 위치 표시
   - 장비별 필터링

8. **긴급 상황 알림**
   - Worker의 긴급 신고 수신
   - 위치 확인 및 대응

#### 5.1.4. EP (발주처)
**권한**: 자신이 발주한 현장만 접근

**주요 기능**:
1. **회사 관리**
   - BP 회사 등록
   - Owner 회사 등록

2. **사용자 관리**
   - EP 사용자 등록/수정/삭제
   - Inspector 등록/수정/삭제
   - 권한 설정

3. **반입 요청 최종 승인**
   - BP의 반입 요청 확인
   - 서류 다운로드 (PDF)
   - 최종 승인 → 투입 자동 등록

4. **BP별 장비 임대 현황** ⭐
   - BP별 투입 장비/인력 목록 조회
   - Owner별 조회
   - 장비별 조회
   - 투입 기간, 작업 현황 확인

5. **안전 점검표 관리**
   - Inspector가 제출한 안전 점검표 조회
   - 점검 이력 확인
   - 이상 발견 시 조치

6. **실시간 위치 추적** ⭐
   - BP별, Owner별, 장비별 필터링
   - 전체 현장 장비 위치 한눈에 확인
   - 지도에 BP, Owner, 장비, 운전자 모두 표시

7. **서류 만료 관리**
   - 투입 중인 장비/인력의 서류 만료일 확인
   - 만료 임박 알림

8. **긴급 상황 알림**
   - Worker의 긴급 신고 수신
   - 위치 확인 및 대응

#### 5.1.5. Worker (장비 운전자)
**권한**: 자신의 작업만 접근

**로그인 방식**:
- 전화번호 + 비밀번호 입력
- 로그인 시 자동으로 배정된 차량 매칭
- 기본 비밀번호: 0000 (변경 가능)

**주요 기능**:
1. **작업 관리** ⭐
   - "작업 시작" 버튼 클릭 → GPS 전송 시작 (5분 간격)
   - "휴식" 버튼 클릭 → 휴식 시간 기록
   - "휴식 종료" 버튼 클릭 → 작업 재개
   - "작업 종료" 버튼 클릭 → GPS 전송 중지, 작업확인서 자동 생성

2. **작업확인서 작성** ⭐
   - 자동 생성된 작업확인서 확인
   - 작업 위치 입력 (필수)
   - 작업 내용 입력 (필수)
   - 작업 시간 수정 (선택)
   - 휴식 시간 수정 (선택)
   - 확인 후 Owner에게 제출

3. **장비 일일 점검표 작성** ⭐
   - 작업 시작 전 점검표 작성
   - 운행 시간 입력 (계기판 확인)
   - 가동 시간 입력 (아워미터 확인)
   - 점검 항목 체크 (차종별 템플릿 자동 로드)
   - 이상 발견 시 상세 입력
   - 사진 첨부 (선택)
   - Owner에게 제출

4. **긴급 상황 신고**
   - 긴급 버튼 클릭
   - 긴급 상황 유형 선택 (사고, 고장, 기타)
   - 현재 위치 자동 전송
   - Owner, BP, EP에게 즉시 알림

5. **작업 이력 조회**
   - 자신의 작업 이력 조회
   - 작업확인서 조회

#### 5.1.6. Inspector (안전 점검원)
**권한**: 자신이 점검한 데이터만 접근

**로그인 방식**:
- 전화번호 + 비밀번호 입력
- 기본 비밀번호: 0000 (변경 가능)

**주요 기능**:
1. **차량 검색**
   - 차량 번호로 검색
   - 검색 결과에서 차량 선택

2. **안전 점검표 작성** ⭐
   - 차량 선택 시 해당 차종의 안전 점검표 템플릿 자동 로드
   - 점검 항목 체크
   - 이상 발견 시 상세 입력
   - 사진 첨부 (선택)
   - Inspector 서명 (필수)
   - BP 및 EP에게 제출

3. **점검 이력 조회**
   - 자신이 점검한 이력 조회
   - 차량별 점검 이력 조회

---

### 5.2. 핵심 업무 프로세스

#### 5.2.1. 반입 요청 및 승인 프로세스

```
Owner → BP → EP
  ↓      ↓     ↓
요청   승인  최종승인 → 투입 자동 등록
```

**1단계: Owner - 반입 요청 생성**
1. 장비 및 인력 선택
2. 투입 예정일, 철수 예정일 입력
3. 투입 목적 입력
4. 서류 자동 검증 (만료일 체크)
5. BP에게 요청 전송
6. **메일 전송** (현재 업무 방식 유지)
   - 수신자: BP 담당자
   - 내용: 반입 요청 정보
   - 첨부: 장비/인력 서류 PDF (묶음)

**2단계: BP - 1차 승인**
1. 반입 요청 확인
2. 서류 다운로드 (PDF)
3. 장비 사용 계획서 첨부
4. EP에게 승인 요청
5. **메일 전송**
   - 수신자: EP 담당자
   - 내용: 반입 요청 정보 + 장비 사용 계획서
   - 첨부: 서류 PDF

**3단계: EP - 최종 승인**
1. 반입 요청 확인
2. 서류 다운로드 (PDF)
3. 최종 승인
4. **투입 자동 등록** (시스템 자동 처리)
   - 투입 기간: 반입 요청의 예정일 기준
   - 상태: `active` (투입 중)

---

#### 5.2.2. 투입 관리 프로세스

**투입 등록 (자동)**
- EP 승인 시 자동으로 투입 등록
- 투입 기간: 반입 요청의 예정일 기준
- 상태: `active` (투입 중)

**Owner - 투입 관리**

1. **투입 기간 연장**
   - 예정 반출일 변경
   - 연장 사유 입력
   - **BP 승인 불필요** (자유롭게 연장 가능)
   - 이유: 작업확인서가 없으면 일한 것으로 처리되지 않음

2. **운전자 교체**
   - 새 운전자 선택 (반입 승인된 인력만 가능)
   - 교체 사유 입력
   - **BP 승인 불필요** (이미 승인된 인력이므로)
   - 교체 이력 저장

**BP/EP - 투입 현황 조회**
- 투입 중인 장비/인력 목록
- 투입 기간, 남은 기간
- 서류 만료일 확인
- 작업 현황 (작업확인서 연동)

---

#### 5.2.3. Worker 모바일 앱 - 작업 관리 프로세스

**1. 로그인**
```
전화번호 입력 → 비밀번호 입력 → 로그인
  ↓
배정된 차량 자동 매칭
```

**2. 작업 시작**
```
"작업 시작" 버튼 클릭
  ↓
시작 시간 자동 기록
  ↓
GPS 위치 전송 시작 (5분 간격)
  ↓
work_sessions 테이블에 레코드 생성
  - status: 'started'
  - start_time: 현재 시간
```

**3. 휴식**
```
"휴식" 버튼 클릭
  ↓
휴식 시작 시간 기록
  ↓
work_sessions 업데이트
  - status: 'break'
  - break_start_time: 현재 시간
  
"휴식 종료" 버튼 클릭
  ↓
휴식 종료 시간 기록
  ↓
휴식 시간 자동 계산
  ↓
work_sessions 업데이트
  - status: 'started'
  - break_end_time: 현재 시간
  - break_duration: 휴식 시간 (분)
```

**4. 작업 종료**
```
"작업 종료" 버튼 클릭
  ↓
종료 시간 자동 기록
  ↓
GPS 위치 전송 중지
  ↓
work_sessions 업데이트
  - status: 'ended'
  - end_time: 현재 시간
  ↓
작업확인서 자동 생성
  - 작업 시간 자동 계산 (종료 - 시작 - 휴식)
  - 초과 근무 시간 자동 계산 (8시간 초과 시)
  - 일별 작업확인서 생성
  - 월별 작업확인서에 해당 날짜 데이터 추가
```

**5. 작업확인서 작성**
```
자동 생성된 작업확인서 확인
  ↓
작업 위치 입력 (필수) ✏️
  ↓
작업 내용 입력 (필수) ✏️
  ↓
시간 수정 (선택) ✏️
  - 시작 시간, 종료 시간, 휴식 시간 수정 가능
  - 수정 시 time_manually_edited = true
  ↓
확인 버튼 클릭
  ↓
daily_work_confirmations 업데이트
  - worker_confirmed = true
  - worker_confirmed_at = 현재 시간
  - status: 'worker_confirmed'
  ↓
Owner에게 제출 알림
```

**6. 장비 일일 점검표 작성**
```
작업 시작 전 점검표 작성
  ↓
차량 정보 자동 로드
  - 차종에 맞는 점검표 템플릿 자동 로드
  ↓
운행 시간 입력 (계기판 확인) ✏️
  ↓
가동 시간 입력 (아워미터 확인) ✏️
  ↓
점검 항목 체크 (차종별 템플릿)
  - 일일 체크 항목
  - 주별 체크 항목 (해당 주차인 경우)
  - 월별 체크 항목 (해당 월인 경우)
  ↓
이상 발견 시 상세 입력 ✏️
  ↓
사진 첨부 (선택) 📷
  ↓
제출 버튼 클릭
  ↓
equipment_daily_inspections 테이블에 저장
  - status: 'submitted'
  ↓
Owner에게 제출 알림
```

---

#### 5.2.4. 작업확인서 관리 프로세스

**일별 작업확인서 (매일)**

```
Worker 작업 종료
  ↓
일별 작업확인서 자동 생성
  - 자동 입력 항목:
    * work_date, bp_company_name
    * worker_name, vehicle_number, equipment_name, equipment_spec
    * start_time, end_time, break_duration
    * total_work_minutes, overtime_minutes
  - status: 'draft'
  ↓
Worker 확인 및 작성
  - work_location (작업 위치) 입력 ✏️
  - work_content (작업 내용) 입력 ✏️
  - 시간 수정 (선택) ✏️
  - worker_confirmed = true
  - status: 'worker_confirmed'
  ↓
Owner 확인
  - 작업확인서 내용 확인
  - 급여 정산 자료로 활용
  - BP에게 서명 요청
  ↓
BP에게 제출
  - 옵션 A: 시스템 내에서 직접 서명 요청
  - 옵션 B: 메일로 서명 요청 (PDF 첨부)
    * 수신자: BP 담당자
    * 내용: 작업확인서 정보
    * 첨부: 일별 작업확인서 PDF
  - submitted_by_owner = {owner_id}
  - submitted_at = 현재 시간
  - owner_company_* 정보 자동 입력
  - status: 'submitted' 또는 'bp_pending' (메일 전송 시)
  ↓
BP 서명
  - 작업확인서 내용 확인
  - 전자서명 (터치/마우스로 직접 그리기)
  - 담당자명 입력
  - 의견 입력 (선택)
  - bp_signature = Base64 이미지
  - bp_confirmed = true
  - bp_confirmed_at = 현재 시간
  - bp_confirmed_by = {bp_user_id}
  - status: 'completed'
  ↓
PDF 자동 생성 및 저장
  - 서명 완료 시 자동 생성
  - Supabase Storage에 저장
  - pdf_file_path = Storage 경로
  - pdf_generated_at = 현재 시간
  ↓
Owner에게 알림
  - 서명 완료 알림
  - PDF 다운로드 가능
```

**월별 작업확인서 (매일 업데이트)**

```
일별 작업확인서 생성 (매일)
  ↓
월별 작업확인서에 해당 날짜 데이터 추가
  - 1월 1일: 월별 작업확인서 생성 (1월분)
  - 1월 2일: 월별 작업확인서에 2일 데이터 추가
  - ...
  - 1월 31일: 월별 작업확인서 완성
  ↓
매일 BP 서명
  - 일별 작업확인서 서명과 동시에
  - 월별 작업확인서 해당 날짜 행에 서명
  - monthly_work_confirmations 테이블의 daily_signatures (JSON)에 저장
    * { "2025-01-01": "서명 이미지 Base64", ... }
  ↓
매일 PDF 생성
  - 월별 작업확인서 PDF 생성 (누적)
  - 1월 1일: 1일치 PDF
  - 1월 2일: 1-2일치 PDF
  - ...
  - 1월 31일: 1-31일치 PDF (최종)
  ↓
월말 최종 완성
  - 한 달치 전체 작업 내역 + 매일의 서명 포함
  - PDF 다운로드 가능
```

**작업확인서 양식 (종이 → 디지털)**

일별 작업확인서:
```
작업확인서
━━━━━━━━━━━━━━━━━━━━━━
현장명: [자동] | 기사명: [자동]
협력사명: [자동] | 차량번호: [자동]
작업위치: [수동 입력] | 장비명: [자동]
작업내용: [수동 입력] | 규격: [자동]

작업시간:
  O/T | [자동] 시간 | 야간: [자동]
  철야 | [자동] 시간 | [자동]

상기와 같이 작업을 확인함.

[작업 날짜]

[Owner 회사명] 확인자: (서명 없음)
━━━━━━━━━━━━━━━━━━━━━━
[BP 회사명]
담당자: [BP 담당자 서명] ← 전자서명
━━━━━━━━━━━━━━━━━━━━━━
[Owner 회사 연락처]
```

월별 작업확인서:
```
[년월] [차종] 작업 확인서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
중사명: [현장명]
장비번호: [차종] ([차량번호])
담당자: [BP 담당자명] (인)

날짜 | 작업내용 | 초과(O/T) | 야간 | 확인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
25/9/26 | 설치 | 2 | | [서명]
25/9/27 | 설치 | | | [서명]
25/9/28 | | | | 
25/9/29 | 설치 | 2 | 2 | [서명]
... (매일 기록)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
특별기사항:
```

---

#### 5.2.5. 장비 점검표 프로세스

**Worker - 장비 일일 점검표**

**목적**: 장비 상태 관리, 정비 예정일 파악, 사고 예방

```
작업 시작 전
  ↓
점검표 작성 화면 열기
  ↓
차량 정보 자동 로드
  - 차종에 맞는 점검표 템플릿 자동 로드
  - 일일/주별/월별 체크 항목 표시
  ↓
운행 시간 입력 (계기판) ✏️
  ↓
가동 시간 입력 (아워미터) ✏️
  ↓
점검 항목 체크
  - 일일 체크: 매일
  - 주별 체크: 해당 주차인 경우만
  - 월별 체크: 해당 월인 경우만
  ↓
이상 발견 시
  - 이상 항목 선택
  - 상세 내용 입력 ✏️
  - 사진 첨부 (선택) 📷
  ↓
제출
  ↓
equipment_daily_inspections 테이블에 저장
  - equipment_id, worker_id, inspection_date
  - odometer_reading (운행 시간)
  - hour_meter_reading (가동 시간)
  - checklist_items (JSON, 점검 항목 체크 결과)
  - issues_found (이상 발견 여부)
  - issue_details (이상 상세 내용)
  - photos (사진 URL 배열)
  - status: 'submitted'
  ↓
Owner에게 제출
  - Owner는 점검 이력 조회
  - 운행 시간, 가동 시간으로 정비 예정일 계산
  - 이상 발견 시 정비 조치
```

**Inspector - 안전 점검표**

**목적**: 현장 안전 관리, EP 요구사항

```
로그인 (전화번호 + 비밀번호)
  ↓
차량 검색 (차량 번호)
  ↓
차량 선택
  ↓
안전 점검표 템플릿 자동 로드
  - 차종에 맞는 템플릿
  ↓
점검 항목 체크
  - 현장 안전 관련 항목
  ↓
이상 발견 시
  - 이상 항목 선택
  - 상세 내용 입력 ✏️
  - 사진 첨부 (선택) 📷
  ↓
Inspector 서명 (필수)
  - 전자서명 (터치/마우스)
  ↓
제출
  ↓
safety_inspections 테이블에 저장
  - equipment_id, inspector_id, inspection_date
  - checklist_items (JSON, 점검 항목 체크 결과)
  - issues_found (이상 발견 여부)
  - issue_details (이상 상세 내용)
  - photos (사진 URL 배열)
  - inspector_signature (서명 이미지)
  - status: 'submitted'
  ↓
BP 및 EP에게 제출
  - BP/EP는 점검 이력 조회
  - 이상 발견 시 조치
```

**점검표 템플릿 구조**

Admin이 차종별로 템플릿 생성:

```json
{
  "template_id": "excavator_checklist",
  "equipment_type": "굴삭기",
  "template_type": "worker", // 또는 "inspector"
  "checklist_items": [
    {
      "category": "엔진",
      "frequency": "daily", // daily, weekly, monthly
      "items": [
        { "id": "engine_oil", "label": "엔진 오일 레벨 확인", "type": "checkbox" },
        { "id": "coolant", "label": "냉각수 레벨 확인", "type": "checkbox" }
      ]
    },
    {
      "category": "유압",
      "frequency": "weekly",
      "items": [
        { "id": "hydraulic_oil", "label": "유압 오일 레벨 확인", "type": "checkbox" },
        { "id": "hydraulic_hose", "label": "유압 호스 누유 확인", "type": "checkbox" }
      ]
    }
  ]
}
```

차량 등록 시:
```
차량 등록 화면
  ↓
차종 선택 (예: 굴삭기)
  ↓
해당 차종의 점검표 템플릿 자동 연결
  - equipment.worker_checklist_template_id = "excavator_checklist"
  - equipment.inspector_checklist_template_id = "excavator_safety_checklist"
```

점검표 작성 시:
```
Worker/Inspector가 점검표 작성
  ↓
차량 정보 조회
  ↓
해당 차량의 점검표 템플릿 ID 확인
  ↓
템플릿 조회 및 로드
  ↓
점검 항목 표시
```

---

#### 5.2.6. 실시간 위치 추적 프로세스

**GPS 위치 전송 (Worker 모바일 앱)**

```
작업 시작
  ↓
GPS 위치 전송 시작
  - 5분 간격 (system_settings에서 조정 가능)
  - 백그라운드에서 자동 전송
  ↓
매 5분마다
  - 현재 위치 정보 수집
    * latitude (위도)
    * longitude (경도)
    * accuracy (정확도)
    * logged_at (시간)
  - location_logs 테이블에 저장
    * worker_id, equipment_id, work_session_id
    * latitude, longitude, accuracy, logged_at
  ↓
작업 종료
  ↓
GPS 위치 전송 중지
```

**위치 조회 (Owner/BP/EP 대시보드)**

Owner:
```
실시간 위치 추적 페이지 열기
  ↓
투입 중인 장비/인력 목록 조회
  ↓
각 장비/인력의 최근 위치 조회
  - location_logs에서 최근 5분 이내 위치 조회
  ↓
지도에 마커 표시
  - 마커: 장비 아이콘 + 운전자 이름
  - 클릭 시 상세 정보 표시
    * 장비명, 차량번호
    * 운전자명, 전화번호
    * 마지막 위치 업데이트 시간
```

BP:
```
실시간 위치 추적 페이지 열기
  ↓
필터 선택
  - Owner별 필터
  - 장비별 필터
  ↓
투입 중인 장비/인력 목록 조회
  ↓
지도에 마커 표시
  - Owner별로 색상 구분
```

EP:
```
실시간 위치 추적 페이지 열기
  ↓
필터 선택
  - BP별 필터
  - Owner별 필터
  - 장비별 필터
  ↓
전체 현장 장비 위치 조회
  ↓
지도에 마커 표시
  - BP별, Owner별로 색상 구분
  - 마커에 BP, Owner, 장비, 운전자 모두 표시
```

---

#### 5.2.7. 긴급 상황 알림 프로세스

```
Worker 모바일 앱
  ↓
긴급 버튼 클릭 (큰 빨간 버튼)
  ↓
긴급 상황 유형 선택
  - 사고
  - 고장
  - 기타
  ↓
상세 내용 입력 (선택) ✏️
  ↓
현재 위치 자동 수집
  - latitude, longitude
  ↓
emergency_alerts 테이블에 저장
  - worker_id, equipment_id
  - alert_type, description
  - latitude, longitude
  - status: 'active'
  - created_at
  ↓
Owner, BP, EP에게 즉시 알림
  - 시스템 알림 (푸시)
  - 메일 알림
  - 알림 내용:
    * 긴급 상황 유형
    * 운전자명, 장비명
    * 위치 (지도 링크)
    * 시간
  ↓
Owner/BP/EP 대시보드
  - 긴급 상황 목록 표시
  - 위치 확인 (지도)
  - 상태 업데이트
    * 처리 중: status = 'in_progress'
    * 완료: status = 'resolved', resolved_at = 현재 시간
```

---

#### 5.2.8. 회사 및 사용자 등록 프로세스

**회사 등록**

Admin:
```
회사 관리 페이지
  ↓
회사 등록
  - 회사 유형 선택 (Owner, BP, EP)
  - 회사명, 사업자번호 입력
  - 연락처, 주소 입력
  - 담당자 정보 입력
  ↓
companies 테이블에 저장
```

EP:
```
회사 관리 페이지
  ↓
BP 회사 등록 또는 Owner 회사 등록
  ↓
companies 테이블에 저장
  - created_by_ep_id = {ep_user_id}
```

BP:
```
회사 관리 페이지
  ↓
Owner 회사 등록
  ↓
companies 테이블에 저장
  - created_by_bp_id = {bp_user_id}
```

**사용자 등록**

Admin:
```
사용자 관리 페이지
  ↓
사용자 등록
  - 역할 선택 (Admin, Owner, BP, EP, Inspector)
  - 이름, 전화번호 입력
  - 소속 회사 선택 (Owner/BP/EP/Inspector인 경우)
  - 기본 비밀번호: 0000
  ↓
users 테이블에 저장
```

EP:
```
사용자 관리 페이지
  ↓
EP 사용자 또는 Inspector 등록
  - 이름, 전화번호 입력
  - 권한 설정 (읽기 전용, 수정 가능 등)
  - 기본 비밀번호: 0000
  ↓
users 테이블에 저장
  - company_id = {ep_company_id}
```

BP:
```
사용자 관리 페이지
  ↓
BP 사용자 등록
  - 이름, 전화번호 입력
  - 권한 설정
  - 기본 비밀번호: 0000
  ↓
users 테이블에 저장
  - company_id = {bp_company_id}
```

Owner:
```
인력 관리 페이지
  ↓
Worker 등록
  - 이름, 전화번호 입력
  - 자격증 정보 입력
  - 서류 첨부
  - 기본 비밀번호: 0000
  ↓
users 테이블에 저장
  - role = 'worker'
  - company_id = {owner_company_id}
  ↓
장비 배정 (선택)
  - 장비 선택
  - workers 테이블 업데이트
    * equipment_id = {equipment_id}
```

---

## 6. 데이터베이스 설계

### 6.1. 테이블 목록 (총 20개)

#### 기본 테이블 (5개)
1. **users** - 사용자 (Admin, Owner, BP, EP, Worker, Inspector)
2. **companies** - 회사 (Owner, BP, EP)
3. **equipment** - 장비
4. **workers** - 인력 (Worker 추가 정보)
5. **system_settings** - 시스템 설정

#### 반입 요청 및 투입 관리 (5개)
6. **entry_requests** - 반입 요청
7. **entry_request_items** - 반입 요청 아이템 (장비/인력 목록)
8. **deployments** - 투입 관리
9. **deployment_worker_changes** - 운전자 교체 이력
10. **deployment_extensions** - 투입 기간 연장 이력

#### 작업 관리 (4개)
11. **work_sessions** - 작업 세션 (시작/종료/휴식)
12. **location_logs** - GPS 위치 로그
13. **daily_work_confirmations** - 일별 작업확인서
14. **monthly_work_confirmations** - 월별 작업확인서

#### 점검표 (3개)
15. **checklist_templates** - 점검표 템플릿 (차종별)
16. **equipment_daily_inspections** - 장비 일일 점검표 (Worker용)
17. **safety_inspections** - 안전 점검표 (Inspector용)

#### 기타 (3개)
18. **emergency_alerts** - 긴급 알림
19. **documents** - 서류 관리
20. **notifications** - 알림

---

### 6.2. 테이블 상세 설계

#### 6.2.1. users (사용자)

```sql
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(320) UNIQUE,
  password TEXT NOT NULL, -- SHA-256 해시
  pin VARCHAR(4), -- Worker/Inspector용 (기본: 0000)
  role VARCHAR(20) NOT NULL, -- 'admin', 'owner', 'bp', 'ep', 'worker', 'inspector'
  company_id VARCHAR(64), -- 소속 회사 (Owner/BP/EP/Worker/Inspector)
  permissions JSONB, -- 권한 설정 (읽기 전용, 수정 가능 등)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company_id ON users(company_id);
```

**필드 설명**:
- `phone`: 로그인 ID (전화번호)
- `password`: 해시된 비밀번호 (기본: 0000의 해시)
- `pin`: Worker/Inspector용 PIN (기본: 0000, 사용 안 함)
- `role`: 역할 (admin, owner, bp, ep, worker, inspector)
- `company_id`: 소속 회사 (Owner/BP/EP/Worker/Inspector)
- `permissions`: 권한 설정 (JSON)
  ```json
  {
    "can_create": true,
    "can_update": true,
    "can_delete": false,
    "can_approve": true
  }
  ```

---

#### 6.2.2. companies (회사)

```sql
CREATE TABLE companies (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'owner', 'bp', 'ep'
  business_number VARCHAR(50) UNIQUE, -- 사업자번호
  phone VARCHAR(20),
  fax VARCHAR(20),
  address TEXT,
  contact_person VARCHAR(100), -- 담당자명
  contact_phone VARCHAR(20), -- 담당자 전화번호
  contact_email VARCHAR(320), -- 담당자 이메일
  created_by_admin_id VARCHAR(64), -- Admin이 등록한 경우
  created_by_ep_id VARCHAR(64), -- EP가 등록한 경우
  created_by_bp_id VARCHAR(64), -- BP가 등록한 경우
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (created_by_admin_id) REFERENCES users(id),
  FOREIGN KEY (created_by_ep_id) REFERENCES users(id),
  FOREIGN KEY (created_by_bp_id) REFERENCES users(id)
);

CREATE INDEX idx_companies_type ON companies(type);
CREATE INDEX idx_companies_business_number ON companies(business_number);
```

---

#### 6.2.3. equipment (장비)

```sql
CREATE TABLE equipment (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) NOT NULL, -- Owner (장비 임대 사업자)
  name VARCHAR(200) NOT NULL, -- 장비명
  type VARCHAR(100) NOT NULL, -- 차종 (굴삭기, 덤프트럭 등)
  license_plate VARCHAR(50) UNIQUE NOT NULL, -- 차량번호
  license_plate_last4 VARCHAR(4) NOT NULL, -- 차량번호 뒷자리 4자리 (검색용)
  spec VARCHAR(200), -- 규격
  current_driver_id VARCHAR(64), -- 현재 운전자
  worker_checklist_template_id VARCHAR(64), -- Worker용 점검표 템플릿
  inspector_checklist_template_id VARCHAR(64), -- Inspector용 점검표 템플릿
  status VARCHAR(50) DEFAULT 'available', -- 'available', 'deployed', 'maintenance'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (current_driver_id) REFERENCES users(id),
  FOREIGN KEY (worker_checklist_template_id) REFERENCES checklist_templates(id),
  FOREIGN KEY (inspector_checklist_template_id) REFERENCES checklist_templates(id)
);

CREATE INDEX idx_equipment_owner_id ON equipment(owner_id);
CREATE INDEX idx_equipment_license_plate ON equipment(license_plate);
CREATE INDEX idx_equipment_license_plate_last4 ON equipment(license_plate_last4);
CREATE INDEX idx_equipment_current_driver_id ON equipment(current_driver_id);
```

**필드 설명**:
- `license_plate_last4`: 차량 번호 뒷자리 4자리 (Worker 로그인 시 검색용, 사용 안 함)
- `worker_checklist_template_id`: Worker용 점검표 템플릿 ID
- `inspector_checklist_template_id`: Inspector용 점검표 템플릿 ID

---

#### 6.2.4. workers (인력 추가 정보)

```sql
CREATE TABLE workers (
  id VARCHAR(64) PRIMARY KEY, -- users.id와 동일
  user_id VARCHAR(64) UNIQUE NOT NULL,
  owner_id VARCHAR(64) NOT NULL, -- 소속 Owner
  equipment_id VARCHAR(64), -- 현재 배정된 장비
  license_number VARCHAR(50), -- 면허번호
  license_type VARCHAR(50), -- 면허 종류
  license_expiry_date DATE, -- 면허 만료일
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

CREATE INDEX idx_workers_user_id ON workers(user_id);
CREATE INDEX idx_workers_owner_id ON workers(owner_id);
CREATE INDEX idx_workers_equipment_id ON workers(equipment_id);
```

---

#### 6.2.5. system_settings (시스템 설정)

```sql
CREATE TABLE system_settings (
  id VARCHAR(64) PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(64),
  
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 초기 데이터
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
  ('gps_interval', 'gps_tracking_interval', '300', 'GPS 위치 전송 간격 (초)'),
  ('work_hours', 'standard_work_hours', '8', '기준 근무 시간 (시간)');
```

---

#### 6.2.6. entry_requests (반입 요청)

```sql
CREATE TABLE entry_requests (
  id VARCHAR(64) PRIMARY KEY,
  request_number VARCHAR(100) UNIQUE NOT NULL, -- 요청 번호 (자동 생성)
  
  -- 요청 정보
  bp_company_id VARCHAR(64) NOT NULL, -- 협력사 (BP)
  bp_user_id VARCHAR(64) NOT NULL, -- 요청자 (BP 사용자)
  owner_id VARCHAR(64) NOT NULL, -- 장비 임대 사업자
  purpose TEXT, -- 투입 목적
  requested_start_date DATE, -- 투입 예정일
  requested_end_date DATE, -- 철수 예정일
  
  -- 워크플로우 상태
  status VARCHAR(50) DEFAULT 'bp_requested' NOT NULL,
  -- 'bp_requested': BP가 Owner에게 요청
  -- 'owner_approved': Owner 승인
  -- 'bp_approved': BP가 EP에게 승인 요청
  -- 'ep_approved': EP 최종 승인 (투입 시작)
  -- 'rejected': 반려
  
  -- Owner 승인
  owner_approved_at TIMESTAMP,
  owner_approved_by VARCHAR(64),
  owner_comment TEXT,
  
  -- BP 승인 (EP에게 전달)
  bp_approved_at TIMESTAMP,
  bp_approved_by VARCHAR(64),
  work_plan_file_url VARCHAR(500), -- 장비 사용 계획서
  bp_comment TEXT,
  
  -- EP 승인
  ep_approved_at TIMESTAMP,
  ep_approved_by VARCHAR(64),
  ep_comment TEXT,
  
  -- 반려
  rejected_at TIMESTAMP,
  rejected_by VARCHAR(64),
  reject_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (bp_company_id) REFERENCES companies(id),
  FOREIGN KEY (bp_user_id) REFERENCES users(id),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (owner_approved_by) REFERENCES users(id),
  FOREIGN KEY (bp_approved_by) REFERENCES users(id),
  FOREIGN KEY (ep_approved_by) REFERENCES users(id),
  FOREIGN KEY (rejected_by) REFERENCES users(id)
);

CREATE INDEX idx_entry_requests_bp_company_id ON entry_requests(bp_company_id);
CREATE INDEX idx_entry_requests_owner_id ON entry_requests(owner_id);
CREATE INDEX idx_entry_requests_status ON entry_requests(status);
```

---

#### 6.2.7. entry_request_items (반입 요청 아이템)

```sql
CREATE TABLE entry_request_items (
  id VARCHAR(64) PRIMARY KEY,
  entry_request_id VARCHAR(64) NOT NULL,
  item_type VARCHAR(20) NOT NULL, -- 'equipment', 'worker'
  item_id VARCHAR(64) NOT NULL, -- equipment.id 또는 workers.id
  
  -- 서류 검증 결과
  document_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'expired', 'missing'
  document_issues JSONB, -- 서류 문제점
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (entry_request_id) REFERENCES entry_requests(id) ON DELETE CASCADE
);

CREATE INDEX idx_entry_request_items_entry_request_id ON entry_request_items(entry_request_id);
CREATE INDEX idx_entry_request_items_item_type ON entry_request_items(item_type);
CREATE INDEX idx_entry_request_items_item_id ON entry_request_items(item_id);
```

---

#### 6.2.8. deployments (투입 관리)

```sql
CREATE TABLE deployments (
  id VARCHAR(64) PRIMARY KEY,
  entry_request_id VARCHAR(64) NOT NULL, -- 반입 요청 ID
  equipment_id VARCHAR(64) NOT NULL,
  worker_id VARCHAR(64) NOT NULL,
  owner_id VARCHAR(64) NOT NULL,
  bp_company_id VARCHAR(64) NOT NULL,
  ep_company_id VARCHAR(64) NOT NULL,
  
  start_date DATE NOT NULL, -- 투입 시작일
  planned_end_date DATE NOT NULL, -- 예정 반출일
  actual_end_date DATE, -- 실제 반출일
  
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'extended', 'completed'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (entry_request_id) REFERENCES entry_requests(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (worker_id) REFERENCES users(id),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (bp_company_id) REFERENCES companies(id),
  FOREIGN KEY (ep_company_id) REFERENCES companies(id)
);

CREATE INDEX idx_deployments_equipment_id ON deployments(equipment_id);
CREATE INDEX idx_deployments_worker_id ON deployments(worker_id);
CREATE INDEX idx_deployments_owner_id ON deployments(owner_id);
CREATE INDEX idx_deployments_bp_company_id ON deployments(bp_company_id);
CREATE INDEX idx_deployments_status ON deployments(status);
```

---

#### 6.2.9. deployment_worker_changes (운전자 교체 이력)

```sql
CREATE TABLE deployment_worker_changes (
  id VARCHAR(64) PRIMARY KEY,
  deployment_id VARCHAR(64) NOT NULL,
  old_worker_id VARCHAR(64) NOT NULL,
  new_worker_id VARCHAR(64) NOT NULL,
  change_reason TEXT,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by VARCHAR(64) NOT NULL, -- Owner
  
  FOREIGN KEY (deployment_id) REFERENCES deployments(id),
  FOREIGN KEY (old_worker_id) REFERENCES users(id),
  FOREIGN KEY (new_worker_id) REFERENCES users(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE INDEX idx_deployment_worker_changes_deployment_id ON deployment_worker_changes(deployment_id);
```

---

#### 6.2.10. deployment_extensions (투입 기간 연장 이력)

```sql
CREATE TABLE deployment_extensions (
  id VARCHAR(64) PRIMARY KEY,
  deployment_id VARCHAR(64) NOT NULL,
  old_end_date DATE NOT NULL,
  new_end_date DATE NOT NULL,
  extension_reason TEXT,
  extended_at TIMESTAMP DEFAULT NOW(),
  extended_by VARCHAR(64) NOT NULL, -- Owner
  
  FOREIGN KEY (deployment_id) REFERENCES deployments(id),
  FOREIGN KEY (extended_by) REFERENCES users(id)
);

CREATE INDEX idx_deployment_extensions_deployment_id ON deployment_extensions(deployment_id);
```

---

#### 6.2.11. work_sessions (작업 세션)

```sql
CREATE TABLE work_sessions (
  id VARCHAR(64) PRIMARY KEY,
  deployment_id VARCHAR(64) NOT NULL,
  worker_id VARCHAR(64) NOT NULL,
  equipment_id VARCHAR(64) NOT NULL,
  
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  
  break_start_time TIMESTAMP,
  break_end_time TIMESTAMP,
  break_duration INTEGER DEFAULT 0, -- 분
  
  status VARCHAR(50) DEFAULT 'started', -- 'started', 'break', 'ended'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (deployment_id) REFERENCES deployments(id),
  FOREIGN KEY (worker_id) REFERENCES users(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

CREATE INDEX idx_work_sessions_deployment_id ON work_sessions(deployment_id);
CREATE INDEX idx_work_sessions_worker_id ON work_sessions(worker_id);
CREATE INDEX idx_work_sessions_equipment_id ON work_sessions(equipment_id);
CREATE INDEX idx_work_sessions_status ON work_sessions(status);
```

---

#### 6.2.12. location_logs (GPS 위치 로그)

```sql
CREATE TABLE location_logs (
  id VARCHAR(64) PRIMARY KEY,
  worker_id VARCHAR(64) NOT NULL,
  equipment_id VARCHAR(64) NOT NULL,
  work_session_id VARCHAR(64),
  
  latitude DECIMAL(10, 8) NOT NULL, -- 위도
  longitude DECIMAL(11, 8) NOT NULL, -- 경도
  accuracy DECIMAL(10, 2), -- 정확도 (미터)
  
  logged_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (worker_id) REFERENCES users(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (work_session_id) REFERENCES work_sessions(id)
);

CREATE INDEX idx_location_logs_worker_id ON location_logs(worker_id);
CREATE INDEX idx_location_logs_equipment_id ON location_logs(equipment_id);
CREATE INDEX idx_location_logs_logged_at ON location_logs(logged_at);
```

---

#### 6.2.13. daily_work_confirmations (일별 작업확인서)

```sql
CREATE TABLE daily_work_confirmations (
  id VARCHAR(64) PRIMARY KEY,
  work_session_id VARCHAR(64), -- 작업 세션 ID
  deployment_id VARCHAR(64) NOT NULL,
  
  -- 관계자
  owner_id VARCHAR(64) NOT NULL,
  owner_company_id VARCHAR(64) NOT NULL,
  bp_company_id VARCHAR(64) NOT NULL,
  worker_id VARCHAR(64) NOT NULL,
  equipment_id VARCHAR(64) NOT NULL,
  
  -- 헤더 정보
  work_date DATE NOT NULL,
  site_name VARCHAR(200), -- 현장명
  bp_company_name VARCHAR(200), -- 협력사명 (BP)
  work_location TEXT, -- 작업 위치 (Worker 수동 입력)
  work_content TEXT, -- 작업 내용 (Worker 수동 입력)
  
  -- 장비 및 기사 정보 (자동 입력)
  worker_name VARCHAR(100), -- 기사명
  vehicle_number VARCHAR(100), -- 차량번호
  equipment_name VARCHAR(200), -- 장비명
  equipment_spec VARCHAR(200), -- 규격
  
  -- 작업 시간 (자동 입력 → 수정 가능)
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  break_duration INTEGER DEFAULT 0, -- 분
  total_work_minutes INTEGER NOT NULL, -- 자동 계산
  overtime_minutes INTEGER DEFAULT 0, -- 자동 계산
  
  -- 시간 수정 여부
  time_manually_edited BOOLEAN DEFAULT FALSE,
  
  -- Worker 확인 (서명 없음, 확인만)
  worker_confirmed BOOLEAN DEFAULT FALSE,
  worker_confirmed_at TIMESTAMP,
  
  -- Owner 제출 (서명 없음, 제출만)
  submitted_by_owner VARCHAR(64), -- Owner ID
  submitted_at TIMESTAMP,
  
  -- Owner 회사 정보 (문서 하단 표기용)
  owner_company_name VARCHAR(200),
  owner_company_phone VARCHAR(20),
  owner_company_fax VARCHAR(20),
  owner_contact_person VARCHAR(100),
  owner_contact_phone VARCHAR(20),
  
  -- BP 서명 (유일한 서명)
  bp_confirmed BOOLEAN DEFAULT FALSE,
  bp_signature TEXT, -- Base64 이미지
  bp_confirmed_at TIMESTAMP,
  bp_confirmed_by VARCHAR(64),
  bp_contact_person VARCHAR(100), -- BP 담당자명
  bp_comments TEXT,
  
  -- 메일 전송
  email_sent_to_bp BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  
  -- PDF 저장 (BP 서명 완료 시 자동 생성)
  pdf_file_path VARCHAR(500), -- Supabase Storage 경로
  pdf_generated_at TIMESTAMP,
  pdf_file_size INTEGER, -- bytes
  
  status VARCHAR(50) DEFAULT 'draft' NOT NULL,
  -- 'draft': 작성 중 (Worker가 작성 중)
  -- 'worker_confirmed': Worker 확인 완료
  -- 'submitted': Owner가 BP에게 제출 완료
  -- 'bp_pending': BP 서명 대기 중 (메일 전송 시)
  -- 'completed': BP 서명 완료
  -- 'rejected': 반려
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (work_session_id) REFERENCES work_sessions(id),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (owner_company_id) REFERENCES companies(id),
  FOREIGN KEY (bp_company_id) REFERENCES companies(id),
  FOREIGN KEY (worker_id) REFERENCES users(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (submitted_by_owner) REFERENCES users(id),
  FOREIGN KEY (bp_confirmed_by) REFERENCES users(id)
);

CREATE INDEX idx_daily_work_confirmations_deployment_id ON daily_work_confirmations(deployment_id);
CREATE INDEX idx_daily_work_confirmations_owner_id ON daily_work_confirmations(owner_id);
CREATE INDEX idx_daily_work_confirmations_bp_company_id ON daily_work_confirmations(bp_company_id);
CREATE INDEX idx_daily_work_confirmations_worker_id ON daily_work_confirmations(worker_id);
CREATE INDEX idx_daily_work_confirmations_work_date ON daily_work_confirmations(work_date);
CREATE INDEX idx_daily_work_confirmations_status ON daily_work_confirmations(status);
```

---

#### 6.2.14. monthly_work_confirmations (월별 작업확인서)

```sql
CREATE TABLE monthly_work_confirmations (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) NOT NULL,
  owner_company_id VARCHAR(64) NOT NULL,
  bp_company_id VARCHAR(64) NOT NULL,
  worker_id VARCHAR(64) NOT NULL,
  equipment_id VARCHAR(64) NOT NULL,
  
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  
  -- 헤더 정보
  site_name VARCHAR(200), -- 현장명
  bp_company_name VARCHAR(200), -- 협력사명
  equipment_type VARCHAR(100), -- 차종
  vehicle_number VARCHAR(100), -- 차량번호
  bp_contact_person VARCHAR(100), -- BP 담당자명
  
  -- 월별 요약
  total_days INTEGER DEFAULT 0, -- 총 작업 일수
  total_work_minutes INTEGER DEFAULT 0, -- 총 작업 시간 (분)
  total_overtime_minutes INTEGER DEFAULT 0, -- 총 초과 근무 시간 (분)
  
  -- 일별 데이터 (JSON 배열)
  daily_data JSONB,
  -- [
  --   {
  --     "date": "2025-09-26",
  --     "work_content": "설치",
  --     "overtime_hours": 2,
  --     "night_hours": 0,
  --     "signature": "Base64 이미지"
  --   },
  --   ...
  -- ]
  
  -- BP 서명 (매일)
  daily_signatures JSONB,
  -- {
  --   "2025-09-26": "Base64 이미지",
  --   "2025-09-27": "Base64 이미지",
  --   ...
  -- }
  
  -- 월말 최종 서명
  bp_final_signature TEXT, -- Base64 이미지
  bp_final_confirmed_at TIMESTAMP,
  bp_final_confirmed_by VARCHAR(64),
  
  -- PDF 저장 (매일 업데이트)
  pdf_file_path VARCHAR(500), -- Supabase Storage 경로
  pdf_generated_at TIMESTAMP,
  pdf_file_size INTEGER, -- bytes
  
  status VARCHAR(50) DEFAULT 'in_progress',
  -- 'in_progress': 진행 중 (매일 업데이트)
  -- 'completed': 월말 완성
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (owner_company_id) REFERENCES companies(id),
  FOREIGN KEY (bp_company_id) REFERENCES companies(id),
  FOREIGN KEY (worker_id) REFERENCES users(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (bp_final_confirmed_by) REFERENCES users(id),
  
  UNIQUE (owner_id, bp_company_id, worker_id, equipment_id, year, month)
);

CREATE INDEX idx_monthly_work_confirmations_owner_id ON monthly_work_confirmations(owner_id);
CREATE INDEX idx_monthly_work_confirmations_bp_company_id ON monthly_work_confirmations(bp_company_id);
CREATE INDEX idx_monthly_work_confirmations_worker_id ON monthly_work_confirmations(worker_id);
CREATE INDEX idx_monthly_work_confirmations_year_month ON monthly_work_confirmations(year, month);
```

---

#### 6.2.15. checklist_templates (점검표 템플릿)

```sql
CREATE TABLE checklist_templates (
  id VARCHAR(64) PRIMARY KEY,
  template_name VARCHAR(200) NOT NULL,
  equipment_type VARCHAR(100) NOT NULL, -- 차종 (굴삭기, 덤프트럭 등)
  template_type VARCHAR(20) NOT NULL, -- 'worker', 'inspector'
  
  checklist_items JSONB NOT NULL,
  -- {
  --   "categories": [
  --     {
  --       "category": "엔진",
  --       "frequency": "daily",
  --       "items": [
  --         { "id": "engine_oil", "label": "엔진 오일 레벨 확인", "type": "checkbox" },
  --         { "id": "coolant", "label": "냉각수 레벨 확인", "type": "checkbox" }
  --       ]
  --     },
  --     {
  --       "category": "유압",
  --       "frequency": "weekly",
  --       "items": [...]
  --     }
  --   ]
  -- }
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(64), -- Admin
  
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_checklist_templates_equipment_type ON checklist_templates(equipment_type);
CREATE INDEX idx_checklist_templates_template_type ON checklist_templates(template_type);
```

---

#### 6.2.16. equipment_daily_inspections (장비 일일 점검표)

```sql
CREATE TABLE equipment_daily_inspections (
  id VARCHAR(64) PRIMARY KEY,
  equipment_id VARCHAR(64) NOT NULL,
  worker_id VARCHAR(64) NOT NULL,
  deployment_id VARCHAR(64),
  template_id VARCHAR(64) NOT NULL, -- 점검표 템플릿
  
  inspection_date DATE NOT NULL,
  
  -- 운행 정보
  odometer_reading INTEGER, -- 운행 시간 (km 또는 시간)
  hour_meter_reading INTEGER, -- 가동 시간 (시간)
  
  -- 점검 항목 체크 결과
  checklist_items JSONB NOT NULL,
  -- {
  --   "engine_oil": true,
  --   "coolant": true,
  --   "hydraulic_oil": false, // 이상 발견
  --   ...
  -- }
  
  -- 이상 발견
  issues_found BOOLEAN DEFAULT FALSE,
  issue_details TEXT, -- 이상 상세 내용
  photos JSONB, -- 사진 URL 배열 ["url1", "url2", ...]
  
  status VARCHAR(50) DEFAULT 'submitted',
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (worker_id) REFERENCES users(id),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id),
  FOREIGN KEY (template_id) REFERENCES checklist_templates(id)
);

CREATE INDEX idx_equipment_daily_inspections_equipment_id ON equipment_daily_inspections(equipment_id);
CREATE INDEX idx_equipment_daily_inspections_worker_id ON equipment_daily_inspections(worker_id);
CREATE INDEX idx_equipment_daily_inspections_inspection_date ON equipment_daily_inspections(inspection_date);
```

---

#### 6.2.17. safety_inspections (안전 점검표)

```sql
CREATE TABLE safety_inspections (
  id VARCHAR(64) PRIMARY KEY,
  equipment_id VARCHAR(64) NOT NULL,
  inspector_id VARCHAR(64) NOT NULL,
  bp_company_id VARCHAR(64) NOT NULL,
  ep_company_id VARCHAR(64) NOT NULL,
  template_id VARCHAR(64) NOT NULL, -- 점검표 템플릿
  
  inspection_date DATE NOT NULL,
  site_name VARCHAR(200), -- 현장명
  
  -- 점검 항목 체크 결과
  checklist_items JSONB NOT NULL,
  
  -- 이상 발견
  issues_found BOOLEAN DEFAULT FALSE,
  issue_details TEXT,
  photos JSONB, -- 사진 URL 배열
  
  -- Inspector 서명 (필수)
  inspector_signature TEXT NOT NULL, -- Base64 이미지
  inspector_signed_at TIMESTAMP DEFAULT NOW(),
  
  status VARCHAR(50) DEFAULT 'submitted',
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (inspector_id) REFERENCES users(id),
  FOREIGN KEY (bp_company_id) REFERENCES companies(id),
  FOREIGN KEY (ep_company_id) REFERENCES companies(id),
  FOREIGN KEY (template_id) REFERENCES checklist_templates(id)
);

CREATE INDEX idx_safety_inspections_equipment_id ON safety_inspections(equipment_id);
CREATE INDEX idx_safety_inspections_inspector_id ON safety_inspections(inspector_id);
CREATE INDEX idx_safety_inspections_bp_company_id ON safety_inspections(bp_company_id);
CREATE INDEX idx_safety_inspections_ep_company_id ON safety_inspections(ep_company_id);
CREATE INDEX idx_safety_inspections_inspection_date ON safety_inspections(inspection_date);
```

---

#### 6.2.18. emergency_alerts (긴급 알림)

```sql
CREATE TABLE emergency_alerts (
  id VARCHAR(64) PRIMARY KEY,
  worker_id VARCHAR(64) NOT NULL,
  equipment_id VARCHAR(64) NOT NULL,
  deployment_id VARCHAR(64),
  
  alert_type VARCHAR(50) NOT NULL, -- 'accident', 'breakdown', 'other'
  description TEXT,
  
  latitude DECIMAL(10, 8), -- 위도
  longitude DECIMAL(11, 8), -- 경도
  
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'in_progress', 'resolved'
  
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(64), -- Owner/BP/EP
  resolution_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (worker_id) REFERENCES users(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (deployment_id) REFERENCES deployments(id),
  FOREIGN KEY (resolved_by) REFERENCES users(id)
);

CREATE INDEX idx_emergency_alerts_worker_id ON emergency_alerts(worker_id);
CREATE INDEX idx_emergency_alerts_equipment_id ON emergency_alerts(equipment_id);
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX idx_emergency_alerts_created_at ON emergency_alerts(created_at);
```

---

#### 6.2.19. documents (서류 관리)

```sql
CREATE TABLE documents (
  id VARCHAR(64) PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL, -- 'equipment_registration', 'insurance', 'license' 등
  related_type VARCHAR(50) NOT NULL, -- 'equipment', 'worker'
  related_id VARCHAR(64) NOT NULL, -- equipment.id 또는 workers.id
  
  file_name VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL, -- Supabase Storage URL
  file_size INTEGER, -- bytes
  
  issue_date DATE,
  expiry_date DATE, -- 만료일
  
  status VARCHAR(50) DEFAULT 'valid', -- 'valid', 'expiring_soon', 'expired'
  
  uploaded_by VARCHAR(64) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_documents_related_type_id ON documents(related_type, related_id);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX idx_documents_status ON documents(status);
```

---

#### 6.2.20. notifications (알림)

```sql
CREATE TABLE notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL, -- 수신자
  notification_type VARCHAR(50) NOT NULL, -- 'entry_request', 'work_confirmation', 'emergency' 등
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  related_type VARCHAR(50), -- 'entry_request', 'work_confirmation' 등
  related_id VARCHAR(64), -- 관련 데이터 ID
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

### 6.3. 데이터베이스 관계도

```
users (사용자)
  ├─ 1:N → companies (회사 등록자)
  ├─ 1:N → equipment (Owner → 장비)
  ├─ 1:N → workers (Owner → 인력)
  ├─ 1:N → entry_requests (BP → 반입 요청)
  ├─ 1:N → deployments (투입)
  ├─ 1:N → work_sessions (작업 세션)
  ├─ 1:N → daily_work_confirmations (작업확인서)
  └─ 1:N → emergency_alerts (긴급 알림)

companies (회사)
  ├─ 1:N → users (소속 사용자)
  ├─ 1:N → entry_requests (BP 회사)
  └─ 1:N → deployments (BP/EP 회사)

equipment (장비)
  ├─ N:1 → users (Owner)
  ├─ N:1 → checklist_templates (점검표 템플릿)
  ├─ 1:N → entry_request_items (반입 요청 아이템)
  ├─ 1:N → deployments (투입)
  ├─ 1:N → work_sessions (작업 세션)
  ├─ 1:N → equipment_daily_inspections (장비 점검표)
  └─ 1:N → safety_inspections (안전 점검표)

entry_requests (반입 요청)
  ├─ N:1 → companies (BP 회사)
  ├─ N:1 → users (Owner)
  ├─ 1:N → entry_request_items (반입 아이템)
  └─ 1:N → deployments (투입)

deployments (투입)
  ├─ N:1 → entry_requests (반입 요청)
  ├─ N:1 → equipment (장비)
  ├─ N:1 → users (Worker)
  ├─ 1:N → work_sessions (작업 세션)
  ├─ 1:N → daily_work_confirmations (작업확인서)
  └─ 1:N → deployment_worker_changes (운전자 교체)

work_sessions (작업 세션)
  ├─ N:1 → deployments (투입)
  ├─ N:1 → users (Worker)
  ├─ N:1 → equipment (장비)
  ├─ 1:N → location_logs (GPS 로그)
  └─ 1:1 → daily_work_confirmations (작업확인서)

daily_work_confirmations (일별 작업확인서)
  ├─ N:1 → work_sessions (작업 세션)
  ├─ N:1 → deployments (투입)
  ├─ N:1 → users (Owner, Worker)
  └─ N:1 → companies (Owner 회사, BP 회사)

monthly_work_confirmations (월별 작업확인서)
  ├─ N:1 → users (Owner, Worker)
  ├─ N:1 → companies (Owner 회사, BP 회사)
  └─ N:1 → equipment (장비)

checklist_templates (점검표 템플릿)
  ├─ 1:N → equipment (장비)
  ├─ 1:N → equipment_daily_inspections (장비 점검표)
  └─ 1:N → safety_inspections (안전 점검표)
```

---

## 7. API 설계

### 7.1. API 구조

tRPC 기반 API, 라우터별로 분리:

```
api/trpc/
  ├─ auth.login (이메일/비밀번호 로그인)
  ├─ auth.logout (로그아웃)
  ├─ auth.getCurrentUser (현재 사용자 정보)
  ├─ authPin.loginWithPin (PIN 로그인, 사용 안 함)
  ├─ authPin.logout (PIN 로그아웃, 사용 안 함)
  ├─ companies.* (회사 관리)
  ├─ users.* (사용자 관리)
  ├─ equipment.* (장비 관리)
  ├─ workers.* (인력 관리)
  ├─ entryRequests.* (반입 요청)
  ├─ deployments.* (투입 관리)
  ├─ workSessions.* (작업 세션)
  ├─ workConfirmations.* (작업확인서)
  ├─ checklists.* (점검표)
  ├─ locations.* (위치 추적)
  ├─ emergencyAlerts.* (긴급 알림)
  └─ notifications.* (알림)
```

---

### 7.2. 주요 API 목록

#### 7.2.1. 인증 (auth)

| API | 메서드 | 설명 |
|-----|--------|------|
| `auth.login` | mutation | 이메일/비밀번호 로그인 |
| `auth.logout` | mutation | 로그아웃 |
| `auth.getCurrentUser` | query | 현재 사용자 정보 조회 |
| `auth.changePassword` | mutation | 비밀번호 변경 |

**auth.login** (이미 구현됨):
```typescript
input: {
  phone: string; // 전화번호
  password: string; // 비밀번호
}

output: {
  success: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    company_id?: string;
  };
}
```

---

#### 7.2.2. 회사 관리 (companies)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `companies.list` | query | 회사 목록 조회 | Admin, EP, BP |
| `companies.getById` | query | 회사 상세 조회 | Admin, EP, BP |
| `companies.create` | mutation | 회사 등록 | Admin, EP, BP |
| `companies.update` | mutation | 회사 수정 | Admin |
| `companies.delete` | mutation | 회사 삭제 | Admin |

---

#### 7.2.3. 사용자 관리 (users)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `users.list` | query | 사용자 목록 조회 | Admin, EP, BP, Owner |
| `users.getById` | query | 사용자 상세 조회 | Admin, EP, BP, Owner |
| `users.create` | mutation | 사용자 등록 | Admin, EP, BP, Owner |
| `users.update` | mutation | 사용자 수정 | Admin, EP, BP, Owner |
| `users.delete` | mutation | 사용자 삭제 | Admin |

---

#### 7.2.4. 장비 관리 (equipment)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `equipment.list` | query | 장비 목록 조회 | Admin, Owner |
| `equipment.getById` | query | 장비 상세 조회 | Admin, Owner, BP, EP |
| `equipment.create` | mutation | 장비 등록 | Admin, Owner |
| `equipment.update` | mutation | 장비 수정 | Admin, Owner |
| `equipment.delete` | mutation | 장비 삭제 | Admin, Owner |
| `equipment.searchByLicensePlate` | query | 차량 번호로 검색 | Inspector |

---

#### 7.2.5. 인력 관리 (workers)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `workers.list` | query | 인력 목록 조회 | Admin, Owner |
| `workers.getById` | query | 인력 상세 조회 | Admin, Owner, BP, EP |
| `workers.create` | mutation | 인력 등록 | Admin, Owner |
| `workers.update` | mutation | 인력 수정 | Admin, Owner |
| `workers.delete` | mutation | 인력 삭제 | Admin, Owner |

---

#### 7.2.6. 반입 요청 (entryRequests)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `entryRequests.list` | query | 반입 요청 목록 조회 | Admin, Owner, BP, EP |
| `entryRequests.getById` | query | 반입 요청 상세 조회 | Admin, Owner, BP, EP |
| `entryRequests.create` | mutation | 반입 요청 생성 | Owner |
| `entryRequests.ownerApprove` | mutation | Owner 승인 | Owner |
| `entryRequests.bpApprove` | mutation | BP 승인 | BP |
| `entryRequests.epApprove` | mutation | EP 최종 승인 | EP |
| `entryRequests.reject` | mutation | 반려 | Owner, BP, EP |
| `entryRequests.downloadPDF` | query | 서류 PDF 다운로드 | Owner, BP, EP |

**entryRequests.create**:
```typescript
input: {
  bp_company_id: string;
  purpose: string;
  requested_start_date: Date;
  requested_end_date: Date;
  items: [
    {
      item_type: 'equipment' | 'worker';
      item_id: string;
    }
  ];
}

output: {
  success: boolean;
  entry_request_id: string;
}

// 자동 처리:
// 1. 서류 검증 (만료일 체크)
// 2. BP에게 알림
// 3. 메일 전송 (서류 PDF 첨부)
```

---

#### 7.2.7. 투입 관리 (deployments)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `deployments.list` | query | 투입 목록 조회 | Admin, Owner, BP, EP |
| `deployments.getById` | query | 투입 상세 조회 | Admin, Owner, BP, EP |
| `deployments.extend` | mutation | 투입 기간 연장 | Owner |
| `deployments.changeWorker` | mutation | 운전자 교체 | Owner |
| `deployments.complete` | mutation | 투입 완료 | Owner |

**deployments.extend**:
```typescript
input: {
  deployment_id: string;
  new_end_date: Date;
  extension_reason: string;
}

output: {
  success: boolean;
}

// 자동 처리:
// 1. deployments 테이블 업데이트
// 2. deployment_extensions 테이블에 이력 저장
// 3. BP에게 알림 (선택)
```

**deployments.changeWorker**:
```typescript
input: {
  deployment_id: string;
  new_worker_id: string; // 반입 승인된 인력만
  change_reason: string;
}

output: {
  success: boolean;
}

// 자동 처리:
// 1. deployments 테이블 업데이트
// 2. deployment_worker_changes 테이블에 이력 저장
// 3. equipment 테이블의 current_driver_id 업데이트
// 4. BP에게 알림 (선택)
```

---

#### 7.2.8. 작업 세션 (workSessions)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `workSessions.start` | mutation | 작업 시작 | Worker |
| `workSessions.startBreak` | mutation | 휴식 시작 | Worker |
| `workSessions.endBreak` | mutation | 휴식 종료 | Worker |
| `workSessions.end` | mutation | 작업 종료 | Worker |
| `workSessions.getCurrent` | query | 현재 작업 세션 조회 | Worker |

**workSessions.start**:
```typescript
input: {
  deployment_id: string;
}

output: {
  success: boolean;
  work_session_id: string;
}

// 자동 처리:
// 1. work_sessions 테이블에 레코드 생성
//    - status: 'started'
//    - start_time: 현재 시간
// 2. GPS 위치 전송 시작 (클라이언트에서 처리)
```

**workSessions.end**:
```typescript
input: {
  work_session_id: string;
}

output: {
  success: boolean;
  daily_work_confirmation_id: string;
}

// 자동 처리:
// 1. work_sessions 테이블 업데이트
//    - status: 'ended'
//    - end_time: 현재 시간
// 2. GPS 위치 전송 중지 (클라이언트에서 처리)
// 3. 작업확인서 자동 생성
//    - daily_work_confirmations 테이블에 레코드 생성
//    - 작업 시간 자동 계산
//    - 초과 근무 시간 자동 계산
// 4. 월별 작업확인서 업데이트
//    - monthly_work_confirmations 테이블에 해당 날짜 데이터 추가
```

---

#### 7.2.9. 작업확인서 (workConfirmations)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `workConfirmations.listDaily` | query | 일별 작업확인서 목록 | Admin, Owner, BP |
| `workConfirmations.getDailyById` | query | 일별 작업확인서 상세 | Admin, Owner, BP |
| `workConfirmations.updateDaily` | mutation | 일별 작업확인서 수정 | Worker |
| `workConfirmations.confirmByWorker` | mutation | Worker 확인 | Worker |
| `workConfirmations.submitToBP` | mutation | BP에게 제출 | Owner |
| `workConfirmations.signByBP` | mutation | BP 서명 | BP |
| `workConfirmations.downloadDailyPDF` | query | 일별 PDF 다운로드 | Owner, BP |
| `workConfirmations.listMonthly` | query | 월별 작업확인서 목록 | Admin, Owner, BP |
| `workConfirmations.getMonthlyById` | query | 월별 작업확인서 상세 | Admin, Owner, BP |
| `workConfirmations.downloadMonthlyPDF` | query | 월별 PDF 다운로드 | Owner, BP |

**workConfirmations.updateDaily**:
```typescript
input: {
  daily_work_confirmation_id: string;
  work_location: string; // 필수
  work_content: string; // 필수
  start_time?: Date; // 선택 (수정)
  end_time?: Date; // 선택 (수정)
  break_duration?: number; // 선택 (수정)
}

output: {
  success: boolean;
}

// 자동 처리:
// 1. daily_work_confirmations 테이블 업데이트
// 2. 시간 수정 시 time_manually_edited = true
// 3. total_work_minutes, overtime_minutes 재계산
```

**workConfirmations.confirmByWorker**:
```typescript
input: {
  daily_work_confirmation_id: string;
}

output: {
  success: boolean;
}

// 자동 처리:
// 1. daily_work_confirmations 테이블 업데이트
//    - worker_confirmed = true
//    - worker_confirmed_at = 현재 시간
//    - status: 'worker_confirmed'
// 2. Owner에게 알림
```

**workConfirmations.submitToBP**:
```typescript
input: {
  daily_work_confirmation_id: string;
  send_email: boolean; // 메일 전송 여부
}

output: {
  success: boolean;
}

// 자동 처리:
// 1. daily_work_confirmations 테이블 업데이트
//    - submitted_by_owner = {owner_id}
//    - submitted_at = 현재 시간
//    - owner_company_* 정보 자동 입력
//    - status: 'submitted' 또는 'bp_pending' (메일 전송 시)
// 2. BP에게 알림
// 3. 메일 전송 (선택)
//    - 수신자: BP 담당자
//    - 첨부: 일별 작업확인서 PDF
```

**workConfirmations.signByBP**:
```typescript
input: {
  daily_work_confirmation_id: string;
  bp_signature: string; // Base64 이미지
  bp_contact_person: string; // BP 담당자명
  bp_comments?: string; // 의견 (선택)
}

output: {
  success: boolean;
  pdf_file_path: string;
}

// 자동 처리:
// 1. daily_work_confirmations 테이블 업데이트
//    - bp_signature = Base64 이미지
//    - bp_confirmed = true
//    - bp_confirmed_at = 현재 시간
//    - bp_confirmed_by = {bp_user_id}
//    - status: 'completed'
// 2. PDF 자동 생성 및 저장
//    - Supabase Storage에 저장
//    - pdf_file_path, pdf_generated_at 업데이트
// 3. 월별 작업확인서 업데이트
//    - monthly_work_confirmations의 daily_signatures에 서명 추가
//    - 월별 PDF 재생성
// 4. Owner에게 알림
```

---

#### 7.2.10. 점검표 (checklists)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `checklists.listTemplates` | query | 템플릿 목록 조회 | Admin |
| `checklists.getTemplateById` | query | 템플릿 상세 조회 | Admin, Worker, Inspector |
| `checklists.createTemplate` | mutation | 템플릿 생성 | Admin |
| `checklists.updateTemplate` | mutation | 템플릿 수정 | Admin |
| `checklists.deleteTemplate` | mutation | 템플릿 삭제 | Admin |
| `checklists.submitEquipmentInspection` | mutation | 장비 점검표 제출 | Worker |
| `checklists.listEquipmentInspections` | query | 장비 점검표 목록 | Admin, Owner |
| `checklists.submitSafetyInspection` | mutation | 안전 점검표 제출 | Inspector |
| `checklists.listSafetyInspections` | query | 안전 점검표 목록 | Admin, BP, EP |

**checklists.submitEquipmentInspection**:
```typescript
input: {
  equipment_id: string;
  template_id: string;
  inspection_date: Date;
  odometer_reading: number; // 운행 시간
  hour_meter_reading: number; // 가동 시간
  checklist_items: {
    [item_id: string]: boolean; // 체크 결과
  };
  issues_found: boolean;
  issue_details?: string;
  photos?: string[]; // 사진 URL 배열
}

output: {
  success: boolean;
  inspection_id: string;
}

// 자동 처리:
// 1. equipment_daily_inspections 테이블에 저장
// 2. Owner에게 알림
```

**checklists.submitSafetyInspection**:
```typescript
input: {
  equipment_id: string;
  template_id: string;
  inspection_date: Date;
  site_name: string;
  checklist_items: {
    [item_id: string]: boolean;
  };
  issues_found: boolean;
  issue_details?: string;
  photos?: string[];
  inspector_signature: string; // Base64 이미지 (필수)
}

output: {
  success: boolean;
  inspection_id: string;
}

// 자동 처리:
// 1. safety_inspections 테이블에 저장
// 2. BP 및 EP에게 알림
```

---

#### 7.2.11. 위치 추적 (locations)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `locations.log` | mutation | GPS 위치 기록 | Worker |
| `locations.getRecentLocations` | query | 최근 위치 조회 | Admin, Owner, BP, EP |
| `locations.getLocationHistory` | query | 위치 이력 조회 | Admin, Owner, BP, EP |

**locations.log**:
```typescript
input: {
  work_session_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

output: {
  success: boolean;
}

// 자동 처리:
// 1. location_logs 테이블에 저장
// 2. 5분 간격으로 자동 전송 (클라이언트에서 처리)
```

**locations.getRecentLocations**:
```typescript
input: {
  filter?: {
    owner_id?: string; // Owner별 필터 (BP, EP용)
    bp_company_id?: string; // BP별 필터 (EP용)
    equipment_id?: string; // 장비별 필터
  };
}

output: {
  locations: [
    {
      equipment_id: string;
      equipment_name: string;
      vehicle_number: string;
      worker_id: string;
      worker_name: string;
      worker_phone: string;
      latitude: number;
      longitude: number;
      logged_at: Date;
      owner_id: string; // BP, EP용
      owner_company_name: string; // BP, EP용
      bp_company_id: string; // EP용
      bp_company_name: string; // EP용
    }
  ];
}

// 권한별 필터링:
// - Owner: 자신의 장비/인력만
// - BP: Owner별 필터링 가능
// - EP: BP별, Owner별 필터링 가능
```

---

#### 7.2.12. 긴급 알림 (emergencyAlerts)

| API | 메서드 | 설명 | 권한 |
|-----|--------|------|------|
| `emergencyAlerts.create` | mutation | 긴급 신고 | Worker |
| `emergencyAlerts.list` | query | 긴급 알림 목록 | Admin, Owner, BP, EP |
| `emergencyAlerts.getById` | query | 긴급 알림 상세 | Admin, Owner, BP, EP |
| `emergencyAlerts.updateStatus` | mutation | 상태 업데이트 | Admin, Owner, BP, EP |

**emergencyAlerts.create**:
```typescript
input: {
  alert_type: 'accident' | 'breakdown' | 'other';
  description?: string;
  latitude: number;
  longitude: number;
}

output: {
  success: boolean;
  alert_id: string;
}

// 자동 처리:
// 1. emergency_alerts 테이블에 저장
// 2. Owner, BP, EP에게 즉시 알림 (푸시, 메일)
```

---

## 8. UI/UX 설계

### 8.1. 공통 UI 요소

#### 8.1.1. 대시보드 레이아웃

```
┌─────────────────────────────────────────┐
│ [로고] ERMS            [사용자명] ▼     │ ← 헤더
│                        [로그아웃]       │
├─────────────────────────────────────────┤
│ [사이드바]  │ [메인 콘텐츠]            │
│             │                           │
│ - 대시보드  │                           │
│ - 장비 관리 │                           │
│ - 인력 관리 │                           │
│ - 반입 요청 │                           │
│ - 투입 관리 │                           │
│ - 작업확인서│                           │
│ - 위치 추적 │                           │
│ - 긴급 상황 │                           │
│             │                           │
└─────────────────────────────────────────┘
```

#### 8.1.2. 모바일 UI (Worker/Inspector)

```
┌───────────────────┐
│ [로고] ERMS       │ ← 헤더
│ [사용자명] [로그아웃]│
├───────────────────┤
│                   │
│  [큰 버튼]        │ ← 주요 기능
│  [큰 버튼]        │
│  [큰 버튼]        │
│                   │
│  [긴급 버튼]      │ ← 빨간색, 크게
│                   │
└───────────────────┘
```

---

### 8.2. 역할별 대시보드

#### 8.2.1. Admin 대시보드

**메뉴**:
- 대시보드 (통계)
- 회사 관리
- 사용자 관리
- 장비 유형 관리
- 점검표 템플릿 관리
- 시스템 설정

**대시보드 위젯**:
- 전체 회사 수 (Owner, BP, EP)
- 전체 사용자 수
- 투입 중인 장비 수
- 긴급 상황 수

---

#### 8.2.2. Owner 대시보드

**메뉴**:
- 대시보드
- 장비 관리
- 인력 관리
- 서류 관리
- 반입 요청
- 투입 관리 ⭐
- 작업확인서 ⭐
- 장비 점검표
- 실시간 위치 추적
- 긴급 상황

**대시보드 위젯**:
- 투입 중인 장비/인력 수
- 작업확인서 서명 대기 수
- 서류 만료 임박 알림
- 긴급 상황 알림

---

#### 8.2.3. BP 대시보드

**메뉴**:
- 대시보드
- 회사 관리 (Owner 등록)
- 사용자 관리
- 반입 요청
- 투입 장비 관리
- 작업확인서 서명 ⭐
- 안전 점검표
- 실시간 위치 추적
- 긴급 상황

**대시보드 위젯**:
- 반입 요청 대기 수
- 작업확인서 서명 대기 수
- 투입 중인 장비 수 (Owner별)
- 긴급 상황 알림

---

#### 8.2.4. EP 대시보드

**메뉴**:
- 대시보드
- 회사 관리 (BP, Owner 등록)
- 사용자 관리 (Inspector 등록)
- 반입 요청 최종 승인
- BP별 장비 임대 현황 ⭐
- 안전 점검표
- 실시간 위치 추적 ⭐
- 서류 만료 관리
- 긴급 상황

**대시보드 위젯**:
- 반입 요청 대기 수
- 투입 중인 장비 수 (BP별, Owner별)
- 서류 만료 임박 알림
- 긴급 상황 알림

---

#### 8.2.5. Worker 모바일 앱

**메인 화면**:
```
┌───────────────────┐
│ [로고] ERMS       │
│ [운전자명] [로그아웃]│
├───────────────────┤
│                   │
│ 현재 상태: 대기 중 │
│                   │
│ ┌───────────────┐ │
│ │ 작업 시작     │ │ ← 큰 버튼
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 장비 점검표   │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 작업 이력     │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 🚨 긴급 신고  │ │ ← 빨간색
│ └───────────────┘ │
│                   │
└───────────────────┘
```

**작업 중 화면**:
```
┌───────────────────┐
│ 작업 중           │
├───────────────────┤
│ 시작 시간: 09:00  │
│ 경과 시간: 02:30  │
│                   │
│ ┌───────────────┐ │
│ │ 휴식          │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 작업 종료     │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 🚨 긴급 신고  │ │
│ └───────────────┘ │
└───────────────────┘
```

---

#### 8.2.6. Inspector 모바일 앱

**메인 화면**:
```
┌───────────────────┐
│ [로고] ERMS       │
│ [점검원명] [로그아웃]│
├───────────────────┤
│                   │
│ ┌───────────────┐ │
│ │ 차량 검색     │ │ ← 큰 버튼
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 점검 이력     │ │
│ └───────────────┘ │
│                   │
└───────────────────┘
```

**차량 검색 화면**:
```
┌───────────────────┐
│ 차량 검색         │
├───────────────────┤
│ 차량 번호:        │
│ ┌───────────────┐ │
│ │ 12가3456      │ │
│ └───────────────┘ │
│                   │
│ [검색]            │
│                   │
│ 검색 결과:        │
│ ┌───────────────┐ │
│ │ 굴삭기        │ │
│ │ 12가3456      │ │
│ │ 운전자: 홍길동│ │
│ └───────────────┘ │
│                   │
│ [점검표 작성]     │
└───────────────────┘
```

---

### 8.3. 주요 화면 설계

#### 8.3.1. 로그인 화면

```
┌─────────────────────┐
│   ERMS 로그인       │
├─────────────────────┤
│ 전화번호            │
│ ┌─────────────────┐ │
│ │ 010-1234-5678   │ │
│ └─────────────────┘ │
│                     │
│ 비밀번호            │
│ ┌─────────────────┐ │
│ │ ••••            │ │
│ └─────────────────┘ │
│                     │
│ [  로그인  ]        │
│                     │
│ 비밀번호를 잊으셨나요?│
│ (관리자에게 문의)    │
│                     │
│ Worker 로그인 →     │
└─────────────────────┘
```

---

#### 8.3.2. 투입 관리 화면 (Owner)

```
┌─────────────────────────────────────────┐
│ 투입 관리                               │
├─────────────────────────────────────────┤
│ [필터] 전체 | 투입 중 | 완료            │
├─────────────────────────────────────────┤
│ 장비명 | 차량번호 | 운전자 | 투입기간 | 상태 | 작업 |
├─────────────────────────────────────────┤
│ 굴삭기 | 12가3456 | 홍길동 | 2025-01-01 ~ 2025-01-31 | 투입 중 | [연장] [교체] [상세] │
│ 덤프트럭 | 34나5678 | 김철수 | 2025-01-05 ~ 2025-02-05 | 투입 중 | [연장] [교체] [상세] │
└─────────────────────────────────────────┘
```

**투입 기간 연장 모달**:
```
┌─────────────────────┐
│ 투입 기간 연장      │
├─────────────────────┤
│ 장비: 굴삭기        │
│ 차량번호: 12가3456  │
│ 운전자: 홍길동      │
│                     │
│ 현재 반출 예정일:   │
│ 2025-01-31          │
│                     │
│ 새 반출 예정일:     │
│ ┌─────────────────┐ │
│ │ 2025-02-28      │ │
│ └─────────────────┘ │
│                     │
│ 연장 사유:          │
│ ┌─────────────────┐ │
│ │ 공정 지연       │ │
│ └─────────────────┘ │
│                     │
│ [취소] [연장]       │
└─────────────────────┘
```

**운전자 교체 모달**:
```
┌─────────────────────┐
│ 운전자 교체         │
├─────────────────────┤
│ 장비: 굴삭기        │
│ 차량번호: 12가3456  │
│                     │
│ 현재 운전자:        │
│ 홍길동 (010-1234-5678)│
│                     │
│ 새 운전자:          │
│ ┌─────────────────┐ │
│ │ [선택

]      │ │
│ │ 김철수         │ │ ← 반입 승인된 인력만 표시
│ │ 이영희         │ │
│ └─────────────────┘ │
│                     │
│ 교체 사유:          │
│ ┌─────────────────┐ │
│ │ 개인 사정       │ │
│ └─────────────────┘ │
│                     │
│ [취소] [교체]       │
└─────────────────────┘
```

---

#### 8.3.3. 작업확인서 관리 화면 (Owner)

```
┌─────────────────────────────────────────┐
│ 작업확인서 관리                         │
├─────────────────────────────────────────┤
│ [탭] 일별 | 월별                        │
├─────────────────────────────────────────┤
│ [필터] 전체 | Worker 확인 대기 | BP 서명 대기 | 완료 │
├─────────────────────────────────────────┤
│ 날짜 | 운전자 | 장비 | 작업시간 | 상태 | 작업 |
├─────────────────────────────────────────┤
│ 2025-01-26 | 홍길동 | 굴삭기 | 8시간 | Worker 확인 대기 | [상세] │
│ 2025-01-25 | 홍길동 | 굴삭기 | 10시간 (초과 2h) | BP 서명 대기 | [상세] [제출] │
│ 2025-01-24 | 홍길동 | 굴삭기 | 8시간 | 완료 | [상세] [PDF] │
└─────────────────────────────────────────┘
```

**작업확인서 상세 화면**:
```
┌─────────────────────┐
│ 작업확인서 상세     │
├─────────────────────┤
│ 날짜: 2025-01-26    │
│ 현장명: 용인 Cluster│
│ 협력사: 센코어티크  │
│                     │
│ 기사명: 홍길동      │
│ 차량번호: 12가3456  │
│ 장비명: 굴삭기      │
│ 규격: 456           │
│                     │
│ 작업 위치: X3/Y5    │
│ 작업 내용: 설치     │
│                     │
│ 작업 시간:          │
│ - 시작: 09:00       │
│ - 종료: 19:00       │
│ - 휴식: 2시간       │
│ - 총 작업: 8시간    │
│ - 초과: 2시간       │
│                     │
│ 상태: BP 서명 대기  │
│                     │
│ [BP에게 제출]       │
│ [메일로 제출]       │
└─────────────────────┘
```

---

#### 8.3.4. 작업확인서 서명 화면 (BP)

```
┌─────────────────────────────────────────┐
│ 작업확인서 서명                         │
├─────────────────────────────────────────┤
│ [탭] 일별 | 월별                        │
├─────────────────────────────────────────┤
│ [필터] 전체 | 서명 대기 | 완료           │
├─────────────────────────────────────────┤
│ 날짜 | Owner | 운전자 | 장비 | 상태 | 작업 |
├─────────────────────────────────────────┤
│ 2025-01-26 | 대성스카이 | 홍길동 | 굴삭기 | 서명 대기 | [서명] │
│ 2025-01-25 | 대성스카이 | 홍길동 | 굴삭기 | 완료 | [PDF] │
└─────────────────────────────────────────┘
```

**서명 모달**:
```
┌─────────────────────┐
│ 작업확인서 서명     │
├─────────────────────┤
│ 날짜: 2025-01-26    │
│ 운전자: 홍길동      │
│ 장비: 굴삭기        │
│ 작업 시간: 8시간    │
│ 초과 근무: 2시간    │
│                     │
│ 담당자명:           │
│ ┌─────────────────┐ │
│ │ 김담당          │ │
│ └─────────────────┘ │
│                     │
│ 서명:               │
│ ┌─────────────────┐ │
│ │                 │ │ ← 터치/마우스로 그리기
│ │                 │ │
│ └─────────────────┘ │
│ [지우기]            │
│                     │
│ 의견 (선택):        │
│ ┌─────────────────┐ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ [취소] [서명 완료]  │
└─────────────────────┘
```

---

#### 8.3.5. Worker 작업 화면

**작업 시작 전**:
```
┌───────────────────┐
│ 작업 관리         │
├───────────────────┤
│ 현재 상태: 대기 중│
│                   │
│ 차량: 굴삭기      │
│ 차량번호: 12가3456│
│                   │
│ ┌───────────────┐ │
│ │ 장비 점검표   │ │ ← 작업 시작 전 필수
│ │ 작성하기      │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 작업 시작     │ │
│ └───────────────┘ │
│                   │
└───────────────────┘
```

**작업 중**:
```
┌───────────────────┐
│ 작업 중           │
├───────────────────┤
│ 시작 시간: 09:00  │
│ 경과 시간: 02:30  │
│                   │
│ GPS 전송 중 🟢    │
│                   │
│ ┌───────────────┐ │
│ │ 휴식          │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 작업 종료     │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 🚨 긴급 신고  │ │
│ └───────────────┘ │
└───────────────────┘
```

**휴식 중**:
```
┌───────────────────┐
│ 휴식 중           │
├───────────────────┤
│ 작업 시작: 09:00  │
│ 휴식 시작: 11:30  │
│ 휴식 시간: 00:30  │
│                   │
│ ┌───────────────┐ │
│ │ 휴식 종료     │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 작업 종료     │ │
│ └───────────────┘ │
│                   │
│ ┌───────────────┐ │
│ │ 🚨 긴급 신고  │ │
│ └───────────────┘ │
└───────────────────┘
```

**작업 종료 후 - 작업확인서 작성**:
```
┌───────────────────┐
│ 작업확인서 작성   │
├───────────────────┤
│ 날짜: 2025-01-26  │
│                   │
│ 작업 시간 (자동): │
│ - 시작: 09:00     │
│ - 종료: 19:00     │
│ - 휴식: 2시간     │
│ - 총 작업: 8시간  │
│ - 초과: 2시간     │
│                   │
│ 작업 위치 (필수): │
│ ┌───────────────┐ │
│ │ X3/Y5         │ │
│ └───────────────┘ │
│                   │
│ 작업 내용 (필수): │
│ ┌───────────────┐ │
│ │ 설치          │ │
│ └───────────────┘ │
│                   │
│ [시간 수정]       │
│ [제출]            │
└───────────────────┘
```

---

#### 8.3.6. 장비 점검표 작성 화면 (Worker)

```
┌───────────────────┐
│ 장비 일일 점검표  │
├───────────────────┤
│ 날짜: 2025-01-26  │
│ 차량: 굴삭기      │
│ 차량번호: 12가3456│
│                   │
│ 운행 시간 (km):   │
│ ┌───────────────┐ │
│ │ 12345         │ │
│ └───────────────┘ │
│                   │
│ 가동 시간 (h):    │
│ ┌───────────────┐ │
│ │ 1234          │ │
│ └───────────────┘ │
│                   │
│ ━━━━━━━━━━━━━━━━ │
│ 엔진 (일일)       │
│ ☑ 엔진 오일 확인  │
│ ☑ 냉각수 확인     │
│ ☐ 에어 필터 확인  │
│                   │
│ 유압 (주별)       │
│ ☑ 유압 오일 확인  │
│ ☐ 유압 호스 확인  │
│                   │
│ ━━━━━━━━━━━━━━━━ │
│                   │
│ 이상 발견:        │
│ ☑ 예 ☐ 아니오     │
│                   │
│ 이상 상세:        │
│ ┌───────────────┐ │
│ │ 에어 필터 교체│ │
│ │ 필요          │ │
│ └───────────────┘ │
│                   │
│ [사진 첨부]       │
│                   │
│ [제출]            │
└───────────────────┘
```

---

#### 8.3.7. 안전 점검표 작성 화면 (Inspector)

```
┌───────────────────┐
│ 안전 점검표       │
├───────────────────┤
│ 날짜: 2025-01-26  │
│ 현장: 용인 Cluster│
│ 차량: 굴삭기      │
│ 차량번호: 12가3456│
│ 운전자: 홍길동    │
│                   │
│ ━━━━━━━━━━━━━━━━ │
│ 안전 장비         │
│ ☑ 안전벨트 착용   │
│ ☑ 안전모 착용     │
│ ☑ 안전화 착용     │
│                   │
│ 장비 상태         │
│ ☑ 경광등 작동     │
│ ☑ 후방 카메라 작동│
│ ☐ 소화기 비치     │
│                   │
│ ━━━━━━━━━━━━━━━━ │
│                   │
│ 이상 발견:        │
│ ☑ 예 ☐ 아니오     │
│                   │
│ 이상 상세:        │
│ ┌───────────────┐ │
│ │ 소화기 미비치 │ │
│ └───────────────┘ │
│                   │
│ [사진 첨부]       │
│                   │
│ 점검원 서명 (필수):│
│ ┌───────────────┐ │
│ │               │ │ ← 터치/마우스
│ └───────────────┘ │
│ [지우기]          │
│                   │
│ [제출]            │
└───────────────────┘
```

---

#### 8.3.8. 실시간 위치 추적 화면

**Owner**:
```
┌─────────────────────────────────────────┐
│ 실시간 위치 추적                        │
├─────────────────────────────────────────┤
│ [지도]                                  │
│                                         │
│  📍 굴삭기 (12가3456) - 홍길동          │
│  📍 덤프트럭 (34나5678) - 김철수        │
│                                         │
├─────────────────────────────────────────┤
│ 투입 중인 장비 목록                     │
│ - 굴삭기 (12가3456) - 홍길동            │
│   마지막 업데이트: 2분 전               │
│ - 덤프트럭 (34나5678) - 김철수          │
│   마지막 업데이트: 1분 전               │
└─────────────────────────────────────────┘
```

**BP**:
```
┌─────────────────────────────────────────┐
│ 실시간 위치 추적                        │
├─────────────────────────────────────────┤
│ [필터] Owner: [전체 ▼] 장비: [전체 ▼]  │
├─────────────────────────────────────────┤
│ [지도]                                  │
│                                         │
│  📍 대성스카이 - 굴삭기 - 홍길동        │
│  📍 대성스카이 - 덤프트럭 - 김철수      │
│  📍 ABC렌탈 - 크레인 - 이영희           │
│                                         │
└─────────────────────────────────────────┘
```

**EP**:
```
┌─────────────────────────────────────────┐
│ 실시간 위치 추적                        │
├─────────────────────────────────────────┤
│ [필터] BP: [전체 ▼] Owner: [전체 ▼] 장비: [전체 ▼] │
├─────────────────────────────────────────┤
│ [지도]                                  │
│                                         │
│  📍 센코어티크 - 대성스카이 - 굴삭기 - 홍길동 │
│  📍 센코어티크 - 대성스카이 - 덤프트럭 - 김철수 │
│  📍 ABC건설 - XYZ렌탈 - 크레인 - 이영희 │
│                                         │
└─────────────────────────────────────────┘
```

---

#### 8.3.9. 긴급 상황 알림 화면

**Worker - 긴급 신고**:
```
┌───────────────────┐
│ 긴급 신고         │
├───────────────────┤
│ 긴급 상황 유형:   │
│ ○ 사고            │
│ ○ 고장            │
│ ○ 기타            │
│                   │
│ 상세 내용 (선택): │
│ ┌───────────────┐ │
│ │               │ │
│ └───────────────┘ │
│                   │
│ 현재 위치:        │
│ 자동 전송됩니다   │
│                   │
│ [취소] [신고]     │
└───────────────────┘
```

**Owner/BP/EP - 긴급 상황 목록**:
```
┌─────────────────────────────────────────┐
│ 긴급 상황                               │
├─────────────────────────────────────────┤
│ [필터] 전체 | 처리 중 | 완료            │
├─────────────────────────────────────────┤
│ 시간 | 유형 | 운전자 | 장비 | 상태 | 작업 |
├─────────────────────────────────────────┤
│ 10:30 | 사고 | 홍길동 | 굴삭기 | 처리 중 | [위치] [상세] │
│ 09:15 | 고장 | 김철수 | 덤프트럭 | 완료 | [상세] │
└─────────────────────────────────────────┘
```

**긴급 상황 상세**:
```
┌─────────────────────┐
│ 긴급 상황 상세      │
├─────────────────────┤
│ 유형: 사고          │
│ 신고 시간: 10:30    │
│                     │
│ 운전자: 홍길동      │
│ 전화번호: 010-1234-5678 │
│ 장비: 굴삭기        │
│ 차량번호: 12가3456  │
│                     │
│ 상세 내용:          │
│ 작업 중 넘어짐      │
│                     │
│ 위치:               │
│ [지도 표시]         │
│                     │
│ 상태: 처리 중       │
│                     │
│ [완료 처리]         │
│ [전화 걸기]         │
└─────────────────────┘
```

---

## 9. 남은 작업 목록

### 9.1. Phase 2: 데이터베이스 마이그레이션 (1-2일)

**작업 내용**:
1. 새로운 `schema.ts` 파일을 프로젝트에 적용
2. 마이그레이션 SQL 파일 생성
3. Supabase에서 SQL 실행
4. 테스트 데이터 생성

**파일**:
- `/home/ubuntu/upload/schema.ts` → `drizzle/schema.ts`로 교체
- `/home/ubuntu/upload/0000_third_blindfold.sql` → Supabase에서 실행

**주의사항**:
- 기존 데이터 백업 필수
- 마이그레이션 전 테스트 환경에서 먼저 실행
- 외래 키 제약 조건 확인

---

### 9.2. Phase 3: 역할별 대시보드 재설계 (2-3일)

**작업 내용**:
1. Admin 대시보드
2. Owner 대시보드
3. BP 대시보드
4. EP 대시보드
5. Worker 모바일 앱 메인 화면
6. Inspector 모바일 앱 메인 화면

**파일**:
- `client/src/pages/admin/Dashboard.tsx`
- `client/src/pages/owner/Dashboard.tsx`
- `client/src/pages/bp/Dashboard.tsx`
- `client/src/pages/ep/Dashboard.tsx`
- `client/src/pages/mobile/WorkerApp.tsx`
- `client/src/pages/mobile/InspectorApp.tsx`

---

### 9.3. Phase 4: Owner 핵심 기능 구현 (3-4일)

#### 4.1. 투입 관리 (1일)
**API**:
- `deployments.list`
- `deployments.getById`
- `deployments.extend`
- `deployments.changeWorker`
- `deployments.complete`

**UI**:
- `client/src/pages/owner/Deployments.tsx`
- 투입 목록, 상세, 연장 모달, 운전자 교체 모달

#### 4.2. 작업확인서 관리 (1-2일)
**API**:
- `workConfirmations.listDaily`
- `workConfirmations.getDailyById`
- `workConfirmations.submitToBP`
- `workConfirmations.downloadDailyPDF`
- `workConfirmations.listMonthly`
- `workConfirmations.getMonthlyById`
- `workConfirmations.downloadMonthlyPDF`

**UI**:
- `client/src/pages/owner/WorkConfirmations.tsx`
- 일별/월별 탭, 목록, 상세, 제출 기능

#### 4.3. 장비 점검표 조회 (0.5일)
**API**:
- `checklists.listEquipmentInspections`

**UI**:
- `client/src/pages/owner/EquipmentInspections.tsx`
- 점검 이력 목록, 상세

---

### 9.4. Phase 5: BP 핵심 기능 구현 (2-3일)

#### 5.1. Owner 등록 (0.5일)
**API**:
- `companies.create` (Owner 유형)

**UI**:
- `client/src/pages/bp/Companies.tsx`
- Owner 회사 등록 폼

#### 5.2. 작업확인서 서명 (1-2일)
**API**:
- `workConfirmations.listDaily` (BP용)
- `workConfirmations.getDailyById` (BP용)
- `workConfirmations.signByBP`
- `workConfirmations.listMonthly` (BP용)

**UI**:
- `client/src/pages/bp/WorkConfirmations.tsx`
- 일별/월별 탭, 서명 대기 목록, 서명 모달 (전자서명 캔버스)

**전자서명 구현**:
```typescript
// 전자서명 캔버스 컴포넌트
import { useRef, useState } from 'react';

function SignatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureBase64 = () => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ border: '1px solid #ccc', cursor: 'crosshair' }}
      />
      <button onClick={clear}>지우기</button>
    </div>
  );
}
```

#### 5.3. 투입 장비 관리 (0.5일)
**API**:
- `deployments.list` (BP용, Owner별 필터링)

**UI**:
- `client/src/pages/bp/Deployments.tsx`
- 투입 목록, Owner별 필터

---

### 9.5. Phase 6: EP 핵심 기능 구현 (2-3일)

#### 6.1. BP, Owner 등록 (0.5일)
**API**:
- `companies.create` (BP, Owner 유형)

**UI**:
- `client/src/pages/ep/Companies.tsx`
- BP, Owner 회사 등록 폼

#### 6.2. BP별 장비 임대 현황 (1일)
**API**:
- `deployments.list` (EP용, BP별/Owner별 필터링)

**UI**:
- `client/src/pages/ep/Deployments.tsx`
- 투입 목록, BP별/Owner별 필터

#### 6.3. 실시간 위치 추적 (1-2일)
**API**:
- `locations.getRecentLocations` (EP용, BP별/Owner별/장비별 필터링)

**UI**:
- `client/src/pages/ep/LocationTracking.tsx`
- 지도 (Google Maps 또는 Kakao Maps)
- 마커 표시 (BP, Owner, 장비, 운전자 정보)
- 필터링 UI

**지도 구현**:
```typescript
// Google Maps 사용 예시
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

function LocationTrackingMap({ locations }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <GoogleMap
      center={{ lat: 37.5665, lng: 126.9780 }} // 서울 중심
      zoom={10}
    >
      {locations.map((location) => (
        <Marker
          key={location.equipment_id}
          position={{ lat: location.latitude, lng: location.longitude }}
          onClick={() => setSelectedLocation(location)}
          icon={{
            url: '/icons/equipment.png', // 장비 아이콘
            scaledSize: new google.maps.Size(40, 40),
          }}
        />
      ))}
      
      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div>
            <h3>{selectedLocation.equipment_name}</h3>
            <p>차량번호: {selectedLocation.vehicle_number}</p>
            <p>운전자: {selectedLocation.worker_name}</p>
            <p>Owner: {selectedLocation.owner_company_name}</p>
            <p>BP: {selectedLocation.bp_company_name}</p>
            <p>마지막 업데이트: {selectedLocation.logged_at}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
```

---

### 9.6. Phase 7: Worker 모바일 앱 재설계 (2-3일)

#### 7.1. 작업 관리 (1일)
**API**:
- `workSessions.start`
- `workSessions.startBreak`
- `workSessions.endBreak`
- `workSessions.end`
- `workSessions.getCurrent`

**UI**:
- `client/src/pages/mobile/WorkerApp.tsx`
- 작업 시작/종료/휴식 버튼
- 작업 상태 표시

**GPS 위치 전송**:
```typescript
// GPS 위치 전송 (5분 간격)
import { useEffect, useState } from 'react';

function useGPSTracking(workSessionId: string | null, isActive: boolean) {
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive || !workSessionId) {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      return;
    }

    // 즉시 한 번 전송
    sendLocation(workSessionId);

    // 5분 간격으로 전송
    const id = setInterval(() => {
      sendLocation(workSessionId);
    }, 5 * 60 * 1000); // 5분

    setIntervalId(id);

    return () => {
      if (id) clearInterval(id);
    };
  }, [isActive, workSessionId]);

  const sendLocation = (sessionId: string) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // API 호출
          trpc.locations.log.mutate({
            work_session_id: sessionId,
            latitude,
            longitude,
            accuracy,
          });
        },
        (error) => {
          console.error('GPS 위치 수집 실패:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };
}
```

#### 7.2. 작업확인서 작성 (0.5일)
**API**:
- `workConfirmations.updateDaily`
- `workConfirmations.confirmByWorker`

**UI**:
- `client/src/pages/mobile/WorkConfirmationForm.tsx`
- 작업 위치, 작업 내용 입력 폼
- 시간 수정 기능

#### 7.3. 장비 일일 점검표 작성 (0.5-1일)
**API**:
- `checklists.getTemplateById` (차종별 템플릿 조회)
- `checklists.submitEquipmentInspection`

**UI**:
- `client/src/pages/mobile/EquipmentInspectionForm.tsx`
- 운행 시간, 가동 시간 입력
- 점검 항목 체크리스트 (템플릿 기반)
- 이상 발견 시 상세 입력 및 사진 첨부

---

### 9.7. Phase 8: Inspector 모바일 앱 (1-2일)

#### 8.1. 차량 검색 (0.5일)
**API**:
- `equipment.searchByLicensePlate`

**UI**:
- `client/src/pages/mobile/InspectorApp.tsx`
- 차량 번호 검색 폼
- 검색 결과 목록

#### 8.2. 안전 점검표 작성 (0.5-1일)
**API**:
- `checklists.getTemplateById` (차종별 안전 점검표 템플릿)
- `checklists.submitSafetyInspection`

**UI**:
- `client/src/pages/mobile/SafetyInspectionForm.tsx`
- 점검 항목 체크리스트 (템플릿 기반)
- 이상 발견 시 상세 입력 및 사진 첨부
- Inspector 서명 (전자서명 캔버스)

---

### 9.8. Phase 9: 반입 요청 검증 및 메일 기능 (2-3일)

#### 9.1. 반입 요청 검증 (1일)
**API**:
- `entryRequests.create` (서류 자동 검증 추가)

**검증 로직**:
```typescript
// 서류 만료일 체크
function validateDocuments(items: EntryRequestItem[]) {
  const issues = [];
  
  for (const item of items) {
    if (item.item_type === 'equipment') {
      const equipment = await db.getEquipmentById(item.item_id);
      const documents = await db.getDocumentsByEquipment(item.item_id);
      
      for (const doc of documents) {
        if (doc.expiry_date && new Date(doc.expiry_date) < new Date()) {
          issues.push({
            item_id: item.item_id,
            item_type: 'equipment',
            document_type: doc.document_type,
            issue: 'expired',
            expiry_date: doc.expiry_date,
          });
        }
      }
    } else if (item.item_type === 'worker') {
      const worker = await db.getWorkerById(item.item_id);
      
      if (worker.license_expiry_date && new Date(worker.license_expiry_date) < new Date()) {
        issues.push({
          item_id: item.item_id,
          item_type: 'worker',
          document_type: 'license',
          issue: 'expired',
          expiry_date: worker.license_expiry_date,
        });
      }
    }
  }
  
  return issues;
}
```

#### 9.2. 메일 전송 기능 (1-2일)
**라이브러리**: Nodemailer

**설치**:
```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

**메일 전송 함수**:
```typescript
// server/_core/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEntryRequestEmail(
  to: string,
  entryRequest: EntryRequest,
  attachments: { filename: string; path: string }[]
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `[ERMS] 반입 요청 - ${entryRequest.request_number}`,
    html: `
      <h2>반입 요청</h2>
      <p>요청 번호: ${entryRequest.request_number}</p>
      <p>장비 임대 사업자: ${entryRequest.owner_name}</p>
      <p>투입 예정일: ${entryRequest.requested_start_date}</p>
      <p>철수 예정일: ${entryRequest.requested_end_date}</p>
      <p>투입 목적: ${entryRequest.purpose}</p>
      <br>
      <p>첨부된 서류를 확인해주세요.</p>
    `,
    attachments,
  });
}

export async function sendWorkConfirmationEmail(
  to: string,
  workConfirmation: DailyWorkConfirmation,
  pdfPath: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `[ERMS] 작업확인서 서명 요청 - ${workConfirmation.work_date}`,
    html: `
      <h2>작업확인서 서명 요청</h2>
      <p>날짜: ${workConfirmation.work_date}</p>
      <p>운전자: ${workConfirmation.worker_name}</p>
      <p>장비: ${workConfirmation.equipment_name}</p>
      <p>작업 시간: ${workConfirmation.total_work_minutes / 60}시간</p>
      <br>
      <p>첨부된 작업확인서를 확인하고 서명해주세요.</p>
    `,
    attachments: [
      {
        filename: `작업확인서_${workConfirmation.work_date}.pdf`,
        path: pdfPath,
      },
    ],
  });
}
```

**환경 변수 추가** (`.env`):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=ERMS <noreply@erms.com>
```

---

### 9.9. Phase 10: PDF 다운로드 기능 (2-3일)

#### 10.1. PDF 생성 라이브러리 선택
**추천**: `pdfkit` 또는 `puppeteer`

**pdfkit** (가벼움, 코드로 PDF 생성):
```bash
pnpm add pdfkit
pnpm add -D @types/pdfkit
```

**puppeteer** (HTML → PDF, 더 유연함):
```bash
pnpm add puppeteer
```

#### 10.2. 일별 작업확인서 PDF 생성
```typescript
// server/_core/pdf.ts
import PDFDocument from 'pdfkit';
import fs from 'fs';

export async function generateDailyWorkConfirmationPDF(
  workConfirmation: DailyWorkConfirmation,
  outputPath: string
) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // 한글 폰트 설정 (필수)
  doc.font('path/to/NanumGothic.ttf');

  // 제목
  doc.fontSize(20).text('작업확인서', { align: 'center' });
  doc.moveDown();

  // 헤더 정보
  doc.fontSize(12);
  doc.text(`현장명: ${workConfirmation.site_name}`, { continued: true });
  doc.text(`기사명: ${workConfirmation.worker_name}`, { align: 'right' });
  
  doc.text(`협력사명: ${workConfirmation.bp_company_name}`, { continued: true });
  doc.text(`차량번호: ${workConfirmation.vehicle_number}`, { align: 'right' });
  
  doc.text(`작업위치: ${workConfirmation.work_location}`, { continued: true });
  doc.text(`장비명: ${workConfirmation.equipment_name}`, { align: 'right' });
  
  doc.text(`작업내용: ${workConfirmation.work_content}`, { continued: true });
  doc.text(`규격: ${workConfirmation.equipment_spec}`, { align: 'right' });
  
  doc.moveDown();

  // 작업 시간
  doc.text('작업시간:');
  doc.text(`  O/T | ${Math.floor(workConfirmation.overtime_minutes / 60)}시간 | 야간: ${workConfirmation.start_time}`);
  doc.text(`  철야 | 시간 | : ~ :`);
  
  doc.moveDown();

  // 확인 문구
  doc.text('상기와 같이 작업을 확인함.');
  doc.moveDown();

  // 날짜
  doc.text(`${workConfirmation.work_date}`);
  doc.moveDown();

  // Owner 회사 정보
  doc.text(`${workConfirmation.owner_company_name} 확인자: (서명 없음)`);
  doc.moveDown();

  // BP 회사 정보 및 서명
  doc.text(`${workConfirmation.bp_company_name}`);
  
  // BP 서명 이미지 삽입
  if (workConfirmation.bp_signature) {
    const signatureBuffer = Buffer.from(workConfirmation.bp_signature.split(',')[1], 'base64');
    doc.image(signatureBuffer, { width: 100 });
  }
  
  doc.text(`담당자: ${workConfirmation.bp_contact_person}`);
  doc.moveDown();

  // Owner 연락처
  doc.fontSize(10);
  doc.text(`${workConfirmation.owner_company_name}`);
  doc.text(`TEL: ${workConfirmation.owner_company_phone}`);
  doc.text(`FAX: ${workConfirmation.owner_company_fax}`);
  doc.text(`담당자: ${workConfirmation.owner_contact_phone}`);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
```

#### 10.3. 월별 작업확인서 PDF 생성
```typescript
export async function generateMonthlyWorkConfirmationPDF(
  monthlyConfirmation: MonthlyWorkConfirmation,
  outputPath: string
) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  doc.font('path/to/NanumGothic.ttf');

  // 제목
  doc.fontSize(16).text(`${monthlyConfirmation.year}년 ${monthlyConfirmation.month}월 ${monthlyConfirmation.equipment_type} 작업 확인서`, { align: 'center' });
  doc.moveDown();

  // 헤더 정보
  doc.fontSize(10);
  doc.text(`중사명: ${monthlyConfirmation.site_name}`);
  doc.text(`장비번호: ${monthlyConfirmation.equipment_type} (${monthlyConfirmation.vehicle_number})`);
  doc.text(`담당자: ${monthlyConfirmation.bp_contact_person} (인)`);
  doc.moveDown();

  // 테이블 헤더
  const tableTop = doc.y;
  const colWidths = [60, 150, 80, 80, 100];
  const colX = [50, 110, 260, 340, 420];
  
  doc.fontSize(9);
  doc.text('날짜', colX[0], tableTop);
  doc.text('작업내용', colX[1], tableTop);
  doc.text('초과(O/T)', colX[2], tableTop);
  doc.text('야간', colX[3], tableTop);
  doc.text('확인', colX[4], tableTop);
  
  // 테이블 행
  let currentY = tableTop + 20;
  
  for (const dailyData of monthlyConfirmation.daily_data) {
    doc.text(dailyData.date, colX[0], currentY);
    doc.text(dailyData.work_content || '', colX[1], currentY);
    doc.text(dailyData.overtime_hours ? dailyData.overtime_hours.toString() : '', colX[2], currentY);
    doc.text(dailyData.night_hours ? dailyData.night_hours.toString() : '', colX[3], currentY);
    
    // 서명 이미지
    if (monthlyConfirmation.daily_signatures[dailyData.date]) {
      const signatureBuffer = Buffer.from(monthlyConfirmation.daily_signatures[dailyData.date].split(',')[1], 'base64');
      doc.image(signatureBuffer, colX[4], currentY - 5, { width: 50, height: 20 });
    }
    
    currentY += 25;
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
```

#### 10.4. Supabase Storage에 PDF 저장
```typescript
// server/_core/storage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadPDF(
  filePath: string,
  fileName: string,
  bucket: string = 'work-confirmations'
): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) throw error;

  // Public URL 반환
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
```

---

### 9.10. Phase 11: 긴급 알림 및 실시간 기능 (1-2일)

#### 11.1. 긴급 알림 (0.5일)
**API**:
- `emergencyAlerts.create`
- `emergencyAlerts.list`
- `emergencyAlerts.getById`
- `emergencyAlerts.updateStatus`

**UI**:
- `client/src/pages/mobile/EmergencyAlert.tsx` (Worker)
- `client/src/pages/owner/EmergencyAlerts.tsx` (Owner)
- `client/src/pages/bp/EmergencyAlerts.tsx` (BP)
- `client/src/pages/ep/EmergencyAlerts.tsx` (EP)

#### 11.2. 실시간 알림 (1-1.5일)
**옵션 1**: WebSocket (Socket.io)
**옵션 2**: Server-Sent Events (SSE)
**옵션 3**: Polling (간단하지만 비효율적)

**추천**: Socket.io

```bash
pnpm add socket.io socket.io-client
```

**서버**:
```typescript
// server/socket.ts
import { Server } from 'socket.io';

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

// 알림 전송
export function sendNotification(io, userId, notification) {
  io.to(`user:${userId}`).emit('notification', notification);
}
```

**클라이언트**:
```typescript
// client/src/_core/hooks/useNotifications.ts
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useNotifications(userId: string) {
  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.emit('join', userId);

    socket.on('notification', (notification) => {
      // 알림 표시
      console.log('New notification:', notification);
      // Toast 알림 표시
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);
}
```

---

### 9.11. Phase 12: Admin 관리 페이지 (2-3일)

#### 12.1. 회사 관리 (0.5일)
**API**: `companies.*`

**UI**:
- `client/src/pages/admin/Companies.tsx`
- 회사 목록, 등록, 수정, 삭제

#### 12.2. 사용자 관리 (0.5일)
**API**: `users.*`

**UI**:
- `client/src/pages/admin/Users.tsx`
- 사용자 목록, 등록, 수정, 삭제

#### 12.3. 점검표 템플릿 관리 (1-2일)
**API**: `checklists.*`

**UI**:
- `client/src/pages/admin/ChecklistTemplates.tsx`
- 템플릿 목록, 생성, 수정, 삭제
- 점검 항목 추가/삭제 (동적 폼)

**점검표 템플릿 편집기**:
```typescript
function ChecklistTemplateEditor() {
  const [categories, setCategories] = useState([
    {
      category: '엔진',
      frequency: 'daily',
      items: [
        { id: 'engine_oil', label: '엔진 오일 레벨 확인', type: 'checkbox' },
      ],
    },
  ]);

  const addCategory = () => {
    setCategories([...categories, {
      category: '',
      frequency: 'daily',
      items: [],
    }]);
  };

  const addItem = (categoryIndex) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.push({
      id: '',
      label: '',
      type: 'checkbox',
    });
    setCategories(newCategories);
  };

  return (
    <div>
      {categories.map((category, catIndex) => (
        <div key={catIndex}>
          <input
            value={category.category}
            onChange={(e) => {
              const newCategories = [...categories];
              newCategories[catIndex].category = e.target.value;
              setCategories(newCategories);
            }}
            placeholder="카테고리명"
          />
          <select
            value={category.frequency}
            onChange={(e) => {
              const newCategories = [...categories];
              newCategories[catIndex].frequency = e.target.value;
              setCategories(newCategories);
            }}
          >
            <option value="daily">일일</option>
            <option value="weekly">주별</option>
            <option value="monthly">월별</option>
          </select>
          
          {category.items.map((item, itemIndex) => (
            <div key={itemIndex}>
              <input
                value={item.id}
                onChange={(e) => {
                  const newCategories = [...categories];
                  newCategories[catIndex].items[itemIndex].id = e.target.value;
                  setCategories(newCategories);
                }}
                placeholder="항목 ID"
              />
              <input
                value={item.label}
                onChange={(e) => {
                  const newCategories = [...categories];
                  newCategories[catIndex].items[itemIndex].label = e.target.value;
                  setCategories(newCategories);
                }}
                placeholder="항목명"
              />
            </div>
          ))}
          
          <button onClick={() => addItem(catIndex)}>항목 추가</button>
        </div>
      ))}
      
      <button onClick={addCategory}>카테고리 추가</button>
    </div>
  );
}
```

---

## 10. 개발 가이드

### 10.1. 개발 환경 설정

#### 10.1.1. 프로젝트 클론 및 설치
```bash
cd /home/ubuntu/construction-equipment-management
pnpm install
```

#### 10.1.2. 환경 변수 설정
`.env` 파일 확인:
```env
# Supabase
SUPABASE_URL=https://zlgehckxiuhjpfjlaycf.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# JWT
JWT_SECRET=...

# SMTP (메일 전송)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=ERMS <noreply@erms.com>

# 기타
NODE_ENV=development
```

#### 10.1.3. 개발 서버 실행
```bash
pnpm dev
```

서버 URL: `http://localhost:3000`

---

### 10.2. 코딩 규칙

#### 10.2.1. 파일 및 폴더 명명 규칙
- **컴포넌트**: PascalCase (예: `DashboardLayout.tsx`)
- **페이지**: PascalCase (예: `Login.tsx`)
- **유틸리티 함수**: camelCase (예: `hashPassword.ts`)
- **API 라우터**: kebab-case (예: `entry-request-router.ts`)

#### 10.2.2. 변수 및 함수 명명 규칙
- **변수**: camelCase (예: `userId`, `workSessionId`)
- **상수**: UPPER_SNAKE_CASE (예: `COOKIE_NAME`, `JWT_SECRET`)
- **함수**: camelCase (예: `getUserById`, `createWorkSession`)
- **컴포넌트**: PascalCase (예: `WorkerApp`, `SignatureCanvas`)

#### 10.2.3. TypeScript 타입
- **인터페이스**: PascalCase, `I` 접두사 없음 (예: `User`, `Equipment`)
- **타입**: PascalCase (예: `UserRole`, `WorkSessionStatus`)

---

### 10.3. Git 워크플로우

#### 10.3.1. 브랜치 전략
```
main (프로덕션)
  ├─ develop (개발)
  │   ├─ feature/phase-2-database (Phase 2)
  │   ├─ feature/phase-3-dashboard (Phase 3)
  │   ├─ feature/phase-4-owner (Phase 4)
  │   └─ ...
  └─ hotfix/* (긴급 수정)
```

#### 10.3.2. 커밋 메시지
```
feat: 투입 관리 기능 추가
fix: 작업확인서 PDF 생성 오류 수정
docs: API 문서 업데이트
style: 코드 포맷팅
refactor: 데이터베이스 쿼리 최적화
test: 작업 세션 API 테스트 추가
chore: 의존성 업데이트
```

---

### 10.4. 테스트

#### 10.4.1. 단위 테스트
**라이브러리**: Vitest

```bash
pnpm add -D vitest
```

**예시**:
```typescript
// server/_core/password.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('should hash password', async () => {
    const password = 'test123';
    const hashed = await hashPassword(password);
    expect(hashed).not.toBe(password);
  });

  it('should verify password', async () => {
    const password = 'test123';
    const hashed = await hashPassword(password);
    const isValid = await verifyPassword(password, hashed);
    expect(isValid).toBe(true);
  });
});
```

#### 10.4.2. API 테스트
**라이브러리**: Supertest

```bash
pnpm add -D supertest @types/supertest
```

---

### 10.5. 배포

#### 10.5.1. 프로덕션 빌드
```bash
pnpm build
```

#### 10.5.2. 프로덕션 서버 실행
```bash
pnpm start
```

#### 10.5.3. 환경 변수 (프로덕션)
`.env.production`:
```env
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

---

## 11. 참고 자료

### 11.1. 문서
- [tRPC 공식 문서](https://trpc.io/)
- [Drizzle ORM 공식 문서](https://orm.drizzle.team/)
- [Supabase 공식 문서](https://supabase.com/docs)
- [React 공식 문서](https://react.dev/)

### 11.2. 첨부 파일
- `/home/ubuntu/upload/schema.ts` - 새로운 데이터베이스 스키마
- `/home/ubuntu/upload/0000_third_blindfold.sql` - 마이그레이션 SQL
- `/home/ubuntu/upload/마이그레이션_가이드.md` - 마이그레이션 가이드
- `/home/ubuntu/upload/작업확인서최종설계(정정).md` - 작업확인서 설계
- `/home/ubuntu/upload/작업확인서PDF생성및저장설계.md` - PDF 생성 설계
- `/home/ubuntu/upload/프로젝트_분석_요약.md` - 프로젝트 분석 요약

---

## 12. 연락처

**프로젝트 담당자**: [담당자명]  
**이메일**: [이메일 주소]  
**전화번호**: [전화번호]

---

## 13. 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-10-27 | 1.0 | 초기 문서 작성 | Manus AI |

---

**문서 끝**

