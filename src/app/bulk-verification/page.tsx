'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { API_BASE_URL } from '@/lib/api';

interface ContactPreview {
  firstName: string;
  lastName: string;
  type: string;
  email: string;
  phone?: string;
  status: string;
  originalRow: number;
}

interface UploadResponse {
  fileName: string;
  totalContacts: number;
  cteContacts: number;
  contacts: ContactPreview[];
  cteContactsPreview: ContactPreview[];
  filePath: string;
}

interface BatchProgress {
  id: string;
  totalContacts: number;
  processedContacts: number;
  successCount: number;
  errorCount: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  startTime: string;
  estimatedCompletion?: string;
  currentContact?: string;
}

interface VerificationResult {
  contact: ContactPreview;
  success: boolean;
  certifications?: any[];
  expirationAlerts?: Array<{
    certification: string;
    expirationDate: string;
    daysUntilExpiration: number;
    severity: 'critical' | 'warning' | 'notice';
  }>;
  scedCodes?: string[];
  error?: string;
}

export default function BulkVerificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [batchResults, setBatchResults] = useState<VerificationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filterCTEOnly, setFilterCTEOnly] = useState(true);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [pollingInterval, setPollingInterval] = useState(5000); // Start with 5 second intervals
  const [retryCount, setRetryCount] = useState(0);

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    console.log('File type:', file?.type);
    console.log('File name:', file?.name);
    
    if (file) {
      // Accept both text/csv and files with .csv extension
      const isValidCSV = file.type === 'text/csv' || 
                        file.type === 'application/vnd.ms-excel' ||
                        file.name.toLowerCase().endsWith('.csv');
      
      if (isValidCSV) {
        setSelectedFile(file);
        setUploadedFile(null);
        setBatchProgress(null);
        setBatchResults([]);
        setShowResults(false);
        console.log('Valid CSV file selected');
      } else {
        alert('Please select a valid CSV file');
        console.log('Invalid file type');
      }
    }
  };

  const handleFileUpload = async () => {
    console.log('Starting file upload...');
    console.log('Selected file:', selectedFile);
    console.log('User logged in:', !!user);
    
    // Get token from localStorage directly
    const token = localStorage.getItem('token');
    console.log('Token available:', !!token);
    
    if (!selectedFile) {
      alert('Please select a CSV file first');
      return;
    }
    
    if (!user || !token) {
      alert('Authentication required. Please log in again.');
      router.push('/login');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    console.log('FormData created, uploading to:', `${API_BASE_URL}/bulk-verification/upload`);

    try {
      const response = await fetch(`${API_BASE_URL}/bulk-verification/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with response:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload response data:', data);
      
      if (data.success) {
        setUploadedFile(data.data);
        console.log('File uploaded successfully');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const startBatchVerification = async () => {
    const token = localStorage.getItem('token');
    if (!uploadedFile || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bulk-verification/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: uploadedFile.filePath,
          options: { cteOnly: filterCTEOnly }
        }),
      });

      if (!response.ok) throw new Error('Failed to start verification');

      const data = await response.json();
      if (data.success) {
        setActiveBatchId(data.data.batchId);
        startProgressMonitoring(data.data.batchId);
      }
    } catch (error) {
      console.error('Start verification error:', error);
      alert('Failed to start batch verification');
    }
  };

  const startProgressMonitoring = (batchId: string) => {
    // Clear any existing interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    // Reset polling settings
    setPollingInterval(5000); // Start with 5 seconds
    setRetryCount(0);

    // Fetch progress immediately
    fetchBatchProgress(batchId);

    // Set up interval to fetch progress with dynamic interval
    const interval = setInterval(() => {
      fetchBatchProgress(batchId);
    }, 5000); // Always start with 5 seconds

    setProgressInterval(interval);
  };

  const fetchBatchProgress = async (batchId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bulk-verification/batch/${batchId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      if (response.status === 429) {
        // Rate limited - implement exponential backoff
        const newRetryCount = retryCount + 1;
        const backoffDelay = Math.min(30000, 5000 * Math.pow(2, newRetryCount)); // Max 30 seconds
        
        console.log(`Rate limited. Backing off for ${backoffDelay}ms (attempt ${newRetryCount})`);
        setRetryCount(newRetryCount);
        setPollingInterval(backoffDelay);
        
        // Restart interval with new delay
        if (progressInterval) {
          clearInterval(progressInterval);
          const newInterval = setInterval(() => {
            fetchBatchProgress(batchId);
          }, backoffDelay);
          setProgressInterval(newInterval);
        }
        return;
      }

      if (!response.ok) throw new Error(`Failed to fetch progress: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setBatchProgress(data.data);
        
        // Reset retry count on successful request
        setRetryCount(0);
        
        // Gradually reduce polling interval for successful requests
        if (pollingInterval > 5000) {
          setPollingInterval(Math.max(5000, pollingInterval * 0.8));
        }

        // If completed, fetch results and stop monitoring
        if (data.data.status === 'completed') {
          if (progressInterval) {
            clearInterval(progressInterval);
            setProgressInterval(null);
          }
          fetchBatchResults(batchId);
        }
      }
    } catch (error) {
      console.error('Fetch progress error:', error);
      
      // On other errors, increase polling interval slightly
      setPollingInterval(Math.min(15000, pollingInterval * 1.2));
    }
  };

  const fetchBatchResults = async (batchId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bulk-verification/batch/${batchId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch results');

      const data = await response.json();
      if (data.success) {
        setBatchResults(data.data.results);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Fetch results error:', error);
      alert('Failed to fetch verification results');
    }
  };

  const downloadResults = async () => {
    const token = localStorage.getItem('token');
    if (!activeBatchId || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bulk-verification/batch/${activeBatchId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to download results');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verification-results-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download results');
    }
  };

  const getProgressPercentage = () => {
    if (!batchProgress) return 0;
    return Math.round((batchProgress.processedContacts / batchProgress.totalContacts) * 100);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'notice': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Certification Verification</h1>
          <p className="mt-2 text-gray-600">Upload a CSV file to verify certifications for multiple teachers at once</p>
        </div>

        {/* Step 1: File Upload */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
            Upload CSV File
          </h2>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">CSV files only</p>
              </label>
            </div>

            {selectedFile && !uploadedFile && (
              <button
                onClick={(e) => {
                  console.log('Upload button clicked');
                  handleFileUpload();
                }}
                disabled={isUploading}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload and Analyze'}
              </button>
            )}
          </div>
        </div>

        {/* Step 2: File Preview */}
        {uploadedFile && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
              File Analysis
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{uploadedFile.totalContacts}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded">
                <p className="text-sm text-gray-600">CTE/WBL Contacts</p>
                <p className="text-2xl font-bold text-indigo-600">{uploadedFile.cteContacts}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Ready to Verify</p>
                <p className="text-2xl font-bold text-green-600">
                  {filterCTEOnly ? uploadedFile.cteContacts : uploadedFile.totalContacts}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filterCTEOnly}
                  onChange={(e) => setFilterCTEOnly(e.target.checked)}
                  className="mr-2"
                />
                <span>Verify CTE/WBL contacts only</span>
              </label>
            </div>

            {!activeBatchId && (
              <button
                onClick={startBatchVerification}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Start Verification Process
              </button>
            )}
          </div>
        )}

        {/* Step 3: Progress Monitoring */}
        {batchProgress && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
              Verification Progress
            </h2>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Processing: {batchProgress.processedContacts} / {batchProgress.totalContacts}</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {batchProgress.currentContact && (
              <p className="text-sm text-gray-600 mb-2">
                Currently processing: <span className="font-medium">{batchProgress.currentContact}</span>
              </p>
            )}

            {retryCount > 0 && (
              <p className="text-sm text-yellow-600 mb-2">
                Rate limited - polling every {Math.round(pollingInterval / 1000)}s (attempt {retryCount})
              </p>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Success</p>
                <p className="text-xl font-bold text-green-600">{batchProgress.successCount}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-xl font-bold text-red-600">{batchProgress.errorCount}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-xl font-bold capitalize">{batchProgress.status}</p>
              </div>
            </div>

            {batchProgress.status === 'completed' && (
              <button
                onClick={downloadResults}
                className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Download Results as CSV
              </button>
            )}
          </div>
        )}

        {/* Step 4: Results Display */}
        {showResults && batchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
              Verification Results
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {batchResults.slice(0, 20).map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${result.success ? 'border-green-200' : 'border-red-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {result.contact.firstName} {result.contact.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{result.contact.type}</p>
                      <p className="text-xs text-gray-500">{result.contact.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Verified' : 'Not Found'}
                    </span>
                  </div>

                  {result.certifications && result.certifications.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Certifications:</p>
                      <ul className="text-sm text-gray-600">
                        {result.certifications.map((cert: any, i: number) => (
                          <li key={i}>• {cert.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.expirationAlerts && result.expirationAlerts.length > 0 && (
                    <div className="mt-2">
                      {result.expirationAlerts.map((alert, i) => (
                        <div key={i} className={`text-xs px-2 py-1 rounded inline-block mr-2 ${getSeverityColor(alert.severity)}`}>
                          {alert.certification}: {alert.daysUntilExpiration} days
                        </div>
                      ))}
                    </div>
                  )}

                  {result.error && (
                    <p className="text-sm text-red-600 mt-2">{result.error}</p>
                  )}
                </div>
              ))}
            </div>

            {batchResults.length > 20 && (
              <p className="text-sm text-gray-600 mt-4 text-center">
                Showing first 20 results. Download CSV for complete results.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}