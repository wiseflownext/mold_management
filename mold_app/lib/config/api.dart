class ApiConfig {
  ApiConfig._();

  static const String baseUrl = 'http://121.40.172.33:8088/api';
  static const Duration timeout = Duration(seconds: 15);

  static const String authLogin = '/auth/login';
  static const String authRefresh = '/auth/refresh';
  static const String authChangePassword = '/auth/change-password';

  static const String molds = '/molds';
  static const String moldsStatistics = '/molds/statistics';
  static const String moldsTodaySummary = '/molds/today-summary';
  static String moldDetail(dynamic id) => '/molds/$id';
  static String moldDesignLife(dynamic id) => '/molds/$id/design-life';
  static String moldProducts(dynamic moldId) => '/molds/$moldId/products';
  static String moldProduct(dynamic productId) => '/molds/products/$productId';

  static const String usageRecords = '/usage-records';
  static String usageRecordDetail(dynamic id) => '/usage-records/$id';

  static const String maintenanceRecords = '/maintenance-records';
  static String maintenanceRecordDetail(dynamic id) => '/maintenance-records/$id';

  static const String notifications = '/notifications';
  static const String notificationsUnreadCount = '/notifications/unread-count';
  static String notificationRead(dynamic id) => '/notifications/$id/read';
  static const String notificationsReadAll = '/notifications/read-all';

  static const String remindersAlerts = '/reminders/alerts';
  static const String remindersSettings = '/reminders/settings';
  static String reminderSettingDetail(dynamic id) => '/reminders/settings/$id';

  static const String users = '/users';
  static const String usersProfile = '/users/profile';
  static String userDetail(dynamic id) => '/users/$id';
  static String userResetPassword(dynamic id) => '/users/$id/reset-password';

  static const String workshops = '/workshops';
  static String workshopDetail(dynamic id) => '/workshops/$id';

  static const String upload = '/upload';

  static const String reportsUsage = '/reports/usage';
  static const String reportsMaintenance = '/reports/maintenance';
  static const String reportsMoldLedger = '/reports/mold-ledger';
  static const String reportsStatistics = '/reports/statistics';

  static const String homeDashboard = '/home/dashboard';

  static const String auditLogs = '/audit-logs';
}
