import React, { useState } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ref, set, push } from "firebase/database";
import { database } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, BookOpen, DollarSign, Info, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function ListChannel() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Crash prevention
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Please login to list your channel...</p>
        </div>
      </div>
    );
  }
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    fakePrice: "",
    platform: "",
    category: "",
    thumbnail: "",
    channelLink: "",
    followerCount: "",
    engagementRate: "",
    niche: "lifestyle",
    monetization: "yes",
    tags: "",
    targetAudience: "",
    contentType: "",
    analytics: "",
  });

  const platforms = [
    { id: "youtube", label: "YouTube Channel", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop" },
    { id: "instagram", label: "Instagram Channel", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop" },
    { id: "tiktok", label: "TikTok Channel", image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop" },
    { id: "twitter", label: "Twitter/X Channel", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" },
    { id: "facebook", label: "Facebook Page", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop" },
    { id: "linkedin", label: "LinkedIn Page", image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&h=300&fit=crop" },
    { id: "telegram", label: "Telegram Channel", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b377?w=400&h=300&fit=crop" },
    { id: "discord", label: "Discord Server", image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop" }
  ];

  const categories = [
    { id: "tech", label: "Tech & Programming", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop" },
    { id: "business", label: "Business & Finance", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" },
    { id: "creative", label: "Creative & Design", image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop" },
    { id: "marketing", label: "Marketing & Sales", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" },
    { id: "lifestyle", label: "Lifestyle & Wellness", image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop" },
    { id: "entertainment", label: "Entertainment & Gaming", image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop" },
    { id: "music", label: "Music & Audio", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop" },
    { id: "education", label: "Education & Learning", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop" },
    { id: "parenting", label: "Parenting & Family", image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop" },
    { id: "pets", label: "Pets & Animals", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=300&fit=crop" },
    { id: "sports", label: "Sports & Recreation", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop" },
    { id: "crafts", label: "Crafts & Hobbies", image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop" },
    { id: "automotive", label: "Automotive", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop" },
    { id: "real-estate", label: "Real Estate", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop" },
    { id: "legal", label: "Legal & Compliance", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop" },
    { id: "other", label: "Other", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to create a course",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a course title",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a course description",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
      toast({
        title: "Price Required",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!formData.courseLink.trim()) {
      toast({
        title: "Course Link Required",
        description: "Please provide your course access link",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const courseId = Date.now().toString();
      
      // Get automatic category-based image if no thumbnail provided
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      const autoThumbnail = selectedCategory?.image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop";
      
      const courseData = {
        ...formData,
        id: courseId,
        instructor: user.displayName || user.email,
        instructorId: user.uid,
        instructorEmail: user.email,
        instructorName: user.displayName || user.email?.split('@')[0],
        price: parseInt(formData.price) || 0,
        fakePrice: parseInt(formData.fakePrice) || 0,
        discount: formData.fakePrice && formData.price ? 
          Math.round(((parseInt(formData.fakePrice) - parseInt(formData.price)) / parseInt(formData.fakePrice)) * 100) : 0,
        thumbnail: formData.thumbnail.trim() || autoThumbnail, // Automatic category image if empty
        courseLink: formData.courseLink, // Admin review के लिए
        tags: formData.tags.split(',').map(tag => tag.trim()),
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        whatYouLearn: formData.whatYouLearn.split('\n').filter(learn => learn.trim()),
        courseContent: formData.courseContent.split('\n').filter(content => content.trim()),
        status: "pending_review",
        approvalStatus: "pending",
        blocked: false,
        rejectionReason: null,
        commission: 30,
        likes: Math.floor(Math.random() * 95) + 5, // Fake likes 5-100 (marketing limit)
        comments: Math.floor(Math.random() * 16) + 4, // Fake comments 4-20
        sales: 0, // Real sales start from 0
        rating: 1.1, // New course rating
        reviews: 0,
        views: Math.floor(Math.random() * 9000) + 1000, // Fake views 1K-10K (marketing limit)
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save course to Firebase
      await set(ref(database, `courses/${courseId}`), courseData);

      // Update user's courses
      const userCoursesRef = ref(database, `users/${user.uid}/myCourses/${courseId}`);
      await set(userCoursesRef, {
        courseId,
        title: formData.title,
        status: "pending_review",
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Course Created Successfully! 🎉",
        description: "Your course has been submitted for review. You'll be notified once it's approved.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        fakePrice: "",
        category: "",
        thumbnail: "",
        courseLink: "",
        duration: "",
        level: "beginner",
        language: "Hindi",
        tags: "",
        requirements: "",
        whatYouLearn: "",
        courseContent: "",
      });

      setLocation("/my-courses");
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error Creating Course",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="text-white text-2xl" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">Create Your Course</CardTitle>
            <p className="text-gray-600 mt-2">Share your knowledge and earn 70% commission on every sale</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <h4 className="font-semibold text-red-800">⚠️ Important Course Terms & Conditions</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• <strong>Commission:</strong> You earn 70% on every sale, platform takes 30%</li>
                <li>• <strong>Review:</strong> Course will be reviewed within 1 hour (not 24-48 hours)</li>
                <li>• <strong>Course Link:</strong> Must provide working course access link (mandatory)</li>
                <li>• <strong>Link Monitoring:</strong> System monitors your link 24/7 for accessibility</li>
                <li>• <strong>Link Issues:</strong> If link expires/inaccessible, you have 3 hours to fix via email</li>
                <li>• <strong>Fraud Prevention:</strong> Links inaccessible for 5+ hours = Course deletion</li>
                <li>• <strong>Trust Policy:</strong> Ensure your course link is ALWAYS active and accessible</li>
                <li>• <strong>Quality:</strong> Original, high-quality content only - no spam/duplicate content</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Complete YouTube Growth Masterclass"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Course Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what students will learn in this course..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="price">Course Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="999"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="fakePrice">Original Price (₹) *</Label>
                  <Input
                    id="fakePrice"
                    type="number"
                    value={formData.fakePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, fakePrice: e.target.value }))}
                    placeholder="1999"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 3 hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="level">Course Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="all-levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">Language *</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hinglish">Hinglish</SelectItem>
                      <SelectItem value="Tamil">Tamil</SelectItem>
                      <SelectItem value="Telugu">Telugu</SelectItem>
                      <SelectItem value="Bengali">Bengali</SelectItem>
                      <SelectItem value="Marathi">Marathi</SelectItem>
                      <SelectItem value="Gujarati">Gujarati</SelectItem>
                      <SelectItem value="Punjabi">Punjabi</SelectItem>
                      <SelectItem value="Kannada">Kannada</SelectItem>
                      <SelectItem value="Malayalam">Malayalam</SelectItem>
                      <SelectItem value="Urdu">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail">Course Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <Label htmlFor="courseLink" className="text-yellow-800 font-medium">
                  🔗 Course Access Link * (Admin Review Only)
                </Label>
                <Input
                  id="courseLink"
                  type="url"
                  value={formData.courseLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseLink: e.target.value }))}
                  placeholder="https://your-course-platform.com/your-course"
                  className="mt-2 border-yellow-300 focus:border-yellow-500"
                  required
                />
                <p className="text-xs text-yellow-700 mt-1">
                  This link will only be visible to admin for course review. Make sure it's always accessible!
                </p>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="youtube, marketing, growth, social media"
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Basic computer knowledge&#10;Internet connection&#10;Willingness to learn"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="whatYouLearn">What You'll Learn (one per line)</Label>
                <Textarea
                  id="whatYouLearn"
                  value={formData.whatYouLearn}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatYouLearn: e.target.value }))}
                  placeholder="YouTube channel optimization&#10;Video SEO techniques&#10;Monetization strategies"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="courseContent">Course Content (one topic per line)</Label>
                <Textarea
                  id="courseContent"
                  value={formData.courseContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseContent: e.target.value }))}
                  placeholder="Introduction to YouTube&#10;Channel Setup and Branding&#10;Content Creation Strategies"
                  rows={5}
                />
              </div>

              <div className="flex justify-between items-center pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/dashboard")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? "Creating Course..." : "Create Course"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}