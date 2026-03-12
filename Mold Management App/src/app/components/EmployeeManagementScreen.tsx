import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Users, ShieldCheck, Wrench, X } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'operator';
  roleLabel: string;
  workshop?: string;
  createdAt: string;
  lastLogin?: string;
}

export function EmployeeManagementScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      username: 'admin',
      name: '王经理',
      role: 'admin',
      roleLabel: '管理员',
      createdAt: '2024.1.5',
      lastLogin: '2026.3.11 09:23',
    },
    {
      id: '2',
      username: 'operator1',
      name: '张工',
      role: 'operator',
      roleLabel: '操作员',
      workshop: '挤出车间',
      createdAt: '2024.2.10',
      lastLogin: '2026.3.10 14:15',
    },
    {
      id: '3',
      username: 'operator2',
      name: '李工',
      role: 'operator',
      roleLabel: '操作员',
      workshop: '后续车间',
      createdAt: '2024.2.10',
      lastLogin: '2026.3.11 08:45',
    },
    {
      id: '4',
      username: 'operator3',
      name: '王维修',
      role: 'operator',
      roleLabel: '操作员',
      createdAt: '2024.3.15',
      lastLogin: '2026.3.9 16:30',
    },
  ]);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    role: 'operator' as 'admin' | 'operator',
    workshop: '',
  });

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.includes(searchQuery) ||
      emp.username.includes(searchQuery) ||
      emp.roleLabel.includes(searchQuery) ||
      (emp.workshop && emp.workshop.includes(searchQuery))
  );

  const handleDelete = (employee: Employee) => {
    if (employee.id === '1') {
      toast.error('无法删除主管理员账号');
      return;
    }
    if (confirm(`确定要删除员工「${employee.name}」吗？`)) {
      setEmployees(employees.filter((e) => e.id !== employee.id));
      toast.success('员工已删除');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      username: employee.username,
      name: employee.name,
      password: '',
      role: employee.role,
      workshop: employee.workshop || '',
    });
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    if (!formData.username || !formData.name) {
      toast.error('请填写账号和姓名');
      return;
    }

    if (!editingEmployee && !formData.password) {
      toast.error('请设置初始密码');
      return;
    }

    // Check duplicate username
    if (
      employees.some(
        (e) => e.username === formData.username && e.id !== editingEmployee?.id
      )
    ) {
      toast.error('账号已存在');
      return;
    }

    if (editingEmployee) {
      // Update
      setEmployees(
        employees.map((e) =>
          e.id === editingEmployee.id
            ? {
                ...e,
                username: formData.username,
                name: formData.name,
                role: formData.role,
                roleLabel: formData.role === 'admin' ? '管理员' : '操作员',
                workshop: formData.workshop || undefined,
              }
            : e
        )
      );
      toast.success('员工信息已更新');
    } else {
      // Add new
      const newEmployee: Employee = {
        id: String(Date.now()),
        username: formData.username,
        name: formData.name,
        role: formData.role,
        roleLabel: formData.role === 'admin' ? '管理员' : '操作员',
        workshop: formData.workshop || undefined,
        createdAt: new Date().toLocaleDateString('zh-CN').replace(/\//g, '.'),
      };
      setEmployees([...employees, newEmployee]);
      toast.success('员工已添加');
    }

    setShowAddModal(false);
    setEditingEmployee(null);
    setFormData({ username: '', name: '', password: '', role: 'operator', workshop: '' });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingEmployee(null);
    setFormData({ username: '', name: '', password: '', role: 'operator', workshop: '' });
  };

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100%', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ background: '#1A73E8', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 600 }}>
              员工账号管理
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '12px' }}>
              管理员专属功能
            </p>
          </div>
          <button
            onClick={() => {
              setEditingEmployee(null);
              setFormData({ username: '', name: '', password: '', role: 'operator', workshop: '' });
              setShowAddModal(true);
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} />
            新增
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color="#9CA3AF"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="搜索账号、姓名、角色..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              outline: 'none',
              background: 'rgba(255,255,255,0.95)',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1A73E8' }}>
              {employees.filter((e) => e.role === 'admin').length}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>管理员</div>
          </div>
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>
              {employees.filter((e) => e.role === 'operator').length}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>操作员</div>
          </div>
        </div>

        {/* Employee List */}
        <div
          style={{
            background: '#fff',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {filteredEmployees.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: '14px',
              }}
            >
              <Users size={40} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0 }}>
                {searchQuery ? '未找到匹配的员工' : '暂无员工账号'}
              </p>
            </div>
          ) : (
            filteredEmployees.map((employee, idx) => (
              <div
                key={employee.id}
                style={{
                  padding: '14px 16px',
                  borderBottom:
                    idx < filteredEmployees.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background:
                        employee.role === 'admin'
                          ? 'linear-gradient(135deg, #1A73E8 0%, #1557C0 100%)'
                          : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {employee.name[0]}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                        {employee.name}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          background: employee.role === 'admin' ? '#EFF6FF' : '#ECFDF5',
                          color: employee.role === 'admin' ? '#1A73E8' : '#059669',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        {employee.role === 'admin' ? (
                          <ShieldCheck size={10} />
                        ) : (
                          <Wrench size={10} />
                        )}
                        {employee.roleLabel}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 3px' }}>
                      账号：{employee.username}
                      {employee.workshop && ` · ${employee.workshop}`}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        创建：{employee.createdAt}
                      </span>
                      {employee.lastLogin && (
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                          登录：{employee.lastLogin}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(employee)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#EFF6FF',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Edit2 size={14} color="#1A73E8" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      disabled={employee.id === '1'}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: employee.id === '1' ? '#F3F4F6' : '#FEF2F2',
                        border: 'none',
                        cursor: employee.id === '1' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: employee.id === '1' ? 0.5 : 1,
                      }}
                    >
                      <Trash2 size={14} color={employee.id === '1' ? '#9CA3AF' : '#DC2626'} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {editingEmployee ? '编辑员工' : '新增员工'}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <X size={20} color="#9CA3AF" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Username */}
              <div>
                <label style={{ fontSize: '13px', color: '#374151', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  账号 <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入登录账号"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Name */}
              <div>
                <label style={{ fontSize: '13px', color: '#374151', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  姓名 <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入员工姓名"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: '13px', color: '#374151', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  密码 {!editingEmployee && <span style={{ color: '#DC2626' }}>*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingEmployee ? '留空则不修改密码' : '请设置初始密码'}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Role */}
              <div>
                <label style={{ fontSize: '13px', color: '#374151', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  角色 <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setFormData({ ...formData, role: 'operator' })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: `1.5px solid ${formData.role === 'operator' ? '#059669' : '#E5E7EB'}`,
                      background: formData.role === 'operator' ? '#ECFDF5' : '#fff',
                      color: formData.role === 'operator' ? '#059669' : '#6B7280',
                      fontSize: '14px',
                      fontWeight: formData.role === 'operator' ? 600 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Wrench size={16} />
                    操作员
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: `1.5px solid ${formData.role === 'admin' ? '#1A73E8' : '#E5E7EB'}`,
                      background: formData.role === 'admin' ? '#EFF6FF' : '#fff',
                      color: formData.role === 'admin' ? '#1A73E8' : '#6B7280',
                      fontSize: '14px',
                      fontWeight: formData.role === 'admin' ? 600 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShieldCheck size={16} />
                    管理员
                  </button>
                </div>
              </div>

              {/* Workshop (Optional) */}
              <div>
                <label style={{ fontSize: '13px', color: '#374151', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  车间 <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>(可选)</span>
                </label>
                <select
                  value={formData.workshop}
                  onChange={(e) => setFormData({ ...formData, workshop: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#fff',
                  }}
                >
                  <option value="">不指定车间</option>
                  <option value="挤出车间">挤出车间</option>
                  <option value="后续车间">后续车间</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid #F3F4F6',
                display: 'flex',
                gap: '10px',
              }}
            >
              <button
                onClick={handleCloseModal}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  background: '#fff',
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #1A73E8 0%, #1557C0 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(26,115,232,0.25)',
                }}
              >
                {editingEmployee ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
