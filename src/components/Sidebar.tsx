import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  BarChart3,
  MessageSquare,
  Settings,
  Sparkles,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'patients' | 'followups' | 'analytics' | 'whatsapp' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingFollowupsCount: number;
  todayFollowupsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingFollowupsCount,
  todayFollowupsCount,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients' as NavTab, label: 'Patients', icon: Users },
    {
      id: 'followups' as NavTab,
      label: 'Follow-ups',
      icon: CalendarClock,
      badge: todayFollowupsCount > 0 ? `${todayFollowupsCount} Today` : (pendingFollowupsCount > 0 ? `${pendingFollowupsCount}` : undefined),
      badgeColor: todayFollowupsCount > 0 ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white',
    },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'whatsapp' as NavTab, label: 'WhatsApp', icon: MessageSquare, badge: 'Auto', badgeColor: 'bg-emerald-600 text-white' },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* Clinic Brand Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xl shadow-md border border-blue-500">
            🦷
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">
              DentCare CRM
            </h1>
            <p className="text-xs text-blue-400 font-medium">
              Clinic & WhatsApp Auto
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-semibold text-sm transition-colors text-left ${
                isActive
                  ? 'bg-blue-700 text-white shadow-sm border border-blue-600'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* WhatsApp Automation Live Status Card */}
      <div className="p-3 m-3 bg-slate-800/90 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          WhatsApp API Connected
        </div>
        <p className="text-[12px] text-slate-300 leading-snug">
          Automated welcome messages & follow-up reminders active.
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Timing: 1d, 2d, Same day</span>
          <span className="text-emerald-400 font-semibold">Active</span>
        </div>
      </div>

      {/* Receptionist Quick Help */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
        <div className="flex items-center gap-2 mb-1 text-slate-300 font-semibold">
          <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
          Reception Desk
        </div>
        <div className="text-[11px] text-slate-400">
          Clinic: +91 98765 43210
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          DentCare Dental Clinic v2.6
        </div>
      </div>
    </aside>
  );
};
