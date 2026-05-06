import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EmployeeDashboard from "@/components/employees/EmployeeDashboard";
import InsightsDashboard from "@/components/analytics/InsightsDashboard";
import ThemeToggle from "@/components/theme/ThemeToggle";

jest.mock("@/lib/exportReport", () => ({
  exportReport: jest.fn()
}));

jest.mock("@/components/charts", () => ({
  BarChartCard: ({ title }: { title: string }) => <div>{title}</div>,
  PieChartCard: ({ title }: { title: string }) => <div>{title}</div>,
  SalaryDistributionChart: () => <div>Salary Distribution</div>
}));

describe("UI smoke tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders employee dashboard shell", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 }
      })
    } as Response) as jest.Mock;

    render(<EmployeeDashboard />);

    expect(screen.getByText("Employees")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("No employees yet.")).toBeInTheDocument();
    });
  });

  it("renders insights dashboard shell", async () => {
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/api/analytics/summary")) {
        return {
          ok: true,
          json: async () => ({ data: { minSalary: 10, maxSalary: 100, avgSalary: 50 } })
        } as Response;
      }

      if (url.includes("/api/analytics/country-salaries")) {
        return {
          ok: true,
          json: async () => ({ data: [{ country: "India", minSalary: 10, maxSalary: 100, avgSalary: 50 }] })
        } as Response;
      }

      if (url.includes("/api/analytics/department-salaries")) {
        return {
          ok: true,
          json: async () => ({ data: [{ department: "Engineering", headcount: 1, avgSalary: 50 }] })
        } as Response;
      }

      if (url.includes("/api/analytics/job-salaries")) {
        return {
          ok: true,
          json: async () => ({ data: [{ jobTitle: "Engineer", avgSalary: 50 }] })
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({ data: [], meta: { total: 1 } })
      } as Response;
    }) as jest.Mock;

    render(<InsightsDashboard />);

    expect(screen.getByText("Salary Insights")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Department Analytics")).toBeInTheDocument();
    });
  });

  it("renders and toggles theme options", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      }))
    });

    render(<ThemeToggle />);

    const darkModeButton = screen.getByRole("radio", { name: "Set dark mode" });
    fireEvent.click(darkModeButton);

    expect(darkModeButton).toBeInTheDocument();
  });
});
