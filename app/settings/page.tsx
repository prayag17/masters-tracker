"use client"
import { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Save, Loader2, GraduationCap, Bell } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { PushNotificationToggle } from "@/components/settings/push-notification-toggle"
import type { UserProfile } from "@/types"
import { fetchJson } from "@/lib/api"

const schema = z.object({
  targetSemester: z.string().min(1),
  targetYear: z.number().min(2025).max(2035),
  undergraduateMajor: z.string().min(2),
  targetDegreeField: z.string().min(2),
  currentGPA: z.number().min(0).max(10),
  maxGPA: z.number().min(1).max(10),
  targetCountries: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: () => fetchJson<UserProfile>("/api/profile"),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      targetSemester: "Fall",
      targetYear: 2027,
      undergraduateMajor: "",
      targetDegreeField: "MS in Computer Science",
      currentGPA: 3.5,
      maxGPA: 4.0,
      targetCountries: "USA",
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        targetSemester: profile.targetSemester,
        targetYear: profile.targetYear,
        undergraduateMajor: profile.undergraduateMajor,
        targetDegreeField: profile.targetDegreeField,
        currentGPA: profile.currentGPA,
        maxGPA: profile.maxGPA,
        targetCountries: profile.targetCountries.join(", "),
      })
    }
  }, [profile, form])

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          targetAdmissionYear: `${values.targetSemester} ${values.targetYear}`,
          targetCountries: values.targetCountries.split(",").map((s) => s.trim()),
          isOnboarded: true,
        }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      toast({ title: "Settings saved!" })
    },
  })

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Settings"
        description="Manage your application profile and preferences"
      />
      <div className="flex-1 overflow-y-auto p-5 max-w-2xl animate-fade-in">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">

            {/* Profile */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Target Intake</h2>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="targetSemester" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="targetYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Academic Background */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold">Academic Background</h2>
              <Separator />
              <FormField control={form.control} name="undergraduateMajor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Undergraduate Major</FormLabel>
                  <FormControl><Input {...field} placeholder="Computer Science" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="targetDegreeField" render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Degree</FormLabel>
                  <FormControl><Input {...field} placeholder="MS in Computer Science" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="currentGPA" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current GPA</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maxGPA" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max GPA</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="targetCountries" render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Countries (comma-separated)</FormLabel>
                  <FormControl><Input {...field} placeholder="USA, Canada, Germany" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Integrations */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold">Integrations</h2>
              <Separator />
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-foreground">OpenRouter (Cloud LLM)</p>
                    <p className="text-[10px]">Required for SOP evaluation. Set <code className="bg-muted px-1 py-0.5 rounded">OPENROUTER_API_KEY</code> in your <code className="bg-muted px-1 py-0.5 rounded">.env</code> file.</p>
                  </div>
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary text-[10px] hover:underline">Get key →</a>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-border">
                  <div>
                    <p className="font-medium text-foreground">Scraper Service</p>
                    <p className="text-[10px]">Playwright-based scraper. Runs via Docker or <code className="bg-muted px-1 py-0.5 rounded">cd scraper && npm run dev</code></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Push Notifications</h2>
              </div>
              <PushNotificationToggle />
            </div>

            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
