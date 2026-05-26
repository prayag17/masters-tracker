import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { evaluateSOP } from "@/lib/llm"

export async function POST(req: Request) {
  let sopId: string | undefined

  try {
    const body = await req.json()
    sopId = body.sopId
    const content: string = body.content ?? ""
    const universityContext: string | undefined = body.universityContext

    if (!content || content.trim().length < 50) {
      return NextResponse.json({ error: "SOP content too short (min 50 chars)" }, { status: 400 })
    }

    // Mark as running
    if (sopId) {
      await prisma.sOPIteration.update({
        where: { id: sopId },
        data: { evaluationStatus: "running" },
      })
    }

    const result = await evaluateSOP(content, universityContext)

    // Persist evaluation results
    if (sopId) {
      await prisma.sOPIteration.update({
        where: { id: sopId },
        data: {
          overallScore: result.overallScore,
          criticFeedback: result.criticFeedback as object,
          officerFeedback: result.officerFeedback as object,
          validatorOutput: result.validatorOutput as object,
          evaluationStatus: "done",
          evaluatedAt: new Date(result.evaluatedAt),
        },
      })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error("SOP evaluation error:", e)

    if (sopId) {
      try {
        await prisma.sOPIteration.update({
          where: { id: sopId },
          data: { evaluationStatus: "failed" },
        })
      } catch {}
    }

    return NextResponse.json(
      { error: "Evaluation failed. Ensure Ollama is running: ollama serve && ollama pull llama3" },
      { status: 500 }
    )
  }
}
