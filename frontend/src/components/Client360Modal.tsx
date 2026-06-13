import React, { useState } from 'react';
import { X, User, Building2, Mail, Phone, Calendar, Globe, Zap, CreditCard, Activity, Link as LinkIcon, BookOpen, Users, DollarSign, Database, MessageSquare } from 'lucide-react';

interface Client360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any | null;
}

export default function Client360Modal({ isOpen, onClose, client }: Client360ModalProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'kb' | 'leads' | 'billing'>('config');

  if (!isOpen || !client) return null;

  const tabs = [
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'kb', label: 'Knowledge Base', icon: Database },
    { id: 'leads', label: 'Leads Data', icon: Users },
    { id: 'billing', label: 'Billing & Financials', icon: DollarSign }
  ];

  function Settings(props: any) {
    return <Zap {...props} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-[#0a1142]/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-extrabold shadow-sm border-2 border-white ring-2 ring-emerald-50">
              {client.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0a1142] tracking-tight">{client.name}</h2>
              <p className="text-gray-500 font-medium flex items-center">
                <Building2 className="w-4 h-4 mr-1.5 opacity-70" /> {client.companyName}
              </p>
            </div>
            <div className="ml-4 pl-4 border-l border-gray-100">
              {client.status === 'ACTIVE' ? (
                <span className="inline-flex items-center text-[#059669] bg-[#ecfdf5] px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> ACTIVE SUBSCRIPTION
                </span>
              ) : (
                <span className="inline-flex items-center text-[#dc2626] bg-[#fef2f2] px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-red-100">
                  SUSPENDED
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col p-4 space-y-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">360° View Dashboard</div>
            
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-3 w-full px-4 py-3.5 rounded-xl transition-all font-semibold ${
                    isActive 
                      ? 'bg-[#0a1142] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-200/50 hover:text-[#0a1142]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-white p-8">
            
            {activeTab === 'config' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-8">
                  {/* Identity & Contact */}
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-[#0a1142] uppercase tracking-wider flex items-center border-b border-gray-100 pb-3">
                      <User className="w-4 h-4 mr-2 text-[#d51381]" /> Business Identity
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Owner Name</p>
                        <p className="text-base font-semibold text-gray-800">{client.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Company</p>
                        <p className="text-base font-semibold text-gray-800">{client.companyName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Email</p>
                        <p className="text-base font-semibold text-gray-800">{client.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Phone</p>
                        <p className="text-base font-semibold text-gray-800">{client.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Integration */}
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-[#0a1142] uppercase tracking-wider flex items-center border-b border-gray-100 pb-3">
                      <Activity className="w-4 h-4 mr-2 text-blue-500" /> Technical Integration
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center"><Activity className="w-3 h-3 mr-1"/> WhatsApp Instance</p>
                        <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-700">{client.instanceName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center"><LinkIcon className="w-3 h-3 mr-1"/> n8n Webhook URL</p>
                        <p className="text-sm font-mono bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 text-blue-700 break-all">{client.n8nWebhookUrl || 'Not configured'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center"><Globe className="w-3 h-3 mr-1"/> Evolution API Base URL</p>
                        <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 truncate">{client.evolutionApiUrl || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center"><Zap className="w-3 h-3 mr-1"/> Evolution API Key</p>
                        <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-600">{client.evolutionApiKey ? '••••••••••••••••' : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kb' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#0a1142]">Knowledge Base Entries</h3>
                    <p className="text-gray-500 text-sm">Data used by the AI to answer on behalf of this client.</p>
                  </div>
                  <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-bold text-sm border border-orange-100">
                    Total Entries: {client._count?.knowledgeBases || 0}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">To view and edit full KB entries, navigate to the unified Knowledge Base module.</p>
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#0a1142]">Leads Generated</h3>
                    <p className="text-gray-500 text-sm">Customers acquired by the AI for this client.</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg font-bold text-sm border border-emerald-100">
                    Total Leads: {client._count?.leads || 0}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">To view detailed conversations, navigate to the unified Leads module.</p>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-[#0a1142] mb-6">Billing & Financials</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Current Plan</p>
                    <p className="text-3xl font-extrabold text-[#0a1142]">{client.subscriptionPlan} <span className="text-lg text-gray-400 font-medium">Plan</span></p>
                    <div className="mt-6 flex items-center text-sm font-medium text-gray-500">
                      <CreditCard className="w-4 h-4 mr-2" /> Auto-renews via Invoice
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Payment Status</p>
                    <p className="text-3xl font-extrabold text-emerald-700">{client.paymentStatus || 'PAID'}</p>
                    <div className="mt-6 flex items-center text-sm font-medium text-emerald-600">
                      <Calendar className="w-4 h-4 mr-2" /> Active until next cycle
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Recent Invoices</h4>
                  <p className="text-gray-500 text-sm italic">Invoices will appear here once processed by the system.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
