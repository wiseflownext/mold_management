import 'user.dart';

class MaintenanceRecord {
  final String id;
  final String moldId;
  final String type;
  final String content;
  final DateTime? recordDate;
  final String? operatorId;
  final DateTime? createdAt;
  final MaintenanceRecordMold? mold;
  final User? operator;

  MaintenanceRecord({
    required this.id,
    required this.moldId,
    required this.type,
    required this.content,
    this.recordDate,
    this.operatorId,
    this.createdAt,
    this.mold,
    this.operator,
  });

  factory MaintenanceRecord.fromJson(Map<String, dynamic> json) =>
      MaintenanceRecord(
        id: json['id']?.toString() ?? '',
        moldId: json['moldId']?.toString() ?? '',
        type: json['type'] as String? ?? '',
        content: json['content'] as String? ?? '',
        recordDate: json['recordDate'] != null
            ? DateTime.tryParse(json['recordDate'].toString())
            : null,
        operatorId: json['operatorId']?.toString(),
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'].toString())
            : null,
        mold: json['mold'] != null
            ? MaintenanceRecordMold.fromJson(json['mold'] as Map<String, dynamic>)
            : null,
        operator: json['operator'] != null
            ? User.fromJson(json['operator'] as Map<String, dynamic>)
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'moldId': moldId,
        'type': type,
        'content': content,
        if (recordDate != null) 'recordDate': recordDate!.toIso8601String().split('T')[0],
        if (operatorId != null) 'operatorId': operatorId,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (mold != null) 'mold': mold!.toJson(),
        if (operator != null) 'operator': operator!.toJson(),
      };
}

class MaintenanceRecordMold {
  final String? moldNumber;
  final String? type;
  final String? workshop;

  MaintenanceRecordMold({this.moldNumber, this.type, this.workshop});

  factory MaintenanceRecordMold.fromJson(Map<String, dynamic> json) {
    final w = json['workshop'];
    final workshop =
        w is String ? w : (w is Map ? (w['name'] as String?) : null);
    return MaintenanceRecordMold(
      moldNumber: json['moldNumber'] as String?,
      type: json['type'] as String?,
      workshop: workshop,
    );
  }

  Map<String, dynamic> toJson() => {
        if (moldNumber != null) 'moldNumber': moldNumber,
        if (type != null) 'type': type,
        if (workshop != null) 'workshop': workshop,
      };
}
