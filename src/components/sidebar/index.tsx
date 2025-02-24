'use client';

import { Avatar, Button, Link, ScrollShadow, Spacer } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { logout } from '@/services/authService';

import { useAuth } from '../providers/AuthProvider';
import SkeletonText from '../ui/SkeletonText';

import LogoutModal from './LogoutModal';
import Sidebar, { SidebarItem } from './Sidebar';

export const brandItems: SidebarItem[] = [
  {
    key: 'overview',
    title: 'Overview',
    items: [
      {
        key: 'home',
        href: '#',
        icon: 'solar:home-2-linear',
        title: 'Home',
      },
      // {
      //   key: 'projects',
      //   href: '#',
      //   icon: 'solar:widget-2-outline',
      //   title: 'Projects',
      //   endContent: (
      //     <Icon
      //       className="text-primary-foreground/60"
      //       icon="solar:add-circle-line-duotone"
      //       width={24}
      //     />
      //   ),
      // },
      // {
      //   key: 'tasks',
      //   href: '#',
      //   icon: 'solar:checklist-minimalistic-outline',
      //   title: 'Tasks',
      //   endContent: (
      //     <Icon
      //       className="text-primary-foreground/60"
      //       icon="solar:add-circle-line-duotone"
      //       width={24}
      //     />
      //   ),
      // },
      // {
      //   key: 'team',
      //   href: '#',
      //   icon: 'solar:users-group-two-rounded-outline',
      //   title: 'Team',
      // },
      // {
      //   key: 'tracker',
      //   href: '#',
      //   icon: 'solar:sort-by-time-linear',
      //   title: 'Tracker',
      //   endContent: (
      //     <Chip
      //       className="bg-primary-foreground font-medium text-primary"
      //       size="sm"
      //       variant="flat"
      //     >
      //       New
      //     </Chip>
      //   ),
      // },
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const { user, isInitializing } = useAuth();
  const router = useRouter();

  const handleLogoutModalClose = () => setIsLogoutModalOpen(false);

  const handleLogoutModalOpen = () => setIsLogoutModalOpen(true);

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="h-full min-h-[48rem]">
      <div className="relative flex h-full w-72 flex-1 flex-col bg-[#FF5757] p-6">
        <div className="flex items-center gap-2 px-2">
          <Avatar src="/logo.png" alt="logo" size="sm" />
          <span className="text-small font-medium uppercase text-primary-foreground">KLYO ASO</span>
        </div>

        <Spacer y={8} />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar 
              size="sm" 
              radius="full" 
              name={isInitializing ? undefined : (user?.displayName || user?.email?.split('@')[0] || undefined)}
              showFallback
              src={isInitializing ? undefined : (user?.photoURL || undefined)}
              alt='Profile Photo'
              classNames={{
                base: isInitializing ? "opacity-50" : "",
                fallback: "text-primary-foreground"
              }}
            />
            <div className="flex flex-col">
              <SkeletonText isLoading={isInitializing} width={120} height={16}>
                <p className="text-small text-primary-foreground">
                  {user?.displayName || (user?.email ? user.email.split('@')[0] : 'No user')}
                </p>
              </SkeletonText>
              <SkeletonText isLoading={isInitializing} width={160} height={14}>
                <p className="text-tiny text-primary-foreground/60">{user?.email || 'No user'}</p>
              </SkeletonText>
            </div>
          </div>
        </div>

        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar
            defaultSelectedKey="home"
            iconClassName="text-primary-foreground/60 group-data-[selected=true]:text-primary-foreground"
            itemClasses={{
              title:
                'text-primary-foreground/60 group-data-[selected=true]:text-primary-foreground',
            }}
            items={brandItems}
            sectionClasses={{
              heading: 'text-primary-foreground/80',
            }}
            variant="flat"
          />
        </ScrollShadow>

        <Spacer y={8} />

        <div className="mt-auto flex flex-col">
          <Link href="/settings">
            <Button
              fullWidth
              className="justify-start text-primary-foreground/60 data-[hover=true]:text-primary-foreground rounded-md"
              startContent={
                <Icon
                  className="text-primary-foreground/60"
                  icon="solar:settings-line-duotone"
                  width={24}
                />
              }
              variant="light"
            >
              Settings
            </Button>
          </Link>
          <Button
            className="justify-start text-primary-foreground/60 data-[hover=true]:text-primary-foreground rounded-md"
            startContent={
              <Icon
                className="rotate-180 text-primary-foreground/60"
                icon="solar:minus-circle-line-duotone"
                width={24}
              />
            }
            variant="light"
            onPress={handleLogoutModalOpen}
          >
            Log Out
          </Button>
        </div>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleLogoutModalClose}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
