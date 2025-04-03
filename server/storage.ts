import { 
  users, type User, type InsertUser,
  teams, type Team, type InsertTeam,
  activities, type Activity, type InsertActivity,
  applications, type Application, type InsertApplication,
  websites, type Website, type InsertWebsite,
  dailySummaries, type DailySummary, type InsertDailySummary,
  projects, type Project, type InsertProject,
  screenshots, type Screenshot, type InsertScreenshot,
  alerts, type Alert, type InsertAlert,
  agentStatus, type AgentStatus, type InsertAgentStatus,
  restrictedApps, type RestrictedApp, type InsertRestrictedApp,
  agentConfig, type AgentConfig, type InsertAgentConfig
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Team management
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  getAllTeams(): Promise<Team[]>;
  
  // Activity tracking
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<Activity[]>;
  getRecentActivities(limit?: number): Promise<Activity[]>;

  // Application and website tracking
  getApplications(): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  getWebsites(): Promise<Website[]>;
  createWebsite(website: InsertWebsite): Promise<Website>;

  // Summary statistics
  getDailySummary(userId: number, date: Date): Promise<DailySummary | undefined>;
  createDailySummary(summary: InsertDailySummary): Promise<DailySummary>;
  getTeamSummaries(startDate?: Date, endDate?: Date): Promise<DailySummary[]>;

  // Projects
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;

  // Desktop Agent Screenshot functionality
  createScreenshot(screenshot: InsertScreenshot): Promise<Screenshot>;
  getScreenshotsByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<Screenshot[]>;
  
  // Desktop Agent Alert functionality
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlertsByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<Alert[]>;
  
  // Desktop Agent Status
  createAgentStatus(status: InsertAgentStatus): Promise<AgentStatus>;
  getLatestAgentStatus(userId: number): Promise<AgentStatus | undefined>;
  
  // Agent Configuration
  getAgentConfig(userId: number): Promise<AgentConfig | undefined>;
  createAgentConfig(config: InsertAgentConfig): Promise<AgentConfig>;
  updateAgentConfig(id: number, config: Partial<AgentConfig>): Promise<AgentConfig | undefined>;
  
  // Restricted Applications
  getRestrictedApps(teamId?: number): Promise<RestrictedApp[]>;
  createRestrictedApp(app: InsertRestrictedApp): Promise<RestrictedApp>;
  deleteRestrictedApp(id: number): Promise<boolean>;

  // Dashboard metrics
  getTeamOverview(): Promise<any>;
  getDashboardMetrics(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teams: Map<number, Team>;
  private activities: Map<number, Activity>;
  private applications: Map<number, Application>;
  private websites: Map<number, Website>;
  private dailySummaries: Map<number, DailySummary>;
  private projects: Map<number, Project>;
  private screenshots: Map<number, Screenshot>;
  private alerts: Map<number, Alert>;
  private agentStatuses: Map<number, AgentStatus>;
  private agentConfigs: Map<number, AgentConfig>;
  private restrictedApps: Map<number, RestrictedApp>;
  
  private userId: number;
  private teamId: number;
  private activityId: number;
  private applicationId: number;
  private websiteId: number;
  private dailySummaryId: number;
  private projectId: number;
  private screenshotId: number;
  private alertId: number;
  private agentStatusId: number;
  private agentConfigId: number;
  private restrictedAppId: number;

  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.activities = new Map();
    this.applications = new Map();
    this.websites = new Map();
    this.dailySummaries = new Map();
    this.projects = new Map();
    this.screenshots = new Map();
    this.alerts = new Map();
    this.agentStatuses = new Map();
    this.agentConfigs = new Map();
    this.restrictedApps = new Map();
    
    this.userId = 1;
    this.teamId = 1;
    this.activityId = 1;
    this.applicationId = 1;
    this.websiteId = 1;
    this.dailySummaryId = 1;
    this.projectId = 1;
    this.screenshotId = 1;
    this.alertId = 1;
    this.agentStatusId = 1;
    this.agentConfigId = 1;
    this.restrictedAppId = 1;
    
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed teams first
    const initialTeams = [
      { name: 'Development Team', description: 'Software engineers and developers', ownerId: 5 },
      { name: 'Marketing Team', description: 'Marketing and brand specialists', ownerId: 5 },
      { name: 'Sales Team', description: 'Sales and customer relations', ownerId: 5 }
    ];
    
    initialTeams.forEach(team => {
      this.createTeam(team);
    });

    // Seed users
    const initialUsers = [
      { username: 'amyk', password: 'password', name: 'Amy Kirkland', email: 'amy@example.com', department: 'Development', role: 'user', avatarColor: '#0078D4', teamId: 1, lastActive: new Date() },
      { username: 'johnm', password: 'password', name: 'John Miller', email: 'john@example.com', department: 'Marketing', role: 'user', avatarColor: '#2B88D8', teamId: 2, lastActive: new Date() },
      { username: 'sarahl', password: 'password', name: 'Sarah Lee', email: 'sarah@example.com', department: 'Sales', role: 'user', avatarColor: '#FFB900', teamId: 3, lastActive: new Date() },
      { username: 'robertj', password: 'password', name: 'Robert Johnson', email: 'robert@example.com', department: 'HR', role: 'user', avatarColor: '#E81123', teamId: 1, lastActive: new Date() },
      { username: 'admin', password: 'admin', name: 'Admin User', email: 'admin@example.com', department: 'IT', role: 'admin', avatarColor: '#107C10', lastActive: new Date() }
    ];
    
    initialUsers.forEach(user => {
      this.createUser(user);
    });

    // Seed applications
    const initialApps = [
      { name: 'Microsoft Teams', category: 'productive' },
      { name: 'Visual Studio Code', category: 'productive' },
      { name: 'Outlook', category: 'productive' },
      { name: 'Google Chrome', category: 'neutral' },
      { name: 'Slack', category: 'productive' },
      { name: 'Photoshop', category: 'productive' },
      { name: 'Salesforce', category: 'productive' },
      { name: 'Workday', category: 'productive' },
      { name: 'PowerPoint', category: 'productive' },
      { name: 'Excel', category: 'productive' },
    ];
    
    initialApps.forEach(app => {
      this.createApplication(app);
    });

    // Seed websites
    const initialWebsites = [
      { url: 'github.com', category: 'productive' },
      { url: 'docs.google.com', category: 'productive' },
      { url: 'youtube.com', category: 'neutral' },
      { url: 'slack.com', category: 'productive' },
      { url: 'stackoverflow.com', category: 'productive' },
      { url: 'twitter.com', category: 'unproductive' },
      { url: 'facebook.com', category: 'unproductive' },
      { url: 'linkedin.com', category: 'neutral' }
    ];
    
    initialWebsites.forEach(website => {
      this.createWebsite(website);
    });

    // Seed projects
    const initialProjects = [
      { name: 'Project X', description: 'Core product development', teamId: 1 },
      { name: 'Website Redesign', description: 'Updating company website', teamId: 2 },
      { name: 'Sales Campaign Q2', description: 'Q2 promotional activities', teamId: 3 }
    ];
    
    initialProjects.forEach(project => {
      this.createProject(project);
    });
    
    // Seed restricted applications
    const initialRestrictedApps = [
      { 
        name: 'YouTube', 
        platform: 'both', 
        alertThreshold: 15, 
        closeAfterAlert: true, 
        alertMessage: 'YouTube is restricted during work hours', 
        processNames: ['youtube.com', 'youtube'],
        teamId: 1
      },
      { 
        name: 'Facebook', 
        platform: 'both', 
        alertThreshold: 10, 
        closeAfterAlert: true, 
        alertMessage: 'Facebook is restricted during work hours', 
        processNames: ['facebook.com', 'facebook'],
        teamId: 1 
      },
      { 
        name: 'Games', 
        platform: 'windows', 
        alertThreshold: 1, 
        closeAfterAlert: true, 
        alertMessage: 'Gaming applications are not allowed during work hours', 
        processNames: ['steam.exe', 'battle.net.exe', 'epicgameslauncher.exe'],
        teamId: 1
      }
    ];
    
    initialRestrictedApps.forEach(app => {
      this.createRestrictedApp(app);
    });
    
    // Seed agent configurations for each user
    for (let i = 1; i <= 5; i++) {
      this.createAgentConfig({
        userId: i,
        teamId: i <= 4 ? Math.ceil(i / 2) : null,
        screenshotFrequency: 5, // minutes
        activityTrackingInterval: 5, // seconds
        idleThreshold: 60, // seconds
        monitorApplications: true,
        monitorWebsites: true,
        captureScreenshots: true,
        privateMode: false,
        enforceRestrictedApps: true,
        workingHoursEnabled: true,
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00',
        workingDays: [1, 2, 3, 4, 5] // Monday-Friday
      });
    }
    
    // Seed agent statuses
    const currentTime = new Date();
    
    for (let userId = 1; userId <= 4; userId++) {
      this.createAgentStatus({
        userId,
        teamId: Math.ceil(userId / 2),
        timestamp: currentTime,
        version: '1.0.0',
        platform: userId % 2 === 0 ? 'windows' : 'macos',
        isRunning: true,
        isConnected: true,
        lastActivityTime: currentTime,
        cpuUsage: 25 + Math.floor(Math.random() * 20),
        memoryUsage: 40 + Math.floor(Math.random() * 30),
        diskSpace: 60 + Math.floor(Math.random() * 20)
      });
    }
    
    // Seed screenshots for demo
    const screenshotTimestamps = [
      new Date(currentTime.getTime() - 60 * 60 * 1000), // 1 hour ago
      new Date(currentTime.getTime() - 30 * 60 * 1000), // 30 minutes ago
      new Date(currentTime.getTime() - 15 * 60 * 1000), // 15 minutes ago
    ];
    
    // Create some screenshots for the first two users
    for (let userId = 1; userId <= 2; userId++) {
      screenshotTimestamps.forEach(timestamp => {
        this.createScreenshot({
          userId,
          teamId: Math.ceil(userId / 2),
          timestamp,
          imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // 1x1 pixel transparent PNG
          application: userId === 1 ? 'Visual Studio Code' : 'Photoshop',
          website: userId === 1 ? 'github.com' : '',
          title: userId === 1 ? 'Coding project' : 'Design work'
        });
      });
    }
    
    // Seed some alerts
    const alertTimestamps = [
      new Date(currentTime.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      new Date(currentTime.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    ];
    
    this.createAlert({
      userId: 3,
      teamId: 2,
      timestamp: alertTimestamps[0],
      application: 'Google Chrome',
      website: 'youtube.com',
      title: 'YouTube - Music',
      message: 'YouTube is restricted during work hours',
      actionTaken: 'notified'
    });
    
    this.createAlert({
      userId: 4,
      teamId: 2,
      timestamp: alertTimestamps[1],
      application: 'Steam',
      website: '',
      title: 'Steam Client',
      message: 'Gaming applications are not allowed during work hours',
      actionTaken: 'closed'
    });

    // Seed some activities
    const activityTime = new Date();
    const createActivity = (userId: number, app: string, minutes: number, category: string, website?: string) => {
      const endTime = new Date(activityTime);
      const startTime = new Date(endTime);
      startTime.setMinutes(endTime.getMinutes() - minutes);
      
      this.createActivity({
        userId,
        startTime,
        endTime,
        duration: minutes * 60,
        application: app,
        website: website || '',
        title: `Working on ${app}`,
        category
      });
    };

    // User 1 activities
    createActivity(1, 'Visual Studio Code', 120, 'productive');
    createActivity(1, 'Microsoft Teams', 45, 'productive');
    createActivity(1, 'Google Chrome', 30, 'neutral', 'github.com');
    
    // User 2 activities
    createActivity(2, 'Photoshop', 90, 'productive');
    createActivity(2, 'Google Chrome', 60, 'neutral', 'docs.google.com');
    
    // User 3 activities
    createActivity(3, 'Salesforce', 150, 'productive');
    createActivity(3, 'Outlook', 45, 'productive');
    
    // User 4 activities
    createActivity(4, 'Workday', 110, 'productive');
    createActivity(4, 'Google Chrome', 60, 'unproductive', 'youtube.com');

    // Seed daily summaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.createDailySummary({
      userId: 1,
      date: today,
      activeTime: 7 * 3600 + 12 * 60, // 7h 12m
      productiveTime: 6 * 3600 + 5 * 60, // 6h 5m
      neutralTime: 1 * 3600 + 7 * 60, // 1h 7m
      unproductiveTime: 0,
      productivityScore: 85,
      topApplications: [
        { name: 'VS Code', time: 4 * 3600 + 30 * 60, category: 'productive' },
        { name: 'Microsoft Teams', time: 1 * 3600 + 35 * 60, category: 'productive' }
      ],
      topWebsites: [
        { url: 'github.com', time: 1 * 3600 + 25 * 60, category: 'productive' },
        { url: 'stackoverflow.com', time: 45 * 60, category: 'productive' }
      ]
    });
    
    this.createDailySummary({
      userId: 2,
      date: today,
      activeTime: 6 * 3600 + 45 * 60, // 6h 45m
      productiveTime: 4 * 3600 + 35 * 60, // 4h 35m
      neutralTime: 1 * 3600 + 40 * 60, // 1h 40m
      unproductiveTime: 30 * 60, // 30m
      productivityScore: 68,
      topApplications: [
        { name: 'Photoshop', time: 3 * 3600 + 20 * 60, category: 'productive' },
        { name: 'PowerPoint', time: 1 * 3600 + 15 * 60, category: 'productive' }
      ],
      topWebsites: [
        { url: 'docs.google.com', time: 55 * 60, category: 'productive' },
        { url: 'youtube.com', time: 45 * 60, category: 'neutral' }
      ]
    });
    
    this.createDailySummary({
      userId: 3,
      date: today,
      activeTime: 8 * 3600 + 5 * 60, // 8h 5m
      productiveTime: 7 * 3600 + 25 * 60, // 7h 25m
      neutralTime: 40 * 60, // 40m
      unproductiveTime: 0,
      productivityScore: 92,
      topApplications: [
        { name: 'Salesforce', time: 5 * 3600 + 10 * 60, category: 'productive' },
        { name: 'Excel', time: 2 * 3600 + 15 * 60, category: 'productive' }
      ],
      topWebsites: [
        { url: 'docs.google.com', time: 40 * 60, category: 'productive' }
      ]
    });
    
    this.createDailySummary({
      userId: 4,
      date: today,
      activeTime: 5 * 3600 + 30 * 60, // 5h 30m
      productiveTime: 2 * 3600 + 28 * 60, // 2h 28m
      neutralTime: 2 * 3600 + 0 * 60, // 2h 0m
      unproductiveTime: 1 * 3600 + 2 * 60, // 1h 2m
      productivityScore: 45,
      topApplications: [
        { name: 'Outlook', time: 2 * 3600 + 28 * 60, category: 'productive' },
        { name: 'Chrome', time: 3 * 3600 + 2 * 60, category: 'neutral' }
      ],
      topWebsites: [
        { url: 'youtube.com', time: 1 * 3600 + 0 * 60, category: 'unproductive' },
        { url: 'docs.google.com', time: 30 * 60, category: 'productive' }
      ]
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, status: 'offline' };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, status };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Team management
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }
  
  async createTeam(team: InsertTeam): Promise<Team> {
    const id = this.teamId++;
    const newTeam: Team = { ...team, id };
    this.teams.set(id, newTeam);
    return newTeam;
  }
  
  async getAllTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  // Activity tracking
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const newActivity: Activity = { ...activity, id };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getActivitiesByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<Activity[]> {
    let activities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId);
    
    if (startDate) {
      activities = activities.filter(activity => 
        new Date(activity.startTime) >= new Date(startDate));
    }
    
    if (endDate) {
      activities = activities.filter(activity => 
        new Date(activity.endTime) <= new Date(endDate));
    }
    
    return activities.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  // Application and website tracking
  async getApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.applicationId++;
    const newApplication: Application = { ...application, id };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async getWebsites(): Promise<Website[]> {
    return Array.from(this.websites.values());
  }

  async createWebsite(website: InsertWebsite): Promise<Website> {
    const id = this.websiteId++;
    const newWebsite: Website = { ...website, id };
    this.websites.set(id, newWebsite);
    return newWebsite;
  }

  // Summary statistics
  async getDailySummary(userId: number, date: Date): Promise<DailySummary | undefined> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return Array.from(this.dailySummaries.values()).find(summary => 
      summary.userId === userId && 
      new Date(summary.date).getTime() === targetDate.getTime());
  }

  async createDailySummary(summary: InsertDailySummary): Promise<DailySummary> {
    const id = this.dailySummaryId++;
    const newSummary: DailySummary = { ...summary, id };
    this.dailySummaries.set(id, newSummary);
    return newSummary;
  }

  async getTeamSummaries(startDate?: Date, endDate?: Date): Promise<DailySummary[]> {
    let summaries = Array.from(this.dailySummaries.values());
    
    if (startDate) {
      const targetStartDate = new Date(startDate);
      targetStartDate.setHours(0, 0, 0, 0);
      summaries = summaries.filter(summary => 
        new Date(summary.date) >= targetStartDate);
    }
    
    if (endDate) {
      const targetEndDate = new Date(endDate);
      targetEndDate.setHours(23, 59, 59, 999);
      summaries = summaries.filter(summary => 
        new Date(summary.date) <= targetEndDate);
    }
    
    return summaries;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const newProject: Project = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  // Desktop Agent Screenshot functionality
  async createScreenshot(screenshot: InsertScreenshot): Promise<Screenshot> {
    const id = this.screenshotId++;
    const newScreenshot: Screenshot = { ...screenshot, id };
    this.screenshots.set(id, newScreenshot);
    return newScreenshot;
  }
  
  async getScreenshotsByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<Screenshot[]> {
    let screenshots = Array.from(this.screenshots.values())
      .filter(screenshot => screenshot.userId === userId);
    
    if (startDate) {
      screenshots = screenshots.filter(screenshot => 
        new Date(screenshot.timestamp) >= new Date(startDate));
    }
    
    if (endDate) {
      screenshots = screenshots.filter(screenshot => 
        new Date(screenshot.timestamp) <= new Date(endDate));
    }
    
    return screenshots.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  // Desktop Agent Alert functionality
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.alertId++;
    const newAlert: Alert = { ...alert, id };
    this.alerts.set(id, newAlert);
    return newAlert;
  }
  
  async getAlertsByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId);
    
    if (startDate) {
      alerts = alerts.filter(alert => 
        new Date(alert.timestamp) >= new Date(startDate));
    }
    
    if (endDate) {
      alerts = alerts.filter(alert => 
        new Date(alert.timestamp) <= new Date(endDate));
    }
    
    return alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  // Desktop Agent Status
  async createAgentStatus(status: InsertAgentStatus): Promise<AgentStatus> {
    const id = this.agentStatusId++;
    const newStatus: AgentStatus = { ...status, id };
    this.agentStatuses.set(id, newStatus);
    return newStatus;
  }
  
  async getLatestAgentStatus(userId: number): Promise<AgentStatus | undefined> {
    return Array.from(this.agentStatuses.values())
      .filter(status => status.userId === userId)
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
  }
  
  // Agent Configuration
  async getAgentConfig(userId: number): Promise<AgentConfig | undefined> {
    return Array.from(this.agentConfigs.values()).find(config => config.userId === userId);
  }
  
  async createAgentConfig(config: InsertAgentConfig): Promise<AgentConfig> {
    const id = this.agentConfigId++;
    const newConfig: AgentConfig = { ...config, id };
    this.agentConfigs.set(id, newConfig);
    return newConfig;
  }
  
  async updateAgentConfig(id: number, config: Partial<AgentConfig>): Promise<AgentConfig | undefined> {
    const existingConfig = this.agentConfigs.get(id);
    if (!existingConfig) return undefined;
    
    const updatedConfig = { ...existingConfig, ...config };
    this.agentConfigs.set(id, updatedConfig);
    return updatedConfig;
  }
  
  // Restricted Applications
  async getRestrictedApps(teamId?: number): Promise<RestrictedApp[]> {
    const apps = Array.from(this.restrictedApps.values());
    
    if (teamId) {
      return apps.filter(app => app.teamId === teamId);
    }
    
    return apps;
  }
  
  async createRestrictedApp(app: InsertRestrictedApp): Promise<RestrictedApp> {
    const id = this.restrictedAppId++;
    const newApp: RestrictedApp = { ...app, id };
    this.restrictedApps.set(id, newApp);
    return newApp;
  }
  
  async deleteRestrictedApp(id: number): Promise<boolean> {
    return this.restrictedApps.delete(id);
  }

  // Dashboard metrics
  async getTeamOverview(): Promise<any> {
    const users = await this.getAllUsers();
    const summaries = await this.getTeamSummaries();
    
    // Group summaries by user
    const userSummaries = users.map(user => {
      const userSummary = summaries.find(s => s.userId === user.id);
      
      if (!userSummary) {
        return {
          ...user,
          activeTime: 0,
          productivityScore: 0,
          topApplication: 'N/A'
        };
      }
      
      const topApp = userSummary.topApplications && 
        Array.isArray(userSummary.topApplications) && 
        userSummary.topApplications.length > 0 ? 
        userSummary.topApplications[0].name : 'N/A';
      
      return {
        ...user,
        activeTime: userSummary.activeTime,
        productivityScore: userSummary.productivityScore,
        topApplication: topApp
      };
    });
    
    return userSummaries;
  }

  async getDashboardMetrics(): Promise<any> {
    const summaries = await this.getTeamSummaries();
    const users = await this.getAllUsers();
    
    if (summaries.length === 0) {
      return {
        activeTime: "0h 0m",
        activeTimeChange: 0,
        productivityScore: "0%",
        productivityScoreChange: 0,
        applicationsCount: 0,
        applicationsCountChange: 0,
        activeMembers: 0,
        totalMembers: users.length
      };
    }
    
    // Calculate totals
    const totalActiveTime = summaries.reduce((sum, s) => sum + s.activeTime, 0);
    const avgProductivityScore = summaries.reduce((sum, s) => sum + s.productivityScore, 0) / summaries.length;
    
    // Get unique applications used
    const uniqueApps = new Set();
    summaries.forEach(s => {
      if (s.topApplications && Array.isArray(s.topApplications)) {
        s.topApplications.forEach(app => uniqueApps.add(app.name));
      }
    });
    
    // Count active users
    const activeUsers = users.filter(u => u.status === 'active').length;
    
    // Format active time
    const hours = Math.floor(totalActiveTime / 3600);
    const minutes = Math.floor((totalActiveTime % 3600) / 60);
    
    return {
      activeTime: `${hours}h ${minutes}m`,
      activeTimeChange: 12, // Mock value since we don't have historical data
      productivityScore: `${Math.round(avgProductivityScore)}%`,
      productivityScoreChange: 5, // Mock value since we don't have historical data
      applicationsCount: uniqueApps.size,
      applicationsCountChange: -3, // Mock value since we don't have historical data
      activeMembers: activeUsers,
      totalMembers: users.length
    };
  }
}

export const storage = new MemStorage();
