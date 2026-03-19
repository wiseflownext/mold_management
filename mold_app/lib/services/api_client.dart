import 'package:dio/dio.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api.dart';

class ApiClient {
  ApiClient._();
  static final ApiClient _instance = ApiClient._();
  static ApiClient get instance => _instance;

  static const _accessKey = 'access_token';
  static const _refreshKey = 'refresh_token';

  late final Dio _dio;
  void Function()? onUnauthorized;

  void init() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: ApiConfig.timeout,
      receiveTimeout: ApiConfig.timeout,
    ));
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: _onRequest,
      onError: _onError,
    ));
  }

  Dio get dio => _dio;

  Future<void> _onRequest(RequestOptions opts, RequestInterceptorHandler h) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_accessKey);
    if (token != null && token.isNotEmpty) {
      opts.headers['Authorization'] = 'Bearer $token';
    }
    h.next(opts);
  }

  Future<void> _onError(DioException err, ErrorInterceptorHandler h) async {
    if (err.response?.statusCode == 401) {
      final opts = err.requestOptions;
      if (opts.extra['_retry'] == true) {
        _clearTokens();
        onUnauthorized?.call();
        h.next(err);
        return;
      }
      try {
        final newToken = await _refreshToken();
        if (newToken != null) {
          opts.headers['Authorization'] = 'Bearer $newToken';
          opts.extra['_retry'] = true;
          final r = await _dio.fetch(opts);
          h.resolve(Response(requestOptions: opts, data: r.data));
          return;
        }
      } catch (_) {}
      _clearTokens();
      onUnauthorized?.call();
      h.next(err);
      return;
    }

    _showErrorToast(err);
    h.next(err);
  }

  void _showErrorToast(DioException err) {
    String msg;
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        msg = '网络超时，请重试';
        break;
      case DioExceptionType.connectionError:
        msg = '网络连接失败';
        break;
      case DioExceptionType.badResponse:
        final data = err.response?.data;
        if (data is Map && data['message'] != null) {
          msg = '${data['message']}';
        } else {
          msg = '服务器错误 (${err.response?.statusCode})';
        }
        break;
      default:
        msg = '请求失败';
    }
    Fluttertoast.showToast(msg: msg);
  }

  Future<String?> _refreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    final refresh = prefs.getString(_refreshKey);
    if (refresh == null || refresh.isEmpty) return null;
    final r = await Dio().post(
      '${ApiConfig.baseUrl}${ApiConfig.authRefresh}',
      data: {'refreshToken': refresh},
    );
    final data = r.data;
    if (data is Map && (data['code'] == 0 || data['code'] == 200)) {
      final d = data['data'] as Map?;
      final access = d?['accessToken'] as String?;
      if (access != null) {
        await prefs.setString(_accessKey, access);
        final newRefresh = d?['refreshToken'] as String?;
        if (newRefresh != null) await prefs.setString(_refreshKey, newRefresh);
        return access;
      }
    }
    return null;
  }

  Future<void> _clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessKey);
    await prefs.remove(_refreshKey);
  }

  Future<Response> get(String path, {Map<String, dynamic>? params}) =>
      _dio.get(path, queryParameters: params);

  Future<Response> post(String path, [dynamic data]) =>
      _dio.post(path, data: data);

  Future<Response> put(String path, [dynamic data]) =>
      _dio.put(path, data: data);

  Future<Response> patch(String path, [dynamic data]) =>
      _dio.patch(path, data: data);

  Future<Response> delete(String path) => _dio.delete(path);

  Future<Response> download(String path, String savePath,
          {Map<String, dynamic>? params}) =>
      _dio.download(path, savePath, queryParameters: params);
}
