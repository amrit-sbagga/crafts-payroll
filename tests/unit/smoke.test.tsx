import { render, screen } from "@testing-library/react";

describe("test harness", () => {
  it("renders with React Testing Library", () => {
    render(<div>Hello tests</div>);
    expect(screen.getByText("Hello tests")).toBeInTheDocument();
  });
});

