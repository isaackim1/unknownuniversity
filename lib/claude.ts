import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-sonnet-4-20250514'

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  return new Anthropic({ apiKey })
}

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1].trim() : trimmed
  return JSON.parse(raw)
}

export async function generateJson<T>(
  system: string,
  user: string,
): Promise<T> {
  const client = getClient()
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system,
    messages: [{ role: 'user', content: user }],
  })

  const block = message.content.find((part) => part.type === 'text')
  if (!block || block.type !== 'text') {
    throw new Error('Claude returned no text response')
  }

  return extractJson(block.text) as T
}
