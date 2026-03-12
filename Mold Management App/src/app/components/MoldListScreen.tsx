import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { moldsData, MoldType, MoldStatus } from '../data/mockData';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../contexts/AuthContext';

const ALL_CUSTOMERS = ['全部', '吉利四川商用车有限公司', '北京奔驰汽车有限公司', '长城汽车股份有限公司', '上汽大众汽车有限公司', '重庆金辐汽车零部件有限公司'];
const ALL_STATUSES: ('全部' | MoldStatus)[] = ['全部', '在用', '维修中', '停用', '报废'];

export function MoldListScreen() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<'全部' | MoldType>('全部');
  const [statusFilter, setStatusFilter] = useState<'全部' | MoldStatus>('全部');
  const [customerFilter, setCustomerFilter] = useState('全部');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const filtered = moldsData.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.moldNumber.toLowerCase().includes(q) ||
      m.products.some(
        (p) => p.name.toLowerCase().includes(q) || p.customer.toLowerCase().includes(q)
      );
    const matchType = activeType === '全部' || m.type === activeType;
    const matchStatus = statusFilter === '全部' || m.status === statusFilter;
    const matchCustomer =
      customerFilter === '全部' || m.products.some((p) => p.customer === customerFilter);
    return matchSearch && matchType && matchStatus && matchCustomer;
  });

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: '#1A73E8', padding: '16px 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 600 }}>模具列表</h2>
          {isAdmin && (
            <button
              onClick={() => navigate('/add-mold')}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '20px',
                padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '5px',
                cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: 600,
              }}
            >
              <Plus size={14} color="#fff" />
              新增模具
            </button>
          )}
        </div>
        {/* Search */}
        <div
          style={{
            background: '#fff', borderRadius: '10px',
            display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px',
          }}
        >
          <Search size={16} color="#9CA3AF" />
          <input
            type="text"
            placeholder="搜索模具编号/产品/客户"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              padding: '11px 0', fontSize: '14px', background: 'transparent', color: '#111827',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        {/* Segment Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#E5E7EB',
            borderRadius: '10px',
            padding: '3px',
            marginBottom: '10px',
          }}
        >
          {(['全部', '模压模具', '口型模具', '接角模具'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: '8px',
                background: activeType === type ? '#fff' : 'transparent',
                color: activeType === type ? '#1A73E8' : '#6B7280',
                fontSize: '13px',
                fontWeight: activeType === type ? 600 : 400,
                cursor: 'pointer',
                boxShadow: activeType === type ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', position: 'relative' }}>
          {/* Status filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowCustomerDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: statusFilter !== '全部' ? '#EFF6FF' : '#fff',
                border: `1px solid ${statusFilter !== '全部' ? '#BFDBFE' : '#E5E7EB'}`,
                borderRadius: '999px',
                fontSize: '13px',
                color: statusFilter !== '全部' ? '#1A73E8' : '#374151',
                cursor: 'pointer',
                fontWeight: statusFilter !== '全部' ? 600 : 400,
              }}
            >
              状态{statusFilter !== '全部' ? `：${statusFilter}` : ''}
              <ChevronDown size={12} />
            </button>
            {showStatusDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '36px',
                  left: 0,
                  background: '#fff',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  overflow: 'hidden',
                  minWidth: '120px',
                }}
              >
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setShowStatusDropdown(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      background: statusFilter === s ? '#EFF6FF' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '14px',
                      color: statusFilter === s ? '#1A73E8' : '#374151',
                      cursor: 'pointer',
                      fontWeight: statusFilter === s ? 600 : 400,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowCustomerDropdown(!showCustomerDropdown);
                setShowStatusDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: customerFilter !== '全部' ? '#EFF6FF' : '#fff',
                border: `1px solid ${customerFilter !== '全部' ? '#BFDBFE' : '#E5E7EB'}`,
                borderRadius: '999px',
                fontSize: '13px',
                color: customerFilter !== '全部' ? '#1A73E8' : '#374151',
                cursor: 'pointer',
                fontWeight: customerFilter !== '全部' ? 600 : 400,
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {customerFilter !== '全部' ? '已选客户' : '客户'}
              <ChevronDown size={12} style={{ flexShrink: 0 }} />
            </button>
            {showCustomerDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '36px',
                  left: 0,
                  background: '#fff',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  overflow: 'hidden',
                  minWidth: '220px',
                }}
              >
                {ALL_CUSTOMERS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCustomerFilter(c);
                      setShowCustomerDropdown(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      background: customerFilter === c ? '#EFF6FF' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: customerFilter === c ? '#1A73E8' : '#374151',
                      cursor: 'pointer',
                      fontWeight: customerFilter === c ? 600 : 400,
                    }}
                  >
                    {c === '全部' ? '全部客户' : c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>共 {filtered.length} 副</span>
          </div>
        </div>
      </div>

      {/* Mold Cards */}
      <div
        style={{ padding: '0 16px 20px' }}
        onClick={() => {
          setShowStatusDropdown(false);
          setShowCustomerDropdown(false);
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '14px' }}>
            暂无符合条件的模具
          </div>
        ) : (
          filtered.map((mold) => (
            <div
              key={mold.id}
              onClick={() => navigate(`/molds/${mold.id}`)}
              style={{
                background: '#fff',
                borderRadius: '14px',
                padding: '14px 14px',
                marginBottom: '10px',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'transform 0.1s',
              }}
            >
              {/* Type indicator */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 
                    mold.type === '口型模具' ? '#EFF6FF' : 
                    mold.type === '接角模具' ? '#FEF3C7' : 
                    '#F0FDF4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '11px',
                  color: 
                    mold.type === '口型模具' ? '#1A73E8' : 
                    mold.type === '接角模具' ? '#D97706' : 
                    '#059669',
                  fontWeight: 600,
                  textAlign: 'center',
                  lineHeight: '1.2',
                }}
              >
                {mold.type === '口型模具' ? '口型' : mold.type === '接角模具' ? '接角' : '模压'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{mold.moldNumber}</span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#374151',
                    margin: '0 0 2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mold.products[0]?.name || '—'}
                </p>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#9CA3AF',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mold.products[0]?.customer || '—'}
                </p>
              </div>

              {/* Right side */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <StatusBadge status={mold.status} size="sm" />
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  已用 {mold.usageCount.toLocaleString()} {mold.unit}
                </span>
                <ChevronRight size={14} color="#D1D5DB" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}