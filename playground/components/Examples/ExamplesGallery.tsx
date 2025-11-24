import React, { useState, useEffect } from 'react';

interface Example {
  id: string;
  title: string;
  description: string;
  code: string;
  category: string;
}

interface ExamplesGalleryProps {
  onSelectExample: (code: string) => void;
}

const ExamplesGallery: React.FC<ExamplesGalleryProps> = ({ onSelectExample }) => {
  const [examples, setExamples] = useState<Example[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load examples from the public/examples directory
    const loadExamples = async () => {
      try {
        // In a real implementation, we'd fetch this from the public directory
        // For now, we'll use hardcoded examples
        const examplesList: Example[] = [
          {
            id: 'hello-world',
            title: 'Hello World',
            description: 'Interactive app with dynamic messages - Try it!',
            code: `app HelloWorld

data Message:
  fields:
    text: text

view Dashboard:
  text "Welcome to ShepLang!"
  list Message
  input content as text
  button "Send Message" -> AddMessage(content)
  button "Clear All" -> ClearMessages

action AddMessage(content):
  add Message with text = content
  show Dashboard

action ClearMessages():
  clear Message
  show Dashboard`,
            category: 'beginner'
          },
          {
            id: 'todo-app',
            title: 'Todo App',
            description: 'Full CRUD todo app - Create, complete, delete tasks in real-time!',
            code: `app TodoApp

data Todo:
  fields:
    title: text
    done: yes/no

view Dashboard:
  text "My Todo List"
  list Todo
  input newTask as text
  button "Add Task" -> AddTodo(newTask)
  button "Clear Completed" -> ClearCompleted

action AddTodo(title):
  add Todo with title = title, done = false
  show Dashboard

action ToggleTodo(id):
  toggle Todo[id].done
  show Dashboard

action DeleteTodo(id):
  delete Todo[id]
  show Dashboard

action ClearCompleted():
  delete Todo where done = true
  show Dashboard`,
            category: 'intermediate'
          },
          {
            id: 'full-stack',
            title: 'Full-Stack App',
            description: 'API calls with backend integration',
            code: `app FullStackApp

data User:
  fields:
    name: text
    email: text

view Dashboard:
  list User
  button "Add User" -> ShowUserForm
  button "Refresh" -> LoadUsers

view UserForm:
  input name as text
  input email as text
  button "Save" -> CreateUser(name, email)
  button "Cancel" -> ShowDashboard

action CreateUser(name, email):
  call POST "/users" with name, email
  show Dashboard

action LoadUsers():
  load GET "/users" into users
  show Dashboard

action ShowUserForm():
  show UserForm

action ShowDashboard():
  show Dashboard`,
            category: 'advanced'
          },
          {
            id: 'e-commerce-store',
            title: 'E-Commerce Store',
            description: '🛍️ Full-stack e-commerce with products, cart & checkout (inspired by next-prisma-tailwind-ecommerce)\n\n📦 **Original Stack:** Next.js 14 + Prisma + PostgreSQL + Tailwind + shadcn/ui + TypeScript + 300+ files\n✨ **ShepLang:** 50 lines → Complete e-commerce platform',
            code: `app ECommerceStore

data Product:
  fields:
    name: text
    price: number
    stock: number
    image: text

data CartItem:
  fields:
    productId: number
    quantity: number
    total: number

view Dashboard:
  text "🛍️ Product Catalog"
  list Product
  button "View Cart" -> ShowCart
  button "Admin Panel" -> ShowAdmin

view Cart:
  text "🛒 Shopping Cart"
  list CartItem
  button "Checkout" -> ProcessCheckout
  button "Back to Shop" -> ShowDashboard

view Admin:
  text "📊 Admin Panel - Add Product"
  input name as text
  input price as number
  input stock as number
  button "Add Product" -> AddProduct(name, price, stock)
  button "Back to Shop" -> ShowDashboard

action AddProduct(name, price, stock):
  add Product with name = name, price = price, stock = stock
  show Admin

action AddToCart(productId, quantity):
  add CartItem with productId = productId, quantity = quantity
  show Cart

action ProcessCheckout():
  clear CartItem
  show Dashboard

action ShowCart():
  show Cart

action ShowAdmin():
  show Admin

action ShowDashboard():
  show Dashboard`,
            category: 'github'
          },
          {
            id: 'task-tracker',
            title: 'Task Tracker',
            description: '📝 Project task management with priorities & status (inspired by TaskTrackr-NextJs13)\n\n📦 **Original Stack:** Next.js 13 + React + MongoDB + Express + 200+ files\n✨ **ShepLang:** 40 lines → Full task management system',
            code: `app TaskTracker

data Task:
  fields:
    title: text
    priority: text
    status: text
    assignee: text

view Dashboard:
  text "📝 Task Management Board"
  list Task
  button "New Task" -> ShowTaskForm
  button "Filter High Priority" -> FilterHighPriority

view TaskForm:
  text "➕ Create New Task"
  input title as text
  input assignee as text
  button "High Priority" -> CreateTask(title, assignee, "High", "Todo")
  button "Normal Priority" -> CreateTask(title, assignee, "Normal", "Todo")
  button "Cancel" -> ShowDashboard

action CreateTask(title, assignee, priority, status):
  add Task with title = title, assignee = assignee, priority = priority, status = status
  show Dashboard

action UpdateTaskStatus(id, status):
  toggle Task[id].status
  show Dashboard

action DeleteTask(id):
  delete Task[id]
  show Dashboard

action FilterHighPriority():
  show Dashboard

action ShowTaskForm():
  show TaskForm

action ShowDashboard():
  show Dashboard`,
            category: 'github'
          },
          {
            id: 'cms-blog',
            title: 'CMS Blog Platform',
            description: '📰 Content management with Builder.io-style visual editing capabilities\n\n📦 **Original Stack:** Builder.io CMS + Next.js + React + API Routes + 150+ files\n✨ **ShepLang:** 55 lines → Complete CMS with publish/draft workflow',
            code: `app CMSBlog

data Post:
  fields:
    title: text
    content: text
    author: text
    published: yes/no

data Category:
  fields:
    name: text
    slug: text

view Dashboard:
  text "📰 CMS Dashboard"
  list Post
  button "New Post" -> ShowPostEditor
  button "Manage Categories" -> ShowCategories

view PostEditor:
  text "✍️ Post Editor"
  input title as text
  input author as text
  input content as text
  button "Publish" -> PublishPost(title, author, content)
  button "Save Draft" -> SaveDraft(title, author, content)
  button "Cancel" -> ShowDashboard

view Categories:
  text "🏷️ Category Management"
  list Category
  input name as text
  input slug as text
  button "Add Category" -> AddCategory(name, slug)
  button "Back" -> ShowDashboard

action PublishPost(title, author, content):
  add Post with title = title, author = author, content = content, published = true
  show Dashboard

action SaveDraft(title, author, content):
  add Post with title = title, author = author, content = content, published = false
  show Dashboard

action AddCategory(name, slug):
  add Category with name = name, slug = slug
  show Categories

action DeletePost(id):
  delete Post[id]
  show Dashboard

action TogglePublish(id):
  toggle Post[id].published
  show Dashboard

action ShowPostEditor():
  show PostEditor

action ShowCategories():
  show Categories

action ShowDashboard():
  show Dashboard`,
            category: 'github'
          }
        ];
        
        setExamples(examplesList);
        setIsLoading(false);
      } catch (error: unknown) {
        console.error('Failed to load examples:', error instanceof Error ? error.message : String(error));
        setIsLoading(false);
      }
    };
    
    loadExamples();
  }, []);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(examples.map(ex => ex.category)))];

  // Filter examples by category
  const filteredExamples = selectedCategory === 'all'
    ? examples
    : examples.filter(ex => ex.category === selectedCategory);

  const handleSelectExample = (example: Example) => {
    // Ask for confirmation if there's code in the editor
    const currentCode = localStorage.getItem('sheplang-code');
    if (currentCode && currentCode !== example.code) {
      if (window.confirm('Load this example? Your current code will be replaced.')) {
        onSelectExample(example.code);
      }
    } else {
      onSelectExample(example.code);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading examples...</div>;
  }

  return (
    <div className="examples-gallery p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Examples</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Choose a template to get started</p>
      </div>
      
      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExamples.map(example => (
          <div 
            key={example.id}
            className="example-card group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 hover:-translate-y-1"
            onClick={() => handleSelectExample(example)}
          >
            {/* Category Badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {example.category}
              </span>
            </div>
            
            {/* Icon */}
            <div className="mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-500">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            
            {/* Content */}
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
              {example.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {example.description}
            </p>
            
            {/* Hover Indicator */}
            <div className="mt-4 flex items-center text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Load example</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamplesGallery;
