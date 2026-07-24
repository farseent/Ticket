import { useMemo, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Navbar from '../components/layout/Navbar';
import LeadListItem from '../components/leads/LeadListItem';
import LeadDetailPanel from '../components/leads/LeadDetailPanel';
import OptionForm from '../components/leads/OptionForm';
import LeadFilterBar from '../components/leads/LeadFilterBar';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import { useLeads } from '../hooks/useLeads';
import { useLeadDetail } from '../hooks/useLeadDetails';
import { submitOption } from '../api/leads';
import { useAuth } from '../hooks/useAuth';
import { notifySuccess, notifyError } from '../utils/toast';

const C_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'Open for options' },
  { key: 'CONFIRMED', label: 'Confirmed' },
];

const OPEN_STATUSES = ['DISPATCHED_C_GROUP', 'OPTIONS_GATHERING', 'ASSIGNED_D', 'CLIENT_CONTACTED_D', 'OPTION_SELECTED_D'];

export default function DashboardC() {
  const { user } = useAuth();
  const { leads, loading, refresh } = useLeads({ all: 'true' });
  const { detail, error, open, refresh: refreshDetail } = useLeadDetail();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN');

  const handleSelectLead = async (leadId) => {
    await open(leadId);
  };

  const handleSubmitOption = async (form) => {
    try {
      await submitOption(detail.lead._id, form);
      notifySuccess('Flight option submitted.');
      await refreshDetail();
      await refresh();
    } catch (err) {
      notifyError(err.response?.data?.error || 'Failed to submit option');
    }
  };

  const myRoundSubmissions = detail?.options.filter(
    (o) => o.round === detail.lead.currentRevisionRound && o.submittedBy?._id === user.id
  ) || [];

  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      const matchesSearch = item.lead.clientName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ? true :
        statusFilter === 'OPEN' ? OPEN_STATUSES.includes(item.lead.status) :
        item.lead.status === 'CONFIRMED';
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const canSubmitOption = detail && OPEN_STATUSES.includes(detail.lead.status);

  return (
    <PageContainer>
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 md:col-span-1 overflow-hidden">
          <h2 className="font-semibold text-slate-800 px-4 py-4 border-b border-slate-100">Leads</h2>
          <LeadFilterBar
            search={search} onSearchChange={setSearch}
            statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
            filters={C_FILTERS}
          />
          {loading ? (
            <LoadingSpinner />
          ) : filteredLeads.length === 0 ? (
            <EmptyState message="No leads match your filters." />
          ) : (
            <ul className="divide-y divide-slate-50">
              {filteredLeads.map((item) => (
                <LeadListItem
                  key={item.lead._id}
                  lead={item.lead}
                  isActive={detail?.lead._id === item.lead._id}
                  onClick={handleSelectLead}
                  meta={
                    OPEN_STATUSES.includes(item.lead.status) ? (
                      <span className={`text-xs font-medium ${item.submittedByMe ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {item.submittedByMe ? '✓ You submitted an option' : `Awaiting your option · ${item.currentRoundSubmissions} submitted so far`}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Closed</span>
                    )
                  }
                />
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2">
          {!detail && (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 h-full flex items-center justify-center">
              <EmptyState message="Select a lead from the list to view or submit flight options." />
            </div>
          )}
          {detail && (
            <>
              <ErrorBanner message={error} />
              <LeadDetailPanel detail={detail}>
                {canSubmitOption ? (
                  <>
                    {myRoundSubmissions.length > 0 && (
                      <p className="text-xs text-emerald-600 font-medium">
                        You've submitted {myRoundSubmissions.length} option(s) for this round.
                      </p>
                    )}
                    <OptionForm onSubmit={handleSubmitOption} />
                  </>
                ) : (
                  <p className="text-sm text-slate-400">This lead is no longer open for new options.</p>
                )}
              </LeadDetailPanel>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}