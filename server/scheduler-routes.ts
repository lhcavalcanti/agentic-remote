import type { FastifyInstance } from 'fastify'
import {
  scheduleArchivedSchema, scheduleCreateSchema, scheduleEnabledSchema, scheduleIdParamsSchema,
  scheduleListSchema, scheduleRevisionSchema, scheduleRunListSchema, scheduleUpdateSchema, scheduleActionSchema,
} from '../shared/schedules.js'
import type { SchedulerDispatcher } from './scheduler-dispatcher.js'

/** Inherits the hub's canonical Host/Origin hook, including encoded API paths. */
export async function registerSchedulerRoutes(
  app: FastifyInstance, scheduler: SchedulerDispatcher, allowAllForOracle: () => boolean = () => false,
): Promise<void> {
  app.get('/api/schedules/proposals', async (_request, reply) => {
    reply.header('cache-control', 'no-store')
    await scheduler.store.expireProposals()
    return { proposals: scheduler.store.proposals().filter((proposal) => proposal.status === 'pending') }
  })
  app.post('/api/schedules/proposals/:id/approve', async (request) => {
    scheduleActionSchema.parse(request.body ?? {})
    const id = scheduleIdParamsSchema.parse(request.params).id
    const proposal = await scheduler.store.approveProposal(id, allowAllForOracle())
    if (proposal.operation === 'run-now' && ['approved', 'applied'].includes(proposal.status)) {
      try { await scheduler.runNow(proposal.scheduleId, proposal.baseRevision, proposal.id) }
      catch (error) {
        await scheduler.store.failProposal(id, (error as Error).message)
        throw error
      }
    }
    return { proposal: scheduler.store.proposal(id) }
  })
  app.post('/api/schedules/proposals/:id/reject', async (request) => {
    scheduleActionSchema.parse(request.body ?? {})
    return { proposal: await scheduler.store.rejectProposal(scheduleIdParamsSchema.parse(request.params).id) }
  })
  app.get('/api/schedules', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    return { schedules: scheduler.store.list(scheduleListSchema.parse(request.query).archived) }
  })
  app.get('/api/schedules/runs', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    return scheduler.store.listRuns(scheduleRunListSchema.parse(request.query))
  })
  app.get('/api/schedules/runs/:id', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    return { run: scheduler.store.getRun(scheduleIdParamsSchema.parse(request.params).id) }
  })
  app.post('/api/schedules/runs/:id/stop', async (request) => {
    scheduleActionSchema.parse(request.body ?? {})
    return { run: await scheduler.stopRun(scheduleIdParamsSchema.parse(request.params).id) }
  })
  app.get('/api/schedules/:id', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    return { schedule: scheduler.store.get(scheduleIdParamsSchema.parse(request.params).id) }
  })
  app.post('/api/schedules', async (request, reply) => {
    const schedule = await scheduler.store.create(scheduleCreateSchema.parse(request.body))
    return reply.code(201).send({ schedule })
  })
  app.patch('/api/schedules/:id', async (request) => ({
    schedule: await scheduler.store.update(scheduleIdParamsSchema.parse(request.params).id, scheduleUpdateSchema.parse(request.body)),
  }))
  app.delete('/api/schedules/:id', async (request) => {
    await scheduler.store.delete(scheduleIdParamsSchema.parse(request.params).id, scheduleRevisionSchema.parse(request.body).revision)
    return { ok: true }
  })
  app.post('/api/schedules/:id/enabled', async (request) => {
    const input = scheduleEnabledSchema.parse(request.body)
    return { schedule: await scheduler.store.update(scheduleIdParamsSchema.parse(request.params).id, input) }
  })
  app.post('/api/schedules/:id/archived', async (request) => {
    const { revision, archived } = scheduleArchivedSchema.parse(request.body)
    return { schedule: await scheduler.store.setArchived(scheduleIdParamsSchema.parse(request.params).id, revision, archived) }
  })
  app.post('/api/schedules/:id/run', async (request, reply) => {
    scheduleActionSchema.parse(request.body ?? {})
    const run = await scheduler.runNow(scheduleIdParamsSchema.parse(request.params).id)
    return reply.code(202).send({ run })
  })
  app.get('/api/schedules/:id/runs', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    return scheduler.store.listRuns(scheduleRunListSchema.parse(request.query), scheduleIdParamsSchema.parse(request.params).id)
  })
}
