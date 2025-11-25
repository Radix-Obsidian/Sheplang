import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/tasks/:id - Retrieve a single task
 */
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params
  
  const task = await prisma.task.findUnique({
    where: { id: parseInt(id) }
  })
  
  if (!task) {
    return Response.json({ error: 'Task not found' }, { status: 404 })
  }
  
  return Response.json(task)
}

/**
 * PUT /api/tasks/:id - Update a task
 */
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params
  const body = await request.json()
  const { title, completed, priority } = body
  
  const task = await prisma.task.update({
    where: { id: parseInt(id) },
    data: {
      ...(title !== undefined && { title }),
      ...(completed !== undefined && { completed }),
      ...(priority !== undefined && { priority })
    }
  })
  
  return Response.json(task)
}

/**
 * DELETE /api/tasks/:id - Delete a task
 */
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params
  
  await prisma.task.delete({
    where: { id: parseInt(id) }
  })
  
  return new Response(null, { status: 204 })
}
