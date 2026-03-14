class AppNotification {
  final String id;
  final String? userId;
  final String type;
  final String title;
  final String message;
  final String? moldId;
  final bool isRead;
  final DateTime? createdAt;

  AppNotification({
    required this.id,
    this.userId,
    required this.type,
    required this.title,
    required this.message,
    this.moldId,
    this.isRead = false,
    this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: json['id']?.toString() ?? '',
        userId: json['userId']?.toString(),
        type: json['type'] as String? ?? '',
        title: json['title'] as String? ?? '',
        message: json['message'] as String? ?? '',
        moldId: json['moldId']?.toString(),
        isRead: json['isRead'] as bool? ?? false,
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'].toString())
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        if (userId != null) 'userId': userId,
        'type': type,
        'title': title,
        'message': message,
        if (moldId != null) 'moldId': moldId,
        'isRead': isRead,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      };
}
