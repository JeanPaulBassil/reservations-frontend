'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  cn,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { useAuth } from '@/components/providers/AuthProvider';

// Sample data - in a real application, this would come from your API
const reservationData = [
  {
    title: "Today's Reservations",
    subtitle: 'Total bookings for today',
    value: '24',
    chartData: [
      { day: 'Mon', value: 18 },
      { day: 'Tue', value: 22 },
      { day: 'Wed', value: 20 },
      { day: 'Thu', value: 25 },
      { day: 'Fri', value: 32 },
      { day: 'Sat', value: 38 },
      { day: 'Sun', value: 24 },
    ],
    change: '12%',
    color: 'success',
    xaxis: 'day',
  },
  {
    title: 'Guest Count',
    subtitle: 'Total guests today',
    value: '86',
    chartData: [
      { day: 'Mon', value: 65 },
      { day: 'Tue', value: 72 },
      { day: 'Wed', value: 68 },
      { day: 'Thu', value: 78 },
      { day: 'Fri', value: 95 },
      { day: 'Sat', value: 110 },
      { day: 'Sun', value: 86 },
    ],
    change: '8%',
    color: 'primary',
    xaxis: 'day',
  },
];

// Table availability data
const tableData = {
  title: 'Tables Available',
  value: 12,
  total: 32,
  status: 'good',
  iconName: 'mdi:table-furniture',
};

// Current shift data
const shiftData = {
  current: 'Dinner',
  time: '5:00 PM - 10:00 PM',
  staff: 8,
};

// Upcoming reservations data
const upcomingReservations = [
  {
    id: 'RES-1234',
    name: 'John Smith',
    guests: 4,
    time: '6:30 PM',
    table: 'Table 8',
    status: 'confirmed',
    phone: '+1 (555) 123-4567',
    notes: 'Anniversary dinner',
  },
  {
    id: 'RES-1235',
    name: 'Emily Johnson',
    guests: 2,
    time: '7:00 PM',
    table: 'Table 12',
    status: 'confirmed',
    phone: '+1 (555) 987-6543',
    notes: 'Window seat requested',
  },
  {
    id: 'RES-1236',
    name: 'Michael Williams',
    guests: 6,
    time: '7:15 PM',
    table: 'Table 15',
    status: 'pending',
    phone: '+1 (555) 456-7890',
    notes: 'Birthday celebration',
  },
  {
    id: 'RES-1237',
    name: 'Sarah Davis',
    guests: 3,
    time: '7:30 PM',
    table: 'Table 5',
    status: 'confirmed',
    phone: '+1 (555) 234-5678',
    notes: '',
  },
  {
    id: 'RES-1238',
    name: 'Robert Brown',
    guests: 2,
    time: '8:00 PM',
    table: 'Table 10',
    status: 'confirmed',
    phone: '+1 (555) 876-5432',
    notes: 'Allergic to nuts',
  },
];

export default function ReservationStats() {
  // Get user information from auth context
  const { user, isInitializing } = useAuth();
  
  // Format username from user data
  const username = !isInitializing && user ? 
    (user.displayName || (user.email ? user.email.split('@')[0] : 'Guest')) : 
    'Guest';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3 mb-6">
          <Avatar
            name={username}
            size="lg"
            className="bg-primary-100 text-primary-500"
            src={user?.photoURL || undefined}
          />
          <div>
            <h1 className="text-2xl font-semibold">Welcome, {username}</h1>
            <p className="text-default-500">Restaurant Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Command Menu Dropdown */}
          <Dropdown placement="bottom-end" radius="sm">
            <DropdownTrigger>
              <Button
                variant="flat"
                color="success"
                endContent={<Icon icon="solar:alt-arrow-down-bold" width={16} />}
                startContent={<Icon icon="solar:command-square-bold" width={18} />}
                radius="sm"
              >
                Quick Actions
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Quick Actions">
              <DropdownItem
                key="new-reservation"
                description="Create a new reservation"
                startContent={
                  <Icon icon="solar:add-circle-bold" className="text-primary-500" width={20} />
                }
                as={Link}
                href="/reservations/new"
              >
                Add New Reservation
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Badge color="primary" content={shiftData.staff} placement="top-right">
            <Icon className="text-primary-500" icon="mdi:account-group" width={20} />
          </Badge>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-default-600">
              Current Shift: {shiftData.current}
            </span>
            <span className="text-xs text-default-400">{shiftData.time}</span>
          </div>
        </div>
      </div>

      {/* Reservation KPIs with charts and Table Availability */}
      <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 mb-6">
        {/* Reservation KPIs */}
        {reservationData.map(({ title, subtitle, value, change, color, chartData }, index) => (
          <Card key={index} className="dark:border-default-100">
            <section className="flex flex-col flex-nowrap">
              <div className="flex flex-col justify-between gap-y-2 px-4 pt-4">
                <div className="flex flex-col gap-y-2">
                  <div className="flex flex-col gap-y-0">
                    <dt className="text-sm font-medium text-default-600">{title}</dt>
                    <dt className="text-tiny font-normal text-default-400">{subtitle}</dt>
                  </div>
                  <div className="flex items-baseline gap-x-2">
                    <dd className="text-xl font-semibold text-default-700">{value}</dd>
                    <Chip
                      classNames={{
                        content: 'font-medium',
                      }}
                      color={
                        color === 'success'
                          ? 'success'
                          : color === 'primary'
                            ? 'primary'
                            : color === 'secondary'
                              ? 'secondary'
                              : color === 'warning'
                                ? 'warning'
                                : color === 'danger'
                                  ? 'danger'
                                  : 'default'
                      }
                      radius="sm"
                      size="sm"
                      startContent={
                        color === 'success' ? (
                          <Icon height={16} icon={'solar:arrow-right-up-linear'} width={16} />
                        ) : color === 'danger' ? (
                          <Icon height={16} icon={'solar:arrow-right-down-linear'} width={16} />
                        ) : (
                          <Icon height={16} icon={'solar:arrow-right-linear'} width={16} />
                        )
                      }
                      variant="flat"
                    >
                      <span>{change}</span>
                    </Chip>
                  </div>
                </div>
              </div>
              <div className="min-h-24 w-full">
                <ResponsiveContainer className="[&_.recharts-surface]:outline-none">
                  <AreaChart
                    accessibilityLayer
                    className="translate-y-1 scale-105"
                    data={chartData}
                  >
                    <defs>
                      <linearGradient id={'colorUv' + index} x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="10%"
                          stopColor={cn({
                            'hsl(var(--heroui-success))': color === 'success',
                            'hsl(var(--heroui-primary))': color === 'primary',
                            'hsl(var(--heroui-secondary))': color === 'secondary',
                            'hsl(var(--heroui-warning))': color === 'warning',
                            'hsl(var(--heroui-danger))': color === 'danger',
                            'hsl(var(--heroui-foreground))': color === 'default',
                          })}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor={cn({
                            'hsl(var(--heroui-success))': color === 'success',
                            'hsl(var(--heroui-primary))': color === 'primary',
                            'hsl(var(--heroui-secondary))': color === 'secondary',
                            'hsl(var(--heroui-warning))': color === 'warning',
                            'hsl(var(--heroui-danger))': color === 'danger',
                            'hsl(var(--heroui-foreground))': color === 'default',
                          })}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis
                      domain={[Math.min(...chartData.map((d) => d.value)), 'auto']}
                      hide={true}
                    />
                    <Area
                      dataKey="value"
                      fill={`url(#colorUv${index})`}
                      stroke={cn({
                        'hsl(var(--heroui-success))': color === 'success',
                        'hsl(var(--heroui-primary))': color === 'primary',
                        'hsl(var(--heroui-secondary))': color === 'secondary',
                        'hsl(var(--heroui-warning))': color === 'warning',
                        'hsl(var(--heroui-danger))': color === 'danger',
                        'hsl(var(--heroui-foreground))': color === 'default',
                      })}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <Dropdown
                classNames={{
                  content: 'min-w-[120px]',
                }}
                placement="bottom-end"
              >
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    className="absolute right-2 top-2 w-auto rounded-full"
                    size="sm"
                    variant="light"
                  >
                    <Icon height={16} icon="solar:menu-dots-bold" width={16} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  itemClasses={{
                    title: 'text-tiny',
                  }}
                  variant="flat"
                >
                  <DropdownItem key="view-details">View Details</DropdownItem>
                  <DropdownItem key="export-data">Export Data</DropdownItem>
                  <DropdownItem key="set-alert">Set Alert</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </section>
          </Card>
        ))}

        {/* Table Availability Card */}
        <Card className="flex flex-col p-4 dark:border-default-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border p-0.5 border-success-200 bg-success-50 dark:border-success-100">
            <Icon className="text-success-500" icon={tableData.iconName} width={20} />
          </div>

          <div className="pt-1">
            <dt className="my-2 text-sm font-medium text-default-500">{tableData.title}</dt>
            <dd className="text-2xl font-semibold text-default-700">
              {tableData.value}{' '}
              <span className="text-sm text-default-400">of {tableData.total}</span>
            </dd>
          </div>
          <Progress
            aria-label="status"
            className="mt-2"
            color="success"
            value={(tableData.value / tableData.total) * 100}
          />
          <Dropdown
            classNames={{
              content: 'min-w-[120px]',
            }}
            placement="bottom-end"
          >
            <DropdownTrigger>
              <Button
                isIconOnly
                className="absolute right-2 top-2 w-auto rounded-full"
                size="sm"
                variant="light"
              >
                <Icon height={16} icon="solar:menu-dots-bold" width={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              itemClasses={{
                title: 'text-tiny',
              }}
              variant="flat"
            >
              <DropdownItem key="view-details">View Details</DropdownItem>
              <DropdownItem key="export-data">Export Data</DropdownItem>
              <DropdownItem key="set-alert">Set Alert</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Card>
      </dl>

      {/* Bottom section with Upcoming Reservations Table and Guest Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upcoming Reservations Table */}
        <div className="lg:col-span-2">
          <Card className="dark:border-default-100 h-full">
            <div className="flex justify-between items-center p-4 border-b border-default-100">
              <h3 className="text-lg font-semibold">Upcoming Reservations</h3>
              <Link
                href="/reservations"
                className="text-primary-500 text-sm font-medium flex items-center gap-1 hover:underline"
              >
                View All
                <Icon icon="solar:arrow-right-linear" width={16} />
              </Link>
            </div>

            <div className="flex-grow overflow-auto">
              <Table
                aria-label="Upcoming reservations"
                removeWrapper
                classNames={{
                  th: 'bg-default-100/50 font-medium text-default-600 text-xs',
                  td: 'py-3',
                }}
              >
                <TableHeader>
                  <TableColumn>GUEST</TableColumn>
                  <TableColumn>TIME</TableColumn>
                  <TableColumn>TABLE</TableColumn>
                  <TableColumn>GUESTS</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {upcomingReservations.slice(0, 5).map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar name={reservation.name} size="sm" className="text-primary-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{reservation.name}</span>
                            <span className="text-xs text-default-400">{reservation.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{reservation.time}</TableCell>
                      <TableCell>{reservation.table}</TableCell>
                      <TableCell>{reservation.guests}</TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={reservation.status === 'confirmed' ? 'success' : 'warning'}
                          variant="flat"
                        >
                          {reservation.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button isIconOnly size="sm" variant="light">
                            <Icon icon="solar:pen-linear" width={16} />
                          </Button>
                          <Button isIconOnly size="sm" variant="light">
                            <Icon icon="solar:info-circle-linear" width={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Guest Insights Card */}
        <div className="lg:col-span-1">
          <Card className="dark:border-default-100 h-full">
            <div className="flex justify-between items-center p-4 border-b border-default-100">
              <h3 className="text-lg font-semibold">Guest Insights</h3>
              <Button isIconOnly size="sm" variant="light" className="text-default-500">
                <Icon icon="solar:info-circle-linear" width={18} />
              </Button>
            </div>

            <div className="p-4 flex flex-col gap-5">
              {/* Recent Guests */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border p-0.5 border-primary-200 bg-primary-50 dark:border-primary-100">
                  <Icon
                    className="text-primary-500"
                    icon="solar:users-group-rounded-bold"
                    width={20}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-default-700">Recent Guests</h4>
                  <p className="text-xs text-default-500 mb-1">
                    Repeat customers in the last month
                  </p>
                  <div className="flex -space-x-2 overflow-hidden mt-2">
                    <Avatar name="John Smith" size="sm" />
                    <Avatar name="Emily Johnson" size="sm" />
                    <Avatar name="Michael Williams" size="sm" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-default-100 text-default-600 text-xs">
                      +5
                    </div>
                  </div>
                </div>
              </div>

              {/* Frequent Guests */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border p-0.5 border-success-200 bg-success-50 dark:border-success-100">
                  <Icon className="text-success-500" icon="solar:medal-ribbon-bold" width={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-default-700">Frequent Guests</h4>
                  <p className="text-xs text-default-500 mb-1">
                    Guests who visit often (loyalty tracking)
                  </p>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar name="Robert Brown" size="sm" />
                        <span className="text-xs font-medium">Robert Brown</span>
                      </div>
                      <Chip size="sm" color="success" variant="flat">
                        12 visits
                      </Chip>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar name="Sarah Davis" size="sm" />
                        <span className="text-xs font-medium">Sarah Davis</span>
                      </div>
                      <Chip size="sm" color="success" variant="flat">
                        8 visits
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Guests */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border p-0.5 border-warning-200 bg-warning-50 dark:border-warning-100">
                  <Icon className="text-warning-500" icon="solar:user-plus-bold" width={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-default-700">New Guests</h4>
                  <p className="text-xs text-default-500 mb-1">First-time visitors this week</p>
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-default-600">New guests</span>
                      <span className="text-xs font-medium">14</span>
                    </div>
                    <Progress
                      aria-label="New guests"
                      value={70}
                      color="warning"
                      size="sm"
                      className="max-w-md"
                    />
                    <p className="text-xs text-success-500 mt-1 flex items-center gap-1">
                      <Icon icon="solar:arrow-up-bold" width={14} />
                      <span>24% increase from last week</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 mt-auto">
              <Button
                as={Link}
                href="/guests"
                variant="flat"
                color="success"
                radius="sm"
                className="w-full"
                endContent={<Icon icon="solar:arrow-right-linear" width={16} />}
              >
                View All Guest Data
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
