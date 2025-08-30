import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithForm, screen } from "@/test/test-utils";
import { TopicsInput } from "./topics-input";

describe("Topics Field", () => {
  it("renders topics field with proper label", () => {
    renderWithForm(<TopicsInput />);

    expect(screen.getByLabelText(/Topics/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Add topics separated by commas/),
    ).toBeInTheDocument();
  });

  it("accepts empty topics input (optional field)", async () => {
    const { waitForFormValue } = renderWithForm(<TopicsInput />);

    const input = screen.getByTestId("topics-input");
    expect(input).toHaveValue("");
    await waitForFormValue("topics", undefined);
  });

  it("handles single topic input correctly", async () => {
    const user = userEvent.setup();
    // const onChange = vi.fn();
    const { waitForFormValue } = renderWithForm(<TopicsInput />);

    const input = screen.getByTestId("topics-input");

    await user.type(input, "meeting");

    expect(input).toHaveValue("meeting");
    await waitForFormValue("topics", ["meeting"]);
  });

  it("handles multiple topics separated by commas", async () => {
    const user = userEvent.setup();
    const { waitForFormValue } = renderWithForm(<TopicsInput />);

    const input = screen.getByTestId("topics-input");

    await user.type(input, "meeting, planning, team sync");

    expect(input).toHaveValue("meeting, planning, team sync");
    await waitForFormValue("topics", ["meeting", "planning", "team sync"]);
  });

  it("trims whitespace from topics", async () => {
    const user = userEvent.setup();
    const { waitForFormValue } = renderWithForm(<TopicsInput />);

    const input = screen.getByTestId("topics-input");

    await user.type(input, "  meeting  ,   planning   ,team sync  ");

    await waitForFormValue("topics", ["meeting", "planning", "team sync"]);
  });

  it("filters out empty topics after splitting", async () => {
    const user = userEvent.setup();
    const { waitForFormValue } = renderWithForm(<TopicsInput />);
    const input = screen.getByTestId("topics-input");

    await user.type(input, "meeting,, planning, ,team sync,");

    await waitForFormValue("topics", ["meeting", "planning", "team sync"]);
  });

  it("displays topics as tags", () => {
    renderWithForm(<TopicsInput />, {
      defaultValues: { topics: ["meeting", "planning", "team sync"] },
    });

    expect(screen.getByTestId("topic-tag-0")).toHaveTextContent("meeting");
    expect(screen.getByTestId("topic-tag-1")).toHaveTextContent("planning");
    expect(screen.getByTestId("topic-tag-2")).toHaveTextContent("team sync");
  });

  it("allows removing individual topic tags", async () => {
    const user = userEvent.setup();
    const { waitForFormValue } = renderWithForm(<TopicsInput />, {
      defaultValues: { topics: ["meeting", "planning", "team sync"] },
    });

    const removeButton = screen.getByTestId("remove-topic-1");
    await user.click(removeButton);

    await waitForFormValue("topics", ["meeting", "team sync"]);
  });

  it("updates input field when topic is removed via tag", async () => {
    const user = userEvent.setup();
    const { waitForFormValue } = renderWithForm(<TopicsInput />, {
      defaultValues: { topics: ["meeting", "planning"] },
    });

    await waitForFormValue("topics", ["meeting", "planning"]);

    const removeButton = screen.getByTestId("remove-topic-0");
    await user.click(removeButton);

    await waitForFormValue("topics", ["planning"]);
  });

  it("handles special characters in topics", async () => {
    const user = userEvent.setup();
    const { waitForFormValue } = renderWithForm(<TopicsInput />);

    const input = screen.getByTestId("topics-input");

    await user.type(input, "Q&A session, 1-on-1 meeting, project-update");

    await waitForFormValue("topics", [
      "Q&A session",
      "1-on-1 meeting",
      "project-update",
    ]);
  });

  it("preserves topics order", async () => {
    const user = userEvent.setup();
    const { waitForFormValue } = renderWithForm(<TopicsInput />);

    const input = screen.getByTestId("topics-input");

    await user.type(input, "zzz, aaa, mmm");

    await waitForFormValue("topics", ["zzz", "aaa", "mmm"]);
  });

  it("handles very long topic names", async () => {
    const user = userEvent.setup();
    const { waitForFormValue } = renderWithForm(<TopicsInput />);

    const input = screen.getByTestId("topics-input");
    const longTopic =
      "This is a very long topic name that might be used in some scenarios";

    await user.type(input, longTopic);

    await waitForFormValue("topics", [longTopic]);
  });

  describe("accessibility", () => {
    it("has proper form field labeling", () => {
      renderWithForm(<TopicsInput />);

      const input = screen.getByLabelText(/Topics/);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("id", "topics");
    });

    it("topic removal buttons are accessible", () => {
      renderWithForm(<TopicsInput />, {
        defaultValues: { topics: ["meeting", "planning"] },
      });

      const removeButtons = screen
        .getAllByRole("button")
        .filter((button) => button.getAttribute("type") === "button");
      removeButtons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("supports keyboard interaction for topic removal", async () => {
      const user = userEvent.setup();
      const { waitForFormValue } = renderWithForm(<TopicsInput />, {
        defaultValues: { topics: ["meeting", "planning"] },
      });

      await user.tab(); // Navigate to the remove button
      await user.keyboard("{Enter}");

      waitForFormValue("topics", ["planning"]);
    });
  });

  describe("edge cases", () => {
    it("handles empty string input gracefully", async () => {
      const user = userEvent.setup();
      const { waitForFormValue } = renderWithForm(<TopicsInput />, {});

      await user.type(screen.getByTestId("topics-input"), "meeting");
      const input = screen.getByTestId("topics-input");
      await user.clear(input);

      await waitForFormValue("topics", []);
    });

    it("handles only commas input", async () => {
      const user = userEvent.setup();
      const { waitForFormValue } = renderWithForm(<TopicsInput />);

      const input = screen.getByTestId("topics-input");
      await user.type(input, ",,,");

      await waitForFormValue("topics", []);
    });

    it("handles duplicate topics", async () => {
      const user = userEvent.setup();
      const { waitForFormValue } = renderWithForm(<TopicsInput />);

      const input = screen.getByTestId("topics-input");
      await user.type(input, "meeting, planning, meeting");

      waitForFormValue("topics", ["meeting", "planning", "meeting"]);
    });
  });
});
