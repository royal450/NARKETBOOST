import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  BookOpen, 
  TrendingUp,
  Award,
  Target,
  Heart,
  MessageCircle,
  Share2,
  Edit,
  Save,
  LogOut
} from "lucide-react";

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: "+91 9104037184",
    location: "Delhi, India",
    bio: "Passionate learner and digital marketing enthusiast",
    joinDate: "December 2024"
  });

  const userStats = {
    coursesCompleted: 8,
    totalLearningHours: 142,
    certificatesEarned: 5,
    currentStreak: 15,
    favoriteCategory: "YouTube Growth",
    totalSpent: 12450,
    coursesLiked: 23,
    commentsPosted: 47,
    sharesCount: 15
  };

  const recentCourses = [
    {
      id: "1",
      title: "YouTube Mastery 2024",
      progress: 85,
      rating: 4.8,
      status: "In Progress"
    },
    {
      id: "2", 
      title: "Instagram Growth Hacks",
      progress: 100,
      rating: 4.9,
      status: "Completed"
    },
    {
      id: "3",
      title: "Digital Marketing Pro",
      progress: 60,
      rating: 4.7,
      status: "In Progress"
    }
  ];

  const achievements = [
    { icon: Award, title: "Fast Learner", description: "Completed 5 courses in 30 days" },
    { icon: Target, title: "Goal Achiever", description: "Maintained 15-day learning streak" },
    { icon: Star, title: "Top Reviewer", description: "Posted 25+ helpful reviews" },
    { icon: BookOpen, title: "Knowledge Seeker", description: "Enrolled in 10+ courses" }
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated"
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        value={profileData.displayName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="text-center"
                      />
                      <Input
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="text-center"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profileData.displayName}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{profileData.bio}</p>
                    </>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">{profileData.email}</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-sm">{profileData.phone}</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{profileData.location}</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Joined {profileData.joinDate}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Button
                      onClick={isEditing ? handleSave : () => setIsEditing(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                    
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Stats */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Learning Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.coursesCompleted}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Courses Completed</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.totalLearningHours}h</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Learning Hours</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.certificatesEarned}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Certificates</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{userStats.currentStreak}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Stats */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Heart className="mr-2 h-5 w-5" />
                  Community Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">{userStats.coursesLiked}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Courses Liked</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{userStats.commentsPosted}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Comments Posted</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Share2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">{userStats.sharesCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Courses Shared</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Courses */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Recent Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{course.title}</h4>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center mr-4">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{course.rating}</span>
                          </div>
                          <Badge variant={course.status === "Completed" ? "default" : "secondary"}>
                            {course.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{course.progress}%</div>
                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Award className="mr-2 h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div key={index} className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}