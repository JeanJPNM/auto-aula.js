import puppeteer, { launch } from 'puppeteer'
import { login, scheduleClasses, seeClasses } from './actions'
import localData from './local_data'
import readline from 'readline'
import * as navigation from './navigation'
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
async function question(query: string): Promise<string> {
  let answer: string = await new Promise((resolve) =>
    rl.question(query, resolve)
  )
  return answer
}
async function main() {
  try {
    const { firstAccess } = localData.get()
    if (firstAccess) {
      const matricula = await question('Digite sua matrícula: ')
      const senha = await question('Digite sua senha')
      localData.setAll({
        password: senha,
        user: matricula,
      })
    }
    const option = await question(
      '[0] agendar aulas\n' + '[1] mudar matrícula\n' + '[2] mudar senha\n'
    )
    switch (Number(option[0])) {
      case 0:
        while (true) {
          try {
            await watchClasses()
            break
          } catch (error) {}
        }
        break
      case 1:
        const user: string = await question('Digite novo número de matrícula: ')
        localData.set('user', user)
        break
      case 2:
        const password: string = await question('Digite a nova senha: ')
        localData.set('password', password)
        break
      default:
        console.log('Opção inválida')
    }
  } catch (error) {
    console.error(error)
  } finally {
    rl.question('Pressione qualquer tecla para continuar\n', () => rl.close())
  }
}
async function watchClasses() {
  console.log('iniciando')
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './puppeteerData',
  })
  try {
    const page = await browser.newPage()
    console.log('navegando para objetivo.br')
    await page.goto('https://objetivo.br', {
      timeout: 300000,
    })
    console.log('fazendo login')
    await navigation.login(page)
    console.log('entrando nas aulas')
    await navigation.seeClasses(page)
    await navigation.scheduleClasses(page)
    await browser.close()
  } catch (error) {
    console.error(error)
  } finally {
    await browser.close()
  }
}
main()
