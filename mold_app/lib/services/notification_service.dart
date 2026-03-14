import 'package:dio/dio.dart';
import '../config/api.dart';
import '../models/notification.dart';
import '../models/pagination.dart';
import 'api_client.dart';

class NotificationService {
  NotificationService._();
  static final NotificationService _instance = NotificationService._();
  static NotificationService get instance => _instance;

  final _api = ApiClient.instance;

  Future<PaginatedResponse<AppNotification>> getList(int page, int pageSize) async {
    final r = await _api.get(ApiConfig.notifications, params: {
      'page': page,
      'pageSize': pageSize,
    });
    return _parsePaginated(r, AppNotification.fromJson);
  }

  Future<int> getUnreadCount() async {
    final r = await _api.get(ApiConfig.notificationsUnreadCount);
    final d = _parseRaw(r);
    if (d is Map) return (d['count'] as num?)?.toInt() ?? 0;
    if (d is num) return d.toInt();
    return 0;
  }

  Future<void> markRead(String id) async {
    await _api.put(ApiConfig.notificationRead(int.tryParse(id) ?? 0));
  }

  Future<void> markAllRead() async {
    await _api.put(ApiConfig.notificationsReadAll);
  }

  PaginatedResponse<T> _parsePaginated<T>(
    Response r,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final d = _parseRaw(r);
    return PaginatedResponse.fromJson(d as Map<String, dynamic>? ?? {}, fromJson);
  }

  dynamic _parseRaw(Response r) {
    final d = r.data;
    if (d is Map && (d['code'] == 0 || d['code'] == 200)) return d['data'];
    throw Exception(d is Map ? (d['message'] ?? 'Error') : 'Error');
  }
}
