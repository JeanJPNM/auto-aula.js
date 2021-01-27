import fs from 'fs'
interface Data {
  firstAccess: boolean
}
class LocalData implements Data {
  private _firstAccess!: boolean
  public get firstAccess(): boolean {
    return this._firstAccess
  }
  public set firstAccess(v: boolean) {
    this._firstAccess = v
    this.save()
  }

  constructor() {
    try {
      let data = fs.readFileSync('data.json', 'utf8')
      Object.assign(this, JSON.parse(data))
      this._firstAccess = false
    } catch (error) {
      this.writeAll({
        firstAccess: true,
      })
    }
  }

  private save() {
    let data: Data = this
    fs.writeFileSync('data.json', JSON.stringify(data, undefined, 2))
  }
  writeAll(data: Partial<Data>) {
    Object.assign(this, data)
    this.save()
  }
  dispose() {
    this.save()
  }
}
const localData = new LocalData()
export default localData
