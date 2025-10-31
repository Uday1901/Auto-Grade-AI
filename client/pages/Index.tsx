import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2, Clock, FileText, Layers, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { PartConfig } from "@shared/api";
import { api } from "@/lib/api";

export default function Index() {
  const [grading, setGrading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("Midterm – Mathematics (Grade 10)");
  const [course, setCourse] = useState("Mathematics – Grade 10");
  const [paperId, setPaperId] = useState<string | null>(null);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [parts, setParts] = useState<PartConfig[]>([
    { id: crypto.randomUUID(), name: "Part A (Objective)", questions: 20, marksPerQuestion: 1, difficulty: "easy", stepMarking: false, partialCredit: 0 },
    { id: crypto.randomUUID(), name: "Part B (Short)", questions: 5, marksPerQuestion: 4, difficulty: "medium", stepMarking: true, partialCredit: 50 },
  ]);

  useEffect(() => {
    let t: number | undefined;
    if (grading) {
      setProgress(0);
      t = window.setInterval(() => {
        setProgress((p) => {
          const next = Math.min(100, p + Math.random() * 12);
          if (next >= 100) {
            window.clearInterval(t);
            setGrading(false);
            toast.success("Grading complete", { description: "Results are now available on the dashboard." });
          }
          return next;
        });
      }, 400);
    }
    return () => {
      if (t) window.clearInterval(t);
    };
  }, [grading]);

  const totalMarks = useMemo(() => parts.reduce((sum, p) => sum + p.questions * p.marksPerQuestion, 0), [parts]);

  const addPart = () => setParts((ps) => [...ps, { id: crypto.randomUUID(), name: `Part ${String.fromCharCode(65 + ps.length)}`, questions: 1, marksPerQuestion: 1, difficulty: "easy", stepMarking: false, partialCredit: 0 }]);
  const removePart = (id: string) => setParts((ps) => ps.filter((p) => p.id !== id));
  const updatePart = (id: string, patch: Partial<PartConfig>) => setParts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const onStartGrading = async () => {
    if (!title || !course || parts.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      toast("Uploading and parsing paper...");

      // Upload paper to backend
      const uploadResponse = await api.uploadPaper({
        title,
        course,
        parts,
      });

      if (uploadResponse.success) {
        setPaperId(uploadResponse.paperId);
        toast.success("Paper uploaded successfully", {
          description: `Total marks: ${uploadResponse.totalMarks}`,
        });

        // Start grading
        setTimeout(async () => {
          try {
            const gradingResponse = await api.startGrading({
              paperId: uploadResponse.paperId,
            });

            if (gradingResponse.success) {
              setGradingId(gradingResponse.gradingId);
              toast("AI criteria generated", {
                description: "Rubrics set from question patterns and difficulty",
              });
              setGrading(true);
            }
          } catch (error) {
            toast.error("Failed to start grading", {
              description: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }, 800);
      }
    } catch (error) {
      toast.error("Failed to upload paper", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-background to-muted/40">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(99,102,241,0.25),transparent)]" />
        <div className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-powered grading
              </div>
              <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Automate paper evaluation with precision
              </h1>
              <p className="mt-4 text-muted-foreground text-lg">
                AutoGrade AI checks objective and subjective answers, supports step-marking and partial credit, and delivers real-time analytics for faculty and admins.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to="/#upload">Upload Question Paper</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/dashboard" className="inline-flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> View Dashboard
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Step-marking</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Partial credit</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> RBAC</div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 bg-gradient-to-br from-primary/20 to-cyan-400/20 blur-2xl rounded-3xl" />
              <Card className="border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Performance Snapshot</CardTitle>
                  <CardDescription>Live analytics update as grading progresses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Kpi label="Graded" value="1,248" />
                    <Kpi label="Avg Score" value="76%" />
                    <Kpi label="Saved" value="~62 hrs" />
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Real-time grading</span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">Simulated data for demo purposes</CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Feature icon={<Wand2 className="h-5 w-5" />} title="Automatic criteria">
            Upload papers and let AI generate grading rubrics based on parts, marks, and difficulty.
          </Feature>
          <Feature icon={<Layers className="h-5 w-5" />} title="Step-marking">
            Award partial credit for intermediate steps with flexible weighting.
          </Feature>
          <Feature icon={<Clock className="h-5 w-5" />} title="Real-time updates">
            See instant progress and analytics while grading runs in the background.
          </Feature>
        </div>
      </section>

      {/* UPLOAD */}
      <section id="upload" className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Question Paper Upload</CardTitle>
              <CardDescription>Configure parts, marks allocation, difficulty and grading scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Paper title</Label>
                  <Input
                    id="title"
                    placeholder="Midterm – Mathematics (Grade 10)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="course">Course/Class</Label>
                  <Input
                    id="course"
                    placeholder="Mathematics – Grade 10"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {parts.map((p, idx) => (
                  <Card key={p.id} className="bg-muted/30">
                    <CardHeader className="py-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>{p.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{p.questions * p.marksPerQuestion} marks</Badge>
                          <Button variant="ghost" size="sm" onClick={() => removePart(p.id)}>Remove</Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-5 gap-3">
                      <div className="md:col-span-2">
                        <Label>Part name</Label>
                        <Input value={p.name} onChange={(e) => updatePart(p.id, { name: e.target.value })} />
                      </div>
                      <div>
                        <Label>Questions</Label>
                        <Input type="number" min={1} value={p.questions} onChange={(e) => updatePart(p.id, { questions: Number(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label>Marks/Q</Label>
                        <Input type="number" min={0} value={p.marksPerQuestion} onChange={(e) => updatePart(p.id, { marksPerQuestion: Number(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label>Difficulty</Label>
                        <Select value={p.difficulty} onValueChange={(v: PartConfig["difficulty"]) => updatePart(p.id, { difficulty: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Partial credit (%)</Label>
                        <Input type="number" min={0} max={100} value={p.partialCredit} onChange={(e) => updatePart(p.id, { partialCredit: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} />
                        <p className="text-xs text-muted-foreground mt-1">Applies when step-marking is enabled</p>
                      </div>
                      <div className="md:col-span-3">
                        <Label>Step-marking</Label>
                        <Tabs value={p.stepMarking ? "on" : "off"} onValueChange={(v) => updatePart(p.id, { stepMarking: v === "on" })}>
                          <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger value="off">Off</TabsTrigger>
                            <TabsTrigger value="on">On</TabsTrigger>
                          </TabsList>
                          <TabsContent value="off" className="text-xs text-muted-foreground">No intermediate step credit.</TabsContent>
                          <TabsContent value="on" className="text-xs text-muted-foreground">Award partial marks for correct intermediate steps.</TabsContent>
                        </Tabs>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={addPart}>Add Part</Button>
                  <div className="text-sm text-muted-foreground">Total marks: <span className="font-semibold text-foreground">{totalMarks}</span></div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button className="inline-flex items-center gap-2" onClick={onStartGrading} disabled={grading}>
                <FileText className="h-4 w-4" /> Start AI Grading
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/dashboard">View Results</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grading Criteria</CardTitle>
              <CardDescription>Automatically generated and adjustable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {parts.map((p) => (
                <div key={p.id} className="rounded-lg border p-3 bg-card/50">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{p.name}</div>
                    <Badge variant="secondary">{p.difficulty}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {p.questions} questions × {p.marksPerQuestion} marks • {p.stepMarking ? `Step-marking with ${p.partialCredit}% partial credit` : "No step-marking"}
                  </p>
                </div>
              ))}
              <div className="rounded-lg border p-3 bg-card/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><BarChart3 className="h-4 w-4" /> Difficulty influences expected length and rubric strictness.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-12 md:py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-cyan-500/10">
          <CardContent className="py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold">Ready to accelerate grading?</h3>
              <p className="text-muted-foreground">Generate reports and export results for your institute with a click.</p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/#upload">Upload Paper</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4 bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5 bg-card/60">
      <div className="flex items-center gap-2 font-semibold">
        <span className="text-primary">{icon}</span> {title}
      </div>
      <p className="text-sm text-muted-foreground mt-2">{children}</p>
    </div>
  );
}
