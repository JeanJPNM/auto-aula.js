import { ElementHandle, Page } from 'puppeteer'
import { delay, waitUntil } from '../util'
import localData, { LabClass } from '../local_data'
import classes from '../classes'
import { login } from './login'
import { seeClasses } from './see_classes'

export async function scheduleClasses(page: Page): Promise<void> {
  for (const myClass of classes) {
    console.log(`aula das ${myClass.hours} e ${myClass.minutes}`)
    const now = new Date()
    // check if the class is open
    if (now > myClass.end) continue
    await waitUntil(myClass.start.getHours(), myClass.start.getMinutes())
    console.log('entrando...')
    const loginButton = await page.$('button#login')
    // check if the class can be accessed
    if (loginButton) {
      await login(page)
      await seeClasses(page)
    }
    await page.reload()
    let currentHref = ''
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const links = await page.$$('a.link-aula')
      if (links.length > 0) {
        let link: ElementHandle<Element>
        if (links.length === 1) {
          ;[link] = links
        } else {
          const { lab } = localData.get()
          link = links[lab]
          if (lab === LabClass.bio) {
            localData.set('lab', LabClass.info)
          } else {
            localData.set('lab', LabClass.bio)
          }
        }
        const href = (await (
          await link.getProperty('href')
        ).jsonValue()) as string
        if (currentHref !== href) {
          currentHref = href
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
        }
      } else {
        await delay(5000)
        await page.reload()
      }
    }
  }
}
