'use client';

import { useState, useEffect, useRef } from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [queueStatus, setQueueStatus] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const pollIntervalRef = useRef(null);
  
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  useEffect(() => {
    // Start polling when navbar mounts
    startPolling();
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);
  
  const startPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    // Initial fetch
    fetchQueueStatus();
    fetchSystemStatus();
    
    // Poll every 3 seconds for real-time updates
    pollIntervalRef.current = setInterval(() => {
      fetchQueueStatus();
      fetchSystemStatus();
    }, 3000);
  };
  
  const fetchQueueStatus = async () => {
    try {
      const response = await fetch(`${apiBase}/agentic/queue-status`);
      const data = await response.json();
      setQueueStatus(data.queue_status);
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };
  
  const fetchSystemStatus = async () => {
    try {
      const response = await fetch(`${apiBase}/polling/system-status`);
      const data = await response.json();
      setSystemStatus(data.system_status);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };
  
  const getTotalActiveJobs = () => {
    if (!queueStatus) return 0;
    return (queueStatus.by_status?.processing || 0) + (queueStatus.by_status?.pending || 0);
  };
  
  const getProcessingJobs = () => {
    return queueStatus?.by_status?.processing || 0;
  };
  
  const isSystemActive = () => {
    return systemStatus?.health?.workers_running || false;
  };
  return (
    <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-white">Video Generator</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-baseline space-x-4">
              <NavLink 
                active={activeTab === 'agent'} 
                onClick={() => setActiveTab('agent')}
                icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>}
                text="Agent"
              />
              <NavLink 
                active={activeTab === 'custom'} 
                onClick={() => setActiveTab('custom')}
                icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>}
                text="Custom"
              />
              <NavLink 
                active={activeTab === 'data'} 
                onClick={() => setActiveTab('data')}
                icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>}
                text="Data"
              />
              <NavLink 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')}
                icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>}
                text="Settings"
              />
            </div>
            
            {/* Queue Status Indicator */}
            <div className="flex items-center space-x-3">
              {/* System Status Indicator */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${
                isSystemActive()
                  ? 'bg-green-900/30 text-green-400 border-green-500/30'
                  : 'bg-gray-800/50 text-gray-400 border-gray-600/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isSystemActive() ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                }`}></div>
                <span>System</span>
              </div>
              
              {/* Queue Activity */}
              <div className="relative">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                  getTotalActiveJobs() > 0
                    ? 'bg-blue-900/30 text-blue-400 border-blue-500/30'
                    : 'bg-gray-800/50 text-gray-400 border-gray-600/30'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                  </svg>
                  <span>{getTotalActiveJobs()}</span>
                </div>
                
                {/* Processing indicator */}
                {getProcessingJobs() > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile queue status + menu */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Queue Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isSystemActive() ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
              }`}></div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                getTotalActiveJobs() > 0
                  ? 'bg-blue-900/30 text-blue-400'
                  : 'bg-gray-800/50 text-gray-400'
              }`}>
                {getTotalActiveJobs()}
              </div>
            </div>
            
            <button className="text-gray-300 hover:text-white p-2 rounded-md">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ active, onClick, icon, text }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
        active
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg'
          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
      }`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}