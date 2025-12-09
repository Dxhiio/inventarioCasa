import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
// import OpenAI from 'openai' 

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    // 1. Generate Embedding (Mocked)
    const embedding = Array(1536).fill(0).map(() => Math.random())

    // 2. Query Supabase
    const supabase = await createClient()
    
    // Call the RPC function we defined in schema.sql
    // @ts-ignore
    const { data, error } = await supabase.rpc('match_inventory', {
      query_embedding: embedding,
      match_threshold: 0.1, // Low threshold for mock/demo
      match_count: 5
    })

    if (error) {
      console.error("Supabase RPC Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ results: data })
  } catch (error: unknown) {
    console.error("Search Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
