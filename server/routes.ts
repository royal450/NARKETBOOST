
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Services Management APIs
  app.get("/api/courses", async (req, res) => {
    try {
      // Get only active services for dashboard
      const services = await storage.getCourses();
      const activeServices = services.filter(service => service.status === 'active' && service.approvalStatus === 'approved');
      res.json(activeServices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const serviceData = {
        ...req.body,
        status: 'pending',
        approvalStatus: 'pending',
        createdAt: new Date()
      };
      
      const service = await storage.createCourse(serviceData);
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  // User Services Management
  app.get("/api/users/:userId/courses", async (req, res) => {
    try {
      const { userId } = req.params;
      const services = await storage.getUserCourses(userId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user services" });
    }
  });

  // Course Approval/Rejection
  app.put("/api/courses/:courseId/approve", async (req, res) => {
    try {
      const { courseId } = req.params;
      const updatedCourse = await storage.updateCourse(courseId, {
        status: 'active',
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin'
      });
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve course" });
    }
  });

  app.put("/api/courses/:courseId/reject", async (req, res) => {
    try {
      const { courseId } = req.params;
      const { reason } = req.body;
      
      const updatedCourse = await storage.updateCourse(courseId, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'admin',
        rejectionReason: reason
      });
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject course" });
    }
  });

  // Referral System APIs
  app.post("/api/referrals/track", async (req, res) => {
    try {
      const { referralCode, newUserId } = req.body;
      
      // Find referrer user
      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(404).json({ error: "Invalid referral code" });
      }

      // Track referral
      await storage.trackReferral(referrer.id, newUserId);
      
      res.json({ success: true, referrer: referrer.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to track referral" });
    }
  });

  app.post("/api/referrals/commission", async (req, res) => {
    try {
      const { purchaseAmount, buyerId } = req.body;
      
      // Find who referred this buyer
      const referral = await storage.getReferralByBuyer(buyerId);
      if (!referral) {
        return res.json({ success: true, commission: 0 });
      }

      // Calculate commission (10% of purchase)
      const commission = purchaseAmount * 0.1;
      
      // Update referrer's wallet
      if (referral.referrerId !== null) {
        await storage.updateUserWallet(referral.referrerId, commission);
      }
      
      res.json({ success: true, commission });
    } catch (error) {
      res.status(500).json({ error: "Failed to process commission" });
    }
  });

  // Payment Verification
  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { courseId, userId, amount, paymentMethod, transactionId } = req.body;
      
      // Create payment record
      const payment = await storage.createPayment({
        courseId,
        userId,
        amount,
        paymentMethod,
        transactionId,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Admin Stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  // Dashboard filtering by status
  app.get("/api/dashboard/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      // Only return active courses for dashboard
      const activeCourses = courses.filter(course => course.status === 'active');
      res.json(activeCourses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard courses" });
    }
  });

  // Admin course management endpoints
  app.get("/api/admin/courses", async (req, res) => {
    try {
      const { status } = req.query;
      let courses = await storage.getCourses();
      
      if (status) {
        courses = courses.filter(course => course.status === status);
      }
      
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin courses" });
    }
  });

  app.get("/api/admin/courses/pending", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      const pendingCourses = courses.filter(course => course.status === 'pending' || course.status === 'pending_review');
      res.json(pendingCourses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending courses" });
    }
  });

  app.delete("/api/courses/:courseId", async (req, res) => {
    try {
      const { courseId } = req.params;
      await storage.deleteCourse(courseId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  app.put("/api/courses/:courseId/block", async (req, res) => {
    try {
      const { courseId } = req.params;
      const { reason } = req.body;
      
      const updatedCourse = await storage.updateCourse(courseId, {
        blocked: true,
        blockReason: reason,
        blockedAt: new Date().toISOString(),
        blockedBy: 'admin'
      });
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: "Failed to block course" });
    }
  });

  app.put("/api/courses/:courseId/unblock", async (req, res) => {
    try {
      const { courseId } = req.params;
      
      const updatedCourse = await storage.updateCourse(courseId, {
        blocked: false,
        blockReason: null,
        blockedAt: null,
        blockedBy: null
      });
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: "Failed to unblock course" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
