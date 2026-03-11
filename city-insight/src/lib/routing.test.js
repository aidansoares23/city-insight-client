import { describe, it, expect } from "vitest";
import { safeReturnTo } from "./routing";

describe("safeReturnTo", () => {
  it("allows valid internal paths", () => {
    expect(safeReturnTo("/cities")).toBe("/cities");
    expect(safeReturnTo("/cities/portland-or")).toBe("/cities/portland-or");
    expect(safeReturnTo("/account")).toBe("/account");
    expect(safeReturnTo("/cities/portland-or/review")).toBe("/cities/portland-or/review");
  });

  it("allows paths with query strings and hashes", () => {
    expect(safeReturnTo("/cities?sort=livability_desc")).toBe("/cities?sort=livability_desc");
    expect(safeReturnTo("/cities#map")).toBe("/cities#map");
  });

  it("rejects non-string values", () => {
    expect(safeReturnTo(null)).toBe(null);
    expect(safeReturnTo(undefined)).toBe(null);
    expect(safeReturnTo(42)).toBe(null);
    expect(safeReturnTo({})).toBe(null);
  });

  it("rejects paths that do not start with /", () => {
    expect(safeReturnTo("cities")).toBe(null);
    expect(safeReturnTo("https://evil.com")).toBe(null);
    expect(safeReturnTo("relative/path")).toBe(null);
  });

  it("rejects protocol-relative URLs to prevent open redirect", () => {
    expect(safeReturnTo("//evil.com")).toBe(null);
    expect(safeReturnTo("//evil.com/steal-tokens")).toBe(null);
  });
});
