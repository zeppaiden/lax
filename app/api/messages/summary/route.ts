import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'No content provided'
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes search results from a chat application. Keep summaries concise and focused on key points."
        },
        {
          role: "user",
          content: `Please provide a brief summary of these search results:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    })

    const summary = completion.choices[0]?.message?.content || 'No summary generated'

    return NextResponse.json({
      success: true,
      response: summary
    })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 