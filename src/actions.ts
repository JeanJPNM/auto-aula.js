import { ElementHandle, Page } from 'puppeteer'
import classes from './classes'
import localData, { LabClass } from './local_data'
import { delay, waitUntil } from './util'

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
export async function seeClasses(page: Page) {
  await page.goto('https://objetivo.br/portal-aluno/aulas-ao-vivo', {
    timeout: 300000,
  })
}
export async function scheduleClasses(page: Page) {
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
    await page.reload()
    while (true) {
      const links = await page.$$('a.link-aula')
      if (links.length > 0) {
        let link: ElementHandle<Element>
        if (links.length == 1) {
          link = links[0]
        } else {
          const { lab } = localData.get()
          link = links[lab]
          if (lab == LabClass.bio) {
            localData.set('lab', LabClass.info)
          } else {
            localData.set('lab', LabClass.bio)
          }
        }
        await Promise.all([
          link.click(),
          page.waitForNavigation({
            timeout: 300000,
          }),
        ])
        await page.waitForSelector('div[role=button]')
        await page.click('div[role=button]')
        await delay(10000)
        await seeClasses(page)
        break
      } else {
        await delay(5000)
        await page.reload()
      }
    }
  }
}
