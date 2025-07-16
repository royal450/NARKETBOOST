import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, ArrowLeft, Info, Rocket } from "lucide-react";

export default function Promotion() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseTitle: "",
    description: "",
    price: "",
    category: "",
    creatorName: "",
    email: "",
    whatsapp: "",
  });

  const categories = [
    "YouTube Growth",
    "Instagram Growth", 
    "Marketing",
    "Self Respect",
    "Love",
    "ChatGPT Expert",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format WhatsApp message for promotion submission
      const message = encodeURIComponent(
        `🚀 Course Promotion Request\n\n` +
        `Course: ${formData.courseTitle}\n` +
        `Category: ${formData.category}\n` +
        `Price: ₹${formData.price}\n` +
        `Creator: ${formData.creatorName}\n` +
        `Email: ${formData.email}\n` +
        `WhatsApp: ${formData.whatsapp}\n\n` +
        `Description:\n${formData.description}\n\n` +
        `Promotion Fee: ₹99\n` +
        `Platform Fee: 30% commission (You keep 70%)\n\n` +
        `Please review and approve this course for promotion.`
      );

      // Redirect to WhatsApp
      const whatsappNumber = "919104037184"; // Replace with actual number
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');

      toast({
        title: "Promotion Request Submitted!",
        description: "Our team will review your course and contact you within 24-48 hours.",
      });

      // Reset form
      setFormData({
        courseTitle: "",
        description: "",
        price: "",
        category: "",
        creatorName: "",
        email: "",
        whatsapp: "",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Promote Your Course</h1>
          <p className="text-gray-600 mt-2">Get featured on our platform - You keep 70% revenue</p>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Info className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-800">Platform Fee Structure</p>
                  <p className="text-sm text-yellow-700 mt-1">• One-time promotion fee: ₹99</p>
                  <p className="text-sm text-yellow-700">• Platform commission: 30% per sale</p>
                  <p className="text-sm text-yellow-600">• You keep 70% of each sale (handling, payment, server costs covered)</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </Label>
                <Input
                  id="courseTitle"
                  type="text"
                  value={formData.courseTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseTitle: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your course title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe your course content and benefits"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Course Price (₹) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="1999"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                      <SelectValue placeholder="Select Category" />
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
              
              <div>
                <Label htmlFor="creatorName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </Label>
                <Input
                  id="creatorName"
                  type="text"
                  value={formData.creatorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, creatorName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number *
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Revenue Structure</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• One-time promotion fee: ₹99 + 30% commission</li>
                  <li>• You earn 70% on each course sale</li>
                  <li>• Platform takes 30% (handling, payment processing, server costs)</li>
                  <li>• Monthly revenue payouts to your account</li>
                  <li>• Full payment and delivery support included</li>
                  <li>• Commission structure: 30% on all sales</li>
                </ul>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-yellow-500 text-white py-4 rounded-lg font-semibold hover:bg-yellow-600 transition duration-200"
              >
                <Rocket className="mr-2 h-4 w-4" />
                {loading ? "Submitting..." : "Submit Course for Promotion - ₹99"}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                After submission, our team will review your course and contact you within 24-48 hours.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
