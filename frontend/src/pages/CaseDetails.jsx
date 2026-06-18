import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, FileCheck, FileX, Clock, Sparkles, AlertTriangle,
  CheckCircle, Download, Eye, Upload, User, Calendar, Flag
} from 'lucide-react';
import { Badge, HealthBar } from '../components/ui/index.jsx';
import { cases, documents } from '../data/mockData.js';

const DocCard = ({ doc }) => {
  const config = {
    uploaded: { icon: FileCheck, iconColor: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    missing: { icon: FileX, iconColor: 'text-red-400', bg: 'bg-red-50/50', border: 'border-red-200 border-dashed' },
    under_review: { icon: Clock, iconColor: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  };
  const { icon: Icon, iconColor, bg, border } = config[doc.status];

  return (
    <div className={`rounded-xl border p-4 ${bg} ${border} transition-all hover:shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm border ${border}`}>
          <Icon size={17} className={iconColor} />
        </div>
        <Badge status={doc.status} />
      </div>
      <p className="text-sm font-semibold text-slate-800 mb-1">{doc.name}</p>
      {doc.status !== 'missing' ? (
        <div className="space-y-1">
          <p className="text-xs text-slate-500">{doc.type} · {doc.size}</p>
          <p className="text-xs text-slate-400">Uploaded {doc.uploadedAt}</p>
          <div className="flex gap-2 mt-2.5">
            <button className="flex items-center gap-1 text-xs text-brand-600 font-medium hover:underline">
              <Eye size={12} /> View
            </button>
            <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
              <Download size={12} /> Download
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-xs text-red-600 mb-2">Not yet uploaded</p>
          <button className="flex items-center gap-1 text-xs text-red-600 font-medium hover:underline">
            <Upload size={12} /> Upload now
          </button>
        </div>
      )}
    </div>
  );
};

export default function CaseDetails() {
  const { id } = useParams();
  const caseData = cases.find(c => c.id === id) || cases[0];
  const missing = documents.filter(d => d.status === 'missing');

  return (
    <div className="fade-in">
      {/* Back */}
      <div className="mb-4">
        <Link to="/cases" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={15} /> Back to Cases
        </Link>
      </div>

      {/* Header */}
      <div className="card p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{caseData.id}</span>
              <Badge status={caseData.status} />
              <span className="text-xs text-slate-400">Priority: <strong className="text-slate-700">{caseData.priority}</strong></span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{caseData.client}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{caseData.type}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Case Health</p>
              <div className="flex items-center gap-3">
                <div className="w-32"><HealthBar score={caseData.health} /></div>
                <span className="text-2xl font-bold text-slate-900">{caseData.health}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/documents" className="btn-secondary text-xs py-2">
                <Upload size={13} /> Upload Docs
              </Link>
              <button className="btn-primary text-xs py-2">
                <Sparkles size={13} /> AI Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {/* Client Info */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User size={15} className="text-brand-500" /> Client Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Full Name', value: caseData.client },
                { label: 'Case Type', value: caseData.type },
                { label: 'Assigned To', value: caseData.assignee },
                { label: 'Filing Deadline', value: caseData.deadline, icon: Calendar },
                { label: 'Priority', value: caseData.priority, icon: Flag },
                { label: 'Last Updated', value: caseData.lastUpdated },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Uploaded Documents</h2>
              <span className="text-xs text-slate-400">{documents.filter(d => d.status === 'uploaded').length}/{documents.length} submitted</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map(doc => <DocCard key={doc.id} doc={doc} />)}
            </div>
          </div>

          {/* Missing Docs Alert */}
          {missing.length > 0 && (
            <div className="card p-5 border-red-200 bg-red-50/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-500" />
                <h2 className="text-sm font-semibold text-red-800">Missing Documents ({missing.length})</h2>
              </div>
              <p className="text-xs text-red-600 mb-3">The following documents are required to proceed with this case:</p>
              <div className="space-y-2">
                {missing.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <FileX size={14} className="text-red-400" />
                      <span className="text-sm font-medium text-slate-800">{doc.name}</span>
                    </div>
                    <Link to="/documents" className="text-xs text-brand-600 font-medium hover:underline">Upload →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis Panel */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">AI Analysis</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Case Summary</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {caseData.client}'s {caseData.type} petition is progressing with {caseData.health}% health score. 
                  Key documents are partially submitted. {missing.length > 0 ? `${missing.length} critical documents remain missing.` : 'All documents received.'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Extracted Info</p>
                <div className="space-y-1.5">
                  {['Priority Worker category confirmed', 'Employer sponsorship verified', 'Labor condition application pending', 'I-140 approval status: pending'].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recommended Actions</p>
                <div className="space-y-2">
                  {[
                    { text: 'Request degree certificate from client', urgent: true },
                    { text: 'Follow up on employment letter dates', urgent: true },
                    { text: 'Schedule RFE response review', urgent: false },
                    { text: 'Verify translation certifications', urgent: false },
                  ].map((action, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${action.urgent ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-50 text-slate-600'}`}>
                      <AlertTriangle size={12} className={`shrink-0 mt-0.5 ${action.urgent ? 'text-red-400' : 'text-slate-400'}`} />
                      {action.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link to="/assistant" className="btn-primary w-full justify-center text-xs py-2.5">
                <Sparkles size={13} /> Ask AI About This Case
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Case Metrics</p>
            <div className="space-y-3">
              {[
                { label: 'Documents submitted', value: `${documents.filter(d => d.status === 'uploaded').length}/${documents.length}`, color: 'text-emerald-600' },
                { label: 'Under review', value: documents.filter(d => d.status === 'under_review').length, color: 'text-amber-600' },
                { label: 'Missing documents', value: missing.length, color: 'text-red-500' },
                { label: 'Days to deadline', value: '18', color: 'text-brand-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}