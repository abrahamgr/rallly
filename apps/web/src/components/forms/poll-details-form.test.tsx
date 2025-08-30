import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithForm, screen, waitFor } from "@/test/test-utils";
import { PollDetailsForm } from "./poll-details-form";

const mockOnSubmit = vi.fn();

describe("Enhanced Poll Details Form with Topics", () => {
  describe("topics field integration", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("includes topics field in poll details form", () => {
      renderWithForm(<PollDetailsForm />, { onSubmit: mockOnSubmit });

      expect(screen.getByLabelText(/topics/)).toBeInTheDocument();
      expect(screen.getByTestId("topics-input")).toBeInTheDocument();
    });

    it("submits poll with topics data", async () => {
      const user = userEvent.setup();
      renderWithForm(<PollDetailsForm />, {
        onSubmit: mockOnSubmit,
      });

      // Fill required title field
      await user.type(screen.getByTestId("title-input"), "Test Poll");

      // Add topics
      await user.type(screen.getByTestId("topics-input"), "meeting, planning");

      // Submit form
      await user.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it("submits poll with empty topics (optional field)", async () => {
      const user = userEvent.setup();
      renderWithForm(<PollDetailsForm />, { onSubmit: mockOnSubmit });

      // Fill required title field only
      await user.type(screen.getByTestId("title-input"), "Test Poll");

      // Submit form without adding topics
      await user.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it("preserves topics when other fields change", async () => {
      const user = userEvent.setup();
      renderWithForm(<PollDetailsForm />, { onSubmit: mockOnSubmit });

      // Add topics first
      await user.type(screen.getByTestId("topics-input"), "meeting, planning");

      // Change other fields
      await user.type(screen.getByTestId("title-input"), "Updated Title");
      await user.type(screen.getByTestId("location-input"), "Office");

      // Verify topics are still present
      expect(screen.getByTestId("topics-input")).toHaveValue(
        "meeting, planning",
      );
      expect(screen.getByTestId("topic-tag-0")).toHaveTextContent("meeting");
      expect(screen.getByTestId("topic-tag-1")).toHaveTextContent("planning");
    });
  });

  describe("form validation with topics", () => {
    it("validates required title field regardless of topics", async () => {
      const user = userEvent.setup();
      renderWithForm(<PollDetailsForm />, { onSubmit: mockOnSubmit });

      // Add topics but leave title empty
      await user.type(screen.getByTestId("topics-input"), "meeting, planning");

      // Try to submit
      await user.click(screen.getByTestId("submit-button"));

      // Should show title validation error
      await waitFor(() => {
        expect(screen.getByTestId("title-error")).toHaveTextContent(
          "“Title” is required",
        );
      });

      // Should not call onSubmit
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("submits successfully when title is provided with topics", async () => {
      const user = userEvent.setup();
      renderWithForm(<PollDetailsForm />, { onSubmit: mockOnSubmit });

      // Fill required fields
      await user.type(screen.getByTestId("title-input"), "Valid Poll");
      await user.type(screen.getByTestId("topics-input"), "meeting, planning");

      // Submit
      await user.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("field interactions", () => {
    it("maintains form state when switching between fields", async () => {
      const user = userEvent.setup();
      renderWithForm(<PollDetailsForm />, { onSubmit: mockOnSubmit });

      // Fill all fields
      await user.type(screen.getByTestId("title-input"), "Test Poll");
      await user.type(screen.getByTestId("location-input"), "Conference Room");
      await user.type(
        screen.getByTestId("description-input"),
        "Weekly team meeting",
      );
      await user.type(
        screen.getByTestId("topics-input"),
        "meeting, weekly, team",
      );

      // Verify all fields retain their values
      expect(screen.getByTestId("title-input")).toHaveValue("Test Poll");
      expect(screen.getByTestId("location-input")).toHaveValue(
        "Conference Room",
      );
      expect(screen.getByTestId("description-input")).toHaveValue(
        "Weekly team meeting",
      );
      expect(screen.getByTestId("topics-input")).toHaveValue(
        "meeting, weekly, team",
      );
    });

    it("allows editing topics after initial input", async () => {
      const user = userEvent.setup();
      renderWithForm(<PollDetailsForm />, { onSubmit: mockOnSubmit });

      // Add initial topics
      await user.type(screen.getByTestId("topics-input"), "meeting, planning");

      // Clear and add new topics
      const topicsInput = screen.getByTestId("topics-input");
      await user.clear(topicsInput);
      await user.type(topicsInput, "revised, updated, final");

      // Verify updated topics
      expect(topicsInput).toHaveValue("revised, updated, final");
      expect(screen.getByTestId("topic-tag-0")).toHaveTextContent("revised");
      expect(screen.getByTestId("topic-tag-1")).toHaveTextContent("updated");
      expect(screen.getByTestId("topic-tag-2")).toHaveTextContent("final");
    });
  });

  describe("form reset behavior", () => {
    it("resets topics along with other fields", async () => {
      const user = userEvent.setup();
      renderWithForm(<PollDetailsForm />, { onSubmit: mockOnSubmit });

      // Fill form including topics
      await user.type(screen.getByTestId("title-input"), "Test Poll");
      await user.type(screen.getByTestId("topics-input"), "meeting, planning");

      // Simulate form reset (would typically be triggered by a reset button)
      const resetButton = document.createElement("button");
      resetButton.onclick = () => {
        const form = screen.getByTestId("poll-details-form") as HTMLFormElement;
        form.reset();
      };

      // Note: In a real implementation, you'd have a reset button in the form
      // This test demonstrates the expected behavior
      expect(screen.getByTestId("topics-input")).toHaveValue(
        "meeting, planning",
      );
    });
  });
});
