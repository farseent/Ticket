import { useEffect, useMemo, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Navbar from '../components/layout/Navbar';
import DispatcherStatePanel from '../components/dispatcher/DispatcherStatePanel';
import LeadTable from '../components/leads/LeadTable';
import LeadFilterBar from '../components/leads/LeadFilterBar';
import AuditLogViewer from '../components/leads/AuditLogViewer';
import ResendRevisionForm from '../components/leads/ResendRevisionForm';
import RevisionPendingCard from '../components/leads/RevisionPendingCard';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import { useLeads } from '../hooks/useLeads';
import { createLead, fetchAuditLog, resendToCGroup } from '../api/leads';
import { fetchDispatcherState } from '../api/dispatcher';
import { notifySuccess, notifyError } from '../utils/toast';

export default function DashboardA() {
  const { leads, loading, error, refresh } = useLeads();
  const [dispatcherState, setDispatcherState] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    clientName: '', clientPhone: '', clientNotes: '',
    destination: '', travelDate: '', departureAirport: '', preferredTime: 'ANY',
    adults: 1, children: 0,
  });
  const [auditLogs, setAuditLogs] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reviewingLead, setReviewingLead] = useState(null);
  const [resending, setResending] = useState(false);
  const loadDispatcherState = async () => {
    setDispatcherState(await fetchDispatcherState());
  };

  useEffect(() => { loadDispatcherState(); }, []);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await createLead({
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        clientNotes: form.clientNotes,
        destination: form.destination,
        travelDate: form.travelDate,
        departureAirport: form.departureAirport,
        preferredTime: form.preferredTime,
        passengers: { adults: Number(form.adults), children: Number(form.children) },
      });
      setForm({
        clientName: '', clientPhone: '', clientNotes: '',
        destination: '', travelDate: '', departureAirport: '', preferredTime: 'ANY',
        adults: 1, children: 0,
      });
      setShowCreateModal(false);
      notifySuccess('Lead created and dispatched.');
      await refresh();
      await loadDispatcherState();
    } catch (err) {
      notifyError(err.response?.data?.error || 'Failed to create lead');
    }
  };

  const viewAuditLog = async (leadId) => {
    const data = await fetchAuditLog(leadId);
    setAuditLogs(data.logs);
  };

  const handleResendSubmit = async (updatedFields) => {
    setResending(true);
    try {
      await resendToCGroup(reviewingLead._id, updatedFields);
      notifySuccess('Lead updated and resent to Ticketing Staff.');
      setReviewingLead(null);
      await refresh();
    } catch (err) {
      notifyError(err.response?.data?.error || 'Failed to resend to C group');
    } finally {
      setResending(false);
    }
  };

  const pendingRevisions = useMemo(
    () => leads.filter((l) => l.status === 'REVISION_PENDING_A'),
    [leads]
  );

  const stats = useMemo(() => ({
    total: leads.length,
    active: leads.filter((l) => l.status !== 'CONFIRMED').length,
    confirmed: leads.filter((l) => l.status === 'CONFIRMED').length,
    revision: pendingRevisions.length,
  }), [leads, pendingRevisions]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch = l.clientName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ? true :
        statusFilter === 'ACTIVE' ? l.status !== 'CONFIRMED' && l.status !== 'REVISION_PENDING_A' :
        statusFilter === 'CONFIRMED' ? l.status === 'CONFIRMED' :
        l.status === 'REVISION_PENDING_A';
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  return (
    <PageContainer>
      <Navbar />
      <DispatcherStatePanel state={dispatcherState} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total leads" value={stats.total} accent="bg-slate-300" />
        <StatCard label="In progress" value={stats.active} accent="bg-indigo-400" />
        <StatCard label="Confirmed" value={stats.confirmed} accent="bg-emerald-400" />
        <StatCard label="Needs your review" value={stats.revision} accent="bg-amber-400" />
      </div>

      {pendingRevisions.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Pending Your Review</h2>
          <div className="space-y-3">
            {pendingRevisions.map((lead) => (
              <RevisionPendingCard
                key={lead._id}
                lead={lead}
                onReview={setReviewingLead}
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center px-4 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">All Leads</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors"
          >
            + New Lead
          </button>
        </div>
        <LeadFilterBar
          search={search} onSearchChange={setSearch}
          statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
          filters={[
            { key: 'ALL', label: 'All' },
            { key: 'ACTIVE', label: 'In progress' },
            { key: 'CONFIRMED', label: 'Confirmed' },
            { key: 'REVISION_PENDING_A', label: 'Needs revision' },
          ]}
        />
        <ErrorBanner message={error} />
        {loading ? <LoadingSpinner /> : <LeadTable leads={filteredLeads} onViewAuditLog={viewAuditLog} />}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Lead" widthClass="max-w-lg">
        <form onSubmit={handleCreateLead} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Client Name" value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" required
            />
            <input
              placeholder="Client Phone" value={form.clientPhone}
              onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Destination" value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" required
            />
            <input
              type="date" value={form.travelDate}
              onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Departure Airport" value={form.departureAirport}
              onChange={(e) => setForm({ ...form, departureAirport: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" required
            />
            <select
              value={form.preferredTime}
              onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            >
              <option value="ANY">Any time</option>
              <option value="MORNING">Morning</option>
              <option value="AFTERNOON">Afternoon</option>
              <option value="EVENING">Evening</option>
              <option value="NIGHT">Night</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">Adults</label>
              <input
                type="number" min="1" value={form.adults}
                onChange={(e) => setForm({ ...form, adults: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" required
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Children</label>
              <input
                type="number" min="0" value={form.children}
                onChange={(e) => setForm({ ...form, children: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
              />
            </div>
          </div>

          <textarea
            placeholder="Additional Notes (optional)" value={form.clientNotes}
            onChange={(e) => setForm({ ...form, clientNotes: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />

          <button type="submit" className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">
            Create Lead
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!auditLogs} onClose={() => setAuditLogs(null)} title="Audit Log" widthClass="max-w-lg">       
       {auditLogs && <AuditLogViewer logs={auditLogs} />}
      </Modal>

      <Modal isOpen={!!reviewingLead} onClose={() => setReviewingLead(null)} title="Review Revision Request" widthClass="max-w-lg">
        {reviewingLead && (
          <ResendRevisionForm lead={reviewingLead} onSubmit={handleResendSubmit} busy={resending} />
        )}
      </Modal>
    </PageContainer>
  );
}