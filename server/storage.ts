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
    // Add sample pending course
    const sampleCourse: Channel = {
      id: 1,
      title: "Premium Instagram Marketing Course",
      description: "Learn advanced Instagram marketing strategies to grow your business",
      price: 2999,
      fakePrice: 4999,
      discount: 40,
      category: "marketing",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      seller: "Marketing Expert",
      sellerId: 1,
      likes: 25,
      comments: 8,
      sales: 0,
      blocked: false,
      blockReason: null,
      commission: 30,
      status: "pending",
      approvalStatus: "pending",
      rejectionReason: null,
      followerCount: 50000,
      engagementRate: 4.5,
      verificationStatus: "unverified",
      platform: "instagram",
      createdAt: new Date()
    };
    
    this.courses.set("1", sampleCourse);
    this.currentCourseId = 2;
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
