import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/tasks - Retrieve all tasks
 */
export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return Response.json(tasks)
}

/**
 * POST /api/tasks - Create a new task
 */
export async function POST(request: Request) {
  const body = await request.json()
  const { title, priority = 'medium' } = body
  
  const task = await prisma.task.create({
    data: {
      title,
      priority,
      completed: false
    }
  })
  
  return Response.json(task, { status: 201 })
}

// Re-export for server component usage (e.g., page.tsx)
export async function getTasks() {
  return prisma.task.findMany({
    orderBy: { createdAt: 'desc' }
  })
}
