import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronRight, Package, TrendingUp, Calendar } from 'lucide-react';
import { myUsageRecords } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

type DateFilter = '本月' | '上月' | '全部';

export function MyRecordsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState<DateFilter>('本月');

  const filtered = myUsageRecords.filter(r => {
    if (dateFilter === '全部') return true;
    if (dateFilter === '本月') return r.date.startsWith('2026.3');
    if (dateFilter === '上月') return r.date.startsWith('2026.2');
    return true;
  });

  // Group by date
  const groupedByDate: Record<string, typeof myUsageRecords> = {};
  filtered.forEach(r => {
    if (!groupedByDate[r.date]) groupedByDate[r.date] = [];
    groupedByDate[r.date].push(r);
  });
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const totalQuantity = filtered.reduce((sum, r) => sum + r.quantity, 0);
  const totalRecords = filtered.length;
  const moldSet = new Set(filtered.map(r => r.moldNumber));

  const shiftColor: Record<string, string> = {
    早班: '#059669',
    中班: '#1A73E8',
    晚班: '#7C3AED',
  };

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', paddingBottom: '30px' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(160deg, #1A73E8 0%, #1557C0 100%)',
          padding: '16px 16px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
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
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600 }}>我的使用记录</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '12px' }}>{user?.name || '—'} · {user?.workshop || '—'}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { label: '记录数', value: totalRecords, unit: '条', icon: Calendar },
            { label: '生产总量', value: totalQuantity.toLocaleString(), unit: '次', icon: TrendingUp },
            { label: '使用模具', value: moldSet.size, unit: '副', icon: Package },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{
                  background: 'rgba(255,255,255,0.15)', borderRadius: '10px',
                  padding: '10px 8px', textAlign: 'center',
                }}
              >
                <Icon size={14} color="rgba(255,255,255,0.8)" style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  {item.value}
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 400, marginLeft: '1px' }}>{item.unit}</span>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        {/* Date Filter */}
        <div
          style={{
            display: 'flex', background: '#E5E7EB', borderRadius: '10px',
            padding: '3px', marginBottom: '12px',
          }}
        >
          {(['本月', '上月', '全部'] as DateFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: '8px',
                background: dateFilter === f ? '#fff' : 'transparent',
                color: dateFilter === f ? '#1A73E8' : '#6B7280',
                fontSize: '13px', fontWeight: dateFilter === f ? 600 : 400,
                cursor: 'pointer',
                boxShadow: dateFilter === f ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div style={{ padding: '0 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
            <Package size={40} color="#D1D5DB" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', margin: 0 }}>该时段暂无使用记录</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} style={{ marginBottom: '16px' }}>
              {/* Date Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div
                  style={{
                    background: '#1A73E8', borderRadius: '6px',
                    padding: '2px 10px', display: 'inline-block',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>{date}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  共 {groupedByDate[date].reduce((s, r) => s + r.quantity, 0).toLocaleString()} 次
                </span>
              </div>

              {/* Records for this date */}
              <div
                style={{
                  background: '#fff', borderRadius: '14px',
                  overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {groupedByDate[date].map((record, idx) => (
                  <div
                    key={record.id}
                    onClick={() => navigate(`/molds/${myUsageRecords.findIndex(r => r.moldNumber === record.moldNumber) !== -1
                      ? (record.moldNumber === '5705-JL153-1' ? '1' : record.moldNumber === '5705-JL153-2' ? '2' : record.moldNumber === '6301-BJ201-2' ? '4' : '1')
                      : '1'}`)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: idx < groupedByDate[date].length - 1 ? '1px solid #F3F4F6' : 'none',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Left: mold icon */}
                    <div
                      style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: '#EFF6FF', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <Package size={18} color="#1A73E8" />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{record.moldNumber}</span>
                        <span
                          style={{
                            fontSize: '10px', padding: '1px 6px',
                            background: '#F0F9FF', color: '#0369A1',
                            borderRadius: '999px',
                          }}
                        >
                          {record.workshop}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '12px', color: '#6B7280', margin: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        {record.product}
                      </p>
                    </div>

                    {/* Right: quantity + shift */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A73E8', lineHeight: 1 }}>
                        {record.quantity.toLocaleString()}
                        <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}> 次</span>
                      </div>
                      <span
                        style={{
                          fontSize: '10px', padding: '1px 6px',
                          background: '#F9FAFB',
                          color: shiftColor[record.shift] || '#374151',
                          borderRadius: '999px', fontWeight: 600, marginTop: '2px',
                          display: 'inline-block',
                        }}
                      >
                        {record.shift}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}