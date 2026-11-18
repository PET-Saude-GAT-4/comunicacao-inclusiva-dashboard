import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AssetCard from "./AssetCard";

const baseProps = {
  title: "Água",
  uuid: "3f2a9c1e-0000-0000-0000-000000000000",
  createdAt: "2026-03-05T12:00:00Z",
  authorEmail: "ana@example.com",
  images: [{ src: "http://localhost/uploads/agua.png", label: "Pictograma" }],
  onSelect: jest.fn(),
  onDelete: jest.fn(),
  isSelected: false,
} satisfies React.ComponentProps<typeof AssetCard>;

describe("AssetCard", () => {
  it("shows the title, creation date and author", () => {
    render(<AssetCard {...baseProps} />);

    expect(screen.getByRole("heading", { name: "Água" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Água" })).toBeInTheDocument();
    expect(
      screen.getByText(new Date(baseProps.createdAt).toLocaleDateString("pt-BR")),
    ).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
  });

  it("falls back to 'Desconhecido' when the author is unknown", () => {
    render(<AssetCard {...baseProps} authorEmail={null} />);

    expect(screen.getByText("Desconhecido")).toBeInTheDocument();
  });

  it("gives screen readers the full text of a shortened badge", () => {
    render(
      <AssetCard
        {...baseProps}
        badge={{ text: "água, beber +1", fullText: "água, beber, sede" }}
      />,
    );

    expect(screen.getByText("água, beber +1")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByText("água, beber, sede")).toHaveClass("sr-only");
  });

  it("selects the card when it is clicked", async () => {
    const onSelect = jest.fn();
    render(<AssetCard {...baseProps} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("heading", { name: "Água" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("captions each image of a term's pair", () => {
    render(
      <AssetCard
        {...baseProps}
        images={[
          { src: "http://localhost/uploads/agua.png", label: "Pictograma" },
          { src: "http://localhost/uploads/agua-sw.png", label: "SignWriting" },
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: "Pictograma" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "SignWriting" })).toBeInTheDocument();
    expect(screen.getByText("SignWriting").tagName).toBe("FIGCAPTION");
  });
});
