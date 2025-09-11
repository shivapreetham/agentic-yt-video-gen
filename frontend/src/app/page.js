'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import AgenticDashboard from '../components/AgenticDashboard';
import CustomVideoPage from '../components/CustomVideoPage';
import DataManager from '../components/DataManager';
import SettingsPage from '../components/SettingsPage';

export default function Home() {
  const [activeTab, setActiveTab] = useState('agent');















  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'agent':
        return <AgenticDashboard />;
      case 'custom':
        return <CustomVideoPage />;
      case 'data':
        return <DataManager />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <AgenticDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
}