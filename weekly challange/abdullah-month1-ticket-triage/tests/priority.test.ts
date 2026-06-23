import { describe, it, expect } from "vitest";
import {
  groupByPriority,
  countsByPriority,
  PRIORITIES,
  type TicketView,
} from "../src/lib/priority";

function ticket(overrides: Partial<TicketView> = {}): TicketView {
  return {
    id: "t1",
    title: "Sample",
    description: null,
    priority: "P1",
    owner: "Nadia",
    status: "open",
    createdAt: "2026-06-16T00:00:00.000Z",
    ...overrides,
  };
}

describe("groupByPriority", () => {
  it("buckets tickets into P0/P1/P2 lanes", () => {
    const groups = groupByPriority([
      ticket({ id: "a", priority: "P0" }),
      ticket({ id: "b", priority: "P2" }),
      ticket({ id: "c", priority: "P0" }),
    ]);
    expect(groups.P0.map((t) => t.id)).toEqual(["a", "c"]);
    expect(groups.P1).toEqual([]);
    expect(groups.P2.map((t) => t.id)).toEqual(["b"]);
  });

  it("returns all three lanes even when empty", () => {
    const groups = groupByPriority([]);
    expect(Object.keys(groups).sort()).toEqual([...PRIORITIES].sort());
  });
});

describe("countsByPriority", () => {
  it("counts tickets per priority", () => {
    const counts = countsByPriority([
      ticket({ priority: "P0" }),
      ticket({ priority: "P0" }),
      ticket({ priority: "P1" }),
    ]);
    expect(counts).toEqual({ P0: 2, P1: 1, P2: 0 });
  });
});
