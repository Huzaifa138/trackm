import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaWindows, FaApple, FaPython } from 'react-icons/fa';
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

  const getDownloadFilename = (platform: string) => {
    switch (platform) {
      case 'windows':
        return 'ActivTrack_Windows_Setup.exe';
      case 'macos':
        return 'ActivTrack_macOS.pkg';
      case 'python':
        return 'ActivTrack_Python_Agent.exe';
      default:
        return 'ActivTrack_Agent.exe';
    }
  };

  const getDownloadDescription = (platform: string) => {
    switch (platform) {
      case 'windows':
        return 'Windows agent download has started. Run the executable file after downloading.';
      case 'macos':
        return 'macOS agent download has started. Run the package file after downloading.';
      case 'python':
        return 'Python agent download has started. Run the executable file after downloading.';
      default:
        return 'Agent download has started.';
    }
  };

  const handleDownload = async (platform: string, orgId?: number) => {
    setDownloading(true);
    try {
      let url = `/api/agent/download/${platform}`;
      if (orgId) url += `/${orgId}`;
      
      // Create a download link for the file
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.setAttribute('download', getDownloadFilename(platform));
      downloadLink.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "Download Started",
        description: getDownloadDescription(platform),
        variant: "default",
      });
      
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the agent. Please try again.",
        variant: "destructive",
      });
      console.error("Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Desktop Agent Download</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaWindows className="mr-2 h-6 w-6" /> Windows Agent
            </CardTitle>
            <CardDescription>
              Download the agent for Windows computers (Windows 7, 8, 10, 11)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              The Windows agent continuously tracks active time, application usage, website visits, 
              and productivity metrics. It captures screenshots (if enabled), enforces application 
              usage policies, and runs silently in the background with minimal system resources.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              System Requirements: Windows 7/8/10/11, 1GB RAM, 50MB free disk space
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
              Download the agent for Mac computers (macOS 10.12 Sierra and newer)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              The macOS agent continuously tracks active time, application usage, website visits, 
              and productivity metrics. It captures screenshots (if enabled), enforces application 
              usage policies, and runs efficiently while respecting macOS privacy settings.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              System Requirements: macOS 10.12 Sierra or newer, 1GB RAM, 50MB free disk space
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaPython className="mr-2 h-6 w-6" /> Python Agent
            </CardTitle>
            <CardDescription>
              Download the cross-platform Python agent (Windows, macOS, Linux)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              The Python agent is a lightweight, cross-platform solution that monitors application 
              usage, tracks productivity, and connects to the server via WebSocket for real-time updates. 
              Ideal for organizations with mixed environments or custom deployment needs.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              System Requirements: Python 3.6+, 512MB RAM, 20MB free disk space
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleDownload('python', organizationId || undefined)} 
              disabled={downloading}
              className="w-full"
            >
              {downloading ? 'Downloading...' : 'Download Python Agent'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {user?.role === 'admin' && organizations && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Organization-Specific Downloads</h2>
          <p className="mb-6">As an administrator, you can download pre-configured agents for specific organizations.</p>
          
          <Tabs defaultValue="windows" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="windows">Windows</TabsTrigger>
              <TabsTrigger value="macos">macOS</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
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

            <TabsContent value="python" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Python Agent by Organization</CardTitle>
                  <CardDescription>
                    Download pre-configured Python agents for specific organizations
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
                          onClick={() => handleDownload('python', org.id)}
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
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Windows Installation</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Download the agent executable file from the button above</li>
                <li>Right-click the "ActivTrack_Windows_Setup.exe" file and select "Run as administrator"</li>
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
                <li>Download the agent package file from the button above</li>
                <li>Double-click the "ActivTrack_macOS.pkg" file</li>
                <li>Follow the on-screen installation instructions</li>
                <li>You may need to grant permissions in System Preferences</li>
                <li>When prompted, enter your credentials (the same ones you use to log in)</li>
                <li>The agent will start automatically after installation</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Python Agent Installation</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Download the Python agent executable from the button above</li>
                <li>Run the "ActivTrack_Python_Agent.exe" file</li>
                <li>The agent will automatically install required dependencies</li>
                <li>When prompted, enter your organization ID and user credentials</li>
                <li>The agent will connect to the server via WebSocket for real-time updates</li>
                <li>A system tray icon will appear when the agent is running</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}