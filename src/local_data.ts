import fs from 'fs'
import path from 'path'
export enum LabClass {
  bio,
  info,
}
interface Data {
  firstAccess: boolean
  user?: string
  password?: string
  lab: LabClass
}
function currentLab() {
  const start = new Date(2021, 1, 2)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = (today.valueOf() - start.valueOf()) / (1000 * 60 * 60 * 24)
  const weeks = Math.floor(days / 7)
  if (weeks % 2 == 0) {
    return LabClass.info
  } else {
    return LabClass.bio
  }
}
const defaultData: Data = {
  firstAccess: true,
  lab: currentLab(),
}
export const dataFolder = path.join(process.env.APPDATA ?? './', 'auto-aula')
const dataPath = path.join(dataFolder, 'data.json')
class LocalData {
  private data: Data = defaultData
  constructor() {
    try {
      let text = fs.readFileSync(dataPath, 'utf8')
      Object.assign(this.data, JSON.parse(text))
      this.set('firstAccess', false)
    } catch (error) {
      this.set('firstAccess', true)
    }
  }
  private save() {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataFolder)
    }
    fs.writeFileSync(dataPath, JSON.stringify(this.data, undefined, 2))
  }
  setAll(data: Partial<Data>) {
    Object.assign(this.data, data)
    this.save()
  }
  set<K extends keyof Data>(key: K, value: Data[K]) {
    this.data[key] = value
    this.save()
  }
  get(): Data {
    return { ...this.data }
  }
  dispose() {
    this.save()
  }
}
const localData = new LocalData()
export default localData
