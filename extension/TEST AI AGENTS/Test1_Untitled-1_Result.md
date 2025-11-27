Test 1 - Understanding (Untitled-1.groovy)

1. What I understand about this file
- An app `InvoiceApp` defining models, views, actions and a scheduled job for reminders.

2. Entities / data models
- `User` (name, email, company, created)
- `Client` (name, email, company, phone, address)
- `Invoice` (number, client ref, amount, status, dueDate, created, notes)
- `LineItem` (invoice ref, description, quantity, price)

3. Views (screens)
- `Dashboard`, `ClientList`, `InvoiceDetail`, `InvoiceForm`, `ClientForm`

4. Actions (behaviors)
- CreateInvoice, SaveInvoice, CreateClient, SaveClient, AddLineItem, SendInvoice, DeleteInvoice, ShowDashboard, ShowClients

5. What I'd improve or add
- Add `Payment` model and payment flows (see Test 2).
- Confirm API contracts for all `call`/`load` endpoints.
- Add validations and auth rules for invoice operations.

What to Record

1. Did AI understand the syntax? Yes
2. Did AI generate valid ShepLang? N/A (this test only asked for understanding)
3. What syntax errors occurred? None observed in this file
4. Did AI follow existing patterns? Yes
5. Did AI add features that don't exist in grammar? No
6. Quality of suggestions: 5
7. Would a non-technical founder understand the output? Yes
