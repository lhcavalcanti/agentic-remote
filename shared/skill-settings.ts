import { z } from 'zod'

export const SKILL_SETTINGS_CAPABILITY = 2
export const skillFrontmatterNameSchema = z.string().max(64).regex(/^[A-Za-z0-9][A-Za-z0-9._: -]*$/)
export const skillNameSchema = z.string().max(129).regex(/^[A-Za-z0-9][A-Za-z0-9._: -]*$/)
export const skillToggleSchema = z.object({
  name: z.string().min(1).max(129),
  enabled: z.boolean(),
  confirmed: z.literal(true),
  revision: z.string().regex(/^[a-f0-9]{64}$/),
}).strict()
export type SkillToggle = z.infer<typeof skillToggleSchema>
export const skillSettingsSchema = z.object({
  revision: z.string().regex(/^[a-f0-9]{64}$/),
  skills: z.array(z.object({
    name: skillNameSchema,
    description: z.string().max(4096),
    source: z.enum(['user', 'configured', 'repository', 'plugin', 'builtin']),
    location: z.string().max(4096),
    enabled: z.boolean(),
    manageable: z.boolean().optional(),
    reason: z.string().max(512).optional(),
  })).max(1000),
  warnings: z.array(z.string().max(256)).max(100),
})
export type SkillSettingsSnapshot = z.infer<typeof skillSettingsSchema>
