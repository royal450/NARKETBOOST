import React, { useState } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ref, set } from "firebase/database";
import { database } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Megaphone, DollarSign, Info, AlertTriangle, Sparkles } from "lucide-react";
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
    { id: "instagram", label: "Instagram Account", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop" },
    { id: "tiktok", label: "TikTok Account", image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=300&fit=crop" },
    { id: "twitter", label: "Twitter/X Account", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" },
    { id: "facebook", label: "Facebook Page/Group", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop" },
    { id: "linkedin", label: "LinkedIn Page", image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&h=300&fit=crop" },
    { id: "telegram", label: "Telegram Channel", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b377?w=400&h=300&fit=crop" },
    { id: "discord", label: "Discord Server", image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop" },
    { id: "reels-bundle", label: "Reels Bundle", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop" },
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
        description: "Please login to list your channel",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a channel title",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a channel description",
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

    if (!formData.platform) {
      toast({
        title: "Platform Required",
        description: "Please select a platform",
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

    if (!formData.channelLink.trim()) {
      toast({
        title: "Channel Link Required",
        description: "Please provide your channel link",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const channelId = Date.now().toString();
      
      // Get automatic category-based image if no thumbnail provided
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      const autoThumbnail = selectedCategory?.image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop";
      
      const channelData = {
        ...formData,
        id: channelId,
        seller: user.displayName || user.email,
        sellerId: user.uid,
        sellerEmail: user.email,
        sellerName: user.displayName || user.email?.split('@')[0],
        price: parseInt(formData.price) || 0,
        fakePrice: parseInt(formData.fakePrice) || 0,
        discount: formData.fakePrice && formData.price ? 
          Math.round(((parseInt(formData.fakePrice) - parseInt(formData.price)) / parseInt(formData.fakePrice)) * 100) : 0,
        thumbnail: formData.thumbnail.trim() || autoThumbnail,
        channelLink: formData.channelLink,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        targetAudience: formData.targetAudience.split('\n').filter(aud => aud.trim()),
        contentType: formData.contentType.split('\n').filter(ct => ct.trim()),
        analytics: formData.analytics.split('\n').filter(an => an.trim()),
        status: "pending_review",
        approvalStatus: "pending",
        blocked: false,
        rejectionReason: null,
        commission: 30,
        likes: Math.floor(Math.random() * 95) + 5,
        comments: Math.floor(Math.random() * 16) + 4,
        sales: 0,
        rating: 1.1,
        reviews: 0,
        views: Math.floor(Math.random() * 9000) + 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firebase (changed to channels for consistency)
      await set(ref(database, `channels/${channelId}`), channelData);

      // Update user's listings
      const userChannelsRef = ref(database, `users/${user.uid}/myChannels/${channelId}`);
      await set(userChannelsRef, {
        channelId,
        title: formData.title,
        status: "pending_review",
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Channel Listed Successfully! 🎉",
        description: "Your channel has been submitted for review. You'll be notified once it's approved.",
      });

      // Reset form
      setFormData({
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

      setLocation("/my-channels");
    } catch (error) {
      console.error("Error listing channel:", error);
      toast({
        title: "Error Listing Channel",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-cyan-900 select-none relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center py-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white relative">
            <div className="absolute top-4 left-4">
              <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="text-white hover:bg-white/20">
                ← Back
              </Button>
            </div>
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <Megaphone className="text-white w-10 h-10" />
            </div>
            <CardTitle className="text-4xl font-bold mb-2">List Your Channel</CardTitle>
            <p className="text-lg opacity-90">Sell your social media channels or reels bundles and earn 70% commission</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <h4 className="font-semibold text-red-800 text-lg">⚠️ Important Listing Terms & Conditions</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-2">
                <li className="flex items-start"><Sparkles className="w-4 h-4 mr-2 mt-1" /> <span><strong>Commission:</strong> You earn 70% on every sale, platform takes 30%</span></li>
                <li className="flex items-start"><Sparkles className="w-4 h-4 mr-2 mt-1" /> <span><strong>Review:</strong> Listing will be reviewed within 1 hour</span></li>
                <li className="flex items-start"><Sparkles className="w-4 h-4 mr-2 mt-1" /> <span><strong>Channel Link:</strong> Must provide valid channel link (mandatory)</span></li>
                <li className="flex items-start"><Sparkles className="w-4 h-4 mr-2 mt-1" /> <span><strong>Link Monitoring:</strong> System monitors your link 24/7</span></li>
                <li className="flex items-start"><Sparkles className="w-4 h-4 mr-2 mt-1" /> <span><strong>Link Issues:</strong> Fix within 3 hours if inaccessible</span></li>
                <li className="flex items-start"><Sparkles className="w-4 h-4 mr-2 mt-1" /> <span><strong>Fraud Prevention:</strong> Inaccessible for 5+ hours = Deletion</span></li>
                <li className="flex items-start"><Sparkles className="w-4 h-4 mr-2 mt-1" /> <span><strong>Trust Policy:</strong> Keep link always active</span></li>
                <li className="flex items-start"><Sparkles className="w-4 h-4 mr-2 mt-1" /> <span><strong>Quality:</strong> Authentic channels only - no fake accounts</span></li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="text-lg font-medium">Channel Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Premium Instagram Reels Bundle"
                    className="mt-2 py-6 text-lg"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="platform" className="text-lg font-medium">Platform *</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}>
                    <SelectTrigger className="mt-2 py-6 text-lg">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((plat) => (
                        <SelectItem key={plat.id} value={plat.id}>
                          {plat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-lg font-medium">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="mt-2 py-6 text-lg">
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

                <div>
                  <Label htmlFor="niche" className="text-lg font-medium">Niche *</Label>
                  <Select value={formData.niche} onValueChange={(value) => setFormData(prev => ({ ...prev, niche: value }))}>
                    <SelectTrigger className="mt-2 py-6 text-lg">
                      <SelectValue placeholder="Select niche" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-lg font-medium">Channel Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your channel, audience, content strategy..."
                  rows={6}
                  className="mt-2 text-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="price" className="text-lg font-medium">Selling Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="999"
                    className="mt-2 py-6 text-lg"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="fakePrice" className="text-lg font-medium">Original Price (₹)</Label>
                  <Input
                    id="fakePrice"
                    type="number"
                    value={formData.fakePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, fakePrice: e.target.value }))}
                    placeholder="1999"
                    className="mt-2 py-6 text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="followerCount" className="text-lg font-medium">Follower Count</Label>
                  <Input
                    id="followerCount"
                    type="number"
                    value={formData.followerCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, followerCount: e.target.value }))}
                    placeholder="e.g., 10000"
                    className="mt-2 py-6 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="engagementRate" className="text-lg font-medium">Engagement Rate (%)</Label>
                  <Input
                    id="engagementRate"
                    type="number"
                    value={formData.engagementRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, engagementRate: e.target.value }))}
                    placeholder="e.g., 5.2"
                    className="mt-2 py-6 text-lg"
                    step="0.1"
                  />
                </div>

                <div>
                  <Label htmlFor="monetization" className="text-lg font-medium">Monetized? *</Label>
                  <Select value={formData.monetization} onValueChange={(value) => setFormData(prev => ({ ...prev, monetization: value }))}>
                    <SelectTrigger className="mt-2 py-6 text-lg">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail" className="text-lg font-medium">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="mt-2 py-6 text-lg"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-md">
                <Label htmlFor="channelLink" className="text-lg font-medium text-yellow-800">
                  🔗 Channel Link * (Admin Review Only)
                </Label>
                <Input
                  id="channelLink"
                  type="url"
                  value={formData.channelLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, channelLink: e.target.value }))}
                  placeholder="https://instagram.com/yourchannel"
                  className="mt-2 py-6 text-lg border-yellow-300 focus:border-yellow-500"
                  required
                />
                <p className="text-sm text-yellow-700 mt-2">
                  This link is for admin verification only. Ensure it's valid and accessible!
                </p>
              </div>

              <div>
                <Label htmlFor="tags" className="text-lg font-medium">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="instagram, reels, growth, social media"
                  className="mt-2 py-6 text-lg"
                />
              </div>

              <div>
                <Label htmlFor="targetAudience" className="text-lg font-medium">Target Audience (one per line)</Label>
                <Textarea
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="Young professionals&#10;Fashion enthusiasts&#10;Business owners"
                  rows={4}
                  className="mt-2 text-lg"
                />
              </div>

              <div>
                <Label htmlFor="contentType" className="text-lg font-medium">Content Types (one per line)</Label>
                <Textarea
                  id="contentType"
                  value={formData.contentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
                  placeholder="Short reels&#10;Stories&#10;Posts"
                  rows={4}
                  className="mt-2 text-lg"
                />
              </div>

              <div>
                <Label htmlFor="analytics" className="text-lg font-medium">Analytics/Stats (one per line)</Label>
                <Textarea
                  id="analytics"
                  value={formData.analytics}
                  onChange={(e) => setFormData(prev => ({ ...prev, analytics: e.target.value }))}
                  placeholder="Avg views: 10k&#10;Avg likes: 500&#10;Growth rate: 15%/month"
                  rows={4}
                  className="mt-2 text-lg"
                />
              </div>

              <div className="flex justify-between items-center pt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/dashboard")}
                  className="px-8 py-4 text-lg rounded-full"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? "Listing Channel..." : "List Channel Now"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
