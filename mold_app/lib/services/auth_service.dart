import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api.dart';
import '../models/user.dart';
import 'api_client.dart';

class AuthService {
  AuthService._();
  static final AuthService _instance = AuthService._();
  static AuthService get instance => _instance;

  static const _userKey = 'user';
  static const _accessKey = 'access_token';
  static const _refreshKey = 'refresh_token';

  final _api = ApiClient.instance;

  Future<LoginResponse> login(String username, String password) async {
    final r = await _api.post(ApiConfig.authLogin, {
      'username': username,
      'password': password,
    });
    final res = _parseData(r, LoginResponse.fromJson);
    await saveTokens(res.accessToken, res.refreshToken);
    await saveUser(res.user);
    return res;
  }

  Future<String?> refresh() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString(_refreshKey);
    if (refreshToken == null) return null;
    final r = await _api.post(ApiConfig.authRefresh, {
      'refreshToken': refreshToken,
    });
    final data = _parseRaw(r);
    final access = data?['accessToken'] as String?;
    final newRefresh = data?['refreshToken'] as String?;
    if (access != null) {
      await prefs.setString(_accessKey, access);
      if (newRefresh != null) await prefs.setString(_refreshKey, newRefresh);
    }
    return access;
  }

  Future<void> changePassword(String oldPassword, String newPassword) async {
    await _api.post(ApiConfig.authChangePassword, {
      'oldPassword': oldPassword,
      'newPassword': newPassword,
    });
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessKey);
    await prefs.remove(_refreshKey);
    await prefs.remove(_userKey);
  }

  Future<User?> getStoredUser() async {
    final prefs = await SharedPreferences.getInstance();
    final s = prefs.getString(_userKey);
    if (s == null) return null;
    try {
      return User.fromJson(
        Map<String, dynamic>.from(jsonDecode(s) as Map),
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  Future<void> saveTokens(String access, String refresh) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessKey, access);
    await prefs.setString(_refreshKey, refresh);
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_accessKey)?.isNotEmpty ?? false;
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
