"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.newProjectCommand = newProjectCommand;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const TEMPLATES = [
    {
        id: 'hello-world',
        name: '01 - Hello World',
        description: 'Simple "Hello World" app',
        files: {
            frontend: `app HelloWorld {
  model Message {
    text: string
  }

  view Home:
    show "Hello, World! 👋"
    show "Welcome to ShepLang"
    button "Click Me" -> SayHi

  action SayHi:
    show "Hi there!"
}`
        }
    },
    {
        id: 'counter',
        name: '02 - Counter',
        description: 'Simple counter with increment/decrement',
        files: {
            frontend: `app Counter {
  model Count {
    value: number = 0
  }

  view Home:
    show "Counter: " + Count.value
    button "+" -> Increment
    button "-" -> Decrement
    button "Reset" -> Reset

  action Increment:
    set Count.value = Count.value + 1

  action Decrement:
    set Count.value = Count.value - 1

  action Reset:
    set Count.value = 0
}`
        }
    },
    {
        id: 'todo-local',
        name: '03 - Todo List (Local)',
        description: 'Todo app with local state',
        files: {
            frontend: `app TodoApp {
  model Todo {
    text: string
    done: bool = false
  }

  view Home:
    show "My Todo List"
    list Todo
    button "Add Todo" -> AddTodo

  action AddTodo:
    add Todo { text: "New task", done: false }
}`
        }
    },
    {
        id: 'dog-reminders',
        name: '05 - Dog Reminders (Full-Stack)',
        description: 'Complete app with frontend + backend',
        files: {
            frontend: `app DogReminders {
  model Reminder {
    id: id
    text: string
    time: datetime
    done: bool = false
  }

  view Home:
    show "Dog Care Reminders 🐕"
    list Reminder
    button "Add Reminder" -> AddReminder

  action InitApp:
    load GET "/reminders"

  when InitApp -> LoadReminders

  action LoadReminders:
    call GET "/reminders"

  action AddReminder:
    call POST "/reminders" {
      text: "Walk the dog",
      time: now()
    }
}`,
            backend: `app DogReminders {
  model Reminder {
    id: id
    text: string
    time: datetime
    done: bool = false
  }

  endpoint GET "/reminders" -> [Reminder] {
    return db.Reminder.findAll()
  }

  endpoint POST "/reminders" (text: string, time: datetime) -> Reminder {
    let reminder = db.Reminder.create({ text, time })
    return reminder
  }

  endpoint PUT "/reminders/:id" (id: id, done: bool) -> Reminder {
    let reminder = db.Reminder.update({ id }, { done })
    return reminder
  }

  job "mark-due-as-done" every 5 minutes {
    let due = db.Reminder.findAll()
    for reminder in due {
      if reminder.time < now() and not reminder.done {
        db.Reminder.update({ id: reminder.id }, { done: true })
      }
    }
  }
}`
        }
    }
];
async function newProjectCommand(context) {
    // Show quick pick with templates
    const selected = await vscode.window.showQuickPick(TEMPLATES.map(t => ({
        label: t.name,
        description: t.description,
        template: t
    })), {
        placeHolder: 'Select a project template'
    });
    if (!selected) {
        return;
    }
    const template = selected.template;
    // Ask for project folder
    const folders = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select Project Folder'
    });
    if (!folders || folders.length === 0) {
        return;
    }
    const projectFolder = folders[0].fsPath;
    const projectName = template.id;
    const projectPath = path.join(projectFolder, projectName);
    // Create project directory
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    // Create frontend file
    if (template.files.frontend) {
        const frontendPath = path.join(projectPath, `${projectName}.shep`);
        fs.writeFileSync(frontendPath, template.files.frontend);
    }
    // Create backend file if exists
    if (template.files.backend) {
        const backendPath = path.join(projectPath, `${projectName}.shepthon`);
        fs.writeFileSync(backendPath, template.files.backend);
    }
    // Create README
    const readmePath = path.join(projectPath, 'README.md');
    fs.writeFileSync(readmePath, generateReadme(template));
    // Open project
    const uri = vscode.Uri.file(projectPath);
    await vscode.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: false });
    vscode.window.showInformationMessage(`✨ Created ${template.name} project!`);
}
function generateReadme(template) {
    return `# ${template.name}

${template.description}

## Files

${template.files.frontend ? '- `${template.id}.shep` - Frontend (ShepLang)' : ''}
${template.files.backend ? '- `${template.id}.shepthon` - Backend (ShepThon)' : ''}

## Run

1. Open \`.shep\` file in VS Code
2. Click **Show Preview** button in editor title
3. ${template.files.backend ? 'Backend will start automatically' : 'Enjoy your app!'}

## Learn More

- [ShepLang Documentation](https://github.com/Radix-Obsidian/Sheplang-BobaScript)
- [Examples](https://github.com/Radix-Obsidian/Sheplang-BobaScript/tree/main/examples)
`;
}
//# sourceMappingURL=newProject.js.map