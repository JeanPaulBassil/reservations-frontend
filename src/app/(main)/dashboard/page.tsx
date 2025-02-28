'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AdminOnly, NonAdminOnly } from '@/components/auth/RoleBasedAccess';
import { useAuth } from '@/components/providers/AuthProvider';
import { restaurantApi } from '@/api/restaurant';

export default function DashboardPage() {
  const { user, userRole, isInitializing, refreshUserData } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasRestaurants, setHasRestaurants] = useState<boolean | null>(null);
  const [isCheckingRestaurants, setIsCheckingRestaurants] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const router = useRouter();

  // Automatically fetch user data if authenticated but no role
  useEffect(() => {
    const fetchRoleIfMissing = async () => {
      if (user && !userRole && !isRefreshing) {
        setIsRefreshing(true);
        await refreshUserData();
        setIsRefreshing(false);
      }
    };

    fetchRoleIfMissing();
  }, [user, userRole, refreshUserData, isRefreshing]);

  // Check if user has any restaurants
  useEffect(() => {
    const checkUserRestaurants = async (retryCount = 0) => {
      if (user && userRole === 'USER' && !isCheckingRestaurants) {
        setIsCheckingRestaurants(true);
        
        // If this is the first attempt, refresh user data first
        if (retryCount === 0) {
          try {
            console.log('Refreshing user data before checking restaurants...');
            await refreshUserData();
            console.log('User data refreshed successfully');
          } catch (error) {
            console.error('Error refreshing user data:', error);
          }
        }
        
        try {
          console.log('Fetching restaurants directly using restaurantApi...');
          // Add a small delay to ensure token is properly set
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const restaurants = await restaurantApi.getMyRestaurants();
          console.log('Restaurants fetched successfully:', restaurants.length);
          
          const hasAnyRestaurants = restaurants.length > 0;
          console.log('User has restaurants:', hasAnyRestaurants, 'Count:', restaurants.length);
          setHasRestaurants(hasAnyRestaurants);
          setNetworkError(null); // Clear any previous network errors
        } catch (error: any) {
          console.error('Error fetching restaurants:', error);
          
          // Check specifically for network errors
          if (error.message === 'Network Error') {
            console.error('Network error detected - unable to connect to the API server');
            setNetworkError('Unable to connect to the server. Please check your internet connection and try again.');
          }
          
          // Log more detailed error information
          if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
            console.error('Error response headers:', error.response.headers);
          } else if (error.request) {
            console.error('No response received:', error.request);
          } else if (error.message && error.message.includes('Unexpected token')) {
            console.error('JSON parsing error - likely received HTML instead of JSON');
            console.error('This usually happens when the API returns an error page instead of JSON');
          }
          
          // If we got an error but we have a valid user, retry after a delay
          if (retryCount < 3) {
            console.log(`Error fetching restaurants, retrying (${retryCount + 1}/3) in 1.5 seconds...`);
            setTimeout(() => {
              setIsCheckingRestaurants(false);
              checkUserRestaurants(retryCount + 1);
            }, 1500);
            return;
          }
          
          console.log('All retries failed, assuming no restaurants');
          setHasRestaurants(false);
        } finally {
          setIsCheckingRestaurants(false);
        }
      }
    };

    if (user && userRole === 'USER' && hasRestaurants === null) {
      checkUserRestaurants();
    }
  }, [user, userRole, hasRestaurants, isCheckingRestaurants, refreshUserData]);

  // Handle redirect to onboarding if user has no restaurants
  useEffect(() => {
    console.log('Redirect check - hasRestaurants:', hasRestaurants, 'isRedirecting:', isRedirecting, 'redirectAttempts:', redirectAttempts);
    
    // Only redirect if we haven't already tried too many times (prevent infinite loops)
    if (userRole === 'USER' && hasRestaurants === false && !isRedirecting && redirectAttempts < 2) {
      console.log('Redirecting to onboarding page...');
      setIsRedirecting(true);
      setRedirectAttempts(prev => prev + 1);
      router.push('/onboarding');
    } else if (redirectAttempts >= 2) {
      console.log('Too many redirect attempts, showing dashboard anyway');
      // Force show dashboard even without restaurants to break potential loops
      setHasRestaurants(true);
    }
  }, [userRole, hasRestaurants, router, isRedirecting, redirectAttempts]);

  if (isInitializing || isRefreshing || isCheckingRestaurants) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-500">Setting up your dashboard</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-8">Please log in to access the dashboard.</div>;
  }

  // Show network error message if there is one
  if (networkError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Connection Error</h2>
          <p className="text-gray-700 mb-4">{networkError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Show a message while redirecting
  if (isRedirecting) {
    return <div className="p-8">Redirecting to onboarding...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-4">
        <p>Welcome, {user.displayName || user.email}</p>
        <p>Your role: {userRole || 'No role assigned'}</p>
      </div>

      {/* Content visible to all users */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">User Dashboard</h2>
        <p>Welcome to your dashboard. This is where you'll see your activity and manage your account.</p>
      </div>

      {/* Admin-only content */}
      <AdminOnly>
        <div className="mb-8 p-4 border border-blue-500 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Admin Quick Links</h2>
          <p>Here are some quick links to admin pages:</p>
          <div className="mt-4 flex gap-4">
            <a href="/admin/clients" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Manage Clients
            </a>
            <a href="/admin/allowed-emails" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Manage Allowed Emails
            </a>
          </div>
        </div>
      </AdminOnly>

      {/* Non-admin content */}
      <NonAdminOnly>
        <div className="mb-8 p-4 border border-green-500 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Your Dashboard</h2>
          <p>This dashboard will be updated with more features soon. For now, you can use it to view your profile and account information.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="font-medium">My Profile</h3>
              <p className="text-sm text-gray-600">View and edit your profile information</p>
            </div>
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="font-medium">My Activities</h3>
              <p className="text-sm text-gray-600">View your recent activities</p>
            </div>
          </div>
        </div>
      </NonAdminOnly>
    </div>
  );
} 