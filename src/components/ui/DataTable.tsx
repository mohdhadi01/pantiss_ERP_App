import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { EmptyState } from './EmptyState';

export interface DataColumn<T> {
  key: string;
  label: string;
  flex?: number;
  width?: number;
  align?: 'left' | 'right' | 'center';
  wideOnly?: boolean;
}

export interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  keyExtractor: (row: T, index: number) => string;
  renderCell: (row: T, column: DataColumn<T>) => React.ReactNode;
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
  onRowPress?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  renderCell,
  renderMobileCard,
  onRowPress,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyIcon = 'ClipboardList',
  footer,
  style,
}: DataTableProps<T>) {
  const { theme } = useTheme();
  const { isLg } = useBreakpoint();

  if (rows.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  if (!isLg) {
    return (
      <View style={[styles.mobileList, style]}>
        {rows.map((row, index) => (
          <View key={keyExtractor(row, index)}>
            {renderMobileCard ? (
              renderMobileCard(row, index)
            ) : (
              <MobileCard
                columns={columns}
                row={row}
                renderCell={renderCell}
                onRowPress={onRowPress}
              />
            )}
          </View>
        ))}
        {footer}
      </View>
    );
  }

  return (
    <View style={[styles.table, style]}>
      <View style={[styles.headerRow, { backgroundColor: theme.colors.surfaceSoft, borderBottomColor: theme.colors.border }]}>
        {columns.map((column) => (
          <Text
            key={column.key}
            numberOfLines={1}
            style={[
              styles.headerCell,
              { color: theme.colors.textMuted },
              columnWidthStyle(column),
              alignStyle(column),
            ]}
          >
            {column.label}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <Pressable
          key={keyExtractor(row, index)}
          onPress={onRowPress ? () => onRowPress(row) : undefined}
          disabled={!onRowPress}
          style={({ pressed }) => [
            styles.row,
            { borderBottomColor: theme.colors.border, opacity: pressed && onRowPress ? 0.85 : 1 },
          ]}
        >
          {columns.map((column) => (
            <View key={column.key} style={[columnWidthStyle(column), alignStyle(column)]}>
              {renderCell(row, column)}
            </View>
          ))}
        </Pressable>
      ))}
      {footer}
    </View>
  );
}

function MobileCard<T>({
  columns,
  row,
  renderCell,
  onRowPress,
}: {
  columns: DataColumn<T>[];
  row: T;
  renderCell: (row: T, column: DataColumn<T>) => React.ReactNode;
  onRowPress?: (row: T) => void;
}) {
  const { theme } = useTheme();
  const visible = columns.filter((c) => !c.wideOnly);

  return (
    <Pressable
      onPress={onRowPress ? () => onRowPress(row) : undefined}
      disabled={!onRowPress}
      style={({ pressed }) => [
        styles.mobileCard,
        {
          backgroundColor: theme.colors.moduleBg,
          borderColor: theme.colors.border,
          opacity: pressed && onRowPress ? 0.9 : 1,
          ...(theme.shadows.card as object),
        },
      ]}
    >
      {visible.map((column, i) => (
        <View key={column.key} style={i === 0 ? undefined : styles.mobileRow}>
          <Text style={[styles.mobileLabel, { color: theme.colors.textSubtle }]}>{column.label}</Text>
          {renderCell(row, column)}
        </View>
      ))}
    </Pressable>
  );
}

function columnWidthStyle<T>(column: DataColumn<T>): { flex?: number; width?: number } {
  return column.width ? { width: column.width } : { flex: column.flex ?? 1 };
}

function alignStyle<T>(column: DataColumn<T>): object {
  if (column.align === 'right') return { alignItems: 'flex-end', textAlign: 'right' as const };
  if (column.align === 'center') return { alignItems: 'center' };
  return {};
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: 'rgba(128, 144, 168, 0.16)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 14,
    borderBottomWidth: 1,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mobileList: {
    gap: 10,
  },
  mobileCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 144, 168, 0.14)',
  },
  mobileLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
