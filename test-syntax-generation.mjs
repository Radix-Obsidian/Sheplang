// Test script for ShepLang syntax generation
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Directly load the module using manual object creation since we can't import directly
// We'll construct the interface as defined in the shepGenerator.ts file
const testModel = {
  appName: "TestApp",
  projectRoot: "./test",
  entities: [
    {
      name: "User",
      filePath: "./models/User.ts",
      fields: [
        { name: "id", type: "number", required: true },
        { name: "name", type: "text", required: true },
        { name: "email", type: "text", required: true }
      ],
      source: "prisma"
    }
  ],
  views: [
    {
      name: "Dashboard",
      filePath: "./views/Dashboard.tsx",
      elements: [],
      widgets: [
        { kind: "list", entityName: "User" },
        { kind: "button", label: "Add User", actionName: "CreateUser" }
      ]
    }
  ],
  actions: [
    {
      name: "CreateUser",
      filePath: "./actions/CreateUser.ts",
      params: [],
      parameters: ["name", "email"],
      apiCalls: [
        { method: "POST", path: "/api/users", url: "/api/users" }
      ],
      source: "code"
    }
  ],
  todos: ["Implement user authentication"]
};

// Since we can't import the TypeScript directly, let's try to run manually through the VS Code extension
// Let's write out our test model and create a simple test script
const testModelJson = JSON.stringify(testModel, null, 2);
fs.writeFileSync(path.join(__dirname, 'test-model.json'), testModelJson);

// Show instructions for manual testing
console.log(`\nTest model JSON written to test-model.json\n`);
console.log(`To test the updated ShepLang syntax generation:`);
console.log(`1. Open VS Code with the extension loaded`);
console.log(`2. Use the "Import from Project" command to import a React project`);
console.log(`3. Check if the generated .shep file uses the correct brace syntax`);
console.log(`\nAlternatively, you can create a test project with this structure:`);
console.log(`- Create a basic React/Next.js project`);
console.log(`- Add a simple component and API route`);
console.log(`- Import it using the VS Code extension`);
console.log(`- Verify the output uses braces instead of colons/indentation`);
