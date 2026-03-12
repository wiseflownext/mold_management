import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, AlertTriangle, Clock, CheckCircle, Wrench, ChevronRight, Filter } from 'lucide-react';
import { allMaintenanceAlerts, UrgencyLevel } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

type FilterTab = '全部' | '逾期' | '即将到期' | '正常';

const urgencyConfig = {
  overdue: {
    label: '已逾期',
    bg: '#FEF2F2',
    border: '#FECACA',
    textColor: '#DC2626',
    badgeBg: '#FEE2E2',
    icon: AlertTriangle,
    iconColor: '#DC2626',
    progressColor: '#EF4444',
  },
  critical: {
    label: '紧急',
    bg: '#FFF7ED',
    border: '#FED7AA',
    textColor: '#EA580C',
    badgeBg: '#FFEDD5',
    icon: AlertTriangle,
    iconColor: '#EA580C',
    progressColor: '#F97316',
  },
  warning: {
    label: '即将到期',
    bg: '#FFFBEB',
    border: '#FDE68A',
    textColor: '#D97706',
    badgeBg: '#FEF3C7',
    icon: Clock,
    iconColor: '#D97706',
    progressColor: '#F59E0B',
  },
  normal: {
    label: '正常',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    textColor: '#059669',
    badgeBg: '#DCFCE7',
    icon: CheckCircle,
    iconColor: '#059669',
    progressColor: '#10B981',
  },
};

export function MaintenanceReminderScreen() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('全部');

  const overdueCount = allMaintenanceAlerts.filter(a => a.urgencyLevel === 'overdue').length;
  const criticalCount = allMaintenanceAlerts.filter(a => a.urgencyLevel === 'critical').length;
  const warningCount = allMaintenanceAlerts.filter(a => a.urgencyLevel === 'warning').length;
  const normalCount = allMaintenanceAlerts.filter(a => a.urgencyLevel === 'normal').length;

  const filtered = allMaintenanceAlerts.filter(alert => {
    if (activeFilter === '全部') return true;
    if (activeFilter === '逾期') return alert.urgencyLevel === 'overdue';
    if (activeFilter === '即将到期') return alert.urgencyLevel === 'critical' || alert.urgencyLevel === 'warning';
    if (activeFilter === '正常') return alert.urgencyLevel === 'normal';
    return true;
  });

  const filterTabs: { key: FilterTab; label: string; count: number; color: string }[] = [
    { key: '全部', label: '全部', count: allMaintenanceAlerts.length, color: '#1A73E8' },
    { key: '逾期', label: '逾期', count: overdueCount, color: '#DC2626' },
    { key: '即将到期', label: '即将到期', count: criticalCount + warningCount, color: '#D97706' },
    { key: '正常', label: '正常', count: normalCount, color: '#059669' },
  ];

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', paddingBottom: '30px' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(160deg, #FF6D00 0%, #E65100 100%)',
          padding: '16px 16px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600 }}>维保提醒</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '12px' }}>共 {allMaintenanceAlerts.length} 副模具需关注</p>
          </div>
          <Filter size={18} color="rgba(255,255,255,0.8)" />
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
          }}
        >
          {[
            { label: '逾期', count: overdueCount, color: '#FFB4A2', dotColor: '#FF6B6B' },
            { label: '紧急', count: criticalCount, color: '#FFD5A2', dotColor: '#FFAB40' },
            { label: '预警', count: warningCount, color: '#FFE9A2', dotColor: '#FFD740' },
            { label: '正常', count: normalCount, color: '#B2F5C0', dotColor: '#69F0AE' },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: '10px',
                padding: '8px', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ padding: '12px 16px 0' }}>
        <div
          style={{
            display: 'flex', background: '#fff', borderRadius: '12px',
            padding: '4px', gap: '2px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: '12px',
          }}
        >
          {filterTabs.map(tab => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                style={{
                  flex: 1, padding: '8px 4px', border: 'none', borderRadius: '9px',
                  background: isActive ? tab.color : 'transparent',
                  color: isActive ? '#fff' : '#6B7280',
                  fontSize: '12px', fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
                }}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    style={{
                      fontSize: '10px', fontWeight: 700,
                      color: isActive ? 'rgba(255,255,255,0.9)' : tab.color,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert Cards */}
      <div style={{ padding: '0 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
            <CheckCircle size={40} color="#D1D5DB" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', margin: 0 }}>该分类下暂无提醒</p>
          </div>
        ) : (
          filtered.map((alert) => {
            const cfg = urgencyConfig[alert.urgencyLevel];
            const IconComp = cfg.icon;
            // Progress: how much of the maintenance cycle has been used
            const progressPercent = alert.isOverdue
              ? 100
              : Math.round(((alert.maintenanceCycle - alert.remainingUses) / alert.maintenanceCycle) * 100);

            return (
              <div
                key={alert.id}
                onClick={() => navigate(`/molds/${alert.id}`)}
                style={{
                  background: '#fff', borderRadius: '14px', marginBottom: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  overflow: 'hidden', cursor: 'pointer',
                  border: `1px solid ${cfg.border}`,
                }}
              >
                {/* Urgency Banner */}
                <div
                  style={{
                    background: cfg.bg, padding: '8px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: `1px solid ${cfg.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <IconComp size={13} color={cfg.iconColor} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: cfg.textColor }}>{cfg.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>上次保养：{alert.lastMaintenanceDate}</span>
                </div>

                <div style={{ padding: '12px 14px' }}>
                  {/* Title Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{alert.moldNumber}</span>
                        <span
                          style={{
                            fontSize: '10px', padding: '1px 6px',
                            background: alert.type === '口型模具' ? '#EFF6FF' : alert.type === '接角模具' ? '#FEF3C7' : '#F0FDF4',
                            color: alert.type === '口型模具' ? '#1A73E8' : alert.type === '接角模具' ? '#D97706' : '#059669',
                            borderRadius: '999px', fontWeight: 600,
                          }}
                        >
                          {alert.type === '口型模具' ? '口型' : alert.type === '接角模具' ? '接角' : '模压'}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '12px', color: '#6B7280', margin: '0',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        {alert.productName}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                      {alert.isOverdue ? (
                        <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 700, margin: 0 }}>
                          逾期 {Math.abs(alert.remainingUses)} 次
                        </p>
                      ) : (
                        <p style={{ fontSize: '13px', color: cfg.textColor, fontWeight: 700, margin: 0 }}>
                          还剩 {alert.remainingUses.toLocaleString()} 次
                        </p>
                      )}
                      <p style={{ fontSize: '10px', color: '#9CA3AF', margin: '1px 0 0' }}>距下次保养</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '10px' }}>
                    <div
                      style={{
                        height: '6px', background: '#E5E7EB',
                        borderRadius: '999px', overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%', width: `${progressPercent}%`,
                          background: cfg.progressColor, borderRadius: '999px',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                      <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
                        已用 {(alert.maintenanceCycle - (alert.isOverdue ? 0 : alert.remainingUses)).toLocaleString()} 次
                      </span>
                      <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
                        周期 {alert.maintenanceCycle.toLocaleString()} 次
                      </span>
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{alert.workshop}</span>
                      <span style={{ fontSize: '10px', color: '#D1D5DB' }}>·</span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        累计 {alert.usageCount.toLocaleString()} 次
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/add-maintenance?mold=${alert.moldNumber}`);
                      }}
                      style={{
                        display: isAdmin ? 'flex' : 'none',
                        alignItems: 'center', gap: '4px',
                        padding: '5px 10px', border: 'none', borderRadius: '8px',
                        background: cfg.badgeBg, color: cfg.textColor,
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <Wrench size={11} />
                      安排维保
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom tips */}
      <div style={{ padding: '4px 16px 0', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: '#D1D5DB', margin: 0 }}>
          提醒规则：逾期 → 逾期保养 | 紧急 ≤200次 | 预警 ≤500次
        </p>
      </div>
    </div>
  );
}