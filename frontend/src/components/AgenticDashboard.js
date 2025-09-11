'use client';

import { useState, useEffect, useRef } from 'react';
import ProgressBar from './ProgressBar';

export default function AgenticDashboard() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [cloudflareStatus, setCloudflareStatus] = useState(null);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [activityStream, setActivityStream] = useState(null);
  const [metrics, setMetrics] = useState(null);
  
  // Control states
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Topic generation
  // Workflow inputs
  const [workflowDomain, setWorkflowDomain] = useState('');
  const [workflowVideoCount, setWorkflowVideoCount] = useState(5);
  const [videoFormat, setVideoFormat] = useState('mobile'); // mobile or desktop
  const [reviewTopics, setReviewTopics] = useState([]);
  const [showTopicReview, setShowTopicReview] = useState(false);
  
  // OAuth management
  const [oauthKey, setOauthKey] = useState('');
  const [uploadPlatform, setUploadPlatform] = useState('youtube');
  
  // Polling
  const pollIntervalRef = useRef(null);
  
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  useEffect(() => {
    // Start polling when component mounts
    startPolling();
    loadInitialData();
    
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
    
    pollIntervalRef.current = setInterval(() => {
      fetchSystemStatus();
      fetchQueueStatus();
      fetchCloudflareStatus();
    }, 5000); // Poll every 5 seconds
  };
  
  const loadInitialData = async () => {
    await Promise.all([
      fetchSystemStatus(),
      fetchQueueStatus(),
      fetchCloudflareStatus(),
      fetchCompletedVideos(),
      fetchActivityStream(),
      fetchMetrics()
    ]);
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
  
  const fetchQueueStatus = async () => {
    try {
      const response = await fetch(`${apiBase}/agentic/queue-status`);
      const data = await response.json();
      setQueueStatus(data.queue_status);
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };
  
  const fetchCloudflareStatus = async () => {
    try {
      const response = await fetch(`${apiBase}/cloudflare/storage-status`);
      const data = await response.json();
      setCloudflareStatus(data);
    } catch (error) {
      console.error('Error fetching Cloudflare status:', error);
    }
  };
  
  const fetchCompletedVideos = async () => {
    try {
      const response = await fetch(`${apiBase}/agentic/completed-videos?limit=10`);
      const data = await response.json();
      setCompletedVideos(data.completed_videos || []);
    } catch (error) {
      console.error('Error fetching completed videos:', error);
    }
  };
  
  const fetchActivityStream = async () => {
    try {
      const response = await fetch(`${apiBase}/polling/activity-stream`);
      const data = await response.json();
      setActivityStream(data.activity_stream);
    } catch (error) {
      console.error('Error fetching activity stream:', error);
    }
  };
  
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${apiBase}/polling/metrics`);
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };
  
  const deleteQueueItem = async (jobId, topic) => {
    if (!confirm(`Are you sure you want to delete "${topic}" from the queue?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/agentic/cancel-job/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Successfully removed "${topic}" from queue!`);
        loadInitialData();
      } else {
        alert('Failed to delete job: ' + data.message);
      }
    } catch (error) {
      alert('Error deleting job: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const startWorkflow = async () => {
    if (!workflowDomain.trim()) {
      alert('Please enter a domain');
      return;
    }
    
    if (workflowVideoCount < 1 || workflowVideoCount > 20) {
      alert('Please enter a video count between 1 and 20');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/agentic/submit-high-level-topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          high_level_topic: workflowDomain,
          video_count: workflowVideoCount,
          video_format: videoFormat
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`🚀 Workflow started! Generated ${data.topics_generated} engaging topics from "${workflowDomain}" and added ${data.jobs_added} jobs to processing queue!`);
        setWorkflowDomain('');
        loadInitialData();
      } else {
        alert('Failed to start workflow: ' + (data.message || data.error));
      }
    } catch (error) {
      alert('Error starting workflow: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  
  const approveSelectedTopics = async () => {
    const selectedTopics = reviewTopics.filter(topic => topic.selected);
    
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/agentic/approve-reviewed-topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_topics: selectedTopics })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Approved ${selectedTopics.length} topics and added to job queue!`);
        setShowTopicReview(false);
        loadInitialData();
      } else {
        alert('Failed to approve topics: ' + data.message);
      }
    } catch (error) {
      alert('Error approving topics: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const uploadNextVideoToCloudflare = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/upload/next-video-to-cloudflare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`📤 Video uploaded to Cloudflare!\n\nTopic: ${data.topic}\nLocal file deleted: ${data.local_file_deleted ? 'Yes' : 'No'}`);
        loadInitialData();
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      alert('Error uploading to Cloudflare: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const uploadVideoToPlatform = async (jobId = null) => {
    if (!oauthKey.trim()) {
      alert('Please enter your OAuth access key');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/upload/youtube-from-cloudflare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: oauthKey,
          job_id: jobId,
          platform: uploadPlatform,
          privacy_status: 'private'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`🎉 Video uploaded to ${uploadPlatform.toUpperCase()}!\n\nTopic: ${data.topic}\nVideo ID: ${data.video_id}\nOptimizations applied: ${data.optimization_applied.platform_specific ? 'Yes' : 'No'}`);
        loadInitialData();
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      alert(`Error uploading to ${uploadPlatform}: ` + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const completeUploadSequence = async () => {
    if (!oauthKey.trim()) {
      alert('Please enter your OAuth access key');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/workflow/complete-upload-sequence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: oauthKey,
          privacy_status: 'private'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`🎯 Complete upload sequence successful!\n\n📁 Cloudflare: ${data.cloudflare_url}\n📺 YouTube: ${data.youtube_url}\n🗑️ Local file deleted: ${data.local_file_deleted ? 'Yes' : 'No'}`);
        loadInitialData();
      } else {
        alert('Upload sequence failed: ' + data.message);
      }
    } catch (error) {
      alert('Error in upload sequence: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const cleanupCloudflareStorage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/cloudflare/cleanup-storage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      alert(`🧹 Cleanup completed!\n\nDeleted: ${data.deleted_videos?.length || 0} videos\nFreed space: ${data.total_freed_space_mb || 0} MB`);
      loadInitialData();
    } catch (error) {
      alert('Error cleaning up storage: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleTopicSelection = (index) => {
    setReviewTopics(prev => 
      prev.map((topic, i) => 
        i === index ? { ...topic, selected: !topic.selected } : topic
      )
    );
  };
  
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Controls */}
      <div className="glass rounded-2xl p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 mb-6">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center justify-center lg:justify-start space-x-3">
              <svg className="w-8 h-8 lg:w-10 lg:h-10 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
              </svg>
              <span>Agentic Video System</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm lg:text-base">AI-powered autonomous video generation pipeline</p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 bg-green-900/20 text-green-400 border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>System Ready</span>
            </div>
          </div>
        </div>
        
        {/* System Health Overview */}
        {systemStatus && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 p-4 lg:p-6 rounded-2xl border border-blue-600/30 hover:border-blue-500/50 transition-all hover-lift">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                </svg>
                <div className="text-2xl lg:text-3xl font-bold text-blue-400">{systemStatus.health?.jobs_in_queue || 0}</div>
              </div>
              <div className="text-sm text-gray-300 font-medium">Jobs Queued</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 p-4 lg:p-6 rounded-2xl border border-orange-600/30 hover:border-orange-500/50 transition-all hover-lift">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <div className="text-2xl lg:text-3xl font-bold text-orange-400">{systemStatus.health?.jobs_processing || 0}</div>
              </div>
              <div className="text-sm text-gray-300 font-medium">Processing</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 p-4 lg:p-6 rounded-2xl border border-green-600/30 hover:border-green-500/50 transition-all hover-lift">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <div className="text-2xl lg:text-3xl font-bold text-green-400">{systemStatus.health?.videos_ready || 0}</div>
              </div>
              <div className="text-sm text-gray-300 font-medium">Videos Ready</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 p-4 lg:p-6 rounded-2xl border border-purple-600/30 hover:border-purple-500/50 transition-all hover-lift">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div className="text-2xl lg:text-3xl font-bold text-purple-400">{cloudflareStatus?.storage_status?.current_videos || 0}/30</div>
              </div>
              <div className="text-sm text-gray-300 font-medium">Cloud Storage</div>
            </div>
          </div>
        )}
        
        {/* Start Workflow */}
        <div className="mb-6 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-600/50">
          <div className="flex items-center space-x-3 mb-6">
            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <h3 className="text-xl font-bold text-white">AI Video Workflow</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end mb-6">
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Domain
              </label>
              <input
                type="text"
                value={workflowDomain}
                onChange={(e) => setWorkflowDomain(e.target.value)}
                placeholder="e.g., Indian Mythology, Technology, Science..."
                className="w-full p-3 lg:p-4 input-dark rounded-xl border-2 border-transparent focus:border-green-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Number of Videos
              </label>
              <input
                type="number"
                value={workflowVideoCount}
                onChange={(e) => setWorkflowVideoCount(parseInt(e.target.value) || 1)}
                min="1"
                max="20"
                className="w-full p-3 lg:p-4 input-dark rounded-xl border-2 border-transparent focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Video Format
              </label>
              <select
                value={videoFormat}
                onChange={(e) => setVideoFormat(e.target.value)}
                className="w-full p-3 lg:p-4 input-dark rounded-xl border-2 border-transparent focus:border-purple-500 transition-all"
              >
                <option value="mobile">📱 Mobile (576x1024)</option>
                <option value="desktop">🖥️ Desktop (1024x576)</option>
              </select>
            </div>
            <button
              onClick={startWorkflow}
              disabled={isLoading || !workflowDomain.trim()}
              className="w-full px-6 py-3 lg:py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-all font-bold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Start Workflow</span>
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Domain → Agent generates engaging topics → Queue → Video generation ({videoFormat === 'mobile' ? 'Mobile 9:16' : 'Desktop 16:9'}) → R2 upload → Data storage
            </p>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-2 rounded-2xl border border-gray-700/50">
        <div className="grid grid-cols-3 gap-1">
          {[
            { key: 'overview', label: 'Overview', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
            { key: 'queue', label: 'Queue', icon: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z' },
            { key: 'activity', label: 'Activity', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 lg:px-6 lg:py-3 rounded-xl font-medium transition-all flex flex-col lg:flex-row items-center justify-center lg:space-x-2 space-y-1 lg:space-y-0 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d={tab.icon}/>
              </svg>
              <span className="text-xs lg:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metrics */}
          {metrics && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">📊 Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Videos Generated:</span>
                  <span className="text-white font-medium">{metrics.performance?.total_videos_generated || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Success Rate:</span>
                  <span className="text-white font-medium">
                    {(metrics.performance?.success_rate * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Generation Time:</span>
                  <span className="text-white font-medium">
                    {formatDuration(metrics.performance?.average_generation_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Storage Used:</span>
                  <span className="text-white font-medium">
                    {formatBytes(metrics.storage?.total_storage_used)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Recent Activity */}
          {activityStream && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">⚡ Recent Activity</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activityStream.latest_completed?.slice(0, 5).map((job, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{job.topic}</div>
                      <div className="text-xs text-gray-400">{job.domain} • {job.progress}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'queue' && queueStatus && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
            </svg>
            <h3 className="text-xl font-semibold text-white">Job Queue Management</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(queueStatus.by_status || {}).map(([status, count]) => (
              <div key={status} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                <div className="text-2xl font-bold text-blue-400">{count}</div>
                <div className="text-sm text-gray-400 capitalize">{status}</div>
              </div>
            ))}
          </div>
          
          {queueStatus.processing_jobs?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="2"/>
                </svg>
                <h4 className="text-lg font-semibold text-white">Currently Processing</h4>
              </div>
              <div className="space-y-4">
                {queueStatus.processing_jobs.map((job, index) => (
                  <div key={index} className="p-4 glass rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h5 className="text-white font-medium">{job.topic}</h5>
                        <div className="text-sm text-gray-400">{job.domain}</div>
                      </div>
                      <div className="text-orange-400 font-semibold">{job.progress}%</div>
                    </div>
                    
                    {job.job_id && (
                      <ProgressBar 
                        jobId={job.job_id}
                        autoStart={true}
                        showDetails={false}
                        onComplete={() => {
                          setTimeout(() => {
                            loadInitialData();
                          }, 1000);
                        }}
                      />
                    )}
                    
                    <div className="mt-2 text-xs text-gray-500">{job.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {queueStatus.next_jobs?.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <h4 className="text-lg font-semibold text-white">Next in Queue</h4>
              </div>
              <div className="space-y-2">
                {queueStatus.next_jobs.map((job, index) => (
                  <div key={index} className="p-3 bg-gray-800/30 rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white">{job.topic}</div>
                      <div className="text-sm text-gray-400">{job.domain}</div>
                    </div>
                    <button
                      onClick={() => deleteQueueItem(job.job_id || job.id, job.topic)}
                      disabled={isLoading}
                      className="ml-3 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                      title="Remove from queue"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      
      
      
      {activeTab === 'activity' && activityStream && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">📈 Activity Stream</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-blue-400">{activityStream.summary?.total_jobs || 0}</div>
              <div className="text-sm text-gray-400">Total Jobs</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-green-400">{activityStream.summary?.recently_completed || 0}</div>
              <div className="text-sm text-gray-400">Recently Completed</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-orange-400">{activityStream.summary?.currently_processing || 0}</div>
              <div className="text-sm text-gray-400">Processing</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-red-400">{activityStream.summary?.failed || 0}</div>
              <div className="text-sm text-gray-400">Failed</div>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityStream.recent_jobs?.map((job, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  job.status === 'completed' ? 'bg-green-400' :
                  job.status === 'processing' ? 'bg-orange-400' :
                  job.status === 'failed' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
                <div className="flex-1">
                  <div className="text-white">{job.topic}</div>
                  <div className="text-sm text-gray-400">
                    {job.domain} • {job.status} • {job.progress}%
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(job.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Topic Review Modal */}
      {showTopicReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">📝 Review Generated Topics</h3>
              <button
                onClick={() => setShowTopicReview(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                Selected: {reviewTopics.filter(t => t.selected).length} / {reviewTopics.length}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setReviewTopics(prev => prev.map(t => ({...t, selected: true})))}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded"
                >
                  Select All
                </button>
                <button
                  onClick={() => setReviewTopics(prev => prev.map(t => ({...t, selected: false})))}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {reviewTopics.map((topic, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    topic.selected 
                      ? 'bg-blue-900/20 border-blue-500/30' 
                      : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => toggleTopicSelection(index)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-4 h-4 rounded border-2 mt-1 flex items-center justify-center ${
                      topic.selected ? 'bg-blue-600 border-blue-600' : 'border-gray-500'
                    }`}>
                      {topic.selected && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{topic.topic}</div>
                      <div className="text-sm text-gray-400 mb-1">{topic.domain}</div>
                      <div className="text-xs text-gray-500">
                        Keywords: {topic.keywords?.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTopicReview(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={approveSelectedTopics}
                disabled={isLoading || reviewTopics.filter(t => t.selected).length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : `Approve ${reviewTopics.filter(t => t.selected).length} Topics`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}