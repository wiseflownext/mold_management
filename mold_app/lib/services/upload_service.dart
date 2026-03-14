import 'dart:io';
import 'package:dio/dio.dart';
import '../config/api.dart';
import 'api_client.dart';

class UploadService {
  UploadService._();
  static final UploadService _instance = UploadService._();
  static UploadService get instance => _instance;

  final _api = ApiClient.instance;

  Future<String> uploadImage(File file) async {
    final name = file.path.split(Platform.pathSeparator).last;
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path, filename: name),
    });
    final r = await _api.post(ApiConfig.upload, formData);
    final d = r.data;
    if (d is Map && (d['code'] == 0 || d['code'] == 200)) {
      final data = d['data'];
      if (data is String) return data;
      if (data is Map) return (data['url'] ?? data['path'] ?? '') as String;
    }
    throw Exception('Upload failed');
  }
}
