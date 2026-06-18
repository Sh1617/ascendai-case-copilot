import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Eye, Download } from 'lucide-react';
import { Badge, PageHeader } from '../components/ui/index.jsx';
import { documents } from '../data/mockData.js';

const fmtSize = bytes => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function DocumentUpload() {
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState([]);
  const inputRef = useRef();

  const processFiles = useCallback((files) => {
    const newUploads = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: fmtSize(file.size),
      type: file.name.split('.').pop().toUpperCase(),
      progress: 0,
      status: 'uploading',
    }));
    setUploads(prev => [...prev, ...newUploads]);

    newUploads.forEach(upload => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, progress: 100, status: 'done' } : u));
        } else {
          setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, progress: Math.min(progress, 95) } : u));
        }
      }, 300);
    });
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onFileChange = (e) => { if (e.target.files?.length) processFiles(e.target.files); };

  return (
    <div className="fade-in max-w-3xl">
      <PageHeader title="Document Upload" subtitle="Upload and manage case documents securely." />

      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          card mb-6 border-2 border-dashed cursor-pointer transition-all p-12 text-center
          ${dragging
            ? 'border-brand-400 bg-brand-50 shadow-lg scale-[1.01]'
            : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50/60'
          }
        `}
      >
        <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.doc,.jpg,.jpeg,.png" className="hidden" onChange={onFileChange} />
        <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${dragging ? 'bg-brand-100' : 'bg-slate-100'}`}>
          <Upload size={28} className={dragging ? 'text-brand-500' : 'text-slate-400'} />
        </div>
        <p className="text-base font-semibold text-slate-800 mb-1">
          {dragging ? 'Drop files to upload' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-slate-400 mb-4">or click to browse from your computer</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['PDF', 'DOCX', 'JPG', 'PNG'].map(t => (
            <span key={t} className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">{t}</span>
          ))}
          <span className="text-xs text-slate-400">· Max 25 MB per file</span>
        </div>
      </div>

      {/* Active Uploads */}
      {uploads.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Uploading ({uploads.filter(u => u.status === 'uploading').length} remaining)</h2>
            {uploads.every(u => u.status === 'done') && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                <CheckCircle size={14} /> All complete
              </div>
            )}
          </div>
          <div className="divide-y divide-slate-50">
            {uploads.map(upload => (
              <div key={upload.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                  upload.type === 'PDF' ? 'bg-red-50 text-red-600' :
                  upload.type === 'DOCX' ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {upload.type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-slate-800 truncate">{upload.name}</p>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className="text-xs text-slate-400">{upload.size}</span>
                      {upload.status === 'done'
                        ? <CheckCircle size={15} className="text-emerald-500" />
                        : <button onClick={(e) => { e.stopPropagation(); setUploads(prev => prev.filter(u => u.id !== upload.id)); }}><X size={15} className="text-slate-400 hover:text-slate-600" /></button>
                      }
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${upload.status === 'done' ? 'bg-emerald-500' : 'bg-brand-500'}`}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  {upload.status === 'uploading' && (
                    <p className="text-xs text-slate-400 mt-1">{Math.round(upload.progress)}% uploaded</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Documents */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Case Documents</h2>
          <span className="text-xs text-slate-400">{documents.length} files</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Document', 'Type', 'Size', 'Uploaded', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        doc.status === 'missing' ? 'bg-red-50 text-red-400' :
                        doc.type === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'
                      }`}>
                        {doc.status === 'missing' ? '?' : doc.type || 'DOC'}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{doc.type || '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 tabular-nums">{doc.size || '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{doc.uploadedAt || '—'}</td>
                  <td className="px-5 py-3.5"><Badge status={doc.status} /></td>
                  <td className="px-5 py-3.5">
                    {doc.status !== 'missing' ? (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                          <Eye size={12} /> View
                        </button>
                        <button className="text-xs text-slate-500 hover:underline flex items-center gap-1">
                          <Download size={12} /> Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => inputRef.current?.click()}
                        className="text-xs text-red-600 font-medium hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Upload size={12} /> Upload
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}