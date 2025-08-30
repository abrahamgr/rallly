import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { TopicsDisplay } from "./topics-display";

describe("Topics Display Component", () => {
  describe("basic rendering", () => {
    it("renders topics as tags", () => {
      render(<TopicsDisplay topics={["meeting", "team", "weekly"]} />);

      expect(screen.getByTestId("topic-tag-0")).toHaveTextContent("meeting");
      expect(screen.getByTestId("topic-tag-1")).toHaveTextContent("team");
      expect(screen.getByTestId("topic-tag-2")).toHaveTextContent("weekly");
    });

    it("renders nothing when no topics and showEmpty is false", () => {
      const { container } = render(<TopicsDisplay topics={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it("applies correct CSS classes for different variants", () => {
      const { rerender } = render(
        <TopicsDisplay topics={["test"]} variant="default" />,
      );

      expect(screen.getByTestId("topic-tag-0")).toHaveClass(
        "border bg-gray-50",
      );

      rerender(<TopicsDisplay topics={["test"]} variant="outline" />);
      expect(screen.getByTestId("topic-tag-0")).toHaveClass("text-foreground");

      rerender(<TopicsDisplay topics={["test"]} variant="secondary" />);
      expect(screen.getByTestId("topic-tag-0")).toHaveClass("bg-primary-50");
    });

    it("applies correct size classes", () => {
      const { rerender } = render(
        <TopicsDisplay topics={["test"]} size="sm" />,
      );

      expect(screen.getByTestId("topic-tag-0")).toHaveClass("px-2");

      rerender(<TopicsDisplay topics={["test"]} size="lg" />);
      expect(screen.getByTestId("topic-tag-0")).toHaveClass("px-3");
    });
  });

  describe("topic truncation", () => {
    it("displays all topics when under maxDisplayed limit", () => {
      render(
        <TopicsDisplay topics={["meeting", "team", "weekly"]} maxDisplay={5} />,
      );

      expect(screen.getByTestId("topic-tag-0")).toBeInTheDocument();
      expect(screen.getByTestId("topic-tag-1")).toBeInTheDocument();
      expect(screen.getByTestId("topic-tag-2")).toBeInTheDocument();
      expect(screen.queryByTestId("remaining-count")).not.toBeInTheDocument();
    });

    it("truncates topics and shows remaining count", () => {
      render(
        <TopicsDisplay
          topics={["meeting", "team", "weekly", "planning", "review"]}
          maxDisplay={3}
        />,
      );

      expect(screen.getByTestId("topic-tag-0")).toHaveTextContent("meeting");
      expect(screen.getByTestId("topic-tag-1")).toHaveTextContent("team");
      expect(screen.getByTestId("topic-tag-2")).toHaveTextContent("weekly");
      expect(screen.queryByTestId("topic-tag-3")).not.toBeInTheDocument();

      expect(screen.getByTestId("remaining-count")).toHaveTextContent(
        "+2 more",
      );
    });

    it("shows exact remaining count", () => {
      render(
        <TopicsDisplay
          topics={Array.from({ length: 10 }, (_, i) => `topic${i + 1}`)}
          maxDisplay={2}
        />,
      );

      expect(screen.getByTestId("remaining-count")).toHaveTextContent(
        "+8 more",
      );
    });

    it("doesn't show remaining count when exactly at limit", () => {
      render(
        <TopicsDisplay topics={["meeting", "team", "weekly"]} maxDisplay={3} />,
      );

      expect(screen.queryByTestId("remaining-count")).not.toBeInTheDocument();
    });
  });

  describe("clickable topics", () => {
    it("makes topics clickable when clickable prop is true", () => {
      const onTopicClick = vi.fn();
      render(
        <TopicsDisplay
          topics={["meeting", "team"]}
          clickable={true}
          onTopicClick={onTopicClick}
        />,
      );

      const firstTopic = screen.getByTestId("topic-tag-0");
      expect(firstTopic).toHaveClass("cursor-pointer");
      expect(firstTopic).toHaveAttribute("role", "button");
      expect(firstTopic).toHaveAttribute("tabIndex", "0");
    });

    it("calls onTopicClick when topic is clicked", async () => {
      const user = userEvent.setup();
      const onTopicClick = vi.fn();
      render(
        <TopicsDisplay
          topics={["meeting", "team"]}
          clickable={true}
          onTopicClick={onTopicClick}
        />,
      );

      await user.click(screen.getByTestId("topic-tag-0"));

      expect(onTopicClick).toHaveBeenCalledWith("meeting");
    });

    it("supports keyboard interaction for clickable topics", async () => {
      const user = userEvent.setup();
      const onTopicClick = vi.fn();
      render(
        <TopicsDisplay
          topics={["meeting", "team"]}
          clickable={true}
          onTopicClick={onTopicClick}
        />,
      );

      const firstTopic = screen.getByTestId("topic-tag-0");
      firstTopic.focus();

      await user.keyboard("{Enter}");
      expect(onTopicClick).toHaveBeenCalledWith("meeting");

      onTopicClick.mockClear();

      await user.keyboard(" ");
      expect(onTopicClick).toHaveBeenCalledWith("meeting");
    });

    it("doesn't add click behavior when clickable is false", () => {
      render(<TopicsDisplay topics={["meeting", "team"]} clickable={false} />);

      const firstTopic = screen.getByTestId("topic-tag-0");
      expect(firstTopic).not.toHaveAttribute("role", "button");
      expect(firstTopic).not.toHaveAttribute("tabIndex");
      expect(firstTopic).not.toHaveClass("topic-tag-clickable");
    });
  });

  describe("special characters and edge cases", () => {
    it("handles topics with special characters", () => {
      render(
        <TopicsDisplay
          topics={["Q&A session", "1-on-1", "project/planning", "team@work"]}
        />,
      );

      expect(screen.getByTestId("topic-tag-0")).toHaveTextContent(
        "Q&A session",
      );
      expect(screen.getByTestId("topic-tag-1")).toHaveTextContent("1-on-1");
      expect(screen.getByTestId("topic-tag-2")).toHaveTextContent(
        "project/planning",
      );
      expect(screen.getByTestId("topic-tag-3")).toHaveTextContent("team@work");
    });

    it("handles very long topic names", () => {
      const longTopic =
        "This is a very long topic name that might overflow the display area";
      render(<TopicsDisplay topics={[longTopic]} />);

      expect(screen.getByTestId("topic-tag-0")).toHaveTextContent(longTopic);
    });

    it("handles duplicate topic names", () => {
      render(<TopicsDisplay topics={["meeting", "meeting", "planning"]} />);

      // Should render all topics even if duplicated
      expect(screen.getByTestId("topic-tag-0")).toHaveTextContent("meeting");
      expect(screen.getByTestId("topic-tag-1")).toHaveTextContent("meeting");
      expect(screen.getByTestId("topic-tag-2")).toHaveTextContent("planning");
    });
  });

  describe("accessibility", () => {
    it("provides proper ARIA attributes for clickable topics", () => {
      render(
        <TopicsDisplay
          topics={["meeting", "team"]}
          clickable={true}
          onTopicClick={vi.fn()}
        />,
      );

      const topics = screen.getAllByRole("button");
      topics.forEach((topic) => {
        expect(topic).toHaveAttribute("tabIndex", "0");
        expect(topic).toHaveAttribute("role", "button");
      });
    });

    it("maintains focus management for keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <TopicsDisplay
          topics={["meeting", "team", "planning"]}
          clickable={true}
          onTopicClick={vi.fn()}
        />,
      );

      // Tab through topics
      await user.tab();
      expect(screen.getByTestId("topic-tag-0")).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId("topic-tag-1")).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId("topic-tag-2")).toHaveFocus();
    });

    it("prevents default behavior on space key press", async () => {
      const user = userEvent.setup();
      const onTopicClick = vi.fn();
      render(
        <TopicsDisplay
          topics={["meeting"]}
          clickable={true}
          onTopicClick={onTopicClick}
        />,
      );

      const topic = screen.getByTestId("topic-tag-0");
      topic.focus();

      // Space key should trigger click without scrolling the page
      await user.keyboard(" ");
      expect(onTopicClick).toHaveBeenCalledWith("meeting");
    });

    it("doesn't interfere with screen readers for non-clickable topics", () => {
      render(<TopicsDisplay topics={["meeting", "team"]} />);

      const topics = screen.getAllByTestId(/topic-tag-/);
      topics.forEach((topic) => {
        expect(topic).not.toHaveAttribute("role");
        expect(topic).not.toHaveAttribute("tabIndex");
      });
    });
  });

  describe("custom styling and props", () => {
    it("applies custom className", () => {
      render(<TopicsDisplay topics={["meeting"]} className="custom-style" />);

      expect(screen.getByTestId("topic-display")).toHaveClass("custom-style");
    });
  });
});
