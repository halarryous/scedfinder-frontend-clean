'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

interface UploadStatus {
  file: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
  recordsProcessed?: number;
}

export default function AdminPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dbStats, setDbStats] = useState({ totalCourses: 0, totalCertifications: 0, totalMappings: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load database stats on mount
  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      const response = await axios.get('${API_BASE_URL}/admin/stats');
      setDbStats(response.data.data);
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const csvFiles = files.filter(file => 
      file.type === 'text/csv' || file.name.endsWith('.csv')
    );
    
    if (csvFiles.length !== files.length) {
      toast.error('Please select only CSV files');
    }
    
    setSelectedFiles(csvFiles);
    setUploadStatus(csvFiles.map(file => ({
      file: file.name,
      status: 'pending'
    })));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select CSV files to upload');
      return;
    }

    setIsUploading(true);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Update status to uploading
      setUploadStatus(prev => prev.map((status, idx) => 
        idx === i ? { ...status, status: 'uploading' } : status
      ));

      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Determine the type of CSV based on filename
        let uploadType = 'general';
        if (file.name.toLowerCase().includes('sced')) {
          uploadType = 'sced';
        } else if (file.name.toLowerCase().includes('cert')) {
          uploadType = 'certification';
        }
        formData.append('type', uploadType);

        const response = await axios.post(
          '${API_BASE_URL}/admin/upload-csv',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total 
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              
              setUploadStatus(prev => prev.map((status, idx) => 
                idx === i 
                  ? { ...status, message: `Uploading... ${progress}%` }
                  : status
              ));
            },
          }
        );

        // Update status to success
        setUploadStatus(prev => prev.map((status, idx) => 
          idx === i 
            ? { 
                ...status, 
                status: 'success', 
                message: 'Upload successful',
                recordsProcessed: response.data.recordsProcessed 
              }
            : status
        ));

        toast.success(`${file.name} uploaded successfully`);
        
        // Reload database stats after successful upload
        await loadDatabaseStats();
      } catch (error: any) {
        // Update status to error
        const errorMessage = error.response?.data?.error?.message || 'Upload failed';
        setUploadStatus(prev => prev.map((status, idx) => 
          idx === i 
            ? { ...status, status: 'error', message: errorMessage }
            : status
        ));

        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      }
    }

    setIsUploading(false);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setUploadStatus([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: UploadStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">
            Upload and manage SCED course and certification data
          </p>
        </div>

        {/* Information Panel */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">CSV File Requirements</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Files must be in CSV format (.csv extension)</li>
                  <li>SCED course files should contain: course_code, course_description, subject_area, etc.</li>
                  <li>Certification mapping files should contain: course_code, certification_area_code, certification_area_description</li>
                  <li>Files are processed automatically based on their structure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">CSV Data Upload</h2>
          </div>
          
          <div className="p-6">
            {/* File Drop Zone */}
            <div className="mb-6">
              <label 
                htmlFor="file-upload" 
                className="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-semibold text-gray-900">
                  Click to upload CSV files
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  or drag and drop
                </span>
                <input 
                  ref={fileInputRef}
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  className="sr-only" 
                  accept=".csv"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Selected Files List */}
            {uploadStatus.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Selected Files</h3>
                <div className="space-y-2">
                  {uploadStatus.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(file.status)}
                        <span className="text-sm text-gray-900">{file.file}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {file.message && <span>{file.message}</span>}
                        {file.recordsProcessed && (
                          <span className="ml-2">
                            ({file.recordsProcessed} records)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              {uploadStatus.length > 0 && !isUploading && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Reset
                </button>
              )}
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  'Upload Files'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Database Status</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Total SCED Courses</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{dbStats.totalCourses.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Total Certifications</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{dbStats.totalCertifications.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Course-Cert Mappings</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{dbStats.totalMappings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}