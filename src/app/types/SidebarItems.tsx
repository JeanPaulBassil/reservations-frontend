import { SidebarItem } from '../_components/Sidebar'
import { Building, Calendar, Clock, Phone, Table, User, Users } from 'lucide-react'
import { UserRole } from '@/api/models/User'
import { Icon } from '@iconify/react/dist/iconify.js'

export const sectionItems: SidebarItem[] = [
  {
    key: 'reservations',
    href: '/reservations',
    icon: <Phone strokeWidth={1} color="#ffffff" />,
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
    icon: <Icon icon="material-symbols-light:table-bar-outline" width="30" height="30" />,
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
