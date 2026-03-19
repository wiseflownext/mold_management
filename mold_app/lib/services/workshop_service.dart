import 'package:dio/dio.dart';
import '../config/api.dart';
import '../models/workshop.dart';
import 'api_client.dart';

class WorkshopService {
  WorkshopService._();
  static final WorkshopService _instance = WorkshopService._();
  static WorkshopService get instance => _instance;

  final _api = ApiClient.instance;

  Future<List<Workshop>> getList() async {
    final r = await _api.get(ApiConfig.workshops);
    final d = _parseRaw(r);
    final list = d is List ? d : (d is Map ? d['items'] ?? d['list'] : null) ?? [];
    return (list as List)
        .map((e) => Workshop.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Workshop> create(String name) async {
    final r = await _api.post(ApiConfig.workshops, {'name': name});
    return _parseData(r, Workshop.fromJson);
  }

  Future<Workshop> update(String id, String name) async {
    final r = await _api.put(ApiConfig.workshopDetail(int.tryParse(id) ?? 0), {'name': name});
    return _parseData(r, Workshop.fromJson);
  }

  Future<void> delete(String id) async {
    await _api.delete(ApiConfig.workshopDetail(int.tryParse(id) ?? 0));
  }

  T _parseData<T>(Response r, T Function(Map<String, dynamic>) fromJson) {
    final d = _parseRaw(r);
    return fromJson(d as Map<String, dynamic>? ?? {});
  }

  dynamic _parseRaw(Response r) {
    final d = r.data;
    if (d is Map && (d['code'] == 0 || d['code'] == 200)) return d['data'];
    throw Exception(d is Map ? (d['message'] ?? 'Error') : 'Error');
  }
}
