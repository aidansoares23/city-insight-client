import { describe, it, expect } from "vitest";
import { fmtMoney, fmtNum, clamp01, safeNumOrNull, toOutOf10, initialsFromUser } from "./format";

describe("fmtMoney", () => {
  it("formats a number with $ and locale separators", () => {
    expect(fmtMoney(1500)).toBe("$1,500");
    expect(fmtMoney(0)).toBe("$0");
  });
  it("returns — for null or undefined", () => {
    expect(fmtMoney(null)).toBe("—");
    expect(fmtMoney(undefined)).toBe("—");
  });
  it("returns — for non-numeric strings", () => {
    expect(fmtMoney("abc")).toBe("—");
  });
});

describe("fmtNum", () => {
  it("formats with 0 decimal digits by default", () => {
    expect(fmtNum(3.7)).toBe("4");
  });
  it("formats with specified decimal digits", () => {
    expect(fmtNum(3.14159, { digits: 2 })).toBe("3.14");
  });
  it("returns — for null or non-numeric", () => {
    expect(fmtNum(null)).toBe("—");
    expect(fmtNum("abc")).toBe("—");
  });
});

describe("clamp01", () => {
  it("passes through values already in range", () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
  });
  it("clamps below 0", () => {
    expect(clamp01(-1)).toBe(0);
  });
  it("clamps above 1", () => {
    expect(clamp01(2)).toBe(1);
  });
  it("returns 0 for non-numeric input", () => {
    expect(clamp01(null)).toBe(0);
    expect(clamp01("abc")).toBe(0);
  });
});

describe("safeNumOrNull", () => {
  it("returns number for valid numeric input", () => {
    expect(safeNumOrNull(5)).toBe(5);
    expect(safeNumOrNull("3.14")).toBe(3.14);
    expect(safeNumOrNull(0)).toBe(0);
  });
  it("returns null for truly non-numeric input", () => {
    // undefined, 'abc', and NaN produce NaN → null
    expect(safeNumOrNull(undefined)).toBe(null);
    expect(safeNumOrNull("abc")).toBe(null);
    expect(safeNumOrNull(NaN)).toBe(null);
  });
  it("returns 0 for null because Number(null)==0", () => {
    expect(safeNumOrNull(null)).toBe(0);
  });
});

describe("toOutOf10", () => {
  it("divides 0-100 scale to 0.0-10.0", () => {
    expect(toOutOf10(100)).toBe(10);
    expect(toOutOf10(50)).toBe(5);
    expect(toOutOf10(0)).toBe(0);
  });
  it("rounds to one decimal place", () => {
    expect(toOutOf10(75)).toBe(7.5);
    expect(toOutOf10(73)).toBe(7.3);
  });
  it("returns null for truly non-numeric input", () => {
    // undefined and 'abc' produce NaN → null
    expect(toOutOf10(undefined)).toBe(null);
    expect(toOutOf10("abc")).toBe(null);
  });
  it("returns 0 for null because Number(null)==0", () => {
    expect(toOutOf10(null)).toBe(0);
  });
});

describe("initialsFromUser", () => {
  it("returns first and last initials from a display name", () => {
    expect(initialsFromUser({ displayName: "Jane Doe" })).toBe("JD");
  });
  it("returns single initial for a single-word name", () => {
    expect(initialsFromUser({ displayName: "Jane" })).toBe("J");
  });
  it("uses first letter of email when no display name", () => {
    expect(initialsFromUser({ email: "jane@example.com" })).toBe("J");
  });
  it("prefers displayName over email", () => {
    expect(initialsFromUser({ displayName: "Bob Smith", email: "x@y.com" })).toBe("BS");
  });
  it("returns U for null or empty user", () => {
    expect(initialsFromUser(null)).toBe("U");
    expect(initialsFromUser({})).toBe("U");
  });
});
