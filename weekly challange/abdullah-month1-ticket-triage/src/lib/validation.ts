import { z } from "zod";

/** Priority levels used by the PMO. SQLite stores these as plain strings. */
export const prioritySchema = z.enum(["P0", "P1", "P2"]);
export type Priority = z.infer<typeof prioritySchema>;

export const statusSchema = z.enum(["open", "closed"]);
export type Status = z.infer<typeof statusSchema>;

/** Shape of a record in prisma/seed-data/tickets.json. */
export const seedTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: prioritySchema,
  owner: z.string().min(1),
  status: statusSchema.default("open"),
});
export type SeedTicket = z.infer<typeof seedTicketSchema>;

/** Allowed fields on PATCH /api/tickets/:id. At least one must be present. */
export const ticketPatchSchema = z
  .object({
    priority: prioritySchema.optional(),
    owner: z.string().min(1).optional(),
    status: statusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update (priority, owner, or status).",
  });
export type TicketPatch = z.infer<typeof ticketPatchSchema>;
