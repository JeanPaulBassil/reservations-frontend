import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Restaurant, restaurantApi } from '@/api/restaurant';
import { useAuth } from './AuthProvider';

interface RestaurantContextType {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  setCurrentRestaurant: (restaurant: Restaurant) => void;
  isLoading: boolean;
  error: string | null;
  refetchRestaurants: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const { user, isInitializing } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    if (!user || isInitializing) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedRestaurants = await restaurantApi.getMyRestaurants();
      setRestaurants(fetchedRestaurants);
      
      // Set current restaurant to the first one if not already set
      if (fetchedRestaurants.length > 0 && !currentRestaurant) {
        // Check if we have a saved restaurant ID in localStorage
        const savedRestaurantId = localStorage.getItem('currentRestaurantId');
        
        if (savedRestaurantId) {
          const savedRestaurant = fetchedRestaurants.find(r => r.id === savedRestaurantId);
          if (savedRestaurant) {
            setCurrentRestaurant(savedRestaurant);
          } else {
            setCurrentRestaurant(fetchedRestaurants[0]);
            localStorage.setItem('currentRestaurantId', fetchedRestaurants[0].id);
          }
        } else {
          setCurrentRestaurant(fetchedRestaurants[0]);
          localStorage.setItem('currentRestaurantId', fetchedRestaurants[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch restaurants');
      console.error('Error fetching restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch restaurants when the user is authenticated
  useEffect(() => {
    if (user && !isInitializing) {
      fetchRestaurants();
    }
  }, [user, isInitializing]);

  // Update localStorage when current restaurant changes
  const handleSetCurrentRestaurant = (restaurant: Restaurant) => {
    setCurrentRestaurant(restaurant);
    localStorage.setItem('currentRestaurantId', restaurant.id);
  };

  const value = {
    restaurants,
    currentRestaurant,
    setCurrentRestaurant: handleSetCurrentRestaurant,
    isLoading,
    error,
    refetchRestaurants: fetchRestaurants
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}; 