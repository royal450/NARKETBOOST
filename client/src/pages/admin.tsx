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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail?: string;
  seller?: string;
  sellerId?: number;
  status: string;
  approvalStatus: string;
  likes: number;
  comments: number;
  sales: number;
  blocked: boolean;
  blockReason?: string;
  rejectionReason?: string;
  platform: string;
  followerCount: number;
  engagementRate: number;
  verificationStatus: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  pendingCourses: number;
  approvedCourses: number;
  rejectedCourses: number;
  totalSales: number;
  totalRevenue: number;
  avgRating: number;
}

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCourseForRejection, setSelectedCourseForRejection] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Admin password check
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Welcome Admin! 👑",
        description: "You have successfully logged in to admin panel",
      });
    } else {
      toast({
        title: "Access Denied ❌",
        description: "Invalid admin password",
        variant: "destructive",
      });
    }
  };

  // Fetch pending courses
  const { data: pendingCourses = [], isLoading: loadingPending, refetch: refetchPending } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses/pending'],
    enabled: isAuthenticated
  });

  // Fetch all courses for admin
  const { data: allCourses = [], isLoading: loadingAll, refetch: refetchAll } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
    enabled: isAuthenticated
  });

  // Fetch admin stats
  const { data: adminStats, isLoading: loadingStats, refetch: refetchStats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated
  });

  // Approve course mutation
  const approveMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/courses/${courseId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to approve course');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Course Approved! ✅",
        description: "Course is now live on the platform",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve course",
        variant: "destructive",
      });
    }
  });

  // Reject course mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ courseId, reason }: { courseId: number; reason: string }) => {
      const response = await fetch(`/api/courses/${courseId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to reject course');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Course Rejected ❌",
        description: "Course has been rejected with reason provided",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setSelectedCourseForRejection(null);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject course",
        variant: "destructive",
      });
    }
  });

  // Block course mutation
  const blockMutation = useMutation({
    mutationFn: async ({ courseId, reason }: { courseId: number; reason: string }) => {
      const response = await fetch(`/api/courses/${courseId}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to block course');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Course Blocked! 🚫",
        description: "Course has been blocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to block course",
        variant: "destructive",
      });
    }
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete course');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Course Deleted! 🗑️",
        description: "Course has been permanently deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    }
  });

  const handleApproveCourse = (courseId: number) => {
    approveMutation.mutate(courseId);
  };

  const handleRejectCourse = () => {
    if (selectedCourseForRejection && rejectionReason.trim()) {
      rejectMutation.mutate({ 
        courseId: selectedCourseForRejection, 
        reason: rejectionReason.trim() 
      });
    }
  };

  const handleBlockCourse = (courseId: number, reason: string) => {
    if (reason.trim()) {
      blockMutation.mutate({ courseId, reason: reason.trim() });
    }
  };

  const handleDeleteCourse = (courseId: number) => {
    if (confirm("Are you sure you want to permanently delete this course?")) {
      deleteMutation.mutate(courseId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string, approvalStatus: string) => {
    if (status === 'pending' || approvalStatus === 'pending') {
      return <Badge className="bg-yellow-500 text-white">⏳ Pending Review</Badge>;
    }
    if (status === 'active' && approvalStatus === 'approved') {
      return <Badge className="bg-green-500 text-white">✅ Approved</Badge>;
    }
    if (status === 'rejected' || approvalStatus === 'rejected') {
      return <Badge className="bg-red-500 text-white">❌ Rejected</Badge>;
    }
    return <Badge className="bg-gray-500 text-white">❓ Unknown</Badge>;
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-purple-600 mb-4" />
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <p className="text-gray-600">Enter admin password to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Access Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => setIsAuthenticated(false)} 
              variant="destructive" 
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {adminStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-blue-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Courses</p>
                    <p className="text-3xl font-bold">{adminStats.totalCourses || 0}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100">Pending Review</p>
                    <p className="text-3xl font-bold">{pendingCourses.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Approved</p>
                    <p className="text-3xl font-bold">{adminStats.approvedCourses || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Total Sales</p>
                    <p className="text-3xl font-bold">{adminStats.totalSales || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pending Review ({pendingCourses.length})</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>All Courses</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Pending Courses Tab */}
          <TabsContent value="pending" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">📋 Courses Pending Review</h2>
              <Badge className="bg-yellow-500 text-white">
                {pendingCourses.length} Courses Waiting
              </Badge>
            </div>

            {loadingPending ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCcw className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : pendingCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                <p className="text-gray-600">No courses pending review at the moment.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingCourses.map((course: Course) => (
                  <Card key={course.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-yellow-300 shadow-xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        {getStatusBadge(course.status, course.approvalStatus)}
                        <Badge className="bg-blue-500 text-white">
                          {course.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        By: <span className="font-medium text-purple-600">{course.seller}</span>
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {course.description.substring(0, 100)}...
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded">
                            <span className="text-green-600 font-semibold">Price:</span>
                            <br />
                            {formatCurrency(course.price)}
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                            <span className="text-blue-600 font-semibold">Platform:</span>
                            <br />
                            {course.platform}
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded">
                            <span className="text-purple-600 font-semibold">Followers:</span>
                            <br />
                            {course.followerCount.toLocaleString()}
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/30 p-2 rounded">
                            <span className="text-orange-600 font-semibold">Engagement:</span>
                            <br />
                            {course.engagementRate}%
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button 
                          onClick={() => handleApproveCourse(course.id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                          size="sm"
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {approveMutation.isPending ? 'Approving...' : 'Approve'}
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setSelectedCourseForRejection(course.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Course</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p>Why are you rejecting "{course.title}"?</p>
                              <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                rows={4}
                              />
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => {
                                  setSelectedCourseForRejection(null);
                                  setRejectionReason("");
                                }}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleRejectCourse}
                                  disabled={!rejectionReason.trim() || rejectMutation.isPending}
                                >
                                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject Course'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Courses Tab */}
          <TabsContent value="all" className="space-y-6">
            <h2 className="text-2xl font-bold">📚 All Courses Management</h2>
            
            {loadingAll ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCcw className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCourses.map((course: Course) => (
                  <Card key={course.id} className="bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        {getStatusBadge(course.status, course.approvalStatus)}
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-gray-600">By: {course.seller}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {course.description.substring(0, 80)}...
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(course.price)}
                        </span>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{course.likes}</span>
                        </div>
                      </div>

                      {course.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-red-700">
                            <strong>Rejected:</strong> {course.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        {course.status === 'pending' && (
                          <Button 
                            onClick={() => handleApproveCourse(course.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                            size="sm"
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {!course.blocked && course.status === 'active' && (
                          <Button 
                            onClick={() => {
                              const reason = prompt("Enter reason for blocking:");
                              if (reason) handleBlockCourse(course.id, reason);
                            }}
                            variant="outline"
                            size="sm"
                            disabled={blockMutation.isPending}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Block
                          </Button>
                        )}
                        
                        <Button 
                          onClick={() => handleDeleteCourse(course.id)}
                          variant="destructive"
                          size="sm"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <h2 className="text-2xl font-bold">📊 Platform Analytics</h2>
            
            {loadingStats ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCcw className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : adminStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold">{adminStats.totalUsers || 0}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(adminStats.totalRevenue || 0)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">Average Rating</p>
                        <p className="text-2xl font-bold">{adminStats.avgRating || 0}/5</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">Active Courses</p>
                        <p className="text-2xl font-bold">{adminStats.approvedCourses || 0}</p>
                      </div>
                      <Activity className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No analytics data available</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}