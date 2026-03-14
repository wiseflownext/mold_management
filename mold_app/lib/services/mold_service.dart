import 'package:dio/dio.dart';
import '../config/api.dart';
import '../models/mold.dart';
import '../models/pagination.dart';
import 'api_client.dart';

class MoldService {
  MoldService._();
  static final MoldService _instance = MoldService._();
  static MoldService get instance => _instance;

  final _api = ApiClient.instance;

  Future<PaginatedResponse<Mold>> getList(
    int page,
    int pageSize, {
    String? keyword,
    String? type,
    String? status,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'pageSize': pageSize,
    };
    if (keyword != null && keyword.isNotEmpty) params['keyword'] = keyword;
    if (type != null && type.isNotEmpty) params['type'] = type;
    if (status != null && status.isNotEmpty) params['status'] = status;
    final r = await _api.get(ApiConfig.molds, params: params);
    return _parsePaginated(r, Mold.fromJson);
  }

  Future<Mold> getDetail(String id) async {
    final r = await _api.get(ApiConfig.moldDetail(int.tryParse(id) ?? 0));
    return _parseData(r, Mold.fromJson);
  }

  Future<Mold> create(Map<String, dynamic> data) async {
    final r = await _api.post(ApiConfig.molds, data);
    return _parseData(r, Mold.fromJson);
  }

  Future<Mold> update(String id, Map<String, dynamic> data) async {
    final r = await _api.put(ApiConfig.moldDetail(int.tryParse(id) ?? 0), data);
    return _parseData(r, Mold.fromJson);
  }

  Future<void> delete(String id) async {
    await _api.delete(ApiConfig.moldDetail(int.tryParse(id) ?? 0));
  }

  Future<MoldStatistics> getStatistics() async {
    final r = await _api.get(ApiConfig.moldsStatistics);
    return _parseData(r, MoldStatistics.fromJson);
  }

  Future<TodaySummary> getTodaySummary() async {
    final r = await _api.get(ApiConfig.moldsTodaySummary);
    return _parseData(r, TodaySummary.fromJson);
  }

  Future<void> updateDesignLife(
    String id,
    int newDesignLife,
    String reportUrl,
  ) async {
    await _api.put(ApiConfig.moldDesignLife(int.tryParse(id) ?? 0), {
      'newDesignLife': newDesignLife,
      'reportUrl': reportUrl,
    });
  }

  Future<MoldProduct> addProduct(String moldId, Map<String, dynamic> data) async {
    final r = await _api.post(
      ApiConfig.moldProducts(int.tryParse(moldId) ?? 0),
      data,
    );
    return _parseData(r, MoldProduct.fromJson);
  }

  Future<void> removeProduct(String productId) async {
    await _api.delete(ApiConfig.moldProduct(int.tryParse(productId) ?? 0));
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
    final m = d as Map<String, dynamic>? ?? {};
    return PaginatedResponse.fromJson(m, fromJson);
  }

  dynamic _parseRaw(Response r) {
    final d = r.data;
    if (d is Map && (d['code'] == 0 || d['code'] == 200)) return d['data'];
    throw Exception(d is Map ? (d['message'] ?? 'Error') : 'Error');
  }
}
