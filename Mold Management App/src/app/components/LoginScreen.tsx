import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Phone, Eye, EyeOff, Settings2, ShieldCheck, Wrench, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, DEMO_ACCOUNTS } from '../contexts/AuthContext';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = () => {
    if (!phone || !password) {
      toast.error('请填写手机号和密码');
      return;
    }
    const matched = DEMO_ACCOUNTS.find(
      (a) => a.phone === phone && a.password === password
    );
    if (!matched) {
      toast.error('手机号或密码错误');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({
        name: matched.name,
        role: matched.role,
        roleLabel: matched.roleLabel,
        workshop: matched.workshop,
        phone: matched.phone,
      });
      navigate('/home');
    }, 700);
  };

  const handleQuickLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setPhone(account.phone);
    setPassword(account.password);
    setShowQuickLogin(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({
        name: account.name,
        role: account.role,
        roleLabel: account.roleLabel,
        workshop: account.workshop,
        phone: account.phone,
      });
      navigate('/home');
    }, 700);
  };

  return (
    <div
      style={{
        minHeight: '852px',
        background: '#F5F7FA',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 28px 40px',
        position: 'relative',
      }}
    >
      {/* Logo Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px' }}>
        <div
          style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)',
            borderRadius: '20px', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(26,115,232,0.35)',
            marginBottom: '16px',
          }}
        >
          <Settings2 size={40} color="#fff" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>模具管理</h1>
        <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>工厂模具全生命周期管理平台</p>
      </div>

      {/* Role Cards (Quick Hint) */}
      <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '20px' }}>
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.role}
            onClick={() => handleQuickLogin(acc)}
            style={{
              flex: 1, padding: '12px 10px', borderRadius: '12px', border: 'none',
              background: acc.role === 'admin'
                ? 'linear-gradient(135deg, #1A73E8 0%, #1557C0 100%)'
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              boxShadow: acc.role === 'admin'
                ? '0 4px 12px rgba(26,115,232,0.35)'
                : '0 4px 12px rgba(5,150,105,0.35)',
            }}
          >
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: 700,
              }}
            >
              {acc.avatar}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                {acc.role === 'admin'
                  ? <ShieldCheck size={12} color="rgba(255,255,255,0.9)" />
                  : <Wrench size={12} color="rgba(255,255,255,0.9)" />
                }
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{acc.roleLabel}</span>
              </div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', margin: '2px 0 0', textAlign: 'center' }}>
                点击快速登录
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Form Card */}
      <div
        style={{
          width: '100%', background: '#fff',
          borderRadius: '16px', padding: '24px 20px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}
      >
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '20px', marginTop: 0 }}>
          账号密码登录
        </p>

        {/* Phone Input */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '13px', color: '#374151', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
            手机号
          </label>
          <div
            style={{
              display: 'flex', alignItems: 'center',
              background: '#F3F4F6', borderRadius: '10px', padding: '0 14px',
              border: `1.5px solid ${focusedField === 'phone' ? '#BFDBFE' : 'transparent'}`,
              transition: 'border-color 0.15s',
            }}
          >
            <Phone size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
            <input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                padding: '12px 10px', fontSize: '15px', color: '#111827',
              }}
            />
          </div>
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#374151', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
            密码
          </label>
          <div
            style={{
              display: 'flex', alignItems: 'center',
              background: '#F3F4F6', borderRadius: '10px', padding: '0 14px',
              border: `1.5px solid ${focusedField === 'pwd' ? '#BFDBFE' : 'transparent'}`,
              transition: 'border-color 0.15s',
            }}
          >
            <Lock size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('pwd')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                padding: '12px 10px', fontSize: '15px', color: '#111827',
              }}
            />
            <button
              onClick={() => setShowPwd(!showPwd)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              {showPwd ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1A73E8 0%, #1557C0 100%)',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(26,115,232,0.4)',
            transition: 'all 0.2s',
          }}
        >
          {loading ? '登录中...' : '登 录'}
        </button>
      </div>

      {/* Demo Accounts Dropdown */}
      <div style={{ width: '100%', marginTop: '14px' }}>
        <button
          onClick={() => setShowQuickLogin(!showQuickLogin)}
          style={{
            width: '100%', padding: '10px 16px',
            background: 'rgba(26,115,232,0.06)', border: '1px solid rgba(26,115,232,0.15)',
            borderRadius: '10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#1A73E8', fontWeight: 500 }}>演示账号</span>
          <ChevronDown
            size={13} color="#1A73E8"
            style={{ transform: showQuickLogin ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </button>
        {showQuickLogin && (
          <div
            style={{
              background: '#fff', borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              overflow: 'hidden', marginTop: '6px',
              border: '1px solid #E5E7EB',
            }}
          >
            {DEMO_ACCOUNTS.map((acc, idx) => (
              <button
                key={acc.role}
                onClick={() => handleQuickLogin(acc)}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: 'none',
                  borderBottom: idx < DEMO_ACCOUNTS.length - 1 ? '1px solid #F3F4F6' : 'none',
                  background: 'transparent', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: acc.role === 'admin' ? '#EFF6FF' : '#ECFDF5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 700,
                    color: acc.role === 'admin' ? '#1A73E8' : '#059669',
                    flexShrink: 0,
                  }}
                >
                  {acc.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{acc.name}</span>
                    <span
                      style={{
                        fontSize: '10px', padding: '1px 6px', borderRadius: '999px',
                        background: acc.role === 'admin' ? '#EFF6FF' : '#ECFDF5',
                        color: acc.role === 'admin' ? '#1A73E8' : '#059669',
                        fontWeight: 600,
                      }}
                    >
                      {acc.roleLabel}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{acc.desc}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{acc.phone}</p>
                  <p style={{ fontSize: '11px', color: '#D1D5DB', margin: '1px 0 0' }}>{acc.password}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <p style={{ marginTop: 'auto', fontSize: '12px', color: '#9CA3AF', textAlign: 'center', paddingTop: '40px' }}>
        v2.1.0 · 模具管理系统
      </p>
    </div>
  );
}
