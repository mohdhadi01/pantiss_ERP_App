import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useTheme';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { formatCurrency } from '../data';
import { heroGradients } from '../../../theme/gradients';
import { HeroBanner } from './HeroBanner';
import { MetricCard } from '../../../components/ui/MetricCard';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { VendorCard, VendorDetailsSheet } from './VendorManagementParts';

export interface Vendor {
  id: string;
  name: string;
  tradeName: string;
  category: 'IT & Hardware' | 'Field Logistics' | 'Training & Labs' | 'Civil Works' | 'Professional Services';
  gstin: string;
  pan: string;
  isMsme: boolean;
  bankAccount: string;
  ifsc: string;
  bankName: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: 'Empaneled' | 'Under Verification' | 'Review Required';
  complianceScore: number;
  ytdSpend: number;
  activeContracts: number;
  paymentTerms: string;
}

const initialVendors: Vendor[] = [
  { id: 'VND-2026-001', name: 'Zenith Digital & Hardware Labs Pvt Ltd', tradeName: 'Zenith Labs', category: 'IT & Hardware', gstin: '21AAACZ4819M1Z8', pan: 'AAACZ4819M', isMsme: true, bankAccount: '91802004819201', ifsc: 'UTIB0000119', bankName: 'Axis Bank', contactPerson: 'Sunil Patnaik', email: 'contact@zenithlabs.in', phone: '+91 94370 19284', location: 'Bhubaneswar, Odisha', status: 'Empaneled', complianceScore: 98, ytdSpend: 42.5, activeContracts: 3, paymentTerms: 'Net 30 days' },
  { id: 'VND-2026-002', name: 'Maa Tarini Rural Logistics Fleet', tradeName: 'MTR Logistics', category: 'Field Logistics', gstin: '21BBLPM8910P1Z2', pan: 'BBLPM8910P', isMsme: true, bankAccount: '389102948190', ifsc: 'SBIN0001042', bankName: 'State Bank of India', contactPerson: 'Bikram Nayak', email: 'tarini.logistics@gmail.com', phone: '+91 99371 88410', location: 'Keonjhar, Odisha', status: 'Empaneled', complianceScore: 92, ytdSpend: 28.2, activeContracts: 2, paymentTerms: 'Net 15 days' },
  { id: 'VND-2026-003', name: 'Kalinga Technical Training & Assessment Services', tradeName: 'Kalinga Tech', category: 'Training & Labs', gstin: '21CCDPK1948L1Z5', pan: 'CCDPK1948L', isMsme: false, bankAccount: '50200049182910', ifsc: 'HDFC0000284', bankName: 'HDFC Bank', contactPerson: 'Manas Rout', email: 'info@kalingatech.org', phone: '+91 98610 44921', location: 'Angul, Odisha', status: 'Empaneled', complianceScore: 95, ytdSpend: 56.8, activeContracts: 4, paymentTerms: 'Net 30 days' },
  { id: 'VND-2026-004', name: 'Pradhan Infrastructure & Watershed Works', tradeName: 'Pradhan Infra', category: 'Civil Works', gstin: '21DDAPK5512K1Z9', pan: 'DDAPK5512K', isMsme: true, bankAccount: '00420500192833', ifsc: 'ICIC0000042', bankName: 'ICICI Bank', contactPerson: 'Ashok Pradhan', email: 'pradhan.infra@yahoo.com', phone: '+91 97760 11928', location: 'Koraput, Odisha', status: 'Review Required', complianceScore: 78, ytdSpend: 19.4, activeContracts: 1, paymentTerms: 'Milestone linked' },
];

const CATEGORY_OPTIONS = [
  { value: 'IT & Hardware', label: 'IT & Hardware' },
  { value: 'Field Logistics', label: 'Field Logistics' },
  { value: 'Training & Labs', label: 'Training & Labs' },
  { value: 'Civil Works', label: 'Civil Works' },
  { value: 'Professional Services', label: 'Professional Services' },
];

interface EmpanelForm {
  legalName: string;
  tradeName: string;
  gstin: string;
  pan: string;
  udyam: string;
  category: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
}

const EMPTY_FORM: EmpanelForm = {
  legalName: '', tradeName: '', gstin: '', pan: '', udyam: '', category: 'IT & Hardware',
  bankName: '', accountNumber: '', ifsc: '', contactPerson: '', email: '', phone: '', location: '',
};

export const VendorManagementView: React.FC = () => {
  const { theme } = useTheme();
  const { isMd } = useBreakpoint();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [empanelOpen, setEmpanelOpen] = useState(false);
  const [form, setForm] = useState<EmpanelForm>(EMPTY_FORM);
  const [detailsVendor, setDetailsVendor] = useState<Vendor | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const kpis = useMemo(() => {
    const msme = vendors.filter((v) => v.isMsme).length;
    const ytd = vendors.reduce((sum, v) => sum + v.ytdSpend, 0);
    return {
      count: vendors.length,
      msme,
      msmePct: vendors.length ? Math.round((msme / vendors.length) * 100) : 0,
      ytd,
    };
  }, [vendors]);

  const filtered = useMemo(
    () =>
      vendors.filter((v) => {
        const q = search.toLowerCase();
        const matchesQuery =
          v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q) || v.gstin.toLowerCase().includes(q) || v.location.toLowerCase().includes(q);
        const matchesCat = categoryFilter === 'all' || v.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
        return matchesQuery && matchesCat && matchesStatus;
      }),
    [vendors, search, categoryFilter, statusFilter],
  );

  const setField = (key: keyof EmpanelForm) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSaveVendor = () => {
    if (!form.legalName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const next: Vendor = {
      id: `VND-2026-${String(vendors.length + 1).padStart(3, '0')}`,
      name: form.legalName.trim(),
      tradeName: form.tradeName.trim() || form.legalName.trim(),
      category: form.category as Vendor['category'],
      gstin: form.gstin.trim() || '—',
      pan: form.pan.trim() || '—',
      isMsme: Boolean(form.udyam.trim()),
      bankAccount: form.accountNumber.trim() || '—',
      ifsc: form.ifsc.trim() || '—',
      bankName: form.bankName.trim() || '—',
      contactPerson: form.contactPerson.trim() || '—',
      email: form.email.trim() || '—',
      phone: form.phone.trim() || '—',
      location: form.location.trim() || 'Odisha',
      status: 'Under Verification',
      complianceScore: 80,
      ytdSpend: 0,
      activeContracts: 0,
      paymentTerms: 'Net 30 days',
    };
    setVendors((prev) => [next, ...prev]);
    setForm(EMPTY_FORM);
    setEmpanelOpen(false);
  };

  return (
    <View style={styles.container}>
      <HeroBanner
        gradient={heroGradients.vendor}
        badge={{ icon: 'Users', label: 'Vendor & Supplier Governance' }}
        title="Empaneled Vendor Master Directory"
        description="Statutory credentials, banking channels and compliance posture of every empaneled supplier."
        actions={[{ label: 'Empanel New Vendor', icon: 'Plus', variant: 'white', onPress: () => setEmpanelOpen(true) }]}
      />

      <View style={styles.metricsGrid}>
        <MetricCard style={styles.metricCard} label="Empaneled Vendors" value={String(kpis.count)} subtitle="Verified" icon="Users" accentColor={theme.colors.financeAccent} arrow />
        <MetricCard style={styles.metricCard} label="MSME / Udyam Compliant" value={String(kpis.msme)} subtitle={`${kpis.msmePct}% of Total`} icon="BadgeCheck" accentColor={theme.colors.teal} arrow />
        <MetricCard style={styles.metricCard} label="Compliance & Filing Rate" value="98.4%" subtitle="High Tier" icon="ShieldCheck" accentColor={theme.colors.info} arrow />
        <MetricCard style={styles.metricCard} label="YTD Procurement Disbursed" value={formatCurrency(kpis.ytd)} subtitle="FY 2026-27" icon="FileText" accentColor={theme.colors.violet} arrow />
      </View>

      <View style={styles.section}>
        <Text style={[theme.fontStyles.h3, { color: theme.colors.text }]}>Active Vendor Master List</Text>
        <View style={styles.filterWrap}>
          <TextField value={search} onChangeText={setSearch} placeholder="Search vendors by name, GSTIN or city…" containerStyle={styles.filterSearch} />
          <SelectField value={categoryFilter} onChange={setCategoryFilter} options={[{ value: 'all', label: 'All categories' }, ...CATEGORY_OPTIONS]} placeholder="All categories" containerStyle={styles.filterSelect} />
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'Empaneled', label: 'Empaneled' },
              { value: 'Under Verification', label: 'Under Verification' },
              { value: 'Review Required', label: 'Review Required' },
            ]}
            placeholder="All statuses"
            containerStyle={styles.filterSelect}
          />
        </View>

        {filtered.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No vendors match the current filters.</Text>
        ) : (
          <View style={[styles.grid, isMd && styles.gridWide]}>
            {filtered.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onPress={() => {
                  setDetailsVendor(vendor);
                  setDetailsOpen(true);
                }}
              />
            ))}
          </View>
        )}
      </View>

      <ModalSheet
        visible={empanelOpen}
        onClose={() => setEmpanelOpen(false)}
        label="Vendor governance"
        title="Empanel New Vendor"
        description="Capture statutory, banking and contact credentials for the master directory."
        size="lg"
        footer={
          <>
            <Button label="Cancel" variant="outline" onPress={() => setEmpanelOpen(false)} />
            <Button label="Save Vendor" variant="emerald" onPress={handleSaveVendor} />
          </>
        }
      >
        <View style={isMd ? styles.formRow : undefined}>
          <TextField label="Legal Name" value={form.legalName} onChangeText={setField('legalName')} placeholder="Registered entity name" containerStyle={isMd ? styles.formRowItem : undefined} />
          <TextField label="Trade Name" value={form.tradeName} onChangeText={setField('tradeName')} placeholder="Operating name" containerStyle={isMd ? styles.formRowItem : undefined} />
        </View>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSubtle }]}>STATUTORY & TAX CREDENTIALS</Text>
        <View style={isMd ? styles.formRow : undefined}>
          <TextField label="GSTIN" value={form.gstin} onChangeText={setField('gstin')} placeholder="21XXXXXXXXXXX1ZX" containerStyle={isMd ? styles.formRowItem : undefined} />
          <TextField label="PAN" value={form.pan} onChangeText={setField('pan')} placeholder="AAAAA0000A" containerStyle={isMd ? styles.formRowItem : undefined} />
        </View>
        <View style={isMd ? styles.formRow : undefined}>
          <TextField label="Udyam / MSME No." value={form.udyam} onChangeText={setField('udyam')} placeholder="UDYAM-OD-00-0000000" containerStyle={isMd ? styles.formRowItem : undefined} />
          <SelectField label="Category" value={form.category} onChange={setField('category')} options={CATEGORY_OPTIONS} containerStyle={isMd ? styles.formRowItem : undefined} />
        </View>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSubtle }]}>BANKING & REMITTANCE CHANNEL</Text>
        <View style={isMd ? styles.formRow : undefined}>
          <TextField label="Bank Name" value={form.bankName} onChangeText={setField('bankName')} placeholder="e.g. State Bank of India" containerStyle={isMd ? styles.formRowItem : undefined} />
          <TextField label="Account Number" value={form.accountNumber} onChangeText={setField('accountNumber')} keyboardType="numeric" placeholder="000000000000" containerStyle={isMd ? styles.formRowItem : undefined} />
        </View>
        <TextField label="IFSC" value={form.ifsc} onChangeText={setField('ifsc')} placeholder="SBIN0001042" autoCapitalize="characters" />
        <Text style={[styles.sectionLabel, { color: theme.colors.textSubtle }]}>CONTACT & LOCATION</Text>
        <View style={isMd ? styles.formRow : undefined}>
          <TextField label="Contact Person" value={form.contactPerson} onChangeText={setField('contactPerson')} placeholder="Authorized signatory" containerStyle={isMd ? styles.formRowItem : undefined} />
          <TextField label="Phone" value={form.phone} onChangeText={setField('phone')} keyboardType="phone-pad" placeholder="+91 00000 00000" containerStyle={isMd ? styles.formRowItem : undefined} />
        </View>
        <View style={isMd ? styles.formRow : undefined}>
          <TextField label="Email" value={form.email} onChangeText={setField('email')} keyboardType="email-address" autoCapitalize="none" placeholder="accounts@vendor.in" containerStyle={isMd ? styles.formRowItem : undefined} />
          <TextField label="Location" value={form.location} onChangeText={setField('location')} placeholder="City, State" containerStyle={isMd ? styles.formRowItem : undefined} />
        </View>
      </ModalSheet>

      <VendorDetailsSheet vendor={detailsVendor} visible={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flexGrow: 1, flexBasis: 220 },
  section: { gap: 12 },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterSearch: { flexGrow: 1, flexBasis: 240 },
  filterSelect: { flexGrow: 1, flexBasis: 170 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridWide: { flexWrap: 'nowrap' },
  emptyText: { fontSize: 13, paddingVertical: 18, textAlign: 'center' },
  formRow: { flexDirection: 'row', gap: 12 },
  formRowItem: { flex: 1 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginTop: 4 },
});
