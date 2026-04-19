import { describe, it, expect } from "vitest";
import { stripControlChars, sanitizeAiQuery, sanitizeDisplayName } from "./sanitize";

describe("stripControlChars", () => {
  it("passes clean strings through unchanged", () => {
    expect(stripControlChars("hello world")).toBe("hello world");
  });
  it("strips null byte", () => {
    expect(stripControlChars("a\x00b")).toBe("ab");
  });
  it("strips tab character", () => {
    expect(stripControlChars("a\tb")).toBe("ab");
  });
  it("strips carriage return", () => {
    expect(stripControlChars("a\rb")).toBe("ab");
  });
  it("strips \\x1F", () => {
    expect(stripControlChars("a\x1Fb")).toBe("ab");
  });
  it("strips \\x7F (DEL)", () => {
    expect(stripControlChars("a\x7Fb")).toBe("ab");
  });
  it("preserves normal unicode", () => {
    expect(stripControlChars("café 🌆")).toBe("café 🌆");
  });
  it("preserves spaces and newlines (\\n is \\x0A — control, stripped)", () => {
    expect(stripControlChars("a\nb")).toBe("ab");
  });
  it("returns empty string for non-string input", () => {
    expect(stripControlChars(null)).toBe("");
    expect(stripControlChars(undefined)).toBe("");
    expect(stripControlChars(42)).toBe("");
  });
});

describe("sanitizeAiQuery", () => {
  it("trims leading and trailing whitespace", () => {
    expect(sanitizeAiQuery("  hello  ")).toBe("hello");
  });
  it("strips control characters after trimming", () => {
    expect(sanitizeAiQuery("hello\x00world")).toBe("helloworld");
  });
  it("enforces 1000-char ceiling", () => {
    const long = "a".repeat(1100);
    expect(sanitizeAiQuery(long)).toHaveLength(1000);
  });
  it("returns empty string for all-whitespace input", () => {
    expect(sanitizeAiQuery("   ")).toBe("");
  });
  it("returns empty string for non-string input", () => {
    expect(sanitizeAiQuery(null)).toBe("");
    expect(sanitizeAiQuery(undefined)).toBe("");
    expect(sanitizeAiQuery(0)).toBe("");
  });
  it("passes valid query through unchanged", () => {
    expect(sanitizeAiQuery("Which city is most affordable?")).toBe(
      "Which city is most affordable?"
    );
  });
});

describe("sanitizeDisplayName", () => {
  it("returns ok: true with trimmed value for a valid name", () => {
    expect(sanitizeDisplayName("Alice")).toEqual({ ok: true, value: "Alice" });
  });
  it("trims before validating", () => {
    expect(sanitizeDisplayName("  Bob  ")).toEqual({ ok: true, value: "Bob" });
  });
  it("rejects empty string", () => {
    expect(sanitizeDisplayName("")).toMatchObject({ ok: false });
  });
  it("rejects whitespace-only string", () => {
    expect(sanitizeDisplayName("   ")).toMatchObject({ ok: false });
  });
  it("rejects a 51-character name", () => {
    expect(sanitizeDisplayName("a".repeat(51))).toMatchObject({ ok: false });
  });
  it("accepts exactly 50 characters", () => {
    const name = "a".repeat(50);
    expect(sanitizeDisplayName(name)).toEqual({ ok: true, value: name });
  });
  it("error string matches backend verbatim", () => {
    expect(sanitizeDisplayName("").error).toBe("Display name must be 1–50 characters");
  });
  it("returns ok: false for non-string input", () => {
    expect(sanitizeDisplayName(null)).toMatchObject({ ok: false });
    expect(sanitizeDisplayName(undefined)).toMatchObject({ ok: false });
  });
});
