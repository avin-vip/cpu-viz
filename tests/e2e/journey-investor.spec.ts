import { test, expect } from "@playwright/test";

test.describe("Journey B — investor explores supply chain", () => {
  test("landing to supply chain graph", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /supply chain/i }).first().click();
    await expect(page).toHaveURL(/\/graph/);
  });

  test("company directory lists companies", async ({ page }) => {
    await page.goto("/companies");
    await expect(page.getByRole("heading", { name: /companies/i })).toBeVisible();
  });
});
