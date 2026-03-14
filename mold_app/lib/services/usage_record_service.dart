import 'package:dio/dio.dart';
import '../config/api.dart';
import '../models/pagination.dart';
import '../models/usage_record.dart';
import 'api_client.dart';

class UsageRecordService {
  UsageRecordService._();
  static final UsageRecordService _instance = UsageRecordService._();
  static UsageRecordService get instance => _instance;

  final _api = ApiClient.instance;

  Future<PaginatedResponse<UsageRecord>> getList(
    int page,
    int pageSize, {
    String? moldId,
    String? operatorId,
    String? startDate,
    String? endDate,
  }) async {
    final params = <String, dynamic>{'page': page, 'pageSize': pageSize};
    if (moldId != null && moldId.isNotEmpty) params['moldId'] = moldId;
    if (operatorId != null && operatorId.isNotEmpty) params['operatorId'] = operatorId;
    if (startDate != null && startDate.isNotEmpty) params['startDate'] = startDate;
    if (endDate != null && endDate.isNotEmpty) params['endDate'] = endDate;
    final r = await _api.get(ApiConfig.usageRecords, params: params);
    return _parsePaginated(r, UsageRecord.fromJson);
  }

  Future<UsageRecord> create(
    String moldId,
    String product,
    int quantity,
    String shift,
    String recordDate, {
    String? note,
  }) async {
    final r = await _api.post(ApiConfig.usageRecords, {
      'moldId': int.tryParse(moldId) ?? moldId,
      'product': product,
      'quantity': quantity,
      'shift': shift,
      'recordDate': recordDate,
      if (note != null && note.isNotEmpty) 'note': note,
    });
    return _parseData(r, UsageRecord.fromJson);
  }

  Future<void> delete(String id) async {
    final r = await _api.delete(ApiConfig.usageRecordDetail(id));
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
