class ScheduledClass {
  start: Date
  end: Date
  get hours() {
    return this.start.getHours()
  }
  get minutes() {
    return this.start.getMinutes()
  }
  constructor(hours: number, minutes: number) {
    this.start = new Date()
    this.start.setHours(hours, minutes)
    // as aulas duram 50 minutos
    this.end = new Date(this.start.getTime() + 50 * 60 * 1000)
  }
}
const classes: ScheduledClass[] = [
  new ScheduledClass(7, 10),
  new ScheduledClass(8, 5),
  new ScheduledClass(9, 0),
  new ScheduledClass(10, 10),
  new ScheduledClass(11, 5),
  new ScheduledClass(12, 0),
]
// The first class is not accessible at tuesdays and thursdays
const day = new Date().getDay()
if (day === 2 || day === 4) {
  classes.shift()
}
export default classes
