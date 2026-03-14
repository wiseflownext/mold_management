import 'user.dart';

class UsageRecord {
  final String id;
  final String moldId;
  final String? product;
  final int? quantity;
  final String? shift;
  final DateTime? recordDate;
  final String? operatorId;
  final String? note;
  final DateTime? createdAt;
  final UsageRecordMold? mold;
  final User? operator;

  UsageRecord({
    required this.id,
    required this.moldId,
    this.product,
    this.quantity,
    this.shift,
    this.recordDate,
    this.operatorId,
    this.note,
    this.createdAt,
    this.mold,
    this.operator,
  });

  factory UsageRecord.fromJson(Map<String, dynamic> json) => UsageRecord(
        id: json['id']?.toString() ?? '',
        moldId: json['moldId']?.toString() ?? '',
        product: json['product'] as String?,
        quantity: (json['quantity'] as num?)?.toInt(),
        shift: json['shift'] as String?,
        recordDate: json['recordDate'] != null
            ? DateTime.tryParse(json['recordDate'].toString())
            : null,
        operatorId: json['operatorId']?.toString(),
        note: json['note'] as String?,
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'].toString())
            : null,
        mold: json['mold'] != null
            ? UsageRecordMold.fromJson(json['mold'] as Map<String, dynamic>)
            : null,
        operator: json['operator'] != null
            ? User.fromJson(json['operator'] as Map<String, dynamic>)
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'moldId': moldId,
        if (product != null) 'product': product,
        if (quantity != null) 'quantity': quantity,
        if (shift != null) 'shift': shift,
        if (recordDate != null) 'recordDate': recordDate!.toIso8601String(),
        if (operatorId != null) 'operatorId': operatorId,
        if (note != null) 'note': note,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (mold != null) 'mold': mold!.toJson(),
        if (operator != null) 'operator': operator!.toJson(),
      };
}

class UsageRecordMold {
  final String? moldNumber;
  final String? type;
  final String? workshop;

  UsageRecordMold({
    this.moldNumber,
    this.type,
    this.workshop,
  });

  factory UsageRecordMold.fromJson(Map<String, dynamic> json) {
    final w = json['workshop'];
    final workshop =
        w is String ? w : (w is Map ? (w['name'] as String?) : null);
    return UsageRecordMold(
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
