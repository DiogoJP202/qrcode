import { expect, test } from "@playwright/test";

const testPng = {
  name: "qrportal-e2e.png",
  mimeType: "image/png",
  buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"),
};

test("cadastro até cardápio público", async ({ page }) => {
  test.setTimeout(90_000);
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
  const publicUrl = page.url();
  await expect(page.getByRole("heading", { name: storeName })).toBeVisible();
  await expect(page.getByText("Bowl especial")).toBeVisible();

  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    await expect(page.getByRole("heading", { name: storeName })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pratos principais" })).toBeVisible();
  }

  await page.getByRole("button", { name: "Pratos principais" }).click();
  await expect(page).toHaveURL(publicUrl);

  await page.goto("/app/editor?tab=products");
  await page.locator('input[type="file"]').setInputFiles(testPng);
  await expect(page.getByText("Imagem processada e salva.")).toBeVisible();
  await expect(page.getByRole("img", { name: "Bowl especial" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("img", { name: "Bowl especial" })).toBeVisible();

  await page.goto("/app/editor?tab=store");
  await page.locator('input[type="file"]').setInputFiles(testPng);
  await expect(page.getByText("Logo atualizado.")).toBeVisible();
  await expect(page.getByRole("img", { name: "Logo da loja" })).toBeVisible();
  await page.getByRole("button", { name: "Salvar loja" }).click();
  await expect(page.getByText("Loja atualizada.")).toBeVisible();
  await expect(page.getByRole("img", { name: "Logo da loja" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("img", { name: "Logo da loja" })).toBeVisible();

  await page.goto("/app/editor?tab=appearance");
  await expect(page.getByRole("img", { name: `Logo ${storeName}` })).toBeVisible();
  await expect(page.getByRole("img", { name: "Bowl especial" })).toBeVisible();

  await page.goto(publicUrl);
  await expect(page.getByRole("img", { name: `Logo ${storeName}` })).toBeVisible();
  await expect(page.getByRole("img", { name: "Bowl especial" })).toBeVisible();

  const qrResponse = page.waitForResponse((response) => response.url().includes("/qr.svg") && response.status() === 200);
  await page.getByRole("link", { name: /Bowl especial/ }).click();
  await expect(page).toHaveURL(/\/p\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { name: "Bowl especial" })).toBeVisible();
  await expect(page.getByRole("img", { name: "QR Code de Bowl especial" })).toBeVisible();
  expect((await qrResponse).headers()["content-type"]).toContain("image/svg+xml");

  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    await expect(page.getByRole("heading", { name: "Bowl especial" })).toBeVisible();
    await expect(page.getByRole("img", { name: "QR Code de Bowl especial" })).toBeVisible();
  }

  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "PNG" }).click();
  expect((await download).suggestedFilename()).toMatch(/^qr-[0-9a-f]{32}\.png$/);
  await page.getByRole("link", { name: "Cardápio" }).click();
  await expect(page).toHaveURL(publicUrl);
});

test("landing e login permanecem utilizáveis em 375 px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Um cardápio que abre o apetite/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeVisible();
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entre na sua conta" })).toBeVisible();
});
