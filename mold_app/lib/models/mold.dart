import 'workshop.dart';
import 'usage_record.dart';
import 'maintenance_record.dart';

class Mold {
  final String id;
  final String moldNumber;
  final String type;
  final String workshopId;
  final Workshop? workshop;
  final DateTime? firstUseDate;
  final int? designLife;
  final int? maintenanceCycle;
  final int? usageCount;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<MoldProduct> products;
  final List<UsageRecord> usageRecords;
  final List<MaintenanceRecord> maintenanceRecords;
  final int sinceLastMaintenance;
  final String? lastMaintenanceDate;
  final int? daysSinceLastMaintenance;
  final int? periodicMaintenanceDays;
  final int cavityCount;
  final int totalMaintenanceCount;

  Mold({
    required this.id,
    required this.moldNumber,
    required this.type,
    required this.workshopId,
    this.workshop,
    this.firstUseDate,
    this.designLife,
    this.maintenanceCycle,
    this.usageCount,
    required this.status,
    this.createdAt,
    this.updatedAt,
    this.products = const [],
    this.usageRecords = const [],
    this.maintenanceRecords = const [],
    this.sinceLastMaintenance = 0,
    this.lastMaintenanceDate,
    this.daysSinceLastMaintenance,
    this.periodicMaintenanceDays,
    this.cavityCount = 1,
    this.totalMaintenanceCount = 0,
  });

  factory Mold.fromJson(Map<String, dynamic> json) {
    final productsJson = json['products'] as List<dynamic>?;
    final usageJson = json['usageRecords'] as List<dynamic>?;
    final maintJson = json['maintenanceRecords'] as List<dynamic>?;
    return Mold(
      id: json['id']?.toString() ?? '',
      moldNumber: json['moldNumber'] as String? ?? '',
      type: json['type'] as String? ?? '',
      workshopId: json['workshopId']?.toString() ?? '',
      workshop: json['workshop'] != null
          ? Workshop.fromJson(json['workshop'] as Map<String, dynamic>)
          : null,
      firstUseDate: json['firstUseDate'] != null
          ? DateTime.tryParse(json['firstUseDate'].toString())
          : null,
      designLife: (json['designLife'] as num?)?.toInt(),
      maintenanceCycle: (json['maintenanceCycle'] as num?)?.toInt(),
      usageCount: (json['usageCount'] as num?)?.toInt(),
      status: json['status'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
      products: productsJson != null
          ? productsJson
              .map((e) => MoldProduct.fromJson(e as Map<String, dynamic>))
              .toList()
          : [],
      usageRecords: usageJson != null
          ? usageJson
              .map((e) => UsageRecord.fromJson(e as Map<String, dynamic>))
              .toList()
          : [],
      maintenanceRecords: maintJson != null
          ? maintJson
              .map((e) => MaintenanceRecord.fromJson(e as Map<String, dynamic>))
              .toList()
          : [],
      sinceLastMaintenance: (json['sinceLastMaintenance'] as num?)?.toInt() ?? 0,
      lastMaintenanceDate: json['lastMaintenanceDate'] as String?,
      daysSinceLastMaintenance: (json['daysSinceLastMaintenance'] as num?)?.toInt(),
      periodicMaintenanceDays: (json['periodicMaintenanceDays'] as num?)?.toInt(),
      cavityCount: (json['cavityCount'] as num?)?.toInt() ?? 1,
      totalMaintenanceCount: (json['totalMaintenanceCount'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'moldNumber': moldNumber,
        'type': type,
        'workshopId': workshopId,
        if (workshop != null) 'workshop': workshop!.toJson(),
        if (firstUseDate != null) 'firstUseDate': firstUseDate!.toIso8601String(),
        if (designLife != null) 'designLife': designLife,
        if (maintenanceCycle != null) 'maintenanceCycle': maintenanceCycle,
        if (usageCount != null) 'usageCount': usageCount,
        'status': status,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
        'products': products.map((e) => e.toJson()).toList(),
      };
}

class MoldProduct {
  final String id;
  final String moldId;
  final String? customer;
  final String? model;
  final String? name;
  final String? partNumber;

  MoldProduct({
    required this.id,
    required this.moldId,
    this.customer,
    this.model,
    this.name,
    this.partNumber,
  });

  factory MoldProduct.fromJson(Map<String, dynamic> json) => MoldProduct(
        id: json['id']?.toString() ?? '',
        moldId: json['moldId']?.toString() ?? '',
        customer: json['customer'] as String?,
        model: json['model'] as String?,
        name: json['name'] as String?,
        partNumber: json['partNumber'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'moldId': moldId,
        if (customer != null) 'customer': customer,
        if (model != null) 'model': model,
        if (name != null) 'name': name,
        if (partNumber != null) 'partNumber': partNumber,
      };
}

class MoldStatistics {
  final int inUse;
  final int repairing;
  final int stopped;
  final int scrapped;

  MoldStatistics({
    this.inUse = 0,
    this.repairing = 0,
    this.stopped = 0,
    this.scrapped = 0,
  });

  factory MoldStatistics.fromJson(Map<String, dynamic> json) {
    if (json.containsKey('inUse')) {
      return MoldStatistics(
        inUse: (json['inUse'] as num?)?.toInt() ?? 0,
        repairing: (json['repairing'] as num?)?.toInt() ?? 0,
        stopped: (json['stopped'] as num?)?.toInt() ?? 0,
        scrapped: (json['scrapped'] as num?)?.toInt() ?? 0,
      );
    }
    final byStatus = json['byStatus'] as List? ?? [];
    int count(String s) => byStatus
        .where((e) => e is Map && e['status'] == s)
        .fold<int>(0, (sum, e) => sum + ((e['_count'] as num?)?.toInt() ?? 0));
    return MoldStatistics(
      inUse: count('IN_USE'),
      repairing: count('REPAIRING'),
      stopped: count('STOPPED'),
      scrapped: count('SCRAPPED'),
    );
  }

  Map<String, dynamic> toJson() => {
        'inUse': inUse,
        'repairing': repairing,
        'stopped': stopped,
        'scrapped': scrapped,
      };
}

class TodaySummary {
  final int usageRecordCount;
  final int totalQuantity;
  final int activeMoldCount;

  TodaySummary({
    this.usageRecordCount = 0,
    this.totalQuantity = 0,
    this.activeMoldCount = 0,
  });

  factory TodaySummary.fromJson(Map<String, dynamic> json) => TodaySummary(
        usageRecordCount: (json['usageRecordCount'] as num?)?.toInt() ?? (json['recordCount'] as num?)?.toInt() ?? 0,
        totalQuantity: (json['totalQuantity'] as num?)?.toInt() ?? (json['totalProduction'] as num?)?.toInt() ?? 0,
        activeMoldCount: (json['activeMoldCount'] as num?)?.toInt() ?? (json['activeMolds'] as num?)?.toInt() ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'usageRecordCount': usageRecordCount,
        'totalQuantity': totalQuantity,
        'activeMoldCount': activeMoldCount,
      };
}
