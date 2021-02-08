import puppeteer, { launch } from 'puppeteer'
import * as actions from './actions'
import localData, { dataFolder } from './local_data'
import readline from 'readline'
import path from 'path'
// @ts-ignore
import chromePaths from 'chrome-paths'
import { delay } from './util'
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
      const user = await question('Digite sua matrícula: ')
      const password = await question('Digite sua senha: ')
      localData.setAll({
        password: password,
        user: user,
      })
    }
    const option = await question(
      '[0] agendar aulas\n' + '[1] mudar matrícula\n' + '[2] mudar senha\n'
    )
    switch (Number(option[0])) {
      case 0:
        await watchClasses()
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
    userDataDir: path.join(dataFolder, 'puppeteerData'),
    executablePath: chromePaths.chrome,
  })
  const page = await browser.newPage()
  while (true) {
    try {
      console.log('navegando para objetivo.br')
      await page.goto('https://objetivo.br', {
        timeout: 300000,
      })
      console.log('fazendo login')
      await actions.login(page)
      console.log('entrando nas aulas')
      await actions.seeClasses(page)
      await actions.scheduleClasses(page)
      await browser.close()
      break
    } catch (e) {
      const error = e as Error
      switch (error.message) {
        case 'net::ERR_NAME_NOT_RESOLVED at https://objetivo.br':
          console.log(
            'Não foi possível acessar http://objetivo.br' +
              '\nverifique sua conexão com a internet'
          )
          break
        case 'net::ERR_CONNECTION_TIMED_OUT at https://objetivo.br':
          console.log('https://objetivo.br demorou demais para responder')
          break
        case 'net::ERR_NETWORK_CHANGED at https://objetivo.br':
          console.log('Houve uma alteração na rede')
          break
        default:
          console.log('Ocorreu um erro:\n')
          console.error(error)
      }
      for (let i = 5; i > 0; i--) {
        process.stdout.write(`\rTentando novamente em ${i}`)
        await delay(1000)
      }
      console.log('')
    }
  }
}
main()
