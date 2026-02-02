'use client';

import { useState, useCallback, useEffect } from 'react';

interface UploadedFile {
  key: string;
  size: number;
  lastModified: string;
  publicUrl: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  const loadFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch {
      console.error('Failed to load files');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      setSelectedFile(e.dataTransfer.files[0]);
      setMessage(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 100);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `File uploaded successfully! URL: ${data.data.publicUrl}`,
        });
        setSelectedFile(null);
        loadFiles();
      } else {
        setMessage({ type: 'error', text: `Upload failed: ${data.error}` });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setMessage({ type: 'error', text: `Upload failed: ${(error as Error).message}` });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const deleteFile = async (key: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const res = await fetch(`/api/files/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        loadFiles();
      } else {
        alert(`Delete failed: ${data.error}`);
      }
    } catch (error) {
      alert(`Delete failed: ${(error as Error).message}`);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-white">
          Cloudflare R2 Upload Test
        </h1>

        {/* Upload Card */}
        <div className="mb-6 rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">Upload File</h2>

          <div
            className={`cursor-pointer rounded-xl border-3 border-dashed p-10 text-center transition-all ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <div className="mb-4 text-5xl">📁</div>
            <p className="mb-2 text-gray-600">Drag & drop files here or click to browse</p>
            <p className="text-sm text-gray-400">Maximum file size: 50MB</p>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {selectedFile && (
            <div className="mt-6 rounded-lg bg-indigo-50 p-4">
              <p className="text-gray-700">
                <strong>Selected:</strong> {selectedFile.name}
              </p>
              <p className="text-gray-700">
                <strong>Size:</strong> {formatSize(selectedFile.size)}
              </p>
              <button
                className="mt-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 font-medium text-white transition-all hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                onClick={uploadFile}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload to R2'}
              </button>

              {progress > 0 && (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {message && (
            <div
              className={`mt-4 rounded-lg p-4 ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Files List Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Uploaded Files</h2>
            <button
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              onClick={loadFiles}
            >
              Refresh
            </button>
          </div>

          {loadingFiles ? (
            <div className="py-10 text-center text-gray-500">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No files uploaded yet</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {files.map((file) => (
                <li
                  key={file.key}
                  className="flex items-center justify-between py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <a
                      href={file.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {file.key.split('/').pop()}
                    </a>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatSize(file.size)} • {new Date(file.lastModified).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <a
                      href={file.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-200"
                    >
                      View
                    </a>
                    <button
                      className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
                      onClick={() => deleteFile(file.key)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
