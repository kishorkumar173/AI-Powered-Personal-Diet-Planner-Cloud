import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Cloud, 
  UploadCloud, 
  Trash2, 
  Download, 
  FileText, 
  Image as ImageIcon,
  CheckCircle, 
  AlertCircle,
  HardDrive
} from 'lucide-react';

export default function CloudFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await api.listFiles();
      setFiles(data);
    } catch (err) {
      setError(err.message || 'Failed to list files from cloud object storage.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const savedMeta = await api.uploadFile(file);
      setSuccess(`File "${savedMeta.filename}" uploaded successfully to Cloud Object Storage!`);
      loadFiles();
    } catch (err) {
      setError(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file object from cloud storage?')) return;
    try {
      await api.deleteFile(fileId);
      setFiles(files.filter((f) => f.file_id !== fileId));
      setSuccess('Object successfully deleted from cloud bucket.');
    } catch (err) {
      setError(err.message || 'Failed to delete file.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1000px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            Cloud Object Storage
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Store and retrieve unstructured binary objects (meal photos, nutrition logs, progress scans).
          </p>
        </div>
        <span className="badge badge-purple" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          <HardDrive size={14} style={{ marginRight: '0.35rem' }} /> Object Storage Bucket
        </span>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.85rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.85rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <CheckCircle size={18} /> <span>{success}</span>
        </div>
      )}

      {/* Upload Drop Area */}
      <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '2.5rem 1.5rem' }}>
        <UploadCloud size={44} color="#10b981" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>
          Upload Meal Photo or Health File
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '460px', margin: '0.35rem auto 1.25rem' }}>
          Streams binary data directly to Cloud Object Storage with automated checksum hashing and content-type isolation.
        </p>

        <label className="btn btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          {uploading ? 'Streaming to Cloud Bucket...' : 'Select File to Upload'}
        </label>
      </div>

      {/* Files List */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' }}>
          Stored Bucket Objects ({files.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            Querying storage bucket metadata...
          </div>
        ) : files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            <FileText size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: '600' }}>No files currently stored in your cloud bucket.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Upload sample photos or diet logs to test object storage!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Filename</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Format</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Size</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Uploaded</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.file_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {file.content_type?.startsWith('image/') ? (
                        <ImageIcon size={18} color="#10b981" />
                      ) : (
                        <FileText size={18} color="#3b82f6" />
                      )}
                      <span>{file.filename}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>
                      {file.content_type}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                      {formatFileSize(file.file_size)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <a
                          href={api.getFileDownloadUrl(file.file_id)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                          title="Download stream"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => handleDelete(file.file_id)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                          title="Delete object"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cloud Architecture Concept Box */}
      <div style={{ marginTop: '2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' }}>
          💡 Cloud Computing Architecture: Database vs Object Storage
        </h4>
        <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
          <strong>Cloud Database (Relational/NoSQL):</strong> Stored user accounts, passwords, meal caloric schemas, and queryable metadata. Optimised for sub-millisecond CRUD operations.<br />
          <strong>Cloud Object Storage (S3 / GCS / Local Bucket):</strong> Stores arbitrary unstructured media streams (JPEG photos, PDFs) with unique keys, partition prefixes, and content-type isolation.
        </p>
      </div>

    </div>
  );
}
