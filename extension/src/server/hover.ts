import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position, Hover, MarkupKind } from 'vscode-languageserver/node';

export function getHoverInfo(document: TextDocument, position: Position): Hover | null {
  const text = document.getText();
  const offset = document.offsetAt(position);
  const word = getWordAtPosition(document, position);

  if (!word) {
    return null;
  }

  const isShepLang = document.languageId === 'sheplang';
  const isShepThon = document.languageId === 'shepthon';

  if (isShepLang) {
    return getShepLangHover(word);
  } else if (isShepThon) {
    return getShepThonHover(word);
  }

  return null;
}

function getWordAtPosition(document: TextDocument, position: Position): string | null {
  const text = document.getText();
  const offset = document.offsetAt(position);
  
  let start = offset;
  let end = offset;

  // Move start back to beginning of word
  while (start > 0 && /[a-zA-Z0-9_]/.test(text[start - 1])) {
    start--;
  }

  // Move end forward to end of word
  while (end < text.length && /[a-zA-Z0-9_]/.test(text[end])) {
    end++;
  }

  if (start === end) {
    return null;
  }

  return text.substring(start, end);
}

function getShepLangHover(word: string): Hover | null {
  const documentation: Record<string, string> = {
    'app': '**app** - Define your application\n\n```sheplang\napp MyApp {\n  // models, views, actions\n}\n```',
    'model': '**model** - Define a data structure\n\n```sheplang\nmodel Todo {\n  text: string\n  done: bool\n}\n```',
    'view': '**view** - Create a UI screen\n\n```sheplang\nview Home:\n  show "Welcome"\n  button "Click" -> DoSomething\n```',
    'action': '**action** - Define user interactions\n\n```sheplang\naction AddTodo:\n  add Todo { text: input.text }\n  show TodoList\n```',
    'button': '**button** - Add an interactive button\n\n```sheplang\nbutton "Add Todo" -> AddTodo\n```',
    'list': '**list** - Display a collection of items\n\n```sheplang\nlist Todo\n```',
    'show': '**show** - Display text or navigate to view\n\n```sheplang\nshow "Hello"\nshow Dashboard\n```',
    'call': '**call** - Make API request to backend\n\n```sheplang\ncall POST "/todos" { text: "Buy milk" }\n```',
    'load': '**load** - Load data from backend\n\n```sheplang\nload GET "/todos"\n```',
    'when': '**when** - Trigger action on event\n\n```sheplang\nwhen InitApp -> LoadData\n```',
    'add': '**add** - Add item to state\n\n```sheplang\nadd Todo { text: "New item" }\n```',
    'set': '**set** - Update state value\n\n```sheplang\nset currentView = "Home"\n```'
  };

  const doc = documentation[word];
  if (!doc) {
    return null;
  }

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: doc
    }
  };
}

function getShepThonHover(word: string): Hover | null {
  const documentation: Record<string, string> = {
    'app': '**app** - Define your backend application\n\n```shepthon\napp MyAPI {\n  // models, endpoints, jobs\n}\n```',
    'model': '**model** - Define a database model\n\n```shepthon\nmodel User {\n  id: id\n  name: string\n  email: string\n}\n```',
    'endpoint': '**endpoint** - Define an API endpoint\n\n```shepthon\nendpoint GET "/users" -> [User] {\n  return db.User.findAll()\n}\n```',
    'job': '**job** - Schedule recurring tasks\n\n```shepthon\njob "cleanup" every 1 hour {\n  db.User.delete({ active: false })\n}\n```',
    'GET': '**GET** - HTTP GET method for reading data\n\n```shepthon\nendpoint GET "/users/:id" (id: id) -> User {\n  return db.User.find({ id })\n}\n```',
    'POST': '**POST** - HTTP POST method for creating data\n\n```shepthon\nendpoint POST "/users" (name: string, email: string) -> User {\n  return db.User.create({ name, email })\n}\n```',
    'PUT': '**PUT** - HTTP PUT method for updating data\n\n```shepthon\nendpoint PUT "/users/:id" (id: id, name: string) -> User {\n  return db.User.update({ id }, { name })\n}\n```',
    'DELETE': '**DELETE** - HTTP DELETE method for removing data\n\n```shepthon\nendpoint DELETE "/users/:id" (id: id) -> bool {\n  db.User.delete({ id })\n  return true\n}\n```',
    'db': '**db** - Database access object\n\nProvides methods:\n- `find()` - Find one record\n- `findAll()` - Find all records\n- `create()` - Create new record\n- `update()` - Update existing record\n- `delete()` - Delete record',
    'find': '**find** - Find one record matching criteria\n\n```shepthon\nlet user = db.User.find({ email: "test@example.com" })\n```',
    'findAll': '**findAll** - Find all records\n\n```shepthon\nlet users = db.User.findAll()\nlet activeUsers = db.User.findAll({ active: true })\n```',
    'create': '**create** - Create a new record\n\n```shepthon\nlet user = db.User.create({ name: "Alice", email: "alice@example.com" })\n```',
    'update': '**update** - Update existing record\n\n```shepthon\ndb.User.update({ id: userId }, { name: "Bob" })\n```',
    'delete': '**delete** - Delete record(s)\n\n```shepthon\ndb.User.delete({ id: userId })\n```',
    'every': '**every** - Schedule interval for jobs\n\n```shepthon\njob "task" every 5 minutes { ... }\njob "daily" every 1 day { ... }\n```'
  };

  const doc = documentation[word];
  if (!doc) {
    return null;
  }

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: doc
    }
  };
}
