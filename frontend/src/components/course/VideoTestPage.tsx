// VideoTestPage.tsx - Test page for troubleshooting video issues
import React, { useState } from 'react';
import { VIDEO_CDN_CONFIG } from '../../config/videoCDN';

export const VideoTestPage: React.FC = () => {
  const [videoId, setVideoId] = useState('40ee50ee33b5c45d703686e5af858a2e');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testCloudflareUrl = () => {
    const hlsUrl = VIDEO_CDN_CONFIG.cloudflare.getHLSUrl(videoId);
    const iframeUrl = VIDEO_CDN_CONFIG.cloudflare.getIframeUrl(videoId);
    
    addResult(`Cloudflare HLS URL: ${hlsUrl}`);
    addResult(`Cloudflare iframe URL: ${iframeUrl}`);
    
    // Test URL accessibility
    fetch(hlsUrl, { method: 'HEAD' })
      .then(response => {
        addResult(`HLS URL response: ${response.status} ${response.statusText}`);
        if (response.ok) {
          addResult('✅ HLS URL is accessible');
        } else {
          addResult('❌ HLS URL returned error');
        }
      })
      .catch(error => {
        addResult(`❌ HLS URL fetch error: ${error.message}`);
      });
  };

  const testDirectVideo = () => {
    const videoUrl = `https://customer-${VIDEO_CDN_CONFIG.cloudflare.customerCode}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
    
    addResult(`Testing direct video access: ${videoUrl}`);
    
    // Create a test video element
    const video = document.createElement('video');
    video.src = videoUrl;
    video.load();
    
    video.addEventListener('loadstart', () => {
      addResult('📹 Video load started');
    });
    
    video.addEventListener('canplay', () => {
      addResult('✅ Video can play');
    });
    
    video.addEventListener('error', (e) => {
      addResult(`❌ Video error: ${e.type}`);
    });
    
    video.addEventListener('loadedmetadata', () => {
      addResult(`📹 Video metadata loaded: ${video.duration}s duration`);
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Video Troubleshooting Test Page</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Video ID:
        </label>
        <input
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter Cloudflare video ID"
        />
      </div>

      <div className="mb-6 space-x-4">
        <button
          onClick={testCloudflareUrl}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test Cloudflare URLs
        </button>
        
        <button
          onClick={testDirectVideo}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Test Direct Video
        </button>
        
        <button
          onClick={clearResults}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Configuration Info:</h2>
        <div className="bg-gray-100 p-4 rounded text-sm">
          <div>Customer Code: {VIDEO_CDN_CONFIG.cloudflare.customerCode}</div>
          <div>Video ID: {videoId}</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-gray-500">No tests run yet...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">{result}</div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Manual Tests:</h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong>1. Test HLS URL in browser:</strong>
            <br />
            <a 
              href={VIDEO_CDN_CONFIG.cloudflare.getHLSUrl(videoId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {VIDEO_CDN_CONFIG.cloudflare.getHLSUrl(videoId)}
            </a>
          </div>
          
          <div>
            <strong>2. Test iframe URL in browser:</strong>
            <br />
            <a 
              href={VIDEO_CDN_CONFIG.cloudflare.getIframeUrl(videoId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {VIDEO_CDN_CONFIG.cloudflare.getIframeUrl(videoId)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
