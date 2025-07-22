import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Shield, Users, ShoppingCart, Eye, Settings, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail?: string;
  seller?: string;
  sellerId?: number;
  status: string;
  approvalStatus?: string;
  rejectionReason?: string;
  blocked: boolean;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  activeCourses: number;
  pendingCourses: number;
  totalPayments: number;
  totalReferrals: number;
  totalRevenue: number;
}

export default function AdminSimple() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const adminPassword = "admin123"; // In production, this should be more secure

  // Fetch admin stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  // Fetch pending courses
  const { data: pendingCourses = [] } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses/pending"],
    enabled: isAuthenticated,
  });

  // Fetch all courses
  const { data: allCourses = [] } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
    enabled: isAuthenticated,
  });

  // Approve course mutation
  const approveMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiRequest("PUT", `/api/courses/${courseId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Course Approved! ✅",
        description: "Course is now live on the platform",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve course",
        variant: "destructive",
      });
    },
  });

  // Reject course mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ courseId, reason }: { courseId: string; reason: string }) => {
      const response = await apiRequest("PUT", `/api/courses/${courseId}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setRejectionReason("");
      setSelectedCourseId("");
      toast({
        title: "Course Rejected ❌",
        description: "Course has been rejected and removed from review",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject course",
        variant: "destructive",
      });
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiRequest("DELETE", `/api/courses/${courseId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Course Deleted ✅",
        description: "The course has been permanently removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      toast({
        title: "Welcome Admin! 👋",
        description: "You're now logged into the admin panel",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  const handleApproveCourse = (courseId: string) => {
    approveMutation.mutate(courseId);
  };

  const handleRejectCourse = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ courseId: selectedCourseId, reason: rejectionReason });
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      deleteMutation.mutate(courseId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <p className="text-gray-600">Enter password to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage courses and platform content</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsAuthenticated(false)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <ShoppingCart className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Eye className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{stats?.pendingCourses || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <CheckCircle className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold">{stats?.activeCourses || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Management Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Approval ({pendingCourses.length})</TabsTrigger>
            <TabsTrigger value="all">All Courses ({allCourses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Course Approvals</CardTitle>
                <p className="text-gray-600">Review and approve/reject pending courses</p>
              </CardHeader>
              <CardContent>
                {pendingCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">No pending courses!</p>
                    <p className="text-gray-600">All courses have been reviewed.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {pendingCourses.map((course) => (
                      <Card key={course.id} className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                              <p className="text-gray-600 mb-4">{course.description}</p>
                              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                                <span>Category: {course.category}</span>
                                <span>Price: {formatCurrency(course.price)}</span>
                                <span>Seller: {course.seller || 'Unknown'}</span>
                              </div>
                              <Badge className="bg-yellow-500">Pending Review</Badge>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                onClick={() => handleApproveCourse(course.id)}
                                disabled={approveMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() => setSelectedCourseId(course.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Course</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="reason">Rejection Reason</Label>
                                      <Textarea
                                        id="reason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please provide a reason for rejection..."
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={handleRejectCourse}
                                        disabled={rejectMutation.isPending}
                                        variant="destructive"
                                        className="flex-1"
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Courses</CardTitle>
                <p className="text-gray-600">Manage all courses on the platform</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {allCourses.map((course) => (
                    <Card key={course.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h3 className="font-bold">{course.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{course.category} • {formatCurrency(course.price)}</p>
                            <div className="flex gap-2">
                              <Badge className={
                                course.status === 'active' ? 'bg-green-500' :
                                course.status === 'pending' || course.status === 'pending_review' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }>
                                {course.status === 'active' ? 'Active' :
                                 course.status === 'pending' || course.status === 'pending_review' ? 'Pending' :
                                 'Rejected'}
                              </Badge>
                              {course.blocked && <Badge variant="destructive">Blocked</Badge>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {(course.status === 'pending' || course.status === 'pending_review') && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveCourse(course.id)}
                                  disabled={approveMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => setSelectedCourseId(course.id)}
                                    >
                                      Reject
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Course</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="reason">Rejection Reason</Label>
                                        <Textarea
                                          id="reason"
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          placeholder="Please provide a reason for rejection..."
                                          rows={3}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={handleRejectCourse}
                                          disabled={rejectMutation.isPending}
                                          variant="destructive"
                                          className="flex-1"
                                        >
                                          Reject Course
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCourse(course.id)}
                              disabled={deleteMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}