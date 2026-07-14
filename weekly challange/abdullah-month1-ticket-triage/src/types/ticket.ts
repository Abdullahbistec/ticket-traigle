import { z } from "zod";

export const PrioritySchema = z.enum(["P0", "P1", "P2"]);
export const StatusSchema = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]);

export const PatchTicketSchema = z.object({
  priority: PrioritySchema.optional(),
  owner: z.string().min(1).max(100).optional(),
  status: StatusSchema.optional(),
});

export type Priority = z.infer<typeof PrioritySchema>;
export type PatchTicket = z.infer<typeof PatchTicketSchema>;

export const PRIORITY_LABELS: Record<Priority, string> = {
  P0: "Critical",
  P1: "High",
  P2: "Normal",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
};
