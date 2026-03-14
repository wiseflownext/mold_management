import 'package:dio/dio.dart';
import '../config/api.dart';
import '../models/reminder.dart';
import 'api_client.dart';

class ReminderService {
  ReminderService._();
  static final ReminderService _instance = ReminderService._();
  static ReminderService get instance => _instance;

  final _api = ApiClient.instance;

  Future<List<MaintenanceAlert>> getAlerts() async {
    final r = await _api.get(ApiConfig.remindersAlerts);
    final d = _parseRaw(r);
    final list = d is List ? d : (d is Map ? d['items'] ?? d['list'] : null) ?? [];
    return (list as List)
        .map((e) => MaintenanceAlert.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<ReminderSetting>> getSettings() async {
    final r = await _api.get(ApiConfig.remindersSettings);
    final d = _parseRaw(r);
    final list = d is List ? d : (d is Map ? d['items'] ?? d['list'] : null) ?? [];
    return (list as List)
        .map((e) => ReminderSetting.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> updateSetting(String id, Map<String, dynamic> data) async {
    await _api.put(ApiConfig.reminderSettingDetail(int.tryParse(id) ?? 0), data);
  }

  dynamic _parseRaw(Response r) {
    final d = r.data;
    if (d is Map && (d['code'] == 0 || d['code'] == 200)) return d['data'];
    throw Exception(d is Map ? (d['message'] ?? 'Error') : 'Error');
  }
}
