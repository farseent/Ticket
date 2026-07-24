import { useMemo, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Navbar from '../components/layout/Navbar';
import LeadListItem from '../components/leads/LeadListItem';
import LeadDetailPanel from '../components/leads/LeadDetailPanel';
import OptionForm from '../components/leads/OptionForm';
import ContactAttemptForm from '../components/leads/ContactAttemptForm';
import LeadFilterBar from '../components/leads/LeadFilterBar';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import { useLeads } from '../hooks/useLeads';
import { useLeadDetail } from '../hooks/useLeadDetails';
import { submitOption, contactClient, confirmLead, selectOption } from '../api/leads';
import { notifySuccess, notifyError } from '../utils/toast';

const SELECTABLE_STATUSES = ['CLIENT_CONTACTED_B', 'OPTION_SELECTED_B'];

const B_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'In progress' },
  { key: 'CONFIRMED', label: 'Confirmed' },
];

export default function DashboardB() {
  const { leads, loading, refresh } = useLeads();
  const { detail, error, open, refresh: refreshDetail } = useLeadDetail();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  const handleLogContact = async (outcome) => {
    try {
      await contactClient(detail.lead._id, { outcome });
      notifySuccess('Contact attempt logged.');
      await refreshDetail();
      await refresh();
    } catch (err) {
      notifyError(err.response?.data?.error || 'Failed to log contact');
    }
  };

  const handleSelectOption = async (optionId) => {
    try {
      await selectOption(detail.lead._id, optionId);
      notifySuccess('Option selected.');
      await refreshDetail();
      await refresh();
    } catch (err) {
      notifyError(err.response?.data?.error || 'Failed to select option');
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmLead(detail.lead._id);
      notifySuccess('Booking confirmed.');
      await refreshDetail();
      await refresh();
    } catch (err) {
      notifyError(err.response?.data?.error || 'Failed to confirm booking');
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = lead.clientName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ? true :
        statusFilter === 'ACTIVE' ? lead.status !== 'CONFIRMED' :
        lead.status === 'CONFIRMED';
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const canSelectOption = detail && SELECTABLE_STATUSES.includes(detail.lead.status);
  const canConfirm = detail && !!detail.lead.selectedOption && detail.lead.status !== 'CONFIRMED';

  return (
    <PageContainer>
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 md:col-span-1 overflow-hidden">
          <h2 className="font-semibold text-slate-800 px-4 py-4 border-b border-slate-100">My Leads</h2>
          <LeadFilterBar
            search={search} onSearchChange={setSearch}
            statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
            filters={B_FILTERS}
          />
          {loading ? (
            <LoadingSpinner />
          ) : filteredLeads.length === 0 ? (
            <EmptyState message="No leads match your filters." />
          ) : (
            <ul className="divide-y divide-slate-50">
              {filteredLeads.map((lead) => (
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
            <>
              <ErrorBanner message={error} />
              <LeadDetailPanel
                detail={detail}
                onSelectOption={handleSelectOption}
                canSelectOption={canSelectOption}
              >
                {detail.lead.status === 'CONFIRMED' ? (
                  <p className="text-sm text-slate-400">This booking is confirmed. No further action is needed.</p>
                ) : (
                  <>
                    <OptionForm onSubmit={handleSubmitOption} />
                    <ContactAttemptForm onSubmit={handleLogContact} />
                    <div>
                      <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                          canConfirm ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Confirm Booking
                      </button>
                      {!canConfirm && (
                        <p className="text-xs text-slate-400 mt-1.5">Select an option with the client before booking.</p>
                      )}
                    </div>
                  </>
                )}
              </LeadDetailPanel>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}