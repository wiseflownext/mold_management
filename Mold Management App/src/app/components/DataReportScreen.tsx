import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Download, FileText, Calendar, Filter } from 'lucide-react';
import { moldsData } from '../data/mockData';

type ReportType = 'usage' | 'maintenance' | 'mold-list' | 'statistics';

export function DataReportScreen() {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<ReportType>('usage');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-12');

  const reports = [
    { type: 'usage' as const, name: '使用记录报表', icon: <FileText size={20} />, desc: '导出指定时间段的模具使用记录' },
    { type: 'maintenance' as const, name: '维保记录报表', icon: <FileText size={20} />, desc: '导出模具维修保养记录' },
    { type: 'mold-list' as const, name: '模具台账报表', icon: <FileText size={20} />, desc: '导出所有模具的基本信息' },
    { type: 'statistics' as const, name: '统计分析报表', icon: <FileText size={20} />, desc: '导出模具使用统计和分析数据' },
  ];

  const handleExport = () => {
    let csvContent = '';
    let filename = '';

    switch (selectedReport) {
      case 'usage': {
        // 生成使用记录报表
        csvContent = '模具编号,产品名称,客户,车间,日期,数量,单位,操作员,班次\n';
        moldsData.forEach(mold => {
          mold.usageRecords.forEach(record => {
            const product = mold.products[0];
            csvContent += `${mold.moldNumber},${product.name},${product.customer},${mold.workshop},${record.date},${record.quantity},${mold.unit},${record.operator},${record.shift}\n`;
          });
        });
        filename = `使用记录报表_${startDate}_${endDate}.csv`;
        break;
      }
      case 'maintenance': {
        // 生成维保记录报表
        csvContent = '模具编号,模具类型,车间,日期,类型,内容,操作员\n';
        moldsData.forEach(mold => {
          mold.maintenanceRecords.forEach(record => {
            csvContent += `${mold.moldNumber},${mold.type},${mold.workshop},${record.date},${record.type},${record.content},${record.operator}\n`;
          });
        });
        filename = `维保记录报表_${startDate}_${endDate}.csv`;
        break;
      }
      case 'mold-list': {
        // 生成模具台账报表
        csvContent = '模具编号,模具类型,车间,首次使用日期,设计寿命,保养周期,已使用,单位,状态,关联产品数\n';
        moldsData.forEach(mold => {
          csvContent += `${mold.moldNumber},${mold.type},${mold.workshop},${mold.firstUseDate},${mold.designLife},${mold.maintenanceCycle},${mold.usageCount},${mold.unit},${mold.status},${mold.products.length}\n`;
        });
        filename = `模具台账报表_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }
      case 'statistics': {
        // 生成统计分析报表
        csvContent = '模具编号,模具类型,车间,使用率,剩余寿命,剩余寿命率,维保记录数,使用记录数\n';
        moldsData.forEach(mold => {
          const usageRate = ((mold.usageCount / mold.designLife) * 100).toFixed(1);
          const remainingLife = mold.designLife - mold.usageCount;
          const remainingRate = ((remainingLife / mold.designLife) * 100).toFixed(1);
          csvContent += `${mold.moldNumber},${mold.type},${mold.workshop},${usageRate}%,${remainingLife}${mold.unit},${remainingRate}%,${mold.maintenanceRecords.length},${mold.usageRecords.length}\n`;
        });
        filename = `统计分析报表_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }
    }

    // 添加 BOM 以支持中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ background: '#1A73E8', padding: '16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={24} color="#fff" />
          </button>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 600 }}>数据报表导出</h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '13px', paddingLeft: '36px' }}>选择报表类型并导出数据</p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Report Type Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>选择报表类型</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reports.map(report => (
              <div
                key={report.type}
                onClick={() => setSelectedReport(report.type)}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  border: selectedReport === report.type ? '2px solid #1A73E8' : '2px solid transparent',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: selectedReport === report.type ? '#1A73E8' : '#E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: selectedReport === report.type ? '#fff' : '#6B7280',
                    flexShrink: 0,
                  }}>
                    {report.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{report.name}</span>
                      {selectedReport === report.type && (
                        <span style={{
                          background: '#1A73E8',
                          color: '#fff',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 600,
                        }}>已选</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>{report.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Filter (for usage and maintenance reports) */}
        {(selectedReport === 'usage' || selectedReport === 'maintenance') && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Calendar size={16} color="#374151" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: 0 }}>时间范围</h3>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>开始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>结束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Report Preview Info */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Filter size={16} color="#374151" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: 0 }}>报表预览</h3>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {selectedReport === 'usage' && (
              <div>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                  将导出 <span style={{ color: '#1A73E8', fontWeight: 600 }}>{moldsData.reduce((sum, m) => sum + m.usageRecords.length, 0)}</span> 条使用记录
                </p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                  包含：模具编号、产品名称、客户、车间、日期、数量、单位、操作员、班次
                </p>
              </div>
            )}
            {selectedReport === 'maintenance' && (
              <div>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                  将导出 <span style={{ color: '#1A73E8', fontWeight: 600 }}>{moldsData.reduce((sum, m) => sum + m.maintenanceRecords.length, 0)}</span> 条维保记录
                </p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                  包含：模具编号、模具类型、车间、日期、类型、内容、操作员
                </p>
              </div>
            )}
            {selectedReport === 'mold-list' && (
              <div>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                  将导出 <span style={{ color: '#1A73E8', fontWeight: 600 }}>{moldsData.length}</span> 个模具的台账信息
                </p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                  包含：模具编号、模具类型、车间、首次使用日期、设计寿命、保养周期、已使用、单位、状态、关联产品数
                </p>
              </div>
            )}
            {selectedReport === 'statistics' && (
              <div>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                  将导出 <span style={{ color: '#1A73E8', fontWeight: 600 }}>{moldsData.length}</span> 个模具的统计分析数据
                </p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                  包含：模具编号、模具类型、车间、使用率、剩余寿命、剩余寿命率、维保记录数、使用记录数
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          style={{
            width: '100%',
            background: '#1A73E8',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(26, 115, 232, 0.3)',
          }}
        >
          <Download size={18} />
          导出 CSV 文件
        </button>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#FEF3C7',
          borderRadius: '8px',
          border: '1px solid #FCD34D',
        }}>
          <p style={{ fontSize: '12px', color: '#92400E', margin: 0 }}>
            💡 提示：导出的 CSV 文件可用 Excel 或其他表格软件打开查看
          </p>
        </div>
      </div>
    </div>
  );
}
