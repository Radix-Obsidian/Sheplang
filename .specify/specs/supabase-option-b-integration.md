# Supabase Option B Integration Spec

**Status:** Draft  
**Owner:** Platform Engineering  
**Last Updated:** 2025-11-17  
**Source Docs:**
- [Build a Supabase Integration (OAuth + Management API)](https://supabase.com/docs/guides/integrations/build-a-supabase-integration)
- [Management API Reference](https://supabase.com/docs/reference/api/introduction)
- [Create a Project](https://supabase.com/docs/reference/api/v1-create-a-project)
- [OAuth Scopes](https://supabase.com/docs/guides/integrations/build-a-supabase-integration/oauth-scopes)

---

## 1. Objective
Enable ShepLang Option B where founders use their own Supabase accounts. ShepLang becomes an OAuth app that can provision Supabase projects, run migrations generated from ShepThon, and return connection credentials to ShepLang runtime (Edge functions, playground, VS Code).

---

## 2. Actors & Components
| Actor | Responsibilities |
| --- | --- |
| ShepLang OAuth App | Registered in Supabase dashboard. Requests scopes, handles OAuth flow, stores tokens. |
| ShepLang Backend | Securely stores access/refresh tokens per user, executes Management API calls. |
| Supabase Management API | Provides `/v1/oauth/authorize`, `/v1/oauth/token`, `/v1/projects`, `/v1/organizations`, etc. |
| ShepThon Compiler | Generates SQL migrations from `.shepthon`. |
| Edge Runtime (Deno) | Uses Supabase URL + keys to run CRUD endpoints for ShepLang actions. |

---

## 3. OAuth Scope Requirements
All scopes are configured when creating the OAuth app (per Supabase docs). Each scope can be `read`, `write`, or both.

| Scope | Level | Why ShepLang Needs It |
| --- | --- | --- |
| `organizations:read` | read | List user orgs so ShepLang can show “Select Supabase org” before provisioning. |
| `projects:read` | read | Fetch project metadata, URLs, keys, status. Needed when user selects existing project. |
| `projects:write` | write | Create/delete projects, change config, run migrations. Required for automated provisioning. |
| `secrets:write` (optional future) | write | If we later push env secrets or keys into Supabase (e.g., hooking other services). |
| `secrets:read` (optional) | read | Read service-role keys if user authorizes. Typically not needed for alpha; prefer storing credentials returned by project creation. |

> **Note:** Scopes are applied at OAuth-app creation time. If we add new scopes later, existing users must re-authorize (Supabase doc guidance).

---

## 4. Key API Endpoints
| Endpoint | Method | Scope | Purpose |
| --- | --- | --- | --- |
| `/v1/oauth/authorize` | GET | n/a (public) | Redirect user to Supabase consent screen. Accepts `client_id`, `redirect_uri`, `response_type=code`, `state`, optional `organization_slug`, PKCE params. |
| `/v1/oauth/token` | POST | n/a (public) | Exchange `code` for `access_token` + `refresh_token` (uses Basic Auth + optional PKCE). Also used to refresh tokens with `grant_type=refresh_token`. |
| `/v1/organizations` | GET | `organizations:read` | List orgs the authenticated user belongs to. Needed to show org picker or verify slug when auto-creating projects. |
| `/v1/projects` | POST | `projects:write` | Create Supabase project (`name`, `organization_slug`, `db_pass`, `region`). Returns project `id`, API URL, status. |
| `/v1/projects/{ref}` | GET | `projects:read` | Verify project status, retrieve metadata (region, hostname). |
| `/v1/projects/{ref}/config/...` | PATCH | `projects:write` | Configure Postgres/Auth/Storage if needed (future). |
| `/v1/sql` or migration endpoints | POST | `projects:write` | Apply SQL migrations derived from ShepThon (depends on final Supabase endpoint choice: beta migration endpoints or SQL runner). |

---

## 5. High-Level Flows

### 5.1 Connect Supabase (First-Time)
1. User clicks **Connect Supabase** in VS Code or Playground.
2. Redirect to `https://api.supabase.com/v1/oauth/authorize` with PKCE challenge.
3. User selects organization & approves scopes.
4. Supabase redirects back to `redirect_uri` with `code` + `state`.
5. ShepLang backend exchanges code at `/v1/oauth/token` and stores tokens (encrypted, tied to user).

### 5.2 Provision Database for a ShepLang Project
1. Detect `.shepthon` or data operations → show CTA “Set up Supabase”.
2. Use stored tokens to call `/v1/organizations` (if we need org selection) or use `organization_slug` previously provided.
3. Call `/v1/projects` with payload:
   ```json
   {
     "db_pass": "<generated>",
     "name": "ShepLang-<ProjectName>",
     "organization_slug": "<selected org>",
     "region": "us-east-1"
   }
   ```
4. Persist returned project ref, API URL, anon/service keys.
5. Generate SQL from ShepThon models → run via migration endpoint.
6. Inject connection info into ShepLang runtime (Edge functions env, playground preview, etc.).

### 5.3 Use Existing Project
1. User selects existing Supabase project (list via `projects:read`).
2. Skip creation; only apply migrations + store credentials.

### 5.4 Token Refresh
- Use `/v1/oauth/token` with `grant_type=refresh_token` before tokens expire.
- If refresh fails (user revoked access), prompt re-connection.

---

## 6. Security & Storage Considerations
- **Token Storage:** Encrypt per-user access + refresh tokens. Never expose to clients.
- **Least Privilege:** For alpha, request only `organizations:read`, `projects:read`, `projects:write`.
- **Secret Handling:** Service-role keys returned from project creation must be stored securely and not exposed to frontend. Prefer using anon key for Edge functions; service role only if server needs it.
- **Audit:** Log every API call (project creation, migration) for support + billing.

---

## 7. Open Questions
1. Which migration endpoint do we standardize on? (`/v1/migrations` beta vs SQL executor.)
2. Do we allow multi-project per ShepLang project, or 1:1 mapping? (For alpha, enforce 1:1.)
3. Billing messaging: warn founders that Supabase charges apply (unless they stay on free tier).

---

## 8. Next Steps
1. Register ShepLang OAuth app in Supabase dashboard with scopes listed above.
2. Build backend service for OAuth code exchange + token storage.
3. Implement organization/project selection UI in VS Code extension + playground.
4. Hook ShepThon compiler into migration runner.
5. QA flow end-to-end with test Supabase org.
