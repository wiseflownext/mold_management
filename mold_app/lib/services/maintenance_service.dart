import 'package:dio/dio.dart';
import '../config/api.dart';
import '../models/maintenance_record.dart';
import '../models/pagination.dart';
import 'api_client.dart';

class MaintenanceService {
  MaintenanceService._();
  static final MaintenanceService _instance = MaintenanceService._();
  static MaintenanceService get instance => _instance;

  final _api = ApiClient.instance;

  Future<PaginatedResponse<MaintenanceRecord>> getList(
    int page,
    int pageSize, {
    String? moldId,
    String? operatorId,
    String? type,
    String? startDate,
    String? endDate,
  }) async {
    final params = <String, dynamic>{'page': page, 'pageSize': pageSize};
    if (moldId != null && moldId.isNotEmpty) params['moldId'] = moldId;
    if (operatorId != null && operatorId.isNotEmpty) params['operatorId'] = operatorId;
    if (type != null && type.isNotEmpty) params['type'] = type;
    if (startDate != null && startDate.isNotEmpty) params['startDate'] = startDate;
    if (endDate != null && endDate.isNotEmpty) params['endDate'] = endDate;
    final r = await _api.get(ApiConfig.maintenanceRecords, params: params);
    return _parsePaginated(r, MaintenanceRecord.fromJson);
  }

  Future<MaintenanceRecord> create(
    String moldId,
    String type,
    String content,
    String recordDate,
  ) async {
    final r = await _api.post(ApiConfig.maintenanceRecords, {
      'moldId': int.tryParse(moldId) ?? moldId,
      'type': type,
      'content': content,
      'recordDate': recordDate,
    });
    return _parseData(r, MaintenanceRecord.fromJson);
  }

  Future<void> delete(String id) async {
    final r = await _api.delete(ApiConfig.maintenanceRecordDetail(id));
    final d = r.data;
    if (d is Map && d['code'] != 0 && d['code'] != 200) {
      throw Exception(d['message'] ?? 'Error');
    }
  }

  T _parseData<T>(Response r, T Function(Map<String, dynamic>) fromJson) {
    final d = _parseRaw(r);
    return fromJson(d as Map<String, dynamic>? ?? {});
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
