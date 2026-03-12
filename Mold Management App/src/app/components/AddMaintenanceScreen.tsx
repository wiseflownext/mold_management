import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import { MoldSearchSelect } from './ui/MoldSearchSelect';
import { useAuth } from '../contexts/AuthContext';

export function AddMaintenanceScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const initialMold = searchParams.get('mold') || '5705-JL153-1';

  const [moldNumber, setMoldNumber] = useState(initialMold);
  const [maintenanceType, setMaintenanceType] = useState<'保养' | '维修'>('保养');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('2026-03-08');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    if (!moldNumber || !content.trim()) {
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(-1);
      }, 1500);
    }, 800);
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F5F7FA',
          gap: '16px',
          padding: '40px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#FFF7ED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={44} color="#F59E0B" />
        </div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>提交成功！</p>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>维保记录已保存</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ background: '#1A73E8', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600 }}>新增维保记录</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '12px' }}>记录模具保养 / 维修信息</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Mold Number */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            模具编号 <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <MoldSearchSelect
            value={moldNumber}
            onChange={setMoldNumber}
          />
        </div>

        {/* Maintenance Type */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '10px' }}>
            维保类型 <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {(['保养', '维修'] as const).map((type) => {
              const isActive = maintenanceType === type;
              const colors = {
                保养: { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
                维修: { bg: '#FEF3C7', border: '#FDE68A', text: '#D97706' },
              };
              return (
                <button
                  key={type}
                  onClick={() => setMaintenanceType(type)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    border: `2px solid ${isActive ? colors[type].border : '#E5E7EB'}`,
                    borderRadius: '12px',
                    background: isActive ? colors[type].bg : '#fff',
                    color: isActive ? colors[type].text : '#6B7280',
                    fontSize: '15px',
                    fontWeight: isActive ? 700 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            维保内容 <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请描述维保内容，包括操作步骤、更换零件、发现问题等..."
            rows={5}
            style={{
              width: '100%',
              padding: '11px 12px',
              background: '#F3F4F6',
              border: content ? '1.5px solid #BFDBFE' : '1.5px solid transparent',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#111827',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}
          />
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0', textAlign: 'right' }}>
            {content.length} 字
          </p>
        </div>

        {/* Date */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            日期
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 36px 11px 12px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <Calendar
              size={16}
              color="#9CA3AF"
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Operator */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            操作人
          </label>
          <div
            style={{
              padding: '11px 12px',
              background: '#F3F4F6',
              borderRadius: '10px',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ color: '#111827', fontWeight: 500 }}>{user?.name || '—'}</span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>（自动填充）</span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
          style={{
            width: '100%',
            padding: '14px',
            background:
              submitting || !content.trim()
                ? '#D1D5DB'
                : 'linear-gradient(135deg, #1A73E8 0%, #1557C0 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: submitting || !content.trim() ? 'not-allowed' : 'pointer',
            boxShadow: !content.trim() ? 'none' : '0 4px 12px rgba(26,115,232,0.35)',
            marginTop: '4px',
            marginBottom: '16px',
          }}
        >
          {submitting ? '提交中...' : '提交记录'}
        </button>
      </div>
    </div>
  );
}