'use client';

import {
  Image,
  ScrollShadow,
  Spacer,
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useAuth } from '../providers/AuthProvider';
import UserSettingsDropdown from '../user/UserSettingsDropdown';
import Sidebar, { SidebarItem } from './Sidebar';
import { restaurantApi } from '@/api/restaurant';

// Admin-only sidebar items
export const adminItems: SidebarItem[] = [
  {
    key: 'overview',
    title: 'Overview',
    items: [
      {
        key: 'clients',
        href: '/admin/clients',
        icon: 'solar:users-group-rounded-linear',
        title: 'Clients',
      },
      {
        key: 'allowed-emails',
        href: '/admin/allowed-emails',
        icon: 'solar:letter-linear',
        title: 'Allowed Emails',
      },
    ],
  },
  // {
  //   key: 'your-teams',
  //   title: 'Your Teams',
  //   items: [
  //     {
  //       key: 'heroui',
  //       href: '#',
  //       title: 'HeroUI',
  //       startContent: (
  //         <TeamAvatar
  //           classNames={{
  //             base: 'border-1 border-primary-foreground/20',
  //             name: 'text-primary-foreground/80',
  //           }}
  //           name="Hero UI"
  //         />
  //       ),
  //     },
  //     {
  //       key: 'tailwind-variants',
  //       href: '#',
  //       title: 'Tailwind Variants',
  //       startContent: (
  //         <TeamAvatar
  //           classNames={{
  //             base: 'border-1 border-primary-foreground/20',
  //             name: 'text-primary-foreground/80',
  //           }}
  //           name="Tailwind Variants"
  //         />
  //       ),
  //     },
  //     {
  //       key: 'heroui-pro',
  //       href: '#',
  //       title: 'HeroUI Pro',
  //       startContent: (
  //         <TeamAvatar
  //           classNames={{
  //             base: 'border-1 border-primary-foreground/20',
  //             name: 'text-primary-foreground/80',
  //           }}
  //           name="HeroUI Pro"
  //         />
  //       ),
  //     },
  //   ],
  // },
];

// Regular user sidebar items
export const userItems: SidebarItem[] = [
  {
    key: 'overview',
    title: 'Overview',
    items: [
      {
        key: 'dashboard',
        href: '/dashboard',
        icon: 'solar:home-2-linear',
        title: 'Dashboard',
      },
    ],
  },
];

/**
 * 💡 TIP: You can use the usePathname hook from Next.js App Router to get the current pathname
 * and use it as the active key for the Sidebar component.
 *
 * ```tsx
 * import {usePathname} from "next/navigation";
 *
 * const pathname = usePathname();
 * const currentPath = pathname.split("/")?.[1]
 *
 * <Sidebar defaultSelectedKey="home" selectedKeys={[th]} />
 * ```
 */
export default function AppWrapper() {
  const { userRole, isInitializing, user } = useAuth();
  const router = useRouter();
  const [hasRestaurants, setHasRestaurants] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  // Handle redirect after state update
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/onboarding');
    }
  }, [shouldRedirect, router]);

  // Check if user has any restaurants
  useEffect(() => {
    const checkUserRestaurants = async () => {
      if (user && userRole === 'USER') {
        try {
          console.log('Sidebar: Fetching restaurants using restaurantApi...');
          // Add a small delay to ensure token is properly set
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const restaurants = await restaurantApi.getMyRestaurants();
          console.log('Sidebar: Restaurants fetched successfully:', restaurants.length);
          
          const hasAnyRestaurants = restaurants.length > 0;
          setHasRestaurants(hasAnyRestaurants);
          setNetworkError(false);
          
          // Set redirect flag if user has no restaurants
          if (!hasAnyRestaurants) {
            setShouldRedirect(true);
          }
        } catch (error: any) {
          console.error('Sidebar: Error fetching restaurants:', error);
          
          // Check specifically for network errors
          if (error.message === 'Network Error') {
            console.error('Sidebar: Network error detected - unable to connect to the API server');
            setNetworkError(true);
          }
          
          setHasRestaurants(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    if (user && !isInitializing) {
      checkUserRestaurants();
    }
  }, [user, userRole, isInitializing]);

  // Determine which sidebar items to show based on user role
  const sidebarItems = userRole === 'ADMIN' ? adminItems : userItems;
  
  // Determine default selected key based on user role
  const defaultSelectedKey = userRole === 'ADMIN' ? 'clients' : 'dashboard';

  return (
    <div className="h-full min-h-[48rem]">
      <div className="relative flex h-full w-72 flex-1 flex-col bg-[#75CAA6] p-6">
        <div className="flex items-center gap-2 px-2">
          <Image src="/logo.svg" alt="logo" width={200} height={100} />
        </div>

        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar
            defaultSelectedKey={defaultSelectedKey}
            iconClassName="text-primary-foreground/60 group-data-[selected=true]:text-primary-foreground"
            itemClasses={{
              title:
                'text-primary-foreground/60 group-data-[selected=true]:text-primary-foreground',
            }}
            items={sidebarItems}
            sectionClasses={{
              heading: 'text-primary-foreground/80',
            }}
            variant="flat"
          />
        </ScrollShadow>

        <Spacer y={8} />

        <div className="mt-auto flex flex-col">
          <div className="flex items-center gap-3 px-2">
            <div className="flex flex-col"></div>
          </div>
          <UserSettingsDropdown variant="sidebar" />
        </div>
      </div>
    </div>
  );
}
