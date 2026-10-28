import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatCurrency } from '../data';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { Badge } from '../../../components/ui/Badge';
import { StatusChip } from '../../../components/ui/StatusChip';
import { Icon } from '../../../components/ui/Icon';

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
  ytdSpend: number; // in Lakhs
  activeContracts: number;
}

const initialVendors: Vendor[] = [
  {
    id: 'VND-2026-001',
    name: 'Zenith Digital & Hardware Labs Pvt Ltd',
    tradeName: 'Zenith Labs',
    category: 'IT & Hardware',
    gstin: '21AAACZ4819M1Z8',
    pan: 'AAACZ4819M',
    isMsme: true,
    bankAccount: '91802004819201',
    ifsc: 'UTIB0000119',
    bankName: 'Axis Bank',
    contactPerson: 'Sunil Patnaik',
    email: 'contact@zenithlabs.in',
    phone: '+91 94370 19284',
    location: 'Bhubaneswar, Odisha',
    status: 'Empaneled',
    complianceScore: 98,
    ytdSpend: 42.5,
    activeContracts: 3,
  },
  {
    id: 'VND-2026-002',
    name: 'Maa Tarini Rural Logistics Fleet',
    tradeName: 'MTR Logistics',
    category: 'Field Logistics',
    gstin: '21BBLPM8910P1Z2',
    pan: 'BBLPM8910P',
    isMsme: true,
    bankAccount: '389102948190',
    ifsc: 'SBIN0001042',
    bankName: 'State Bank of India',
    contactPerson: 'Bikram Nayak',
    email: 'tarini.logistics@gmail.com',
    phone: '+91 99371 88410',
    location: 'Keonjhar, Odisha',
    status: 'Empaneled',
    complianceScore: 92,
    ytdSpend: 28.2,
    activeContracts: 2,
  },
  {
    id: 'VND-2026-003',
    name: 'Kalinga Technical Training & Assessment Services',
    tradeName: 'Kalinga Tech',
    category: 'Training & Labs',
    gstin: '21CCDPK1948L1Z5',
    pan: 'CCDPK1948L',
    isMsme: false,
    bankAccount: '50200049182910',
    ifsc: 'HDFC0000284',
    bankName: 'HDFC Bank',
    contactPerson: 'Manas Rout',
    email: 'info@kalingatech.org',
    phone: '+91 98610 44921',
    location: 'Angul, Odisha',
    status: 'Empaneled',
    complianceScore: 95,
    ytdSpend: 56.8,
    activeContracts: 4,
  },
  {
    id: 'VND-2026-004',
    name: 'Pradhan Infrastructure & Watershed Works',
    tradeName: 'Pradhan Infra',
    category: 'Civil Works',
    gstin: '21DDAPK5512K1Z9',
    pan: 'DDAPK5512K',
    isMsme: true,
    bankAccount: '00420500192833',
    ifsc: 'ICIC0000042',
    bankName: 'ICICI Bank',
    contactPerson: 'Ashok Pradhan',
    email: 'pradhan.infra@yahoo.com',
    phone: '+91 97760 11928',
    location: 'Koraput, Odisha',
    status: 'Review Required',
    complianceScore: 78,
    ytdSpend: 19.4,
    activeContracts: 1,
  },
];

export const VendorManagementView: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = initialVendors.filter((v) => {
    const matchesQuery =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.gstin.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || v.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  return (
    <View style={styles.container}>
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search vendors by name, GSTIN or city..."
        filters={[
          { id: 'all', label: 'All Categories', count: initialVendors.length },
          { id: 'IT & Hardware', label: 'IT & Hardware' },
          { id: 'Field Logistics', label: 'Field Logistics' },
          { id: 'Training & Labs', label: 'Training & Labs' },
          { id: 'Civil Works', label: 'Civil Works' },
        ]}
        activeFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
      />

      <View style={styles.list}>
        {filtered.map((vendor) => (
          <View
            key={vendor.id}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.border,
                ...theme.shadows.card,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.nameRow}>
                  <Text style={[styles.vendorName, { color: theme.colors.text }]}>
                    {vendor.name}
                  </Text>
                  {vendor.isMsme && <Badge label="MSME" tone="emerald" size="sm" />}
                </View>
                <Text style={[styles.gstinText, { color: theme.colors.brandPrimary }]}>
                  GSTIN: {vendor.gstin} · PAN: {vendor.pan}
                </Text>
                <Text style={[styles.locationText, { color: theme.colors.textSubtle }]}>
                  {vendor.location} · Contact: {vendor.contactPerson} ({vendor.phone})
                </Text>
              </View>

              <StatusChip status={vendor.status} />
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={[styles.statLabel, { color: theme.colors.textSubtle }]}>
                  COMPLIANCE
                </Text>
                <Text
                  style={[
                    styles.statVal,
                    {
                      color:
                        vendor.complianceScore >= 90
                          ? theme.colors.emerald
                          : theme.colors.warning,
                    },
                  ]}
                >
                  {vendor.complianceScore}%
                </Text>
              </View>

              <View style={styles.statCol}>
                <Text style={[styles.statLabel, { color: theme.colors.textSubtle }]}>
                  YTD DISBURSED
                </Text>
                <Text style={[styles.statVal, { color: theme.colors.text }]}>
                  {formatCurrency(vendor.ytdSpend)}
                </Text>
              </View>

              <View style={styles.statCol}>
                <Text style={[styles.statLabel, { color: theme.colors.textSubtle }]}>
                  ACTIVE CONTRACTS
                </Text>
                <Text style={[styles.statVal, { color: theme.colors.brandPrimary }]}>
                  {vendor.activeContracts}
                </Text>
              </View>

              <View style={styles.statCol}>
                <Text style={[styles.statLabel, { color: theme.colors.textSubtle }]}>
                  BANK ACCOUNT
                </Text>
                <Text style={[styles.statVal, { color: theme.colors.text, fontSize: 11 }]}>
                  {vendor.bankName}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  gstinText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
  },
});
