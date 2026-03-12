import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, AlertTriangle, CheckCircle2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface MoldTypeSetting {
  type: '模压模具' | '口型模具' | '接角模具';
  enabled: boolean;
  remainingThreshold: number; // 剩余次数阈值
  warningPercent: number; // 预警百分比（如80%）
  overduePercent: number; // 逾期百分比（如100%）
  icon: string;
  color: string;
  bg: string;
}

export function ReminderSettingsScreen() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [systemNotify, setSystemNotify] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  const [moldTypeSettings, setMoldTypeSettings] = useState<MoldTypeSetting[]>([
    {
      type: '模压模具',
      enabled: true,
      remainingThreshold: 300,
      warningPercent: 80,
      overduePercent: 100,
      icon: '🔧',
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      type: '口型模具',
      enabled: true,
      remainingThreshold: 200,
      warningPercent: 80,
      overduePercent: 100,
      icon: '⚙️',
      color: '#1A73E8',
      bg: '#EFF6FF',
    },
    {
      type: '接角模具',
      enabled: true,
      remainingThreshold: 150,
      warningPercent: 80,
      overduePercent: 100,
      icon: '🔩',
      color: '#D97706',
      bg: '#FFF7ED',
    },
  ]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('提醒设置已保存');
    }, 600);
  };

  const toggleSwitch = (value: boolean, setter: (v: boolean) => void) => {
    setter(!value);
  };

  const updateMoldTypeSetting = (
    index: number,
    field: keyof MoldTypeSetting,
    value: any
  ) => {
    const updated = [...moldTypeSettings];
    (updated[index] as any)[field] = value;
    setMoldTypeSettings(updated);
  };

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
            <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600 }}>
              维保提醒设置
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '12px' }}>
              管理员专属配置
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Info Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid #BFDBFE',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <AlertTriangle size={18} color="#1A73E8" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ fontSize: '13px', color: '#1A73E8', margin: '0 0 4px', fontWeight: 600 }}>
                提醒规则说明
              </p>
              <p style={{ fontSize: '12px', color: '#1E40AF', margin: 0, lineHeight: '1.5' }}>
                • 剩余次数阈值：当模具距下次保养剩余次数低于设定值时提醒
                <br />
                • 预警百分比：当使用率达到设定百分比时触发预警
                <br />• 逾期百分比：超过设定百分比时触发逾期告警
              </p>
            </div>
          </div>
        </div>

        {/* Mold Type Settings */}
        <div
          style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={16} color="#059669" />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
              模具类型专属配置
            </p>
          </div>

          {moldTypeSettings.map((setting, idx) => (
            <div
              key={setting.type}
              style={{
                padding: '16px 0',
                borderBottom:
                  idx < moldTypeSettings.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}
            >
              {/* Type Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: setting.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    {setting.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: 600 }}>
                      {setting.type}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                      {setting.enabled ? '已启用提醒' : '已禁用提醒'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    updateMoldTypeSetting(idx, 'enabled', !setting.enabled)
                  }
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: setting.enabled ? setting.color : '#E5E7EB',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: setting.enabled ? '22px' : '2px',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>

              {/* Settings */}
              {setting.enabled && (
                <div
                  style={{
                    background: '#F9FAFB',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Remaining Threshold */}
                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        fontWeight: 500,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      剩余次数阈值
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={setting.remainingThreshold}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateMoldTypeSetting(idx, 'remainingThreshold', value);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: setting.color,
                        background: setting.bg,
                        border: `2px solid ${setting.color}33`,
                        borderRadius: '10px',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                      placeholder="输入阈值"
                    />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '6px 0 0' }}>
                      剩余次数低于此值时发出提醒（建议：10-10000）
                    </p>
                  </div>

                  {/* Warning Percent */}
                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        fontWeight: 500,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      预警百分比（%）
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="range"
                        min="50"
                        max="95"
                        step="5"
                        value={setting.warningPercent}
                        onChange={(e) =>
                          updateMoldTypeSetting(
                            idx,
                            'warningPercent',
                            parseInt(e.target.value)
                          )
                        }
                        style={{
                          flex: 1,
                          height: '6px',
                          borderRadius: '3px',
                          outline: 'none',
                          WebkitAppearance: 'none',
                          background: `linear-gradient(to right, #D97706 0%, #D97706 ${
                            ((setting.warningPercent - 50) / 45) * 100
                          }%, #E5E7EB ${
                            ((setting.warningPercent - 50) / 45) * 100
                          }%, #E5E7EB 100%)`,
                        }}
                      />
                      <div
                        style={{
                          minWidth: '70px',
                          padding: '6px 12px',
                          background: '#FFF7ED',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '1px solid #FED7AA',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#D97706',
                            fontFamily: 'monospace',
                          }}
                        >
                          {setting.warningPercent}
                        </span>
                        <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '2px' }}>
                          %
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '6px 0 0' }}>
                      使用率达到此百分比时触发预警
                    </p>
                  </div>

                  {/* Overdue Percent */}
                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        fontWeight: 500,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      逾期百分比（%）
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="range"
                        min="95"
                        max="120"
                        step="5"
                        value={setting.overduePercent}
                        onChange={(e) =>
                          updateMoldTypeSetting(
                            idx,
                            'overduePercent',
                            parseInt(e.target.value)
                          )
                        }
                        style={{
                          flex: 1,
                          height: '6px',
                          borderRadius: '3px',
                          outline: 'none',
                          WebkitAppearance: 'none',
                          background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${
                            ((setting.overduePercent - 95) / 25) * 100
                          }%, #E5E7EB ${
                            ((setting.overduePercent - 95) / 25) * 100
                          }%, #E5E7EB 100%)`,
                        }}
                      />
                      <div
                        style={{
                          minWidth: '70px',
                          padding: '6px 12px',
                          background: '#FEF2F2',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '1px solid #FECACA',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#DC2626',
                            fontFamily: 'monospace',
                          }}
                        >
                          {setting.overduePercent}
                        </span>
                        <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '2px' }}>
                          %
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '6px 0 0' }}>
                      超过此百分比时触发逾期告警
                    </p>
                  </div>

                  {/* Summary */}
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '10px 12px',
                      background: '#fff',
                      borderRadius: '8px',
                      border: `1px solid ${setting.color}22`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: '11px',
                        color: '#374151',
                        margin: 0,
                        lineHeight: '1.6',
                      }}
                    >
                      <strong style={{ color: setting.color }}>触发规则：</strong>
                      <br />
                      剩余 ≤ {setting.remainingThreshold}次 或 使用率 ≥{' '}
                      {setting.warningPercent}% 时预警
                      <br />
                      使用率 ≥ {setting.overduePercent}% 时逾期告警
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notification Method */}
        <div
          style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={16} color="#1A73E8" />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
              通知方式
            </p>
          </div>

          {[
            {
              label: 'App 内推送通知',
              desc: '在首页铃铛图标显示提醒',
              value: systemNotify,
              setter: setSystemNotify,
            },
            {
              label: '每日汇总推送',
              desc: '每天 08:00 发送当日提醒汇总',
              value: dailySummary,
              setter: setDailySummary,
            },
          ].map((item, idx, arr) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: idx < arr.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}
            >
              <div>
                <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: 500 }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{item.desc}</p>
              </div>
              <button
                onClick={() => toggleSwitch(item.value, item.setter)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: item.value ? '#1A73E8' : '#E5E7EB',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: item.value ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            background: saving
              ? '#D1D5DB'
              : 'linear-gradient(135deg, #1A73E8 0%, #1557C0 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 12px rgba(26,115,232,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} />
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          border: 2px solid #1A73E8;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          border: 2px solid #1A73E8;
        }
      `}</style>
    </div>
  );
}