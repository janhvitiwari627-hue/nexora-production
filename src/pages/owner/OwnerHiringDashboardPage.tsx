import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Star } from "lucide-react";
import { MOCK_JOBS, MOCK_APPLICANTS, type Applicant } from "@/pages/jobs/mockJobs";
import { toast } from "sonner";

const STAGES: Applicant["stage"][] = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

export function OwnerHiringDashboardPage() {
  const [activeJob, setActiveJob] = useState(MOCK_JOBS[0].id);
  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [scheduleFor, setScheduleFor] = useState<Applicant | null>(null);
  const [slot, setSlot] = useState({ date: "", time: "" });

  const move = (id: string, to: Applicant["stage"]) => setApplicants(p => p.map(a => a.id === id ? { ...a, stage: to } : a));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-heading text-2xl font-bold">Hiring Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage applicants across all your job postings</p>
        </div>
        <Button asChild><a href="/owner/jobs/new"><Plus className="h-4 w-4" /> Post New Job</a></Button>
      </header>

      <Card>
        <CardHeader><CardTitle>Active Postings</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {MOCK_JOBS.slice(0, 6).map(j => (
            <button key={j.id} onClick={() => setActiveJob(j.id)} className={`rounded-lg border p-4 text-left transition-colors ${activeJob === j.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
              <div className="font-semibold">{j.title}</div>
              <div className="text-muted-foreground text-xs">{j.area}</div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <Badge variant="secondary">{j.applicants} applicants</Badge>
                <Badge variant="outline">{j.type}</Badge>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pipeline — {MOCK_JOBS.find(j => j.id === activeJob)?.title}</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="kanban">
            <TabsList><TabsTrigger value="kanban">Kanban</TabsTrigger><TabsTrigger value="list">List</TabsTrigger></TabsList>

            <TabsContent value="kanban">
              <div className="grid gap-3 overflow-x-auto md:grid-cols-6">
                {STAGES.map(stage => {
                  const items = applicants.filter(a => a.stage === stage);
                  return (
                    <div key={stage} className="bg-muted/30 min-w-[180px] rounded-lg p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider">{stage}</span>
                        <Badge variant="outline" className="text-xs">{items.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {items.map(a => (
                          <div key={a.id} className="rounded-lg border bg-white p-3 text-sm shadow-sm">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7"><AvatarFallback>{a.name.slice(0, 2)}</AvatarFallback></Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">{a.name}</div>
                                <div className="text-muted-foreground text-xs">{a.city} · {a.experience}</div>
                              </div>
                            </div>
                            <div className="mt-1 flex">{Array.from({ length: a.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {STAGES.filter(s => s !== a.stage).slice(0, 2).map(s => (
                                <button key={s} className="text-primary text-xs hover:underline" onClick={() => move(a.id, s)}>→ {s}</button>
                              ))}
                              {(a.stage === "Screening" || a.stage === "Applied") && (
                                <button className="text-primary text-xs hover:underline" onClick={() => setScheduleFor(a)}>
                                  <Calendar className="inline h-3 w-3" /> Schedule
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="divide-y rounded-lg border">
                {applicants.map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback>{a.name.slice(0, 2)}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium">{a.name}</div>
                        <div className="text-muted-foreground text-xs">{a.city} · {a.experience}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{a.stage}</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!scheduleFor} onOpenChange={o => !o && setScheduleFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Interview — {scheduleFor?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Date</Label><Input type="date" value={slot.date} onChange={e => setSlot({ ...slot, date: e.target.value })} /></div>
            <div><Label>Time</Label><Input type="time" value={slot.time} onChange={e => setSlot({ ...slot, time: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleFor(null)}>Cancel</Button>
            <Button onClick={() => { if (scheduleFor) move(scheduleFor.id, "Interview"); setScheduleFor(null); toast.success("Interview scheduled"); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
