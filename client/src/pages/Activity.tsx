import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActivityTimelineChart from "@/components/dashboard/ActivityTimelineChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";

export default function Activity() {
  const [activeTab, setActiveTab] = useState("timeline");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedUser, setSelectedUser] = useState("all");

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-dark">Activity</h1>
          <p className="text-neutral-medium">Detailed activity tracking and analysis</p>
        </div>
        
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              <SelectItem value="1">Amy Kirkland</SelectItem>
              <SelectItem value="2">John Miller</SelectItem>
              <SelectItem value="3">Sarah Lee</SelectItem>
              <SelectItem value="4">Robert Johnson</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="timeline" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="mt-4">
              <ActivityTimelineChart />
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="p-4">
                      <p className="text-neutral-medium text-center py-8">
                        Select a date and user to view detailed activity logs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CategoryBreakdown />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-medium text-center py-8">
                      Category distribution details will be displayed here
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="heatmap" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity Heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-medium text-center py-8">
                    Activity heatmap across hours and days will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Activity Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" id="productive" defaultChecked />
                    <label htmlFor="productive">Productive</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" id="neutral" defaultChecked />
                    <label htmlFor="neutral">Neutral</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" id="unproductive" defaultChecked />
                    <label htmlFor="unproductive">Unproductive</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Time Range</h4>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Day</SelectItem>
                    <SelectItem value="morning">Morning (8am-12pm)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                    <SelectItem value="evening">Evening (5pm-8pm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
