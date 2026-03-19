import '../config/api.dart';
import '../models/mold.dart';
import '../models/reminder.dart' show MaintenanceAlert;
import 'api_client.dart';

class DashboardData {
  final MoldStatistics statistics;
  final TodaySummary todaySummary;
  final List<MaintenanceAlert> alerts;
  final int unreadCount;

  DashboardData({required this.statistics, required this.todaySummary, required this.alerts, required this.unreadCount});

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    final statsJson = json['statistics'] as Map<String, dynamic>? ?? {};
    final summaryJson = json['todaySummary'] as Map<String, dynamic>? ?? {};
    final alertsJson = json['alerts'] as List? ?? [];
    return DashboardData(
      statistics: MoldStatistics.fromJson(statsJson),
      todaySummary: TodaySummary.fromJson(summaryJson),
      alerts: alertsJson.map((e) => MaintenanceAlert.fromJson(e as Map<String, dynamic>)).toList(),
      unreadCount: (json['unreadCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class HomeService {
  HomeService._();
  static final HomeService _instance = HomeService._();
  static HomeService get instance => _instance;

  final _api = ApiClient.instance;

  Future<DashboardData> getDashboard() async {
    final r = await _api.get(ApiConfig.homeDashboard);
    final d = r.data;
    if (d is Map && (d['code'] == 0 || d['code'] == 200)) {
      return DashboardData.fromJson((d['data'] as Map<String, dynamic>?) ?? {});
    }
    throw Exception(d is Map ? (d['message'] ?? 'Error') : 'Error');
  }
}
