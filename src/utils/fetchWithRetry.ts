export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
      console.error(`Fetch attempt ${i + 1} failed:`, response.status)
    } catch (error) {
      console.error(`Fetch error on attempt ${i + 1}:`, error)
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`)
}
