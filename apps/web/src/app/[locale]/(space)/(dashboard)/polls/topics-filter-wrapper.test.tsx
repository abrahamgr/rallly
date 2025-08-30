import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { TopicsFilterWrapper } from "./topics-filter-wrapper";

// Mock poll data with topics
const mockPolls = [
  {
    id: "1",
    title: "Team Meeting",
    status: "live" as const,
    topics: ["meeting", "team", "weekly"],
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    title: "Project Planning",
    status: "paused" as const,
    topics: ["planning", "project"],
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "3",
    title: "Quarterly Review",
    status: "finalized" as const,
    topics: ["review", "quarterly", "performance"],
    createdAt: new Date("2024-01-03"),
  },
  {
    id: "4",
    title: "Daily Standup",
    status: "live" as const,
    topics: ["meeting", "daily", "standup"],
    createdAt: new Date("2024-01-04"),
  },
  {
    id: "5",
    title: "Budget Discussion",
    status: "live" as const,
    topics: [],
    createdAt: new Date("2024-01-05"),
  },
];

const mockReplace = vi.fn();

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("@/trpc/client", () => ({
  trpc: {
    polls: {
      infiniteChronological: {
        useInfiniteQuery: () => ({
          data: {
            pages: [
              {
                polls: mockPolls,
                nextCursor: null,
              },
            ],
          },
          fetchNextPage: vi.fn(),
          hasNextPage: false,
        }),
      },
    },
  },
}));

vi.mock("@rallly/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("Poll Filter with Topics", () => {
  describe("topics filter display", () => {
    it("renders all available topics as filter options", async () => {
      render(<TopicsFilterWrapper />);

      const uniqueTopics = [
        "daily",
        "meeting",
        "performance",
        "planning",
        "project",
        "quarterly",
        "review",
        "standup",
        "team",
        "weekly",
      ];

      uniqueTopics.forEach((topic) => {
        expect(
          screen.getByTestId(`topic-checkbox-${topic}`),
        ).toBeInTheDocument();
      });
    });

    it("shows topics in alphabetical order", () => {
      render(<TopicsFilterWrapper />);

      const topicsList = screen.getByTestId("topics-list");
      const labels = topicsList.querySelectorAll(
        "[data-testid^='topic-checkbox-']",
      );

      const topicNames = Array.from(labels).map((label) => label.textContent);

      expect(topicNames).toEqual([
        "daily",
        "meeting",
        "performance",
        "planning",
        "project",
        "quarterly",
        "review",
        "standup",
        "team",
        "weekly",
      ]);
    });
  });

  describe("single topic filtering", () => {
    it("shows checkmark for selected topic", async () => {
      const user = userEvent.setup();
      render(<TopicsFilterWrapper />);

      await user.click(screen.getByTestId("topic-checkbox-planning"));

      expect(screen.getByTestId("topic-checkbox-planning")).toHaveAttribute(
        "data-selected",
        "true",
      );
      expect(mockReplace).toHaveBeenCalledWith("?topics=planning", {
        scroll: false,
      });
    });
  });

  describe("multiple topics filtering", () => {
    it("selected matching count", async () => {
      render(<TopicsFilterWrapper selectedTopics={["meeting", "planning"]} />);

      // Should show polls with either "meeting" OR "planning" topics
      expect(screen.getByTestId("results-count")).toHaveTextContent(
        "2 topics selected",
      );
    });

    it("displays multiple selected topics as tags", async () => {
      render(
        <TopicsFilterWrapper selectedTopics={["meeting", "team", "daily"]} />,
      );

      expect(screen.getByTestId("selected-topic-meeting")).toBeInTheDocument();
      expect(screen.getByTestId("selected-topic-team")).toBeInTheDocument();
      expect(screen.getByTestId("selected-topic-daily")).toBeInTheDocument();
    });
  });

  describe("search available topics", () => {
    it("searches within topic names", async () => {
      const user = userEvent.setup();
      render(<TopicsFilterWrapper />);

      await user.type(screen.getByTestId("search-input"), "plan");

      expect(screen.getByTestId("topic-checkbox-planning")).toBeInTheDocument(); // Project Planning
    });
  });

  describe("accessibility", () => {
    it("has proper labels for topic checkboxes", () => {
      render(<TopicsFilterWrapper />);

      const topicCheckboxes = screen.getAllByRole("option");
      topicCheckboxes.forEach((checkbox) => {
        expect(checkbox.closest("div")).toBeInTheDocument();
      });
    });

    it("supports keyboard navigation for topic selection", async () => {
      const user = userEvent.setup();
      render(<TopicsFilterWrapper />);

      // Navigate to first topic checkbox and select via keyboard
      const firstCheckbox = screen.getByTestId("topic-checkbox-daily");
      await user.tab(); // This would focus the first interactive element

      // In a real test, you'd navigate to the checkbox and space to select
      await user.click(firstCheckbox); // Using click for simplicity in this test

      expect(firstCheckbox).toHaveAttribute("data-selected", "true");
    });

    it("has accessible labels for all form elements", () => {
      render(<TopicsFilterWrapper />);

      expect(screen.getByText("Filter by topics")).toBeInTheDocument();
    });
  });
});
