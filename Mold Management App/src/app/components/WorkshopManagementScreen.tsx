import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Building2, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { workshopsData } from '../data/mockData';

export function WorkshopManagementScreen() {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<string[]>([...workshopsData]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWorkshopName, setNewWorkshopName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddWorkshop = () => {
    if (!newWorkshopName.trim()) {
      toast.error('请输入车间名称');
      return;
    }
    if (workshops.includes(newWorkshopName.trim())) {
      toast.error('车间名称已存在');
      return;
    }
    setWorkshops([...workshops, newWorkshopName.trim()]);
    setNewWorkshopName('');
    setShowAddDialog(false);
    toast.success('车间添加成功');
  };

  const handleDeleteWorkshop = (index: number, name: string) => {
    // 检查是否是默认车间
    if (workshopsData.includes(name)) {
      toast.error('默认车间不能删除');
      return;
    }
    setWorkshops(workshops.filter((_, i) => i !== index));
    toast.success('车间删除成功');
  };

  const handleSaveEdit = (index: number) => {
    if (!editName.trim()) {
      toast.error('请输入车间名称');
      return;
    }
    if (workshops.includes(editName.trim()) && editName.trim() !== workshops[index]) {
      toast.error('车间名称已存在');
      return;
    }
    const newWorkshops = [...workshops];
    newWorkshops[index] = editName.trim();
    setWorkshops(newWorkshops);
    setEditingIndex(null);
    setEditName('');
    toast.success('车间名称已更新');
  };

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ background: '#1A73E8', padding: '16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={24} color="#fff" />
          </button>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 600 }}>车间管理</h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '13px', paddingLeft: '36px' }}>配置和管理生产车间信息</p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Add Workshop Button */}
        <button
          onClick={() => setShowAddDialog(true)}
          style={{
            width: '100%',
            background: '#fff',
            border: '2px dashed #1A73E8',
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px',
            color: '#1A73E8',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <Plus size={18} />
          添加新车间
        </button>

        {/* Workshop List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {workshops.map((workshop, index) => {
            const isDefault = workshopsData.includes(workshop);
            const isEditing = editingIndex === index;

            return (
              <div
                key={index}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isDefault ? '#EFF6FF' : '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Building2 size={20} color={isDefault ? '#1A73E8' : '#6B7280'} />
                </div>
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(index);
                      if (e.key === 'Escape') {
                        setEditingIndex(null);
                        setEditName('');
                      }
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '2px solid #1A73E8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#111827',
                    }}
                  />
                ) : (
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{workshop}</span>
                      {isDefault && (
                        <span style={{
                          background: '#EFF6FF',
                          color: '#1A73E8',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 600,
                        }}>默认</span>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(index)}
                        style={{
                          background: '#10B981',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setEditingIndex(null);
                          setEditName('');
                        }}
                        style={{
                          background: '#E5E7EB',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#6B7280',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingIndex(index);
                          setEditName(workshop);
                        }}
                        style={{
                          background: '#F3F4F6',
                          border: 'none',
                          borderRadius: '8px',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={16} color="#6B7280" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkshop(index, workshop)}
                        disabled={isDefault}
                        style={{
                          background: isDefault ? '#F9FAFB' : '#FEF2F2',
                          border: 'none',
                          borderRadius: '8px',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isDefault ? 'not-allowed' : 'pointer',
                          opacity: isDefault ? 0.5 : 1,
                        }}
                      >
                        <Trash2 size={16} color={isDefault ? '#9CA3AF' : '#DC2626'} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {workshops.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9CA3AF',
          }}>
            <Building2 size={48} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', margin: 0 }}>暂无车间，点击上方按钮添加</p>
          </div>
        )}

        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#FEF3C7',
          borderRadius: '8px',
          border: '1px solid #FCD34D',
        }}>
          <p style={{ fontSize: '12px', color: '#92400E', margin: 0 }}>
            💡 提示：默认车间不能删除，但可以编辑名称。新增的车间可随时删除。
          </p>
        </div>
      </div>

      {/* Add Workshop Dialog */}
      {showAddDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '360px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>添加新车间</h3>
            <input
              type="text"
              value={newWorkshopName}
              onChange={(e) => setNewWorkshopName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddWorkshop();
                if (e.key === 'Escape') {
                  setShowAddDialog(false);
                  setNewWorkshopName('');
                }
              }}
              placeholder="请输入车间名称"
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#111827',
                marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setNewWorkshopName('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
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
                onClick={handleAddWorkshop}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#1A73E8',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
