# Phase 1: 로그인 및 인증 시스템 수정 - 작업 계획

**작성일**: 2025-10-26  
**예상 소요 시간**: 1일

---

## 🔍 현재 상황 분석

### 현재 로그인 시스템

1. **OAuth 기반 로그인**
   - Manus OAuth 포털을 통한 로그인만 지원
   - 환경 변수 미설정으로 작동하지 않음
   - `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID` 필요

2. **모바일 PIN 로그인**
   - Worker용 PIN 로그인만 별도로 존재
   - `/mobile/login` 경로

3. **문제점**
   - 비밀번호를 묻지 않고 자동 로그인됨 (OAuth 미설정으로 인한 오류)
   - 로그아웃이 제대로 작동하지 않음
   - 역할별 로그인 화면 없음

---

## 🎯 목표

**자체 이메일/비밀번호 로그인 시스템 구현**

### 요구사항

1. **역할별 로그인**
   - Admin, Owner, BP, EP: 이메일/비밀번호 로그인
   - Worker: PIN 로그인 (기존 유지)

2. **로그아웃 기능**
   - 로그아웃 버튼 클릭 시 세션 종료
   - 로그인 페이지로 리다이렉트

3. **역할별 라우팅 가드**
   - 역할에 맞지 않는 페이지 접근 차단
   - 미인증 사용자 로그인 페이지로 리다이렉트

---

## 📋 작업 목록

### 1. 서버 사이드 작업

#### 1.1. 사용자 테이블에 비밀번호 필드 추가

**파일**: `drizzle/schema.ts`

```typescript
export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(), // unique 추가
  password: text("password"), // 비밀번호 필드 추가 (해시)
  loginMethod: varchar("login_method", { length: 64 }),
  role: userRoleEnum("role").default("owner").notNull(),
  companyId: varchar("company_id", { length: 64 }),
  pin: varchar("pin", { length: 4 }), // Worker용 PIN (기존)
  createdAt: timestamp("created_at").defaultNow(),
  lastSignedIn: timestamp("last_signed_in").defaultNow(),
});
```

#### 1.2. 비밀번호 해싱 함수 추가

**파일**: `server/_core/password.ts` (신규 생성)

```typescript
import { createHash } from "crypto";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
```

#### 1.3. 이메일/비밀번호 로그인 API 추가

**파일**: `server/routers.ts` 또는 `server/auth-router.ts` (신규 생성)

```typescript
auth: router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  
  // 이메일/비밀번호 로그인
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByEmail(input.email);
      
      if (!user) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "이메일 또는 비밀번호가 올바르지 않습니다." 
        });
      }
      
      if (!verifyPassword(input.password, user.password)) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "이메일 또는 비밀번호가 올바르지 않습니다." 
        });
      }
      
      // JWT 토큰 생성 및 쿠키 설정
      const token = await createJWT({ userId: user.id });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
      
      return { user };
    }),
  
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
}),
```

#### 1.4. 데이터베이스 함수 추가

**파일**: `server/db.ts`

```typescript
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) return null;
  return toCamelCase(data) as User;
}

export async function createUser(user: {
  id: string;
  name: string;
  email: string;
  password: string; // 해시된 비밀번호
  role: string;
  companyId?: string;
}): Promise<void> {
  await supabase
    .from('users')
    .insert(toSnakeCase(user));
}
```

---

### 2. 클라이언트 사이드 작업

#### 2.1. 로그인 페이지 생성

**파일**: `client/src/pages/Login.tsx` (신규 생성)

```typescript
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("로그인 성공");
      setLocation("/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>
            건설장비 및 인력 관리 시스템
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@test.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2.2. App.tsx 라우팅 수정

**파일**: `client/src/App.tsx`

```typescript
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/mobile/login" component={PinLogin} />
      
      {/* 나머지 라우트는 DashboardLayout으로 감싸기 */}
      <Route>
        <DashboardLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/equipment" component={Equipment} />
            {/* ... 기타 라우트 */}
          </Switch>
        </DashboardLayout>
      </Route>
    </Switch>
  );
}
```

#### 2.3. DashboardLayout 수정 (로그인 리다이렉트)

**파일**: `client/src/components/DashboardLayout.tsx`

```typescript
// const.ts 수정
export const getLoginUrl = () => {
  return "/login"; // OAuth 대신 자체 로그인 페이지로
};

// DashboardLayout.tsx 수정
if (!user) {
  // 로그인 페이지로 리다이렉트
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
  return null;
}
```

#### 2.4. 로그아웃 버튼 수정

**파일**: `client/src/components/DashboardLayout.tsx`

```typescript
const handleLogout = async () => {
  await logout();
  window.location.href = "/login";
};

// 로그아웃 버튼
<DropdownMenuItem onClick={handleLogout}>
  <LogOut className="mr-2 h-4 w-4" />
  로그아웃
</DropdownMenuItem>
```

---

### 3. 역할별 라우팅 가드 추가

#### 3.1. ProtectedRoute 컴포넌트 생성

**파일**: `client/src/components/ProtectedRoute.tsx` (신규 생성)

```typescript
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      setLocation("/login");
      return;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      setLocation("/");
      return;
    }
  }, [user, loading, allowedRoles, setLocation]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return null;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }
  
  return <>{children}</>;
}
```

#### 3.2. App.tsx에 라우팅 가드 적용

```typescript
<Route path="/admin/companies">
  <ProtectedRoute allowedRoles={["admin"]}>
    <AdminCompanies />
  </ProtectedRoute>
</Route>
```

---

### 4. 테스트 사용자 생성

#### 4.1. 테스트 사용자 생성 스크립트

**파일**: `create-test-users.mjs` (신규 생성)

```javascript
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

async function createTestUsers() {
  const users = [
    {
      id: nanoid(),
      name: "테스트 관리자",
      email: "admin@test.com",
      password: hashPassword("admin123"),
      role: "admin",
      login_method: "email",
    },
    {
      id: nanoid(),
      name: "테스트 Owner",
      email: "owner@test.com",
      password: hashPassword("owner123"),
      role: "owner",
      login_method: "email",
    },
    {
      id: nanoid(),
      name: "테스트 BP",
      email: "bp@test.com",
      password: hashPassword("bp123"),
      role: "bp",
      login_method: "email",
    },
    {
      id: nanoid(),
      name: "테스트 EP",
      email: "ep@test.com",
      password: hashPassword("ep123"),
      role: "ep",
      login_method: "email",
    },
  ];
  
  for (const user of users) {
    const { error } = await supabase.from('users').insert(user);
    if (error) {
      console.error(`Error creating user ${user.email}:`, error);
    } else {
      console.log(`✅ Created user: ${user.email} / ${user.role}`);
    }
  }
}

createTestUsers();
```

---

## 📊 작업 순서

1. **서버 사이드 작업** (2-3시간)
   - [ ] 비밀번호 필드 추가 (schema.ts)
   - [ ] 비밀번호 해싱 함수 추가 (password.ts)
   - [ ] 로그인 API 추가 (routers.ts)
   - [ ] 데이터베이스 함수 추가 (db.ts)

2. **클라이언트 사이드 작업** (2-3시간)
   - [ ] 로그인 페이지 생성 (Login.tsx)
   - [ ] App.tsx 라우팅 수정
   - [ ] DashboardLayout 수정
   - [ ] 로그아웃 버튼 수정

3. **라우팅 가드 추가** (1-2시간)
   - [ ] ProtectedRoute 컴포넌트 생성
   - [ ] App.tsx에 라우팅 가드 적용

4. **테스트** (1-2시간)
   - [ ] 테스트 사용자 생성
   - [ ] 로그인 테스트
   - [ ] 로그아웃 테스트
   - [ ] 역할별 접근 권한 테스트

---

## ✅ 완료 기준

- [ ] Admin, Owner, BP, EP가 이메일/비밀번호로 로그인 가능
- [ ] 로그아웃 버튼 클릭 시 정상적으로 로그아웃됨
- [ ] 역할에 맞지 않는 페이지 접근 시 차단됨
- [ ] Worker는 기존 PIN 로그인 유지

---

**작성일**: 2025-10-26  
**작성자**: AI Assistant

