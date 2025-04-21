import { z } from "zod"

export const indexSchema = z.object({
  files: z.object({
    filename: z.string(),
    resourceType: z.string(),
    id: z.string(),
    url: z.string().optional(),
    kind: z.string().optional(),
    type: z.string().optional(),
  }).array(),
})

export type index = z.infer<typeof indexSchema>

export const extensionSchema = z.lazy(() => z.object({
  url: z.string(),
}))

export const backboneElementSchema = z.object({
  modifierExtension: extensionSchema.array().optional(),
})

export const elementSchema = z.object({
  id: z.string().optional(),
  extension: extensionSchema.array().optional(),
})

export const elementDefinitionSchema = elementSchema.extend({
  path: z.string(),
  min: z.number().optional(),
  max: z.string().optional(),
  type: elementSchema.extend({
    code: z.string(),
  }).array().optional(),
})

export type elementDefinition = z.infer<typeof elementDefinitionSchema>

export const structureDefinitionSchema = z.object({
  type: z.string(),
  snapshot: backboneElementSchema.extend({
    element: elementDefinitionSchema.array().min(1),
  }).optional(),
  differential: backboneElementSchema.extend({
    element: elementDefinitionSchema.array().min(1),
  }).optional(),
})

export type structureDefinition = z.infer<typeof structureDefinitionSchema>
