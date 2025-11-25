# Next.js → ShepLang Importer v1 (Lovable-Style Repos)

**Owner:** Golden Sheep AI  
**Stack:** ShepLang + ShepThon + BobaScript (AIVP)  
**Status:** Draft v1  
**Target Users:** Non-technical founders + AI-assisted devs who used Lovable / v0 / Builder and hit the wall

---

## 1. Problem Statement

Modern AI app builders (Lovable, Bolt, v0, etc.) generate mostly-working **Next.js + TypeScript** repos. These are great for prototyping, but:

- Codebases are **hard to read** for non-technical founders.
- There is **no clear domain model** (data, actions, flows) exposed at a high level.
- When users want to go beyond the prototype, they often **scrap the project** instead of finishing it.

We want to be the **graduation path**:

> "Lovable/Builder get you a pretty prototype. ShepLang turns that into a real, explainable, verifiable app you can own and extend."

This spec defines **v1** of a Next.js → ShepLang importer focused on **Lovable-style repos** (Next.js + Prisma).

---

## 2. Scope & Non-Goals

### 2.1 In Scope (v1)

- **Stacks:**
  - Next.js (App Router or Pages Router) + React + TypeScript
  - Prisma ORM (`schema.prisma`) for data models
- **Import target:**
  - Single `.shep` app file (or small set of `.shep` files) that captures:
    - `app` declaration
    - `data` blocks (from Prisma models)
    - `view` blocks (from Next.js pages)
    - `action` blocks (from API routes / handlers)
- **User experience:**
  - CLI and/or VS Code command: `ShepLang: Import Next.js Project`
  - Post-import **wizard** to:
    - Confirm/refine entities
    - Map buttons/forms to actions
    - Acknowledge TODOs where semantics are unclear
- **Quality bar:**
  - Output is **scaffolding + TODOs**, not a perfect reimplementation.
  - Non-technical founder should be able to **read the generated ShepLang** and understand the app at a high level.

### 2.2 Out of Scope (v1)

- Arbitrary frameworks (Rails, Django, Astro, Remix, etc.).
- Arbitrary state management (Redux, Zustand, MobX) beyond simple patterns.
- Complex business logic reconstruction (tax rules, discounts, multi-step wizards).
- Full fidelity UI reconstruction (layout, animations, theme) — that remains in Next.js/React.

---

## 3. Inputs & Outputs

### 3.1 Inputs

- **Project root path** (folder containing `package.json`).
- Detected stack:
  - Next.js present in `dependencies`.
  - Prisma present in `dependencies` or `devDependencies`.
- Optional: Git remote URL (for future UI integrations).

### 3.2 Outputs

- One or more `.shep` files, e.g.:
  - `FoodDeliveryApp.shep`
- Optional **import report** (markdown or JSON):
  - Which entities/views/actions were inferred.
  - Where TODOs were inserted.
  - Files/areas that were too complex to auto-convert.

---

## 4. High-Level Pipeline

```text
Next.js + Prisma repo
  ↓ (analyzer)
Intermediate app model (data / views / actions)
  ↓ (wizard + user input)
Refined app model
  ↓ (ShepLang generator)
ShepLang app (.shep)
```

### 4.1 Step 1 – Stack Detection

- Read `package.json` to confirm:
  - `dependencies.next` exists.
  - `dependencies.react`, `dependencies["react-dom"]` exist.
  - `dependencies.prisma` or `devDependencies.prisma` exists.
- If not matched, **abort with clear message**:
  - "Next.js → ShepLang importer v1 currently supports Next.js + Prisma projects only."

### 4.2 Step 2 – Data Model Extraction (Prisma → ShepLang `data`)

- Read `prisma/schema.prisma`.
- For each `model`:
  - Create a corresponding `data` block:

    ```sheplang
    data Restaurant:
      fields:
        name: text
        cuisine: text
        rating: number
        deliveryTime: number
    ```

- Type mapping (Prisma → ShepLang):
  - `String` → `text`
  - `Int`, `Float`, `Decimal` → `number`
  - `Boolean` → `yes/no`
  - `DateTime` → `datetime`
  - Enums → union of string literals, e.g. `"PENDING" | "PAID"`.
- Relationships:
  - For v1, model only the **foreign key as a `text` field**.
  - Add TODO comments for richer relationships:

    ```sheplang
    # TODO: model relationship between Order and Restaurant
    ```

### 4.3 Step 3 – View Extraction (Next.js Pages → `view`)

- For **App Router**:
  - Treat every `app/**/page.tsx` as a candidate `view`.
- For **Pages Router**:
  - Treat every `pages/**/*.tsx` (except `_app`, `_document`, `_error`) as candidate `view`.

For each page component:

- Derive a `view` name (PascalCase or cleaned path name).
- Detect:
  - **Lists:** `items.map(...)` or `restaurants.map(...)` → candidate `list EntityName`.
  - **Buttons/Links:** `<button>`, `<a>`, `<Link>` with discernible labels.
  - **Forms:** `<form>` tags + submit handlers.

Example mapping:

```tsx
// app/restaurants/page.tsx
export default function RestaurantsPage() {
  const { data: restaurants } = api.restaurants.list.useQuery();
  return (
    <div>
      <h1>Restaurants</h1>
      {restaurants.map(r => (
        <div key={r.id}>
          <h2>{r.name}</h2>
          <button onClick={() => startOrder(r.id)}>Order now</button>
        </div>
      ))}
    </div>
  );
}
```

becomes:

```sheplang
view RestaurantsPage:
  list Restaurant
  button "Order now" -> StartOrder
```

If we cannot confidently match a list to an entity, insert a TODO:

```sheplang
  # TODO: identify which entity this list represents
  # list ???
```

### 4.4 Step 4 – Action Extraction (Handlers & API → `action`)

Two main sources:

1. **Button/Form handlers in React**
   - `onClick={() => something()}`
   - `onSubmit={handleSubmit}`
2. **Next.js API routes or tRPC routers**
   - `app/api/**/route.ts` or `pages/api/**.ts`.
   - `createOrder`, `cancelOrder` procedures, etc.

Heuristic mapping:

- If a button calls a function that calls `fetch('/api/orders', { method: 'POST', ... })`, generate:

  ```sheplang
  action PlaceOrder(orderParams):
    # TODO: map orderParams fields to API body
    call POST "/api/orders" with orderParams
    load GET "/api/orders" into orders
    show OrdersList
  ```

- If we see a clear **CRUD pattern** (Prisma `create`, `update`, `delete` on a model), we:
  - Name the action `Create<Entity>`, `Update<Entity>`, `Delete<Entity>`.
  - Use entity fields as parameters.

Where things are too custom (calculating totals, discounts, etc.), explicitly insert TODOs:

```sheplang
  # TODO: calculate total with tax, delivery fee, discounts
```

### 4.5 Step 5 – Wizard (User-Facing Refinement)

After static analysis, show a **post-import wizard** (in VS Code / CLI prompts) to:

1. **Confirm app type / domain (optional)**
   - e.g. Food Delivery, E-commerce, Task Manager.
2. **Review entities**
   - "We found models: Restaurant, MenuItem, Order. Keep/rename?"
3. **Map lists to entities**
   - "This list in RestaurantsPage likely shows Restaurant. Confirm?"
4. **Map buttons to actions**
   - "We found buttons: 'Order now', 'Cancel order'. What should they do?"
   - Suggest names like `StartOrder`, `CancelOrder`.

The wizard doesn’t need to be perfect; it just lets the founder **correct the obvious misguesses** before the `.shep` is written.

### 4.6 Step 6 – ShepLang Generation

From the refined app model (post-wizard), generate:

- `app AppName`
- `data` blocks (from Prisma + wizard)
- `view` blocks (from pages + wizard)
- `action` blocks (from handlers + wizard + TODOs)

Style guidelines:

- One primary `.shep` file for v1.
- Insert `# TODO` comments where semantics are unknown.
- Keep names as close as possible to original code (but cleaned for ShepLang).

---

## 5. Integration Touchpoints

### 5.1 VS Code Extension

- New command: **"ShepLang: Import Next.js Project"**
  - Prompts for folder (or uses current workspace if it’s a Next.js project).
  - Runs analyzer + wizard.
  - Writes `.shep` file(s) into a chosen folder.
  - Opens the generated `.shep` file in the editor.

### 5.2 CLI (Future)

- Standalone command (inside monorepo or as separate package):

  ```bash
  sheplang import-next ./my-next-app --out ./my-shep-app
  ```

- Reuses the same analyzer + generator pipeline.

---

## 6. Limitations & Future Directions

### 6.1 Known Limitations (v1)

- Only supports projects with **Next.js + Prisma**.
- Only basic CRUD and list/detail flows are inferred.
- Complex flows (multi-step checkout, wizards, heavy client-side state) are:
  - Partially represented.
  - Marked with `# TODO` and original file references.
- No deep reconstruction of **non-HTTP side effects** (analytics, feature flags, etc.).

### 6.2 Future Enhancements

- Support additional stacks (Rails, Django, Express + Sequelize/TypeORM).
- Use LLMs to:
  - Summarize handler logic into natural language, stored as comments.
  - Suggest better action names and parameter lists.
- Optional integration with **vision models** (e.g., Groq Vision) to:
  - Cross-check UI labels vs data models.
  - Improve mapping of lists/buttons when static analysis is ambiguous.
- Generate **ShepThon** backend skeletons alongside ShepLang, so imported apps become fully AIVP-native.

---

## 7. Success Criteria (v1)

- Can successfully import **at least 3 real Lovable/v0-style Next.js + Prisma repos** into:
  - A single `.shep` file that:
    - Compiles in ShepLang.
    - Passes ShepVerify basic phases.
- Non-technical founder can:
  - Read the generated ShepLang and explain, in plain language, what their app does.
  - Identify where `# TODO` markers are and understand what decisions they need to make.
- The importer **never silently lies**:
  - When it’s unsure, it inserts `# TODO` with a short explanation.
  - No hidden or magical behavior.
