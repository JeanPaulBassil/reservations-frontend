import { SidebarItem } from '../_components/Sidebar'
import { Building, Calendar, Clock, Table, User, Users } from 'lucide-react'
import { UserRole } from '@/api/models/User'

export const sectionItems: SidebarItem[] = [
  {
    key: 'reservations',
    href: '/reservations',
    icon: <Calendar strokeWidth={1} color="#ffffff" />,
    title: 'Reservations',
    allowedRoles: [UserRole.OWNER, UserRole.EMPLOYEE],
  },
  {
    key: 'companies',
    href: '/companies',
    icon: <Building strokeWidth={1} color="#ffffff" />,
    title: 'Companies',
    allowedRoles: [UserRole.ADMIN],
  },
  {
    key: 'entities',
    href: '/entities',
    icon: <Building strokeWidth={1} color="#ffffff" />,
    title: 'Entities',
    allowedRoles: [UserRole.OWNER],
  },
  {
    key: 'guests',
    href: '/guests',
    icon: <Users strokeWidth={1} color="#ffffff" />,
    title: 'Guests',
    allowedRoles: [UserRole.OWNER, UserRole.EMPLOYEE],
  },
  {
    key: 'employees',
    href: '/employees',
    icon: <User strokeWidth={1} color="#ffffff" />,
    title: 'Employees',
    allowedRoles: [UserRole.OWNER],
  },
  {
    key: 'tables',
    href: '/tables',
    icon: <Table strokeWidth={1} color="#ffffff" />,
    title: 'Tables',
    allowedRoles: [UserRole.OWNER, UserRole.EMPLOYEE],
  },
  {
    key: 'shifts',
    href: '/shifts',
    icon: <Clock strokeWidth={1} color="#ffffff" />,
    title: 'Shifts',
    allowedRoles: [UserRole.OWNER, UserRole.EMPLOYEE],
  },
]

export const sectionItemsWithTeams: SidebarItem[] = [...sectionItems]
