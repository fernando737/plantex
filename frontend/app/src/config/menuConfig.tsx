// src/config/menuConfig.ts
import React from 'react';
import { 
  Dashboard, 
  Settings, 
  Help, 
  Person,
  Business,
  Category,
  ListAlt,
  Inventory,
  Receipt,
} from '@mui/icons-material';

export interface SubMenuItem {
  text: string;
  link: string;
}

export interface MenuItem {
  label: string;
  icon: React.ReactElement;
  submenu: SubMenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <Dashboard />,
    submenu: [
      { text: 'Overview', link: '/dashboard' },
    ],
  },
  {
    label: 'Textiles',
    icon: <Category />,
    submenu: [
      { text: 'Proveedores', link: '/textile/providers' },
      { text: 'Insumos', link: '/textile/inputs' },
      { text: 'BOMs', link: '/textile/boms' },
      { text: 'Productos', link: '/textile/products' },
      { text: 'Presupuestos', link: '/textile/budgets' },
    ],
  },
  {
    label: 'Account',
    icon: <Person />,
    submenu: [
      { text: 'Profile', link: '/profile' },
    ],
  },
  {
    label: 'Settings',
    icon: <Settings />,
    submenu: [
      { text: 'Preferences', link: '/settings' },
    ],
  },
  {
    label: 'Help',
    icon: <Help />,
    submenu: [
      { text: 'Documentation', link: '/help/docs' },
      { text: 'Support', link: '/help/support' },
    ],
  },
];
