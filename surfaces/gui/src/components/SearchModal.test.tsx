import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SearchModal } from "./SearchModal";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SearchModal", () => {
  it("portals the palette outside a transformed sidebar", () => {
    const { container } = render(
      <div style={{ transform: "translateX(-100%)" }}>
        <SearchModal sessions={[]} onSelect={vi.fn()} onClose={vi.fn()} />
      </div>,
    );

    const modal = screen.getByTestId("search-modal");
    expect(container).not.toContain(modal);
    expect(modal.parentElement).toBe(document.body);
  });
});
