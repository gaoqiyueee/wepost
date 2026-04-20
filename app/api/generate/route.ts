import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildPrompt, Mode, BasicStyle, Role } from '@/lib/prompts'

const PRIMARY_MODEL = process.env.PRIMARY_MODEL || 'gpt-4o'
const FALLBACK_MODEL = process.env.FALLBACK_MODEL || 'gpt-4o-mini'

function getClient() {
  return new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: process.env.API_BASE_URL || 'https://api.openai.com/v1',
  })
}

async function callModel(
  client: OpenAI,
  model: string,
  system: string,
  user: string,
  imageBase64?: string
): Promise<string> {
  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = imageBase64
    ? [
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'low' },
        },
        { type: 'text', text: user },
      ]
    : [{ type: 'text', text: user }]

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userContent },
    ],
    max_tokens: 1000,
    temperature: 0.9,
  })

  return response.choices[0]?.message?.content ?? ''
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      imageBase64,
      mode,
      style,
      role,
      customRole,
      description,
    }: {
      imageBase64?: string
      mode: Mode
      style?: BasicStyle
      role?: Role
      customRole?: string
      description?: string
    } = body

    const { system, user } = buildPrompt(mode, {
      style,
      role,
      customRole,
      description,
      hasImage: !!imageBase64,
    })

    const client = getClient()
    let raw = ''

    // 先尝试主力模型（带视觉）
    try {
      raw = await callModel(client, PRIMARY_MODEL, system, user, imageBase64)
    } catch (e: unknown) {
      console.warn('Primary model failed, trying fallback:', e)
      // 保底模型：不传图片，仅文字
      raw = await callModel(client, FALLBACK_MODEL, system, user)
    }

    // 年代穿越版：结构化解析
    if (mode === 'era') {
      const result = parseEraResult(raw)
      return NextResponse.json({ mode: 'era', result })
    }

    // 其余模式：按 --- 分割为数组
    const captions = raw
      .split(/---+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3)

    return NextResponse.json({ mode, captions })
  } catch (err: unknown) {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function parseEraResult(raw: string): { era: string; content: string }[] {
  const eras = [
    { key: '80年代日记体', label: '📻 80年代日记体' },
    { key: 'QQ空间体', label: '💜 QQ空间体' },
    { key: '小红书体', label: '📕 小红书体' },
  ]
  return eras.map(({ key, label }) => {
    const regex = new RegExp(`\\[${key}\\][\\s\\S]*?\\n([\\s\\S]*?)(?=\\[|$)`)
    const match = raw.match(regex)
    return {
      era: label,
      content: match ? match[1].trim() : '',
    }
  })
}
