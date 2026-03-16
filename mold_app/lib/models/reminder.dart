class MaintenanceAlert {
  final String moldId;
  final String moldNumber;
  final String? workshop;
  final String type;
  final String? status;
  final String? productName;
  final String? customer;
  final int? maintenanceCycle;
  final int? usageCount;
  final int? designLife;
  final int? sinceLastMaint;
  final int? remainingUses;
  final bool? isOverdue;
  final String? urgencyLevel;
  final DateTime? lastMaintenanceDate;
  final int? periodicMaintenanceDays;
  final int? daysSinceLastMaintenance;
  final int? periodicRemaining;

  MaintenanceAlert({
    required this.moldId,
    required this.moldNumber,
    this.workshop,
    required this.type,
    this.status,
    this.productName,
    this.customer,
    this.maintenanceCycle,
    this.usageCount,
    this.designLife,
    this.sinceLastMaint,
    this.remainingUses,
    this.isOverdue,
    this.urgencyLevel,
    this.lastMaintenanceDate,
    this.periodicMaintenanceDays,
    this.daysSinceLastMaintenance,
    this.periodicRemaining,
  });

  factory MaintenanceAlert.fromJson(Map<String, dynamic> json) =>
      MaintenanceAlert(
        moldId: json['moldId']?.toString() ?? '',
        moldNumber: json['moldNumber'] as String? ?? '',
        workshop: json['workshop'] is String
            ? json['workshop'] as String?
            : (json['workshop'] is Map ? json['workshop']['name'] as String? : null),
        type: json['type'] as String? ?? '',
        status: json['status'] as String?,
        productName: json['productName'] as String?,
        customer: json['customer'] as String?,
        maintenanceCycle: (json['maintenanceCycle'] as num?)?.toInt(),
        usageCount: (json['usageCount'] as num?)?.toInt(),
        designLife: (json['designLife'] as num?)?.toInt(),
        sinceLastMaint: (json['sinceLastMaint'] as num?)?.toInt(),
        remainingUses: (json['remainingUses'] as num?)?.toInt(),
        isOverdue: json['isOverdue'] as bool?,
        urgencyLevel: json['urgencyLevel'] as String?,
        lastMaintenanceDate: json['lastMaintenanceDate'] != null
            ? DateTime.tryParse(json['lastMaintenanceDate'].toString())
            : null,
        periodicMaintenanceDays: (json['periodicMaintenanceDays'] as num?)?.toInt(),
        daysSinceLastMaintenance: (json['daysSinceLastMaintenance'] as num?)?.toInt(),
        periodicRemaining: (json['periodicRemaining'] as num?)?.toInt(),
      );

  Map<String, dynamic> toJson() => {
        'moldId': moldId,
        'moldNumber': moldNumber,
        if (workshop != null) 'workshop': workshop,
        'type': type,
        if (status != null) 'status': status,
        if (productName != null) 'productName': productName,
        if (customer != null) 'customer': customer,
        if (maintenanceCycle != null) 'maintenanceCycle': maintenanceCycle,
        if (usageCount != null) 'usageCount': usageCount,
        if (designLife != null) 'designLife': designLife,
        if (sinceLastMaint != null) 'sinceLastMaint': sinceLastMaint,
        if (remainingUses != null) 'remainingUses': remainingUses,
        if (isOverdue != null) 'isOverdue': isOverdue,
        if (urgencyLevel != null) 'urgencyLevel': urgencyLevel,
        if (lastMaintenanceDate != null)
            'lastMaintenanceDate': lastMaintenanceDate!.toIso8601String(),
      };
}

class ReminderSetting {
  final String id;
  final String moldType;
  final bool enabled;
  final int remainingThreshold;
  final int warningPercent;
  final int overduePercent;
  final int periodicAdvanceDays;

  ReminderSetting({
    required this.id,
    required this.moldType,
    this.enabled = true,
    this.remainingThreshold = 300,
    this.warningPercent = 80,
    this.overduePercent = 100,
    this.periodicAdvanceDays = 7,
  });

  factory ReminderSetting.fromJson(Map<String, dynamic> json) => ReminderSetting(
        id: json['id']?.toString() ?? '',
        moldType: json['moldType'] as String? ?? '',
        enabled: json['enabled'] as bool? ?? true,
        remainingThreshold: (json['remainingThreshold'] as num?)?.toInt() ?? 300,
        warningPercent: (json['warningPercent'] as num?)?.toInt() ?? 80,
        overduePercent: (json['overduePercent'] as num?)?.toInt() ?? 100,
        periodicAdvanceDays: (json['periodicAdvanceDays'] as num?)?.toInt() ?? 7,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'moldType': moldType,
        'enabled': enabled,
        'remainingThreshold': remainingThreshold,
        'warningPercent': warningPercent,
        'overduePercent': overduePercent,
      };
}
