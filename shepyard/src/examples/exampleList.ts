/**
 * ShepYard Examples Registry
 * 
 * Static registry of example .shep apps with inline source.
 * Later this will load from the file system, but for Phase 1
 * we keep it simple and hard-coded.
 */

export interface ShepExample {
  id: string;
  name: string;
  description: string;
  filePath: string; // relative path in /examples
  source: string;   // inline ShepLang source code
}

export const SHEP_EXAMPLES: ShepExample[] = [
  {
    id: 'todo',
    name: 'Todo List',
    description: 'Simple task manager with add/update actions',
    filePath: 'examples/todo.shep',
    source: `app MyTodos

data Todo:
  fields:
    title: text
    done: yes/no
  rules:
    - "user can update own items"

view Dashboard:
  list Todo
  button "Add Task" -> CreateTodo

action CreateTodo(title):
  add Todo with title, done=false
  show Dashboard
`,
  },
  {
    id: 'dog-reminder',
    name: 'Dog Care Reminder',
    description: 'Track feeding times and walks for your furry friend',
    filePath: 'examples/dog-reminder.shep',
    source: `app DogCare

data Dog:
  fields:
    name: text
    lastFed: datetime
    lastWalk: datetime

data Activity:
  fields:
    dogName: text
    activityType: text
    timestamp: datetime

view Home:
  list Dog
  button "Add Dog" -> AddDog

view DogDetail(dog):
  show dog.name
  show "Last fed: " + dog.lastFed
  show "Last walk: " + dog.lastWalk
  button "Feed Now" -> FeedDog(dog)
  button "Walk Now" -> WalkDog(dog)
  list Activity where dogName = dog.name

action AddDog(name):
  add Dog with name, lastFed=now, lastWalk=now
  show Home

action FeedDog(dog):
  update dog set lastFed=now
  add Activity with dogName=dog.name, activityType="fed", timestamp=now
  show DogDetail(dog)

action WalkDog(dog):
  update dog set lastWalk=now
  add Activity with dogName=dog.name, activityType="walk", timestamp=now
  show DogDetail(dog)
`,
  },
  {
    id: 'multi-screen',
    name: 'Multi-Screen Navigation',
    description: 'Demonstrates navigation between multiple views',
    filePath: 'examples/multi-screen.shep',
    source: `app Navigator

data Page:
  fields:
    title: text
    content: text
    visits: number

view Home:
  show "Welcome to Navigator"
  button "Go to About" -> ShowAbout
  button "Go to Settings" -> ShowSettings
  list Page

view About:
  show "About This App"
  show "Built with ShepLang"
  button "Back to Home" -> ShowHome

view Settings:
  show "Settings"
  button "Reset All" -> ResetPages
  button "Back to Home" -> ShowHome

action ShowHome:
  show Home

action ShowAbout:
  find Page where title="About"
  if found:
    update found set visits=visits+1
  else:
    add Page with title="About", content="About page", visits=1
  show About

action ShowSettings:
  show Settings

action ResetPages:
  delete all Page
  show Home
`,
  },
];
