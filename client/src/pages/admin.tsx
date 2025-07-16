import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ref, onValue, set, update, push, remove, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { 
  Shield, 
  Crown, 
  Users, 
  User,
  ShoppingCart, 
  Eye, 
  Calendar,
  Upload,
  Edit,
  Trash2,
  Download,
  DollarSign,
  TrendingUp,
  UserCheck,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Activity,
  Clock,
  Server,
  Database,
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
  MessageSquare,
  Star,
  ThumbsUp,
  Share2,
  Plus,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  Zap,
  Flame,
  Sparkles,
  TrendingDown,
  Wallet,
  CreditCard,
  UserPlus,
  MousePointer,
  Wifi,
  Battery,
  Chrome,
  LogOut,
  Heart,
  Youtube,
  Instagram,
  Megaphone,
  Bot,
  Gift
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  signupsToday: number;
  signupsThisMonth: number;
  totalVisitsToday: number;
  totalVisitsThisMonth: number;
  totalEarningsToday: number;
  totalEarningsThisMonth: number;
  totalEarningsAllTime: number;
  totalSales: number;
  salesToday: number;
  salesThisMonth: number;
  averageOrderValue: number;
  conversionRate: number;
  refundRate: number;
  totalReferralPartners: number;
  todayReferralPartners: number;
  monthlyReferralPartners: number;
  totalReferralEarnings: number;
  todayReferralEarnings: number;
  monthlyReferralEarnings: number;
  totalWithdrawalRequests: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  totalWithdrawalAmount: number;
  organicTraffic: number;
  referralTraffic: number;
  socialTraffic: number;
  directTraffic: number;
  avgSessionDuration: number;
  bounceRate: number;
  pageViews: number;
  uniqueVisitors: number;
  totalCourses: number;
  bestSellingCourse: string;
  averageRating: number;
  totalReviews: number;
  totalComments: number;
  totalLikes: number;
  totalShares: number;
  serverUptime: number;
  databaseResponseTime: number;
  apiResponseTime: number;
  errorRate: number;
  successRate: number;
  mobileUsers: number;
  desktopUsers: number;
  tabletUsers: number;
  activeUsers: number;
  onlineUsers: number;
  currentSessions: number;
  totalRevenue: number;
  netProfit: number;
  expenses: number;
  roi: number;
  avgCoursesPerUser: number;
  avgSpendingPerUser: number;
  returnUserRate: number;
  newUserRate: number;
  totalDownloads: number;
  totalStreams: number;
  engagementRate: number;
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
  fakePrice?: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  ip: string;
  location: string;
  city: string;
  country: string;
  device: string;
  deviceType: string;
  browser: string;
  os: string;
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
  verified: boolean;
  blocked: boolean;
  premium: boolean;
  vip: boolean;
  lifetimeValue: number;
  engagementScore: number;
  loyaltyScore: number;
  churnRisk: number;
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
  affectedUsers: number;
  status: string;
  priority: string;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [realTimeData, setRealTimeData] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Admin bonus states
  const [selectedUserId, setSelectedUserId] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusReason, setBonusReason] = useState("");

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    fakePrice: "",
    thumbnail: "",
    instructor: "",
    duration: "",
    level: "",
    language: "English",
    tags: "",
    discount: "0",
    likes: "0",
    comments: "0",
    sales: "0",
    reviews: "0",
    rating: "4.8"
  });

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
    serverUptime: 99.9,
    databaseResponseTime: 45,
    apiResponseTime: 120,
    errorRate: 0.1,
    successRate: 99.9,
    mobileUsers: 0,
    desktopUsers: 0,
    tabletUsers: 0,
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
    engagementRate: 0
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [categories, setCategories] = useState([
    { id: "YouTube Growth", label: "YouTube Growth", icon: Youtube },
    { id: "Instagram Growth", label: "Instagram Growth", icon: Instagram },
    { id: "Marketing", label: "Marketing", icon: Megaphone },
    { id: "Self Respect", label: "Self Respect", icon: Heart },
    { id: "Love", label: "Love", icon: Users },
    { id: "ChatGPT Expert", label: "ChatGPT Expert", icon: Bot },
  ]);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);

  // Real-time Firebase listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Listen to admin stats
    const statsRef = ref(database, 'adminStats');
    const unsubscribeStats = onValue(statsRef, async (snapshot) => {
      if (snapshot.exists()) {
        setAdminStats(snapshot.val());
      } else {
        // Calculate real stats from data
        await calculateRealStats();
      }
    });

    // Listen to courses
    const coursesRef = ref(database, 'courses');
    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = Object.entries(snapshot.val()).map(([id, course]: [string, any]) => ({
          id,
          ...course
        }));

        // Separate pending and live courses
        const pending = coursesData.filter(course => course.status === 'pending_review');
        const live = coursesData.filter(course => course.status === 'active');

        setPendingCourses(pending);
        setCourses(live);
      }
    });

    // Listen to users
    const usersRef = ref(database, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = Object.entries(snapshot.val()).map(([id, user]: [string, any]) => ({
          id,
          name: user.displayName || user.email?.split('@')[0],
          email: user.email,
          joinDate: new Date(user.createdAt).toLocaleDateString(),
          lastActive: new Date(user.lastActive).toLocaleDateString(),
          totalSpent: user.totalSpent || 0,
          referralCode: user.referralCode || '',
          referralEarnings: user.walletBalance || 0,
          referralCount: user.totalReferrals || 0,
          status: user.status || 'active',
          verified: user.verified || false,
          blocked: user.blocked || false,
          premium: user.premium || false,
          ...user
        }));
        setUsers(usersData);
      }
    });

    // Listen to withdrawal requests
    const withdrawalsRef = ref(database, 'withdrawalRequests');
    const unsubscribeWithdrawals = onValue(withdrawalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const withdrawalData = Object.entries(snapshot.val()).map(([id, withdrawal]: [string, any]) => ({
          id,
          ...withdrawal
        }));
        setWithdrawalRequests(withdrawalData);
      }
    });

    // Listen to dynamic categories
    const categoriesRef = ref(database, 'categories');
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const categoriesData = Object.values(snapshot.val());
        setCategories(categoriesData);
      } else {
        // Initialize default categories
        const defaultCategories = {
          youtube: { id: "YouTube Growth", label: "YouTube Growth", icon: "Youtube" },
          instagram: { id: "Instagram Growth", label: "Instagram Growth", icon: "Instagram" },
          marketing: { id: "Marketing", label: "Marketing", icon: "Megaphone" },
          self: { id: "Self Respect", label: "Self Respect", icon: "Heart" },
          love: { id: "Love", label: "Love", icon: "Users" },
          ai: { id: "ChatGPT Expert", label: "ChatGPT Expert", icon: "Bot" },
        };
        set(categoriesRef, defaultCategories);
      }
    });

    return () => {
      unsubscribeStats();
      unsubscribeCourses();
      unsubscribeUsers();
      unsubscribeWithdrawals();
      unsubscribeCategories();
    };
  }, [isAuthenticated]);

  const calculateRealStats = async () => {
    try {
      // Get real data from Firebase
      const usersSnapshot = await get(ref(database, 'users'));
      const coursesSnapshot = await get(ref(database, 'courses'));
      const referralsSnapshot = await get(ref(database, 'referrals'));
      const withdrawalsSnapshot = await get(ref(database, 'withdrawalRequests'));

      const usersData = usersSnapshot.exists() ? Object.values(usersSnapshot.val()) : [];
      const coursesData = coursesSnapshot.exists() ? Object.values(coursesSnapshot.val()) : [];
      const referralsData = referralsSnapshot.exists() ? Object.values(referralsSnapshot.val()) : [];
      const withdrawalsData = withdrawalsSnapshot.exists() ? Object.values(withdrawalsSnapshot.val()) : [];

      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Calculate real stats
      const stats = {
        totalUsers: usersData.length,
        signupsToday: usersData.filter((user: any) => 
          new Date(user.createdAt).toDateString() === today.toDateString()
        ).length,
        signupsThisMonth: usersData.filter((user: any) => 
          new Date(user.createdAt) >= thisMonth
        ).length,
        totalCourses: coursesData.length,
        totalReferralPartners: usersData.filter((user: any) => 
          user.totalReferrals && user.totalReferrals > 0
        ).length,
        totalReferralEarnings: usersData.reduce((sum: number, user: any) => 
          sum + (user.walletBalance || 0), 0
        ),
        totalWithdrawalRequests: withdrawalsData.length,
        pendingWithdrawals: withdrawalsData.filter((w: any) => w.status === 'pending').length,
        completedWithdrawals: withdrawalsData.filter((w: any) => w.status === 'completed').length,
        totalWithdrawalAmount: withdrawalsData.reduce((sum: number, w: any) => 
          sum + (w.amount || 0), 0
        ),
        totalSales: coursesData.reduce((sum: number, course: any) => 
          sum + (course.sales || 0), 0
        ),
        totalRevenue: coursesData.reduce((sum: number, course: any) => 
          sum + ((course.sales || 0) * (course.price || 0)), 0
        ),
        averageRating: coursesData.length > 0 ? 
          coursesData.reduce((sum: number, course: any) => 
            sum + (course.rating || 0), 0
          ) / coursesData.length : 0,
        totalReviews: coursesData.reduce((sum: number, course: any) => 
          sum + (course.reviews || 0), 0
        ),
        totalComments: coursesData.reduce((sum: number, course: any) => 
          sum + (course.comments || 0), 0
        ),
        totalLikes: coursesData.reduce((sum: number, course: any) => 
          sum + (course.likes || 0), 0
        ),
        // Add other calculated stats...
        lastUpdated: Date.now(),
        serverUptime: 99.9,
        databaseResponseTime: 45,
        apiResponseTime: 120,
        errorRate: 0.1,
        successRate: 99.9
      };

      // Update Firebase with calculated stats
      await set(ref(database, 'adminStats'), { ...adminStats, ...stats });
      setAdminStats(prev => ({ ...prev, ...stats }));
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "RoyalDev@DevilXDR6717") {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted ✅",
        description: "Welcome to the real admin dashboard",
      });
    } else {
      toast({
        title: "Access Denied ❌",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.title || !courseForm.description || !courseForm.category || !courseForm.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const basePrice = parseInt(courseForm.price);
      const discount = parseInt(courseForm.discount) || 0;
      const fakePrice = courseForm.fakePrice ? parseInt(courseForm.fakePrice) : basePrice + (basePrice * 0.5); // Auto 50% fake markup

      // Calculate final price with discount
      const finalPrice = discount > 0 ? basePrice - (basePrice * discount / 100) : basePrice;

      // Auto-generate values if not provided
      const autoLikes = courseForm.likes || Math.floor(Math.random() * 500) + 50;
      const autoComments = courseForm.comments || Math.floor(Math.random() * 50) + 3;
      const autoSales = courseForm.sales || Math.floor(Math.random() * 200) + 25;
      const autoReviews = courseForm.reviews || Math.floor(Math.random() * 100) + 15;
      const autoRating = courseForm.rating || (Math.random() * 1.5 + 3.5).toFixed(1);

      const newCourse: Course = {
        id: editingCourse ? editingCourse.id : Date.now().toString(),
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        price: courseForm.isSystemGenerated ? 
          Math.min(parseInt(courseForm.price) || 0, 799) : 
          parseInt(courseForm.price) || 0,
        fakePrice: fakePrice, // Auto fake price with markup
        finalPrice: finalPrice, // Final price after discount
        thumbnail: courseForm.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400`,
        instructor: courseForm.instructor,
        duration: courseForm.duration,
        level: courseForm.level,
        language: courseForm.language,
        tags: courseForm.tags.split(",").map(tag => tag.trim()),
        discount: discount,
        likes: parseInt(autoLikes),
        comments: parseInt(autoComments),
        sales: parseInt(autoSales),
        reviews: parseInt(autoReviews),
        rating: parseFloat(autoRating),
        createdAt: editingCourse ? editingCourse.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: editingCourse ? editingCourse.status : "active", // Preserve existing status when editing
        approvalStatus: editingCourse ? editingCourse.approvalStatus : "approved", // Preserve approval status
        earnings: finalPrice * parseInt(courseForm.sales || "0"),
        popularity: Math.floor(Math.random() * 50) + 50,
        completionRate: Math.floor(Math.random() * 30) + 70,
        shares: Math.floor(Math.random() * 50) + 10,
        position: Math.random(), // For smart positioning
        hoverCount: 0,
        clickCount: 0,
        viewTime: 0
      };

      // Add or update in Firebase
      await set(ref(database, `courses/${newCourse.id}`), newCourse);

      // Reset form
      setCourseForm({
        title: "",
        description: "",
        category: "",
        price: "",
        fakePrice: "",
        thumbnail: "",
        instructor: "",
        duration: "",
        level: "",
        language: "English",
        tags: "",
        discount: "0",
        likes: "0",
        comments: "0",
        sales: "0",
        reviews: "0",
        rating: "4.8"
      });

      setEditingCourse(null);
      setIsAddCourseOpen(false);

      toast({
        title: editingCourse ? "Course Updated! 🎉" : "Course Added Successfully! 🎉",
        description: `Price: ₹${finalPrice} (Original: ₹${basePrice}, Fake: ₹${fakePrice})`,
      });

      // Recalculate stats
      await calculateRealStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Category Name Required",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    try {
      const categoryId = newCategoryName.replace(/\s+/g, '');
      const newCategory = {
        id: newCategoryName,
        label: newCategoryName,
        icon: "Target", // Default icon
        createdAt: Date.now(),
        createdBy: "admin"
      };

      // Add to Firebase
      await set(ref(database, `categories/${categoryId}`), newCategory);

      // Auto-select the new category in the course form
      setCourseForm(prev => ({ ...prev, category: newCategoryName }));

      setNewCategoryName("");
      setIsAddCategoryOpen(false);

      toast({
        title: "Category Added! ✅",
        description: `"${newCategoryName}" category has been created and selected`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price.toString(),
      fakePrice: course.fakePrice?.toString() || "",
      thumbnail: course.thumbnail,
      instructor: course.instructor || "",
      duration: course.duration || "",
      level: course.level || "",
      language: course.language || "English",
      tags: course.tags?.join(", ") || "",
      discount: course.discount?.toString() || "0",
      likes: course.likes?.toString() || "0",
      comments: course.comments?.toString() || "0",
      sales: course.sales?.toString() || "0",
      reviews: course.reviews?.toString() || "0",
      rating: course.rating?.toString() || "4.8"
    });
    setIsAddCourseOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await remove(ref(database, `courses/${courseId}`));

        toast({
          title: "Course Deleted ✅",
          description: "The course has been permanently removed",
        });

        await calculateRealStats();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive",
        });
      }
    }
  };

  const handleApproveCourse = async (courseId: string) => {
    try {
      await update(ref(database, `courses/${courseId}`), {
        status: 'active',
        approvalStatus: 'approved',
        approvedAt: Date.now(),
        approvedBy: 'admin',
        rejectionReason: null
      });

      toast({
        title: "Course Approved! ✅",
        description: "Course is now live on the platform",
      });

      await calculateRealStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve course",
        variant: "destructive",
      });
    }
  };

  const handleRejectCourse = async (courseId: string, reason?: string) => {
    try {
      await update(ref(database, `courses/${courseId}`), {
        status: 'rejected',
        approvalStatus: 'rejected',
        rejectedAt: Date.now(),
        rejectedBy: 'admin',
        rejectionReason: reason || 'No reason provided'
      });

      toast({
        title: "Course Rejected ❌",
        description: "Course has been rejected and removed from review",
      });

      await calculateRealStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject course",
        variant: "destructive",
      });
    }
  };

  const handleGiveBestSellerBadge = async (userId: string) => {
    try {
      await update(ref(database, `users/${userId}`), {
        bestSeller: true,
        bestSellerAt: Date.now(),
        bestSellerBy: 'admin'
      });

      toast({
        title: "Best Seller Badge Given! 🏆",
        description: "User is now a trusted Best Seller",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to give Best Seller badge",
        variant: "destructive",
      });
    }
  };

  const handleGiveBonus = async () => {
    if (!selectedUserId || !bonusAmount || !bonusReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseFloat(bonusAmount);
      const userRef = ref(database, `users/${selectedUserId}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const currentBalance = userData.walletBalance || 0;
        const currentEarnings = userData.totalEarnings || 0;

        await update(userRef, {
          walletBalance: currentBalance + amount,
          totalEarnings: currentEarnings + amount,
          lastBonusAt: Date.now(),
          bonusHistory: {
            ...userData.bonusHistory,
            [Date.now()]: {
              amount: amount,
              reason: bonusReason,
              timestamp: Date.now(),
              adminId: "admin"
            }
          }
        });

        toast({
          title: "Bonus Given Successfully! 🎉",
          description: `₹${amount} added to user's wallet. Reason: ${bonusReason}`,
        });

        // Reset form
        setSelectedUserId("");
        setBonusAmount("");
        setBonusReason("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to give bonus",
        variant: "destructive",
      });
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num || isNaN(num)) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount || isNaN(amount)) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApproveWithdrawal = async (withdrawalId: string, userId: string) => {
    try {
      // Update admin withdrawal record
      const adminWithdrawalRef = ref(database, `admin/withdrawals/${withdrawalId}`);
      await update(adminWithdrawalRef, {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });

      // Update user withdrawal record
      const userWithdrawalsRef = ref(database, `withdrawals/${userId}`);
      const userWithdrawals = await get(userWithdrawalsRef);
      if (userWithdrawals.exists()) {
        const data = userWithdrawals.val();
        const userWithdrawalId = Object.keys(data).find(key => 
          data[key].createdAt === pendingWithdrawals.find(w => w.id === withdrawalId)?.createdAt
        );

        if (userWithdrawalId) {
          await update(ref(database, `withdrawals/${userId}/${userWithdrawalId}`), {
            status: 'approved',
            approvedAt: new Date().toISOString()
          });
        }
      }

      toast({
        title: "Withdrawal Approved! ✅",
        description: "Payment will be processed within 1 hour",
      });
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to approve withdrawal",
        variant: "destructive",
      });
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string, userId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      // Update admin withdrawal record
      const adminWithdrawalRef = ref(database, `admin/withdrawals/${withdrawalId}`);
      await update(adminWithdrawalRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      });

      // Update user withdrawal record
      const userWithdrawalsRef = ref(database, `withdrawals/${userId}`);
      const userWithdrawals = await get(userWithdrawalsRef);
      if (userWithdrawals.exists()) {
        const data = userWithdrawals.val();
        const userWithdrawalId = Object.keys(data).find(key => 
          data[key].createdAt === pendingWithdrawals.find(w => w.id === withdrawalId)?.createdAt
        );

        if (userWithdrawalId) {
          await update(ref(database, `withdrawals/${userId}/${userWithdrawalId}`), {
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason
          });
        }
      }

      toast({
        title: "Withdrawal Rejected",
        description: "Withdrawal request has been rejected",
      });
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to reject withdrawal",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Real Admin Access</CardTitle>
            <p className="text-gray-300">Enter your credentials for full Firebase control</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Access Real Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Real Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">100% Firebase Integration</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge className="bg-green-500 text-white">
              Live Data: {realTimeData ? 'ON' : 'OFF'}
            </Badge>

            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="text-gray-600 dark:text-gray-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <PieChart className="w-4 h-4" />
              <span>Real Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pending Courses</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Live Courses</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Withdrawals</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawal-requests" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Withdrawal Requests</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Categories</span>
            </TabsTrigger>
          </TabsList>

          {/* Pending Courses Tab */}
          <TabsContent value="pending" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">📋 Today's Pending Courses (Review Required)</h2>
              <Badge className="bg-yellow-500 text-white">
                {pendingCourses.length} Courses Waiting
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCourses.map((course) => (
                <Card key={course.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-yellow-300 shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-yellow-500 text-white">
                        ⏳ Pending Review
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-500 text-white">
                          {course.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      By: <span className="font-medium text-purple-600">{course.instructorName}</span>
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {course.description.substring(0, 100)}...
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Course Link:</span>
                        <a 
                          href={course.courseLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          🔗 Review Course
                        </a>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Price:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-green-500">{formatCurrency(course.price)}</span>
                          {course.fakePrice && (
                            <span className="text-sm text-red-500 line-through">{formatCurrency(course.fakePrice)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Duration:</span>
                        <span className="text-sm font-medium">{course.duration || 'Not specified'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Level:</span>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Language:</span>
                        <span className="text-sm font-medium">{course.language}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Submitted:</span>
                        <span className="text-xs text-gray-500">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex space-x-2 pt-3">
                        <Button 
                          onClick={() => handleApproveCourse(course.id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Course</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>Why are you rejecting "{course.title}"?</p>
                    <textarea
                      className="w-full p-3 border rounded-lg"
                      rows={4}
                      placeholder="Enter rejection reason..."
                      id={`rejection-reason-${course.id}`}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const reason = (document.getElementById(`rejection-reason-${course.id}`) as HTMLTextAreaElement)?.value;
                          if (reason.trim()) {
                            handleRejectCourse(course.id, reason);
                          }
                        }}
                      >
                        Reject Course
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pendingCourses.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up! 🎉</h3>
                <p className="text-gray-600">No pending courses to review right now.</p>
              </div>
            )}
          </TabsContent>

          {/* Real Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Real Users</p>
                      <p className="text-3xl font-bold">{formatNumber(adminStats.totalUsers)}</p>
                      <p className="text-blue-100 text-sm flex items-center">
                        <ArrowUp className="w-4 h-4 mr-1" />
                        +{adminStats.signupsToday} today
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Real Revenue</p>
                      <p className="text-3xl font-bold">{formatCurrency(adminStats.totalRevenue)}</p>
                      <p className="text-green-100 text-sm">Live Firebase Data</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Referral Partners</p>
                      <p className="text-3xl font-bold">{formatNumber(adminStats.totalReferralPartners)}</p>
                      <p className="text-purple-100 text-sm">Total: ₹{formatNumber(adminStats.totalReferralEarnings)}</p>
                    </div>
                    <UserPlus className="w-8 h-8 text-purple-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Withdrawals</p>
                      <p className="text-3xl font-bold">{adminStats.totalWithdrawalRequests}</p>
                      <p className="text-orange-100 text-sm">{adminStats.pendingWithdrawals} pending</p>
                    </div>
                    <Wallet className="w-8 h-8 text-orange-100" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                    Real-time Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Courses</span>
                    <span className="font-bold text-blue-500">{adminStats.totalCourses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Rating</span>
                    <span className="font-bold text-yellow-500">{(adminStats.averageRating || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Sales</span>
                    <span className="font-bold text-green-500">{adminStats.totalSales}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Reviews</span>
                    <span className="font-bold text-purple-500">{adminStats.totalReviews}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Firebase Uptime</span>
                      <span className="text-sm font-medium">{adminStats.serverUptime}%</span>
                    </div>
                    <Progress value={adminStats.serverUptime} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Database Response</span>
                      <span className="text-sm font-medium">{adminStats.databaseResponseTime}ms</span>
                    </div>
                    <Progress value={100 - (adminStats.databaseResponseTime / 10)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-medium">{adminStats.successRate}%</span>
                    </div>
                    <Progress value={adminStats.successRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Course Management</h2>
              <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course with Fake Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCourse ? "Edit Course" : "Add New Course (Permanent Fake Data)"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddCourse} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Course Title *</Label>
                        <Input
                          id="title"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter course title"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={courseForm.category} onValueChange={(value) => {
                          if (value === 'other') {
                            setIsAddCategoryOpen(true);
                          } else {
                            setCourseForm(prev => ({ ...prev, category: value }));
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>
                            ))}
                            <SelectItem value="other">
                              <div className="flex items-center">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Category
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={courseForm.description}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter course description"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={courseForm.price}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="999"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fakePrice">Fake Price (₹)</Label>
                        <Input
                          id="fakePrice"
                          type="number"
                          value={courseForm.fakePrice}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, fakePrice: e.target.value }))}
                          placeholder="2999"
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={courseForm.discount}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, discount: e.target.value }))}
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          value={courseForm.duration}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="5 hours"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <Label htmlFor="likes">Likes (Optional)</Label>
                        <Input
                          id="likes"
                          type="number"
                          value={courseForm.likes}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, likes: e.target.value }))}
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                      <div>
                        <Label htmlFor="comments">Comments (Optional)</Label>
                        <Input
                          id="comments"
                          type="number"
                          value={courseForm.comments}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, comments: e.target.value }))}
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sales">Sales (Optional)</Label>
                        <Input
                          id="sales"
                          type="number"
                          value={courseForm.sales}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, sales: e.target.value }))}
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reviews">Reviews (Optional)</Label>
                        <Input
                          id="reviews"
                          type="number"
                          value={courseForm.reviews}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, reviews: e.target.value }))}
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rating">Rating (Optional)</Label>
                        <Input
                          id="rating"
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={courseForm.rating}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, rating: e.target.value }))}
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      Create Course with Permanent Fake Data
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {course.category}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-green-500">{formatCurrency(course.price)}</span>
                          {course.fakePrice && (
                            <span className="text-sm text-red-500 line-through">{formatCurrency(course.fakePrice)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Fake Sales</span>
                        <span className="font-medium">{course.sales}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Fake Rating</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{course.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Engagement</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            <span className="text-xs">{course.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            <span className="text-xs">{course.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Real User Management</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Real User Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Users</span>
                    <span className="font-medium">{formatNumber(adminStats.totalUsers)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Signups Today</span>
                    <span className="font-medium">{adminStats.signupsToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-medium">{adminStats.signupsThisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Referral Partners</span>
                    <span className="font-medium">{adminStats.totalReferralPartners}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Admin Bonus Panel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-emerald-100">Select User</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Choose user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100">Bonus Amount (₹)</Label>
                    <Input
                      type="number"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(e.target.value)}
                      placeholder="Enter bonus amount"
                      className="bg-white/20 border-white/30 text-white placeholder:text-emerald-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100">Reason</Label>
                    <Input
                      value={bonusReason}
                      onChange={(e) => setBonusReason(e.target.value)}
                      placeholder="Bonus reason"
                      className="bg-white/20 border-white/30 text-white placeholder:text-emerald-100"
                    />
                  </div>
                  <Button 
                    onClick={handleGiveBonus} 
                    className="w-full bg-white/20 hover:bg-white/30 text-white"
                    disabled={!selectedUserId || !bonusAmount || !bonusReason}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Give Bonus
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">🏆 Best Seller Badge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-yellow-100">Select User for Best Seller</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Choose user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                            {user.bestSeller && ' 🏆'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => handleGiveBestSellerBadge(selectedUserId)} 
                    className="w-full bg-white/20 hover:bg-white/30 text-white"
                    disabled={!selectedUserId}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Give Best Seller Badge
                  </Button>
                  <p className="text-xs text-yellow-100">
                    This badge will appear on all user's courses and profile
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Real Users from Firebase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          <p className="text-xs text-gray-500">Joined: {user.joinDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end mb-1">
                          <p className="text-sm font-medium">Code: {user.referralCode}</p>
                          {user.bestSeller && (
                            <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                              🏆 Best Seller
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-green-600">₹{user.referralEarnings}</p>
                        <p className="text-xs text-gray-500">{user.referralCount} referrals</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Real Withdrawal Requests</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">Pending</p>
                      <p className="text-3xl font-bold">{adminStats.pendingWithdrawals}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Completed</p>
                      <p className="text-3xl font-bold">{adminStats.completedWithdrawals}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Amount</p>
                      <p className="text-3xl font-bold">{formatCurrency(adminStats.totalWithdrawalAmount)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-100" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Real Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawalRequests.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{withdrawal.userName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{withdrawal.userEmail}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(withdrawal.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">₹{withdrawal.amount}</p>
                        <Badge className={withdrawal.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}>
                          {withdrawal.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{withdrawal.totalReferrals} referrals</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Withdrawal Requests Tab */}
          <TabsContent value="withdrawal-requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">💰 Withdrawal Request Management</h2>
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                {withdrawalRequests.filter(w => w.status === 'pending').length} Pending Requests
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {withdrawalRequests.filter(w => w.status === 'pending').map((withdrawal) => (
                <Card key={withdrawal.id} className="bg-white/95 backdrop-blur-sm border-2 border-yellow-300 shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-yellow-500 text-white">
                        ⏳ Pending Approval
                      </Badge>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">₹{withdrawal.amount}</p>
                        <p className="text-sm text-gray-500">Request #{withdrawal.id.slice(-6)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* User Details */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-purple-600">👤 User Details</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Name:</span>
                            <span className="text-sm">{withdrawal.userName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Email:</span>
                            <span className="text-sm">{withdrawal.userEmail}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">User ID:</span>
                            <span className="text-sm font-mono">{withdrawal.userId.slice(-8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Total Referrals:</span>
                            <span className="text-sm font-bold text-blue-600">{withdrawal.totalReferrals || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Request Date:</span>
                            <span className="text-sm">{new Date(withdrawal.requestedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-green-600">💳 Payment Details</h3>
                        <div className="bg-green-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Method:</span>
                            <Badge className="bg-blue-100 text-blue-800">
                              {withdrawal.method?.toUpperCase() || 'UPI'}
                            </Badge>
                          </div>
                          
                          {withdrawal.method === 'upi' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">UPI ID:</span>
                                <span className="text-sm font-mono">{withdrawal.upiId || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Mobile:</span>
                                <span className="text-sm">{withdrawal.mobileNumber || 'Not provided'}</span>
                              </div>
                            </>
                          )}

                          {withdrawal.method === 'bank' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Bank Name:</span>
                                <span className="text-sm">{withdrawal.bankName || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Account:</span>
                                <span className="text-sm font-mono">{withdrawal.accountNumber || 'Not provided'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">IFSC:</span>
                                <span className="text-sm font-mono">{withdrawal.ifscCode || 'Not provided'}</span>
                              </div>
                            </>
                          )}

                          {withdrawal.method === 'crypto' && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">USD Address:</span>
                              <span className="text-sm font-mono break-all">{withdrawal.cryptoAddress || 'Not provided'}</span>
                            </div>
                          )}

                          <div className="flex justify-between border-t pt-2">
                            <span className="text-sm font-bold">Amount to Pay:</span>
                            <span className="text-lg font-bold text-green-600">₹{withdrawal.amount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 mt-6">
                      <Button 
                        onClick={() => handleApproveWithdrawal(withdrawal.id, withdrawal.userId)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Mark as Paid
                      </Button>
                      <Button 
                        onClick={() => handleRejectWithdrawal(withdrawal.id, withdrawal.userId)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Request
                      </Button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                      <p className="text-blue-800 text-sm">
                        <strong>⚠️ Important:</strong> Only click "Approve" after you have successfully sent the payment to the user via their chosen method.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {withdrawalRequests.filter(w => w.status === 'pending').length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up! 🎉</h3>
                  <p className="text-gray-600">No pending withdrawal requests right now.</p>
                </div>
              )}

              {/* Approved/Completed Requests */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-600">✅ Completed Withdrawals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {withdrawalRequests.filter(w => w.status === 'approved').map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{withdrawal.userName}</p>
                          <p className="text-sm text-gray-600">{withdrawal.userEmail}</p>
                          <p className="text-xs text-gray-500">
                            Completed: {withdrawal.approvedAt ? new Date(withdrawal.approvedAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{withdrawal.amount}</p>
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Dynamic Category Management</h2>
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter category name"
                      />
                    </div>
                    <Button onClick={handleAddCategory} className="w-full">
                      Add Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category.label}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {category.id}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}