Lint analysis for the extended `todo.shep`

What I changed:
- Extended the original minimal example into a richer app (owner, timestamps, priority, multiple views, CRUD actions).

What the runtime/compiler reported (summary):
- Unexpected characters around `|` (pipe) tokens and some `->` usages in certain contexts.
- Several field types rejected: `uuid`, `user`, `datetime`, union style types like `low|medium|high`.
- Optional marker `?` (e.g., `text?`) rejected.
- Some `button` or `view` targets were reported as "not found" because the linter expects actions (not views) or different declaration order/semantics.

Root causes (inferred):
- The current Sheplang grammar (as observed from the original example) supports a small set of field types such as `text` and `yes/no`. New types and union syntax are not currently recognized.
- The grammar doesn't accept `?` optional markers or union `|` tokens, so constructs like `text?` or `low|medium|high` fail.
- Some constructs I used (explicit `id: uuid`, `owner: user`, `now()`, `uuid()`) are not yet implemented in the language parser/runtime.
- The linter/compiler indicates name resolution/order issues: referencing a `view` name where an `action` is expected (or vice versa) will produce "Action not found" errors.

Conservative compatibility recommendations (quick fixes):
- Use only supported primitive types (likely `text` and `yes/no`) in `data` fields.
- Avoid `?` optional markers; instead document optionality in comments or use nullable `text` with convention (empty string means null) until parser supports optionality.
- Represent enums as `text` with a `validations` hint (e.g., `priority: text` + `validations: - "priority in (low,medium,high)"`).
- Avoid `uuid()` and `now()` unless the runtime implements helper functions; let the runtime assign `id`/timestamp implicitly on `add`.
- Keep `button "Label" -> ActionName` pointing to actions; ensure action names exist and are declared.

Example conservative `todo_compat.shep` (compiler-friendly):
- See `todo_compat.shep` in the same folder. It keeps types minimal while adding practical features.

Suggested language extensions (for richer DSL):
- Add built-in scalar types: `uuid`, `datetime`, `date`, and `user`.
- Support optional field marker `?` and union/enums with `|`.
- Add helper functions: `now()`, `uuid()` and `current_user` / `current_user_id` binding.
- Extend `validations` and `rules` to be machine-parseable (structured policies) rather than plain strings; optionally support both syntaxes.
- Clarify the grammar for `list` filters and `tabs` syntax (e.g., `tabs "All,Active,Completed" -> filter` or a structured `tabs` block).

Next steps I can take (pick any):
- Update the language grammar and parser to accept the richer constructs (I can provide a spec for parser changes).
- Implement runtime helpers (`uuid()`, `now()`, `current_user`) in the interpreter.
- Convert the richer example into a compile-time validated syntax extension proposal for your team.
- Wire the richer example to a small TypeScript runtime demo (in-memory store + enforced owner checks) — I can add that next.

If you want, I can now:
- Add a TypeScript example that maps the conservative `todo` model to an in-memory store and shows how to enforce `owner` checks, or
- Produce a formal grammar patch (BNF-style) for the language features I used.

Which of those would you like next? If you'd rather I keep iterating on the `todo.shep` examples, tell me whether to prefer: (A) conservative compatibility, or (B) push for richer grammar and runtime changes so examples can stay expressive.