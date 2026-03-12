import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function ChangePasswordScreen() {
  const navigate = useNavigate();
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password strength check
  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (pwd.length === 0) return { level: 0, label: '', color: '#E5E7EB' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: '弱', color: '#EF4444' };
    if (score === 2) return { level: 2, label: '中', color: '#F59E0B' };
    if (score === 3) return { level: 3, label: '强', color: '#10B981' };
    return { level: 4, label: '很强', color: '#059669' };
  };

  const strength = getStrength(newPwd);
  const isValid = oldPwd.length >= 6 && newPwd.length >= 8 && newPwd === confirmPwd;

  const handleSubmit = () => {
    if (!isValid) return;
    if (oldPwd === '123456' || oldPwd === 'test123') {
      // simulate wrong old password
      toast.error('原密码不正确，请重新输入');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate(-1), 1800);
    }, 800);
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#F5F7FA', gap: '16px', padding: '40px',
        }}
      >
        <div
          style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#ECFDF5', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={44} color="#10B981" />
        </div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>密码修改成功！</p>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, textAlign: 'center' }}>
          新密码已生效，请妥善保管
        </p>
      </div>
    );
  }

  const inputBase: React.CSSProperties = {
    flex: 1, padding: '11px 12px', background: 'transparent',
    border: 'none', outline: 'none', fontSize: '15px', color: '#111827',
  };

  const inputWrapper = (focused: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center',
    background: '#F3F4F6', borderRadius: '10px',
    border: `1.5px solid ${focused ? '#BFDBFE' : 'transparent'}`,
    overflow: 'hidden',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', paddingBottom: '100px' }}>
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
          <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600 }}>修改密码</h2>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Security Tips */}
        <div
          style={{
            background: '#EFF6FF', borderRadius: '12px', padding: '12px 14px',
            border: '1px solid #DBEAFE', display: 'flex', gap: '10px', alignItems: 'flex-start',
          }}
        >
          <Lock size={16} color="#1A73E8" style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '12px', color: '#1D4ED8', margin: 0, lineHeight: 1.5 }}>
            为保护账号安全，密码需至少 8 位，建议包含大小写字母、数字及特殊字符
          </p>
        </div>

        {/* Old Password */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            原密码 <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={inputWrapper(focusedField === 'old')}>
            <Lock size={16} color="#9CA3AF" style={{ marginLeft: '12px', flexShrink: 0 }} />
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPwd}
              onChange={e => setOldPwd(e.target.value)}
              onFocus={() => setFocusedField('old')}
              onBlur={() => setFocusedField(null)}
              placeholder="请输入原密码"
              style={inputBase}
            />
            <button
              onClick={() => setShowOld(!showOld)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', display: 'flex' }}
            >
              {showOld ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            新密码 <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={inputWrapper(focusedField === 'new')}>
            <Lock size={16} color="#9CA3AF" style={{ marginLeft: '12px', flexShrink: 0 }} />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              onFocus={() => setFocusedField('new')}
              onBlur={() => setFocusedField(null)}
              placeholder="至少 8 位"
              style={inputBase}
            />
            <button
              onClick={() => setShowNew(!showNew)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', display: 'flex' }}
            >
              {showNew ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
            </button>
          </div>

          {/* Strength meter */}
          {newPwd.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    style={{
                      flex: 1, height: '4px', borderRadius: '2px',
                      background: i <= strength.level ? strength.color : '#E5E7EB',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: strength.color, fontWeight: 600 }}>
                  密码强度：{strength.label}
                </span>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  {newPwd.length} 位
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            确认新密码 <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div
            style={{
              ...inputWrapper(focusedField === 'confirm'),
              border: `1.5px solid ${confirmPwd && newPwd && confirmPwd !== newPwd ? '#FECACA' : focusedField === 'confirm' ? '#BFDBFE' : 'transparent'}`,
            }}
          >
            <Lock size={16} color="#9CA3AF" style={{ marginLeft: '12px', flexShrink: 0 }} />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              placeholder="再次输入新密码"
              style={inputBase}
            />
            {confirmPwd && confirmPwd === newPwd && (
              <CheckCircle2 size={16} color="#10B981" style={{ marginRight: '12px', flexShrink: 0 }} />
            )}
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', display: 'flex' }}
            >
              {showConfirm ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
            </button>
          </div>
          {confirmPwd && newPwd && confirmPwd !== newPwd && (
            <p style={{ fontSize: '12px', color: '#EF4444', margin: '6px 0 0' }}>两次输入的密码不一致</p>
          )}
        </div>

        {/* Requirements */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, margin: '0 0 8px' }}>密码要求</p>
          {[
            { label: '至少 8 个字符', met: newPwd.length >= 8 },
            { label: '包含数字', met: /[0-9]/.test(newPwd) },
            { label: '包含字母', met: /[A-Za-z]/.test(newPwd) },
            { label: '新密码与原密码不同', met: newPwd.length > 0 && newPwd !== oldPwd },
          ].map(req => (
            <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <div
                style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: req.met ? '#10B981' : '#E5E7EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background 0.2s',
                }}
              >
                {req.met && <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: '12px', color: req.met ? '#059669' : '#9CA3AF' }}>{req.label}</span>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          style={{
            width: '100%', padding: '14px',
            background: isValid && !submitting
              ? 'linear-gradient(135deg, #1A73E8 0%, #1557C0 100%)'
              : '#D1D5DB',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: 600,
            cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
            boxShadow: isValid && !submitting ? '0 4px 12px rgba(26,115,232,0.35)' : 'none',
            marginTop: '4px',
          }}
        >
          {submitting ? '修改中...' : '确认修改'}
        </button>
      </div>
    </div>
  );
}
