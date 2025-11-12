# ShepLang + BobaScript

**Single NPM installer for the complete ShepLang development environment**

## Quick Install

```bash
npm install -g sheplang
```

Or run without installing:

```bash
npx sheplang --help
```

## What's Included

- **ShepLang Parser**: Full language parser and validator
- **BobaScript Transpiler**: Compile ShepLang to executable BobaScript  
- **Development Server**: Live preview with hot module reloading
- **CLI Tools**: Build, parse, explain, and analyze commands

## Usage

```bash
# Create a simple app
echo 'component App { "Hello World" }' > hello.shep

# Start development server
sheplang dev hello.shep
# → http://localhost:8787

# Build for production
sheplang build hello.shep
# → dist/hello.boba

# Explain what your code does
sheplang explain hello.shep
```

## Example Application

```shep
component TodoApp {
  state todos = []
  "My Todo List"
}

action AddTodo(item) { 
  "Todo added successfully" 
}

action ToggleTodo(id) { 
  "Todo status updated" 
}

route "/" -> TodoApp
```

Save as `todos.shep` and run:

```bash
sheplang dev todos.shep --port 3000
```

## Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `help` | Show all commands | `sheplang help` |
| `parse <file>` | Parse and validate | `sheplang parse app.shep` |
| `build <file>` | Compile to BobaScript | `sheplang build app.shep` |
| `dev <file>` | Development server | `sheplang dev app.shep --port 8787` |
| `explain <file>` | Explain code functionality | `sheplang explain app.shep` |
| `stats` | Repository statistics | `sheplang stats` |

## Package Structure

This single package includes:

- `@sheplang/language` - Langium-based parser and AST
- `@adapters/sheplang-to-boba` - Deterministic transpiler
- Runtime components and CLI tools

All dependencies are bundled—no additional setup required.

## Language Features

### 🏗️ **Components**
Declare UI components with state and props:

```shep
component Counter {
  state count = 0
  "Counter: 0"
}

component Header props { title: string } {
  "Welcome to MyApp"
}
```

### ⚡ **Actions**  
Define backend operations:

```shep
action CreateUser(name, email) {
  "User created successfully"
}

action SendEmail(to, subject, body) {
  "Email sent"
}
```

### 🌐 **Routing**
Map URLs to components:

```shep
route "/" -> Home
route "/about" -> About  
route "/users/:id" -> UserProfile
```

### 🔄 **Full Stack**
Everything compiles to working BobaScript:

```shep
component Dashboard {
  state users = []
  "User Dashboard"
}

action FetchUsers() {
  "Loading users..."
}

route "/dashboard" -> Dashboard
```

## Development Workflow

1. **Write** - Create `.shep` files with your app logic
2. **Develop** - Use `sheplang dev` for live preview  
3. **Build** - Compile to BobaScript with `sheplang build`
4. **Deploy** - Ship the generated BobaScript code

## TypeScript Support

All packages are written in TypeScript with full type definitions included:

```typescript
import { parseShep } from '@sheplang/language';
import { transpileShepToBoba } from '@adapters/sheplang-to-boba';

const result = await parseShep('component App { "Hello" }');
const { code } = await transpileShepToBoba(source);
```

## Contributing

```bash
git clone https://github.com/your-org/sheplang.git
cd sheplang/sheplang  
pnpm install
pnpm -w -r build
pnpm -w -r test
```

## Support

- 📖 [Documentation](https://sheplang.dev/docs)
- 🐛 [Issues](https://github.com/your-org/sheplang/issues)  
- 💬 [Discussions](https://github.com/your-org/sheplang/discussions)

---

**Built by Golden Sheep AI** | Made for rapid full-stack prototyping
