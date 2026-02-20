function titleCaseWord(word) {
  if (!word) return "";
  const s = String(word);
  return s[0].toUpperCase() + s.slice(1);
}

// "san-jose-ca" -> "San Jose, CA"
// If last token looks like a 2-letter state, format as "City, ST", else just Title Case tokens.
export function prettyCityFromSlug(slug) {
  if (typeof slug !== "string") return "City";

  const tokens = slug
    .split("-")
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) return "City";

  const last = tokens[tokens.length - 1];
  const isStateToken = /^[a-zA-Z]{2}$/.test(last);

  const state = isStateToken ? last.toUpperCase() : null;
  const cityTokens = isStateToken ? tokens.slice(0, -1) : tokens;

  const cityName = cityTokens
    .map((t) => titleCaseWord(String(t).toLowerCase()))
    .join(" ");

  return state ? `${cityName}, ${state}` : cityName;
}
