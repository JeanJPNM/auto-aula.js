import { Page } from 'puppeteer'
import localData from '../local_data'

export async function login(page: Page): Promise<void> {
  const loginButton = await page.$('button#login')
  const { user, password } = localData.get()
  if (!loginButton) return
  if (!password || !user)
    throw new Error('O nome e senha devem ser previamente definidos')
  await page.type('#matricula', user)
  await page.type('#senha', password)
  await Promise.all([
    loginButton.click(),
    page.waitForNavigation({
      waitUntil: 'networkidle0',
    }),
  ])
}
