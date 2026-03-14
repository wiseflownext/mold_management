import '../config/api.dart';
import 'api_client.dart';

class AuditLogService {
  AuditLogService._();
  static final instance = AuditLogService._();
  final _api = ApiClient.instance;

  Future<Map<String, dynamic>> getList({int page = 1, int pageSize = 20}) async {
    final r = await _api.get(ApiConfig.auditLogs, params: {'page': page, 'pageSize': pageSize});
    final d = r.data is Map ? r.data['data'] ?? r.data : r.data;
    return {
      'items': (d['items'] as List?) ?? [],
      'total': d['total'] ?? 0,
      'page': d['page'] ?? page,
    };
  }
}
