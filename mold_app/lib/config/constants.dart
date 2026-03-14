import 'package:flutter/material.dart';

enum MoldType {
  compression('模压模具'),
  extrusion('口型模具'),
  corner('接角模具');

  const MoldType(this.label);
  final String label;
  String get apiValue => switch (this) {
        MoldType.compression => 'COMPRESSION',
        MoldType.extrusion => 'EXTRUSION',
        MoldType.corner => 'CORNER',
      };
  static MoldType? fromApi(String? v) => switch (v?.toUpperCase()) {
        'COMPRESSION' => MoldType.compression,
        'EXTRUSION' => MoldType.extrusion,
        'CORNER' => MoldType.corner,
        _ => null,
      };
}

enum MoldStatus {
  inUse('在用'),
  repairing('维修中'),
  stopped('停用'),
  scrapped('报废');

  const MoldStatus(this.label);
  final String label;

  Color get color => StatusColors.of(this);
  String get apiValue => switch (this) {
        MoldStatus.inUse => 'IN_USE',
        MoldStatus.repairing => 'REPAIRING',
        MoldStatus.stopped => 'STOPPED',
        MoldStatus.scrapped => 'SCRAPPED',
      };
  static MoldStatus? fromApi(String? v) => switch (v?.toUpperCase()) {
        'IN_USE' => MoldStatus.inUse,
        'REPAIRING' => MoldStatus.repairing,
        'STOPPED' => MoldStatus.stopped,
        'SCRAPPED' => MoldStatus.scrapped,
        _ => null,
      };
  static String labelOf(String? v) => fromApi(v)?.label ?? v ?? '';
}

enum Shift {
  morning('早班'),
  afternoon('中班'),
  night('晚班');

  const Shift(this.label);
  final String label;
  String get apiValue => switch (this) {
        Shift.morning => 'MORNING',
        Shift.afternoon => 'AFTERNOON',
        Shift.night => 'NIGHT',
      };
  static Shift? fromApi(String? v) => switch (v?.toUpperCase()) {
        'MORNING' => Shift.morning,
        'AFTERNOON' => Shift.afternoon,
        'NIGHT' => Shift.night,
        _ => null,
      };
}

enum MaintenanceType {
  maintain('保养'),
  repair('维修');

  const MaintenanceType(this.label);
  final String label;
  String get apiValue => switch (this) {
        MaintenanceType.maintain => 'MAINTAIN',
        MaintenanceType.repair => 'REPAIR',
      };
}

enum Role {
  admin('管理员'),
  operator('操作员');

  const Role(this.label);
  final String label;
}

class StatusColors {
  StatusColors._();

  static const Color inUse = Color(0xFF22C55E);
  static const Color repairing = Color(0xFFF59E0B);
  static const Color stopped = Color(0xFF9CA3AF);
  static const Color scrapped = Color(0xFFEF4444);

  static Color ofStatus(String? status) {
    final s = MoldStatus.fromApi(status);
    return s != null ? of(s) : const Color(0xFF9CA3AF);
  }

  static Color of(MoldStatus s) => switch (s) {
        MoldStatus.inUse => inUse,
        MoldStatus.repairing => repairing,
        MoldStatus.stopped => stopped,
        MoldStatus.scrapped => scrapped,
      };
}

class UrgencyColors {
  UrgencyColors._();

  static const Color overdue = Color(0xFFEF4444);
  static const Color critical = Color(0xFFF59E0B);
  static const Color warning = Color(0xFFEAB308);
  static const Color normal = Color(0xFF22C55E);
}
