import { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Navbar from '../components/layout/Navbar';
import LeadListItem from '../components/leads/LeadListItem';
import LeadDetailPanel from '../components/leads/LeadDetailPanel';
import ContactAttemptForm from '../components/leads/ContactAttemptForm';
import RevisionRequestForm from '../components/leads/RevisionRequestForm';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLeads } from '../hooks/useLeads';
import { useLeadDetail } from '../hooks/useLeadDetails';
import { contactClient, confirmLead, requestRevision, selectOption } from '../api/leads';

const SELECTABLE_STATUSES = ['CLIENT_CONTACTED_D', 'OPTION_SELECTED_D'];

export default function DashboardD() {
  const { leads, loading, refresh } = useLeads();
  const { detail, error, open, refresh: refreshDetail } = useLeadDetail();
  const [actionError, setActionError] = useState('');

  const handleSelectLead = async (leadId) => {
    setActionError('');
    await open(leadId);
  };

  const handleLogContact = async (outcome) => {
    setActionError('');
    try {
      await contactClient(detail.lead._id, { outcome });
      await refreshDetail();
      await refresh();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to log contact');
    }
  };

  const handleSelectOption = async (optionId) => {
    setActionError('');
    try {
      await selectOption(detail.lead._id, optionId);
      await refreshDetail();
      await refresh();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to select option');
    }
  };

  const handleConfirm = async () => {
    setActionError('');
    try {
      await confirmLead(detail.lead._id);
      await refreshDetail();
      await refresh();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to confirm booking');
    }
  };

  const handleRequestRevision = async (reason) => {
    setActionError('');
    try {
      await requestRevision(detail.lead._id, { reason });
      await refreshDetail();
      await refresh();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to request revision');
    }
  };

  const canSelectOption = detail && SELECTABLE_STATUSES.includes(detail.lead.status);
  const canConfirm = detail && !!detail.lead.selectedOption && detail.lead.status !== 'CONFIRMED';

  return (
    <PageContainer>
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 md:col-span-1 overflow-hidden">
          <h2 className="font-semibold text-slate-800 px-4 py-4 border-b border-slate-100">My Leads</h2>
          {loading ? (
            <LoadingSpinner />
          ) : leads.length === 0 ? (
            <EmptyState message="No leads assigned yet." />
          ) : (
            <ul className="divide-y divide-slate-50">
              {leads.map((lead) => (
                <LeadListItem
                  key={lead._id}
                  lead={lead}
                  isActive={detail?.lead._id === lead._id}
                  onClick={handleSelectLead}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2">
          {!detail && (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 h-full flex items-center justify-center">
              <EmptyState message="Select a lead from the list to review compiled options." />
            </div>
          )}
          {detail && (
            <LeadDetailPanel
              detail={detail}
              error={error || actionError}
              onSelectOption={handleSelectOption}
              canSelectOption={canSelectOption}
            >
              {['CONFIRMED', 'REVISION_PENDING_A', 'OPTIONS_GATHERING'].includes(detail.lead.status) ? (
                <p className="text-sm text-slate-400">
                  {detail.lead.status === 'CONFIRMED'
                    ? 'This booking is confirmed. No further action is needed.'
                    : detail.lead.status === 'REVISION_PENDING_A'
                    ? 'Waiting on Role A to review and resend this revision request.'
                    : 'Waiting for Ticketing Staff to submit new options.'}
                </p>
              ) : (
                <>
                  <ContactAttemptForm onSubmit={handleLogContact} />
                  <div>
                    <button
                      onClick={handleConfirm}
                      disabled={!canConfirm}
                      className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                        canConfirm
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Confirm Booking
                    </button>
                    {!canConfirm && (
                      <p className="text-xs text-slate-400 mt-1.5">
                        Select an option with the client before booking.
                      </p>
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <RevisionRequestForm onSubmit={handleRequestRevision} />
                  </div>
                </>
              )}
            </LeadDetailPanel>
          )}
        </div>
      </div>
    </PageContainer>
  );
}