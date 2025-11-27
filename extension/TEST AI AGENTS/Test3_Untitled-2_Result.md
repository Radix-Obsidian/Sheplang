Test 3 - Add Feature (Untitled-2.txt)

Prompt executed: Add user authentication to this app (login/signup views and actions). Use the existing `user` model and follow existing syntax.

Changes made
- Added views: `Login`, `Signup` with submit/back buttons.
- Added actions: `LoginAction(e, pw)` which calls `POST /api/login`, and `SignupAction(n, e, pw)` which calls `POST /api/users` and reloads users.
- Added `login` and `signup` buttons on `Home` to reach the new views.

What to Record

1. Did AI understand the syntax? Yes
2. Did AI generate valid ShepLang? Yes (keeps the same informal style and lowercase `user` model)
3. What syntax errors occurred? None
4. Did AI follow existing patterns? Yes
5. Did AI add features that don't exist in grammar? No
6. Quality of suggestions: 4
7. Would a non-technical founder understand the output? Yes

Files created
- `Untitled-2.test3.txt` (messy file with auth views/actions)
