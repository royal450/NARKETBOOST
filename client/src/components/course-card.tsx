import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Star, X, Send, ShoppingCart, Eye, User } from "lucide-react";
import { Course } from "@/types/course";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface CourseCardProps {
  course: Course;
  onBuyNow: (course: Course) => void;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  avatar: string;
}

export function CourseCard({ course, onBuyNow }: CourseCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(course.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [realTimeViews] = useState(course.views || Math.floor(Math.random() * 9000) + 1000);
  const [realTimeSales] = useState(course.sales || 0);
  const [realTimeRating] = useState(course.rating || (Math.random() * 3.9 + 1.1).toFixed(1));

  // Realistic mixed names with 80% Indian names
  const generateRealisticComments = () => {
    const indianNames = [
      "Rajesh Kumar", "Priya Sharma", "Anita Patel", "Sunita Singh", "Kavya Reddy",
      "Neha Gupta", "Ravi Agarwal", "Sanjay Mishra", "Vikram Singh", "Rahul Jain",
      "Arjun Nair", "Kiran Kumar", "Amit Verma", "Deepika Singh", "Rohit Gupta",
      "Sneha Patel", "Manish Kumar", "Pooja Sharma", "Aakash Jain", "Shreya Reddy",
      "Varun Singh", "Meera Gupta", "Harsh Agarwal", "Nisha Patel", "Kunal Sharma"
    ];

    const internationalNames = [
      "Jennifer Smith", "Michael Johnson", "David Wilson", "Robert Brown", "James Davis",
      "Christopher Lee", "Emily Garcia", "Jessica Miller", "Sarah Anderson", "Amanda Taylor",
      "Maria Rodriguez", "Lisa Thomas"
    ];

    // 80% Indian comments in Hinglish, 20% international
    const indianComments = [
      "Yaar ye course ekdam mast hai! 🔥", "Bhai sahab amazing content hai, paisa vasool!",
      "Best course ever yaar! Highly recommend karta hun", "Superb quality hai bro, bahut kuch sikha",
      "Value for money ka matlab ye course hai", "Beginners aur experts dono ke liye perfect",
      "Mind-blowing techniques share kiye hain sir ne", "Ye to pure sona hai content wise",
      "Teaching style ekdam top class hai", "Results pakke hain agar follow karo properly",
      "Top-notch quality content mila hai", "Business ke liye game-changer hai ye",
      "Incredible tips mile hain bhai", "Serious learners ke liye must-buy",
      "Bilkul different approach hai learning ka", "Exceptional quality material hai course mein",
      "Kamaal ka course hai yaar! 🚀", "Paisa double ho gaya is course se",
      "Guru ji ka teaching style amazing hai", "Life changing content mila hai",
      "Bas kar diya subscribe after watching this", "Ekdum solid course hai bhai log"
    ];

    const internationalComments = [
      "This course changed my life! 🔥", "Amazing content, worth every penny",
      "Best course ever! Highly recommended", "Superb quality, learned so much",
      "Outstanding value for money", "Perfect for beginners and experts",
      "Mind-blowing techniques shared here", "This is pure gold content"
    ];

    const timeStamps = [
      "अभी अभी", "2 min ago", "15 min ago", "1 घंटा ago", "3 hours ago",
      "5 घंटे ago", "1 दिन ago", "2 days ago", "3 दिन ago", "1 हफ्ता ago"
    ];

    const count = Math.floor(Math.random() * 25) + 5; // 5-30 comments
    const generatedComments = [];

    for (let i = 0; i < count; i++) {
      const isIndian = Math.random() < 0.8; // 80% Indian comments
      const name = isIndian ? 
        indianNames[Math.floor(Math.random() * indianNames.length)] :
        internationalNames[Math.floor(Math.random() * internationalNames.length)];

      const comment = isIndian ?
        indianComments[Math.floor(Math.random() * indianComments.length)] :
        internationalComments[Math.floor(Math.random() * internationalComments.length)];

      generatedComments.push({
        id: `auto_${i}`,
        user: name,
        text: comment,
        timestamp: timeStamps[Math.floor(Math.random() * timeStamps.length)],
        avatar: name.split(' ').map(n => n[0]).join('')
      });
    }

    setComments(generatedComments);
    setCommentCount(count);

    // Store comments in localStorage to prevent regeneration
    localStorage.setItem(`comments_${course.id}`, JSON.stringify(generatedComments));
  };

  useEffect(() => {
    // Check if user has liked this course before
    const savedLikeState = localStorage.getItem(`liked_${course.id}`);
    if (savedLikeState) {
      setIsLiked(savedLikeState === 'true');
    }

    // Generate comments only once and store in localStorage
    const savedComments = localStorage.getItem(`comments_${course.id}`);
    if (savedComments) {
      const parsedComments = JSON.parse(savedComments);
      setComments(parsedComments);
      setCommentCount(parsedComments.length);
    } else {
      generateRealisticComments();
    }
  }, [course.id]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 300) { // 5 minutes
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else {
      return "5 min ago";
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to like courses",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLikedState = !isLiked;
      const newLikesCount = newLikedState ? likes + 1 : likes - 1;

      setIsLiked(newLikedState);
      setLikes(newLikesCount);

      // Store like state in localStorage to persist across refreshes
      localStorage.setItem(`liked_${course.id}`, newLikedState.toString());

      // Update Firebase database with real-time like count
      const { ref, update } = await import("firebase/database");
      const { database } = await import("@/lib/firebase");

      await update(ref(database, `courses/${course.id}`), {
        likes: newLikesCount
      });

      toast({
        title: newLikedState ? "Added to likes! ❤️" : "Removed from likes ❤️",
        description: newLikedState ? "Course added to your likes" : "Course removed from your likes",
      });
    } catch (error) {
      console.error("Error liking course:", error);
      toast({
        title: "Error",
        description: "Failed to like course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/course/${course.id}?ref=${user?.uid || 'guest'}`;
      const shareData = {
        title: course.title,
        text: `Check out this amazing course: ${course.title} - Only ₹${course.price}`,
        url: shareUrl,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied! 📋",
          description: "Course link has been copied to clipboard with your referral code",
        });
      }
    } catch (error) {
      // Fallback for when share is cancelled or fails
      const shareUrl = `${window.location.origin}/course/${course.id}?ref=${user?.uid || 'guest'}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied! 📋", 
          description: "Course link has been copied to clipboard",
        });
      } catch (clipboardError) {
        toast({
          title: "Share Ready! 📤",
          description: "Use the share button to share this course",
        });
      }
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: user?.displayName || user?.email || "Anonymous",
      text: newComment,
      timestamp: new Date(),
      avatar: (user?.displayName || user?.email || "A").charAt(0).toUpperCase()
    };

    setComments(prev => [comment, ...prev]);
    setNewComment("");

    toast({
      title: "Comment Added! 💬",
      description: "Your comment has been posted successfully",
    });
  };

  // Calculate automatic discount percentage if fake price exists
  const calculateDiscountPercentage = () => {
    if (course.fakePrice && course.fakePrice > course.price) {
      return Math.round(((course.fakePrice - course.price) / course.fakePrice) * 100);
    }
    return course.discount || 0;
  };

  const discountPercentage = calculateDiscountPercentage();
  const discountedPrice = course.finalPrice || (course.discount ? course.price - (course.price * course.discount / 100) : course.price);

  // Use real-time data with consistent values (no random regeneration)
  const displayLikes = likes; // Use real-time likes from state
  const displaySales = realTimeSales; // Use consistent sales value
  const displayViews = realTimeViews; // Use consistent views value
  const displayRating = parseFloat(realTimeRating); // Ensure rating is between 1.1 and 5.0
  const finalRating = Math.min(Math.max(displayRating, 1.1), 5.0);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${Math.floor(views / 1000000)}M`;
    if (views >= 1000) return `${Math.floor(views / 1000)}K`;
    return views.toString();
  };

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/30 to-cyan-50/30 dark:from-gray-800 dark:via-purple-900/30 dark:to-cyan-900/30 rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden animate-fadeInUp relative">

      {/* Course Image */}
      <div className="relative overflow-hidden">
        <img
          src={course.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop"}
          alt={course.title}
          className="w-full h-52 object-cover"
        />

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 text-sm font-bold animate-pulse shadow-lg">
              {discountPercentage}% OFF
            </Badge>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 shadow-lg">
            {course.category}
          </Badge>
        </div>

        {/* Hot Badge */}
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-xs font-bold shadow-lg animate-bounce">
            🔥 HOT
          </Badge>
        </div>

        {/* Views Badge */}
        <div className="absolute bottom-4 right-4">
          <Badge className="bg-black/70 text-white px-3 py-1 text-xs font-medium shadow-lg">
            {formatViews(displayViews)} views
          </Badge>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
          {course.title}
        </h3>

        <div className="flex items-center mb-4 gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            <User className="w-4 h-4 text-purple-500 mr-2" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              By: <span 
                className="font-medium text-purple-600 cursor-pointer hover:underline"
                onClick={() => {
                  if (course.instructorId) {
                    window.open(`/user-profile/${course.instructorId}`, '_blank');
                  }
                }}
              >
                {course.instructorName || course.instructor}
              </span>
            </span>
          </div>
          {course.bestSeller && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs animate-pulse">
              🏆 Best Seller
            </Badge>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        {/* Price Section - Fake Price for Marketing, Real Price Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col space-y-2">
            {/* Marketing/Fake Price Box */}
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 border border-red-300 px-3 py-1 rounded-lg">
                <span className="text-lg text-red-600 line-through font-medium">₹{Math.floor((course.fakePrice || course.price * 2.5)).toLocaleString()}</span>
              </div>
              <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                {Math.floor(((((course.fakePrice || course.price * 2.5) - course.price) / (course.fakePrice || course.price * 2.5)) * 100))}% OFF
              </div>
            </div>
            {/* Real Price */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600">₹{Math.floor(course.price).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">{finalRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {displayLikes}
            </span>
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {comments.length}
            </span>
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {formatViews(displayViews)}
            </span>
            <span className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-1" />
              {displaySales} sold
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => onBuyNow(course)}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span className="text-lg">Buy Now - ₹{Math.floor(course.price).toLocaleString()}</span>
            </div>
          </Button>

          <div className="flex space-x-2">
            <Button
              onClick={handleLike}
              variant="outline"
              size="sm"
              className={`flex-1 transition-all duration-300 ${
                isLiked ? 'bg-red-50 border-red-200 text-red-600' : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </Button>

            <Button
              onClick={() => setShowComments(!showComments)}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Comments ({comments.length})
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all duration-300"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 animate-slideDown">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Comments ({comments.length})</h4>
            <Button
              onClick={() => setShowComments(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Add Comment */}
          <div className="flex space-x-2 mb-4">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button
              onClick={handleAddComment}
              size="sm"
              disabled={!newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{comment.user}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}