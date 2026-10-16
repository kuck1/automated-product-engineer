import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ReviewPanel } from "../components/view-contract";

test("exposes a recoverable error through accessible controls", async () => {
  const user = userEvent.setup();
  const onRetry = vi.fn();

  render(
    <ReviewPanel
      state={{ status: "error", message: "The service is temporarily unavailable." }}
      onRetry={onRetry}
      onConfirm={vi.fn()}
    />,
  );

  expect(screen.getByRole("heading", { name: "We could not load this review" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Try again" }));
  expect(onRetry).toHaveBeenCalledOnce();
});
