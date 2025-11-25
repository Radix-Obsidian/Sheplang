import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import TaskList from './components/TaskList'

interface Task {
  id: number
  title: string
  completed: boolean
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Learn Vite', completed: false },
    { id: 2, title: 'Build React app', completed: false }
  ])

  return (
    <div className="App">
      <Header />
      <main>
        <h1>Vite React Fixture</h1>
        <TaskList tasks={tasks} />
      </main>
    </div>
  )
}

export default App
