// Test script for ShepLang syntax generation
const { generateShepLangFiles } = require('./extension/src/generators/shepGenerator');

// Create a test AppModel
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

// Generate files
const files = generateShepLangFiles(testModel);

// Print results
console.log("Generated ShepLang files:");
files.forEach(file => {
  console.log(`\n--- ${file.fileName} ---`);
  console.log(file.content);
});
