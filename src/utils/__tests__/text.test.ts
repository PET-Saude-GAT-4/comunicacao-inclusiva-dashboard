import { formatList } from "../text";

describe("formatList", () => {
  it.each([
    [[], ""],
    [["a"], "a"],
    [["a", "b"], "a e b"],
    [["a", "b", "c"], "a, b e c"],
  ])("joins %j as %j", (items, expected) => {
    expect(formatList(items)).toBe(expected);
  });
});
