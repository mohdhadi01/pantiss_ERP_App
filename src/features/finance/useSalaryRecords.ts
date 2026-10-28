import { useEffect, useState, useCallback } from 'react';
import {
  createSalaryRecords,
  isFinanceEligible,
  reviewSalaryByHR,
  salaryKey,
  updateSalaryPayment,
  forwardSalaryForPayment,
  forwardMultipleSalariesForPayment,
  approveSalaryRecord,
  rejectSalaryRecord,
  recordSalaryDisbursement,
  SalaryPaymentUpdate,
  SalaryRecord,
} from './salaryData';
import { storage } from '../../utils/storage';

export const salaryStorageKey = 'salary_payments_v2';

export interface StoredSalaryPayment extends SalaryPaymentUpdate {
  key: string;
  hrApproval?: SalaryRecord['hrApproval'];
  hrApprovedBy?: string;
  hrApprovedOn?: string;
  hrReason?: string;
  forwardedAt?: string;
  forwardedBy?: string;
  approvalStatus?: SalaryRecord['approvalStatus'];
  approvedBy?: string;
  approvedOn?: string;
  rejectionReason?: string;
}

export function useSalaryRecords(scope: 'finance' | 'hr' = 'finance') {
  const [records, setRecords] = useState<SalaryRecord[]>(createSalaryRecords());
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadSaved = useCallback(async () => {
    const seed = createSalaryRecords();
    try {
      const updates = await storage.get<StoredSalaryPayment[] | null>(salaryStorageKey, null);
      if (!updates || !Array.isArray(updates)) {
        setRecords(seed);
        setLoading(false);
        return;
      }

      const merged = updates.reduce((acc: SalaryRecord[], update: StoredSalaryPayment) => {
        return updateSalaryPayment(acc, update.key, update).map((record) => {
          if (salaryKey(record) !== update.key) return record;
          return {
            ...record,
            hrApproval: update.hrApproval ?? record.hrApproval,
            hrApprovedBy: update.hrApprovedBy ?? record.hrApprovedBy,
            hrApprovedOn: update.hrApprovedOn ?? record.hrApprovedOn,
            hrReason: update.hrReason,
            forwardedAt: update.forwardedAt ?? record.forwardedAt,
            forwardedBy: update.forwardedBy ?? record.forwardedBy,
            approvalStatus: update.approvalStatus ?? record.approvalStatus,
            approvedBy: update.approvedBy ?? record.approvedBy,
            approvedOn: update.approvedOn ?? record.approvedOn,
            rejectionReason: update.rejectionReason,
          };
        });
      }, seed);

      setRecords(merged);
    } catch {
      setError('Saved salary payments could not be loaded. Demo records are shown.');
      setRecords(seed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const persist = async (transform: (current: SalaryRecord[]) => SalaryRecord[]) => {
    try {
      const nextRecords = transform(records);
      const payments: StoredSalaryPayment[] = nextRecords.map((record) => ({
        key: salaryKey(record),
        hrApproval: record.hrApproval,
        hrApprovedBy: record.hrApprovedBy,
        hrApprovedOn: record.hrApprovedOn,
        hrReason: record.hrReason,
        status: record.status,
        paidOn: record.paidOn ?? '',
        reference: record.reference ?? '',
        forwardedAt: record.forwardedAt,
        forwardedBy: record.forwardedBy,
        approvalStatus: record.approvalStatus,
        approvedBy: record.approvedBy,
        approvedOn: record.approvedOn,
        rejectionReason: record.rejectionReason,
      }));

      await storage.set(salaryStorageKey, payments);
      setRecords(nextRecords);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Salary update could not be saved.');
      throw e;
    }
  };

  const forwardForPayment = (key: string, actor: string) =>
    persist((recs) => forwardSalaryForPayment(recs, key, actor));

  const forwardMultiple = (keys: string[], actor: string) =>
    persist((recs) => forwardMultipleSalariesForPayment(recs, keys, actor));

  const approveSalary = (key: string, approver: string) =>
    persist((recs) => approveSalaryRecord(recs, key, approver));

  const rejectSalary = (key: string, reason?: string) =>
    persist((recs) => rejectSalaryRecord(recs, key, reason));

  const savePayment = (key: string, update: SalaryPaymentUpdate) =>
    persist((recs) => recordSalaryDisbursement(recs, key, update));

  const reviewByHR = (
    key: string,
    decision: 'Approved' | 'Rejected',
    actor: string,
    reason?: string
  ) => persist((recs) => reviewSalaryByHR(recs, key, decision, actor, reason));

  const displayedRecords = scope === 'hr' ? records : records.filter(isFinanceEligible);

  return {
    records: displayedRecords,
    allRecords: records,
    loading,
    error,
    reviewByHR,
    savePayment,
    forwardForPayment,
    forwardMultiple,
    approveSalary,
    rejectSalary,
  };
}
