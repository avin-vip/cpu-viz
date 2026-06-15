import { test, expect } from "@playwright/test";

test.describe("Journey A — student learns CPU", () => {
  test("landing to fundamentals lesson", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("link", { name: /start learning/i }).click();
    await expect(page).toHaveURL(/\/fundamentals/);
  });

  test("navigate to CPU pipeline explorer", async ({ page }) => {
    await page.goto("/cpu/pipeline");
    await expect(page.getByText(/fetch/i).first()).toBeVisible();
  });
});
