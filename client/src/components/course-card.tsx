import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Star, X, Send, ShoppingCart, Eye, User, Users, TrendingUp } from "lucide-react";
import { Channel } from "@/types/course";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ChannelCardProps {
  channel: Channel;
  onBuyNow: (channel: Channel) => void;
}

// Backward compatibility
interface CourseCardProps extends ChannelCardProps {
  course: Channel;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  avatar: string;
}

export function ChannelCard({ channel, onBuyNow }: ChannelCardProps) {
  // Backward compatibility support
  const channelData = channel;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(channelData.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [realTimeViews] = useState(channelData.views || Math.floor(Math.random() * 900000) + 100000);
  const [realTimeSales] = useState(channelData.sales || 0);
  const [realTimeRating] = useState(channelData.rating || (Math.random() * 3.9 + 1.1).toFixed(1));
  const [followerCount] = useState(channelData.followerCount || Math.floor(Math.random() * 100000) + 10000);
  const [engagementRate] = useState(channelData.engagementRate || (Math.random() * 8 + 2).toFixed(1));

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
      "Yaar ye channel ekdam mast hai! 🔥", "Bhai sahab amazing channel hai, paisa vasool!",
      "Best channel ever yaar! Highly recommend karta hun", "Superb quality hai bro, bahut followers mila",
      "Value for money ka matlab ye channel hai", "Beginners aur experts dono ke liye perfect",
      "Mind-blowing engagement rate hai bro", "Ye to pure sona hai audience wise",
      "Growth potential ekdam top class hai", "Results pakke hain agar properly manage karo",
      "Top-notch quality content already hai", "Business ke liye game-changer hai ye channel",
      "Incredible followers count hai bhai", "Serious buyers ke liye must-purchase",
      "Bilkul different niche hai growth ka", "Exceptional quality engagement hai channel mein",
      "Kamaal ka channel hai yaar! 🚀", "Paisa double ho gaya is channel se",
      "Seller bhai ka management amazing hai", "Life changing opportunity mila hai",
      "Bas kar diya buy after seeing stats", "Ekdum solid channel hai bhai log"
    ];

    const internationalComments = [
      "This channel changed my business! 🔥", "Amazing engagement, worth every penny",
      "Best channel ever! Highly recommended", "Superb quality, great follower base",
      "Outstanding value for money", "Perfect for beginners and experts",
      "Mind-blowing engagement rate here", "This is pure gold audience"
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
    localStorage.setItem(`comments_${channelData.id}`, JSON.stringify(generatedComments));
  };

  useEffect(() => {
    // Check if user has liked this channel before
    const savedLikeState = localStorage.getItem(`liked_${channelData.id}`);
    if (savedLikeState) {
      setIsLiked(savedLikeState === 'true');
    }

    // Generate comments only once and store in localStorage
    const savedComments = localStorage.getItem(`comments_${channelData.id}`);
    if (savedComments) {
      const parsedComments = JSON.parse(savedComments);
      setComments(parsedComments);
      setCommentCount(parsedComments.length);
    } else {
      generateRealisticComments();
    }
  }, [channelData.id]);

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
        description: "Please login to like channels",
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
      localStorage.setItem(`liked_${channelData.id}`, newLikedState.toString());

      // Update Firebase database with real-time like count
      const { ref, update } = await import("firebase/database");
      const { database } = await import("@/lib/firebase");

      await update(ref(database, `channels/${channelData.id}`), {
        likes: newLikesCount
      });

      toast({
        title: newLikedState ? "Added to likes! ❤️" : "Removed from likes ❤️",
        description: newLikedState ? "Channel added to your likes" : "Channel removed from your likes",
      });
    } catch (error) {
      console.error("Error liking channel:", error);
      toast({
        title: "Error",
        description: "Failed to like channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/channel/${channelData.id}?ref=${user?.uid || 'guest'}`;
      const shareData = {
        title: channelData.title,
        text: `Check out this amazing channel: ${channelData.title} - Only ₹${channelData.price}`,
        url: shareUrl,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied! 📋",
          description: "Channel link has been copied to clipboard with your referral code",
        });
      }
    } catch (error) {
      // Fallback for when share is cancelled or fails
      const shareUrl = `${window.location.origin}/channel/${channelData.id}?ref=${user?.uid || 'guest'}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied! 📋", 
          description: "Channel link has been copied to clipboard",
        });
      } catch (clipboardError) {
        toast({
          title: "Share Ready! 📤",
          description: "Use the share button to share this channel",
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
    if (channelData.fakePrice && channelData.fakePrice > channelData.price) {
      return Math.round(((channelData.fakePrice - channelData.price) / channelData.fakePrice) * 100);
    }
    return channelData.discount || 0;
  };

  const discountPercentage = calculateDiscountPercentage();
  const discountedPrice = channelData.finalPrice || (channelData.discount ? channelData.price - (channelData.price * channelData.discount / 100) : channelData.price);

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

      {/* Channel Image */}
      <div className="relative overflow-hidden">
        <img
          src={channelData.thumbnail || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop"}
          alt={channelData.title}
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

        {/* Platform Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 shadow-lg">
            {channelData.platform || channelData.category}
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

      {/* Channel Content */}
      <div className="p-6 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
          {channelData.title}
        </h3>

        <div className="flex items-center mb-4 gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            <User className="w-4 h-4 text-purple-500 mr-2" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Seller: <span 
                className="font-medium text-purple-600 cursor-pointer hover:underline"
                onClick={() => {
                  if (channelData.sellerId) {
                    window.open(`/user-profile/${channelData.sellerId}`, '_blank');
                  }
                }}
              >
                {channelData.seller}
              </span>
            </span>
          </div>
          <div className="flex items-center bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
            <Users className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              {(followerCount / 1000).toFixed(0)}K followers
            </span>
          </div>
          <div className="flex items-center bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
            <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              {engagementRate}% engagement
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {channelData.description}
        </p>

        {/* Price Section - Fake Price for Marketing, Real Price Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col space-y-2">
            {/* Marketing/Fake Price Box */}
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 border border-red-300 px-3 py-1 rounded-lg">
                <span className="text-lg text-red-600 line-through font-medium">₹{Math.floor((channelData.fakePrice || channelData.price * 2.5)).toLocaleString()}</span>
              </div>
              <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                {Math.floor(((((channelData.fakePrice || channelData.price * 2.5) - channelData.price) / (channelData.fakePrice || channelData.price * 2.5)) * 100))}% OFF
              </div>
            </div>
            {/* Real Price */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600">₹{Math.floor(channelData.price).toLocaleString()}</span>
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
              {displaySales} transferred
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => onBuyNow(channelData)}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span className="text-lg">Purchase Channel - ₹{Math.floor(channelData.price).toLocaleString()}</span>
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

// Export backward compatibility function at bottom
export function CourseCard({ course, onBuyNow }: CourseCardProps) {
  return <ChannelCard channel={course} onBuyNow={onBuyNow} />;
}