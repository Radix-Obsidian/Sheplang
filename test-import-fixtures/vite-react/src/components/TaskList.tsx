interface Task {
  id: number
  title: string
  completed: boolean
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="task-list">
      {tasks.map(task => (
        <div key={task.id} className="task-item">
          <span>{task.title}</span>
          <span>{task.completed ? '✓' : '○'}</span>
        </div>
      ))}
    </div>
  )
}
