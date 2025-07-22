import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, Users, DollarSign, Star, Eye, ThumbsUp, MessageCircle, 
  Check, X, Edit, Trash2, Crown, Gift, Ban, Settings, Upload,
  TrendingUp, Activity, Award, AlertTriangle, ChevronDown, ChevronUp
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  approvedCourses: number;
  pendingCourses: number;
  rejectedCourses: number;
  totalSales: number;
  totalRevenue: number;
  avgRating: number;
}

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
  createdAt: Date;
}

interface User {
  id: number;
  email: string;
  displayName?: string;
  walletBalance: number;
  totalEarnings: number;
  totalReferrals: number;
  isActive: boolean;
  referralCode?: string;
}

export default function FullFeaturedAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Authentication
  const handleLogin = () => {
    if (password === "admin123") {
      setIsAuthenticated(true);
      toast({ title: "Admin Access Granted", description: "Welcome to the admin panel!" });
    } else {
      toast({ title: "Access Denied", description: "Invalid password", variant: "destructive" });
    }
  };

  // Data Fetching
  const { data: adminStats, refetch: refetchStats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated
  });

  const { data: pendingChannels = [], refetch: refetchPending } = useQuery<Channel[]>({
    queryKey: ['/api/admin/channels/pending'],
    enabled: isAuthenticated
  });

  const { data: allChannels = [], refetch: refetchAll } = useQuery<Channel[]>({
    queryKey: ['/api/admin/channels'],
    enabled: isAuthenticated
  });

  const { data: allUsers = [], refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated
  });

  // Channel Management Mutations
  const approveChannelMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/channels/${id}/approve`, { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "Channel Approved", description: "Channel is now live!" });
      refetchPending();
      refetchAll();
      refetchStats();
    }
  });

  const rejectChannelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      apiRequest(`/api/admin/channels/${id}/reject`, { 
        method: 'POST', 
        body: JSON.stringify({ reason }) 
      }),
    onSuccess: () => {
      toast({ title: "Channel Rejected", description: "Rejection reason sent to user." });
      refetchPending();
      refetchAll();
    }
  });

  const blockChannelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      apiRequest(`/api/admin/channels/${id}/block`, { 
        method: 'POST', 
        body: JSON.stringify({ reason }) 
      }),
    onSuccess: () => {
      toast({ title: "Channel Blocked", description: "Channel has been blocked." });
      refetchAll();
    }
  });

  const deleteChannelMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/channels/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Channel Deleted", description: "Channel permanently removed." });
      refetchAll();
      refetchPending();
    }
  });

  const updateChannelMutation = useMutation({
    mutationFn: (channel: Partial<Channel>) => 
      apiRequest(`/api/admin/channels/${channel.id}`, { 
        method: 'PATCH', 
        body: JSON.stringify(channel) 
      }),
    onSuccess: () => {
      toast({ title: "Channel Updated", description: "Changes saved successfully." });
      refetchAll();
      setEditingChannel(null);
    }
  });

  // User Management Mutations
  const giveBonusMutation = useMutation({
    mutationFn: ({ userId, amount }: { userId: number; amount: number }) => 
      apiRequest(`/api/admin/users/${userId}/bonus`, { 
        method: 'POST', 
        body: JSON.stringify({ amount }) 
      }),
    onSuccess: () => {
      toast({ title: "Bonus Given", description: `₹${bonusAmount} added to user's wallet.` });
      refetchUsers();
      setBonusAmount(0);
    }
  });

  const blockUserMutation = useMutation({
    mutationFn: (userId: number) => apiRequest(`/api/admin/users/${userId}/block`, { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "User Blocked", description: "User access has been restricted." });
      refetchUsers();
    }
  });

  const giveAdminBadgeMutation = useMutation({
    mutationFn: (userId: number) => apiRequest(`/api/admin/users/${userId}/badge`, { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "Admin Badge Given", description: "User now has admin verification badge." });
      refetchUsers();
    }
  });

  // Utility Functions
  const toggleCardExpansion = (id: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              <Shield className="w-6 h-6" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                placeholder="Enter admin password"
              />
            </div>
            <Button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-700">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Full-Featured Admin Panel
          </h1>
          <p className="text-gray-600">Complete control over your channel promotion platform</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{adminStats?.totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Approved Channels</p>
                  <p className="text-2xl font-bold">{adminStats?.approvedCourses || 0}</p>
                </div>
                <Check className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Pending</p>
                  <p className="text-2xl font-bold">{adminStats?.pendingCourses || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(adminStats?.totalRevenue || 0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="channels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingChannels.length})</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Channel Management */}
          <TabsContent value="channels" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">All Channels</h2>
              <Badge variant="outline">{allChannels.length} Total</Badge>
            </div>

            <div className="grid gap-4">
              {allChannels.map((channel) => (
                <Card key={channel.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <img
                        src={channel.thumbnail || `https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop`}
                        alt={channel.title}
                        className="w-full md:w-48 h-32 object-cover"
                      />
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-semibold">{channel.title}</h3>
                            <p className="text-gray-600">{channel.seller} • {channel.platform}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(channel.status)}>{channel.status}</Badge>
                            {channel.blocked && <Badge variant="destructive">Blocked</Badge>}
                          </div>
                        </div>

                        <div className={`${expandedCards.has(channel.id) ? '' : 'line-clamp-2'} text-gray-700 mb-3`}>
                          {channel.description}
                        </div>

                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {channel.followerCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {channel.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(channel.price)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {channel.sales} sales
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleCardExpansion(channel.id)}
                          >
                            {expandedCards.has(channel.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setEditingChannel(channel)}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Channel</DialogTitle>
                              </DialogHeader>
                              {editingChannel && (
                                <div className="space-y-4">
                                  <div>
                                    <Label>Title</Label>
                                    <Input
                                      value={editingChannel.title}
                                      onChange={(e) => setEditingChannel({...editingChannel, title: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label>Description</Label>
                                    <Textarea
                                      value={editingChannel.description}
                                      onChange={(e) => setEditingChannel({...editingChannel, description: e.target.value})}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Price</Label>
                                      <Input
                                        type="number"
                                        value={editingChannel.price}
                                        onChange={(e) => setEditingChannel({...editingChannel, price: parseInt(e.target.value)})}
                                      />
                                    </div>
                                    <div>
                                      <Label>Fake Price</Label>
                                      <Input
                                        type="number"
                                        value={editingChannel.fakePrice || ''}
                                        onChange={(e) => setEditingChannel({...editingChannel, fakePrice: parseInt(e.target.value) || undefined})}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Thumbnail URL</Label>
                                    <Input
                                      value={editingChannel.thumbnail || ''}
                                      onChange={(e) => setEditingChannel({...editingChannel, thumbnail: e.target.value})}
                                    />
                                  </div>
                                  <Button 
                                    onClick={() => updateChannelMutation.mutate(editingChannel)}
                                    disabled={updateChannelMutation.isPending}
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {!channel.blocked ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600">
                                  <Ban className="w-4 h-4 mr-1" />
                                  Block
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Block Channel</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Label>Block Reason</Label>
                                  <Textarea
                                    placeholder="Enter reason for blocking..."
                                    onChange={(e) => setSelectedChannel({...channel, blockReason: e.target.value})}
                                  />
                                  <Button 
                                    variant="destructive"
                                    onClick={() => selectedChannel && blockChannelMutation.mutate({
                                      id: channel.id, 
                                      reason: selectedChannel.blockReason || ''
                                    })}
                                  >
                                    Block Channel
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => updateChannelMutation.mutate({id: channel.id, blocked: false})}
                            >
                              Unblock
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => deleteChannelMutation.mutate(channel.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>

                          {/* Sold Out Badge Toggle */}
                          <Button
                            size="sm"
                            variant={channel.sales > 100 ? "destructive" : "outline"}
                            onClick={() => updateChannelMutation.mutate({
                              id: channel.id, 
                              blocked: !channel.blocked,
                              blockReason: "Sold Out"
                            })}
                          >
                            {channel.blocked && channel.blockReason === "Sold Out" ? "Remove Sold Out" : "Mark Sold Out"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pending Channels */}
          <TabsContent value="pending" className="space-y-4">
            <h2 className="text-2xl font-bold">Pending Approvals</h2>
            
            <div className="grid gap-4">
              {pendingChannels.map((channel) => (
                <Card key={channel.id} className="border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{channel.title}</h3>
                        <p className="text-gray-600">{channel.seller} • {channel.platform}</p>
                        <Badge className="bg-yellow-500 mt-2">Pending Review</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveChannelMutation.mutate(channel.id)}
                          disabled={approveChannelMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Channel</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Label>Rejection Reason</Label>
                              <Textarea
                                placeholder="Please provide a reason for rejection..."
                                onChange={(e) => setSelectedChannel({...channel, blockReason: e.target.value})}
                              />
                              <Button 
                                variant="destructive"
                                onClick={() => selectedChannel && rejectChannelMutation.mutate({
                                  id: channel.id, 
                                  reason: selectedChannel.blockReason || ''
                                })}
                              >
                                Reject Channel
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{channel.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {channel.followerCount.toLocaleString()} followers
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(channel.price)}
                      </span>
                      <Badge variant="outline">{channel.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-2xl font-bold">User Management</h2>
            
            <div className="grid gap-4">
              {allUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{user.displayName || user.email}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>Balance: {formatCurrency(user.walletBalance)}</span>
                          <span>Earnings: {formatCurrency(user.totalEarnings)}</span>
                          <span>Referrals: {user.totalReferrals}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-green-600">
                              <Gift className="w-4 h-4 mr-1" />
                              Give Bonus
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Give Bonus to {user.displayName || user.email}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Bonus Amount (₹)</Label>
                                <Input
                                  type="number"
                                  value={bonusAmount}
                                  onChange={(e) => setBonusAmount(parseInt(e.target.value))}
                                  placeholder="Enter amount"
                                />
                              </div>
                              <Button 
                                onClick={() => giveBonusMutation.mutate({userId: user.id, amount: bonusAmount})}
                                disabled={giveBonusMutation.isPending}
                                className="w-full"
                              >
                                Give Bonus
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => giveAdminBadgeMutation.mutate(user.id)}
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          Give Badge
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => blockUserMutation.mutate(user.id)}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Block
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Real-time Features Placeholder */}
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Referral System Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Real-time referral tracking and bonus distribution system will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Withdrawal Approval System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Real-time withdrawal processing and approval system will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Commission rates, platform settings, and configuration options will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}