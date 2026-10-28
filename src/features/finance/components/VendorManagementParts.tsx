import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { formatCurrency } from '../data';
import { Card } from '../../../components/ui/Card';
import { StatusChip } from '../../../components/ui/StatusChip';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { Icon } from '../../../components/ui/Icon';
import type { Vendor } from './VendorManagementView';

/** Vendor master card — web grid tile with inner detail panel. */
export const VendorCard: React.FC<{ vendor: Vendor; onPress: () => void }> = ({ vendor, onPress }) => {
  const { theme } = useTheme();
  const last4 = vendor.bankAccount.slice(-4);
  return (
    <Pressable onPress={onPress} style={styles.cardWrap}>
      <Card padding={16} style={styles.card}>
        <View style={styles.topRow}>
          <StatusChip status={vendor.category} tone="brand" dot={false} />
          {vendor.isMsme ? <StatusChip status="MSME / Udyam" tone="emerald" dot={false} /> : null}
          <StatusChip status={vendor.status} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{vendor.name}</Text>
          <Text style={[styles.vid, { color: theme.colors.textSubtle }]}>
            {vendor.id} · {vendor.tradeName}
          </Text>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
          <PanelRow label="GSTIN" value={vendor.gstin} />
          <PanelRow label="Payment Terms" value={vendor.paymentTerms} />
          <PanelRow label="Bank A/C" value={`${vendor.bankName} ·••••${last4}`} />
          <PanelRow label="Compliance" value={`${vendor.complianceScore}%`} accent={vendor.complianceScore >= 90 ? theme.colors.emerald : theme.colors.warning} last />
        </View>

        <View style={styles.contactRows}>
          <ContactRow icon="Users" text={vendor.contactPerson} />
          <ContactRow icon="Mail" text={vendor.email} />
          <ContactRow icon="MapPin" text={vendor.location} />
        </View>

        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <View>
            <Text style={[styles.footerValue, { color: theme.colors.text }]}>{formatCurrency(vendor.ytdSpend)}</Text>
            <Text style={[styles.footerLabel, { color: theme.colors.textSubtle }]}>YTD Disbursed</Text>
          </View>
          <View style={styles.viewDetails}>
            <Text style={[styles.viewDetailsText, { color: theme.colors.financeAccent }]}>View Details</Text>
            <Icon name="ArrowRight" size={14} color={theme.colors.financeAccent} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
};

const PanelRow: React.FC<{ label: string; value: string; accent?: string; last?: boolean }> = ({ label, value, accent, last }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.panelRow, last && styles.panelRowLast]}>
      <Text style={[styles.panelLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.panelValue, { color: accent ?? theme.colors.text }]}>{value}</Text>
    </View>
  );
};

const ContactRow: React.FC<{ icon: string; text: string }> = ({ icon, text }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.contactRow}>
      <Icon name={icon} size={13} color={theme.colors.textSubtle} />
      <Text numberOfLines={1} style={[styles.contactText, { color: theme.colors.textMuted }]}>{text}</Text>
    </View>
  );
};

/** Vendor details overlay (web "View Details" drawer). */
export const VendorDetailsSheet: React.FC<{ vendor: Vendor | null; visible: boolean; onClose: () => void }> = ({
  vendor,
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  if (!vendor) return null;
  return (
    <ModalSheet visible={visible} onClose={onClose} label="Vendor master" title={vendor.name} description={`${vendor.id} · ${vendor.tradeName}`} size="md">
      <View style={[styles.detailPanel, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
        <DetailRow label="Status" value={vendor.status} />
        <DetailRow label="Category" value={vendor.category} />
        <DetailRow label="GSTIN" value={vendor.gstin} />
        <DetailRow label="PAN" value={vendor.pan} />
        <DetailRow label="Udyam / MSME" value={vendor.isMsme ? 'Registered' : 'Not registered'} />
        <DetailRow label="Bank" value={`${vendor.bankName} · ${vendor.bankAccount}`} />
        <DetailRow label="IFSC" value={vendor.ifsc} />
        <DetailRow label="Payment Terms" value={vendor.paymentTerms} />
        <DetailRow label="Contact" value={`${vendor.contactPerson} · ${vendor.phone}`} />
        <DetailRow label="Email" value={vendor.email} />
        <DetailRow label="Location" value={vendor.location} />
        <DetailRow label="Compliance score" value={`${vendor.complianceScore}%`} />
        <DetailRow label="Active contracts" value={String(vendor.activeContracts)} last />
      </View>
      <Text style={[styles.disbursed, { color: theme.colors.financeAccent }]}>
        YTD disbursed {formatCurrency(vendor.ytdSpend)}
      </Text>
    </ModalSheet>
  );
};

const DetailRow: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <Text style={[styles.detailLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { gap: 14 },
  cardWrap: { flexGrow: 1, flexBasis: 320 },
  topRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  titleBlock: { gap: 3 },
  name: { fontSize: 14.5, fontWeight: '700', lineHeight: 20 },
  vid: { fontSize: 11 },
  panel: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 4 },
  panelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    minHeight: 30,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 144, 168, 0.10)',
  },
  panelRowLast: { borderBottomWidth: 0 },
  panelLabel: { fontSize: 11 },
  panelValue: { fontSize: 11.5, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  contactRows: { gap: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  contactText: { fontSize: 12, flexShrink: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 13, marginTop: 2 },
  footerValue: { fontSize: 14.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
  footerLabel: { fontSize: 10, marginTop: 2 },
  viewDetails: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  viewDetailsText: { fontSize: 12, fontWeight: '600' },
  detailPanel: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 4 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    minHeight: 34,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 144, 168, 0.10)',
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 11.5 },
  detailValue: { fontSize: 12, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  disbursed: { fontSize: 13.5, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
