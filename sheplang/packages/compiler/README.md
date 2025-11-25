# @goldensheepai/sheplang-compiler

> The AI-native compiler that transforms ShepLang into production-ready code

ShepLang Compiler is the code generation engine that converts ShepLang source code into various target outputs including React, TypeScript, API routes, and more. Built for AI generation and human readability.

## 🌟 Features

- **Multi-Target Generation**: React components, TypeScript models, API endpoints
- **Template-Based**: Extensible Handlebars templates for customization
- **Type-Safe**: Full TypeScript support with generated definitions
- **AI-Optimized**: Designed for AI code generation workflows
- **Production Ready**: Generates clean, maintainable code

## 📦 Installation

```bash
npm install @goldensheepai/sheplang-compiler
```

## 🚀 Quick Start

```typescript
import { ShepLangCompiler } from '@goldensheepai/sheplang-compiler';
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

// Parse ShepLang code
const { appModel } = await parseShep(code);

// Initialize compiler
const compiler = new ShepLangCompiler();

// Generate React components
const reactCode = await compiler.generateReact(appModel);

// Generate TypeScript models
const typescriptCode = await compiler.generateTypeScript(appModel);

// Generate API routes
const apiCode = await compiler.generateAPI(appModel);

console.log('Generated React:', reactCode);
console.log('Generated TypeScript:', typescriptCode);
console.log('Generated API:', apiCode);
```

## 📖 API Reference

### `ShepLangCompiler`

Main compiler class for transforming ShepLang AppModel into various target outputs.

#### Constructor
```typescript
const compiler = new ShepLangCompiler(options?: CompilerOptions);
```

#### Methods

##### `generateReact(appModel: AppModel): Promise<string>`
Generate React components from ShepLang AppModel.

**Parameters:**
- `appModel`: Parsed ShepLang application model

**Returns:** Generated React component code

##### `generateTypeScript(appModel: AppModel): Promise<string>`
Generate TypeScript interfaces and models.

**Parameters:**
- `appModel`: Parsed ShepLang application model

**Returns:** Generated TypeScript code

##### `generateAPI(appModel: AppModel): Promise<string>`
Generate Express.js API routes.

**Parameters:**
- `appModel`: Parsed ShepLang application model

**Returns:** Generated API endpoint code

##### `generateAll(appModel: AppModel): Promise<GeneratedFiles>`
Generate all target outputs.

**Parameters:**
- `appModel`: Parsed ShepLang application model

**Returns:** Object containing all generated files

```typescript
interface GeneratedFiles {
  react: string;
  typescript: string;
  api: string;
  routes: string;
  models: string;
  actions: string;
}
```

### `CompilerOptions`

Configuration options for the compiler.

```typescript
interface CompilerOptions {
  // Output formatting
  prettier?: boolean;
  indentSize?: number;
  
  // Feature flags
  generateTests?: boolean;
  generateDocs?: boolean;
  
  // Target frameworks
  reactVersion?: '17' | '18';
  typescriptVersion?: string;
  
  // Custom templates
  templateDir?: string;
}
```

## 🎯 Use Cases

### Code Generation Tools
```typescript
import { ShepLangCompiler } from '@goldensheepai/sheplang-compiler';

// Build a CLI tool for generating projects
async function generateProject(sheplangCode: string, outputPath: string) {
  const { appModel } = await parseShep(sheplangCode);
  const compiler = new ShepLangCompiler();
  
  const files = await compiler.generateAll(appModel);
  
  // Write generated files to disk
  await fs.writeFile(`${outputPath}/App.tsx`, files.react);
  await fs.writeFile(`${outputPath}/types.ts`, files.typescript);
  await fs.writeFile(`${outputPath}/api.ts`, files.api);
}
```

### IDE Integration
```typescript
// VS Code extension integration
const compiler = new ShepLangCompiler();

// Generate preview on file save
vscode.workspace.onDidSaveTextDocument(async (document) => {
  if (document.fileName.endsWith('.shep')) {
    const { appModel } = await parseShep(document.getText());
    const reactCode = await compiler.generateReact(appModel);
    updatePreview(reactCode);
  }
});
```

### Web Service
```typescript
// Express endpoint for code generation
app.post('/compile', async (req, res) => {
  try {
    const { code } = req.body;
    const { appModel } = await parseShep(code);
    const compiler = new ShepLangCompiler();
    const output = await compiler.generateAll(appModel);
    res.json(output);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 🏗️ Architecture

The compiler follows a pipeline architecture:

1. **Input**: ShepLang AppModel from parser
2. **Processing**: Handlebars template rendering
3. **Output**: Target language code (React, TypeScript, API)

### Template System

The compiler uses Handlebars templates for code generation:

```bash
templates/
├── react/
│   ├── component.hbs
│   ├── hooks.hbs
│   └── types.hbs
├── typescript/
│   ├── models.hbs
│   └── interfaces.hbs
└── api/
    ├── routes.hbs
    └── handlers.hbs
```

### Custom Templates

You can override default templates:

```typescript
const compiler = new ShepLangCompiler({
  templateDir: './my-custom-templates'
});
```

## 🔧 Advanced Usage

### Custom Output Formats
```typescript
// Extend compiler for custom outputs
class MyCustomCompiler extends ShepLangCompiler {
  async generateVue(appModel: AppModel): Promise<string> {
    // Custom Vue.js generation
    return this.renderTemplate('vue/component.hbs', appModel);
  }
}
```

### Error Handling
```typescript
try {
  const output = await compiler.generateReact(appModel);
} catch (error) {
  if (error instanceof CompilationError) {
    console.error('Compilation failed:', error.message);
    console.error('Location:', error.location);
  }
}
```

### Performance Optimization
```typescript
// Cache compiled templates
const compiler = new ShepLangCompiler();
await compiler.preloadTemplates();

// Batch compilation
const outputs = await Promise.all([
  compiler.generateReact(appModel1),
  compiler.generateReact(appModel2),
  compiler.generateReact(appModel3)
]);
```

## 📚 Related Packages

- **[@goldensheepai/sheplang-language](https://www.npmjs.com/package/@goldensheepai/sheplang-language)** - Parser and language server
- **[@goldensheepai/sheplang-cli](https://www.npmjs.com/package/@goldensheepai/sheplang-cli)** - Command-line interface
- **[@goldensheepai/sheplang-verifier](https://www.npmjs.com/package/@goldensheepai/sheplang-verifier)** - 4-phase verification engine

## 🧪 Testing

```bash
npm run test
```

Run the test suite to verify compiler functionality:

```bash
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 🤝 Contributing

We welcome contributions! This compiler is actively developed for AI-native code generation.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new functionality
4. Ensure all tests pass (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Adding New Templates

1. Create template file in `templates/[target]/`
2. Add generation method to compiler class
3. Add tests for new template
4. Update documentation

## 📝 Examples

### Basic Todo App
```typescript
const todoCode = `
app TodoApp {
  data Todo:
    fields:
      title: text
      completed: yes/no
  
  view Main:
    list Todo
    button "Add" -> AddTodo
}
`;

const { appModel } = await parseShep(todoCode);
const compiler = new ShepLangCompiler();
const reactComponent = await compiler.generateReact(appModel);
```

### E-commerce Store
```typescript
const storeCode = `
app Store {
  data Product:
    fields:
      name: text
      price: number
      inStock: yes/no
  
  data Cart:
    fields:
      items: Product[]
      total: number
  
  view Products:
    list Product
    button "Add to Cart" -> AddToCart
}
`;

const output = await compiler.generateAll(appModel);
// Generates complete React store, TypeScript models, and API
```

## 🐛 Troubleshooting

### Common Issues

1. **Template Not Found**: Ensure template directory is correctly configured
2. **Compilation Errors**: Check ShepLang syntax with the language package
3. **Type Errors**: Verify TypeScript configuration in generated code

### Debug Mode

Enable debug logging:

```typescript
const compiler = new ShepLangCompiler({
  debug: true
});
```

## 📄 License

MIT License - see [LICENSE](https://github.com/Radix-Obsidian/Sheplang-BobaScript/blob/main/LICENSE) for details

## 🔗 Links

- **Website**: [sheplang.lovable.app](https://sheplang.lovable.app)
- **Documentation**: [sheplang.lovable.app/docs](https://sheplang.lovable.app/docs)
- **GitHub**: [Radix-Obsidian/Sheplang-BobaScript](https://github.com/Radix-Obsidian/Sheplang-BobaScript)
- **Discord**: [Join our community](https://discord.gg/sheplang)

## 📊 Performance

- **Compilation Speed**: ~10ms for average applications
- **Memory Usage**: <50MB for typical projects
- **Template Cache**: Improves performance by 80%
- **Parallel Processing**: Supports batch compilation

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://goldensheep.ai">Golden Sheep AI</a></strong>
</p>

<p align="center">
  <em>The compiler that turns AI ideas into production code</em>
</p>
