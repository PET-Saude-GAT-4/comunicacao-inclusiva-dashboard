import { render, screen } from "@testing-library/react";
import Thumbnail from "./Thumbnail";

const src = "http://localhost/uploads/tall.png";

describe("Thumbnail", () => {
  it("sizes the box from `size` and keeps the image out of flow", () => {
    render(<Thumbnail src={src} alt="Gato" size={96} />);

    const image = screen.getByRole("img", { name: "Gato" });
    const box = image.parentElement!;

    // jsdom has no layout, so this checks the mechanism from #59: only the
    // box sets the size, and an absolutely positioned image cannot stretch it
    // however tall it is.
    expect(box).toHaveStyle({ width: "96px", height: "96px" });
    expect(image).toHaveClass("absolute", "inset-0", "object-contain");
  });

  it("takes the container's width, still square, when fluid", () => {
    render(<Thumbnail src={src} alt="Gato" size={96} fluid />);

    const box = screen.getByRole("img", { name: "Gato" }).parentElement!;

    expect(box).toHaveClass("w-full", "aspect-square");
    expect(box.style.width).toBe("");
    expect(box.style.height).toBe("");
  });
});
