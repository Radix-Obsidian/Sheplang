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
  
  return (
    <div className="space-y-4">
      {taskList.map(task => (
        <div key={task.id} className="border p-4 rounded">
          <h3 className="font-semibold">{task.title}</h3>
          <p>Status: {task.completed ? 'Done' : 'Pending'}</p>
          <p>Priority: {task.priority}</p>
        </div>
      ))}
    </div>
  )
}
