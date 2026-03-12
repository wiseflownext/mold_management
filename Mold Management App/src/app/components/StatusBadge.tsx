import { MoldStatus } from '../data/mockData';

interface StatusBadgeProps {
  status: MoldStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<MoldStatus, { bg: string; text: string; dot: string; label: string }> = {
  '在用':  { bg: '#ECFDF5', text: '#059669', dot: '#10B981', label: '在用' },
  '维修中': { bg: '#FFF7ED', text: '#D97706', dot: '#F59E0B', label: '维修中' },
  '停用':  { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', label: '停用' },
  '报废':  { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444', label: '报废' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  const padding = size === 'sm' ? '2px 8px' : '3px 10px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: cfg.bg,
        color: cfg.text,
        padding,
        borderRadius: '999px',
        fontSize,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: size === 'sm' ? 5 : 6,
          height: size === 'sm' ? 5 : 6,
          borderRadius: '50%',
          background: cfg.dot,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
