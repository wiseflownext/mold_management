import 'package:dio/dio.dart';
import '../config/api.dart';
import 'api_client.dart';

class ReportService {
  ReportService._();
  static final ReportService _instance = ReportService._();
  static ReportService get instance => _instance;

  final _api = ApiClient.instance;

  Future<List<int>> downloadUsageCSV({String? startDate, String? endDate}) async {
    final params = <String, dynamic>{};
    if (startDate != null && startDate.isNotEmpty) params['startDate'] = startDate;
    if (endDate != null && endDate.isNotEmpty) params['endDate'] = endDate;
    final r = await _api.dio.get<List<int>>(
      ApiConfig.reportsUsage,
      queryParameters: params.isEmpty ? null : params,
      options: Options(responseType: ResponseType.bytes),
    );
    final d = r.data;
    if (d != null) return d;
    if (r.data is Map) {
      final m = r.data as Map;
      if (m['code'] == 200 && m['data'] != null) {
        final data = m['data'];
        if (data is List<int>) return data;
      }
    }
    return [];
  }

  Future<List<int>> downloadMaintenanceCSV({String? startDate, String? endDate}) async {
    final params = <String, dynamic>{};
    if (startDate != null && startDate.isNotEmpty) params['startDate'] = startDate;
    if (endDate != null && endDate.isNotEmpty) params['endDate'] = endDate;
    final r = await _api.dio.get<List<int>>(
      ApiConfig.reportsMaintenance,
      queryParameters: params.isEmpty ? null : params,
      options: Options(responseType: ResponseType.bytes),
    );
    final d = r.data;
    if (d != null) return d;
    if (r.data is Map) {
      final m = r.data as Map;
      if (m['code'] == 200 && m['data'] != null) {
        final data = m['data'];
        if (data is List<int>) return data;
      }
    }
    return [];
  }

  Future<List<int>> downloadMoldLedgerCSV() async {
    final r = await _api.dio.get<List<int>>(
      ApiConfig.reportsMoldLedger,
      options: Options(responseType: ResponseType.bytes),
    );
    return r.data ?? [];
  }

  Future<Map<String, dynamic>> getStatistics({String? startDate, String? endDate}) async {
    final params = <String, dynamic>{};
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;
    final r = await _api.get(ApiConfig.reportsStatistics, params: params);
    final d = r.data;
    if (d is Map && (d['code'] == 0 || d['code'] == 200)) {
      return (d['data'] as Map<String, dynamic>?) ?? {};
    }
    return {};
  }
}
