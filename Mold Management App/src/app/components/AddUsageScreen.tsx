import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronDown, Minus, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import { moldsData } from '../data/mockData';
import { toast } from 'sonner';
import { MoldSearchSelect } from './ui/MoldSearchSelect';
import { useAuth } from '../contexts/AuthContext';

export function AddUsageScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [moldNumber, setMoldNumber] = useState('5705-JL153-1');
  const [selectedProduct, setSelectedProduct] = useState('左/右前车门密封条总成');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [quantity, setQuantity] = useState(300);
  const [shift, setShift] = useState<'早班' | '中班' | '晚班'>('早班');
  const [date, setDate] = useState('2026-03-08');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedMold = moldsData.find((m) => m.moldNumber === moldNumber);
  const productOptions = selectedMold?.products.map((p) => p.name) || [];

  const handleMoldSelect = (num: string) => {
    setMoldNumber(num);
    const mold = moldsData.find((m) => m.moldNumber === num);
    if (mold && mold.products.length > 0) {
      setSelectedProduct(mold.products[0].name);
    }
    setShowProductPicker(false);
  };

  const handleSubmit = () => {
    if (!moldNumber || !selectedProduct || quantity <= 0) {
      toast.error('请填写必要信息');
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
            background: '#ECFDF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={44} color="#10B981" />
        </div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>提交成功！</p>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>使用记录已保存</p>
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
          <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600 }}>新增使用记录</h2>
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
            onChange={handleMoldSelect}
            filterInUseOnly={true}
            placeholder="请输入或选择模具编号"
          />
        </div>

        {/* Product */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            关联产品 <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProductPicker(!showProductPicker)}
              style={{
                width: '100%',
                padding: '11px 36px 11px 12px',
                background: '#F3F4F6',
                border: '1.5px solid transparent',
                borderRadius: '10px',
                fontSize: '14px',
                color: selectedProduct ? '#111827' : '#9CA3AF',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {selectedProduct || '请选择产品'}
            </button>
            <ChevronDown
              size={16}
              color="#9CA3AF"
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            {showProductPicker && productOptions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                {productOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setSelectedProduct(p); setShowProductPicker(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      background: selectedProduct === p ? '#EFF6FF' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: selectedProduct === p ? '#1A73E8' : '#111827',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            生产数量 <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setQuantity(Math.max(0, quantity - 10))}
              style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: '#F3F4F6', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Minus size={18} color="#374151" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                flex: 1, padding: '10px', background: '#F3F4F6', border: 'none',
                borderRadius: '10px', fontSize: '18px', fontWeight: 700,
                color: '#111827', textAlign: 'center', outline: 'none',
              }}
            />
            <span style={{ fontSize: '14px', color: '#6B7280' }}>次</span>
            <button
              onClick={() => setQuantity(quantity + 10)}
              style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: '#EFF6FF', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Plus size={18} color="#1A73E8" />
            </button>
          </div>
        </div>

        {/* Shift */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '10px' }}>
            班次 <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['早班', '中班', '晚班'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setShift(s)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: `1.5px solid ${shift === s ? '#1A73E8' : '#E5E7EB'}`,
                  borderRadius: '10px',
                  background: shift === s ? '#EFF6FF' : '#fff',
                  color: shift === s ? '#1A73E8' : '#6B7280',
                  fontSize: '14px',
                  fontWeight: shift === s ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {s}
              </button>
            ))}
          </div>
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

        {/* Operator (auto-filled) */}
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
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ color: '#111827', fontWeight: 500 }}>{user?.name || '—'}</span>
            <span style={{ fontSize: '12px' }}>（自动填充）</span>
          </div>
        </div>

        {/* Note */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            备注 <span style={{ fontSize: '11px', color: '#9CA3AF' }}>（选填）</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="请输入备注信息..."
            rows={3}
            style={{
              width: '100%',
              padding: '11px 12px',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#111827',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            background: submitting ? '#93C5FD' : 'linear-gradient(135deg, #1A73E8 0%, #1557C0 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 4px 12px rgba(26,115,232,0.35)',
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