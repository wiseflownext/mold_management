import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ChevronRight, Wrench, Edit3, X, Trash2, Upload, FileCheck, ImagePlus } from 'lucide-react';
import { moldsData, MoldStatus } from '../data/mockData';
import { StatusBadge } from './StatusBadge';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const STATUS_OPTIONS: MoldStatus[] = ['在用', '维修中', '停用', '报废'];

const shiftColors: Record<string, string> = {
  早班: '#059669',
  中班: '#1A73E8',
  晚班: '#7C3AED',
};

const maintenanceTypeColors: Record<string, { bg: string; text: string }> = {
  保养: { bg: '#ECFDF5', text: '#059669' },
  维修: { bg: '#FEF3C7', text: '#D97706' },
};

export function MoldDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'usage' | 'maintenance'>('usage');
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Appraisal report state
  const [showAppraisalSheet, setShowAppraisalSheet] = useState(false);
  const [appraisalImageUrl, setAppraisalImageUrl] = useState<string | null>(null);
  const [appraisalImageName, setAppraisalImageName] = useState('');
  const [newDesignLife, setNewDesignLife] = useState('');
  const [currentDesignLife, setCurrentDesignLife] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mold = moldsData.find((m) => m.id === id);

  if (!mold) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9CA3AF' }}>
        <p>模具不存在</p>
        <button onClick={() => navigate(-1)} style={{ color: '#1A73E8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}>
          返回
        </button>
      </div>
    );
  }

  const displayDesignLife = currentDesignLife ?? mold.designLife;
  const lifePercent = Math.min((mold.usageCount / displayDesignLife) * 100, 100);
  const remainingForMaint = mold.maintenanceCycle - (mold.usageCount % mold.maintenanceCycle);

  const handleStatusChange = (newStatus: MoldStatus) => {
    setShowStatusSheet(false);
    toast.success(`状态已更新为「${newStatus}」`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAppraisalImageUrl(ev.target?.result as string);
      setAppraisalImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAppraisalConfirm = () => {
    if (!appraisalImageUrl) {
      toast.error('请先上传鉴定报告图片');
      return;
    }
    if (!newDesignLife || parseInt(newDesignLife) <= 0) {
      toast.error('请输入有效的设计寿命');
      return;
    }
    const val = parseInt(newDesignLife);
    setCurrentDesignLife(val);
    setShowAppraisalSheet(false);
    setAppraisalImageUrl(null);
    setAppraisalImageName('');
    setNewDesignLife('');
    toast.success(`设计寿命已更新为 ${val.toLocaleString()} ${mold.unit}`);
  };

  const resetAppraisalSheet = () => {
    setShowAppraisalSheet(false);
    setAppraisalImageUrl(null);
    setAppraisalImageName('');
    setNewDesignLife('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', paddingBottom: '80px', position: 'relative' }}>
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
          <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600, flex: 1 }}>模具详情</h2>
          {isAdmin && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setShowAppraisalSheet(true)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Upload size={13} color="#fff" />
                鉴定
              </button>
              <button
                onClick={() => setShowStatusSheet(true)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Edit3 size={13} color="#fff" />
                变更
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  background: 'rgba(255,100,100,0.3)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Trash2 size={13} color="#fff" />
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Top Info Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '18px',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                {mold.moldNumber}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>{mold.workshop}</p>
            </div>
            <StatusBadge status={mold.status} />
          </div>

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: '类型', value: mold.type },
              { label: '车间', value: mold.workshop },
              { label: '首次使用', value: mold.firstUseDate },
              { label: '保养周期', value: `每 ${mold.maintenanceCycle.toLocaleString()} ${mold.unit}` },
              { label: '已使用', value: `${mold.usageCount.toLocaleString()} ${mold.unit}` },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 2px', fontWeight: 500 }}>{item.label}</p>
                <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: 500 }}>{item.value}</p>
              </div>
            ))}

            {/* Design Life cell with optional updated badge */}
            <div>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 2px', fontWeight: 500 }}>设计寿命</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: 500 }}>
                  {displayDesignLife.toLocaleString()} 次
                </p>
                {currentDesignLife !== null && (
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      background: '#ECFDF5',
                      color: '#059669',
                      borderRadius: '999px',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    已更新
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Life Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>寿命消耗</span>
              <span
                style={{
                  fontSize: '12px',
                  color: lifePercent > 80 ? '#DC2626' : lifePercent > 60 ? '#D97706' : '#1A73E8',
                  fontWeight: 600,
                }}
              >
                {lifePercent.toFixed(1)}%
              </span>
            </div>
            <div
              style={{
                height: '8px',
                background: '#E5E7EB',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${lifePercent}%`,
                  background: lifePercent > 80 ? '#EF4444' : lifePercent > 60 ? '#F59E0B' : '#1A73E8',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>0</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>距下次保养还剩 {remainingForMaint.toLocaleString()} 次</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{displayDesignLife.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '0 0 12px' }}>关联产品</p>
          {mold.products.map((product, idx) => (
            <div
              key={idx}
              style={{
                background: '#F8FAFF',
                borderRadius: '10px',
                padding: '12px',
                border: '1px solid #DBEAFE',
                marginBottom: idx < mold.products.length - 1 ? '10px' : 0,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { label: '客户', value: product.customer },
                  { label: '车型', value: product.model },
                  { label: '产品', value: product.name },
                  { label: '零件号', value: product.partNumber },
                ].map((item) => (
                  <div key={item.label} style={item.label === '客户' || item.label === '产品' ? { gridColumn: 'span 2' } : {}}>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 1px' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', color: '#111827', margin: 0, fontWeight: 500 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Records Tabs */}
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
            {[
              { key: 'usage', label: '使用记录' },
              { key: 'maintenance', label: '维保记录' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'usage' | 'maintenance')}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  color: activeTab === tab.key ? '#1A73E8' : '#6B7280',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.key ? '2px solid #1A73E8' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '12px 16px 16px' }}>
            {activeTab === 'usage' ? (
              mold.usageRecords.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px', padding: '20px 0' }}>暂无使用记录</p>
              ) : (
                <div>
                  {mold.usageRecords.map((record, idx) => (
                    <div
                      key={record.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        paddingBottom: idx < mold.usageRecords.length - 1 ? '12px' : 0,
                        borderBottom: idx < mold.usageRecords.length - 1 ? '1px solid #F3F4F6' : 'none',
                        marginBottom: idx < mold.usageRecords.length - 1 ? '12px' : 0,
                      }}
                    >
                      {/* Timeline dot */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3px' }}>
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#1A73E8',
                            flexShrink: 0,
                          }}
                        />
                        {idx < mold.usageRecords.length - 1 && (
                          <div style={{ width: '1px', flex: 1, background: '#E5E7EB', marginTop: '4px' }} />
                        )}
                      </div>

                      <div style={{ flex: 1, paddingBottom: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{record.date}</span>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '1px 8px',
                              borderRadius: '999px',
                              background: '#F0FDF4',
                              color: shiftColors[record.shift] || '#374151',
                              fontWeight: 600,
                            }}
                          >
                            {record.shift}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 2px' }}>{record.product}</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>
                            产量：<strong style={{ color: '#111827' }}>{record.quantity.toLocaleString()}</strong> {mold.unit}
                          </span>
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>操作：{record.operator}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              mold.maintenanceRecords.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px', padding: '20px 0' }}>暂无维保记录</p>
              ) : (
                <div>
                  {mold.maintenanceRecords.map((record, idx) => (
                    <div
                      key={record.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        paddingBottom: idx < mold.maintenanceRecords.length - 1 ? '12px' : 0,
                        borderBottom: idx < mold.maintenanceRecords.length - 1 ? '1px solid #F3F4F6' : 'none',
                        marginBottom: idx < mold.maintenanceRecords.length - 1 ? '12px' : 0,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3px' }}>
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#F59E0B',
                            flexShrink: 0,
                          }}
                        />
                        {idx < mold.maintenanceRecords.length - 1 && (
                          <div style={{ width: '1px', flex: 1, background: '#E5E7EB', marginTop: '4px' }} />
                        )}
                      </div>

                      <div style={{ flex: 1, paddingBottom: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{record.date}</span>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '1px 8px',
                              borderRadius: '999px',
                              background: maintenanceTypeColors[record.type]?.bg || '#F3F4F6',
                              color: maintenanceTypeColors[record.type]?.text || '#374151',
                              fontWeight: 600,
                            }}
                          >
                            {record.type}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 2px', lineHeight: 1.5 }}>
                          {record.content}
                        </p>
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>操作人：{record.operator}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Add Maintenance Link */}
            <button
              onClick={() => navigate('/add-maintenance')}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '10px',
                background: '#F8FAFF',
                border: '1.5px dashed #BFDBFE',
                borderRadius: '10px',
                color: '#1A73E8',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Wrench size={14} />
              新增维保记录
            </button>
          </div>
        </div>
      </div>

      {/* Status Change Bottom Sheet */}
      {showStatusSheet && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowStatusSheet(false)}
          />
          <div
            style={{
              background: '#fff',
              borderRadius: '20px 20px 0 0',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>变更模具状态</p>
              <button
                onClick={() => setShowStatusSheet(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
              >
                <X size={20} color="#9CA3AF" />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px' }}>
              当前状态：<StatusBadge status={mold.status} size="sm" />
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
              {STATUS_OPTIONS.filter((s) => s !== mold.status).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  style={{
                    padding: '14px 16px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '12px',
                    background: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <StatusBadge status={status} />
                  <ChevronRight size={16} color="#9CA3AF" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowDeleteConfirm(false)} />
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: '#FEF2F2', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Trash2 size={28} color="#DC2626" />
              </div>
              <p style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
                确认删除此模具？
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                {mold.moldNumber} 的所有数据将被永久删除，此操作不可恢复
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, padding: '14px', background: '#F3F4F6', border: 'none',
                  borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                  color: '#374151', cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  toast.success('模具已删除');
                  setTimeout(() => navigate('/molds'), 600);
                }}
                style={{
                  flex: 1, padding: '14px',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                  color: '#fff', cursor: 'pointer',
                }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appraisal Report Upload Sheet */}
      {showAppraisalSheet && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={resetAppraisalSheet} />
          <div
            style={{
              background: '#F5F7FA',
              borderRadius: '20px 20px 0 0',
              maxHeight: '85%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Sheet Header */}
            <div
              style={{
                background: '#fff',
                padding: '18px 20px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #F3F4F6',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px', height: '32px', borderRadius: '10px',
                    background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <FileCheck size={17} color="#1A73E8" />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>上传鉴定报告</p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>上传后可修改设计寿命</p>
                </div>
              </div>
              <button onClick={resetAppraisalSheet} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <X size={20} color="#9CA3AF" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>

              {/* Upload Area */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 12px' }}>
                  鉴定报告图片 <span style={{ color: '#EF4444' }}>*</span>
                </p>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />

                {appraisalImageUrl ? (
                  /* Image Preview */
                  <div style={{ position: 'relative' }}>
                    <img
                      src={appraisalImageUrl}
                      alt="鉴定报告"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        borderRadius: '10px',
                        border: '2px solid #DBEAFE',
                        background: '#F8FAFF',
                      }}
                    />
                    {/* Image name & re-upload */}
                    <div
                      style={{
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileCheck size={13} color="#059669" />
                        <span
                          style={{
                            fontSize: '12px', color: '#059669', fontWeight: 600,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px',
                          }}
                        >
                          {appraisalImageName}
                        </span>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          fontSize: '12px', color: '#1A73E8', background: 'none',
                          border: 'none', cursor: 'pointer', fontWeight: 500,
                        }}
                      >
                        重新上传
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload Placeholder */
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '32px 20px',
                      background: '#F8FAFF',
                      border: '2px dashed #BFDBFE',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <ImagePlus size={24} color="#1A73E8" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '0 0 2px' }}>
                        点击上传鉴定报告
                      </p>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                        支持 JPG、PNG、HEIC 等图片格式
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Design Life Edit — only enabled after image uploaded */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  opacity: appraisalImageUrl ? 1 : 0.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>
                    修改设计寿命（次）<span style={{ color: '#EF4444' }}>*</span>
                  </p>
                  {!appraisalImageUrl && (
                    <span
                      style={{
                        fontSize: '10px', padding: '2px 8px',
                        background: '#F3F4F6', color: '#9CA3AF',
                        borderRadius: '999px', fontWeight: 500,
                      }}
                    >
                      需先上传报告
                    </span>
                  )}
                </div>

                {/* Current value hint */}
                <div
                  style={{
                    marginBottom: '10px', padding: '8px 12px',
                    background: '#F8FAFF', borderRadius: '8px', border: '1px solid #DBEAFE',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>当前设计寿命</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A73E8' }}>
                    {displayDesignLife.toLocaleString()} 次
                  </span>
                </div>

                <input
                  type="number"
                  value={newDesignLife}
                  onChange={(e) => setNewDesignLife(e.target.value)}
                  placeholder={`请输入新设计寿命，如：${displayDesignLife.toLocaleString()}`}
                  disabled={!appraisalImageUrl}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    background: appraisalImageUrl ? '#F3F4F6' : '#F9FAFB',
                    border: newDesignLife ? '1.5px solid #1A73E833' : '1.5px solid transparent',
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: appraisalImageUrl ? 'text' : 'not-allowed',
                  }}
                />

                {newDesignLife && parseInt(newDesignLife) > 0 && (
                  <div
                    style={{
                      marginTop: '8px', padding: '8px 12px',
                      background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    <FileCheck size={13} color="#059669" />
                    <p style={{ fontSize: '12px', color: '#059669', margin: 0 }}>
                      设计寿命将更新为{' '}
                      <strong>{parseInt(newDesignLife).toLocaleString()}</strong> 次
                      {parseInt(newDesignLife) > displayDesignLife
                        ? `（延长 ${(parseInt(newDesignLife) - displayDesignLife).toLocaleString()} 次）`
                        : parseInt(newDesignLife) < displayDesignLife
                        ? `（缩短 ${(displayDesignLife - parseInt(newDesignLife)).toLocaleString()} 次）`
                        : '（未变更）'}
                    </p>
                  </div>
                )}
              </div>

              {/* Notice */}
              <div
                style={{
                  padding: '10px 14px',
                  background: '#FFF7ED',
                  borderRadius: '10px',
                  border: '1px solid #FED7AA',
                  marginBottom: '16px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
                  修改设计寿命需上传正式鉴定报告图片作为凭证，此操作将被系统记录留存，请谨慎操作。
                </p>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleAppraisalConfirm}
                disabled={!appraisalImageUrl || !newDesignLife || parseInt(newDesignLife) <= 0}
                style={{
                  width: '100%',
                  padding: '14px',
                  background:
                    appraisalImageUrl && newDesignLife && parseInt(newDesignLife) > 0
                      ? 'linear-gradient(135deg, #1A73E8 0%, #1557C0 100%)'
                      : '#D1D5DB',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor:
                    appraisalImageUrl && newDesignLife && parseInt(newDesignLife) > 0
                      ? 'pointer'
                      : 'not-allowed',
                  boxShadow:
                    appraisalImageUrl && newDesignLife
                      ? '0 4px 12px rgba(26,115,232,0.35)'
                      : 'none',
                }}
              >
                确认更新设计寿命
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}