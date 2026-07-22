import { useEffect, useMemo, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Navbar from '../components/layout/Navbar';
import DispatcherStatePanel from '../components/dispatcher/DispatcherStatePanel';
import LeadTable from '../components/leads/LeadTable';
import LeadFilterBar from '../components/leads/LeadFilterBar';
import AuditLogViewer from '../components/leads/AuditLogViewer';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import { useLeads } from '../hooks/useLeads';
import { createLead, fetchAuditLog } from '../api/leads';
import { fetchDispatcherState } from '../api/dispatcher';

export default function DashboardA() {
  const { leads, loading, error, refresh } = useLeads();
  const [dispatcherState, setDispatcherState] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ clientName: '', clientPhone: '', clientNotes: '' });
  const [formError, setFormError] = useState('');
  const [auditLogs, setAuditLogs] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadDispatcherState = async () => {
    setDispatcherState(await fetchDispatcherState());
  };

  useEffect(() => { loadDispatcherState(); }, []);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await createLead(form);
      setForm({ clientName: '', clientPhone: '', clientNotes: '' });
      setShowCreateModal(false);
      await refresh();
      await loadDispatcherState();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create lead');
    }
  };

  const viewAuditLog = async (leadId) => {
    const data = await fetchAuditLog(leadId);
    setAuditLogs(data.logs);
  };

  const stats = useMemo(() => ({
    total: leads.length,
    active: leads.filter((l) => l.status !== 'CONFIRMED').length,
    confirmed: leads.filter((l) => l.status === 'CONFIRMED').length,
    revision: leads.filter((l) => l.status === 'REVISION_REQUESTED').length,
  }), [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch = l.clientName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ? true :
        statusFilter === 'ACTIVE' ? l.status !== 'CONFIRMED' && l.status !== 'REVISION_REQUESTED' :
        statusFilter === 'CONFIRMED' ? l.status === 'CONFIRMED' :
        l.status === 'REVISION_REQUESTED';
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  return (
    <PageContainer>
      <Navbar title="Role A — Sales Executive" />
      <DispatcherStatePanel state={dispatcherState} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total leads" value={stats.total} accent="bg-slate-300" />
        <StatCard label="In progress" value={stats.active} accent="bg-indigo-400" />
        <StatCard label="Confirmed" value={stats.confirmed} accent="bg-emerald-400" />
        <StatCard label="Needs revision" value={stats.revision} accent="bg-rose-400" />
      </div>

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
        />
        <ErrorBanner message={error} />
        {loading ? <LoadingSpinner /> : <LeadTable leads={filteredLeads} onViewAuditLog={viewAuditLog} />}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Lead">
        <form onSubmit={handleCreateLead} className="space-y-3">
          <ErrorBanner message={formError} />
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
          <textarea
            placeholder="Notes (optional)" value={form.clientNotes}
            onChange={(e) => setForm({ ...form, clientNotes: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
          <button type="submit" className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">
            Create Lead
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!auditLogs} onClose={() => setAuditLogs(null)} title="Audit Log">
        {auditLogs && <AuditLogViewer logs={auditLogs} />}
      </Modal>
    </PageContainer>
  );
}