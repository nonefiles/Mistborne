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

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer()
    const { id, type } = await request.json()

    if (!id || type !== "fire") {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    // Fetch current reactions
    const { data: letter, error: fetchError } = await supabase
      .from("letters")
      .select("reactions")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Database error fetching letter for reaction:", fetchError)
      return NextResponse.json({ error: "Database error: " + fetchError.message }, { status: 500 })
    }

    if (!letter) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 })
    }

    const currentReactions = letter.reactions || { fire: 0 }
    const newFireCount = (currentReactions.fire || 0) + 1
    const updatedReactions = { ...currentReactions, fire: newFireCount }

    // Update reactions
    const { error: updateError } = await supabase
      .from("letters")
      .update({ reactions: updatedReactions })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating reactions:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, fireCount: newFireCount })
  } catch (error) {
    console.error("Unexpected error in POST /api/letters/react:", error)
    return NextResponse.json({ error: "Failed to process reaction" }, { status: 500 })
  }
}
