# Supabase MCP 설정 가이드

## 개요
이 프로젝트는 Supabase MCP (Model Context Protocol) 서버를 사용하여 데이터베이스와 상호작용할 수 있도록 설정되었습니다.

## 설정된 파일들

### 1. mcp-config.json
MCP 서버 설정 파일은 환경 변수 기반으로 동작하도록 업데이트되었습니다:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

필수 환경 변수
- `SUPABASE_URL`: 새 Supabase 프로젝트 URL (예: `https://xxxxx.supabase.co`)
- `SUPABASE_ACCESS_TOKEN`: Supabase Personal Access Token 또는 적절한 서비스 키

### 2. src/utils/supabase.js
수파베이스 클라이언트 설정이 업데이트되었습니다:
- 환경 변수 fallback 값 추가
- 인증 설정 개선
- MCP 호환성 향상

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요 (값은 새 프로젝트 기준으로 교체):

```env
# Supabase (프론트엔드에서 사용)
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# MCP용 (Cursor 등에서 MCP 서버 실행 시 사용)
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ACCESS_TOKEN=YOUR_SUPABASE_PERSONAL_ACCESS_TOKEN
```

## MCP 서버 설치

다음 명령어로 MCP 서버를 설치하세요:

```bash
npm install -g @modelcontextprotocol/server-supabase
```

## 사용 방법

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. MCP 서버 연결
Cursor나 다른 MCP 호환 클라이언트에서 `mcp-config.json`을 읽어 환경 변수 기반으로 Supabase MCP 서버에 연결합니다. 환경 변수 갱신 후 클라이언트를 재시작하거나 MCP를 재로드하세요.

### 3. 데이터베이스 연결 테스트
```bash
node test-supabase-connection.js
```

## 주요 기능

- ✅ Supabase 클라이언트 설정 완료
- ✅ MCP 서버 설정 파일 생성
- ✅ 환경 변수 fallback 설정
- ✅ 인증 설정 개선
- ✅ 연결 테스트 스크립트 제공

## 문제 해결

### 연결 실패 시
1. 환경 변수가 올바르게 설정되었는지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. API 키가 유효한지 확인

### MCP 서버 연결 실패 시
1. `@modelcontextprotocol/server-supabase` 패키지가 설치되었는지 확인
2. `mcp-config.json` 파일의 설정이 올바른지 확인
3. 네트워크 연결 상태 확인

## 보안 주의사항

- `.env.local` 파일은 `.gitignore`에 추가되어야 합니다
- API 키와 액세스 토큰을 공개 저장소에 커밋하지 마세요
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요
