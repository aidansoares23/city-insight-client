import { describe, it, expect } from "vitest";
import { prettyCityFromSlug } from "./cities";

describe("prettyCityFromSlug", () => {
  it("formats a city with a 2-letter state token", () => {
    expect(prettyCityFromSlug("san-jose-ca")).toBe("San Jose, CA");
    expect(prettyCityFromSlug("new-york-ny")).toBe("New York, NY");
    expect(prettyCityFromSlug("austin-tx")).toBe("Austin, TX");
  });

  it("uppercases the state abbreviation", () => {
    expect(prettyCityFromSlug("portland-or")).toBe("Portland, OR");
  });

  it("formats a single-word city without state", () => {
    expect(prettyCityFromSlug("portland")).toBe("Portland");
  });

  it("does not treat a 3-letter last token as a state", () => {
    expect(prettyCityFromSlug("fort-worth")).toBe("Fort Worth");
  });

  it("title-cases each word in the city name", () => {
    expect(prettyCityFromSlug("los-angeles-ca")).toBe("Los Angeles, CA");
  });

  it("returns City for non-string input", () => {
    expect(prettyCityFromSlug(null)).toBe("City");
    expect(prettyCityFromSlug(123)).toBe("City");
    expect(prettyCityFromSlug(undefined)).toBe("City");
  });

  it("returns City for an empty string", () => {
    expect(prettyCityFromSlug("")).toBe("City");
  });
});
