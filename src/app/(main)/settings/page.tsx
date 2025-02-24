'use client';

import { Tab, Tabs } from '@heroui/react';
import { Icon } from '@iconify/react';

import AccountDetails from './AccountDetails';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySeetings';

export default function SettingsPage() {
  return (
    <div>
      <Tabs
        classNames={{
          tabList: 'mx-4 text-medium',
          tabContent: 'text-small',
        }}
        size="lg"
        radius='sm'
        variant='light'
        color='danger'
      >
        <Tab
          key="account-settings"
          textValue="Account Settings"
          title={
            <div className="flex items-center gap-1.5">
              <Icon icon="solar:user-id-bold" width={20} />
              <p>Account</p>
            </div>
          }
        >
          <AccountDetails className="p-2  shadow-none" />
        </Tab>
        <Tab
          key="notifications-settings"
          textValue="Notification Settings"
          title={
            <div className="flex items-center gap-1.5">
              <Icon icon="solar:bell-bold" width={20} />
              <p>Notifications</p>
            </div>
          }
        >
          <NotificationSettings className="p-2  shadow-none" />
        </Tab>
        <Tab
          key="security-settings"
          textValue="Security Settings"
          title={
            <div className="flex items-center gap-1.5">
              <Icon icon="solar:shield-keyhole-bold" width={20} />
              <p>Security</p>
            </div>
          }
        >
          <SecuritySettings className="p-2  shadow-none" />
        </Tab>
      </Tabs>
    </div>
  );
}
