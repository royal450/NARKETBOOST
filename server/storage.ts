import { users, channels, payments, referralBonuses, type User, type InsertUser, type Channel, type InsertChannel, type Payment, type InsertPayment, type ReferralBonus } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(userId: number, amount: number): Promise<void>;
  
  // Course/Channel methods
  getCourses(): Promise<Channel[]>;
  getUserCourses(userId: string): Promise<Channel[]>;
  createCourse(course: any): Promise<Channel>;
  updateCourse(courseId: string, updates: any): Promise<Channel>;
  deleteCourse(courseId: string): Promise<void>;
  
  // Payment methods
  createPayment(payment: any): Promise<Payment>;
  
  // Referral methods
  trackReferral(referrerId: number, referredId: number): Promise<void>;
  getReferralByBuyer(buyerId: number): Promise<ReferralBonus | undefined>;
  
  // Admin methods
  getAdminStats(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<string, Channel>;
  private payments: Map<number, Payment>;
  private referrals: Map<number, ReferralBonus>;
  currentUserId: number;
  currentCourseId: number;
  currentPaymentId: number;
  currentReferralId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.payments = new Map();
    this.referrals = new Map();
    this.currentUserId = 1;
    this.currentCourseId = 1;
    this.currentPaymentId = 1;
    this.currentReferralId = 1;
    
    // Add some sample data for testing
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Add sample services for testing
    const sampleServices: Channel[] = [
      {
        id: 1,
        title: "Monetized YouTube Channel - Tech Reviews",
        description: "Established tech review channel with 250K subscribers, monetized, verified, and earning $2K/month",
        price: 45000,
        fakePrice: 75000,
        discount: 40,
        category: "youtube",
        thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop",
        seller: "TechChannelPro",
        sellerId: 1,
        likes: 125,
        comments: 28,
        sales: 0,
        blocked: false,
        blockReason: null,
        commission: 30,
        status: "active",
        approvalStatus: "approved",
        rejectionReason: null,
        followerCount: 250000,
        engagementRate: 8.5,
        verificationStatus: "verified",
        platform: "youtube",
        createdAt: new Date(),
        approvedAt: new Date(),
        approvedBy: "admin"
      },
      {
        id: 2,
        title: "Instagram Profile - Fashion & Lifestyle",
        description: "Instagram account with 150K followers, high engagement, perfect for fashion brands",
        price: 25000,
        fakePrice: 40000,
        discount: 37,
        category: "instagram",
        thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop",
        seller: "SocialGrowth",
        sellerId: 2,
        likes: 89,
        comments: 15,
        sales: 0,
        blocked: false,
        blockReason: null,
        commission: 30,
        status: "active",
        approvalStatus: "approved",
        rejectionReason: null,
        followerCount: 150000,
        engagementRate: 6.2,
        verificationStatus: "verified",
        platform: "instagram",
        createdAt: new Date(),
        approvedAt: new Date(),
        approvedBy: "admin"
      },
      {
        id: 3,
        title: "Discord Server Bundle - Gaming Community",
        description: "Active gaming Discord server with 50K members, multiple channels, bots configured",
        price: 15000,
        fakePrice: 25000,
        discount: 40,
        category: "discord",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        seller: "GameMaster",
        sellerId: 3,
        likes: 67,
        comments: 12,
        sales: 0,
        blocked: false,
        blockReason: null,
        commission: 30,
        status: "active",
        approvalStatus: "approved",
        rejectionReason: null,
        followerCount: 50000,
        engagementRate: 15.0,
        verificationStatus: "verified",
        platform: "discord",
        createdAt: new Date(),
        approvedAt: new Date(),
        approvedBy: "admin"
      }
    ];
    
    sampleServices.forEach(service => {
      this.courses.set(service.id.toString(), service);
    });
    this.currentCourseId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id, 
      email: insertUser.email,
      displayName: insertUser.displayName || null,
      photoURL: insertUser.photoURL || null,
      location: insertUser.location ?? null,
      referralCode: insertUser.referralCode ?? null,
      referredBy: insertUser.referredBy ?? null,
      walletBalance: insertUser.walletBalance ?? 0,
      totalEarnings: 0,
      totalReferrals: 0,
      isActive: true,
      lastActiveAt: new Date(),
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === code,
    );
  }

  async updateUserWallet(userId: number, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + amount;
      user.totalEarnings = (user.totalEarnings || 0) + amount;
      this.users.set(userId, user);
    }
  }

  // Course/Channel methods
  async getCourses(): Promise<Channel[]> {
    return Array.from(this.courses.values());
  }

  async getUserCourses(userId: string): Promise<Channel[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.sellerId?.toString() === userId,
    );
  }

  async createCourse(courseData: any): Promise<Channel> {
    const id = this.currentCourseId++;
    const course: Channel = {
      id,
      title: courseData.title,
      description: courseData.description,
      price: courseData.price,
      fakePrice: courseData.fakePrice || null,
      discount: courseData.discount || 0,
      category: courseData.category,
      thumbnail: courseData.thumbnail || null,
      seller: courseData.seller || null,
      sellerId: courseData.sellerId || null,
      likes: courseData.likes || 0,
      comments: courseData.comments || 0,
      sales: courseData.sales || 0,
      blocked: false,
      blockReason: null,
      commission: 30,
      status: courseData.status || "pending",
      approvalStatus: courseData.approvalStatus || "pending",
      rejectionReason: null,
      followerCount: courseData.followerCount || 0,
      engagementRate: courseData.engagementRate || 0,
      verificationStatus: "unverified",
      platform: courseData.platform || "youtube",
      createdAt: new Date()
    };
    this.courses.set(id.toString(), course);
    return course;
  }

  async updateCourse(courseId: string, updates: any): Promise<Channel> {
    const course = this.courses.get(courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    
    const updatedCourse = { ...course, ...updates };
    this.courses.set(courseId, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(courseId: string): Promise<void> {
    this.courses.delete(courseId);
  }

  // Payment methods
  async createPayment(paymentData: any): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = {
      id,
      userId: paymentData.userId,
      channelId: paymentData.courseId,
      amount: paymentData.amount,
      paymentType: paymentData.paymentMethod,
      transactionId: paymentData.transactionId || null,
      status: paymentData.status || "pending",
      createdAt: new Date()
    };
    this.payments.set(id, payment);
    return payment;
  }

  // Referral methods
  async trackReferral(referrerId: number, referredId: number): Promise<void> {
    const id = this.currentReferralId++;
    const referral: ReferralBonus = {
      id,
      referrerId,
      referredId,
      bonusAmount: 10,
      status: "pending",
      transactionId: null,
      createdAt: new Date()
    };
    this.referrals.set(id, referral);
    
    // Update referrer's total referrals
    const referrer = this.users.get(referrerId);
    if (referrer) {
      referrer.totalReferrals = (referrer.totalReferrals || 0) + 1;
      this.users.set(referrerId, referrer);
    }
  }

  async getReferralByBuyer(buyerId: number): Promise<ReferralBonus | undefined> {
    return Array.from(this.referrals.values()).find(
      (referral) => referral.referredId === buyerId,
    );
  }

  // Admin methods
  async getAdminStats(): Promise<any> {
    const totalUsers = this.users.size;
    const totalCourses = this.courses.size;
    const activeCourses = Array.from(this.courses.values()).filter(c => c.status === 'active').length;
    const pendingCourses = Array.from(this.courses.values()).filter(c => c.status === 'pending').length;
    const totalPayments = this.payments.size;
    const totalReferrals = this.referrals.size;

    return {
      totalUsers,
      totalCourses,
      activeCourses,
      pendingCourses,
      totalPayments,
      totalReferrals,
      totalRevenue: Array.from(this.payments.values()).reduce((sum, p) => sum + p.amount, 0)
    };
  }
}

export const storage = new MemStorage();
