import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Youtube, Instagram, Facebook, Send, Play, Settings, Star, 
  Upload, DollarSign, Shield, Award, AlertTriangle, CheckCircle,
  Image, Users, Eye, TrendingUp, Crown, Zap
} from "lucide-react";

const channelSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  serviceUrl: z.string().url("Please enter a valid URL"),
  serviceDescription: z.string().min(20, "Description must be at least 20 characters"),
  serviceTitle: z.string().min(5, "Title must be at least 5 characters"),
  serviceName: z.string().min(1, "Please select a service type"),
  followers: z.number().min(100, "Minimum 100 followers/subscribers required"),
  category: z.string().min(1, "Please select a category"),
  customCategory: z.string().optional(),
  monetizationStatus: z.string().min(1, "Please select monetization status"),
  reputation: z.string().min(1, "Please select reputation status"),
  trustedLevel: z.number().min(1).max(5, "Trusted level must be between 1-5"),
  thumbnailUrl: z.string().url().optional(),
  thumbnailFile: z.any().optional(),
  realPrice: z.number().min(100, "Minimum price is ₹100"),
  marketingPrice: z.number().optional(),
});

type ChannelFormData = z.infer<typeof channelSchema>;

const serviceTypes = [
  { value: "youtube", label: "YouTube", icon: <Youtube className="w-5 h-5 text-red-500" />, metric: "Subscribers" },
  { value: "instagram", label: "Instagram", icon: <Instagram className="w-5 h-5 text-pink-500" />, metric: "Followers" },
  { value: "facebook", label: "Facebook", icon: <Facebook className="w-5 h-5 text-blue-600" />, metric: "Followers" },
  { value: "telegram", label: "Telegram", icon: <Send className="w-5 h-5 text-blue-500" />, metric: "Members" },
  { value: "reels", label: "Reels Bundle", icon: <Play className="w-5 h-5 text-purple-500" />, metric: "Followers" },
  { value: "video", label: "Video Channel", icon: <Play className="w-5 h-5 text-green-500" />, metric: "Subscribers" },
  { value: "tools", label: "Tools/Software", icon: <Settings className="w-5 h-5 text-gray-600" />, metric: "Users" },
  { value: "other", label: "Other", icon: <Star className="w-5 h-5 text-yellow-500" />, metric: "Followers" }
];

const categories = [
  "Technology", "Cooking", "Review", "Fun & Entertainment", "Gaming", 
  "Education", "Music", "Sports", "Travel", "Fashion", "Health & Fitness", 
  "Business", "News", "Comedy", "DIY", "Beauty", "Photography", "Art", 
  "Science", "History", "Finance", "Motivation", "Lifestyle", "Other"
];

const monetizationOptions = [
  { value: "monetized", label: "Monetized", icon: <DollarSign className="w-4 h-4 text-green-600" /> },
  { value: "non-monetized", label: "Not Monetized", icon: <AlertTriangle className="w-4 h-4 text-red-500" /> }
];

const reputationOptions = [
  { value: "excellent", label: "Excellent", icon: <Crown className="w-4 h-4 text-gold" /> },
  { value: "good", label: "Good", icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
  { value: "average", label: "Average", icon: <Shield className="w-4 h-4 text-blue-500" /> },
  { value: "1-strike", label: "1 Strike", icon: <AlertTriangle className="w-4 h-4 text-yellow-500" /> },
  { value: "2-strikes", label: "2 Strikes", icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> },
  { value: "3-strikes", label: "3 Strikes", icon: <AlertTriangle className="w-4 h-4 text-red-600" /> }
];

// Auto thumbnail fetch by category
const getCategoryThumbnail = (category: string) => {
  const categoryThumbnails: Record<string, string> = {
    "Technology": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    "Cooking": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    "Review": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
    "Gaming": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    "Education": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    "Music": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
    "Travel": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
    "Fashion": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop",
    "Business": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
  };
  return categoryThumbnails[category] || "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop";
};

export default function EnhancedChannelSubmission() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      trustedLevel: 3,
      reputation: "good"
    }
  });

  const selectedService = serviceTypes.find(s => s.value === form.watch("serviceName"));
  const selectedCategory = form.watch("category");
  const realPrice = form.watch("realPrice");

  // Auto-generate marketing price
  const handleRealPriceChange = (price: number) => {
    if (price && price > 0) {
      const marketingPrice = Math.round(price * 1.5); // 50% higher for marketing
      form.setValue("marketingPrice", marketingPrice);
    }
  };

  // Handle thumbnail file upload
  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit
        toast({
          title: "File too large",
          description: "Thumbnail must be under 500KB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("thumbnailFile", file);
    }
  };

  // Auto thumbnail by category
  const handleCategoryChange = (category: string) => {
    form.setValue("category", category);
    if (!form.watch("thumbnailUrl") && !thumbnailPreview) {
      const autoThumbnail = getCategoryThumbnail(category);
      setThumbnailPreview(autoThumbnail);
      form.setValue("thumbnailUrl", autoThumbnail);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data: ChannelFormData) => {
      const payload = {
        title: data.serviceTitle,
        description: data.serviceDescription,
        price: data.realPrice,
        fakePrice: data.marketingPrice,
        category: data.category === "Other" ? data.customCategory : data.category,
        thumbnail: data.thumbnailUrl || getCategoryThumbnail(data.category),
        platform: data.serviceName,
        followerCount: data.followers,
        monetizationStatus: data.monetizationStatus,
        reputation: data.reputation,
        trustedLevel: data.trustedLevel,
        serviceUrl: data.serviceUrl,
        seller: user?.displayName || user?.email || "Anonymous"
      };
      
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit channel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Channel Submitted Successfully!",
        description: "Your channel is now pending admin approval.",
      });
      form.reset();
      setThumbnailPreview(null);
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (data: ChannelFormData) => {
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600">Please login to submit your channel</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Channel Submission Portal
          </h1>
          <p className="text-gray-600 text-lg">Submit your channel for approval and start earning</p>
          <div className="flex justify-center items-center gap-2 mt-4">
            <Badge className="bg-green-100 text-green-800">
              <Zap className="w-3 h-3 mr-1" />
              Real-time Processing
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              <Shield className="w-3 h-3 mr-1" />
              Secure Submission
            </Badge>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Channel Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Channel/Service Name *
                  </Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter your channel name"
                    className="h-12"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Service URL */}
                <div className="space-y-2">
                  <Label htmlFor="serviceUrl" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Service URL *
                  </Label>
                  <Input
                    id="serviceUrl"
                    {...form.register("serviceUrl")}
                    placeholder="https://youtube.com/@yourchannel"
                    className="h-12"
                  />
                  {form.formState.errors.serviceUrl && (
                    <p className="text-red-500 text-sm">{form.formState.errors.serviceUrl.message}</p>
                  )}
                </div>

                {/* Service Title */}
                <div className="space-y-2">
                  <Label htmlFor="serviceTitle">Service Title *</Label>
                  <Input
                    id="serviceTitle"
                    {...form.register("serviceTitle")}
                    placeholder="Attractive title for your service"
                    className="h-12"
                  />
                  {form.formState.errors.serviceTitle && (
                    <p className="text-red-500 text-sm">{form.formState.errors.serviceTitle.message}</p>
                  )}
                </div>

                {/* Service Description */}
                <div className="space-y-2">
                  <Label htmlFor="serviceDescription">Service Description *</Label>
                  <Textarea
                    id="serviceDescription"
                    {...form.register("serviceDescription")}
                    placeholder="Detailed description of your service/channel..."
                    className="min-h-32"
                  />
                  {form.formState.errors.serviceDescription && (
                    <p className="text-red-500 text-sm">{form.formState.errors.serviceDescription.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Service Details */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Type */}
                <div className="space-y-2">
                  <Label>Service Type *</Label>
                  <Select value={form.watch("serviceName")} onValueChange={(value) => form.setValue("serviceName", value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select service type">
                        {selectedService && (
                          <div className="flex items-center gap-2">
                            {selectedService.icon}
                            <span>{selectedService.label}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          <div className="flex items-center gap-2">
                            {service.icon}
                            <span>{service.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Followers/Subscribers */}
                <div className="space-y-2">
                  <Label htmlFor="followers" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {selectedService?.metric || "Followers"} Count *
                  </Label>
                  <Input
                    id="followers"
                    type="number"
                    {...form.register("followers", { valueAsNumber: true })}
                    placeholder={`Enter ${selectedService?.metric.toLowerCase() || "followers"} count`}
                    className="h-12"
                  />
                  {form.formState.errors.followers && (
                    <p className="text-red-500 text-sm">{form.formState.errors.followers.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedCategory === "Other" && (
                    <Input
                      {...form.register("customCategory")}
                      placeholder="Enter custom category"
                      className="mt-2 h-12"
                    />
                  )}
                </div>

                {/* Monetization Status */}
                <div className="space-y-2">
                  <Label>Monetization Status *</Label>
                  <Select value={form.watch("monetizationStatus")} onValueChange={(value) => form.setValue("monetizationStatus", value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select monetization status" />
                    </SelectTrigger>
                    <SelectContent>
                      {monetizationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section - Advanced Settings */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-500" />
                Advanced Settings & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Reputation */}
                <div className="space-y-2">
                  <Label>Reputation Status *</Label>
                  <Select value={form.watch("reputation")} onValueChange={(value) => form.setValue("reputation", value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select reputation" />
                    </SelectTrigger>
                    <SelectContent>
                      {reputationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trusted Level */}
                <div className="space-y-2">
                  <Label htmlFor="trustedLevel">Trusted Level (1-5) *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="trustedLevel"
                      type="number"
                      min="1"
                      max="5"
                      {...form.register("trustedLevel", { valueAsNumber: true })}
                      className="h-12"
                    />
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (form.watch("trustedLevel") || 0) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real Price */}
                <div className="space-y-2">
                  <Label htmlFor="realPrice" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Real Price (₹) *
                  </Label>
                  <Input
                    id="realPrice"
                    type="number"
                    {...form.register("realPrice", { 
                      valueAsNumber: true,
                      onChange: (e) => handleRealPriceChange(parseInt(e.target.value))
                    })}
                    placeholder="Enter your price"
                    className="h-12"
                  />
                  {form.formState.errors.realPrice && (
                    <p className="text-red-500 text-sm">{form.formState.errors.realPrice.message}</p>
                  )}
                </div>
              </div>

              {/* Marketing Price Auto-Generated */}
              {form.watch("marketingPrice") && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Auto-Generated Marketing Price:</span>
                    <Badge className="bg-green-600 text-white">₹{form.watch("marketingPrice")?.toLocaleString()}</Badge>
                  </div>
                  <p className="text-green-700 text-sm mt-1">This creates attractive discount appeal for buyers</p>
                </div>
              )}

              {/* Thumbnail Section */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Thumbnail (Optional - Auto-fetched by category)
                </Label>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                    <Input
                      id="thumbnailUrl"
                      {...form.register("thumbnailUrl")}
                      placeholder="https://your-thumbnail-url.jpg"
                      className="h-12"
                      onChange={(e) => {
                        if (e.target.value) {
                          setThumbnailPreview(e.target.value);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnailFile">Or Upload File (Max 500KB)</Label>
                    <Input
                      id="thumbnailFile"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Thumbnail Preview */}
                {(thumbnailPreview || (selectedCategory && !form.watch("thumbnailUrl"))) && (
                  <div className="mt-4">
                    <Label className="mb-2 block">Thumbnail Preview:</Label>
                    <div className="w-full max-w-md">
                      <img
                        src={thumbnailPreview || getCategoryThumbnail(selectedCategory)}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || submitMutation.isPending}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting for Approval...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Submit for Approval
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}