import localData, { dataFolder } from './local_data'
import ClassWatcher from './class_watcher'
import { LaunchOptions } from 'puppeteer'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import chromePaths from 'chrome-paths'
import nodeNotifier from 'node-notifier'
import path from 'path'
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
        password,
        user,
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
  const launchOptions: LaunchOptions = {
    headless: false,
    userDataDir: path.join(dataFolder, 'puppeteerData'),
    executablePath: chromePaths.chrome,
    defaultViewport: null,
  }
  const classWatcher = new ClassWatcher(launchOptions)
  await classWatcher.launch()
  let lastMessage: string
  classWatcher.onError((error, errorCase) => {
    let message: string
    switch (errorCase) {
      case 'browserDisconnected':
        message = 'O navegador foi desconectado,  por favor reinicie o programa'
        break
      case 'networkChanged':
        message = 'Houve uma alteração na rede'
        break
      case 'noInternet':
        message = 'Sem conexão com a internet'
        break
      case 'pageTimeout':
        message = 'A página excedeu o tempo de carregamento'
        break
      default:
        message = `Ocorreu um erro:\n${error}`
        break
    }
    if (lastMessage !== message) {
      lastMessage = message
      nodeNotifier.notify({
        title: 'Auto Aula',
        message,
      })
    }
  })
  await classWatcher.start()
}
main()
