import { termBadge } from "../term";

const terms = (...names: string[]) =>
  names.map((description) => ({ description }));

describe("termBadge", () => {
  it("marks a part that belongs to no term with a neutral badge", () => {
    expect(termBadge([])).toEqual({ text: "Sem termo", neutral: true });
  });

  it("lists up to two term names in full", () => {
    expect(termBadge(terms("água"))).toEqual({ text: "água" });
    expect(termBadge(terms("água", "beber"))).toEqual({ text: "água, beber" });
  });

  it("counts the names past the second and keeps the full list aside", () => {
    expect(termBadge(terms("água", "beber", "sede", "copo"))).toEqual({
      text: "água, beber +2",
      fullText: "água, beber, sede, copo",
    });
  });
});
