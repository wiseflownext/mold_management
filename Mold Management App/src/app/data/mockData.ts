export type MoldStatus = '在用' | '维修中' | '停用' | '报废';
export type MoldType = '模压模具' | '口型模具' | '接角模具';
export type ShiftType = '早班' | '中班' | '晚班';
export type MaintenanceType = '保养' | '维修';
export type UnitType = '次' | '个' | '件';

export interface Product {
  customer: string;
  model: string;
  name: string;
  partNumber: string;
}

export interface UsageRecord {
  id: string;
  date: string;
  product: string;
  quantity: number; // 数量，单位根据模具的 unit 字段
  operator: string;
  shift: ShiftType;
  note?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: MaintenanceType;
  content: string;
  operator: string;
}

export interface Mold {
  id: string;
  moldNumber: string;
  type: MoldType;
  workshop: string;
  firstUseDate: string;
  designLife: number;
  maintenanceCycle: number;
  usageCount: number;
  status: MoldStatus;
  products: Product[];
  usageRecords: UsageRecord[];
  maintenanceRecords: MaintenanceRecord[];
  unit: UnitType; // 计量单位
  certificationReport?: string; // 鉴定报告文件名（用于延寿）
}

export const moldsData: Mold[] = [
  {
    id: '1',
    moldNumber: '5705-JL153-1',
    type: '口型模具',
    workshop: '挤出车间',
    firstUseDate: '2021.9.20',
    designLife: 50000,
    maintenanceCycle: 5000,
    usageCount: 12350,
    status: '在用',
    products: [
      {
        customer: '吉利四川商用车有限公司',
        model: 'E51',
        name: '左/右前车门密封条总成',
        partNumber: '9900074986/7',
      },
    ],
    usageRecords: [
      { id: 'u1', date: '2026.3.7', product: '前车门密封条', quantity: 320, operator: '张工', shift: '早班' },
      { id: 'u2', date: '2026.3.6', product: '前车门密封条', quantity: 298, operator: '李工', shift: '中班' },
      { id: 'u3', date: '2026.3.5', product: '前车门密封条', quantity: 310, operator: '张工', shift: '早班' },
    ],
    maintenanceRecords: [
      { id: 'm1', date: '2026.2.15', type: '保养', content: '清洁模具表面，检查各部件磨损情况，更换密封圈', operator: '王维修' },
      { id: 'm2', date: '2025.12.20', type: '维修', content: '修复模具局部裂纹，重新打磨型腔表面', operator: '王维修' },
    ],
    unit: '次',
  },
  {
    id: '2',
    moldNumber: '5705-JL153-2',
    type: '口型模具',
    workshop: '挤出车间',
    firstUseDate: '2021.10.5',
    designLife: 50000,
    maintenanceCycle: 5000,
    usageCount: 11800,
    status: '在用',
    products: [
      {
        customer: '吉利四川商用车有限公司',
        model: 'E51',
        name: '左/右后车门密封条总成',
        partNumber: '9900074988/9',
      },
    ],
    usageRecords: [
      { id: 'u4', date: '2026.3.7', product: '后车门密封条', quantity: 285, operator: '李工', shift: '中班' },
      { id: 'u5', date: '2026.3.6', product: '后车门密封条', quantity: 302, operator: '张工', shift: '早班' },
    ],
    maintenanceRecords: [
      { id: 'm3', date: '2026.1.10', type: '保养', content: '定期保养，清洁模具，润滑导柱', operator: '王维修' },
    ],
    unit: '次',
  },
  {
    id: '3',
    moldNumber: '6301-BJ201-1',
    type: '模压模具',
    workshop: '模压车间',
    firstUseDate: '2020.3.15',
    designLife: 80000,
    maintenanceCycle: 8000,
    usageCount: 45230,
    status: '维修中',
    products: [
      {
        customer: '北京奔驰汽车有限公司',
        model: 'C级',
        name: '发动机舱密封垫总成',
        partNumber: 'A2050700225',
      },
    ],
    usageRecords: [
      { id: 'u6', date: '2026.2.28', product: '发动机舱密封垫', quantity: 196, operator: '陈工', shift: '早班' },
    ],
    maintenanceRecords: [
      { id: 'm4', date: '2026.3.1', type: '维修', content: '模具型腔出现裂纹，正在修复，预计3月15日完成', operator: '赵维修' },
    ],
    unit: '次',
  },
  {
    id: '4',
    moldNumber: '6301-BJ201-2',
    type: '模压模具',
    workshop: '模压车间',
    firstUseDate: '2020.5.20',
    designLife: 80000,
    maintenanceCycle: 8000,
    usageCount: 42100,
    status: '在用',
    products: [
      {
        customer: '北京奔驰汽车有限公司',
        model: 'E级',
        name: '车身侧面密封条总成',
        partNumber: 'A2126900178',
      },
    ],
    usageRecords: [
      { id: 'u7', date: '2026.3.7', product: '车身侧面密封条', quantity: 168, operator: '陈工', shift: '晚班' },
      { id: 'u8', date: '2026.3.6', product: '车身侧面密封条', quantity: 185, operator: '陈工', shift: '早班' },
    ],
    maintenanceRecords: [
      { id: 'm5', date: '2026.2.20', type: '保养', content: '常规保养，润滑各运动部件，检查型腔表面', operator: '赵维修' },
    ],
    unit: '次',
  },
  {
    id: '5',
    moldNumber: '4802-GW088-1',
    type: '口型模具',
    workshop: '挤出车间',
    firstUseDate: '2019.8.10',
    designLife: 40000,
    maintenanceCycle: 4000,
    usageCount: 38500,
    status: '停用',
    products: [
      {
        customer: '长城汽车股份有限公司',
        model: 'H6',
        name: '前挡风玻璃密封条',
        partNumber: 'GW2903801XJ',
      },
    ],
    usageRecords: [
      { id: 'u9', date: '2025.11.30', product: '前挡风玻璃密封条', quantity: 124, operator: '孙工', shift: '早班' },
    ],
    maintenanceRecords: [
      { id: 'm6', date: '2025.10.15', type: '保养', content: '停产前最终保养，封存处理', operator: '王维修' },
    ],
    unit: '次',
  },
  {
    id: '6',
    moldNumber: '7104-SH331-1',
    type: '模压模具',
    workshop: '模压车间',
    firstUseDate: '2018.1.5',
    designLife: 60000,
    maintenanceCycle: 6000,
    usageCount: 60000,
    status: '报废',
    products: [
      {
        customer: '上汽大众汽车有限公司',
        model: 'Passat',
        name: '行李箱密封条总成',
        partNumber: '3C5827469G',
      },
    ],
    usageRecords: [],
    maintenanceRecords: [
      { id: 'm7', date: '2025.6.30', type: '维修', content: '模具已达到设计寿命上限，无法继续维修，建议报废处理', operator: '赵维修' },
    ],
    unit: '次',
  },
  // 接角模具数据
  {
    id: '7',
    moldNumber: '5700-JF155-12A0',
    type: '接角模具',
    workshop: '挤出车间',
    firstUseDate: '2022.6.15',
    designLife: 10000,
    maintenanceCycle: 10000,
    usageCount: 8240,
    status: '在用',
    products: [
      {
        customer: '重庆金辐汽车零部件有限公司',
        model: 'S203',
        name: '右前车门挡泥条角2',
        partNumber: '6102523-AW23',
      },
    ],
    usageRecords: [
      { id: 'u10', date: '2026.3.7', product: '右前车门挡泥条角2', quantity: 85, operator: '张工', shift: '早班' },
      { id: 'u11', date: '2026.3.5', product: '右前车门挡泥条角2', quantity: 92, operator: '张工', shift: '早班' },
    ],
    maintenanceRecords: [
      { id: 'm8', date: '2026.1.20', type: '保养', content: '清洁接角模具型腔，检查配合面磨损', operator: '王维修' },
    ],
    unit: '次',
  },
  {
    id: '8',
    moldNumber: '5700--2022-65-2',
    type: '接角模具',
    workshop: '挤出车间',
    firstUseDate: '2022.7.1',
    designLife: 10000,
    maintenanceCycle: 10000,
    usageCount: 7980,
    status: '在用',
    products: [
      {
        customer: '重庆金辐汽车零部件有限公司',
        model: 'S203',
        name: '左后车门挡泥条角1',
        partNumber: '6202513-AW22',
      },
    ],
    usageRecords: [
      { id: 'u12', date: '2026.3.7', product: '左后车门挡泥条角1', quantity: 78, operator: '李工', shift: '中班' },
    ],
    maintenanceRecords: [],
    unit: '次',
  },
  {
    id: '9',
    moldNumber: '5700-JF155-13A0',
    type: '接角模具',
    workshop: '挤出车间',
    firstUseDate: '2022.8.10',
    designLife: 10000,
    maintenanceCycle: 10000,
    usageCount: 6350,
    status: '在用',
    products: [
      {
        customer: '重庆金辐汽车零部件有限公司',
        model: 'S203',
        name: '右后车门挡泥条角1',
        partNumber: '6202523-AW23',
      },
    ],
    usageRecords: [
      { id: 'u13', date: '2026.3.6', product: '右后车门挡泥条角1', quantity: 88, operator: '陈工', shift: '早班' },
    ],
    maintenanceRecords: [
      { id: 'm9', date: '2025.12.5', type: '维修', content: '接角模具配合面出现轻微磨损，打磨处理', operator: '王维修' },
    ],
    unit: '次',
  },
  {
    id: '10',
    moldNumber: '5700--2022-66-1',
    type: '接角模具',
    workshop: '挤出车间',
    firstUseDate: '2021.11.20',
    designLife: 8000,
    maintenanceCycle: 8000,
    usageCount: 7650,
    status: '在用',
    products: [
      {
        customer: '重庆金辐汽车零部件有限公司',
        model: 'S203',
        name: '左前车门挡泥条角2',
        partNumber: '6102513-AW22',
      },
    ],
    usageRecords: [],
    maintenanceRecords: [
      { id: 'm10', date: '2026.2.1', type: '保养', content: '接近保养周期，提前进行预防性保养', operator: '王维修' },
    ],
    unit: '次',
  },
  {
    id: '11',
    moldNumber: '6301-JF201-03B',
    type: '接角模具',
    workshop: '模压车间',
    firstUseDate: '2023.3.5',
    designLife: 12000,
    maintenanceCycle: 12000,
    usageCount: 4200,
    status: '在用',
    products: [
      {
        customer: '北京奔驰汽车有限公司',
        model: 'C级',
        name: '前门下密封条角件',
        partNumber: 'A2050701156',
      },
    ],
    usageRecords: [
      { id: 'u14', date: '2026.3.7', product: '前门下密封条角件', quantity: 110, operator: '陈工', shift: '早班' },
      { id: 'u15', date: '2026.3.4', product: '前门下密封条角件', quantity: 105, operator: '陈工', shift: '晚班' },
    ],
    maintenanceRecords: [],
    unit: '次',
  },
  {
    id: '12',
    moldNumber: '4802-JF088-02A',
    type: '接角模具',
    workshop: '挤出车间',
    firstUseDate: '2020.5.8',
    designLife: 8000,
    maintenanceCycle: 8000,
    usageCount: 8000,
    status: '停用',
    products: [
      {
        customer: '长城汽车股份有限公司',
        model: 'H6',
        name: '前挡风玻璃密封角件',
        partNumber: 'GW2903802XJ',
      },
    ],
    usageRecords: [],
    maintenanceRecords: [
      { id: 'm11', date: '2025.9.20', type: '保养', content: '停产前封存处理', operator: '王维修' },
    ],
    unit: '次',
  },
  {
    id: '13',
    moldNumber: '7104-JF331-01',
    type: '接角模具',
    workshop: '模压车间',
    firstUseDate: '2023.10.1',
    designLife: 15000,
    maintenanceCycle: 15000,
    usageCount: 3100,
    status: '在用',
    products: [
      {
        customer: '上汽大众汽车有���公司',
        model: 'Passat',
        name: '行李箱盖密封角条',
        partNumber: '3C5827470G',
      },
      {
        customer: '上汽大众汽车有限公司',
        model: 'Passat',
        name: '行李箱侧密封角',
        partNumber: '3C5827471G',
      },
    ],
    usageRecords: [
      { id: 'u16', date: '2026.3.6', product: '行李箱盖密封角条', quantity: 95, operator: '孙工', shift: '中班' },
    ],
    maintenanceRecords: [],
    unit: '次',
  },
];

export const statsData = {
  inUse: 74,
  repairing: 3,
  stopped: 5,
  scrapped: 1,
};

export const maintenanceReminders = [
  {
    id: '1',
    moldNumber: '5705-JL153-1',
    productName: '左/右前车门密封条总成',
    remainingUses: 150,
    isOverdue: false,
  },
  {
    id: '4',
    moldNumber: '6301-BJ201-2',
    productName: '车身侧面密封条总成',
    remainingUses: -50,
    isOverdue: true,
  },
  {
    id: '2',
    moldNumber: '5705-JL153-2',
    productName: '左/右后车门密封条总成',
    remainingUses: 320,
    isOverdue: false,
  },
];

export type UrgencyLevel = 'overdue' | 'critical' | 'warning' | 'normal';

export interface MaintenanceAlert {
  id: string;
  moldNumber: string;
  workshop: string;
  type: MoldType;
  status: MoldStatus;
  productName: string;
  customer: string;
  maintenanceCycle: number;
  remainingUses: number;
  isOverdue: boolean;
  urgencyLevel: UrgencyLevel;
  lastMaintenanceDate: string;
  usageCount: number;
}

export const allMaintenanceAlerts: MaintenanceAlert[] = [
  {
    id: '4',
    moldNumber: '6301-BJ201-2',
    workshop: '模压车间',
    type: '模压模具',
    status: '在用',
    productName: '车身侧面密封条总成',
    customer: '北京奔驰汽车有限公司',
    maintenanceCycle: 8000,
    remainingUses: -50,
    isOverdue: true,
    urgencyLevel: 'overdue',
    lastMaintenanceDate: '2026.2.20',
    usageCount: 42100,
  },
  {
    id: '1',
    moldNumber: '5705-JL153-1',
    workshop: '挤出车间',
    type: '口型模具',
    status: '在用',
    productName: '左/右前车门密封条总成',
    customer: '吉利四川商用车有限公司',
    maintenanceCycle: 5000,
    remainingUses: 150,
    isOverdue: false,
    urgencyLevel: 'critical',
    lastMaintenanceDate: '2026.2.15',
    usageCount: 12350,
  },
  {
    id: '2',
    moldNumber: '5705-JL153-2',
    workshop: '挤出车间',
    type: '口型模具',
    status: '在用',
    productName: '左/右后车门密封条总成',
    customer: '吉利四川商用车有限公司',
    maintenanceCycle: 5000,
    remainingUses: 320,
    isOverdue: false,
    urgencyLevel: 'warning',
    lastMaintenanceDate: '2026.1.10',
    usageCount: 11800,
  },
  {
    id: '3',
    moldNumber: '6301-BJ201-1',
    workshop: '模压车间',
    type: '模压模具',
    status: '维修中',
    productName: '发动机舱密封垫总成',
    customer: '北京奔驰汽车有限公司',
    maintenanceCycle: 8000,
    remainingUses: 1200,
    isOverdue: false,
    urgencyLevel: 'normal',
    lastMaintenanceDate: '2026.3.1',
    usageCount: 45230,
  },
  {
    id: '5',
    moldNumber: '4802-GW088-1',
    workshop: '挤出车间',
    type: '口型模具',
    status: '停用',
    productName: '前挡风玻璃密封条',
    customer: '长城汽车股份有限公司',
    maintenanceCycle: 4000,
    remainingUses: 2500,
    isOverdue: false,
    urgencyLevel: 'normal',
    lastMaintenanceDate: '2025.10.15',
    usageCount: 38500,
  },
  {
    id: '10',
    moldNumber: '5700--2022-66-1',
    workshop: '挤出车间',
    type: '接角模具',
    status: '在用',
    productName: '左前车门挡泥条角2',
    customer: '重庆金辐汽车零部件有限公司',
    maintenanceCycle: 8000,
    remainingUses: 350,
    isOverdue: false,
    urgencyLevel: 'warning',
    lastMaintenanceDate: '2026.2.1',
    usageCount: 7650,
  },
];

export interface AppNotification {
  id: string;
  type: 'maintenance_overdue' | 'maintenance_soon' | 'status_change' | 'usage_record';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  moldId?: string;
}

export const appNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'maintenance_overdue',
    title: '维保逾期提醒',
    message: '模具 6301-BJ201-2 已逾期保养 50 次，请尽快安排维保',
    time: '10分钟前',
    isRead: false,
    moldId: '4',
  },
  {
    id: 'n2',
    type: 'maintenance_soon',
    title: '保养提醒',
    message: '模具 5705-JL153-1 距下次保养仅剩 150 次，请关注',
    time: '2小时前',
    isRead: false,
    moldId: '1',
  },
  {
    id: 'n3',
    type: 'status_change',
    title: '状态变更',
    message: '模具 6301-BJ201-1 已进入维修状态，预计 3 月 15 日完成',
    time: '昨天 14:30',
    isRead: true,
    moldId: '3',
  },
  {
    id: 'n4',
    type: 'maintenance_soon',
    title: '保养提醒',
    message: '模具 5705-JL153-2 距下次保养仅剩 320 次',
    time: '昨天 09:15',
    isRead: true,
    moldId: '2',
  },
  {
    id: 'n5',
    type: 'usage_record',
    title: '新增使用记录',
    message: '李工 已提交模具 5705-JL153-2 使用记录，产量 480 次',
    time: '3天前',
    isRead: true,
    moldId: '2',
  },
];

export const myUsageRecords = [
  { id: 'r1', date: '2026.3.7', moldNumber: '5705-JL153-1', product: '左/右前车门密封条总成', quantity: 320, shift: '早班' as const, workshop: '挤出车间' },
  { id: 'r2', date: '2026.3.7', moldNumber: '6301-BJ201-2', product: '车身侧面密封条总成', quantity: 168, shift: '早班' as const, workshop: '模压车间' },
  { id: 'r3', date: '2026.3.6', moldNumber: '5705-JL153-1', product: '左/右前车门密封条总成', quantity: 310, shift: '早班' as const, workshop: '挤出车间' },
  { id: 'r4', date: '2026.3.5', moldNumber: '5705-JL153-1', product: '左/右前车门密封条总成', quantity: 315, shift: '早班' as const, workshop: '挤出车间' },
  { id: 'r5', date: '2026.3.5', moldNumber: '6301-BJ201-2', product: '车身侧面密封条总成', quantity: 172, shift: '早班' as const, workshop: '模压车间' },
  { id: 'r6', date: '2026.3.4', moldNumber: '5705-JL153-2', product: '左/右后车门密封条总成', quantity: 298, shift: '早班' as const, workshop: '挤出车间' },
  { id: 'r7', date: '2026.3.3', moldNumber: '5705-JL153-1', product: '左/右前车门密封条总成', quantity: 308, shift: '早班' as const, workshop: '挤出车间' },
  { id: 'r8', date: '2026.3.1', moldNumber: '6301-BJ201-2', product: '车身侧面密封条总成', quantity: 185, shift: '早班' as const, workshop: '模压车间' },
  { id: 'r9', date: '2026.2.28', moldNumber: '5705-JL153-1', product: '左/右前车门密封条总成', quantity: 302, shift: '早班' as const, workshop: '挤出车间' },
  { id: 'r10', date: '2026.2.27', moldNumber: '5705-JL153-2', product: '左/右后车门密封条总成', quantity: 290, shift: '早班' as const, workshop: '挤出车间' },
  { id: 'r11', date: '2026.2.26', moldNumber: '6301-BJ201-2', product: '车身侧面密封条总成', quantity: 179, shift: '早班' as const, workshop: '模压车间' },
  { id: 'r12', date: '2026.2.25', moldNumber: '5705-JL153-1', product: '左/右前车门密封条总成', quantity: 318, shift: '早班' as const, workshop: '挤出车间' },
];

// 车间配置
export const workshopsData: string[] = [
  '挤出车间',
  '后续车间',
];