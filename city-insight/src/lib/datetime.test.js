import { describe, it, expect } from "vitest";
import { toDate, fmtDateTime, fmtDate } from "./datetime";

describe("toDate", () => {
  it("returns null for null and undefined", () => {
    expect(toDate(null)).toBe(null);
    expect(toDate(undefined)).toBe(null);
  });

  it("handles ISO string", () => {
    const dt = toDate("2024-01-15T00:00:00.000Z");
    expect(dt).toBeInstanceOf(Date);
    expect(dt.getFullYear()).toBe(2024);
  });

  it("handles epoch milliseconds as a number", () => {
    const dt = toDate(0);
    expect(dt).toBeInstanceOf(Date);
    expect(dt.toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });

  it("passes through a Date object", () => {
    const input = new Date("2024-06-01T00:00:00.000Z");
    const dt = toDate(input);
    expect(dt).toBeInstanceOf(Date);
    expect(dt.toISOString()).toBe(input.toISOString());
  });

  it("handles Firestore-like { _seconds } object", () => {
    const dt = toDate({ _seconds: 0 });
    expect(dt).toBeInstanceOf(Date);
    expect(dt.toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });

  it("handles Firestore-like { seconds } object", () => {
    const dt = toDate({ seconds: 1700000000 });
    expect(dt).toBeInstanceOf(Date);
    expect(dt.getFullYear()).toBe(2023);
  });

  it("handles a Firestore Timestamp-like object with toDate()", () => {
    const mockTimestamp = { toDate: () => new Date("2024-06-15T12:00:00.000Z") };
    const dt = toDate(mockTimestamp);
    expect(dt).toBeInstanceOf(Date);
    expect(dt.getUTCFullYear()).toBe(2024);
    expect(dt.getUTCMonth()).toBe(5); // June (0-indexed)
  });

  it("returns null for an invalid date string", () => {
    expect(toDate("not-a-date")).toBe(null);
  });
});

describe("fmtDateTime", () => {
  it("returns — for null", () => {
    expect(fmtDateTime(null)).toBe("—");
  });
  it("returns a non-empty string for a valid ISO date", () => {
    const result = fmtDateTime("2024-01-15T12:00:00.000Z");
    expect(typeof result).toBe("string");
    expect(result).not.toBe("—");
  });
});

describe("fmtDate", () => {
  it("returns — for null", () => {
    expect(fmtDate(null)).toBe("—");
  });
  it("returns a non-empty string for a valid ISO date", () => {
    const result = fmtDate("2024-01-15");
    expect(typeof result).toBe("string");
    expect(result).not.toBe("—");
  });
});
