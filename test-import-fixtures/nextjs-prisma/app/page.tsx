import { getTasks } from './api/tasks/route'
import TaskList from './components/TaskList'

export default async function HomePage() {
  const tasks = await getTasks()
  
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Next.js Prisma Fixture</h1>
      <TaskList tasks={tasks} />
    </main>
  )
}
