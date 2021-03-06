import * as actions from './actions'
import {
  Browser,
  ChromeArgOptions,
  LaunchOptions,
  Page,
  Product,
  launch,
} from 'puppeteer'
import { delay } from './util'
const errorCases = {
  noInternet: /net::ERR_NAME_NOT_RESOLVED/,
  pageTimeout: /net::ERR_CONNECTION_TIMED_OUT|TimeoutError/,
  networkChanged: /net::ERR_NETWORK_CHANGED/,
  browserDisconnected: /Navigation failed because browser has disconnected/,
  pageDisconnected: /ProtocolError/,
}
export type ClassWatcherOptions = LaunchOptions &
  ChromeArgOptions & {
    product?: Product
    extraPrefsFirefox?: Record<string, unknown>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultViewport?: any
  }
type ErrorCase = keyof typeof errorCases | 'unknown'
type Listener = (error: Error, errorCase: ErrorCase) => void | Promise<void>
type ListenerSubscription = {
  unsubscribe: () => void
}
/// This class is meant to manage the user's online classes
export default class ClassWatcher {
  browser?: Browser

  page?: Page

  private readonly errorListeners: Listener[] = []

  constructor(public readonly launchOptions: ClassWatcherOptions) {}

  async launch(): Promise<void> {
    this.browser = await launch(this.launchOptions)
    this.page = await this.browser.newPage()
    this.page.setDefaultTimeout(300000)
  }

  private async run(): Promise<void> {
    if (!this.browser || !this.page)
      throw new Error('The ClassWatcher should be initiated before starting')
    await this.page.goto('http://objetivo.br')
    await actions.login(this.page)
    await actions.seeClasses(this.page)
    await actions.scheduleClasses(this.page)
  }

  async start(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await this.run()
        break
      } catch (error) {
        const { message } = error as Error
        if (message.match(errorCases.browserDisconnected)) {
          this.notifyListeners(error, 'browserDisconnected')
          await this.resetAll()
        } else if (message.match(errorCases.networkChanged)) {
          await this.resetPage()
          this.notifyListeners(error, 'networkChanged')
        } else if (message.match(errorCases.noInternet)) {
          await this.resetPage()
          this.notifyListeners(error, 'noInternet')
        } else if (message.match(errorCases.pageTimeout)) {
          await this.resetPage()
          this.notifyListeners(error, 'pageTimeout')
        } else if (message.match(errorCases.pageDisconnected)) {
          await this.resetPage()
          this.notifyListeners(error, 'pageDisconnected')
        } else {
          this.notifyListeners(error, 'unknown')
        }
        await delay(5000)
      }
    }
    this.browser?.close()
  }

  private async resetPage(): Promise<void> {
    if (!this.browser) throw new Error('The ClassWatcher must be initialized')
    this.page?.close()
    this.page = await this.browser?.newPage()
  }

  private async resetAll(): Promise<void> {
    function giveUp() {
      process.exit(1)
    }
    const timeout = setTimeout(giveUp, 5000)
    await this.browser?.close()
    clearTimeout(timeout)
    await this.launch()
  }

  private notifyListeners(error: Error, payload: ErrorCase) {
    for (const listener of this.errorListeners) {
      listener(error, payload)
    }
  }

  onError(cb: Listener): ListenerSubscription {
    this.errorListeners.push(cb)
    return {
      unsubscribe: () => {
        const index = this.errorListeners.indexOf(cb)
        if (index > -1) this.errorListeners.splice(index, 1)
      },
    }
  }
}
