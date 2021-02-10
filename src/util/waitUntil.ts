import delay from './delay'

export default async function waitUntil(
  hours: number,
  minutes: number
): Promise<void> {
  const now = new Date()
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  )
  const delayMilliseconds = target.getTime() - now.getTime()
  if (delayMilliseconds < 0) return
  await delay(delayMilliseconds)
}
