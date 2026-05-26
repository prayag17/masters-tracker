"use client"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Globe, RefreshCw, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { formatDeadline, formatCurrency, statusColor } from "@/lib/utils"
import { fetchJson } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { University, ApplicationStatus, Priority } from "@/types"
import { format } from "date-fns"

export default function UniversityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: uni, isLoading } = useQuery<University>({
    queryKey: ["university", id],
    queryFn: () => fetchJson<University>(`/api/universities/${id}`),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<University>) =>
      fetch(`/api/universities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["university", id] })
      queryClient.invalidateQueries({ queryKey: ["universities"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/universities/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] })
      router.push("/universities")
    },
  })

  const [scraping, setScraping] = useState(false)
  const scrape = async () => {
    setScraping(true)
    try {
      await fetch(`/api/universities/${id}/scrape`, { method: "POST" })
      queryClient.invalidateQueries({ queryKey: ["university", id] })
      queryClient.invalidateQueries({ queryKey: ["universities"] })
      toast({ title: "Scrape complete!" })
    } catch {
      toast({ title: "Scrape failed", variant: "destructive" })
    } finally {
      setScraping(false)
    }
  }

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )

  if (!uni) return <div className="p-6 text-muted-foreground">University not found.</div>

  const INFO_FIELDS = [
    { label: "Regular Deadline", value: uni.regularDeadline ? formatDeadline(uni.regularDeadline) : null },
    { label: "Early Action", value: uni.earlyActionDeadline ? formatDeadline(uni.earlyActionDeadline) : null },
    { label: "Application Fee", value: uni.applicationFee ? formatCurrency(uni.applicationFee) : null },
    { label: "Annual Tuition", value: uni.annualTuition ? formatCurrency(uni.annualTuition) : null },
    { label: "GRE Verbal", value: uni.avgGREVerbal?.toString() },
    { label: "GRE Quant", value: uni.avgGREQuantitative?.toString() },
    { label: "GRE AW", value: uni.avgGREAW?.toString() },
    { label: "TOEFL", value: uni.avgTOEFL?.toString() },
    { label: "IELTS", value: uni.avgIELTS?.toString() },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.push("/universities")} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{uni.name}</h1>
          <p className="text-xs text-muted-foreground">{uni.programName} · {uni.city ? `${uni.city}, ` : ""}{uni.country}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={scrape} disabled={scraping}>
            {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Scrape Data
          </Button>
          <Button size="sm" variant="outline" className="text-red-400 border-red-400/20 hover:bg-red-400/10"
            onClick={() => { if (confirm("Delete this university?")) deleteMutation.mutate() }}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 animate-fade-in max-w-3xl">
        {/* Status & Priority */}
        <div className="bento-card p-5 flex items-center gap-6 flex-wrap">
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Status</p>
            <Select value={uni.applicationStatus} onValueChange={(v) => updateMutation.mutate({ applicationStatus: v as ApplicationStatus })}>
              <SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["researching", "applied", "interview", "accepted", "rejected", "waitlisted"].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Priority</p>
            <Select value={uni.priority} onValueChange={(v) => updateMutation.mutate({ priority: v as Priority })}>
              <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["high", "medium", "low"].map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {uni.admissionPageUrl && (
            <a href={uni.admissionPageUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline ml-auto">
              <Globe className="w-3.5 h-3.5" /> Admission Page
            </a>
          )}
          {uni.lastScraped && (
            <p className="text-[10px] text-muted-foreground ml-auto">
              Last scraped {format(new Date(uni.lastScraped), "MMM d, h:mm a")}
            </p>
          )}
        </div>

        {/* Scraped Data */}
        <div className="bento-card p-5">
          <p className="text-xs font-semibold mb-4 flex items-center gap-2">
            Admission Data
            <Badge variant={uni.scrapingStatus === "done" ? "success" : uni.scrapingStatus === "failed" ? "destructive" : "outline"} className="text-[10px]">
              {uni.scrapingStatus}
            </Badge>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INFO_FIELDS.map((f) => (
              <div key={f.label} className={`bg-muted/40 rounded-lg p-3 ${!f.value ? "opacity-40" : ""}`}>
                <p className="text-[10px] text-muted-foreground font-medium mb-1">{f.label}</p>
                <p className="text-sm font-semibold">{f.value ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// useState import
import { useState } from "react"
