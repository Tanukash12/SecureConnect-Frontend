import { useState } from 'react';

export default function FileManagerPage() {
  const [currentPath, setCurrentPath] = useState('/');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fileStructure = {
    '/': [
      { name: 'Documents', path: '/documents', type: 'folder', restricted: false },
      { name: 'Projects', path: '/projects', type: 'folder', restricted: false },
      { name: 'Confidential', path: '/confidential', type: 'folder', restricted: true },
      { name: 'Admin', path: '/admin', type: 'folder', restricted: true },
      { name: 'HR', path: '/hr', type: 'folder', restricted: false },
    ],
    '/documents': [
      { name: '..', path: '/', type: 'folder', restricted: false },
      { name: 'Reports', path: '/documents/reports', type: 'folder', restricted: false },
      { name: 'Meeting Notes.pdf', path: '/documents/meeting-notes.pdf', type: 'file', restricted: false },
      { name: 'Company Policy.pdf', path: '/documents/policy.pdf', type: 'file', restricted: false },
    ],
    '/projects': [
      { name: '..', path: '/', type: 'folder', restricted: false },
      { name: 'Project Alpha', path: '/projects/alpha', type: 'folder', restricted: false },
      { name: 'README.md', path: '/projects/readme.md', type: 'file', restricted: false },
    ],
    '/confidential': [
      { name: '..', path: '/', type: 'folder', restricted: false },
      { name: 'Financial Reports', path: '/confidential/financial', type: 'folder', restricted: true },
      { name: 'Board Minutes.pdf', path: '/confidential/board-minutes.pdf', type: 'file', restricted: true },
      { name: 'Budget 2024.xlsx', path: '/confidential/budget-2024.xlsx', type: 'file', restricted: true },
    ],
    '/admin': [
      { name: '..', path: '/', type: 'folder', restricted: false },
      { name: 'System Config', path: '/admin/config', type: 'folder', restricted: true },
      { name: 'credentials.txt', path: '/admin/credentials.txt', type: 'file', restricted: true },
      { name: 'passwords.json', path: '/admin/passwords.json', type: 'file', restricted: true },
    ],
    '/hr': [
      { name: '..', path: '/', type: 'folder', restricted: false },
      { name: 'Salary', path: '/hr/salary', type: 'folder', restricted: true },
      { name: 'Employee Records', path: '/hr/records', type: 'folder', restricted: false },
      { name: 'Benefits.pdf', path: '/hr/benefits.pdf', type: 'file', restricted: false },
    ],
    '/hr/salary': [
      { name: '..', path: '/hr', type: 'folder', restricted: false },
      { name: 'Payroll 2024.xlsx', path: '/hr/salary/payroll-2024.xlsx', type: 'file', restricted: true },
      { name: 'Bonus Structure.pdf', path: '/hr/salary/bonus.pdf', type: 'file', restricted: true },
    ],
  };

  const showToast = (title, description, variant = 'default') => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const getCurrentFiles = () => {
    const files = fileStructure[currentPath] || [];
    if (searchQuery) {
      return files.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return files;
  };

  const handleFileClick = async (file) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path);
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://finalbackend-02as.onrender.com/api/file-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ file_path: file.path })
      });

      const data = await response.json();
      
      if (data.allowed) {
        showToast('✅ Access Granted', `You can access ${file.name}`);
      } else {
        showToast('🚫 Access Denied', `You don't have permission to access ${file.name}. Admin has been notified.`, 'destructive');
      }
    } catch (error) {
      showToast('❌ Error', 'Failed to check file access', 'destructive');
    }
    
    setIsLoading(false);
  };

  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    let path = '';
    for (const part of parts) {
      path += `/${part}`;
      breadcrumbs.push({ name: part.charAt(0).toUpperCase() + part.slice(1), path });
    }
    
    return breadcrumbs;
  };

  const currentFiles = getCurrentFiles();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          toast.variant === 'destructive' 
            ? 'bg-red-600 text-white' 
            : 'bg-green-600 text-white'
        }`}>
          <p className="font-semibold text-lg">{toast.title}</p>
          <p className="text-sm mt-1">{toast.description}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📁 File Manager</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse company files. All access is monitored and logged for security.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="🔍 Search files..."
            className="w-full px-4 py-2 pl-10 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          {getBreadcrumbs().map((crumb, idx) => (
            <div key={crumb.path} className="flex items-center gap-2">
              {idx > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => setCurrentPath(crumb.path)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        {/* Security Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-800 dark:text-yellow-300">Security Notice</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              All file access is logged and monitored. Unauthorized access attempts will be reported to administrators immediately.
            </p>
          </div>
        </div>

        {/* Files Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              📂 Files & Folders
              <span className="text-sm font-normal text-gray-500">({currentFiles.length} items)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
            {currentFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => handleFileClick(file)}
                disabled={isLoading}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  file.restricted 
                    ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10 hover:border-yellow-400' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
              >
                <div className={`text-4xl flex-shrink-0`}>
                  {file.type === 'folder' 
                    ? file.restricted ? '🔒' : '📁'
                    : file.restricted ? '🔐' : '📄'
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate flex items-center gap-2">
                    {file.name}
                    {file.restricted && <span className="text-yellow-600">🔑</span>}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file.type === 'folder' ? 'Folder' : 'File'}
                    {file.restricted && ' • Admin Access Required'}
                  </p>
                </div>
              </button>
            ))}

            {currentFiles.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-6xl mb-3">📂</p>
                <p className="text-gray-500 dark:text-gray-400">No files found</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span>📁</span>
            <span className="text-gray-600 dark:text-gray-400">Regular Files</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span className="text-gray-600 dark:text-gray-400">Restricted Access</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔐</span>
            <span className="text-gray-600 dark:text-gray-400">Admin Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}