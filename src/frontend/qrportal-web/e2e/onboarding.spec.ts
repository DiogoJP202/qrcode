import { expect, test } from "@playwright/test";

test("cadastro até cardápio público", async ({ page }) => {
  const unique = Date.now().toString(36);
  const storeName = `Bistrô E2E ${unique}`;

  await page.goto("/cadastro");
  await page.getByPlaceholder("voce@negocio.com").fill(`owner-${unique}@qrportal.test`);
  await page.getByPlaceholder("Mínimo de 10 caracteres").fill("StrongPass123");

  const registrationResponse = page.waitForResponse((response) =>
    response.url().endsWith("/api/v1/auth/register") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Criar conta grátis" }).click();
  const registration = await registrationResponse;
  const registrationBody = registration.ok() ? "" : await registration.text();
  expect(registration.ok(), `Cadastro retornou HTTP ${registration.status()}: ${registrationBody}`).toBeTruthy();
  await expect(page).toHaveURL(/\/app\/onboarding/);

  await page.getByPlaceholder("Ex.: Casa Manjericão").fill(storeName);
  await page.getByRole("button", { name: "Salvar e continuar" }).click();
  await page.getByPlaceholder("Ex.: Cardápio principal").fill(`Cardápio ${unique}`);
  await page.getByRole("button", { name: "Salvar e continuar" }).click();
  await page.getByPlaceholder("Ex.: Pratos principais").fill("Pratos principais");
  await page.getByRole("button", { name: "Criar categoria" }).click();
  await page.getByPlaceholder("Ex.: Bowl da casa").fill("Bowl especial");
  await page.locator('input[type="number"]').fill("34.90");
  await page.getByRole("button", { name: "Adicionar produto" }).click();
  await page.getByRole("button", { name: "Verde" }).click();
  await page.getByRole("button", { name: "Aplicar aparência" }).click();
  await page.getByRole("button", { name: "Publicar cardápio" }).click();

  await expect(page).toHaveURL(/\/m\//);
  await expect(page.getByRole("heading", { name: storeName })).toBeVisible();
  await expect(page.getByText("Bowl especial")).toBeVisible();
});

test("landing e login permanecem utilizáveis em 375 px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Um cardápio que abre o apetite/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeVisible();
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entre na sua conta" })).toBeVisible();
});
