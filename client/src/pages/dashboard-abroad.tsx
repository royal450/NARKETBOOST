import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/footer";
import { CourseCard } from "@/components/course-card";
import { Course } from "@/types/course";
import { ref, set, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import {
  Search,
  User,
  Target,
  Youtube,
  Instagram,
  Megaphone,
  Heart,
  Users,
  Bot,
  Star,
  BookOpen,
  Award,
  Zap,
  Clock,
  Crown,
  Sparkles,
  Flame
} from "lucide-react";

// Sample courses data for abroad users
const sampleCourses: Course[] = [
  {
    id: "1",
    title: "YouTube Growth Mastery",
    description: "Complete YouTube strategy course to grow your channel from 0 to 100K subscribers with proven techniques.",
    price: 39,
    fakePrice: 199,
    category: "YouTube Growth",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    likes: 234,
    comments: 45,
    sales: 187,
    discount: 80
  },
  {
    id: "2",
    title: "Instagram Growth Elite",
    description: "Master Instagram marketing, content creation, and audience building for explosive growth and monetization.",
    price: 29,
    fakePrice: 149,
    category: "Instagram Growth",
    thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    likes: 189,
    comments: 32,
    sales: 145,
    discount: 80
  },
  {
    id: "3",
    title: "Digital Marketing Pro",
    description: "Complete digital marketing course covering SEO, social media, email marketing, and paid advertising strategies.",
    price: 49,
    fakePrice: 249,
    category: "Marketing",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    likes: 156,
    comments: 28,
    sales: 89,
    discount: 80
  }
];

export default function DashboardAbroad() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [shuffledCourses, setShuffledCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(sampleCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: Course[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const categories = [
    { id: "all", label: "All Courses", icon: Target, color: "from-purple-500 to-pink-500" },
    { id: "YouTube Growth", label: "YouTube", icon: Youtube, color: "from-red-500 to-orange-500" },
    { id: "Instagram Growth", label: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-500" },
    { id: "Marketing", label: "Marketing", icon: Megaphone, color: "from-blue-500 to-cyan-500" },
    { id: "Self Respect", label: "Self Respect", icon: Heart, color: "from-green-500 to-emerald-500" },
    { id: "Love", label: "Love", icon: Users, color: "from-red-500 to-pink-500" },
    { id: "ChatGPT Expert", label: "AI Expert", icon: Bot, color: "from-violet-500 to-purple-500" },
  ];

  useEffect(() => {
    // Initialize Firebase with sample data and listen for real-time updates
    const coursesRef = ref(database, 'courses-abroad');
    
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const coursesArray = Object.entries(data).map(([id, course]: [string, any]) => ({
          id,
          ...course
        }));
        const shuffled = shuffleArray(coursesArray);
        setCourses(coursesArray);
        setShuffledCourses(shuffled);
        setFilteredCourses(shuffled);
      } else {
        // Initialize Firebase with sample data
        const coursesData: { [key: string]: any } = {};
        sampleCourses.forEach(course => {
          coursesData[course.id] = course;
        });
        set(coursesRef, coursesData);
        const shuffled = shuffleArray(sampleCourses);
        setCourses(sampleCourses);
        setShuffledCourses(shuffled);
        setFilteredCourses(shuffled);
      }
    }, (error) => {
      console.log("Firebase error, using sample data:", error);
      const shuffled = shuffleArray(sampleCourses);
      setCourses(sampleCourses);
      setShuffledCourses(shuffled);
      setFilteredCourses(shuffled);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = shuffledCourses;

    // Apply category filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(course => course.category === activeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Keep the same random order (cards maintain position until refresh)
    setFilteredCourses(filtered);
  }, [shuffledCourses, activeFilter, searchTerm]);

  const handleBuyNow = (course: Course) => {
    setLocation("/payment");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Profile Icon */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setLocation("/profile")}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/30 transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
        >
          <User className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span>International Learning Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-6 leading-tight">
            Master New Skills
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of international learners who've transformed their careers with our expert-led courses
          </p>
          
          {/* Compact Stats Counter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-3xl mx-auto">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-blue-200 dark:border-blue-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">50+</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Courses</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-green-200 dark:border-green-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">10K+</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Students</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-yellow-200 dark:border-yellow-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">4.8</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Rating</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-purple-200 dark:border-purple-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Award className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">90%</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Success</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-8 animate-fadeIn">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-purple-500" />
            </div>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-8 py-6 border-0 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 text-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 placeholder:text-gray-400 text-gray-900 dark:text-white"
              placeholder="Search for your next skill to master..."
            />
          </div>
        </div>
        
        {/* Enhanced Filter Buttons - Horizontal Scrollable */}
        <div className="mb-12 animate-fadeIn">
          <div className="px-4 max-w-6xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                const isActive = activeFilter === category.id;
                return (
                  <Button
                    key={category.id}
                    onClick={() => setActiveFilter(category.id)}
                    variant={isActive ? "default" : "outline"}
                    className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 group relative overflow-hidden ${
                      isActive
                        ? `bg-gradient-to-r ${category.color} text-white hover:shadow-2xl border-0`
                        : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-2 relative z-10">
                      <IconComponent className="w-4 h-4" />
                      <span>{category.label}</span>
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Featured Courses */}
        <div className="mb-12 animate-fadeIn">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {activeFilter === "all" ? "International Courses" : `${activeFilter} Courses`}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Specially designed courses for international learners
            </p>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-16 h-16 text-purple-500 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No courses found</div>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full">
              {filteredCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CourseCard
                    course={course}
                    onBuyNow={handleBuyNow}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Career?
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of international learners who've accelerated their careers with our expert-led courses
              </p>
              <Button
                onClick={() => setLocation("/referral")}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Flame className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}