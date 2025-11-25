# @goldensheepai/sheplang-language

> The first AI-native programming language with built-in verification

ShepLang Language is the core parser and language server for [ShepLang](https://sheplang.dev) - a revolutionary programming language designed from the ground up for AI code generation.

## 🌟 Features

- **AI-Optimized Grammar**: Deterministic, minimal syntax perfect for AI understanding
- **Type Safety**: 100% type inference with compile-time verification
- **Null Safety**: Optional chaining and exhaustive validation built-in
- **Full-Stack**: Single language for frontend, backend, and database
- **Langium-Powered**: Built on the robust Langium parser framework

## 📦 Installation

```bash
npm install @goldensheepai/sheplang-language
```

## 🚀 Quick Start

```typescript
import { parseShep } from '@goldensheepai/sheplang-language';

const code = `
app MyTodoApp {
  data Todo:
    fields:
      title: text
      completed: yes/no
  
  view Dashboard:
    list Todo
    button "Add Todo" -> AddTodo
  
  action AddTodo(title):
    add Todo with title, completed = no
    show Dashboard
}
`;

const result = await parseShep(code);

if (result.success) {
  console.log('Parsed app:', result.appModel);
  // result.appModel contains the structured representation
} else {
  console.error('Parse errors:', result.diagnostics);
}
```

## 📖 API Reference

### `parseShep(source: string, filePath?: string): Promise<ParsedResult>`

Parse ShepLang source code into a structured AppModel.

**Parameters:**
- `source`: ShepLang source code as a string
- `filePath`: Optional file path for better error messages

**Returns:** `ParsedResult` object containing:
- `ast`: Raw abstract syntax tree
- `appModel`: Structured application model
- `diagnostics`: Array of syntax/semantic errors
- `success`: Boolean indicating if parsing was successful

### `mapToAppModel(ast: ShepFile): AppModel`

Convert a parsed AST into an AppModel.

**Parameters:**
- `ast`: Parsed ShepFile AST

**Returns:** Structured `AppModel` with:
- `name`: Application name
- `datas`: Data models/entities
- `views`: UI views and components
- `actions`: Business logic operations
- `flows`: Multi-step processes
- `jobs`: Background tasks
- `workflows`: State machines

## 🎯 Use Cases

### Code Editors & IDEs
```typescript
import { parseShep } from '@goldensheepai/sheplang-language';

// Provide syntax validation as user types
async function validateCode(code: string) {
  const result = await parseShep(code);
  return result.diagnostics.map(d => ({
    message: d.message,
    line: d.start.line,
    severity: d.severity
  }));
}
```

### Code Generators
```typescript
import { parseShep } from '@goldensheepai/sheplang-language';

// Generate React components from ShepLang
async function generateReact(sheplangCode: string) {
  const { appModel, success } = await parseShep(sheplangCode);
  
  if (!success) {
    throw new Error('Invalid ShepLang code');
  }
  
  // Use appModel to generate React components
  const components = appModel.views.map(view => ({
    name: view.name,
    jsx: generateJSX(view),
    typescript: generateTS(view)
  }));
  
  return components;
}
```

### Static Analysis Tools
```typescript
import { parseShep } from '@goldensheepai/sheplang-language';

// Analyze code complexity
async function analyzeComplexity(code: string) {
  const { appModel } = await parseShep(code);
  
  return {
    entityCount: appModel.datas.length,
    viewCount: appModel.views.length,
    actionCount: appModel.actions.length,
    complexity: calculateComplexity(appModel)
  };
}
```

## 🏗️ Architecture

ShepLang uses a multi-phase compilation pipeline:

1. **Preprocessing**: Converts indentation-based syntax to braces
2. **Lexing & Parsing**: Langium parser generates AST
3. **Semantic Analysis**: Validates references and types
4. **Mapping**: Converts AST to structured AppModel
5. **Verification**: ShepVerify performs 4-phase validation

## 🔧 Advanced Usage

### Custom Error Handling
```typescript
import { parseShep, type Diagnostic } from '@goldensheepai/sheplang-language';

const result = await parseShep(code);

// Group errors by severity
const errors = result.diagnostics.filter(d => d.severity === 'error');
const warnings = result.diagnostics.filter(d => d.severity === 'warning');

// Format for display
errors.forEach(err => {
  console.error(`Error at line ${err.start.line}: ${err.message}`);
});
```

### Incremental Parsing
```typescript
import { parseShep } from '@goldensheepai/sheplang-language';

let cachedResult: ParsedResult | null = null;

async function updateCode(newCode: string) {
  // Parse incrementally (library handles caching internally)
  const result = await parseShep(newCode);
  
  if (result.success) {
    cachedResult = result;
  }
  
  return result;
}
```

## 📚 Related Packages

- **[@goldensheepai/sheplang-compiler](https://www.npmjs.com/package/@goldensheepai/sheplang-compiler)** - TypeScript/React code generator
- **[@goldensheepai/sheplang-cli](https://www.npmjs.com/package/@goldensheepai/sheplang-cli)** - Command-line interface
- **[@goldensheepai/sheplang-verifier](https://www.npmjs.com/package/@goldensheepai/sheplang-verifier)** - 4-phase verification engine

## 🤝 Contributing

We welcome contributions! This language is actively developed for AI-native code generation.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Language Specification

Visit our [Language Documentation](https://sheplang.dev/docs) for the complete language specification, including:

- Syntax reference
- Type system details
- Built-in operations
- Best practices
- Example applications

## 🐛 Known Issues & Roadmap

### Current Limitations
- GraphQL support in progress
- WebSocket syntax under development
- Authentication patterns being standardized

### Upcoming Features
- Enhanced type inference
- Module system
- Package imports
- Macro system for code generation

## 📄 License

MIT License - see [LICENSE](https://github.com/Radix-Obsidian/Sheplang-BobaScript/blob/main/LICENSE) for details

## 🔗 Links

- **Website**: [sheplang.dev](https://sheplang.dev)
- **Playground**: [sheplang.dev/playground](https://sheplang.dev/playground)
- **Documentation**: [sheplang.dev/docs](https://sheplang.dev/docs)
- **VS Code Extension**: [Download](https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang)
- **GitHub**: [Radix-Obsidian/Sheplang-BobaScript](https://github.com/Radix-Obsidian/Sheplang-BobaScript)
- **Discord**: [Join our community](https://discord.gg/sheplang)

## 💡 Why ShepLang?

Traditional programming languages were designed for humans to write. ShepLang is designed for **both** AI to generate **and** humans to read.

### For AI Developers
- Deterministic grammar eliminates ambiguity
- Minimal keyword set reduces hallucinations
- Type-safe by default catches errors early
- Full-stack in one language simplifies context

### For Founders
- Ship faster with AI-generated code
- Maintain readability and control
- Scale without technical debt
- Deploy with confidence

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://goldensheep.ai">Golden Sheep AI</a></strong>
</p>

<p align="center">
  <em>The first language designed for the AI era</em>
</p>
