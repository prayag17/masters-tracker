const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? ""
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini"

// Some free/open models don't support response_format; detect by model name
const supportsJsonMode = () =>
  OPENROUTER_MODEL.startsWith("openai/") || OPENROUTER_MODEL.startsWith("anthropic/")

async function callOpenRouter(prompt: string, systemPrompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set. Add it to your .env file.")
  }

  const body: Record<string, unknown> = {
    model: OPENROUTER_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  }
  if (supportsJsonMode()) body.response_format = { type: "json_object" }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://masters-tracker.local",
      "X-Title": "MastersTrack SOP Evaluator",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

function safeParseJSON(text: string): unknown {
  // 1. Direct parse
  try { return JSON.parse(text) } catch {}

  // 2. Markdown fence: ```json ... ```
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) { try { return JSON.parse(fence[1].trim()) } catch {} }

  // 3. Extract from first { to last } (handles preamble / postamble text)
  const firstBrace = text.indexOf("{")
  const lastBrace = text.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try { return JSON.parse(text.slice(firstBrace, lastBrace + 1)) } catch {}
  }

  // 4. Extract from first [ to last ] (array responses)
  const firstBracket = text.indexOf("[")
  const lastBracket = text.lastIndexOf("]")
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try { return JSON.parse(text.slice(firstBracket, lastBracket + 1)) } catch {}
  }

  return { raw: text }
}

// ─── Agent 1: The Critic ───────────────────────────────────────────────────
const CRITIC_SYSTEM = `You are a professional academic writing critic specializing in graduate school admission essays.
Evaluate the provided Statement of Purpose for narrative quality and writing craft.

Respond ONLY with a valid JSON object matching this exact structure (no markdown, no extra text):
{
  "scores": { "narrativeHook": 7, "flow": 8, "grammar": 9, "specificity": 6 },
  "overallCriticScore": 7.5,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "specificImprovements": [
    { "paragraph": 1, "issue": "...", "suggestion": "..." }
  ],
  "rewrittenOpening": "A suggested stronger opening sentence..."
}`

// ─── Agent 2: The Admissions Officer ──────────────────────────────────────
const OFFICER_SYSTEM = `You are a seasoned graduate admissions officer at a top research university.
Evaluate SOPs from the perspective of: research fit, clarity of goals, demonstrated passion, and university-specific alignment.
Consider: does the applicant mention specific faculty, research groups, or courses? Is the 'why this university' section compelling?

Respond ONLY with a valid JSON object matching this exact structure (no markdown, no extra text):
{
  "researchFitScore": 8,
  "goalClarityScore": 7,
  "universityAlignmentScore": 6,
  "overallOfficerScore": 7,
  "missingElements": ["missing item 1", "missing item 2"],
  "strongPoints": ["strong point 1"],
  "redFlags": ["any red flags or clichés"],
  "universitySpecificSuggestions": ["mention specific lab", "reference professor X's work on Y"]
}`

// ─── Agent 3: The Validator / Judge ───────────────────────────────────────
const VALIDATOR_SYSTEM = `You are a senior graduate admissions consultant acting as a judge.
You will receive an SOP draft and two expert feedback reports (Critic + Admissions Officer).
Synthesize both reports, identify agreements and conflicts, and output a final unified critique.

Respond ONLY with a valid JSON object matching this exact structure (no markdown, no extra text):
{
  "finalScore": 7.2,
  "verdict": "Strong potential, needs targeted revision",
  "consensusStrengths": ["agreed strength 1"],
  "criticalIssues": [
    { "priority": "HIGH", "issue": "...", "recommendation": "..." }
  ],
  "checklist": [
    { "item": "Clear research goal stated", "status": "PASS" },
    { "item": "Specific faculty/lab mentioned", "status": "FAIL" },
    { "item": "No generic opening cliché", "status": "PASS" },
    { "item": "Word count 800-1000", "status": "PASS" },
    { "item": "Future goals section present", "status": "FAIL" }
  ],
  "revisedStructure": ["Para 1: Hook + background", "Para 2: Research experience", "Para 3: Why this program", "Para 4: Future goals"]
}`

// ─── Daily Prep Question ──────────────────────────────────────────────────
export type PrepQuestion = {
  type: "verbal" | "quant" | "ielts"
  questionType: string
  question: string
  options: string[]
  answer: string
  explanation: string
  difficulty: "Easy" | "Medium" | "Hard"
}

const PREP_SYSTEM = `You are a test prep expert. Output ONLY a raw JSON object — no markdown, no backticks, no explanation text before or after. Just the JSON.`

const TYPE_HINTS: Record<string, string> = {
  verbal: "GRE Verbal (Text Completion, Sentence Equivalence, or Reading Comprehension)",
  quant:  "GRE Quantitative (Problem Solving or Quantitative Comparison)",
  ielts:  "IELTS (vocabulary in context, grammar, or Task 2 prompt with model answer)",
}

function buildPrepPrompt(type: string, dateStr: string): string {
  return `Generate a unique ${TYPE_HINTS[type]} practice question. Use date "${dateStr}" as a seed for uniqueness.

Your entire response must be exactly this JSON object with the values filled in:
{"type":"${type}","questionType":"TEXT_COMPLETION","question":"QUESTION_TEXT","options":["A. option","B. option","C. option","D. option"],"answer":"A","explanation":"EXPLANATION","difficulty":"Medium"}

Rules:
- "options" must be an array of exactly 4 strings, each starting with "A. ", "B. ", "C. ", or "D. "
- "answer" must be a single uppercase letter: A, B, C, or D
- "difficulty" must be one of: Easy, Medium, Hard
- Output nothing except the JSON object`
}

function parseNaturalLanguageQuestion(text: string, type: string): PrepQuestion | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)

  // Find the 4 option lines (A. / A) / (A) etc.)
  const optLines = lines.filter((l) => /^[A-D][.)]\s+.+/i.test(l))
  if (optLines.length < 4) return null
  const options = optLines.slice(0, 4).map((l) => {
    const letter = l[0].toUpperCase()
    return `${letter}. ${l.replace(/^[A-D][.)]\s+/i, "").trim()}`
  })

  // Find answer
  const answerLine = lines.find((l) => /\b(answer|correct)[:\s]+[A-D]\b/i.test(l))
  const answerMatch = answerLine?.match(/\b([A-D])\b/i)
  if (!answerMatch) return null
  const answer = answerMatch[1].toUpperCase()

  // Question text = everything before the first option, stripped of labels
  const firstOptIdx = lines.findIndex((l) => /^[A-D][.)]\s+/i.test(l))
  const question = lines
    .slice(0, firstOptIdx)
    .filter((l) => !/^(question|options?|choices?|answer|explanation)[:\s]/i.test(l))
    .join(" ")
    .replace(/\*\*/g, "")
    .trim()
  if (!question) return null

  // Explanation = lines after the answer line
  const answerIdx = answerLine ? lines.indexOf(answerLine) : -1
  const explanation = lines
    .slice(answerIdx + 1)
    .filter((l) => !/^(explanation|rationale|solution)[:\s]/i.test(l))
    .join(" ")
    .replace(/\*\*/g, "")
    .trim() || "See the answer above."

  return {
    type: type as PrepQuestion["type"],
    questionType: "Practice Question",
    question,
    options,
    answer,
    explanation,
    difficulty: "Medium",
  }
}

export async function generateDailyQuestion(
  type: "verbal" | "quant" | "ielts",
  dateStr: string
): Promise<PrepQuestion> {
  const raw = await callOpenRouter(buildPrepPrompt(type, dateStr), PREP_SYSTEM)

  // 1. Try JSON extraction (handles preamble / markdown fences)
  const parsed = safeParseJSON(raw) as Record<string, unknown>
  if (
    typeof parsed.question === "string" &&
    Array.isArray(parsed.options) &&
    parsed.options.length >= 4 &&
    typeof parsed.answer === "string"
  ) {
    return {
      type,
      questionType: (parsed.questionType as string) ?? "Practice Question",
      question: parsed.question as string,
      options: (parsed.options as string[]).slice(0, 4),
      answer: (parsed.answer as string).toUpperCase().charAt(0),
      explanation: (parsed.explanation as string) ?? "",
      difficulty: (parsed.difficulty as PrepQuestion["difficulty"]) ?? "Medium",
    }
  }

  // 2. Fall back to natural-language parser (model ignored JSON instruction)
  const nlParsed = parseNaturalLanguageQuestion(raw, type)
  if (nlParsed) return nlParsed

  throw new Error(`Unparseable model response: ${raw.slice(0, 300)}`)
}

// ─── Networking Contact Finder ─────────────────────────────────────────────
export type ContactSuggestion = {
  university: string
  department: string
  researchAreas: string[]
  professorSearchQueries: string[]
  alumniSearchQueries: string[]
  outreachAngle: string
  profileKeywords: string[]
}

const NETWORKING_SYSTEM = `You are a graduate admissions networking strategist. Given target universities and an applicant's research interests, generate specific LinkedIn/Google Scholar search strategies to find professors and alumni — do NOT invent real names.

Respond ONLY with a valid JSON array matching this structure:
[{"university":"MIT","department":"EECS","researchAreas":["NLP","computer vision"],"professorSearchQueries":["MIT EECS professor natural language processing site:csail.mit.edu"],"alumniSearchQueries":["MIT EECS alumni machine learning engineer 2020 2021"],"outreachAngle":"Mention their work on transformer efficiency and link it to your undergraduate NLP project","profileKeywords":["Associate Professor","Research Scientist","Postdoc"]}]`

export async function suggestNetworkingTargets(
  universities: { name: string; programName: string; department?: string | null }[],
  degreeField: string,
  researchInterests: string
): Promise<ContactSuggestion[]> {
  const prompt = `Target universities:\n${JSON.stringify(
    universities.map((u) => ({ name: u.name, program: u.programName, dept: u.department ?? "" })),
    null, 2
  )}\nDegree field: ${degreeField}\nResearch interests: ${researchInterests}\n\nGenerate LinkedIn search strategies for EACH university.`
  const raw = await callOpenRouter(prompt, NETWORKING_SYSTEM)
  const parsed = safeParseJSON(raw)
  return Array.isArray(parsed) ? (parsed as ContactSuggestion[]) : []
}

// ─── SOP Builder Helper ───────────────────────────────────────────────────
export type SOPBuilderInsights = {
  keywords: string[]
  avoidPhrases: string[]
  themeAlignments: { theme: string; why: string; how: string }[]
  openingHooks: string[]
  whyThisProgramAngles: string[]
  researchFraming: string[]
  careerGoalTie: string
}

const SOP_BUILDER_SYSTEM = `You are an expert graduate admissions consultant. Given a target university, program, and applicant profile, generate highly targeted SOP writing guidance.

Output ONLY this raw JSON object — no markdown, no extra text:
{"keywords":["machine learning","systems thinking"],"avoidPhrases":["ever since I was a child","I am passionate about","dream of"],"themeAlignments":[{"theme":"Research-first culture","why":"MIT EECS values research contribution over coursework","how":"Lead with your research impact, not GPA or rankings"}],"openingHooks":["Three months into debugging a production ML pipeline, I realized the gap between academic benchmarks and real-world deployment.","The 2023 paper on transformer efficiency that redirected my research began with a deceptively simple question."],"whyThisProgramAngles":["Reference Professor X's open problems in Y and connect them to your thesis gap","Mention the cross-lab collaboration between the AI Lab and the Systems group — show you've done your homework"],"researchFraming":["Frame your thesis as a direct precursor to the lab's current open problems","Quantify impact: lines of code deployed, citations, or latency improvements in production"],"careerGoalTie":"Connect your goal of building robust AI systems to how this program's Systems + ML track uniquely bridges the gap between research and deployment."}`

export async function generateSOPInsights(
  universityName: string,
  programName: string,
  degreeField: string,
  userBackground: string
): Promise<SOPBuilderInsights> {
  const prompt = `University: ${universityName}
Program: ${programName}
Applicant's degree field: ${degreeField}
Applicant background: ${userBackground || "Not provided"}

Generate targeted SOP writing guidance for this specific university and program. Include university-specific terminology, known research strengths, and what this program values in applicants.`

  const raw = await callOpenRouter(prompt, SOP_BUILDER_SYSTEM)
  const parsed = safeParseJSON(raw) as Record<string, unknown>

  // Validate shape, fall back to empty arrays gracefully
  return {
    keywords: Array.isArray(parsed.keywords) ? (parsed.keywords as string[]) : [],
    avoidPhrases: Array.isArray(parsed.avoidPhrases) ? (parsed.avoidPhrases as string[]) : [],
    themeAlignments: Array.isArray(parsed.themeAlignments) ? (parsed.themeAlignments as SOPBuilderInsights["themeAlignments"]) : [],
    openingHooks: Array.isArray(parsed.openingHooks) ? (parsed.openingHooks as string[]) : [],
    whyThisProgramAngles: Array.isArray(parsed.whyThisProgramAngles) ? (parsed.whyThisProgramAngles as string[]) : [],
    researchFraming: Array.isArray(parsed.researchFraming) ? (parsed.researchFraming as string[]) : [],
    careerGoalTie: typeof parsed.careerGoalTie === "string" ? parsed.careerGoalTie : "",
  }
}

// ─── SOP Evaluation ───────────────────────────────────────────────────────
export type SOPEvaluationResult = {
  criticFeedback: unknown
  officerFeedback: unknown
  validatorOutput: unknown
  overallScore: number
  evaluatedAt: string
}

export async function evaluateSOP(
  sopContent: string,
  universityContext?: string
): Promise<SOPEvaluationResult> {
  const contextNote = universityContext
    ? `\n\nTarget University Context: ${universityContext}`
    : ""

  const userPrompt = `Please evaluate this Statement of Purpose:\n\n${sopContent}${contextNote}`

  // Agent 1 & 2 run in parallel
  const [criticRaw, officerRaw] = await Promise.all([
    callOpenRouter(userPrompt, CRITIC_SYSTEM),
    callOpenRouter(
      userPrompt + "\n\nAlso consider whether the applicant has demonstrated university-specific research fit.",
      OFFICER_SYSTEM
    ),
  ])

  const criticFeedback = safeParseJSON(criticRaw)
  const officerFeedback = safeParseJSON(officerRaw)

  // Agent 3 synthesises
  const validatorPrompt = `SOP:\n${sopContent}\n\nCritic Report:\n${JSON.stringify(criticFeedback, null, 2)}\n\nAdmissions Officer Report:\n${JSON.stringify(officerFeedback, null, 2)}`
  const validatorRaw = await callOpenRouter(validatorPrompt, VALIDATOR_SYSTEM)
  const validatorOutput = safeParseJSON(validatorRaw)

  const parsed = validatorOutput as Record<string, unknown>
  const overallScore = typeof parsed?.finalScore === "number" ? parsed.finalScore : 5.0

  return {
    criticFeedback,
    officerFeedback,
    validatorOutput,
    overallScore,
    evaluatedAt: new Date().toISOString(),
  }
}
