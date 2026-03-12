import { useNavigate } from 'react-router';
import { ArrowLeft, Settings, Shield, Users, Database, Zap, ChevronRight, ExternalLink } from 'lucide-react';

const features = [
  { icon: Database, label: '模具全生命周期管理', desc: '从建档到报废，完整记录每副模具' },
  { icon: Zap, label: '智能维保提醒', desc: '自动计算保养周期，逾期自动预警' },
  { icon: Users, label: '多角色权限控制', desc: '管理员/操作员，各司其职' },
  { icon: Shield, label: '数据安全保护', desc: '操作日志全程留痕，数据可追溯' },
];

const changeLog = [
  { version: 'v2.1.0', date: '2026.3.1', notes: '新增维保提醒分级预警，优化首页通知系统' },
  { version: 'v2.0.5', date: '2026.1.20', notes: '修复模具列表筛选问题，提升搜索性能' },
  { version: 'v2.0.0', date: '2025.12.1', notes: '全面重构 UI，支持 iPhone 15 Pro 显示规格' },
  { version: 'v1.5.2', date: '2025.9.10', notes: '新增客户筛选功能，优化维保记录表单' },
];

export function AboutScreen() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', paddingBottom: '40px' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(160deg, #1A73E8 0%, #1557C0 100%)',
          padding: '16px 16px 40px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '150px', height: '150px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
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
          <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600 }}>关于</h2>
        </div>

        {/* App Info */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '72px', height: '72px', borderRadius: '18px',
              background: '#fff', margin: '0 auto 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <Settings size={36} color="#1A73E8" />
          </div>
          <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>模具管理系统</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '13px' }}>工厂智能管理平台</p>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: '-20px' }}>
        {/* Version Card */}
        <div
          style={{
            background: '#fff', borderRadius: '16px', padding: '20px',
            marginBottom: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            display: 'flex', justifyContent: 'space-around', textAlign: 'center',
          }}
        >
          {[
            { label: '当前版本', value: 'v2.1.0' },
            { label: '更新日期', value: '2026.3.1' },
            { label: '服务商', value: '智工科技' },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A73E8', margin: '0 0 2px' }}>{item.value}</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div
          style={{
            background: '#fff', borderRadius: '16px', padding: '16px',
            marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 12px' }}>核心功能</p>
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 0',
                  borderBottom: idx < features.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <div
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: '#EFF6FF', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Icon size={18} color="#1A73E8" />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>{feature.label}</p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Changelog */}
        <div
          style={{
            background: '#fff', borderRadius: '16px', padding: '16px',
            marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 12px' }}>更新日志</p>
          {changeLog.map((log, idx) => (
            <div
              key={log.version}
              style={{
                display: 'flex', gap: '12px',
                paddingBottom: idx < changeLog.length - 1 ? '12px' : 0,
                borderBottom: idx < changeLog.length - 1 ? '1px solid #F3F4F6' : 'none',
                marginBottom: idx < changeLog.length - 1 ? '12px' : 0,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2px' }}>
                <div
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: idx === 0 ? '#1A73E8' : '#D1D5DB', flexShrink: 0,
                  }}
                />
                {idx < changeLog.length - 1 && (
                  <div style={{ width: '1px', flex: 1, background: '#E5E7EB', marginTop: '4px' }} />
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span
                    style={{
                      fontSize: '12px', fontWeight: 700,
                      color: idx === 0 ? '#1A73E8' : '#6B7280',
                      background: idx === 0 ? '#EFF6FF' : '#F3F4F6',
                      padding: '1px 8px', borderRadius: '6px',
                    }}
                  >
                    {log.version}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{log.date}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#374151', margin: 0, lineHeight: 1.5 }}>{log.notes}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact / Support */}
        <div
          style={{
            background: '#fff', borderRadius: '16px', overflow: 'hidden',
            marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {[
            { label: '用户协议', sub: '查看服务条款' },
            { label: '隐私政策', sub: '了解数据使用方式' },
            { label: '技术支持', sub: 'support@zhigong.tech' },
          ].map((item, idx, arr) => (
            <button
              key={item.label}
              style={{
                width: '100%', padding: '14px 16px',
                border: 'none', borderBottom: idx < arr.length - 1 ? '1px solid #F3F4F6' : 'none',
                background: 'transparent', textAlign: 'left',
                display: 'flex', alignItems: 'center', cursor: 'pointer',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: 500 }}>{item.label}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{item.sub}</p>
              </div>
              <ExternalLink size={14} color="#D1D5DB" />
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#D1D5DB', paddingTop: '4px' }}>
          © 2026 智工科技（上海）有限公司
        </p>
      </div>
    </div>
  );
}
