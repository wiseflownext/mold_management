import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type MoldTypeOption = '口型模具' | '模压模具' | '接角模具';

const WORKSHOPS = ['挤出车间', '后续车间'];

export function AddMoldScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [moldNumber, setMoldNumber] = useState('');
  const [moldType, setMoldType] = useState<MoldTypeOption>('口型模具');
  const [workshop, setWorkshop] = useState('');
  const [firstUseDate, setFirstUseDate] = useState('');
  const [designLife, setDesignLife] = useState('');
  const [maintenanceCycle, setMaintenanceCycle] = useState('');
  const [products, setProducts] = useState([
    { customer: '', model: '', name: '', partNumber: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValid = moldNumber.trim() && designLife && maintenanceCycle && products[0].name;

  const handleSubmit = () => {
    if (!isValid) {
      toast.error('请填写必要信息（模具编号、寿命、保养周期、产品名称）');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate('/molds'), 1600);
    }, 800);
  };

  const addProduct = () => {
    setProducts([...products, { customer: '', model: '', name: '', partNumber: '' }]);
  };

  const removeProduct = (idx: number) => {
    if (products.length === 1) return;
    setProducts(products.filter((_, i) => i !== idx));
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
            background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={44} color="#10B981" />
        </div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>新增成功！</p>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
          模具 {moldNumber} 已创建
        </p>
      </div>
    );
  }

  const headerColor = 'linear-gradient(160deg, #1A73E8 0%, #1557C0 100%)';
  const accentColor = '#1A73E8';

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', paddingBottom: '100px' }}>
      <div style={{ background: headerColor, padding: '16px' }}>
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
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600 }}>
              新增模具
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '12px' }}>仅管理员可操作</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Basic Info */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 14px' }}>基本信息</p>

          {/* Mold Number */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              模具编号 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={moldNumber}
              onChange={e => setMoldNumber(e.target.value)}
              placeholder="如：5705-JL153-3"
              style={{
                width: '100%', padding: '11px 12px', background: '#F3F4F6',
                border: moldNumber ? `1.5px solid ${accentColor}33` : '1.5px solid transparent',
                borderRadius: '10px', fontSize: '15px', color: '#111827',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace',
              }}
            />
          </div>

          {/* Type */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              模具类型 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['口型模具', '模压模具', '接角模具'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setMoldType(t)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: '10px',
                    border: `1.5px solid ${moldType === t ? accentColor : '#E5E7EB'}`,
                    background: moldType === t ? '#EFF6FF' : '#fff',
                    color: moldType === t ? accentColor : '#6B7280',
                    fontSize: t === '接角模具' ? '13px' : '14px', 
                    fontWeight: moldType === t ? 600 : 400, cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Workshop */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              所属车间 <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>(可选)</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {WORKSHOPS.map(w => (
                <button
                  key={w}
                  onClick={() => setWorkshop(w)}
                  style={{
                    padding: '8px 14px', borderRadius: '10px',
                    border: `1.5px solid ${workshop === w ? accentColor : '#E5E7EB'}`,
                    background: workshop === w ? '#EFF6FF' : '#fff',
                    color: workshop === w ? accentColor : '#6B7280',
                    fontSize: '13px', fontWeight: workshop === w ? 600 : 400, cursor: 'pointer',
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* First Use Date */}
          <div>
            <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              首次使用日期
            </label>
            <input
              type="date"
              value={firstUseDate}
              onChange={e => setFirstUseDate(e.target.value)}
              style={{
                width: '100%', padding: '11px 12px', background: '#F3F4F6',
                border: '1.5px solid transparent', borderRadius: '10px',
                fontSize: '15px', color: '#111827', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Life Settings */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 14px' }}>使用参数</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                设计寿命（次）<span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                value={designLife}
                onChange={e => setDesignLife(e.target.value)}
                placeholder="如：50000"
                style={{
                  width: '100%', padding: '11px 10px', background: '#F3F4F6',
                  border: designLife ? `1.5px solid ${accentColor}33` : '1.5px solid transparent',
                  borderRadius: '10px', fontSize: '14px', color: '#111827',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                保养周期（次）<span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                value={maintenanceCycle}
                onChange={e => setMaintenanceCycle(e.target.value)}
                placeholder="如：5000"
                style={{
                  width: '100%', padding: '11px 10px', background: '#F3F4F6',
                  border: maintenanceCycle ? `1.5px solid ${accentColor}33` : '1.5px solid transparent',
                  borderRadius: '10px', fontSize: '14px', color: '#111827',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {designLife && maintenanceCycle && (
            <div
              style={{
                marginTop: '10px', padding: '8px 12px',
                background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0',
              }}
            >
              <p style={{ fontSize: '12px', color: '#059669', margin: 0 }}>
                预计可保养 <strong>{Math.floor(parseInt(designLife) / parseInt(maintenanceCycle))}</strong> 次
              </p>
            </div>
          )}
        </div>

        {/* Products */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>关联产品</p>
            <button
              onClick={addProduct}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '5px 10px', border: 'none', borderRadius: '8px',
                background: '#EFF6FF',
                color: accentColor, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Plus size={12} />
              添加产品
            </button>
          </div>

          {products.map((product, idx) => (
            <div
              key={idx}
              style={{
                background: '#F9FAFB', borderRadius: '10px', padding: '12px',
                marginBottom: idx < products.length - 1 ? '10px' : 0,
                border: '1px solid #E5E7EB',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>产品 {idx + 1}</span>
                {products.length > 1 && (
                  <button
                    onClick={() => removeProduct(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <Trash2 size={14} color="#9CA3AF" />
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { key: 'name', label: '产品名称', placeholder: '如：左/右前车门密封条总成', required: true },
                  { key: 'customer', label: '客户', placeholder: '如：吉利四川商用车有限公司' },
                  { key: 'model', label: '车型', placeholder: '如：E51' },
                  { key: 'partNumber', label: '零件号', placeholder: '如：9900074986/7' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                      {field.label}{field.required && <span style={{ color: '#EF4444' }}> *</span>}
                    </label>
                    <input
                      type="text"
                      value={(product as any)[field.key]}
                      onChange={e => {
                        const updated = [...products];
                        (updated[idx] as any)[field.key] = e.target.value;
                        setProducts(updated);
                      }}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', padding: '9px 10px', background: '#fff',
                        border: '1px solid #E5E7EB', borderRadius: '8px',
                        fontSize: '13px', color: '#111827', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
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
              ? `linear-gradient(135deg, ${accentColor} 0%, #1557C0 100%)`
              : '#D1D5DB',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: 600,
            cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
            boxShadow: isValid ? `0 4px 12px ${accentColor}40` : 'none',
          }}
        >
          {submitting ? '保存中...' : '保存模具'}
        </button>
      </div>
    </div>
  );
}