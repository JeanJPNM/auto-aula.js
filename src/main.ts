import puppeteer from 'puppeteer'
import { login, scheduleClasses, seeClasses } from './actions'
import localData from './local_data'

async function main() {
  const isFirstAccess: boolean = localData.firstAccess
  console.log('iniciando')
  const browser = await puppeteer.launch({
    headless: !isFirstAccess,
    userDataDir: './puppeteerData',
  })
  console.log('puppeteer aberto')
  const page = await browser.newPage()
  console.log('página criada')
  await page.goto('https://objetivo.br', {
    timeout: 60000,
  })
  console.log('navegando para objetivo.br')
  await login(page)
  console.log('login feito')
  await seeClasses(page)
  console.log('entrando nas aulas')
  await scheduleClasses(page)
  await browser.close()
}
main()
