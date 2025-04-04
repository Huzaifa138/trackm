import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaWindows, FaApple } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

export default function AgentDownload() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  // Access organization ID from the user object, defaulting to undefined if not present
  const organizationId = user ? (user as any).organizationId : undefined;

  const { data: organizations = [] } = useQuery<any[]>({
    queryKey: ['/api/organizations'],
    enabled: user?.role === 'admin'
  });

  const handleDownload = async (platform: string, orgId?: number) => {
    setDownloading(true);
    try {
      let url = `/api/agent/download/${platform}`;
      if (orgId) url += `/${orgId}`;
      
      const response = await (await apiRequest('GET', url)).json();
      
      // In a real application, this would trigger an actual download
      // For now we'll just show a toast with the response
      toast({
        title: "Download Initiated",
        description: response.message || "Agent download started.",
      });
      
      // In a real implementation, we would:
      // 1. Trigger the actual file download
      // 2. Track the download in analytics
      // 3. Potentially show installation instructions
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Desktop Agent Download</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaWindows className="mr-2 h-6 w-6" /> Windows Agent
            </CardTitle>
            <CardDescription>
              Download the agent for Windows computers (Windows 10 and above)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              The Windows agent monitors activity, captures screenshots (if enabled), and enforces
              application usage policies. It runs silently in the background and uses minimal
              system resources.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              System Requirements: Windows 10 or above, 2GB RAM, 100MB free disk space
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleDownload('windows', organizationId || undefined)} 
              disabled={downloading}
              className="w-full"
            >
              {downloading ? 'Downloading...' : 'Download for Windows'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaApple className="mr-2 h-6 w-6" /> macOS Agent
            </CardTitle>
            <CardDescription>
              Download the agent for Mac computers (macOS 10.15 Catalina and above)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              The macOS agent monitors activity, captures screenshots (if enabled), and enforces
              application usage policies. It's optimized for macOS and respects system privacy settings.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              System Requirements: macOS 10.15 Catalina or above, 2GB RAM, 100MB free disk space
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleDownload('macos', organizationId || undefined)} 
              disabled={downloading}
              className="w-full"
            >
              {downloading ? 'Downloading...' : 'Download for macOS'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {user?.role === 'admin' && organizations && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Organization-Specific Downloads</h2>
          <p className="mb-6">As an administrator, you can download pre-configured agents for specific organizations.</p>
          
          <Tabs defaultValue="windows" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="windows">Windows</TabsTrigger>
              <TabsTrigger value="macos">macOS</TabsTrigger>
            </TabsList>
            
            <TabsContent value="windows" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Windows Agent by Organization</CardTitle>
                  <CardDescription>
                    Download pre-configured Windows agents for specific organizations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {organizations.map((org: any) => (
                      <div key={org.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <h3 className="font-semibold">{org.name}</h3>
                          <p className="text-sm text-muted-foreground">{org.description || 'No description'}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => handleDownload('windows', org.id)}
                          disabled={downloading}
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="macos" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>macOS Agent by Organization</CardTitle>
                  <CardDescription>
                    Download pre-configured macOS agents for specific organizations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {organizations.map((org: any) => (
                      <div key={org.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <h3 className="font-semibold">{org.name}</h3>
                          <p className="text-sm text-muted-foreground">{org.description || 'No description'}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => handleDownload('macos', org.id)}
                          disabled={downloading}
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Installation Instructions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Windows Installation</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Download the agent installer from the button above</li>
                <li>Right-click the downloaded .exe file and select "Run as administrator"</li>
                <li>Follow the on-screen installation instructions</li>
                <li>When prompted, enter your credentials (the same ones you use to log in)</li>
                <li>The agent will start automatically after installation</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>macOS Installation</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Download the agent installer from the button above</li>
                <li>Open the downloaded .pkg file</li>
                <li>Follow the on-screen installation instructions</li>
                <li>You may need to grant permissions in System Preferences</li>
                <li>When prompted, enter your credentials (the same ones you use to log in)</li>
                <li>The agent will start automatically after installation</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}