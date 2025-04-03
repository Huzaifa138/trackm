import { Clock, ChartBar, Laptop, Users } from "lucide-react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import ActivityTimelineChart from "@/components/dashboard/ActivityTimelineChart";
import ApplicationUsageChart from "@/components/dashboard/ApplicationUsageChart";
import TeamOverviewTable from "@/components/dashboard/TeamOverviewTable";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import TopWebsites from "@/components/dashboard/TopWebsites";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("last7days");
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/metrics?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }
      return response.json();
    },
  });

  return (
    <div>
      {/* PageHeader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-dark">Dashboard</h1>
          <p className="text-neutral-medium">Overview of team activity and productivity</p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button className="flex items-center">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* ActivitySummary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Active Time"
          value={isLoading ? "Loading..." : metrics?.activeTime}
          icon={<Clock size={18} />}
          change={isLoading ? 0 : metrics?.activeTimeChange}
        />
        <SummaryCard
          title="Productivity Score"
          value={isLoading ? "Loading..." : metrics?.productivityScore}
          icon={<ChartBar size={18} />}
          change={isLoading ? 0 : metrics?.productivityScoreChange}
        />
        <SummaryCard
          title="Applications Used"
          value={isLoading ? "Loading..." : String(metrics?.applicationsCount)}
          icon={<Laptop size={18} />}
          change={isLoading ? 0 : metrics?.applicationsCountChange}
        />
        <SummaryCard
          title="Team Members Active"
          value={isLoading ? "Loading..." : `${metrics?.activeMembers} / ${metrics?.totalMembers}`}
          icon={<Users size={18} />}
          changeLabel="currently online"
        />
      </div>

      {/* ChartsSection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ActivityTimelineChart />
        <ApplicationUsageChart />
      </div>

      {/* TeamOverviewTable */}
      <div className="mb-6">
        <TeamOverviewTable />
      </div>

      {/* ProductivityAnalysisSection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryBreakdown />
        <TopWebsites />
        <RecentActivity />
      </div>
    </div>
  );
}
