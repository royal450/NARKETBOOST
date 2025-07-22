import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Heart, MessageCircle, Eye, Users, Star, Shield, Crown, DollarSign,
  Play, Instagram, Facebook, Youtube, Send, Filter, Search, TrendingUp,
  Award, Verified, AlertTriangle, Clock, CheckCircle
} from "lucide-react";

interface Channel {
  id: number;
  title: string;
  description: string;
  price: number;
  fakePrice?: number;
  category: string;
  thumbnail?: string;
  seller: string;
  sellerId: number;
  likes: number;
  comments: number;
  sales: number;
  blocked: boolean;
  blockReason?: string;
  status: 'pending' | 'approved' | 'rejected';
  platform: string;
  followerCount: number;
  verificationStatus: string;
  trustedLevel?: number;
  engagementRate?: number;
  monetizationStatus?: string;
  reputation?: string;
  createdAt: Date;
}

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="w-5 h-5 text-red-500" />,
  instagram: <Instagram className="w-5 h-5 text-pink-500" />,
  facebook: <Facebook className="w-5 h-5 text-blue-600" />,
  telegram: <Send className="w-5 h-5 text-blue-500" />,
  reels: <Play className="w-5 h-5 text-purple-500" />,
  video: <Play className="w-5 h-5 text-green-500" />,
  tools: <Shield className="w-5 h-5 text-gray-600" />,
  other: <Star className="w-5 h-5 text-yellow-500" />
};

const categories = [
  "All Categories", "Technology", "Cooking", "Reviews", "Fun & Entertainment", 
  "Gaming", "Education", "Music", "Sports", "Travel", "Fashion", 
  "Health & Fitness", "Business", "News", "Comedy", "DIY", "Beauty", 
  "Photography", "Art", "Science", "History", "Other"
];

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "followers", label: "Most Followers" },
  { value: "verified", label: "Verified First" }
];

export default function ChannelShowFullAttractiveCard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [sortBy, setSortBy] = useState("latest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [likedChannels, setLikedChannels] = useState<Set<number>>(new Set());

  // Fetch approved channels only
  const { data: channels = [], isLoading, refetch } = useQuery<Channel[]>({
    queryKey: ['/api/channels', 'approved'],
    refetchInterval: 30000 // Real-time updates every 30 seconds
  });

  // Real-time updates with Firebase-style listeners (simulated)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Update every 10 seconds for real-time feel

    return () => clearInterval(interval);
  }, [refetch]);

  const handleLike = async (channelId: number) => {
    try {
      // Optimistic update
      setLikedChannels(prev => {
        const newSet = new Set(prev);
        if (newSet.has(channelId)) {
          newSet.delete(channelId);
        } else {
          newSet.add(channelId);
        }
        return newSet;
      });

      // API call would go here
      // await apiRequest(`/api/channels/${channelId}/like`, { method: 'POST' });
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handlePurchase = (channelId: number) => {
    if (!user) {
      setLocation("/login");
      return;
    }
    setLocation(`/payment/${channelId}`);
  };

  const getStatusBadge = (channel: Channel) => {
    if (channel.blocked && channel.blockReason === "Sold Out") {
      return (
        <Badge variant="destructive" className="absolute top-3 right-3 z-10 animate-pulse">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Sold Out
        </Badge>
      );
    }

    if (channel.verificationStatus === "verified") {
      return (
        <Badge className="absolute top-3 right-3 z-10 bg-blue-600 text-white">
          <Verified className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }

    return null;
  };

  const getReputationColor = (reputation?: string) => {
    switch (reputation) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "average": return "text-yellow-600";
      case "2-strike": return "text-orange-600";
      case "3-strike": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getTrustedStars = (level?: number) => {
    if (!level) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < level ? "text-yellow-500 fill-current" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  // Filter and sort channels
  const filteredChannels = channels
    .filter(channel => {
      if (channel.blocked && channel.blockReason !== "Sold Out") return false;
      if (channel.status !== "approved") return false;
      
      const matchesSearch = channel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           channel.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           channel.seller.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "All Categories" || channel.category === selectedCategory;
      const matchesPlatform = selectedPlatform === "All Platforms" || channel.platform === selectedPlatform;
      const matchesPrice = channel.price >= priceRange[0] && channel.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPlatform && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "popular": return b.likes - a.likes;
        case "followers": return b.followerCount - a.followerCount;
        case "verified": return (b.verificationStatus === "verified" ? 1 : 0) - (a.verificationStatus === "verified" ? 1 : 0);
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 shadow-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Channel Marketplace
          </h1>
          <p className="text-gray-600 text-lg">Discover amazing channels and grow your business</p>
        </div>

        {/* Filters */}
        <Card className="mb-8 backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Channels
                </label>
                <Input
                  placeholder="Search by name, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Platforms">All Platforms</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredChannels.map((channel) => (
            <Card
              key={channel.id}
              className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm ${
                channel.blocked && channel.blockReason === "Sold Out" 
                  ? "opacity-75 saturate-50" 
                  : "hover:bg-white/95"
              }`}
            >
              <div className="relative">
                <img
                  src={channel.thumbnail || `https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop`}
                  alt={channel.title}
                  className={`w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 ${
                    channel.blocked && channel.blockReason === "Sold Out" ? "grayscale" : ""
                  }`}
                />
                
                {/* Status Badge */}
                {getStatusBadge(channel)}

                {/* Platform Icon */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  {platformIcons[channel.platform] || platformIcons.other}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <CardContent className="p-6">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {channel.category}
                    </Badge>
                    {getTrustedStars(channel.trustedLevel)}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {channel.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">by {channel.seller}</p>
                  
                  <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                    {channel.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{channel.platform === 'youtube' ? 'Subscribers' : 'Followers'}: {channel.followerCount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{channel.sales} sales</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Heart className={`w-3 h-3 ${likedChannels.has(channel.id) ? 'text-red-500 fill-current' : ''}`} />
                    <span>{channel.likes + (likedChannels.has(channel.id) ? 1 : 0)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{channel.comments}</span>
                  </div>
                </div>

                {/* Reputation & Monetization */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {channel.monetizationStatus === "monetized" && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Monetized
                      </Badge>
                    )}
                    
                    {channel.reputation && (
                      <span className={`text-xs font-medium ${getReputationColor(channel.reputation)}`}>
                        {channel.reputation}
                      </span>
                    )}
                  </div>

                  {channel.engagementRate && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <TrendingUp className="w-3 h-3" />
                      {channel.engagementRate}% ER
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      ₹{channel.price.toLocaleString()}
                    </span>
                    {channel.fakePrice && channel.fakePrice > channel.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{channel.fakePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {channel.fakePrice && channel.fakePrice > channel.price && (
                    <Badge className="bg-red-500 text-white animate-pulse">
                      {Math.round(((channel.fakePrice - channel.price) / channel.fakePrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLike(channel.id)}
                    className={`flex-1 ${
                      likedChannels.has(channel.id) 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                    } transition-colors`}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${likedChannels.has(channel.id) ? 'fill-current' : ''}`} />
                    Like
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => handlePurchase(channel.id)}
                    disabled={channel.blocked && channel.blockReason === "Sold Out"}
                    className={`flex-1 ${
                      channel.blocked && channel.blockReason === "Sold Out"
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    }`}
                  >
                    {channel.blocked && channel.blockReason === "Sold Out" ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Sold Out
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </div>

                {/* Admin Badge (if user has admin verification) */}
                {user && channel.sellerId === user.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Badge className="w-full justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Your Channel
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredChannels.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No channels found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* Real-time Status Indicator */}
        <div className="fixed bottom-6 right-6 bg-white rounded-full shadow-lg p-3 border">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Updates
          </div>
        </div>
      </div>
    </div>
  );
}