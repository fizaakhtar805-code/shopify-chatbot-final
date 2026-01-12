
import React from 'react';

interface ShopifyLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ShopifyLayout: React.FC<ShopifyLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'chat', label: 'Live Preview', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: 'settings', label: 'AI Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <div className="flex h-screen bg-[#f6f6f7] font-sans text-[#202223]">
      {/* Shopify Sidebar */}
      <aside className="w-60 bg-[#ebebed] border-r border-[#d2d5d9] flex flex-col hidden md:flex">
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#008060] rounded flex items-center justify-center text-white font-bold text-lg">S</div>
          <span className="font-semibold text-sm">efashion-store</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === item.id 
                  ? 'bg-white text-[#202223] shadow-sm' 
                  : 'text-[#5c5f62] hover:bg-[#e4e5e7]'
              }`}
            >
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#d2d5d9]">
          <div className="flex items-center gap-2 text-xs text-[#6d7175]">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            App is Live
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-[#d2d5d9] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-[#5c5f62]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <div className="text-sm font-semibold flex items-center gap-2">
              <span className="text-[#6d7175]">Apps</span>
              <span className="text-[#d2d5d9]">/</span>
              <span>Efashion AI Stylist</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-[#f1f2f3] border-none rounded-md px-3 py-1.5 text-xs w-48 focus:ring-1 focus:ring-[#008060]"
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f1f2f3] border border-[#d2d5d9] flex items-center justify-center">
              <span className="text-xs font-bold">EF</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ShopifyLayout;
