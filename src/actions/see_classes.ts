import { Page } from 'puppeteer'

export async function seeClasses(page: Page) {
  await page.goto('https://objetivo.br/portal-aluno/aulas-ao-vivo', {
    timeout: 300000,
  })
}
