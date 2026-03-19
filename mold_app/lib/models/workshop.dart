class Workshop {
  final String id;
  final String name;
  final bool isDefault;
  final DateTime? createdAt;

  Workshop({
    required this.id,
    required this.name,
    this.isDefault = false,
    this.createdAt,
  });

  factory Workshop.fromJson(Map<String, dynamic> json) => Workshop(
        id: json['id']?.toString() ?? '',
        name: json['name'] as String? ?? '',
        isDefault: json['isDefault'] as bool? ?? false,
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'].toString())
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'isDefault': isDefault,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      };
}
