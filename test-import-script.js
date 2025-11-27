// Test script for ShepLang import process
// This directly tests the modified shepGenerator without going through VSCode

// Import necessary modules
const fs = require('fs');
const path = require('path');

// Import the model definitions
const { AppModel, Entity, View, Action, Field } = require('./extension/out/generators/shepGenerator');

// Import generation function
const { generateShepLangFiles } = require('./extension/out/generators/shepGenerator');

// Create a simple test model based on fixtures
const testModel = {
  appName: "TestApp",
  projectRoot: path.resolve("./test-import-fixtures/nextjs-prisma"),
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
    },
    {
      name: "Post",
      filePath: "./models/Post.ts",
      fields: [
        { name: "id", type: "number", required: true },
        { name: "title", type: "text", required: true },
        { name: "content", type: "text", required: true },
        { name: "userId", type: "number", required: true }
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
    },
    {
      name: "UserDetail",
      filePath: "./views/UserDetail.tsx",
      elements: [],
      widgets: [
        { kind: "list", entityName: "Post" },
        { kind: "button", label: "Add Post", actionName: "CreatePost" }
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
    },
    {
      name: "CreatePost",
      filePath: "./actions/CreatePost.ts",
      params: [],
      parameters: ["title", "content", "userId"],
      apiCalls: [
        { method: "POST", path: "/api/posts", url: "/api/posts" }
      ],
      source: "code"
    }
  ],
  todos: ["Implement user authentication"]
};

// Run test
try {
  const files = generateShepLangFiles(testModel);
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, 'test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write files to disk
  files.forEach(file => {
    const filePath = path.join(outputDir, file.fileName);
    fs.writeFileSync(filePath, file.content);
    console.log(`Generated: ${filePath}`);
  });
  
  // Print success message
  console.log('\nTest successful! Check the output files in test-output/ directory.');
} catch (error) {
  console.error('Error during test:', error);
}
