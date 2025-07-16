import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { QRCodeComponent } from "@/components/qr-code";
import { ref, onValue, set, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Edit3, 
  Camera,
  Trophy,
  Star,
  Users,
  Wallet,
  Share2,
  Copy,
  DollarSign,
  TrendingUp,
  QrCode,
  MessageCircle,
  Smartphone,
  Globe,
  IndianRupee,
  Plus,
  Eye,
  Heart,
  ShoppingCart,
  CreditCard,
  Download,
  LogOut
} from "lucide-react";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    bio: "Course creator and learner",
    photoURL: user?.photoURL || "",
    joinDate: new Date().toLocaleDateString(),
    referralCode: `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    walletBalance: 0,
    totalEarnings: 0,
    totalReferrals: 0,
    myCourses: 0,
    coursesCompleted: 0,
    totalSales: 0,
    todayEarnings: 0,
    monthlyEarnings: 0,
  });

  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    thisMonth: 0,
    todaySignups: 0,
    totalCommission: 0,
    pendingCommission: 0,
    paidCommission: 0,
  });

  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    pendingCourses: 0,
    totalSales: 0,
    totalEarnings: 0,
    totalViews: 0,
    totalLikes: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");

  // Crash prevention
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    // Load user data from Firebase
    const userRef = ref(database, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setProfileData(prev => ({
          ...prev,
          ...userData,
          email: user.email || "",
          displayName: userData.displayName || user.displayName || "",
          photoURL: userData.photoURL || user.photoURL || "",
          joinDate: userData.joinDate || new Date().toLocaleDateString(),
          walletBalance: Number(userData.walletBalance) || 0,
          totalEarnings: Number(userData.totalEarnings) || 0,
          totalReferrals: Number(userData.totalReferrals) || 0,
          myCourses: Number(userData.myCourses) || 0,
          coursesCompleted: Number(userData.coursesCompleted) || 0,
          totalSales: Number(userData.totalSales) || 0,
          todayEarnings: Number(userData.todayEarnings) || 0,
          monthlyEarnings: Number(userData.monthlyEarnings) || 0,
        }));
      }
    });

    return () => unsubscribe();
  }, [user, setLocation]);

  const referralUrl = `https://coursemarket.web.app/signup?ref=${profileData.referralCode}`;

  const copyToClipboard = (text: string, index: number) => {
    try {
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } else {
        navigator.clipboard.writeText(text);
      }
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(-1), 2000);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      console.error("Copy error:", error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareOnWhatsApp = (url: string) => {
    try {
      const message = encodeURIComponent(
        `🎓 Join this amazing course platform and start learning today! Use my referral link to get special benefits: ${url}`
      );
      window.open(`https://wa.me/?text=${message}`, "_blank");
    } catch (error) {
      console.error("WhatsApp share error:", error);
      toast({
        title: "Error",
        description: "Failed to share on WhatsApp",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!profileData.displayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    try {
      await update(ref(database, `users/${user.uid}`), {
        displayName: profileData.displayName.trim(),
        bio: profileData.bio.trim(),
        updatedAt: new Date().toISOString(),
      });

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawAmount || !upiId) {
      toast({
        title: "Missing Information",
        description: "Please enter withdrawal amount and UPI ID",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > profileData.walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds wallet balance",
        variant: "destructive",
      });
      return;
    }

    if (amount < 100) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is ₹100",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create withdrawal request
      const withdrawalRef = ref(database, `withdrawals/${user.uid}_${Date.now()}`);
      await set(withdrawalRef, {
        userId: user.uid,
        userName: profileData.displayName || "Unknown",
        userEmail: profileData.email || "unknown@email.com",
        amount: amount,
        upiId: upiId.trim(),
        status: "pending",
        requestedAt: new Date().toISOString(),
        totalReferrals: profileData.totalReferrals || 0,
      });

      // Update wallet balance
      await update(ref(database, `users/${user.uid}`), {
        walletBalance: Math.max(0, profileData.walletBalance - amount),
        lastWithdrawal: new Date().toISOString(),
      });

      setWithdrawAmount("");
      setUpiId("");
      toast({
        title: "Withdrawal Requested",
        description: `₹${amount} withdrawal request submitted successfully`,
      });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={profileData.photoURL} alt={profileData.displayName} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-2xl">
                      {profileData.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => setIsEditing(true)}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        value={profileData.displayName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="text-2xl font-bold"
                        placeholder="Enter your name"
                      />
                      <Input
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile}>Save</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-bold text-gray-800">{profileData.displayName}</h1>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-2">{profileData.bio}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {profileData.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {profileData.joinDate || new Date().toLocaleDateString()}
                        </div>
                        {profileData.bestSeller && (
                          <div className="flex items-center gap-1">
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                              🏆 Best Seller
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Wallet Balance</p>
                    <p className="text-3xl font-bold">₹{profileData.walletBalance}</p>
                  </div>
                  <Wallet className="w-8 h-8 text-green-100" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Earnings</p>
                    <p className="text-3xl font-bold">₹{profileData.totalEarnings}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-100" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Referrals</p>
                    <p className="text-3xl font-bold">{profileData.totalReferrals}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-100" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">My Courses</p>
                    <p className="text-3xl font-bold">{profileData.myCourses}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-orange-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="referral">Referral System</TabsTrigger>
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.displayName}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profileData.bio}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referralCode">Your Referral Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="referralCode"
                        value={profileData.referralCode}
                        disabled
                        className="bg-gray-50"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(profileData.referralCode, 0)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Referral Tab */}
            <TabsContent value="referral" className="space-y-6">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Referral System</CardTitle>
                  <CardDescription>Share your referral link and earn commissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Your Referral Link</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={referralUrl}
                        disabled
                        className="flex-1 bg-white"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(referralUrl, 1)}
                        >
                          {copiedIndex === 1 ? <span className="text-green-600">✓</span> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setShowQR(!showQR)}
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {showQR && (
                      <div className="mt-4 text-center">
                        <QRCodeComponent value={referralUrl} size={200} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => shareOnWhatsApp(referralUrl)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Share on WhatsApp
                    </Button>
                    <Button
                      onClick={() => window.open(`https://t.me/share/url?url=${referralUrl}`, "_blank")}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Share on Telegram
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-green-100 text-sm">Total Referrals</p>
                          <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-blue-100 text-sm">This Month</p>
                          <p className="text-2xl font-bold">{referralStats.thisMonth}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-purple-100 text-sm">Today</p>
                          <p className="text-2xl font-bold">{referralStats.todaySignups}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>Manage your courses and track performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => setLocation("/create-course")}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Course
                    </Button>
                    <Button
                      onClick={() => setLocation("/my-courses")}
                      variant="outline"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      View All Courses
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-blue-100 text-sm">Total Courses</p>
                          <p className="text-2xl font-bold">{courseStats.totalCourses}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-green-100 text-sm">Active</p>
                          <p className="text-2xl font-bold">{courseStats.activeCourses}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-orange-100 text-sm">Sales</p>
                          <p className="text-2xl font-bold">{courseStats.totalSales}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-purple-100 text-sm">Earnings</p>
                          <p className="text-2xl font-bold">₹{courseStats.totalEarnings}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="space-y-6">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Wallet & Withdrawals</CardTitle>
                  <CardDescription>Manage your earnings and withdrawal requests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-green-100 text-sm">Current Balance</p>
                          <p className="text-2xl font-bold">₹{profileData.walletBalance}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-blue-100 text-sm">Today's Earnings</p>
                          <p className="text-2xl font-bold">₹{profileData.todayEarnings}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-purple-100 text-sm">Monthly Earnings</p>
                          <p className="text-2xl font-bold">₹{profileData.monthlyEarnings}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
                    <CardHeader>
                      <CardTitle className="text-lg">Request Withdrawal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="amount">Withdrawal Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Enter amount"
                            max={profileData.walletBalance}
                          />
                        </div>
                        <div>
                          <Label htmlFor="upi">UPI ID</Label>
                          <Input
                            id="upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="Enter UPI ID"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleWithdraw}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        disabled={!withdrawAmount || !upiId || parseFloat(withdrawAmount) > profileData.walletBalance}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Request Withdrawal
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}