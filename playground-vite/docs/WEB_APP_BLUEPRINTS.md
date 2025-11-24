# ShepLang Web App Blueprints (Alpha)

Use these blueprints to set expectations with early users. Every scenario below is 100% achievable today as long as you pair the playground with the VS Code extension + CLI. When a limitation exists, we call it out and outline the beta plan to resolve it.

| Blueprint | Works Today Because… | Current Gotchas | Beta Enhancements |
|-----------|----------------------|-----------------|-------------------|
| **Founder CRM / Pipeline Tracker** | `data` models map to leads/opportunities, `view` lists render kanban-style tables, `action` updates advance stages. | No built-in Kanban drag/drop; reminder emails must be wired manually via `call`. | Ship Kanban component + Sendgrid/Mailgun notification snippets. |
| **Task & Accountability Dashboard** | ShepLang excels at CRUD + derived “Today” views; verification prevents missing fields. | Recurring tasks + scheduled reminders require ShepThon cron workaround. | Background job helper + notification hooks. |
| **Customer Portal + Invoice Viewer** | `call load` combos fetch Stripe/QuickBooks data; views gate access by account. | Auth is basic; file downloads require backend proxy endpoint. | Passwordless auth pattern + Supabase storage recipe. |
| **Beta Tester Feedback Hub** | Perfect for capturing feedback, status, and auto-building changelogs. | Real-time board updates require manual refresh; attachments limited. | Websocket helper + storage snippet. |
| **Micro-SaaS Metrics Snapshot** | Deterministic `call` statements hit Stripe/Paddle APIs with compile-time validation. | Rate limits + caching handled manually; no chart component. | Metrics connector pack + shipped `<MetricsChart />` component. |
| **Community Waitlist + Referrals** | Forms are trivial; referral logic lives inside `action` blocks. | Email, SMS, and share links must be wired manually. | Growth kit with pre-verified email + link tracking helpers. |
| **Internal Ops / Wiki** | ShepLang’s deterministic views create wikis with structured workflows. | Rich text editing limited; search requires backend hook. | Markdown editor snippet + `load search` helper. |

---

## Building from a Blueprint

1. **Start in Playground:** Copy the relevant snippet (coming soon) and visualize the `view` layout.
2. **Move to VS Code:** Use the extension to compile into a full React/TypeScript project.
3. **Wire APIs:** Add `call`/`load` statements referencing your ShepThon manifest or REST spec so the verifier can confirm endpoints.
4. **Ship:** Deploy the generated frontend + backend to your preferred host (Vercel + Fly.io/Render recommended during alpha).

All blueprints assume:
- VS Code + CLI workflow for actual deployment.
- ShepThon backend or REST APIs with documented endpoints.
- No private beta features unless called out in the Beta Enhancements column.

Need another blueprint? File an issue or DM in Discord and we’ll document it fast.
