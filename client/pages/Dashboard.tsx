import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AnalyticsData } from "@shared/api";
import { toast } from "sonner";

const COLORS = ["#6366F1", "#06B6D4", "#22C55E", "#F59E0B", "#EF4444"]; // indigo, cyan, green, amber, red

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await api.getAnalytics();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        toast.error("Failed to load analytics", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const exportCsv = () => {
    const rows = [
      ["Student", "Score"],
      ...data.recent.map((r) => [r.student, String(r.score)]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recent-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of student performance, grading patterns, and key metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Students Graded</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {data.overview.studentsGraded.toLocaleString()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {data.overview.averageScore}%
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Time Saved</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            ~{data.overview.timeSaved} hrs
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Average by Class</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byClass}>
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" />
                <YAxis stroke="currentColor" className="text-muted-foreground" />
                <RTooltip cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Score Trend (10 weeks)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground" />
                <YAxis stroke="currentColor" className="text-muted-foreground" />
                <RTooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.distribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                  {data.distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Results</CardTitle>
            <Button variant="secondary" onClick={exportCsv} className="inline-flex items-center gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 text-sm font-medium text-muted-foreground">
              <div>Student</div>
              <div className="text-right">Score</div>
            </div>
            <div className="mt-2 divide-y">
              {data.recent.map((r) => (
                <div key={r.id} className="grid grid-cols-2 py-2">
                  <div>{r.student}</div>
                  <div className="text-right font-semibold">{r.score}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
