import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Star, Shield, DollarSign, Users, Play, Heart, Camera } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const channelSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  serviceUrl: z.string().url("Please enter a valid URL"),
  serviceDescription: z.string().min(10, "Description must be at least 10 characters"),
  serviceTitle: z.string().min(1, "Service title is required"),
  serviceName: z.string().min(1, "Service type is required"),
  followerCount: z.number().min(0, "Follower count must be positive"),
  category: z.string().min(1, "Category is required"),
  monetizationStatus: z.string().min(1, "Monetization status is required"),
  reputation: z.string().min(1, "Reputation is required"),
  trustedLevel: z.number().min(1).max(5, "Trusted level must be between 1-5"),
  screenshots: z.array(z.string()).max(5, "Maximum 5 screenshots allowed"),
  realPrice: z.number().min(1, "Price must be greater than 0"),
  marketingPrice: z.number().optional(),
  thumbnail: z.string().optional()
});

type ChannelFormData = z.infer<typeof channelSchema>;

const serviceTypes = [
  { value: "youtube", label: "YouTube", icon: "🔴" },
  { value: "instagram", label: "Instagram", icon: "📷" },
  { value: "facebook", label: "Facebook", icon: "📘" },
  { value: "telegram", label: "Telegram", icon: "📨" },
  { value: "reels", label: "Reels Bundle", icon: "🎬" },
  { value: "video", label: "Video Content", icon: "🎥" },
  { value: "tools", label: "Tools & Services", icon: "🔧" },
  { value: "other", label: "Other", icon: "⭐" }
];

const categories = [
  "Technology", "Cooking", "Reviews", "Fun & Entertainment", "Gaming", 
  "Education", "Music", "Sports", "Travel", "Fashion", "Health & Fitness",
  "Business", "News", "Comedy", "DIY", "Beauty", "Photography", "Art",
  "Science", "History", "Other"
];

const reputationLevels = [
  { value: "excellent", label: "Excellent", color: "bg-green-500" },
  { value: "good", label: "Good", color: "bg-blue-500" },
  { value: "average", label: "Average", color: "bg-yellow-500" },
  { value: "2-strike", label: "2 Strikes", color: "bg-orange-500" },
  { value: "3-strike", label: "3 Strikes", color: "bg-red-500" }
];

// Category-based default thumbnails
const categoryThumbnails: Record<string, string> = {
  "Technology": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
  "Cooking": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
  "Reviews": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
  "Gaming": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
  "Music": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
  "Education": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop"
};

export default function ChannelCreationModern() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      trustedLevel: 1,
      screenshots: [],
      marketingPrice: 0
    }
  });

  const createChannelMutation = useMutation({
    mutationFn: (data: ChannelFormData) => apiRequest("/api/channels", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        sellerId: user?.id,
        seller: user?.displayName || user?.email,
        platform: data.serviceName,
        title: data.serviceTitle,
        description: data.serviceDescription,
        price: data.realPrice,
        fakePrice: data.marketingPrice || null,
        category: data.category,
        followerCount: data.followerCount,
        thumbnail: data.thumbnail || categoryThumbnails[data.category] || categoryThumbnails["Technology"]
      })
    }),
    onSuccess: () => {
      toast({
        title: "Channel Submitted Successfully!",
        description: "Your channel is now pending admin approval.",
      });
      form.reset();
      setScreenshots([]);
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
    try {
      setIsSubmitting(true);
      
      // Auto-generate marketing price if not provided
      if (!data.marketingPrice || data.marketingPrice === 0) {
        data.marketingPrice = Math.round(data.realPrice * 2); // Auto double the price
      }

      await createChannelMutation.mutateAsync(data);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 500000) { // 500KB limit
        toast({
          title: "File too large",
          description: "Screenshots must be under 500KB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setScreenshots(prev => [...prev.slice(0, 4), result]); // Max 5 screenshots
      };
      reader.readAsDataURL(file);
    });
  };

  const selectedService = serviceTypes.find(s => s.value === form.watch("serviceName"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Channel Promotion Platform
          </h1>
          <p className="text-gray-600 text-lg">Submit your channel for promotion and tracking</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="w-6 h-6" />
              Create Channel Listing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                    <Play className="w-4 h-4" /> Channel Name
                  </Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter your channel name"
                    className="h-12 border-2 focus:border-purple-500"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceUrl" className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Service URL
                  </Label>
                  <Input
                    id="serviceUrl"
                    {...form.register("serviceUrl")}
                    placeholder="https://youtube.com/channel/..."
                    className="h-12 border-2 focus:border-purple-500"
                  />
                  {form.formState.errors.serviceUrl && (
                    <p className="text-red-500 text-sm">{form.formState.errors.serviceUrl.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceTitle" className="text-sm font-semibold">Service Title</Label>
                <Input
                  id="serviceTitle"
                  {...form.register("serviceTitle")}
                  placeholder="Catchy title for your service"
                  className="h-12 border-2 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceDescription" className="text-sm font-semibold">Service Description</Label>
                <Textarea
                  id="serviceDescription"
                  {...form.register("serviceDescription")}
                  placeholder="Describe your service in detail..."
                  className="min-h-[120px] border-2 focus:border-purple-500 resize-none"
                />
              </div>

              {/* Service Type & Category */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Service Type</Label>
                  <Select value={form.watch("serviceName")} onValueChange={(value) => form.setValue("serviceName", value)}>
                    <SelectTrigger className="h-12 border-2">
                      <SelectValue placeholder="Select service type">
                        {selectedService && (
                          <div className="flex items-center gap-2">
                            <span>{selectedService.icon}</span>
                            <span>{selectedService.label}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          <div className="flex items-center gap-2">
                            <span>{service.icon}</span>
                            <span>{service.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Category</Label>
                  <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                    <SelectTrigger className="h-12 border-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Followers & Metrics */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="followerCount" className="text-sm font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {form.watch("serviceName") === "youtube" ? "Subscribers" : "Followers"}
                  </Label>
                  <Input
                    id="followerCount"
                    type="number"
                    {...form.register("followerCount", { valueAsNumber: true })}
                    placeholder="0"
                    className="h-12 border-2 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Monetization Status</Label>
                  <Select value={form.watch("monetizationStatus")} onValueChange={(value) => form.setValue("monetizationStatus", value)}>
                    <SelectTrigger className="h-12 border-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monetized">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          Monetized
                        </div>
                      </SelectItem>
                      <SelectItem value="not-monetized">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          Not Monetized
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Reputation</Label>
                  <Select value={form.watch("reputation")} onValueChange={(value) => form.setValue("reputation", value)}>
                    <SelectTrigger className="h-12 border-2">
                      <SelectValue placeholder="Select reputation" />
                    </SelectTrigger>
                    <SelectContent>
                      {reputationLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${level.color}`} />
                            {level.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Trust Level & Screenshots */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Trusted Level (1-5)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={form.watch("trustedLevel") >= level ? "default" : "outline"}
                        size="sm"
                        onClick={() => form.setValue("trustedLevel", level)}
                        className="w-12 h-12"
                      >
                        <Star className={`w-4 h-4 ${form.watch("trustedLevel") >= level ? "fill-current" : ""}`} />
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Screenshots (Max 5, Under 500KB each)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleScreenshotUpload}
                      className="hidden"
                      id="screenshots"
                    />
                    <Label htmlFor="screenshots" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload screenshots</p>
                    </Label>
                  </div>
                  {screenshots.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {screenshots.map((screenshot, index) => (
                        <img
                          key={index}
                          src={screenshot}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="realPrice" className="text-sm font-semibold text-green-600">
                    Real Price (₹)
                  </Label>
                  <Input
                    id="realPrice"
                    type="number"
                    {...form.register("realPrice", { valueAsNumber: true })}
                    placeholder="199"
                    className="h-12 border-2 focus:border-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketingPrice" className="text-sm font-semibold text-blue-600">
                    Marketing Price (₹) - Optional
                  </Label>
                  <Input
                    id="marketingPrice"
                    type="number"
                    {...form.register("marketingPrice", { valueAsNumber: true })}
                    placeholder="399 (Auto-filled if empty)"
                    className="h-12 border-2 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">Leave empty for auto-pricing (2x real price)</p>
                </div>
              </div>

              {/* Custom Thumbnail URL */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-sm font-semibold">Custom Thumbnail URL (Optional)</Label>
                <Input
                  id="thumbnail"
                  {...form.register("thumbnail")}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="h-12 border-2 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500">Leave empty to use category-based default thumbnail</p>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Submitting for Approval...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Submit for Approval
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}