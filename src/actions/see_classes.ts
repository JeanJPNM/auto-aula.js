import { Page } from 'puppeteer'

export async function seeClasses(page: Page): Promise<void> {
  await page.goto('https://objetivo.br/portal-aluno/aulas-ao-vivo')
}
