import { NextResponse } from "next/server"
import { generateDailyQuestion } from "@/lib/llm"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = (searchParams.get("type") ?? "verbal") as "verbal" | "quant" | "ielts"
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10)

    if (!["verbal", "quant", "ielts"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const question = await generateDailyQuestion(type, date)
    return NextResponse.json(question)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 })
  }
}
