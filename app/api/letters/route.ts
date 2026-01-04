import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// GET - fetch arrived letters
export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("letters")
      .select("*")
      .lte("delivery_at", now)
      .order("delivery_at", { ascending: false })

    if (error) {
      console.error("Supabase error fetching letters:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Unexpected error in GET /api/letters:", error)
    return NextResponse.json({ error: "Failed to fetch letters" }, { status: 500 })
  }
}

// POST - send a new letter
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer()
    const { content, mood } = await request.json()

    const deliveryAt = new Date().toISOString()

    const { error } = await supabase.from("letters").insert({
      content,
      mood,
      delivery_at: deliveryAt,
    })

    if (error) {
      console.error("Supabase error inserting letter:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error in POST /api/letters:", error)
    return NextResponse.json({ error: "Failed to send letter" }, { status: 500 })
  }
}
