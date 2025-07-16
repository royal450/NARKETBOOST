
import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Star, BookOpen, Users, Award, Shield } from "lucide-react";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  joinDate: string;
  totalCourses: number;
  totalSales: number;
  rating: number;
  bestSeller: boolean;
  trusted: boolean;
  bio: string;
}

export default function UserProfile() {
  const [, params] = useRoute('/user-profile/:userId');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (params?.userId) {
      loadUserProfile(params.userId);
    }
  }, [params?.userId]);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      if (userId === 'system') {
        // System generated profile
        setProfile({
          displayName: "Course Market",
          email: "system@coursemarket.com",
          photoURL: "",
          joinDate: "2024",
          totalCourses: 50,
          totalSales: 1500,
          rating: 4.8,
          bestSeller: true,
          trusted: true,
          bio: "Official Course Market - Curated courses for digital success"
        });
        
        // Load some system courses
        setCourses([
          { title: "Complete Digital Marketing", sales: 120, rating: 4.9 },
          { title: "YouTube Growth Secrets", sales: 95, rating: 4.7 },
          { title: "Instagram Marketing Pro", sales: 88, rating: 4.8 }
        ]);
      } else {
        // Load real user profile
        const userRef = ref(database, `users/${userId}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          setProfile({
            displayName: userData.displayName || "User",
            email: userData.email || "",
            photoURL: userData.photoURL || "",
            joinDate: userData.joinDate || "2024",
            totalCourses: userData.totalCourses || 0,
            totalSales: userData.totalSales || 0,
            rating: userData.rating || 4.5,
            bestSeller: userData.bestSeller || false,
            trusted: userData.trusted || false,
            bio: userData.bio || "Course creator and educator"
          });
          
          // Load user's courses
          const coursesRef = ref(database, 'courses');
          const coursesSnapshot = await get(coursesRef);
          
          if (coursesSnapshot.exists()) {
            const allCourses = coursesSnapshot.val();
            const userCourses = Object.values(allCourses).filter(
              (course: any) => course.instructorId === userId
            );
            setCourses(userCourses);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="relative mx-auto w-24 h-24 mb-4">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-full h-full rounded-full object-cover border-4 border-purple-200"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.displayName.charAt(0)}
                </div>
              )}
              {profile.bestSeller && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    🏆 Best Seller
                  </Badge>
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              {profile.displayName}
              {profile.trusted && (
                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs">
                  ✅ Trusted
                </Badge>
              )}
            </CardTitle>
            
            <p className="text-gray-600 mt-2">{profile.bio}</p>
            
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {profile.joinDate}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {profile.rating} rating
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{profile.totalCourses}</p>
                  <p className="text-blue-100 text-sm">Total Courses</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{profile.totalSales}</p>
                  <p className="text-green-100 text-sm">Total Sales</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{profile.rating}</p>
                  <p className="text-purple-100 text-sm">Average Rating</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Courses */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Popular Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.slice(0, 4).map((course, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{course.title}</h4>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{course.sales || 0} sales</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {course.rating || 4.5}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
