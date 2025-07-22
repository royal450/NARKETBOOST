import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import DashboardAbroad from "@/pages/dashboard-abroad";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Payment from "@/pages/payment";
import Profile from "@/pages/profile";
import Promotion from "@/pages/promotion";
import AdminPanel from "@/pages/admin";
import Referral from "@/pages/referral";
import NotFound from "@/pages/not-found";
import Withdrawal from "@/pages/withdrawal";

// Lazy loaded channel pages
const ChannelCreationModern = lazy(() => import("@/pages/channel-creation-modern"));
const FullFeaturedAdmin = lazy(() => import("@/pages/full-featured-admin"));
const ChannelShowCard = lazy(() => import("@/pages/channel-show-full-attractive-card"));
const EnhancedChannelSubmission = lazy(() => import("@/pages/enhanced-channel-submission"));

// Lazy loaded new pages
const WithdrawalPopup = lazy(() => import("@/pages/withdrawal-popup"));

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <Component /> : null;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return !user ? <Component /> : null;
}

// Auto-redirect for authenticated users with location detection
function AutoRedirectRoute() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check user location to determine dashboard
        const userLocation = (user as any)?.location || "India";
        if (userLocation === "India") {
          setLocation("/dashboard");
        } else {
          setLocation("/dashboard-abroad");
        }
      } else {
        setLocation("/login");
      }
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}

// Location-based dashboard route
function DashboardRoute() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  // Check user location to determine which dashboard to show
  const userLocation = (user as any)?.location || "India";
  if (userLocation === "India") {
    return <Dashboard />;
  } else {
    return <DashboardAbroad />;
  }
}

// Enhanced Referral Detection Component  
function ReferralDetector() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Extract referral code from multiple URL formats
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    let referralCode = null;

    // Check for ?ref= format (primary)
    if (urlParams.has('ref')) {
      referralCode = urlParams.get('ref');
    }
    // Check for #/inviteCode= format  
    else if (hash.includes('inviteCode=')) {
      const inviteMatch = hash.match(/inviteCode=([^&/#]+)/);
      if (inviteMatch) {
        referralCode = inviteMatch[1];
      }
    }
    // Check for /r/ format
    else if (window.location.pathname.includes('/r/')) {
      const pathMatch = window.location.pathname.match(/\/r\/([^\/]+)/);
      if (pathMatch) {
        referralCode = pathMatch[1];
      }
    }

    // Store referral code if found and show detection
    if (referralCode && referralCode.trim()) {
      localStorage.setItem('referralCode', referralCode.trim());
      localStorage.setItem('referralDetected', 'true');
      console.log('✅ Referral code detected and stored:', referralCode.trim());

      // Show success toast
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('referralDetected', { 
          detail: { code: referralCode.trim() } 
        }));
      }, 500);
    }

    // Redirect based on authentication status
    if (user) {
      setLocation('/dashboard');
    } else {
      setLocation('/signup');
    }
  }, [setLocation, user]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
        <Route path="/login">
          <PublicRoute component={Login} />
        </Route>
        <Route path="/signup">
          <PublicRoute component={Signup} />
        </Route>
        <Route path="/refer" component={ReferralDetector} />
        <Route path="/channel/:id" component={ReferralDetector} />
        <Route path="/course/:id" component={ReferralDetector} />
        <Route path="/dashboard" component={DashboardRoute} />
        <Route path="/dashboard-abroad">
          <ProtectedRoute component={DashboardAbroad} />
        </Route>
        <Route path="/profile">
          <ProtectedRoute component={Profile} />
        </Route>
        <Route path="/my-channels">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={EnhancedChannelSubmission} />
          </Suspense>
        </Route>
        <Route path="/my-courses">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={EnhancedChannelSubmission} />
          </Suspense>
        </Route>
        <Route path="/user-profile/:userId">
          <ProtectedRoute component={Profile} />
        </Route>
        <Route path="/payment">
          <ProtectedRoute component={Payment} />
        </Route>
        <Route path="/list-channel">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={EnhancedChannelSubmission} />
          </Suspense>
        </Route>
        <Route path="/promotion">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={ChannelCreationModern} />
          </Suspense>
        </Route>
        <Route path="/create-course">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={EnhancedChannelSubmission} />
          </Suspense>
        </Route>
        <Route path="/admin">
          <ProtectedRoute component={AdminPanel} />
        </Route>
        <Route path="/admin-full">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={FullFeaturedAdmin} />
          </Suspense>
        </Route>
        <Route path="/admin-panel">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={FullFeaturedAdmin} />
          </Suspense>
        </Route>
        <Route path="/channel-creation">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={ChannelCreationModern} />
          </Suspense>
        </Route>
        <Route path="/create-channel">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={ChannelCreationModern} />
          </Suspense>
        </Route>
        <Route path="/submit-channel">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={EnhancedChannelSubmission} />
          </Suspense>
        </Route>
        <Route path="/enhanced-channel-submission">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={EnhancedChannelSubmission} />
          </Suspense>
        </Route>
        <Route path="/channel-submission">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={EnhancedChannelSubmission} />
          </Suspense>
        </Route>
        <Route path="/channels">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ChannelShowCard />
          </Suspense>
        </Route>
        <Route path="/channel-marketplace">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ChannelShowCard />
          </Suspense>
        </Route>
        <Route path="/payment/:channelId">
          <ProtectedRoute component={Payment} />
        </Route>
        <Route path="/payment/:courseId">
          <ProtectedRoute component={Payment} />
        </Route>
        <Route path="/r/:code" component={ReferralDetector} />
        <Route path="/invite/:code" component={ReferralDetector} />
        <Route path="/inviteCode*" component={ReferralDetector} />
        
        <Route path="/withdrawal-popup">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute component={WithdrawalPopup} />
          </Suspense>
        </Route>
        <Route path="/" component={AutoRedirectRoute} />
        <Route path="/not-found" component={NotFound} />
        <Route path="/withdrawal" component={Withdrawal} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}