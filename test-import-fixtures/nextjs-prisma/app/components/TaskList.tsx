'use client'

import { useState } from 'react'

interface Task {
  id: number
  title: string
  completed: boolean
  priority: string
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const [taskList, setTaskList] = useState(tasks)
  const [newTitle, setNewTitle] = useState('')

  async function handleAddTask() {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, priority: 'medium' })
    })
    const task = await response.json()
    setTaskList([task, ...taskList])
    setNewTitle('')
  }

  async function handleToggleComplete(id: number, completed: boolean) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed })
    })
    setTaskList(taskList.map(t => 
      t.id === id ? { ...t, completed: !completed } : t
    ))
  }

  async function handleDeleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, {
      method: 'DELETE'
    })
    setTaskList(taskList.filter(t => t.id !== id))
  }

  async function handleRefresh() {
    const response = await fetch('/api/tasks')
    const tasks = await response.json()
    setTaskList(tasks)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task title"
          className="border p-2 rounded flex-1"
        />
        <button onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Task
        </button>
        <button onClick={handleRefresh} className="bg-gray-500 text-white px-4 py-2 rounded">
          Refresh
        </button>
      </div>
      
      {taskList.map(task => (
        <div key={task.id} className="border p-4 rounded flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{task.title}</h3>
            <p>Status: {task.completed ? 'Done' : 'Pending'}</p>
            <p>Priority: {task.priority}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleToggleComplete(task.id, task.completed)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              {task.completed ? 'Undo' : 'Complete'}
            </button>
            <button 
              onClick={() => handleDeleteTask(task.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
