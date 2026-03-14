import 'package:dio/dio.dart';
import '../config/api.dart';
import '../models/pagination.dart';
import '../models/user.dart';
import 'api_client.dart';

class UserService {
  UserService._();
  static final UserService _instance = UserService._();
  static UserService get instance => _instance;

  final _api = ApiClient.instance;

  Future<User> getProfile() async {
    final r = await _api.get(ApiConfig.usersProfile);
    return _parseData(r, User.fromJson);
  }

  Future<PaginatedResponse<User>> getList(
    int page,
    int pageSize, {
    String? keyword,
  }) async {
    final params = <String, dynamic>{'page': page, 'pageSize': pageSize};
    if (keyword != null && keyword.isNotEmpty) params['keyword'] = keyword;
    final r = await _api.get(ApiConfig.users, params: params);
    return _parsePaginated(r, User.fromJson);
  }

  Future<User> create(Map<String, dynamic> data) async {
    final r = await _api.post(ApiConfig.users, data);
    return _parseData(r, User.fromJson);
  }

  Future<User> update(String id, Map<String, dynamic> data) async {
    final r = await _api.put(ApiConfig.userDetail(int.tryParse(id) ?? 0), data);
    return _parseData(r, User.fromJson);
  }

  Future<void> delete(String id) async {
    await _api.delete(ApiConfig.userDetail(int.tryParse(id) ?? 0));
  }

  Future<void> resetPassword(String id, String newPassword) async {
    await _api.put(ApiConfig.userResetPassword(int.tryParse(id) ?? 0), {'newPassword': newPassword});
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
