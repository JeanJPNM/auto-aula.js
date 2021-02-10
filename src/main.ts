import * as actions from './actions'
import localData, { dataFolder } from './local_data'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import chromePaths from 'chrome-paths'
import { delay } from './util'
import path from 'path'
import puppeteer from 'puppeteer'
import readline from 'readline'
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
async function question(query: string): Promise<string> {
  const answer: string = await new Promise((resolve) =>
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
        localData.set(
          'user',
          await question('Digite novo número de matrícula: ')
        )
        break
      case 2:
        localData.set('password', await question('Digite a nova senha: '))
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
    defaultViewport: null,
  })
  const page = await browser.newPage()
  // eslint-disable-next-line no-constant-condition
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
      const { message } = e as Error
      const errors = new Map<RegExp, string | (() => void)>([
        [
          /net::ERR_NAME_NOT_RESOLVED/,
          'Não foi possível acessar o site, verifique sua conexão com a internet',
        ],
        [
          /net::ERR_CONNECTION_TIMED_OUT|TimeoutError/,
          'O site demorou demais para responder',
        ],
        [/net::ERR_NETWORK_CHANGED/, 'Houve uma alteração na rede'],
      ])
      // if the error is known, the user receives a custom message,
      // else show the raw error is shown to the user
      let knownError = false
      for (const [regex, value] of errors) {
        if (message.match(regex)) {
          if (typeof value === 'string') {
            console.log(value)
          } else {
            value()
          }
          knownError = true
        }
      }
      if (!knownError) {
        console.log('Ocorreu um erro:\n')
        console.error(e)
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
