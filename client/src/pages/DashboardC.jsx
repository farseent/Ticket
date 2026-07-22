import { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Navbar from '../components/layout/Navbar';
import LeadListItem from '../components/leads/LeadListItem';
import LeadDetailPanel from '../components/leads/LeadDetailPanel';
import OptionForm from '../components/leads/OptionForm';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLeads } from '../hooks/useLeads';
import { useLeadDetail } from '../hooks/useLeadDetails';
import { submitOption } from '../api/leads';
import { useAuth } from '../hooks/useAuth';

export default function DashboardC() {
  const { user } = useAuth();
  // For Role C, GET /leads returns wrapped items: { lead, currentRoundSubmissions, submittedByMe }
  const { leads, loading, refresh } = useLeads();
  const { detail, error, open, refresh: refreshDetail } = useLeadDetail();
  const [actionError, setActionError] = useState('');

  const handleSelectLead = async (leadId) => {
    setActionError('');
    await open(leadId);
  };

  const handleSubmitOption = async (form) => {
    setActionError('');
    try {
      await submitOption(detail.lead._id, form);
      await refreshDetail();
      await refresh();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to submit option');
    }
  };

  // Computed live from the open lead's options (not the list snapshot),
  // so it updates immediately after this user submits.
  const myRoundSubmissions = detail?.options.filter(
    (o) => o.round === detail.lead.currentRevisionRound && o.submittedBy?._id === user.id
  ) || [];

  return (
    <PageContainer>
      <Navbar title="Role C — Ticketing Staff" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 md:col-span-1 overflow-hidden">
          <h2 className="font-semibold text-slate-800 px-4 py-4 border-b border-slate-100">
            Leads Open for Sourcing
          </h2>
          {loading ? (
            <LoadingSpinner />
          ) : leads.length === 0 ? (
            <EmptyState message="No leads currently broadcast to your group." />
          ) : (
            <ul className="divide-y divide-slate-50">
              {leads.map((item) => (
                <LeadListItem
                  key={item.lead._id}
                  lead={item.lead}
                  isActive={detail?.lead._id === item.lead._id}
                  onClick={handleSelectLead}
                  meta={
                    <span className={`text-xs font-medium ${item.submittedByMe ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {item.submittedByMe
                        ? '✓ You submitted an option'
                        : `Awaiting your option · ${item.currentRoundSubmissions} submitted so far`}
                    </span>
                  }
                />
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2">
          {!detail && (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 h-full flex items-center justify-center">
              <EmptyState message="Select a lead from the list to submit flight options." />
            </div>
          )}
          {detail && (
            <LeadDetailPanel detail={detail} error={error || actionError}>
              {myRoundSubmissions.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium">
                  You've submitted {myRoundSubmissions.length} option(s) for this round.
                </p>
              )}
              <OptionForm onSubmit={handleSubmitOption} />
            </LeadDetailPanel>
          )}
        </div>
      </div>
    </PageContainer>
  );
}