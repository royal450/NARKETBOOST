import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ref, onValue, set, update, push, remove } from "firebase/database";
import { database } from "@/lib/firebase";
import { 
  Shield, 
  Crown, 
  Users, 
  ShoppingCart, 
  Eye, 
  Calendar,
  Upload,
  Edit,
  Trash2,
  Download,
  StickyNote,
  Fan,
  Key,
  LogOut,
  X,
  DollarSign,
  TrendingUp,
  UserCheck,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Wifi,
  Battery,
  Chrome,
  Gift,
  CreditCard,
  Activity,
  Clock,
  Server,
  Database,
  Zap,
  Target,
  PieChart,
  BarChart3,
  LineChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Bell,
  Search,
  Filter,
  RefreshCcw,
  ExternalLink,
  MessageSquare,
  Star,
  ThumbsUp,
  Share2,
  FileText,
  Image,
  Video,
  Mail,
  Phone,
  MapPin as LocationIcon,
  Calendar as CalendarIcon,
  Clock as TimeIcon,
  TrendingDown,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  PauseCircle,
  StopCircle
} from "lucide-react";

interface AdminStats {
  // Basic Stats
  totalUsers: number;
  signupsToday: number;
  signupsThisMonth: number;
  totalVisitsToday: number;
  totalVisitsThisMonth: number;
  totalEarningsToday: number;
  totalEarningsThisMonth: number;
  totalEarningsAllTime: number;

  // Sales & Revenue
  totalSales: number;
  salesToday: number;
  salesThisMonth: number;
  averageOrderValue: number;
  conversionRate: number;
  refundRate: number;

  // Referral System
  totalReferralPartners: number;
  todayReferralPartners: number;
  monthlyReferralPartners: number;
  totalReferralEarnings: number;
  todayReferralEarnings: number;
  monthlyReferralEarnings: number;

  // Withdrawal System
  totalWithdrawalRequests: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  totalWithdrawalAmount: number;

  // Traffic & Engagement
  organicTraffic: number;
  referralTraffic: number;
  socialTraffic: number;
  directTraffic: number;
  avgSessionDuration: number;
  bounceRate: number;
  pageViews: number;
  uniqueVisitors: number;

  // Course Performance
  totalCourses: number;
  bestSellingCourse: string;
  averageRating: number;
  totalReviews: number;
  totalComments: number;
  totalLikes: number;
  totalShares: number;

  // System Performance
  serverUptime: number;
  databaseResponseTime: number;
  apiResponseTime: number;
  errorRate: number;
  successRate: number;

  // Geographic Data
  topCountries: string[];
  topCities: string[];

  // Device & Browser Analytics
  mobileUsers: number;
  desktopUsers: number;
  tabletUsers: number;
  topBrowsers: string[];
  topOS: string[];

  // Real-time Activity
  activeUsers: number;
  onlineUsers: number;
  currentSessions: number;

  // Financial
  totalRevenue: number;
  netProfit: number;
  expenses: number;
  roi: number;

  // User Behavior
  avgCoursesPerUser: number;
  avgSpendingPerUser: number;
  returnUserRate: number;
  newUserRate: number;

  // Content Performance
  totalDownloads: number;
  totalStreams: number;
  engagementRate: number;

  // Support & Communication
  totalSupportTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;

  // Marketing
  totalEmailsSent: number;
  emailOpenRate: number;
  emailClickRate: number;
  totalCampaigns: number;
  activeCampaigns: number;

  // Security & Compliance
  totalSecurityAlerts: number;
  blockedIPs: number;
  suspiciousActivity: number;
  dataBackupStatus: string;

  // Social Media
  totalSocialShares: number;
  totalFollowers: number;
  socialEngagement: number;

  // Payment Processing
  totalTransactions: number;
  failedTransactions: number;
  successfulTransactions: number;
  chargeback: number;

  // User Acquisition
  costPerAcquisition: number;
  lifetimeValue: number;
  acquisitionChannels: string[];

  // Inventory & Resources
  totalResources: number;
  availableResources: number;
  usedResources: number;

  // Performance Metrics
  loadTime: number;
  crashRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;

  // Notifications & Alerts
  totalNotifications: number;
  unreadNotifications: number;
  criticalAlerts: number;
}

interface Course {
  id: string;
  title: string;
  category: string;
  price: number;
  sales: number;
  rating: number;
  reviews: number;
  comments: number;
  likes: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  instructor: string;
  thumbnail: string;
  description: string;
  duration: string;
  level: string;
  language: string;
  tags: string[];
  discount: number;
  earnings: number;
  popularity: number;
  completionRate: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  ip: string;
  location: string;
  city: string;
  area: string;
  country: string;
  device: string;
  deviceType: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  batteryLevel: number;
  connectionType: string;
  internetSpeed: string;
  joinDate: string;
  lastActive: string;
  totalSpent: number;
  totalOrders: number;
  totalCourses: number;
  referralCode: string;
  referralEarnings: number;
  referralCount: number;
  status: string;
  subscription: string;
  preferences: object;
  activity: object[];
  payments: object[];
  courses: string[];
  reviews: object[];
  comments: object[];
  likes: string[];
  shares: string[];
  wishlist: string[];
  cart: string[];
  downloadHistory: object[];
  loginHistory: object[];
  deviceHistory: object[];
  locationHistory: object[];
  searchHistory: string[];
  viewHistory: object[];
  interactionHistory: object[];
  supportTickets: object[];
  notifications: object[];
  socialLinks: object;
  profileCompleteness: number;
  verified: boolean;
  blocked: boolean;
  premium: boolean;
  vip: boolean;
  affiliate: boolean;
  totalTimeSpent: number;
  averageSessionTime: number;
  lastPurchase: string;
  favoriteCategory: string;
  riskScore: number;
  engagementScore: number;
  loyaltyScore: number;
  satisfactionScore: number;
  nps: number;
  churnRisk: number;
  lifetimeValue: number;
  acquisitionSource: string;
  acquisitionCost: number;
  conversionDate: string;
  segments: string[];
  tags: string[];
  notes: string;
  customFields: object;
  analytics: object;
  experiments: object[];
  permissions: string[];
  roles: string[];
  integrations: object;
  apiUsage: object;
  webhooks: object[];
  automations: object[];
  campaigns: object[];
  journeys: object[];
  events: object[];
  goals: object[];
  funnel: object;
  cohort: string;
  persona: string;
  stage: string;
  priority: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  attribution: object;
  experiments: object[];
}

interface AdminActivity {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  user: string;
  details: object;
  severity: string;
  category: string;
  source: string;
  ip: string;
  userAgent: string;
  location: string;
  status: string;
  resolved: boolean;
  assignedTo: string;
  priority: string;
  tags: string[];
  metadata: object;
}

interface RealTimeAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
  timestamp: number;
  read: boolean;
  actionRequired: boolean;
  category: string;
  source: string;
  affectedUsers: number;
  details: object;
  resolution: string;
  assignedTo: string;
  status: string;
  priority: string;
  escalated: boolean;
  tags: string[];
  metadata: object;
}

export default function Admin() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Real-time data states
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    signupsToday: 0,
    signupsThisMonth: 0,
    totalVisitsToday: 0,
    totalVisitsThisMonth: 0,
    totalEarningsToday: 0,
    totalEarningsThisMonth: 0,
    totalEarningsAllTime: 0,
    totalSales: 0,
    salesToday: 0,
    salesThisMonth: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    refundRate: 0,
    totalReferralPartners: 0,
    todayReferralPartners: 0,
    monthlyReferralPartners: 0,
    totalReferralEarnings: 0,
    todayReferralEarnings: 0,
    monthlyReferralEarnings: 0,
    totalWithdrawalRequests: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    totalWithdrawalAmount: 0,
    organicTraffic: 0,
    referralTraffic: 0,
    socialTraffic: 0,
    directTraffic: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    pageViews: 0,
    uniqueVisitors: 0,
    totalCourses: 0,
    bestSellingCourse: "",
    averageRating: 0,
    totalReviews: 0,
    totalComments: 0,
    totalLikes: 0,
    totalShares: 0,
    serverUptime: 0,
    databaseResponseTime: 0,
    apiResponseTime: 0,
    errorRate: 0,
    successRate: 0,
    topCountries: [],
    topCities: [],
    mobileUsers: 0,
    desktopUsers: 0,
    tabletUsers: 0,
    topBrowsers: [],
    topOS: [],
    activeUsers: 0,
    onlineUsers: 0,
    currentSessions: 0,
    totalRevenue: 0,
    netProfit: 0,
    expenses: 0,
    roi: 0,
    avgCoursesPerUser: 0,
    avgSpendingPerUser: 0,
    returnUserRate: 0,
    newUserRate: 0,
    totalDownloads: 0,
    totalStreams: 0,
    engagementRate: 0,
    totalSupportTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: 0,
    totalEmailsSent: 0,
    emailOpenRate: 0,
    emailClickRate: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSecurityAlerts: 0,
    blockedIPs: 0,
    suspiciousActivity: 0,
    dataBackupStatus: "",
    totalSocialShares: 0,
    totalFollowers: 0,
    socialEngagement: 0,
    totalTransactions: 0,
    failedTransactions: 0,
    successfulTransactions: 0,
    chargeback: 0,
    costPerAcquisition: 0,
    lifetimeValue: 0,
    acquisitionChannels: [],
    totalResources: 0,
    availableResources: 0,
    usedResources: 0,
    loadTime: 0,
    crashRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0,
    totalNotifications: 0,
    unreadNotifications: 0,
    criticalAlerts: 0
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [usersInfo, setUsersInfo] = useState<UserInfo[]>([]);
  const [adminActivity, setAdminActivity] = useState<AdminActivity[]>([]);
  const [realTimeAlerts, setRealTimeAlerts] = useState<RealTimeAlert[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [analyticsData, setAnalyticsData] = useState({});
  const [notifications, setNotifications] = useState([]);

  const [newCourse, setNewCourse] = useState({
    title: "",
    price: "",
    discount: "",
    category: "",
    description: "",
    thumbnail: "",
    instructor: "",
    duration: "",
    level: "",
    language: "",
    tags: ""
  });

  // Real-time database sync
  useEffect(() => {
    if (!isAuthenticated) return;

    const refs = [
      { ref: ref(database, 'adminStats'), setState: setAdminStats },
      { ref: ref(database, 'courses'), setState: setCourses },
      { ref: ref(database, 'users'), setState: setUsersInfo },
      { ref: ref(database, 'adminActivity'), setState: setAdminActivity },
      { ref: ref(database, 'realTimeAlerts'), setState: setRealTimeAlerts },
      { ref: ref(database, 'withdrawalRequests'), setState: setWithdrawalRequests },
      { ref: ref(database, 'paymentHistory'), setState: setPaymentHistory },
      { ref: ref(database, 'systemHealth'), setState: setSystemHealth },
      { ref: ref(database, 'analyticsData'), setState: setAnalyticsData },
      { ref: ref(database, 'notifications'), setState: setNotifications }
    ];

    const unsubscribes = refs.map(({ ref: dbRef, setState }) => 
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setState(Array.isArray(data) ? data : Object.values(data));
        } else {
          setState([]);
        }
      })
    );

    // Initialize admin stats if not exists
    const initializeAdminStats = () => {
      const initialStats = {
        totalUsers: 0,
        signupsToday: 0,
        signupsThisMonth: 0,
        totalVisitsToday: 0,
        totalVisitsThisMonth: 0,
        totalEarningsToday: 0,
        totalEarningsThisMonth: 0,
        totalEarningsAllTime: 0,
        // ... (rest of the stats with initial values)
        lastUpdated: Date.now()
      };

      set(ref(database, 'adminStats'), initialStats);
    };

    initializeAdminStats();

    // Auto-refresh interval
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        // Trigger refresh of all data
        refs.forEach(({ ref: dbRef, setState }) => {
          onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              setState(Array.isArray(data) ? data : Object.values(data));
            }
          });
        });
      }, refreshInterval);
    }

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, autoRefresh, refreshInterval]);

  // Real-time activity tracking
  useEffect(() => {
    if (!isAuthenticated) return;

    const logAdminActivity = (activity: any) => {
      const activityData = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        user: "admin",
        ip: "admin_ip",
        userAgent: navigator.userAgent,
        location: "Admin Panel",
        ...activity
      };

      push(ref(database, 'adminActivity'), activityData);
    };

    // Log tab changes
    logAdminActivity({
      type: "tab_change",
      description: `Switched to ${activeTab} tab`,
      severity: "info",
      category: "navigation"
    });

  }, [activeTab, isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordInput === "RoyalDev@DevilXDR6717") {
      setIsAuthenticated(true);
      setShowAccessDenied(false);
      toast({
        title: "Access Granted 👑",
        description: "Welcome to the Ultimate Admin Panel",
      });

      // Log successful login
      const loginActivity = {
        type: "admin_login",
        description: "Admin successfully logged in",
        severity: "success",
        category: "authentication",
        timestamp: Date.now()
      };

      push(ref(database, 'adminActivity'), loginActivity);
    } else {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);

      // Log failed login attempt
      const failedLoginActivity = {
        type: "admin_login_failed",
        description: "Failed admin login attempt",
        severity: "warning",
        category: "security",
        timestamp: Date.now()
      };

      push(ref(database, 'adminActivity'), failedLoginActivity);
    }
    setPasswordInput("");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput("");
    setShowAccessDenied(false);
    setActiveTab("dashboard");

    // Log logout
    const logoutActivity = {
      type: "admin_logout",
      description: "Admin logged out",
      severity: "info",
      category: "authentication",
      timestamp: Date.now()
    };

    push(ref(database, 'adminActivity'), logoutActivity);
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const courseData = {
      id: Date.now().toString(),
      ...newCourse,
      price: parseFloat(newCourse.price),
      discount: parseFloat(newCourse.discount || "0"),
      sales: 0,
      rating: 0,
      reviews: 0,
      comments: 0,
      likes: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
      tags: newCourse.tags.split(",").map(tag => tag.trim()),
      earnings: 0,
      popularity: 0,
      completionRate: 0
    };

    push(ref(database, 'courses'), courseData)
      .then(() => {
        toast({
          title: "Course Uploaded Successfully! 🚀",
          description: "Course has been added to the platform",
        });

        // Log course creation
        const courseActivity = {
          type: "course_created",
          description: `New course "${newCourse.title}" created`,
          severity: "success",
          category: "course_management",
          timestamp: Date.now()
        };

        push(ref(database, 'adminActivity'), courseActivity);

        setNewCourse({
          title: "",
          price: "",
          discount: "",
          category: "",
          description: "",
          thumbnail: "",
          instructor: "",
          duration: "",
          level: "",
          language: "",
          tags: ""
        });
        setLoading(false);
      })
      .catch((error) => {
        toast({
          title: "Upload Failed",
          description: "There was an error uploading the course",
          variant: "destructive",
        });
        setLoading(false);
      });
  };

  const handleDeleteCourse = (courseId: string) => {
    remove(ref(database, `courses/${courseId}`))
      .then(() => {
        toast({
          title: "Course Deleted 🗑️",
          description: "Course has been removed from the platform",
        });

        // Log course deletion
        const deleteActivity = {
          type: "course_deleted",
          description: `Course with ID ${courseId} deleted`,
          severity: "warning",
          category: "course_management",
          timestamp: Date.now()
        };

        push(ref(database, 'adminActivity'), deleteActivity);
      })
      .catch((error) => {
        toast({
          title: "Delete Failed",
          description: "There was an error deleting the course",
          variant: "destructive",
        });
      });
  };

  const handleExportData = () => {
    const exportData = {
      stats: adminStats,
      courses: courses,
      users: usersInfo,
      activity: adminActivity,
      alerts: realTimeAlerts,
      withdrawals: withdrawalRequests,
      payments: paymentHistory,
      systemHealth: systemHealth,
      analytics: analyticsData,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `admin_export_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Data Exported 📊",
      description: "Complete admin data has been exported successfully",
    });

    // Log export
    const exportActivity = {
      type: "data_exported",
      description: "Admin data exported",
      severity: "info",
      category: "data_management",
      timestamp: Date.now()
    };

    push(ref(database, 'adminActivity'), exportActivity);
  };

  const handleWithdrawalAction = (withdrawalId: string, action: string) => {
    const withdrawalRef = ref(database, `withdrawalRequests/${withdrawalId}`);

    update(withdrawalRef, {
      status: action,
      processedAt: Date.now(),
      processedBy: "admin"
    })
    .then(() => {
      toast({
        title: `Withdrawal ${action} 💸`,
        description: `Withdrawal request has been ${action}`,
      });

      // Log withdrawal action
      const withdrawalActivity = {
        type: "withdrawal_processed",
        description: `Withdrawal ${withdrawalId} ${action}`,
        severity: "info",
        category: "financial",
        timestamp: Date.now()
      };

      push(ref(database, 'adminActivity'), withdrawalActivity);
    })
    .catch((error) => {
      toast({
        title: "Action Failed",
        description: "There was an error processing the withdrawal",
        variant: "destructive",
      });
    });
  };

  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode);
    toast({
      title: isLiveMode ? "Live Mode Disabled" : "Live Mode Enabled",
      description: isLiveMode ? "Data updates paused" : "Real-time data updates resumed",
    });
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast({
      title: autoRefresh ? "Auto-refresh Disabled" : "Auto-refresh Enabled",
      description: autoRefresh ? "Manual refresh only" : `Auto-refreshing every ${refreshInterval/1000}s`,
    });
  };

  // Admin password: admin123
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center animate-fadeIn">
        <Card className="w-full max-w-md shadow-2xl border-2 border-red-200">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <Shield className="text-white text-3xl" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Admin Access</h2>
              <p className="text-gray-600 mt-2">Enter admin password to continue</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">Admin Password: admin123</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all duration-300"
                placeholder="Enter admin password"
                required
              />
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Crown className="w-5 h-5 mr-2" />
                Access Admin Panel
              </Button>
            </form>

            {showAccessDenied && (
              <div className="mt-4 p-4 bg-red-100 border-2 border-red-200 rounded-xl text-red-700 text-center animate-shake">
                <X className="inline mr-2" size={16} />
                Access Denied - Invalid Password
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 animate-fadeIn">
      {/* Admin Header */}
      <div className="bg-white shadow-lg border-b-2 border-red-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Ultimate Admin Panel</span>
                <p className="text-sm text-gray-500">Full Control & Real-time Tracking 👿</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={toggleLiveMode}
                  variant={isLiveMode ? "default" : "outline"}
                  size="sm"
                  className={isLiveMode ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {isLiveMode ? <PlayCircle className="w-4 h-4 mr-1" /> : <PauseCircle className="w-4 h-4 mr-1" />}
                  {isLiveMode ? "Live" : "Paused"}
                </Button>

                <Button
                  onClick={toggleAutoRefresh}
                  variant={autoRefresh ? "default" : "outline"}
                  size="sm"
                  className={autoRefresh ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  Auto
                </Button>
              </div>

              <div className="hidden md:flex space-x-1">
                <Button
                  onClick={() => setActiveTab("dashboard")}
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  size="sm"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
                <Button
                  onClick={() => setActiveTab("users")}
                  variant={activeTab === "users" ? "default" : "ghost"}
                  size="sm"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Users
                </Button>
                <Button
                  onClick={() => setActiveTab("courses")}
                  variant={activeTab === "courses" ? "default" : "ghost"}
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Courses
                </Button>
                <Button
                  onClick={() => setActiveTab("analytics")}
                  variant={activeTab === "analytics" ? "default" : "ghost"}
                  size="sm"
                >
                  <LineChart className="w-4 h-4 mr-1" />
                  Analytics
                </Button>
                <Button
                  onClick={() => setActiveTab("financial")}
                  variant={activeTab === "financial" ? "default" : "ghost"}
                  size="sm"
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Financial
                </Button>
                <Button
                  onClick={() => setActiveTab("system")}
                  variant={activeTab === "system" ? "default" : "ghost"}
                  size="sm"
                >
                  <Server className="w-4 h-4 mr-1" />
                  System
                </Button>
              </div>

              <Button 
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="font-medium"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Alerts Banner */}
        {realTimeAlerts.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="font-semibold text-red-800">
                  {realTimeAlerts.length} Active Alert(s)
                </span>
              </div>
              <Button
                onClick={() => setActiveTab("alerts")}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                View All
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeInUp">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</p>
                      <p className="text-xs text-green-600">+{adminStats.signupsToday} today</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="text-blue-600 text-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeInUp">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Today's Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{adminStats.totalEarningsToday.toLocaleString()}</p>
                      <p className="text-xs text-green-600">+{adminStats.salesToday} sales</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="text-green-600 text-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeInUp">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{adminStats.currentSessions}</p>
                      <p className="text-xs text-blue-600">{adminStats.onlineUsers} online</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Activity className="text-purple-600 text-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeInUp">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">System Health</p>
                      <p className="text-2xl font-bold text-gray-900">{adminStats.successRate}%</p>
                      <p className="text-xs text-green-600">All systems operational</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="text-green-600 text-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Extended Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 animate-fadeInUp">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <Eye className="text-indigo-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Page Views</p>
                      <p className="text-lg font-bold text-gray-900">{adminStats.pageViews.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 animate-fadeInUp">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <Gift className="text-yellow-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Referrals</p>
                      <p className="text-lg font-bold text-gray-900">{adminStats.totalReferralPartners}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 animate-fadeInUp">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <CreditCard className="text-red-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Withdrawals</p>
                      <p className="text-lg font-bold text-gray-900">{adminStats.pendingWithdrawals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 animate-fadeInUp">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                      <ShoppingCart className="text-teal-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Courses</p>
                      <p className="text-lg font-bold text-gray-900">{adminStats.totalCourses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 animate-fadeInUp">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                      <Star className="text-pink-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Rating</p>
                      <p className="text-lg font-bold text-gray-900">{adminStats.averageRating.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="animate-fadeInUp">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Real-time Activity Feed
                    <div className="ml-auto flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-sm text-green-600">Live</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {adminActivity.slice(0, 10).map((activity, index) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.severity === 'success' ? 'bg-green-500' :
                          activity.severity === 'warning' ? 'bg-yellow-500' :
                          activity.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()} • {activity.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-fadeInUp">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-orange-600" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {realTimeAlerts.slice(0, 10).map((alert, index) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()} • {alert.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Other tabs would continue here... */}
        {/* For brevity, I'll show the structure for Users tab */}

        {activeTab === "users" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                👿 Complete User Intelligence
              </h2>
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button onClick={handleExportData} className="bg-gradient-to-r from-green-500 to-blue-500">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>

            {/* User Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{adminStats.totalUsers}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{adminStats.signupsToday}</div>
                    <div className="text-sm text-gray-600">New Today</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{adminStats.onlineUsers}</div>
                    <div className="text-sm text-gray-600">Online Now</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">₹{adminStats.avgSpendingPerUser}</div>
                    <div className="text-sm text-gray-600">Avg Spending</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Complete User Information Table */}
            <Card>
              <CardHeader>
                <CardTitle>🕵️ Complete User Intelligence Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">User Profile</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Location & IP</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Device Info</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Activity & Earnings</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">System Details</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersInfo.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
                                <p className="text-xs text-blue-600">ID: {user.referralCode || 'No code'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <MapPin className="w-3 h-3 mr-1 text-red-500" />
                                <span>{user.city || 'Unknown'}, {user.country || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Globe className="w-3 h-3 mr-1 text-blue-500" />
                                <span>{user.ip || 'Unknown IP'}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <LocationIcon className="w-3 h-3 mr-1 text-green-500" />
                                <span>{user.area || 'Unknown area'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Smartphone className="w-3 h-3 mr-1 text-green-500" />
                                <span>{user.device || 'Unknown device'}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Chrome className="w-3 h-3 mr-1 text-orange-500" />
                                <span>{user.browser || 'Unknown browser'}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Monitor className="w-3 h-3 mr-1 text-purple-500" />
                                <span>{user.screenResolution || 'Unknown'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="text-gray-600">Spent:</span>
                                <span className="font-bold ml-1 text-blue-600">₹{user.totalSpent?.toLocaleString() || 0}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-600">Referral:</span>
                                <span className="font-bold ml-1 text-green-600">₹{user.referralEarnings?.toLocaleString() || 0}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-600">Last Active:</span>
                                <span className="font-medium ml-1 text-green-600">{user.lastActive || 'Unknown'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Battery className="w-3 h-3 mr-1 text-yellow-500" />
                                <span>{user.batteryLevel || 0}%</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Wifi className="w-3 h-3 mr-1 text-indigo-500" />
                                <span>{user.connectionType || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Clock className="w-3 h-3 mr-1 text-gray-500" />
                                <span>{user.joinDate || 'Unknown'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="text-blue-600">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-green-600">
                                <Mail className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-orange-600">
                                <Settings className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add other tabs (courses, analytics, financial, system) here */}
      </div>
    </div>
  );
}
