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
  const page = await browser.newPage()
  console.log('navegando para objetivo.br')
  await page.goto('https://objetivo.br', {
    timeout: 60000,
  })
  console.log('fazendo login')
  await login(page)
  console.log('entrando nas aulas')
  await seeClasses(page)
  await scheduleClasses(page)
  await browser.close()
}
main()
