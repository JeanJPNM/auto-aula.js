export async function delay(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds))
}
export async function waitUntil(hours: number, minutes: number) {
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
