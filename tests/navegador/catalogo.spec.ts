import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

const CAPTURAS = "./.test-work/capturas"

async function axe(page: Page, contexto?: string) {
  const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
  if (contexto) builder.include(contexto)
  const { violations } = await builder.analyze()
  const resumo = violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.slice(0, 4).map((n) => n.target.join(" ")).join("\n  ")}`)
  expect(resumo, resumo.join("\n")).toEqual([])
}

async function tema(page: Page, nome: "Claro" | "Escuro") {
  await page.getByRole("group", { name: "Tema da interface" }).getByRole("button", { name: nome, exact: true }).click()
  if (nome === "Escuro") await expect(page.locator("html")).toHaveClass(/\bdark\b/)
  else await expect(page.locator("html")).not.toHaveClass(/\bdark\b/)
}

async function aberto(page: Page, gatilho: () => Promise<void>, seletor: string) {
  await gatilho()
  await expect(page.locator(seletor).first()).toBeVisible()
  await axe(page, seletor)
  await page.keyboard.press("Escape")
  await expect(page.locator(seletor)).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
  const erros: string[] = []
  page.on("pageerror", (e) => erros.push(e.message))
  page.on("console", (m) => { if (m.type() === "error") erros.push(m.text()) })
  ;(page as Page & { erros: string[] }).erros = erros
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Catálogo de componentes" })).toBeVisible()
})

test.afterEach(async ({ page }) => {
  expect((page as Page & { erros: string[] }).erros).toEqual([])
})

for (const nome of ["Claro", "Escuro"] as const) {
  test(`página inteira sem violações WCAG 2.1 AA — tema ${nome}`, async ({ page }) => {
    await tema(page, nome)
    await axe(page)
    await page.screenshot({ path: `${CAPTURAS}/catalogo-${nome.toLowerCase()}.png`, fullPage: true, caret: "initial" })
  })

  test(`sobreposições abertas sem violações — tema ${nome}`, async ({ page }) => {
    await tema(page, nome)
    const botao = (n: string) => page.getByRole("button", { name: n, exact: true })
    await aberto(page, () => botao("Abrir diálogo").click(), '[role="dialog"]')
    await aberto(page, () => botao("Excluir empresa").click(), '[role="alertdialog"]')
    await aberto(page, () => botao("Abrir painel").click(), '[role="dialog"]')
    await aberto(page, () => botao("Mais ações").click(), '[role="menu"]')
    await aberto(page, () => page.getByRole("combobox", { name: "Plano" }).click(), '[role="listbox"]')
    await aberto(page, () => botao("Ver detalhes").click(), '[data-slot="popover-content"]')
    await botao("Dica").focus()
    await expect(page.getByRole("tooltip")).toBeVisible()
    await axe(page, '[data-slot="tooltip-content"]')
    await botao("Mostrar notificação").click()
    await expect(page.getByText("Mapeamento salvo")).toBeVisible()
    // Espera a animação de entrada: com opacidade parcial o axe mede um contraste que ninguém vê.
    await expect(page.locator("[data-sonner-toast]")).toHaveCSS("opacity", "1")
    await axe(page, "[data-sonner-toaster]")
    await page.screenshot({ path: `${CAPTURAS}/notificacao-${nome.toLowerCase()}.png`, caret: "initial" })
  })
}

test("DataTable: ordena números com negativos, busca sem acento e pagina em pt-BR", async ({ page }) => {
  const tabela = page.getByRole("table", { name: "Faturas da empresa" })
  const valor = tabela.getByRole("columnheader", { name: /Valor/ })
  await expect(valor).toHaveAttribute("aria-sort", "none")
  // Colunas numéricas começam do maior para o menor (padrão do TanStack para números).
  await valor.getByRole("button").click()
  await expect(valor).toHaveAttribute("aria-sort", "descending")
  await expect(tabela.getByRole("row").nth(1)).not.toContainText("-R$")
  await valor.getByRole("button").click()
  await expect(valor).toHaveAttribute("aria-sort", "ascending")
  await expect(tabela.getByRole("row").nth(1)).toContainText("-R$") // negativos primeiro, sem se agruparem como texto
  const valores = await tabela.getByRole("row").evaluateAll((linhas) =>
    linhas.slice(1).map((l) => Number((l.children[4]?.textContent ?? "").replace(/[^\d,-]/g, "").replace(",", "."))))
  expect(valores).toEqual([...valores].sort((a, b) => a - b))

  await expect(page.getByText("Página 1 de 3")).toBeVisible()
  await page.getByRole("button", { name: "Próxima página" }).click()
  await expect(page.getByText("Página 2 de 3")).toBeVisible()

  await page.getByRole("searchbox", { name: "Buscar faturas" }).fill("sao jorge") // sem acento
  await expect(tabela.getByRole("row")).not.toHaveCount(1)
  for (const linha of await tabela.getByRole("row").all().then((l) => l.slice(1))) await expect(linha).toContainText("Padaria São Jorge")
  await page.getByRole("searchbox", { name: "Buscar faturas" }).fill("zzz")
  await expect(tabela.getByText("Nenhum resultado.")).toBeVisible()
})

test("celular: barra lateral em gaveta e sem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await page.getByRole("button", { name: "Alternar barra lateral" }).first().click()
  const gaveta = page.getByRole("dialog", { name: "Barra lateral" })
  await expect(gaveta).toBeVisible()
  await expect(gaveta.getByRole("link", { name: "Formulários" })).toBeVisible()
  await axe(page, '[role="dialog"]')
  await page.screenshot({ path: `${CAPTURAS}/celular-gaveta.png`, caret: "initial" })
  await page.keyboard.press("Escape")
  await expect(gaveta).toHaveCount(0)
  // O foco volta ao botão que abriu a gaveta (o Sheet da sidebar não tem Dialog.Trigger).
  await expect(page.getByRole("button", { name: "Alternar barra lateral" }).first()).toBeFocused()
  // Seguir um link fecha a gaveta (em layouts persistentes ela ficaria aberta sobre a nova página).
  await page.getByRole("button", { name: "Alternar barra lateral" }).first().click()
  await gaveta.getByRole("link", { name: "Formulários" }).click()
  await expect(gaveta).toHaveCount(0)
  await expect(page).toHaveURL(/#formularios$/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: `${CAPTURAS}/celular.png`, fullPage: true, caret: "initial" })
})

test("tema escolhido persiste ao recarregar e segue o sistema no modo Sistema", async ({ page }) => {
  await tema(page, "Escuro")
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/\bdark\b/)
  await page.getByRole("group", { name: "Tema da interface" }).getByRole("button", { name: "Sistema", exact: true }).click()
  await page.emulateMedia({ colorScheme: "dark" })
  await expect(page.locator("html")).toHaveClass(/\bdark\b/)
  await page.emulateMedia({ colorScheme: "light" })
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/)
})
