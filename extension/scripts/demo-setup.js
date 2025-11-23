#!/usr/bin/env node

/**
 * Professional VS Code Extension Demo Setup
 * Creates demo environment and example files for recording
 */

const fs = require('fs');
const path = require('path');

console.log('🎬 Setting up ShepLang Demo Environment...');

// Create demo workspace directory
const demoDir = path.join(__dirname, '../demo-workspace');

if (fs.existsSync(demoDir)) {
  fs.rmSync(demoDir, { recursive: true, force: true });
}

fs.mkdirSync(demoDir, { recursive: true });

// Create demo ShepLang files
const demoFiles = [
  {
    name: '01-syntax-demo.shep',
    content: `// 🎨 ShepLang Syntax Highlighting Demo
app SyntaxDemo

data Task:
  fields:
    title: text
    status: pending/completed
    priority: high/medium/low

view TaskList:
  title "📋 Task Management"
  list Task
  button "➕ Add Task" -> CreateTask

action CreateTask(title):
  add Task with title, status = pending
  show TaskList

// Beautiful syntax highlighting in VS Code!`
  },
  {
    name: '02-fullstack-demo.shep',
    content: `// 🚀 Full-Stack Application in ShepLang
app TaskManager

data Task:
  fields:
    title: text
    description: text
    status: pending/in_progress/completed
    priority: high/medium/low
    assignedTo: text

view Dashboard:
  title "📊 Task Dashboard"
  list Task where status != completed
  button "New Task" -> CreateTask
  button "All Tasks" -> TaskList

view CreateTask:
  form:
    input title "Task Title"
    input description "Description"
    select priority from [high, medium, low]
    input assignedTo "Assign To"
  button "Create" -> SubmitTask
  button "Cancel" -> Dashboard

// Full-stack actions with API calls
action SubmitTask(title, description, priority, assignedTo):
  call POST "/api/tasks" with title, description, priority, assignedTo
  load GET "/api/tasks" into tasks
  show Dashboard

action CompleteTask(taskId):
  call PUT "/api/tasks/:id" with status = completed
  load GET "/api/tasks" into tasks
  show Dashboard

// Background automation
job DailyReport:
  schedule every day at 09:00
  call GET "/api/tasks/overdue" into tasks
  ~ "Send email report"

// Generates React + Express + Prisma automatically!`
  },
  {
    name: '03-ycombinator-demo.shep',
    content: `// 🎯 YC Demo - The Power of ShepLang
app YCDemo

data Startup:
  fields:
    name: text
    pitch: text
    status: idea/mvp/launched
    funding: number

data Investor:
  fields:
    name: text
    email: text
    firm: text

view PitchDeck:
  title "🚀 Startup Tracker"
  list Startup where status != launched
  button "Add Startup" -> AddStartup
  button "View Investors" -> InvestorList

view AddStartup:
  form:
    input name "Startup Name"
    input pitch "One-Liner Pitch"
    select status from [idea, mvp]
    input funding "Target Funding"
  button "Save" -> SaveStartup
  button "Cancel" -> PitchDeck

// Full-stack actions
action SaveStartup(name, pitch, funding):
  call POST "/api/startups" with name, pitch, funding
  load GET "/api/startups" into startups
  show PitchDeck

action LaunchStartup(startupId):
  call PUT "/api/startups/:id" with status = launched
  load GET "/api/startups" into startups
  show PitchDeck

// AI-powered matching
job InvestorMatching:
  schedule every week on monday
  call GET "/api/startups/mvp" into mvps
  call GET "/api/investors" into investors
  ~ "AI matches startups with investors"

// This is how you build unicorn startups in ShepLang!`
  }
];

// Write demo files
demoFiles.forEach(file => {
  const filePath = path.join(demoDir, file.name);
  fs.writeFileSync(filePath, file.content);
  console.log(`✅ Created: ${file.name}`);
});

// Create VS Code workspace file
const workspaceFile = {
  folders: [
    {
      path: '.'
    }
  ],
  settings: {
    'sheplang.enable': true,
    'editor.fontSize': 16,
    'editor.fontFamily': 'Fira Code, Consolas, monospace',
    'editor.wordWrap': 'on',
    'editor.minimap.enabled': false,
    'workbench.colorTheme': 'Default Dark+',
    'workbench.editor.showTabs': false
  }
};

fs.writeFileSync(
  path.join(demoDir, 'sheplang-demo.code-workspace'),
  JSON.stringify(workspaceFile, null, 2)
);

console.log('✅ Created: sheplang-demo.code-workspace');

// Create demo recording guide
const guide = `# 🎬 ShepLang Demo Recording Guide

## 📋 Demo Files Created

1. **01-syntax-demo.shep** - Basic syntax highlighting showcase
2. **02-fullstack-demo.shep** - Complete full-stack application
3. **03-ycombinator-demo.shep** - YC-focused startup tracker

## 🎥 Recording Setup

### 1. Open Demo Workspace
\`\`\`bash
# Open VS Code with extension and demo workspace
code --extensionDevelopmentPath=. demo-workspace/sheplang-demo.code-workspace
\`\`\`

### 2. Configure VS Code for Recording
- Set theme to "Default Dark+"
- Disable minimap (View → Appearance → Minimap)
- Hide activity bar (View → Appearance → Activity Bar)
- Set font size to 16px
- Enable word wrap

### 3. Recording Software Options
- **OBS Studio** (Free, professional)
- **ScreenToGif** (Windows, direct GIF)
- **LICEcap** (Cross-platform, simple)
- **CleanShot X** (Mac, polished)

### 4. Recording Settings
- **Resolution**: 1920x1080 or 1440x900
- **Frame rate**: 30fps (smooth), 15fps (smaller file)
- **Quality**: High for YouTube, Medium for web
- **Format**: MP4 (video) → Convert to GIF

## 🎯 Demo Scripts

### Demo 1: Syntax Highlighting (15 seconds)
1. Open 01-syntax-demo.shep
2. Show beautiful syntax colors
3. Highlight keywords: app, data, view, action
4. Show typed fields and strings

### Demo 2: Full-Stack Power (20 seconds)
1. Open 02-fullstack-demo.shep
2. Scroll through complete application
3. Point out API calls: call POST, load GET
4. Show background job: job DailyReport
5. End with "Generates React + Express + Prisma!"

### Demo 3: YC Pitch (25 seconds)
1. Open 03-ycombinator-demo.shep
2. Show startup-focused data models
3. Highlight investor matching feature
4. Show complete workflow in ~30 lines
5. End with "This is how you build unicorns!"

## 🚀 Post-Production

### Convert MP4 to GIF
\`\`\`bash
# Using ffmpeg
ffmpeg -i demo.mp4 -vf "fps=15,scale=1200:-1:flags=lanczos" -c:v gif demo.gif

# Using gifsicle (optimize)
gifsicle --optimize=3 --delay=33 demo.gif -o demo-optimized.gif
\`\`\`

### Add Text Overlays
- Use DaVinci Resolve (free) or CapCut
- Add "ShepLang" branding
- Add key feature callouts
- Include URL: sheplang.dev

## 💡 Pro Tips

- **Practice first**: Run through each demo 3 times
- **Smooth scrolling**: Use mouse wheel, not scroll bar
- **Highlight features**: Use mouse cursor to point
- **Keep it clean**: Close all other VS Code tabs
- **Audio optional**: Add music or voiceover later

## 📊 Distribution

- **Twitter/X**: All 3 GIFs as thread
- **LinkedIn**: One per day for 3 days
- **Product Hunt**: Feature all 3
- **YC Demo**: Use Demo 3 as main showcase

---

*Ready to create professional ShepLang demos! 🚀*
`;

fs.writeFileSync(path.join(demoDir, 'README.md'), guide);

console.log('✅ Created: README.md with recording guide');
console.log('');
console.log('🎉 Demo setup complete!');
console.log('');
console.log('Next steps:');
console.log('1. Open VS Code with: code --extensionDevelopmentPath=. demo-workspace/sheplang-demo.code-workspace');
console.log('2. Start recording with OBS/ScreenToGif');
console.log('3. Open each demo file and showcase features');
console.log('4. Convert to GIF and share! 🚀');
