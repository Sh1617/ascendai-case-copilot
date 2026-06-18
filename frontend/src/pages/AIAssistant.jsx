import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown, Bot, User } from 'lucide-react';
import { chatHistory, suggestedQuestions } from '../data/mockData.js';
import { PageHeader } from '../components/ui/index.jsx';

const aiResponses = {
  default: "I've analyzed the case data. Based on my review, I can see several key items that need attention. Would you like me to provide a detailed breakdown of any specific aspect?",
  missing: "For case **ASC-2401 (Priya Sharma)**, the following documents are currently missing:\n\n• **Degree Certificate** — Required for qualification proof. Priority: High\n• **Employment Letter** — Needed to verify current work authorization. Priority: High\n\nI recommend contacting the client directly to expedite these submissions. The filing deadline is in 18 days.",
  summarize: "**Case Summary: Priya Sharma (ASC-2401)**\n\nThis is an H-1B Visa petition for Priya Sharma, a Software Engineer sponsored by TechCorp Inc. The case health score is 92/100.\n\n**Current Status:** Active\n**Priority:** High\n**Deadline:** June 15, 2024\n\n**Documents:** 5 of 8 submitted. 2 missing, 1 under review.\n\n**Key Risks:** Degree certificate missing, translation certification pending.\n\n**Recommended next step:** Send document checklist to client via email immediately.",
  pending: "Here are all **pending actions** across your active cases:\n\n1. **ASC-2403** — Upload missing degree certificate (Urgent)\n2. **ASC-2406** — RFE response due in 3 days\n3. **ASC-2401** — Employment letter verification\n4. **ASC-2402** — Schedule attorney review call\n5. **ASC-2404** — Confirm LCA filing with employer\n\nWould you like me to draft email templates for any of these?",
  petition: "**Petition Summary — ASC-2404 (David Kim)**\n\nDavid Kim is petitioning for an L-1A Intracompany Transferee visa as a Senior Manager being transferred from the Seoul office of GlobalTech Ltd to their US headquarters.\n\n**Position:** VP of Product Strategy\n**Qualifying Period:** 3 years employment in Korea\n**Specialized Knowledge:** Enterprise SaaS architecture, cross-border team leadership\n\nThe petition demonstrates continuous qualifying employment, specialized knowledge specific to the organization, and a legitimate business need for the transfer. All supporting documentation is in good standing.",
};

const getResponse = (msg) => {
  const lower = msg.toLowerCase();
  if (lower.includes('missing')) return aiResponses.missing;
  if (lower.includes('summar')) return aiResponses.summarize;
  if (lower.includes('pending') || lower.includes('action')) return aiResponses.pending;
  if (lower.includes('petition')) return aiResponses.petition;
  return aiResponses.default;
};

const formatMessage = (text) => {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (line.startsWith('•')) return <li key={i} className="ml-4 text-sm" dangerouslySetInnerHTML={{ __html: bold.replace('•', '') }} />;
    if (/^\d+\./.test(line)) return <li key={i} className="ml-4 text-sm list-decimal" dangerouslySetInnerHTML={{ __html: bold }} />;
    if (line === '') return <br key={i} />;
    return <p key={i} className="text-sm mb-1" dangerouslySetInnerHTML={{ __html: bold }} />;
  });
};

export default function AIAssistant() {
  const [messages, setMessages] = useState(chatHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      const response = getResponse(msg);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setLoading(false);
    }, 1000 + Math.random() * 800);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="fade-in h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
      <PageHeader
        title="AI Case Assistant"
        subtitle="Ask questions about cases, generate summaries, and get recommendations."
      >
        <button
          onClick={() => setMessages(chatHistory)}
          className="btn-secondary text-xs py-2"
        >
          <RefreshCw size={13} /> New chat
        </button>
      </PageHeader>

      <div className="flex-1 flex flex-col card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-brand-50 to-indigo-50">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">AscendAI Copilot</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-slow" />
              <p className="text-xs text-slate-400">Online · Analyzing your case portfolio</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-brand-500 to-indigo-600 shadow-sm'
                  : 'bg-slate-200'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot size={15} className="text-white" />
                  : <User size={15} className="text-slate-600" />
                }
              </div>
              <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant'
                    ? <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                    : <p className="text-sm">{msg.content}</p>
                  }
                </div>
                <div className={`flex items-center gap-2 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1">
                      <button className="text-slate-300 hover:text-slate-500 transition-colors"><Copy size={11} /></button>
                      <button className="text-slate-300 hover:text-emerald-500 transition-colors"><ThumbsUp size={11} /></button>
                      <button className="text-slate-300 hover:text-red-400 transition-colors"><ThumbsDown size={11} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                <Bot size={15} className="text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-5 pb-3">
            <p className="text-xs text-slate-400 mb-2.5">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="text-xs px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full hover:bg-brand-100 transition-colors font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-3 border-t border-slate-100">
          <div className="flex gap-2.5 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about a case, request a summary, or get document status..."
                rows={1}
                className="input resize-none pr-12 py-3 leading-relaxed min-h-[46px] max-h-32"
                style={{ height: 'auto' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
            </div>
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            AI responses are suggestions only. Always verify critical case information.
          </p>
        </div>
      </div>
    </div>
  );
}