export type Example = { name: string; source: string };

export const EXAMPLES: Example[] = [
  {
    name: "01 — Minimal (MyTodos)",
    source: `component App { "MyTodos" }` 
  },
  {
    name: "02 — State + Title",
    source: `
component App {
  state todos = []
  "MyTodos"
}
`
  },
  {
    name: "03 — Route",
    source: `
component Home { "Home" }
route "/" -> Home
`
  },
  {
    name: "04 — Action",
    source: `
action AddTodo(item) { "Added" }
component App { "MyTodos" }
`
  },
  {
    name: "05 — Props + Child",
    source: `
component Header props { title: "MyTodos", count: 0 } { "MyTodos" }
component App { "MyTodos" }
`
  }
];
