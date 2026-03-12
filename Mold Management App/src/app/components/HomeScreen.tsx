import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, ChevronRight, Plus, Search, Bell, X, Wrench, Activity, RefreshCw } from 'lucide-react';
import { statsData, maintenanceReminders, appNotifications, AppNotification, moldsData } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const statCards = [
  { label: '在用', value: statsData.inUse, bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', valueColor: '#059669' },
  { label: '维修中', value: statsData.repairing, bg: '#FFF7ED', text: '#D97706', border: '#FDE68A', valueColor: '#D97706' },
  { label: '停用', value: statsData.stopped, bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB', valueColor: '#6B7280' },
  { label: '报废', value: statsData.scrapped, bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', valueColor: '#DC2626' },
];

const notificationTypeConfig: Record<AppNotification['type'], { color: string; bg: string; icon: typeof Bell }> = {
  maintenance_overdue: { color: '#DC2626', bg: '#FEF2F2', icon: AlertTriangle },
  maintenance_soon: { color: '#D97706', bg: '#FFF7ED', icon: Bell },
  status_change: { color: '#7C3AED', bg: '#F5F3FF', icon: RefreshCw },
  usage_record: { color: '#059669', bg: '#ECFDF5', icon: Activity },
};

export function HomeScreen() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notifications, setNotifications] = useState(appNotifications);

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[today.getDay()];

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayName = user?.name || '你好';
  const displayRole = user?.roleLabel || '';

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', position: 'relative' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(160deg, #1A73E8 0%, #1557C0 100%)',
          padding: '14px 20px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '-40px', right: '60px',
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '17px', color: '#fff', fontWeight: 600 }}>你好，{displayName}</span>
              <span
                style={{
                  fontSize: '10px', background: 'rgba(255,255,255,0.2)',
                  color: '#fff', padding: '2px 7px', borderRadius: '999px', fontWeight: 500,
                }}
              >
                {displayRole}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
              {dateStr} {weekDay}
            </span>
          </div>
          <button
            onClick={() => setShowNotificationPanel(true)}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', position: 'relative',
              flexShrink: 0,
            }}
          >
            <Bell size={17} color="#fff" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute', top: '6px', right: '6px',
                  width: '8px', height: '8px', background: '#FF6D00',
                  borderRadius: '50%', border: '2px solid #1A73E8',
                }}
              />
            )}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: '-16px' }}>
        {/* Quick Actions - Moved to Top */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <button
            onClick={() => navigate('/add-usage')}
            style={{
              background: 'linear-gradient(135deg, #1A73E8 0%, #1557C0 100%)',
              border: 'none',
              borderRadius: '14px',
              padding: '18px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(26,115,232,0.3)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                background: 'rgba(255,255,255,0.25)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={22} color="#fff" />
            </div>
            <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>新增使用记录</span>
          </button>

          <button
            onClick={() => navigate('/add-maintenance')}
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              border: 'none',
              borderRadius: '14px',
              padding: '18px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                background: 'rgba(255,255,255,0.25)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wrench size={22} color="#fff" />
            </div>
            <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>新增维保记录</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '10px', marginBottom: '16px',
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: '#fff', borderRadius: '14px', padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${card.border}`,
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 700, color: card.valueColor, lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: '13px', color: card.text, marginTop: '4px', fontWeight: 500 }}>
                {card.label}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>副模具</div>
            </div>
          ))}
        </div>

        {/* Maintenance Reminders */}
        <div
          style={{
            background: '#fff', borderRadius: '16px', padding: '16px',
            marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} color="#FF6D00" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>维保提醒</span>
              <span
                style={{
                  fontSize: '11px', background: '#FFF3E0', color: '#FF6D00',
                  padding: '1px 6px', borderRadius: '999px', fontWeight: 600,
                }}
              >
                {maintenanceReminders.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/reminders')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <span style={{ fontSize: '12px', color: '#1A73E8' }}>全部</span>
              <ChevronRight size={14} color="#1A73E8" />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {maintenanceReminders.map((reminder) => {
              const mold = moldsData.find(m => m.id === reminder.id);
              const cycle = mold?.maintenanceCycle ?? 5000;
              return (
                <div
                  key={reminder.id}
                  style={{
                    background: reminder.isOverdue ? '#FEF2F2' : '#F8FAFF',
                    borderRadius: '10px', padding: '12px',
                    border: `1px solid ${reminder.isOverdue ? '#FECACA' : '#DBEAFE'}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/molds/${reminder.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>
                        {reminder.moldNumber}
                      </p>
                      <p
                        style={{
                          fontSize: '12px', color: '#6B7280', margin: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px',
                        }}
                      >
                        {reminder.productName}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {reminder.isOverdue ? (
                        <p style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600, margin: 0 }}>
                          已逾期 {Math.abs(reminder.remainingUses)} 次
                        </p>
                      ) : (
                        <p style={{ fontSize: '12px', color: '#D97706', margin: 0 }}>
                          还剩 <strong>{reminder.remainingUses}</strong> 次
                        </p>
                      )}
                      <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>距下次保养</p>
                    </div>
                  </div>
                  {/* Mini Progress Bar */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: reminder.isOverdue ? '100%' : `${Math.min(100, Math.round(((cycle - reminder.remainingUses) / cycle) * 100))}%`,
                          background: reminder.isOverdue ? '#EF4444' : reminder.remainingUses < 200 ? '#F97316' : '#F59E0B',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick navigate to reminders */}
          <button
            onClick={() => navigate('/reminders')}
            style={{
              marginTop: '10px', width: '100%', padding: '8px',
              background: '#FFF7ED', border: '1px dashed #FED7AA',
              borderRadius: '8px', color: '#D97706', fontSize: '12px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '5px',
            }}
          >
            <AlertTriangle size={12} />
            查看全部维保提醒
          </button>
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: '#fff', borderRadius: '16px', padding: '16px',
            marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>今日生产概览</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { label: '使用记录', value: '8', unit: '条' },
              { label: '生产总量', value: '3,240', unit: '次' },
              { label: '活跃模具', value: '12', unit: '副' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#1A73E8' }}>
                  {item.value}<span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 400, marginLeft: '2px' }}>{item.unit}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Panel (Bottom Sheet) */}
      {showNotificationPanel && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 300,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div
            style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowNotificationPanel(false)}
          />
          <div
            style={{
              background: '#F5F7FA', borderRadius: '20px 20px 0 0',
              maxHeight: '70%', display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Sheet Header */}
            <div
              style={{
                background: '#fff', padding: '16px 20px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid #F3F4F6', flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>消息通知</p>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: '11px', background: '#FF6D00', color: '#fff',
                      padding: '1px 7px', borderRadius: '999px', fontWeight: 600,
                    }}
                  >
                    {unreadCount} 条未读
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#1A73E8' }}
                  >
                    全部已读
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationPanel(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                >
                  <X size={20} color="#9CA3AF" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
              {notifications.map((notif) => {
                const cfg = notificationTypeConfig[notif.type];
                const IconComp = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.moldId) {
                        setShowNotificationPanel(false);
                        navigate(`/molds/${notif.moldId}`);
                      }
                    }}
                    style={{
                      padding: '12px 20px',
                      background: notif.isRead ? 'transparent' : '#FFFBF5',
                      borderBottom: '1px solid #F3F4F6',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      cursor: notif.moldId ? 'pointer' : 'default',
                    }}
                  >
                    <div
                      style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: cfg.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <IconComp size={16} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{notif.title}</span>
                        {!notif.isRead && (
                          <span
                            style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              background: '#FF6D00', flexShrink: 0,
                              display: 'inline-block',
                            }}
                          />
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px', lineHeight: 1.5 }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{notif.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}