import type { FastifyInstance } from 'fastify'
import { skillToggleSchema, type SkillSettingsSnapshot, type SkillToggle } from '../shared/skill-settings.js'

export interface SkillSettingsTarget {
  snapshot(): Promise<SkillSettingsSnapshot>
  update(input: SkillToggle): Promise<SkillSettingsSnapshot>
}

export function registerSkillSettingsRoutes(
  app: FastifyInstance,
  route: string,
  target: (computerId?: string) => Promise<SkillSettingsTarget> | SkillSettingsTarget,
  nodeOnly = false,
) {
  const options = {
    onRequest: async (request: { headers: { origin?: string } }, reply: { code(code: number): { send(body: unknown): unknown }; header(name: string, value: string): unknown }) => {
      reply.header('cache-control', 'no-store')
      if (nodeOnly && request.headers.origin !== undefined) return reply.code(403).send({ error: 'Browser origins cannot access node skill settings.' })
    },
  }
  app.get<{ Params: { computerId?: string } }>(route, options, async (request) =>
    (await target(request.params.computerId)).snapshot())
  app.patch<{ Params: { computerId?: string } }>(route, options, async (request) => {
    const input = skillToggleSchema.parse(request.body)
    return (await target(request.params.computerId)).update(input)
  })
}
