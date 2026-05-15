# JWT + CORS + Context Path Changes Summary

## What Changed

### 1. API Context Path: `/colonyconnect` → `/colonyconnectapi`
| File | Change |
|------|--------|
| [application.yml](file:///d:/HPCL/PH-Dev/ColonyManagement/revamp_colony/Intern/colonyconnect/colony-api/src/main/resources/application.yml) | `context-path: /colonyconnectapi` |
| [pom.xml](file:///d:/HPCL/PH-Dev/ColonyManagement/revamp_colony/Intern/colonyconnect/colony-api/pom.xml) | `<finalName>colonyconnectapi</finalName>` → produces `colonyconnectapi.war` |
| [vite.config.ts](file:///d:/HPCL/PH-Dev/ColonyManagement/revamp_colony/Intern/colonyconnect/colony-web/vite.config.ts) | Dev proxy forwards `/colonyconnectapi` → `http://localhost:8080` |
| [client.ts](file:///d:/HPCL/PH-Dev/ColonyManagement/revamp_colony/Intern/colonyconnect/colony-web/src/lib/api/client.ts) | `API_BASE = '/colonyconnectapi'` |

### 2. JWT with HTTP-Only Cookies (replaces session-based auth)
| File | Purpose |
|------|---------|
| [JwtUtil.java](file:///d:/HPCL/PH-Dev/ColonyManagement/revamp_colony/Intern/colonyconnect/colony-api/src/main/java/com/hpcl/colony/config/JwtUtil.java) | Token creation/validation using JJWT 0.12.6 |
| [SecurityConfig.java](file:///d:/HPCL/PH-Dev/ColonyManagement/revamp_colony/Intern/colonyconnect/colony-api/src/main/java/com/hpcl/colony/config/SecurityConfig.java) | Stateless sessions, JWT filter reads `COLONY_JWT` cookie |
| [AuthController.java](file:///d:/HPCL/PH-Dev/ColonyManagement/revamp_colony/Intern/colonyconnect/colony-api/src/main/java/com/hpcl/colony/controller/AuthController.java) | Sets/clears JWT in HTTP-only cookie on login/logout |

### 3. CORS Configuration
| Setting | Value |
|---------|-------|
| Config source | `app.cors.allowed-origins` in `application.yml` |
| Default | `http://localhost:5173,http://localhost:8080` |
| Env override | `CORS_ORIGINS=https://your-domain.com` |
| Credentials | `allowCredentials: true` (cookies sent cross-origin) |

### 4. Frontend CSRF Cleanup
Removed all CSRF token management since JWT in HTTP-only cookies doesn't need CSRF protection:
- [authStore.ts](file:///d:/HPCL/PH-Dev/ColonyManagement/revamp_colony/Intern/colonyconnect/colony-web/src/lib/auth/authStore.ts) — removed `csrfToken` / `setCsrfToken`
- [LoginPage.tsx](file:///d:/HPCL/PH-Dev/ColonyManagement/revamp_colony/Intern/colonyconnect/colony-web/src/pages/LoginPage.tsx) — removed `setCsrfToken` usage
- [SecurityLoginPage.tsx](file:///d:/HPCL/PH-Dev/ColonyManagement/revamp_colony/Intern/colonyconnect/colony-web/src/pages/SecurityLoginPage.tsx) — removed `setCsrfToken` usage

> [!NOTE]
> The `{ withCsrf: true }` options in other API files (complaints, vehicles, inventory, etc.) are harmless — the `apiRequest` function accepts but ignores the option. They can be cleaned up at leisure.

---

## How It Works

```mermaid
sequenceDiagram
    participant Browser
    participant React (colonyconnect)
    participant API (colonyconnectapi)

    Browser->>React: GET /colonyconnect/login
    React->>API: POST /colonyconnectapi/api/v1/auth/login
    API-->>React: 200 OK + Set-Cookie: COLONY_JWT=eyJ...; HttpOnly; Path=/
    React->>API: GET /colonyconnectapi/api/v1/complaints (Cookie auto-sent)
    API-->>React: 200 OK (JWT validated from cookie)
    React->>API: POST /colonyconnectapi/api/v1/auth/logout
    API-->>React: 200 OK + Set-Cookie: COLONY_JWT=; MaxAge=0
```

## Server Deployment Configuration

For production, set these environment variables:

```bash
# JWT secret (min 32 chars for HS256)
JWT_SECRET=YourProductionSecretKeyHere...

# CORS origins (comma-separated, must match frontend URL exactly)
CORS_ORIGINS=https://yourserver.hpcl.co.in

# If using HTTPS, also set cookie.setSecure(true) in AuthController
```

> [!IMPORTANT]
> In production with HTTPS, change `cookie.setSecure(false)` to `cookie.setSecure(true)` in `AuthController.java` (lines ~120 and ~128) to prevent the cookie from being sent over plain HTTP.
