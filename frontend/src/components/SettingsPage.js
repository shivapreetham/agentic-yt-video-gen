'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [oauthCredentials, setOauthCredentials] = useState({
    youtube_client_id: '',
    youtube_client_secret: '',
    youtube_access_token: '',
    youtube_refresh_token: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      // Load OAuth credentials
      const oauthResponse = await fetch(`${apiBase}/oauth/credentials`);
      if (oauthResponse.ok) {
        const oauthData = await oauthResponse.json();
        setOauthCredentials(oauthData.credentials || {});
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveOauthCredentials = async () => {
    setIsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/oauth/update-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials: oauthCredentials })
      });

      if (response.ok) {
        alert('✅ OAuth credentials saved successfully!');
      } else {
        throw new Error('Failed to save credentials');
      }
    } catch (error) {
      console.error('Error saving OAuth credentials:', error);
      alert('❌ Failed to save OAuth credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const testOauthConnection = async () => {
    setIsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/oauth/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials: oauthCredentials })
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ OAuth connection test successful!');
      } else {
        alert(`❌ OAuth connection failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing OAuth connection:', error);
      alert('❌ Failed to test OAuth connection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Modern Header */}
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        </div>
        <h1 className="text-2xl lg:text-4xl font-bold text-gradient mb-2">OAuth Configuration</h1>
        <p className="text-sm lg:text-lg text-gray-400 max-w-2xl mx-auto px-4">Configure your YouTube API credentials for automated video uploads</p>
      </div>

      {/* OAuth Credentials Section */}
      <div className="space-y-8">
        <div className="glass rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-white flex items-center space-x-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span>YouTube OAuth Setup</span>
              </h3>
              <p className="text-gray-400 mt-2 text-sm lg:text-base">Configure your YouTube API credentials for automated video uploads</p>
            </div>
            <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
              <button
                onClick={testOauthConnection}
                disabled={isLoading}
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span className="text-sm lg:text-base">Test Connection</span>
              </button>
              <button
                onClick={saveOauthCredentials}
                disabled={isLoading}
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
                <span className="text-sm lg:text-base">Save Credentials</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-200 mb-3">
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  <span>Client ID</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={oauthCredentials.youtube_client_id}
                  onChange={(e) => setOauthCredentials(prev => ({
                    ...prev,
                    youtube_client_id: e.target.value
                  }))}
                  placeholder="123456789-abcdefghij.apps.googleusercontent.com"
                  className="w-full p-4 input-dark rounded-xl border-2 border-transparent focus:border-red-500 transition-all font-mono text-sm"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-200 mb-3">
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  <span>Client Secret</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={oauthCredentials.youtube_client_secret}
                  onChange={(e) => setOauthCredentials(prev => ({
                    ...prev,
                    youtube_client_secret: e.target.value
                  }))}
                  placeholder="GOCSPX-************************"
                  className="w-full p-4 input-dark rounded-xl border-2 border-transparent focus:border-red-500 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-200 mb-3">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Access Token</span>
                </label>
                <input
                  type="password"
                  value={oauthCredentials.youtube_access_token}
                  onChange={(e) => setOauthCredentials(prev => ({
                    ...prev,
                    youtube_access_token: e.target.value
                  }))}
                  placeholder="ya29.************************"
                  className="w-full p-4 input-dark rounded-xl border-2 border-transparent focus:border-blue-500 transition-all font-mono text-sm"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-200 mb-3">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                  <span>Refresh Token</span>
                </label>
                <input
                  type="password"
                  value={oauthCredentials.youtube_refresh_token}
                  onChange={(e) => setOauthCredentials(prev => ({
                    ...prev,
                    youtube_refresh_token: e.target.value
                  }))}
                  placeholder="1//************************"
                  className="w-full p-4 input-dark rounded-xl border-2 border-transparent focus:border-purple-500 transition-all font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📝</span>
            </div>
            <h4 className="font-semibold text-blue-300">Quick Setup Guide</h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ol className="text-sm text-blue-200 space-y-2 list-decimal list-inside">
              <li>Visit <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline font-medium">Google Cloud Console</a></li>
              <li>Create or select a project</li>
              <li>Enable <span className="bg-blue-800/50 px-2 py-1 rounded font-mono text-xs">YouTube Data API v3</span></li>
            </ol>
            <ol className="text-sm text-blue-200 space-y-2 list-decimal list-inside" start="4">
              <li>Create OAuth 2.0 credentials</li>
              <li>Use <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline font-medium">OAuth Playground</a> for tokens</li>
              <li>Test your connection above</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Enhanced Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 flex flex-col items-center space-y-4 border border-gray-600/50 shadow-2xl">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-purple-500/20 border-r-purple-500 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">Processing Configuration...</div>
              <div className="text-gray-400 text-sm mt-1">Please wait while we save your settings</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}