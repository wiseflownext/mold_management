import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Globe, Moon, Database, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function SystemSettingsScreen() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [cacheSize] = useState('12.4 MB');
  const [syncInterval, setSyncInterval] = useState('15');
  const [language] = useState('简体中文');
  const [clearingCache, setClearingCache] = useState(false);

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      toast.success('缓存已清除');
    }, 1000);
  };

  const syncOptions = ['5', '15', '30', '60'];

  const Toggle = ({
    value,
    onChange,
    color = '#1A73E8',
  }: {
    value: boolean;
    onChange: () => void;
    color?: string;
  }) => (
    <button
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: value ? color : '#E5E7EB',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '2px',
          left: value ? '22px' : '2px',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ background: '#1A73E8', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600 }}>系统设置</h2>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Display Settings */}
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 16px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              显示与语言
            </p>
          </div>

          {/* Language */}
          <div
            style={{
              padding: '14px 16px', borderBottom: '1px solid #F3F4F6',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#EFF6FF', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Globe size={18} color="#1A73E8" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: 500 }}>语言</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>界面显示语言</p>
            </div>
            <span
              style={{
                fontSize: '13px', color: '#6B7280',
                background: '#F3F4F6', padding: '4px 12px', borderRadius: '8px',
              }}
            >
              {language}
            </span>
          </div>

          {/* Dark Mode */}
          <div
            style={{
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#F5F3FF', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Moon size={18} color="#7C3AED" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: 500 }}>深色模式</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>深色界面主题（即将上线）</p>
            </div>
            <Toggle value={darkMode} onChange={() => {
              if (!darkMode) toast.info('深色模式即将上线，敬请期待');
            }} color="#7C3AED" />
          </div>
        </div>

        {/* Data Settings */}
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 16px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              数据与同步
            </p>
          </div>

          {/* Auto Sync */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#ECFDF5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}
            >
              <RefreshCw size={18} color="#059669" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: 500 }}>自动同步</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>定时同步最新数据到本地</p>
            </div>
            <Toggle value={autoSync} onChange={() => setAutoSync(!autoSync)} color="#059669" />
          </div>

          {/* Sync Interval */}
          {autoSync && (
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: '13px', color: '#374151', fontWeight: 500, margin: '0 0 10px' }}>同步间隔</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {syncOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSyncInterval(opt)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: '10px',
                      border: `1.5px solid ${syncInterval === opt ? '#059669' : '#E5E7EB'}`,
                      background: syncInterval === opt ? '#ECFDF5' : '#fff',
                      color: syncInterval === opt ? '#059669' : '#6B7280',
                      fontSize: '12px', fontWeight: syncInterval === opt ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {opt}分钟
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cache */}
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#FFF7ED', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Database size={18} color="#D97706" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: 500 }}>本地缓存</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>已占用 {cacheSize}</p>
            </div>
            <button
              onClick={handleClearCache}
              disabled={clearingCache}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', borderRadius: '8px',
                background: '#FFF7ED', border: '1px solid #FED7AA',
                color: '#D97706', fontSize: '12px', fontWeight: 600,
                cursor: clearingCache ? 'not-allowed' : 'pointer',
              }}
            >
              <Trash2 size={13} />
              {clearingCache ? '清理中...' : '清除'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 16px', background: '#FFF5F5', borderBottom: '1px solid #FEE2E2' }}>
            <p style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600, margin: 0 }}>
              危险操作
            </p>
          </div>
          <button
            onClick={() => toast.error('此操作需要系统管理员权限')}
            style={{
              width: '100%', padding: '14px 16px', border: 'none',
              background: 'transparent', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#FEF2F2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Trash2 size={18} color="#DC2626" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: '#DC2626', margin: 0, fontWeight: 500 }}>清除所有本地数据</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>此操作不可恢复，需管理员权限</p>
            </div>
          </button>
        </div>

        {/* App Version */}
        <div
          style={{
            background: '#fff', borderRadius: '14px', padding: '14px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#10B981" />
            <span style={{ fontSize: '13px', color: '#374151' }}>当前版本 v2.1.0</span>
          </div>
          <span
            style={{
              fontSize: '11px', background: '#ECFDF5', color: '#059669',
              padding: '2px 8px', borderRadius: '999px', fontWeight: 600,
            }}
          >
            已是最新
          </span>
        </div>
      </div>
    </div>
  );
}
