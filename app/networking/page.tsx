"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Loader2, Users, ExternalLink, Copy, Check, Sparkles, Search, ChevronDown, ChevronUp } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { contactStatusColor } from "@/lib/utils"
import { fetchJson } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { NetworkingContact } from "@/types"
import type { ContactSuggestion } from "@/lib/llm"
import { format } from "date-fns"

const OUTREACH_TEMPLATES = {
  professor: `Hi Professor [Name],

I hope this message finds you well. I'm [Your Name], a final-year [Major] student at [Your University]. I came across your research on [Research Topic] and was genuinely inspired by your work on [Specific Paper/Project].

I'm applying for the [Program Name] program at [University] for [Term Year] and am particularly interested in [Research Area]. I'd love to hear your perspective on research opportunities in your lab and whether my background in [Your Background] might be a good fit.

Would you be available for a brief 15-minute call or email exchange at your convenience?

Thank you for your time.

Best regards,
[Your Name]`,

  alumni: `Hi [Name],

I hope you're doing well! I found your profile while researching [University]'s [Program] alumni. Your career trajectory from [Program] to [Current Role] is exactly what I aspire toward.

I'm currently applying to [University]'s [Program] for [Term Year] and would love to get your candid insights about the program — specifically about [Specific Aspect: research culture / job placement / coursework].

Would you be open to a 20-minute call? I'd truly appreciate your perspective.

Thank you,
[Your Name]`,
}

function SuggestionCard({ s, onCopy }: { s: ContactSuggestion; onCopy: (text: string, key: string) => void; copiedKey: string | null }) {
  const [expanded, setExpanded] = useState(false)
  const [localCopied, setLocalCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setLocalCopied(key)
    onCopy(text, key)
    setTimeout(() => setLocalCopied(null), 2000)
  }

  return (
    <div className="bento-card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{s.university}</p>
          <p className="text-xs text-muted-foreground">{s.department}</p>
        </div>
        <button onClick={() => setExpanded((e) => !e)} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Research areas */}
      <div className="flex flex-wrap gap-1.5">
        {s.researchAreas.map((a) => (
          <Badge key={a} variant="outline" className="text-[10px] text-primary border-primary/20">{a}</Badge>
        ))}
      </div>

      {/* Outreach angle */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
        <span className="text-foreground font-medium">Outreach angle: </span>{s.outreachAngle}
      </div>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-border">
          {/* Professor search queries */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Professor Search Queries</p>
            <div className="space-y-1.5">
              {s.professorSearchQueries.map((q, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                  <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                  <code className="flex-1 text-[10px] text-muted-foreground break-all">{q}</code>
                  <button onClick={() => copy(q, `prof-${i}`)} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    {localCopied === `prof-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Alumni search queries */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Alumni Search Queries</p>
            <div className="space-y-1.5">
              {s.alumniSearchQueries.map((q, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                  <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                  <code className="flex-1 text-[10px] text-muted-foreground break-all">{q}</code>
                  <button onClick={() => copy(q, `alum-${i}`)} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    {localCopied === `alum-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Profile keywords */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Filter by Job Title</p>
            <div className="flex flex-wrap gap-1.5">
              {s.profileKeywords.map((k) => (
                <Badge key={k} variant="outline" className="text-[10px] text-muted-foreground">{k}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NetworkingPage() {
  const [filter, setFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [researchInterests, setResearchInterests] = useState("")
  const [suggestions, setSuggestions] = useState<ContactSuggestion[]>([])
  const [suggesting, setSuggesting] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: contacts = [], isLoading } = useQuery<NetworkingContact[]>({
    queryKey: ["contacts"],
    queryFn: () => fetchJson<NetworkingContact[]>("/api/networking"),
  })

  const [form, setForm] = useState({
    name: "", title: "", university: "", department: "", linkedinUrl: "", email: "",
    type: "alumni" as const, status: "not-contacted" as const, notes: "",
  })

  const addMutation = useMutation({
    mutationFn: (data: typeof form) =>
      fetch("/api/networking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      setOpen(false)
      setForm({ name: "", title: "", university: "", department: "", linkedinUrl: "", email: "", type: "alumni", status: "not-contacted", notes: "" })
      toast({ title: "Contact added!" })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/networking/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts"] }),
  })

  const copyTemplate = (key: keyof typeof OUTREACH_TEMPLATES) => {
    navigator.clipboard.writeText(OUTREACH_TEMPLATES[key])
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSuggest = async () => {
    if (!researchInterests.trim()) {
      toast({ title: "Enter your research interests first", variant: "destructive" })
      return
    }
    setSuggesting(true)
    setSuggestions([])
    try {
      const res = await fetch("/api/networking/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ researchInterests }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuggestions(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      toast({ title: "Failed to get suggestions", description: msg, variant: "destructive" })
    } finally {
      setSuggesting(false)
    }
  }

  const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "not-contacted", label: "Not Contacted" },
    { value: "contacted", label: "Contacted" },
    { value: "replied", label: "Replied" },
    { value: "meeting-scheduled", label: "Meeting Scheduled" },
    { value: "follow-up-needed", label: "Follow-up Needed" },
  ]

  const filtered = filter === "all" ? contacts : contacts.filter((c) => c.status === filter)

  const stats = {
    total: contacts.length,
    contacted: contacts.filter((c) => c.status !== "not-contacted").length,
    replied: contacts.filter((c) => ["replied", "meeting-scheduled"].includes(c.status)).length,
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Networking CRM"
        description={`${stats.contacted}/${stats.total} contacted · ${stats.replied} replied`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSuggestOpen(true)}>
              <Sparkles className="w-4 h-4" /> Find Contacts
            </Button>
            <Button size="sm" variant="outline" onClick={() => setTemplateOpen(true)}>
              Templates
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4" /> Add Contact</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <Label>Name</Label>
                      <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Dr. Jane Smith" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Title</Label>
                      <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Associate Professor" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Type</Label>
                      <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as "alumni" }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["alumni", "professor", "student", "staff"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>University</Label>
                      <Input value={form.university} onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))} placeholder="MIT" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Department</Label>
                      <Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} placeholder="EECS" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>LinkedIn URL</Label>
                      <Input value={form.linkedinUrl} onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))} placeholder="linkedin.com/in/..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@mit.edu" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Research interests, context..." className="h-20" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={() => addMutation.mutate(form)} disabled={!form.name || addMutation.isPending}>
                    {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Contact"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* AI Find Contacts dialog */}
      <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Contact Finder
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2">
            Generates LinkedIn & Google Scholar search strategies for your tracked universities — based on your research interests. No real names are invented.
          </p>
          <div className="space-y-2">
            <Label>Your research interests</Label>
            <Textarea
              value={researchInterests}
              onChange={(e) => setResearchInterests(e.target.value)}
              placeholder="e.g. machine learning, computer vision, NLP, robotics, distributed systems..."
              className="h-20 resize-none"
            />
          </div>
          <Button onClick={handleSuggest} disabled={suggesting || !researchInterests.trim()} className="w-full">
            {suggesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating strategies…</> : <><Sparkles className="w-4 h-4" /> Find Contacts</>}
          </Button>

          {suggestions.length > 0 && (
            <ScrollArea className="flex-1 min-h-0 pr-1">
              <div className="space-y-3 pb-2">
                <p className="text-xs text-muted-foreground">{suggestions.length} universities · click a card to expand search queries</p>
                {suggestions.map((s, i) => (
                  <SuggestionCard
                    key={i}
                    s={s}
                    onCopy={(_text, key) => setCopied(key)}
                    copiedKey={copied}
                  />
                ))}
              </div>
            </ScrollArea>
          )}

          {!suggesting && suggestions.length === 0 && researchInterests && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Enter your interests and click Find Contacts to generate strategies.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Templates modal */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Outreach Templates</DialogTitle></DialogHeader>
          <Tabs defaultValue="professor">
            <TabsList>
              <TabsTrigger value="professor">Professor</TabsTrigger>
              <TabsTrigger value="alumni">Alumni</TabsTrigger>
            </TabsList>
            {(["professor", "alumni"] as const).map((key) => (
              <TabsContent key={key} value={key}>
                <div className="relative">
                  <pre className="bg-muted rounded-xl p-4 text-xs text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-72">
                    {OUTREACH_TEMPLATES[key]}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyTemplate(key)}
                  >
                    {copied === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === key ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      <div className="flex-1 overflow-y-auto p-7 animate-fade-in">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={filter} className="mt-4">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3 text-center">
                <Users className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No contacts yet</p>
                <Button size="sm" variant="outline" onClick={() => setSuggestOpen(true)}>
                  <Sparkles className="w-4 h-4" /> Find contacts with AI
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((contact) => (
                  <div key={contact.id} className="bento-card flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">{contact.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{contact.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{contact.title} · {contact.university}</p>
                    </div>
                    {contact.outreachDate && (
                      <p className="text-[10px] text-muted-foreground shrink-0 hidden md:block">
                        Contacted {format(new Date(contact.outreachDate), "MMM d")}
                      </p>
                    )}
                    <div className="flex items-center gap-2 shrink-0">
                      {contact.linkedinUrl && (
                        <Button size="sm" variant="ghost" className="h-7 px-2" asChild>
                          <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      )}
                      <Select value={contact.status} onValueChange={(v) => updateStatusMutation.mutate({ id: contact.id, status: v })}>
                        <SelectTrigger className={`h-7 text-xs w-40 ${contactStatusColor(contact.status)} border-0`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["not-contacted", "contacted", "replied", "meeting-scheduled", "follow-up-needed"].map((s) => (
                            <SelectItem key={s} value={s}>{s.replace(/-/g, " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
