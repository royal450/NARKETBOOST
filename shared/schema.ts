import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  location: text("location").default("India"),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),
  walletBalance: integer("wallet_balance").default(0),
  totalEarnings: integer("total_earnings").default(0),
  totalReferrals: integer("total_referrals").default(0),
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  fakePrice: integer("fake_price"),
  discount: integer("discount").default(0),
  category: text("category").notNull(),
  thumbnail: text("thumbnail"),
  instructor: text("instructor"),
  instructorId: integer("instructor_id").references(() => users.id),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  sales: integer("sales").default(0),
  blocked: boolean("blocked").default(false),
  blockReason: text("block_reason"),
  commission: integer("commission").default(30),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'rejected'
  approvalStatus: text("approval_status").default("pending"), // 'pending' | 'approved' | 'rejected'
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  amount: integer("amount").notNull(),
  paymentType: text("payment_type").notNull(), // 'indian' | 'international'
  transactionId: text("transaction_id"),
  status: text("status").default("pending"), // 'pending' | 'verified' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  courseTitle: text("course_title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  fakePrice: integer("fake_price"),
  category: text("category").notNull(),
  creatorName: text("creator_name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  signups: integer("signups").default(0),
  sales: integer("sales").default(0),
  traffic: integer("traffic").default(0),
  revenue: integer("revenue").default(0),
});

export const referralBonuses = pgTable("referral_bonuses", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id),
  referredId: integer("referred_id").references(() => users.id),
  bonusAmount: integer("bonus_amount").default(10),
  status: text("status").default("pending"), // 'pending' | 'paid' | 'failed'
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  likes: true,
  comments: true,
  sales: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertReferralBonusSchema = createInsertSchema(referralBonuses).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type ReferralBonus = typeof referralBonuses.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type InsertReferralBonus = z.infer<typeof insertReferralBonusSchema>;
