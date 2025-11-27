// Verify the ShepLang generator syntax fixes without running it
const fs = require('fs');
const path = require('path');

// Read the updated shepGenerator.ts file
const shepGeneratorPath = path.join(__dirname, 'extension', 'src', 'generators', 'shepGenerator.ts');
const code = fs.readFileSync(shepGeneratorPath, 'utf8');

// Define patterns to check for
const braceSyntaxPatterns = [
  // App declaration with braces
  /output \+= `app \$\{appModel\.appName\} \{\\n/,
  
  // Data block with braces
  /output \+= `data \$\{entity\.name\} \{\\n/,
  /output \+= `  fields: \{\\n/,
  /output \+= `  \}\\n/,
  /output \+= `\}\\n/,
  
  // View block with braces
  /output \+= `view \$\{view\.name\} \{\\n/,
  
  // Action block with braces
  /output \+= `action \$\{action\.name\}\(\$\{params\}\) \{\\n/
];

// Check for each pattern
console.log("Verifying ShepLang syntax fixes:");
console.log("--------------------------------");

let allPassed = true;

braceSyntaxPatterns.forEach((pattern, index) => {
  const match = pattern.test(code);
  console.log(`Pattern ${index + 1}: ${match ? '✅ FOUND' : '❌ NOT FOUND'}`);
  if (!match) {
    allPassed = false;
  }
});

console.log("\nVerification results:");
console.log("--------------------");
console.log(allPassed ? "✅ All brace syntax patterns found!" : "❌ Some patterns missing!");
console.log("\nCode generator should now produce syntax like:");
console.log(`
app TestApp {
  data User {
    fields: {
      id: number
      name: text
    }
  }
  
  view Dashboard {
    list User
    button "Add" -> CreateUser
  }
  
  action CreateUser(name, email) {
    call POST "/api/users" with name, email
    show Dashboard
  }
}
`);
