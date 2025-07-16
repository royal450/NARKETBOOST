export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  likes?: number;
  comments?: number;
  sales?: number;
  discount?: number;
  fakePrice?: number;
  finalPrice?: number;
  position?: number;
  hoverCount?: number;
  clickCount?: number;
  viewTime?: number;
  rating?: number;
  instructor?: string;
  duration?: string;
  level?: string;
  language?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  earnings?: number;
  popularity?: number;
  completionRate?: number;
  shares?: number;
}

export interface UserStats {
  wallet: number;
  totalSales: number;
  purchasedCourses: number;
  todayEarnings: number;
  totalUsers: number;
  visitsToday: number;
}

export interface AdminStats {
  signupsToday: number;
  salesToday: number;
  trafficToday: number;
  monthlySales: number;
  organicTraffic: number;
  referralTraffic: number;
}