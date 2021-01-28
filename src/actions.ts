import { Page } from 'puppeteer'
import classes from './classes'
import { delay, waitUntil } from './util'
const matricula = '01010026310'
const senha = '0604'
export async function login(page: Page): Promise<void> {
  const loginButton = await page.$('button#login')
  if (!loginButton) return
  await page.type('#matricula', matricula)
  await page.type('#senha', senha)
  await Promise.all([
    loginButton.click(),
    page.waitForNavigation({
      waitUntil: 'networkidle0',
    }),
  ])
}
export async function seeClasses(page: Page) {
  await page.goto('https://objetivo.br/portal-aluno/aulas-ao-vivo', {
    timeout: 60000,
  })
}
export async function scheduleClasses(page: Page) {
  page.on('dialog', async (e, args) => {
    console.log(e)
    await e.accept()
    await delay(500)
    await seeClasses(page)
  })
  for (let myClass of classes) {
    console.log(`aula das ${myClass.hours} e ${myClass.minutes}`)
    const now = new Date()
    // check if the class is open
    if (now > myClass.end) continue
    await waitUntil(myClass.start.getHours(), myClass.start.getMinutes() + 1)
    console.log('entrando...')
    const loginButton = await page.$('button#login')
    // check if the class can be accessed
    if (loginButton) {
      await login(page)
      await seeClasses(page)
    }
    while (true) {
      const link = await page.$('a.link-aula')
      if (link) {
        await Promise.all([
          link.click(),
          page.waitForNavigation({
            timeout: 60000,
          }),
        ])
        await delay(5000)
        await page.click('div[role=button]')
        await delay(2000)
        await seeClasses(page)
        break
      } else {
        await delay(5000)
        await page.reload()
      }
    }
  }
}
