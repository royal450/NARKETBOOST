import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { database } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Eye, Heart, ShoppingCart, TrendingUp, Plus, Edit, BarChart3, Users, DollarSign, Star, MessageSquare, Share2 } from "lucide-react";
import { useLocation } from "wouter";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  fakePrice: number;
  category: string;
  thumbnail: string;
  instructor: string;
  instructorId: string;
  likes: number;
  comments: number;
  sales: number;
  rating: number;
  reviews: number;
  status: string;
  blocked: boolean;
  blockReason?: string;
  commission: number;
  createdAt: string;
  updatedAt: string;
}

export default function MyCourses() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    pendingCourses: 0,
    blockedCourses: 0,
    totalSales: 0,
    totalEarnings: 0,
    totalViews: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    if (!user) return;

    const coursesRef = ref(database, 'courses');
    const userCoursesQuery = query(coursesRef, orderByChild('instructorId'), equalTo(user.uid));

    const unsubscribe = onValue(userCoursesQuery, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = snapshot.val();
        const coursesArray = Object.entries(coursesData).map(([id, course]: [string, any]) => ({
          id,
          ...course,
        }));

        setCourses(coursesArray);

        // Calculate stats
        const newStats = {
          totalCourses: coursesArray.length,
          activeCourses: coursesArray.filter(c => c.status === 'active' && !c.blocked).length,
          pendingCourses: coursesArray.filter(c => c.status === 'pending_review').length,
          blockedCourses: coursesArray.filter(c => c.blocked).length,
          totalSales: coursesArray.reduce((sum, c) => sum + (c.sales || 0), 0),
          totalEarnings: coursesArray.reduce((sum, c) => sum + ((c.sales || 0) * (c.price || 0) * 0.7), 0),
          totalViews: coursesArray.reduce((sum, c) => sum + (c.views || 0), 0),
          totalLikes: coursesArray.reduce((sum, c) => sum + (c.likes || 0), 0),
        };
        setStats(newStats);
      } else {
        setCourses([]);
        setStats({
          totalCourses: 0,
          activeCourses: 0,
          pendingCourses: 0,
          blockedCourses: 0,
          totalSales: 0,
          totalEarnings: 0,
          totalViews: 0,
          totalLikes: 0,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string, blocked: boolean) => {
    if (blocked) return 'bg-red-500';
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending_review': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string, blocked: boolean) => {
    if (blocked) return 'Blocked';
    switch (status) {
      case 'active': return 'Active';
      case 'pending_review': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading your courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Courses</h1>
            <p className="text-purple-100">Manage your courses and track performance</p>
          </div>
          <Button 
            onClick={() => setLocation("/create-course")}
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalCourses}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Sales</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalSales}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Earnings</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.totalEarnings)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Likes</p>
                  <p className="text-3xl font-bold text-red-600">{stats.totalLikes}</p>
                </div>
                <Heart className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Status Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="all">All ({stats.totalCourses})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.activeCourses})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pendingCourses})</TabsTrigger>
            <TabsTrigger value="blocked">Blocked ({stats.blockedCourses})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(course.status, course.blocked)}>
                        {getStatusText(course.status, course.blocked)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Commission: {course.commission}%</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(course.price)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      )}
                    </div>

                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Eye className="w-4 h-4 mr-1" />
                          {course.views || 0}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Heart className="w-4 h-4 mr-1" />
                          {course.likes || 0}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          {course.sales || 0}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-yellow-600">
                        <Star className="w-4 h-4 mr-1" />
                        {course.rating || 5}
                      </div>
                    </div>

                    {course.blocked && course.blockReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-700">
                          <strong>Blocked Reason:</strong> {course.blockReason}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(c => c.status === 'active' && !c.blocked).map((course) => (
                <Card key={course.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge className="bg-green-500">Active</Badge>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(course.price)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(c => c.status === 'pending_review').map((course) => (
                <Card key={course.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge className="bg-yellow-500">Pending Review</Badge>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(course.price)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blocked" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(c => c.blocked).map((course) => (
                <Card key={course.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    {course.blockReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-700">
                          <strong>Reason:</strong> {course.blockReason}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <Badge className="bg-red-500">Blocked</Badge>
                      <p className="text-lg font-bold text-gray-600">{formatCurrency(course.price)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(c => c.status === 'rejected').map((course) => (
                <Card key={course.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl border-red-200">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>

                    {/* Rejection Reason Display */}
                    {course.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <h4 className="font-semibold text-red-800 text-sm mb-1">Rejection Reason:</h4>
                        <p className="text-red-700 text-sm">{course.rejectionReason}</p>
                        <p className="text-red-600 text-xs mt-1">
                          Rejected on: {new Date(course.rejectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <Badge className="bg-red-500">Rejected</Badge>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(course.price)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Avg. Rating</p>
                      <p className="text-3xl font-bold text-yellow-600">4.8</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Comments</p>
                      <p className="text-3xl font-bold text-blue-600">156</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Shares</p>
                      <p className="text-3xl font-bold text-green-600">89</p>
                    </div>
                    <Share2 className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Conversion Rate</p>
                      <p className="text-3xl font-bold text-purple-600">12%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-24 h-24 text-white/50 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No courses yet</h3>
            <p className="text-purple-100 mb-6">Create your first course and start earning</p>
            <Button 
              onClick={() => setLocation("/create-course")}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Course
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}