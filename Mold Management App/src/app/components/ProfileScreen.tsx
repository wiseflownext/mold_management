import { useNavigate } from 'react-router';
import {
  ChevronRight, ClipboardList, Bell, Lock, Info, LogOut, Settings, ShieldCheck, Wrench, Users, FileBarChart, Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    toast.success('已退出登录');
    logout();
    setTimeout(() => navigate('/login'), 800);
  };

  const menuItems = [
    {
      icon: ClipboardList,
      label: '我的使用记录',
      color: '#1A73E8',
      bg: '#EFF6FF',
      path: '/my-records',
      desc: '查看本人操作历史',
      adminOnly: false,
    },
    {
      icon: FileBarChart,
      label: '数据报表导出',
      color: '#DC2626',
      bg: '#FEF2F2',
      path: '/data-report',
      badge: '管理员',
      desc: '导出使用、维保、统计等报表',
      adminOnly: true,
    },
    {
      icon: Bell,
      label: '维保提醒设置',
      color: '#D97706',
      bg: '#FFF7ED',
      path: '/reminder-settings',
      badge: '管理员',
      desc: '配置提醒阈值和通知方式',
      adminOnly: true,
    },
    {
      icon: Building2,
      label: '车间管理',
      color: '#7C3AED',
      bg: '#F5F3FF',
      path: '/workshop-management',
      badge: '管理员',
      desc: '新增、编辑、删除车间配置',
      adminOnly: true,
    },
    {
      icon: Users,
      label: '员工账号管理',
      color: '#059669',
      bg: '#ECFDF5',
      path: '/employee-management',
      badge: '管理员',
      desc: '新增、编辑、删除员工账户',
      adminOnly: true,
    },
    {
      icon: Lock,
      label: '修改密码',
      color: '#7C3AED',
      bg: '#F5F3FF',
      path: '/change-password',
      desc: '更新登录密码',
      adminOnly: false,
    },
    {
      icon: Settings,
      label: '系统设置',
      color: '#059669',
      bg: '#ECFDF5',
      path: '/settings',
      desc: '同步、缓存与显示配置',
      adminOnly: false,
    },
    {
      icon: Info,
      label: '关于',
      color: '#6B7280',
      bg: '#F3F4F6',
      path: '/about',
      desc: '版本信息与更新日志',
      adminOnly: false,
    },
  ];

  const visibleItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  const displayName = user?.name || '未登录';
  const displayRole = user?.roleLabel || '操作员';
  const avatarChar = displayName[0] || '?';

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%' }}>
      {/* Header */}
      <div
        style={{
          background: isAdmin
            ? 'linear-gradient(160deg, #1A73E8 0%, #1557C0 100%)'
            : 'linear-gradient(160deg, #059669 0%, #047857 100%)',
          padding: '16px 20px 24px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <h2 style={{ color: '#fff', margin: '0 0 14px', fontSize: '16px', fontWeight: 600 }}>个人中心</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 700, color: '#fff',
              border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0,
            }}
          >
            {avatarChar}
          </div>
          <div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{displayName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '11px', background: 'rgba(255,255,255,0.2)',
                  color: '#fff', padding: '2px 9px', borderRadius: '999px',
                  fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                {isAdmin ? <ShieldCheck size={10} color="#fff" /> : <Wrench size={10} color="#fff" />}
                {displayRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: '-16px' }}>
        {/* Role Banner */}
        <div
          style={{
            background: '#fff', borderRadius: '14px', padding: '14px 16px',
            marginBottom: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: `1px solid ${isAdmin ? '#DBEAFE' : '#D1FAE5'}`,
            display: 'flex', alignItems: 'center', gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: isAdmin ? '#EFF6FF' : '#ECFDF5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            {isAdmin ? <ShieldCheck size={20} color="#1A73E8" /> : <Wrench size={20} color="#059669" />}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>
              {isAdmin ? '管理员权限' : '操作员权限'}
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
              {isAdmin
                ? '可新增/编辑/删除模具，配置提醒，访问全部功能'
                : '可提交使用记录，查看模具信息和维保记录'}
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div
          style={{
            background: '#fff', borderRadius: '16px', padding: '20px',
            marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { label: '本月记录', value: '24', unit: '条' },
              { label: '本月产量', value: '3,840', unit: '次' },
              { label: '维保次数', value: isAdmin ? '3' : '0', unit: '次' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: isAdmin ? '#1A73E8' : '#059669' }}>{item.value}</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '2px' }}>{item.unit}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu List */}
        <div
          style={{
            background: '#fff', borderRadius: '16px', overflow: 'hidden',
            marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {visibleItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: 'transparent', border: 'none',
                  borderBottom: idx < visibleItems.length - 1 ? '1px solid #F3F4F6' : 'none',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '40px', height: '40px', borderRadius: '11px',
                    background: item.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={item.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{item.label}</span>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '1px 0 0' }}>{item.desc}</p>
                </div>
                {(item as any).badge && isAdmin && (
                  <span
                    style={{
                      fontSize: '11px', background: '#FFF7ED', color: '#D97706',
                      padding: '2px 8px', borderRadius: '999px', fontWeight: 600,
                      marginRight: '4px', flexShrink: 0,
                    }}
                  >
                    {(item as any).badge}
                  </span>
                )}
                <ChevronRight size={16} color="#D1D5DB" />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '16px',
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: '14px', color: '#DC2626', fontSize: '16px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', marginBottom: '24px',
          }}
        >
          <LogOut size={18} color="#DC2626" />
          退出登录
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#D1D5DB', paddingBottom: '20px' }}>
          模具管理系统 v2.1.0 · 工厂智能管理平台
        </p>
      </div>
    </div>
  );
}