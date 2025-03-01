import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  WrenchIcon,
  DocumentIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface SubNavigationItem {
  name: string;
  href: string;
}

interface NavigationItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  subItems?: SubNavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    icon: HomeIcon, 
    href: '/dashboard' 
  },
  { 
    name: 'Administrator', 
    icon: UserGroupIcon,
    subItems: [
      { name: 'Clients', href: '/admin/clients' },
      { name: 'Users', href: '/admin/users' },
      { name: 'Client Types', href: '/admin/client-types' },
    ]
  },
  { 
    name: 'Services', 
    icon: WrenchIcon, 
    href: '/services' 
  },
  { 
    name: 'Proposals', 
    icon: DocumentIcon, 
    href: '/proposals' 
  },
  { 
    name: 'Projects', 
    icon: ClipboardDocumentListIcon, 
    href: '/projects' 
  },
  { 
    name: 'Documents', 
    icon: DocumentIcon,
    subItems: [
      { name: 'Counter Proposals', href: '/documents/counter-proposals' },
      { name: 'All Documents', href: '/documents/all' },
    ]
  },
  { 
    name: 'Project Manager', 
    icon: ClipboardDocumentListIcon,
    subItems: [
      { name: 'Tasks', href: '/projects/tasks' },
      { name: 'Exchange Requests', href: '/projects/exchange-requests' },
    ]
  },
  { 
    name: 'Finance', 
    icon: CurrencyDollarIcon,
    subItems: [
      { name: 'Billing', href: '/finance/billing' },
      { name: 'Payroll', href: '/finance/payroll' },
    ]
  },
  { 
    name: 'Reports', 
    icon: ChartBarIcon,
    subItems: [
      { name: 'Reports', href: '/reports/all' },
      { name: 'Logs', href: '/reports/logs' },
      { name: 'Bin', href: '/reports/bin' },
      { name: 'Back Up', href: '/reports/backup' },
    ]
  },
  { 
    name: 'Messenger', 
    icon: ChatBubbleLeftRightIcon, 
    href: '/messenger' 
  },
  { 
    name: 'Settings', 
    icon: Cog6ToothIcon, 
    href: '/settings' 
  },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
  };

  return (
    <nav className="flex flex-col w-64 h-screen bg-gray-800 text-white">
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-5 px-2 pt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isItemExpanded = expandedItems.includes(item.name);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isActiveParent = hasSubItems && item.subItems?.some(subItem => isActive(subItem.href));

            return (
              <li key={item.name}>
                {hasSubItems ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActiveParent ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      {isItemExpanded ? (
                        <ChevronDownIcon className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </button>
                    {isItemExpanded && (
                      <ul className="ml-9 mt-1 space-y-1">
                        {item.subItems?.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              to={subItem.href}
                              className={`block px-3 py-2 rounded-lg transition-colors duration-200 ${
                                isActive(subItem.href)
                                  ? 'bg-indigo-500 text-white'
                                  : 'text-gray-400 hover:bg-gray-700'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href || '#'}
                    className={`flex items-center gap-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive(item.href || '')
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-x-3 px-3 py-2 w-full rounded-lg text-gray-300 hover:bg-gray-700 transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation; 