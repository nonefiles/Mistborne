export interface Letter {
  id: string
  content: string
  mood: string
  delivery_at: string
  created_at: string
}

export async function sendLetter(content: string, mood: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, mood }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to send letter" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending letter:", error)
    return { success: false, error: "Failed to send letter" }
  }
}

export async function getArrivedLetters(): Promise<Letter[]> {
  try {
    const response = await fetch("/api/letters")

    if (!response.ok) {
      console.error("Error fetching letters:", response.statusText)
      return []
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching letters:", error)
    return []
  }
}
