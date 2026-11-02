import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Send,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Edit3,
  Calendar,
} from 'lucide-react';

export const ConsultantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadDetail, setLeadDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // AI Reply Draft State
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplyEdited, setIsReplyEdited] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  // Consultant Note state
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Reassignment state
  const [consultants, setConsultants] = useState<any[]>([]);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [targetConsultantId, setTargetConsultantId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  // Live timer tick every second
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch leads
  const fetchLeads = async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.getLeads(params);
      if (res.success) {
        setLeads(res.leads || []);
        if (!selectedLead && res.leads?.length > 0) {
          loadLeadDetail(res.leads[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, search]);

  // Load Lead Detail
  const loadLeadDetail = async (id: string) => {
    setLoadingDetail(true);
    setReplySuccess(false);
    try {
      const res = await api.getLeadById(id);
      if (res.success && res.lead) {
        setSelectedLead(res.lead);
        setLeadDetail(res);
        // Pre-fill editable reply draft
        const draft = res.lead.aiReplyDraft?.draft || '';
        setReplyMessage(draft);
        setIsReplyEdited(false);
      }
    } catch (err) {
      console.error('Failed to load lead detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Send Reply (simulated communication)
  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedLead) return;
    setSendingReply(true);
    try {
      const res = await api.sendLeadReply(
        selectedLead._id,
        replyMessage,
        'EMAIL',
        isReplyEdited
      );
      if (res.success) {
        setReplySuccess(true);
        // Refresh lead details
        await loadLeadDetail(selectedLead._id);
        await fetchLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  // Handle Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedLead) return;
    setAddingNote(true);
    try {
      const res = await api.addLeadNote(selectedLead._id, newNote);
      if (res.success) {
        setNewNote('');
        await loadLeadDetail(selectedLead._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedLead) return;
    try {
      const res = await api.updateLeadStatus(selectedLead._id, newStatus);
      if (res.success) {
        setSelectedLead({ ...selectedLead, status: newStatus });
        await fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format countdown mm:ss
  const formatCountdown = (deadlineIso: string, contacted: boolean) => {
    if (contacted) return { text: 'Contacted ✓', isOverdue: false };
    const deadline = new Date(deadlineIso).getTime();
    const diff = deadline - now;
    if (diff <= 0) {
      const overdueSec = Math.floor(Math.abs(diff) / 1000);
      const mins = Math.floor(overdueSec / 60);
      const secs = overdueSec % 60;
      return { text: `-${mins}m ${secs}s OVERDUE`, isOverdue: true };
    }
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return { text: `${mins}m ${secs < 10 ? '0' : ''}${secs}s remaining`, isOverdue: false };
  };

  // Stats calculation
  const totalCount = leads.length;
  const newCount = leads.filter((l) => l.status === 'NEW' || l.status === 'ASSIGNED').length;
  const contactedCount = leads.filter((l) => l.status === 'CONTACTED').length;
  const overdueCount = leads.filter((l) => l.isOverdue || (!l.firstContactedAt && new Date(l.responseDeadline).getTime() < now)).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header Bar */}
      <div className="bg-[#121212] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                Sales Consultant Lead Dispatch
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              CRM Intelligence & Response Desk
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Consultant: {user?.name || 'Rajesh Sharma'} • Hazratganj / Gomti Nagar Active Roster
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={fetchLeads}
              className="flex items-center space-x-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs text-gray-400 font-semibold uppercase block">Assigned Leads</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{totalCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs text-blue-600 font-semibold uppercase block">Pending Response</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">{newCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs text-emerald-600 font-semibold uppercase block">Contacted Leads</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{contactedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm bg-red-50/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-600 font-bold uppercase block">Overdue (5-Min SLA)</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-2xl font-black text-red-600 mt-1 block">{overdueCount}</span>
          </div>
        </div>

        {/* Main 2-Column Split: Inbox Table on Left, AI Copilot on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: LEADS LIST (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search and Filters */}
            <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer name or phone..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="CONVERTED">Converted</option>
                </select>
              </div>
            </div>

            {/* Leads Scroll List */}
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl h-24 border border-gray-200 animate-pulse" />
                  ))}
                </div>
              ) : leads.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
                  No leads found in this queue.
                </div>
              ) : (
                leads.map((lead) => {
                  const isSelected = selectedLead?._id === lead._id;
                  const countdown = formatCountdown(lead.responseDeadline, !!lead.firstContactedAt);

                  return (
                    <button
                      key={lead._id}
                      onClick={() => loadLeadDetail(lead._id)}
                      className={`w-full text-left p-4 rounded-xl border transition shadow-sm ${
                        isSelected
                          ? 'border-red-600 bg-red-50/30 ring-2 ring-red-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{lead.customerName}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {lead.interestedModelId?.name || 'General Inquiry'} • {lead.budgetRange || 'Flexible'}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          lead.status === 'NEW'
                            ? 'bg-blue-100 text-blue-700'
                            : lead.status === 'CONTACTED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : lead.status === 'QUALIFIED'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {lead.status}
                        </span>
                      </div>

                      {/* 5-Minute Timer Countdown */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-xs">
                        <span className="text-[11px] text-gray-400 font-mono">
                          Source: {lead.leadSource}
                        </span>

                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                          countdown.isOverdue
                            ? 'bg-red-600 text-white animate-pulse'
                            : lead.firstContactedAt
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{countdown.text}</span>
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: LEAD DETAILS & AI COPILOT (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {loadingDetail ? (
              <div className="bg-white rounded-2xl border border-gray-200 h-[600px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !selectedLead ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
                Select a customer enquiry from the left queue to review AI intelligence.
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. Customer Lead Header Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-black text-gray-900">{selectedLead.customerName}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                          {selectedLead.leadSource}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Received: {new Date(selectedLead.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 font-medium">Status:</span>
                      <select
                        value={selectedLead.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        className="py-1 px-2.5 bg-gray-50 border border-gray-300 rounded-md text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="NEW">NEW</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="FOLLOW_UP">FOLLOW_UP</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="LOST">LOST</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Chips */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <a
                      href={`tel:${selectedLead.customerPhone}`}
                      className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedLead.customerPhone}</span>
                    </a>
                    <a
                      href={`mailto:${selectedLead.customerEmail}`}
                      className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>{selectedLead.customerEmail}</span>
                    </a>
                  </div>

                  {/* Customer Stated Enquiry Message */}
                  {selectedLead.message && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700">
                      <strong className="block text-gray-400 text-[10px] uppercase font-bold mb-1">
                        Original Customer Message:
                      </strong>
                      "{selectedLead.message}"
                    </div>
                  )}
                </div>

                {/* 2. AI BUYER NEEDS SUMMARY CARD */}
                <div className="bg-white rounded-2xl border-2 border-purple-500/30 shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">AI Buyer Needs Summary</h4>
                        <span className="text-[10px] text-gray-400">
                          Extracted via {selectedLead.aiSummary?.provider || 'Google Gemini CRM'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {selectedLead.aiSummary?.needsReview && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                          Needs Review
                        </span>
                      )}
                      <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-200">
                        Confidence: {Math.round((selectedLead.aiSummary?.confidence || 0.9) * 100)}%
                      </span>
                    </div>
                  </div>

                  {selectedLead.aiSummary ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-gray-800 bg-purple-50/40 p-3 rounded-lg border border-purple-100 leading-relaxed">
                        {selectedLead.aiSummary.summary}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Budget</span>
                          <span className="font-semibold text-gray-900">{selectedLead.aiSummary.budget || 'Not specified'}</span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Fuel Preference</span>
                          <span className="font-semibold text-gray-900">{selectedLead.aiSummary.fuelPreference || 'Any'}</span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Transmission</span>
                          <span className="font-semibold text-gray-900">{selectedLead.aiSummary.transmission || 'Any'}</span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Purchase Timeline</span>
                          <span className="font-semibold text-gray-900">{selectedLead.aiSummary.purchaseTimeline || 'Within 30 days'}</span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Buyer Intent</span>
                          <span className="font-bold text-emerald-600">{selectedLead.aiSummary.intent || 'High'}</span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Model Target</span>
                          <span className="font-semibold text-gray-900">{selectedLead.aiSummary.preferredModel || 'Model H'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No structured AI summary available for this lead.</p>
                  )}
                </div>

                {/* 3. AI FIRST-REPLY DRAFT (HUMAN IN THE LOOP) */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-red-600" />
                      <h4 className="font-bold text-sm text-gray-900">Personalised First-Reply Draft</h4>
                    </div>
                    <span className="text-[10px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded">
                      Human Review Mandatory
                    </span>
                  </div>

                  {replySuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Message dispatched via simulated communication log. Lead marked as CONTACTED.</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Editable Draft on behalf of {user?.name || 'Sales Consultant'}:</span>
                      {isReplyEdited && <span className="text-amber-600 font-semibold">(Draft Modified)</span>}
                    </div>

                    <textarea
                      rows={6}
                      value={replyMessage}
                      onChange={(e) => {
                        setReplyMessage(e.target.value);
                        setIsReplyEdited(true);
                      }}
                      className="w-full p-3.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed"
                    />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-gray-400 italic">
                        * Never dispatches automatically. Requires consultant verification.
                      </span>

                      <button
                        onClick={handleSendReply}
                        disabled={sendingReply || !replyMessage.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-sm disabled:opacity-50 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sendingReply ? 'Dispatching...' : 'Approve & Send (Mock)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. CONSULTANT NOTES & AUDIT TRAIL */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <h4 className="font-bold text-sm text-gray-900">Internal Activity Notes</h4>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add follow-up notes (e.g. Called client, shared Lucknow RTO breakup)..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                    <button
                      type="submit"
                      disabled={addingNote || !newNote.trim()}
                      className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg text-xs"
                    >
                      {addingNote ? 'Saving...' : 'Add Note'}
                    </button>
                  </form>

                  {/* Notes Feed */}
                  <div className="space-y-2 pt-2">
                    {selectedLead.notes && selectedLead.notes.length > 0 ? (
                      selectedLead.notes.map((n: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                          <p className="text-gray-800">{n.note}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            By {n.authorName} on {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No notes recorded yet.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

