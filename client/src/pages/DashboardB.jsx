import { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Navbar from '../components/layout/Navbar';
import LeadListItem from '../components/leads/LeadListItem';
import LeadDetailPanel from '../components/leads/LeadDetailPanel';
import OptionForm from '../components/leads/OptionForm';
import ContactAttemptForm from '../components/leads/ContactAttemptForm';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLeads } from '../hooks/useLeads';
import { useLeadDetail } from '../hooks/useLeadDetails';
import { submitOption, contactClient, confirmLead } from '../api/leads';

export default function DashboardB() {
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

  const handleConfirm = async () => {
    setActionError('');
    try {
      await confirmLead(detail.lead._id);
      await refreshDetail();
      await refresh();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to confirm');
    }
  };

  return (
    <PageContainer>
      <Navbar title="Role B — Ticketing Agent" />
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
              <EmptyState message="Select a lead from the list to work on it." />
            </div>
          )}
          {detail && (
            <LeadDetailPanel detail={detail} error={error || actionError}>
              <OptionForm onSubmit={handleSubmitOption} />
              <ContactAttemptForm onSubmit={handleLogContact} />
              <button
                onClick={handleConfirm}
                className="w-full bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Confirm Booking
              </button>
            </LeadDetailPanel>
          )}
        </div>
      </div>
    </PageContainer>
  );
}