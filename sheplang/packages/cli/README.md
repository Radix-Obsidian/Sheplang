# ShepLang

**Build full-stack MVPs with ShepLang → BobaScript**

ShepLang is a minimalist programming language for rapid prototyping. Write components, actions, and routes in a declarative syntax that compiles to executable BobaScript.

## Quick Start

```bash
# Global install
npm install -g sheplang

# Or run directly
npx sheplang --help
```

## Usage

```bash
# Get help
sheplang --help

# Parse and validate a .shep file
sheplang parse examples/todo.shep

# Build to BobaScript
sheplang build examples/todo.shep

# Live development server with hot reload
sheplang dev examples/todo.shep --port 8787

# Explain what your code does
sheplang explain examples/todo.shep

# Get repository statistics
sheplang stats
```

## Example

Create `hello.shep`:

```shep
component App { "MyTodos" }
```

Then run:

```bash
sheplang build hello.shep
# Outputs: hello.boba

sheplang dev hello.shep
# Serves preview at http://localhost:8787
```

## Language Syntax

### Components
```shep
component App { "Hello World" }

component TodoList {
  state todos = []
  "My Todo List"
}
```

### Actions
```shep
action AddTodo(item) { "Todo added" }
action ToggleTodo(id) { "Todo toggled" }
```

### Routes
```shep
component Home { "Welcome" }
component About { "About Us" }

route "/" -> Home
route "/about" -> About
```

### Props
```shep
component Header props { title: "MyApp", count: 0 } {
  "Header Component"
}
```

## Commands

| Command | Description |
|---------|-------------|
| `parse <file>` | Print parsed AST as JSON |
| `build <file>` | Compile to BobaScript in `dist/` |
| `dev <file>` | Live preview server with HMR |
| `explain <file>` | Human-readable code explanation |
| `stats` | Repository statistics |

## Options

- `--out <dir>` - Output directory for build (default: `dist`)
- `--port <number>` - Port for dev server (default: `8787`)

## Development

```bash
git clone https://github.com/your-org/sheplang.git
cd sheplang/sheplang
pnpm install
pnpm -w -r build
node ./packages/cli/dist/index.js --help
```

## More Information

- [Language Documentation](https://github.com/your-org/sheplang/blob/main/docs/)
- [Examples](https://github.com/your-org/sheplang/tree/main/sheplang/examples)
- [Issues](https://github.com/your-org/sheplang/issues)

---

Built with ❤️ by Golden Sheep AI
