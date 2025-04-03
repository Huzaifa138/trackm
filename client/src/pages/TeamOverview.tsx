import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamOverviewTable from "@/components/dashboard/TeamOverviewTable";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function TeamOverview() {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data for department breakdown
  const departmentData = [
    { name: "Development", value: 6, color: "#0078D4" },
    { name: "Marketing", value: 4, color: "#2B88D8" },
    { name: "Sales", value: 3, color: "#107C10" },
    { name: "HR", value: 2, color: "#FFB900" },
    { name: "Design", value: 2, color: "#E81123" },
  ];

  // Sample data for productivity by department
  const productivityData = [
    { name: "Development", productivity: 85 },
    { name: "Sales", productivity: 92 },
    { name: "Marketing", productivity: 68 },
    { name: "HR", productivity: 45 },
    { name: "Design", productivity: 73 },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-dark">Team Overview</h1>
          <p className="text-neutral-medium">Analyze team performance and productivity</p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <TeamOverviewTable />
        </TabsContent>
        
        <TabsContent value="departments" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Department Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Team Members"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productivity by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productivityData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Productivity Score (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}%`, "Productivity"]} />
                      <Bar dataKey="productivity" fill="#0078D4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Select team members to compare their productivity and activity patterns.</p>
              <p className="text-neutral-medium">This feature will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
