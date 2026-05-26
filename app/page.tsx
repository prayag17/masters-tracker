"use client"
import { useQuery } from "@tanstack/react-query"
import { CountdownTimer }      from "@/components/dashboard/countdown-timer"
import { StatsCards }          from "@/components/dashboard/stats-cards"
import { TodayChecklist }      from "@/components/dashboard/today-checklist"
import { UniversityPipeline }  from "@/components/dashboard/university-pipeline"
import { CostSummary }         from "@/components/dashboard/cost-summary"
import { Header }              from "@/components/layout/header"
import { getClosestDeadline }  from "@/lib/utils"
import type { University, DailyTask, Expense, NetworkingContact } from "@/types"
import { format } from "date-fns"
import { fetchJson } from "@/lib/api"

export default function DashboardPage() {
  const { data: universities = [], isLoading: uniLoading } = useQuery<University[]>({
    queryKey: ["universities"],
    queryFn:  () => fetchJson<University[]>("/api/universities"),
  })
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<DailyTask[]>({
    queryKey: ["tasks"],
    queryFn:  () => fetchJson<DailyTask[]>("/api/planner"),
  })
  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn:  () => fetchJson<Expense[]>("/api/finances"),
  })
  const { data: contacts = [], isLoading: contactsLoading } = useQuery<NetworkingContact[]>({
    queryKey: ["contacts"],
    queryFn:  () => fetchJson<NetworkingContact[]>("/api/networking"),
  })

  const closestDeadline = getClosestDeadline(
    universities.map((u) => ({
      name: u.name,
      regularDeadline:     u.regularDeadline     ? new Date(u.regularDeadline)     : null,
      earlyActionDeadline: u.earlyActionDeadline  ? new Date(u.earlyActionDeadline) : null,
      rollingDeadline:     u.rollingDeadline      ? new Date(u.rollingDeadline)     : null,
    }))
  )

  const stats = {
    totalUniversities:  universities.length,
    appliedCount:       universities.filter((u) =>
      ["applied", "interview", "accepted"].includes(u.applicationStatus)).length,
    networkingContacts: contacts.length,
    totalExpenses:      expenses.reduce((s, e) => s + e.amount, 0),
  }

  const loading = uniLoading || tasksLoading || expensesLoading || contactsLoading

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        description={format(new Date(), "EEEE, MMMM d, yyyy")}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-4 animate-fade-in">

          {/* Row 1 — Countdown + Stats */}
          <div className="grid grid-cols-12 gap-4 items-stretch">
            <div className="col-span-12 lg:col-span-4 flex flex-col">
              <CountdownTimer deadline={closestDeadline} loading={uniLoading} />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <StatsCards stats={stats} loading={loading} />
            </div>
          </div>

          {/* Row 2 — Tasks + Cost */}
          <div className="grid grid-cols-12 gap-4 items-stretch">
            <div className="col-span-12 lg:col-span-8 flex flex-col min-h-[300px]">
              <TodayChecklist tasks={tasks} loading={tasksLoading} />
            </div>
            <div className="col-span-12 lg:col-span-4 flex flex-col">
              <CostSummary expenses={expenses} loading={expensesLoading} />
            </div>
          </div>

          {/* Row 3 — Pipeline */}
          <UniversityPipeline universities={universities} loading={uniLoading} />

        </div>
      </div>
    </div>
  )
}
