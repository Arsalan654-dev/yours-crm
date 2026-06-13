'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [botEnabled, setBotEnabled] = useState<boolean>(true);
  const [isUpdatingBot, setIsUpdatingBot] = useState(false);
  const [marqueeText, setMarqueeText] = useState('');

  let pageTitle = 'Client Portal';
  let pageSubtitle = '';

  if (pathname === '/client-portal/whatsapp') {
    pageTitle = 'WhatsApp Engine';
    pageSubtitle = 'Connect your business WhatsApp number to the AI Agent.';
  } else if (pathname === '/client-portal/settings') {
    pageTitle = 'Portal Settings';
    pageSubtitle = 'Manage your company profile and global AI chatbot configurations.';
  } else if (pathname === '/client-portal/leads') {
    pageTitle = 'Lead Management';
    pageSubtitle = 'View and manage leads captured by your AI agent.';
  } else if (pathname === '/client-portal/knowledge-base') {
    pageTitle = 'Knowledge Base';
    pageSubtitle = 'Manage the data and documents your AI Agent uses to answer questions.';
  }

  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    const userData = localStorage.getItem('crm_user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== 'CLIENT') {
        router.push('/');
        return;
      }
      setUser(parsed);
      
      // Fetch current bot status
      fetch('http://localhost:5000/api/clients/portal/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.agentConfig && data.agentConfig.isActive !== undefined) {
          setBotEnabled(data.agentConfig.isActive);
        }
      })
      .catch(console.error);

      // Fetch global settings (marquee)
      fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.COMPANY_MARQUEE) {
          setMarqueeText(data.COMPANY_MARQUEE);
        }
      })
      .catch(console.error);

    } catch (e) {
      router.push('/');
    }
  }, [router]);

  const toggleGlobalBot = async () => {
    try {
      setIsUpdatingBot(true);
      const token = localStorage.getItem('crm_token');
      const res = await fetch('http://localhost:5000/api/clients/portal/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isActive: !botEnabled })
      });
      if (res.ok) {
        setBotEnabled(!botEnabled);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingBot(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-[#0a1142] font-medium">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-gray-800 flex font-sans">
      <Sidebar role="CLIENT" />
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Navbar */}
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <div className="text-xl font-bold text-[#0a1142] tracking-tight">{pageTitle}</div>
            {pageSubtitle && <div className="text-sm text-gray-500 font-medium mt-0.5">{pageSubtitle}</div>}
          </div>
          <div className="flex items-center space-x-6">
            
            {/* Global Kill Switch */}
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <span className="text-sm font-bold text-gray-700">AI Agent Status</span>
              <button 
                onClick={toggleGlobalBot}
                disabled={isUpdatingBot}
                className={`w-12 h-6 rounded-full flex items-center transition-colors p-1 ${botEnabled ? 'bg-emerald-500' : 'bg-red-500'} ${isUpdatingBot ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                title={botEnabled ? "Agent is Active. Click to turn off globally." : "Agent is Disabled. Click to activate globally."}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${botEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div className="flex items-center space-x-4 border-l pl-6 border-gray-200">
              <div className="text-sm">
                <span className="text-gray-500">Welcome, </span>
                <span className="font-semibold text-[#d51381]">{user.email}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0a1142] to-[#d51381] text-white flex items-center justify-center font-bold text-sm shadow-md">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </nav>
        
        {marqueeText && (
          <div className="bg-[#d51381] text-white py-2 overflow-hidden flex items-center shadow-inner relative">
            <style>
              {`
                @keyframes marquee {
                  0% { transform: translateX(100vw); }
                  100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                  display: inline-block;
                  white-space: nowrap;
                  animation: marquee 30s linear infinite;
                  padding-left: 100%;
                }
              `}
            </style>
            <div className="animate-marquee font-bold text-sm tracking-wide">
              {marqueeText}
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
