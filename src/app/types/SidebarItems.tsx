import { Chip } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { SidebarItem, SidebarItemType } from '../_components/Sidebar'
import TeamAvatar from '../_components/TeamAvatar'
import { Apple, Armchair, Box, Building, TableCellsMerge, Users } from 'lucide-react'
import { UserRole } from '@/api/models/User'

export const sectionItems: SidebarItem[] = [
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
]

export const sectionItemsWithTeams: SidebarItem[] = [...sectionItems]
