import {
  PHRASE_VISIBILITY_ORDER,
  phraseVisibility,
  phraseVisibilityFields,
  reducesPhraseVisibility,
} from "../phrase-visibility";

describe("phraseVisibility", () => {
  it.each([
    [null, false, "draft"],
    // The listing flag has no effect while the phrase is unpublished.
    [null, true, "draft"],
    ["2026-01-01T00:00:00Z", false, "hidden"],
    ["2026-01-01T00:00:00Z", true, "listed"],
  ] as const)(
    "publishedAt %j with listedInLibrary %j is %s",
    (publishedAt, listedInLibrary, expected) => {
      expect(phraseVisibility({ publishedAt, listedInLibrary })).toBe(expected);
    },
  );
});

describe("phraseVisibilityFields", () => {
  it.each([
    ["draft", { published: false, listed: false }],
    ["hidden", { published: true, listed: false }],
    ["listed", { published: true, listed: true }],
  ] as const)("maps %s to %j", (visibility, fields) => {
    expect(phraseVisibilityFields(visibility)).toEqual(fields);
  });

  it("round-trips through phraseVisibility", () => {
    for (const visibility of PHRASE_VISIBILITY_ORDER) {
      const { published, listed } = phraseVisibilityFields(visibility);
      expect(
        phraseVisibility({
          publishedAt: published ? "2026-01-01T00:00:00Z" : null,
          listedInLibrary: listed,
        }),
      ).toBe(visibility);
    }
  });
});

describe("reducesPhraseVisibility", () => {
  it("is true when the phrase loses reach", () => {
    expect(reducesPhraseVisibility("listed", "hidden")).toBe(true);
    expect(reducesPhraseVisibility("hidden", "draft")).toBe(true);
    expect(reducesPhraseVisibility("listed", "draft")).toBe(true);
  });

  it("is false when the phrase gains reach or stays the same", () => {
    expect(reducesPhraseVisibility("draft", "listed")).toBe(false);
    expect(reducesPhraseVisibility("hidden", "listed")).toBe(false);
    expect(reducesPhraseVisibility("hidden", "hidden")).toBe(false);
  });
});
