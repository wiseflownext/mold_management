class LoginResponse {
  final String accessToken;
  final String refreshToken;
  final User user;

  LoginResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) => LoginResponse(
        accessToken: json['accessToken'] as String? ?? '',
        refreshToken: json['refreshToken'] as String? ?? '',
        user: User.fromJson(json['user'] as Map<String, dynamic>? ?? {}),
      );

  Map<String, dynamic> toJson() => {
        'accessToken': accessToken,
        'refreshToken': refreshToken,
        'user': user.toJson(),
      };
}

class User {
  final String id;
  final String username;
  final String name;
  final String role;
  final String? workshop;
  final String? workshopId;
  final String? phone;
  final DateTime? createdAt;
  final DateTime? lastLogin;

  User({
    required this.id,
    required this.username,
    required this.name,
    required this.role,
    this.workshop,
    this.workshopId,
    this.phone,
    this.createdAt,
    this.lastLogin,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id']?.toString() ?? '',
        username: json['username'] as String? ?? '',
        name: json['name'] as String? ?? '',
        role: json['role'] as String? ?? '',
        workshop: json['workshop'] is String
            ? json['workshop'] as String?
            : (json['workshop'] is Map ? json['workshop']['name'] as String? : null),
        workshopId: json['workshopId']?.toString(),
        phone: json['phone'] as String?,
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'].toString())
            : null,
        lastLogin: json['lastLogin'] != null
            ? DateTime.tryParse(json['lastLogin'].toString())
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'name': name,
        'role': role,
        if (workshop != null) 'workshop': workshop,
        if (workshopId != null) 'workshopId': workshopId,
        if (phone != null) 'phone': phone,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (lastLogin != null) 'lastLogin': lastLogin!.toIso8601String(),
      };
}
