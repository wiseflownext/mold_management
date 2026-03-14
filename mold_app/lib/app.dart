import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'pages/shell/app_shell.dart';
import 'pages/login/login_page.dart';
import 'pages/home/home_page.dart';
import 'pages/mold/mold_list_page.dart';
import 'pages/usage_record/add_usage_page.dart';
import 'pages/reminder/reminder_list_page.dart';
import 'pages/profile/profile_page.dart';
import 'pages/mold/mold_detail_page.dart';
import 'pages/mold/add_mold_page.dart';
import 'pages/maintenance/add_maintenance_page.dart';
import 'pages/usage_record/my_records_page.dart';
import 'pages/reminder/reminder_settings_page.dart';
import 'pages/profile/employee_management_page.dart';
import 'pages/profile/workshop_management_page.dart';
import 'pages/profile/data_report_page.dart';
import 'pages/profile/change_password_page.dart';
import 'pages/profile/settings_page.dart';
import 'pages/profile/about_page.dart';
import 'pages/notification/notification_list_page.dart';
import 'pages/profile/audit_log_page.dart';
import 'pages/home/today_detail_page.dart';

class _AuthNotifier extends ChangeNotifier {
  _AuthNotifier(this._ref) {
    _ref.listen(authStateProvider, (_, __) => notifyListeners());
  }
  final Ref _ref;
}

final _routerProvider = Provider<GoRouter>((ref) {
  final notifier = _AuthNotifier(ref);
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: notifier,
    redirect: (context, state) {
      final auth = ref.read(authStateProvider);
      if (auth.isLoading) return null;
      final loggedIn = auth.user != null;
      final atLogin = state.matchedLocation == '/login';
      if (!loggedIn && !atLogin) return '/login';
      if (loggedIn && atLogin) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => AppShell(navigationShell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: '/home', builder: (_, __) => const HomePage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/molds', builder: (_, __) => const MoldListPage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/add-usage', builder: (_, __) => const AddUsagePage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/reminders', builder: (_, __) => const ReminderListPage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/profile', builder: (_, __) => const ProfilePage()),
          ]),
        ],
      ),
      GoRoute(path: '/molds/:id', builder: (c, s) => MoldDetailPage(id: s.pathParameters['id']!)),
      GoRoute(path: '/add-mold', builder: (_, __) => const AddMoldPage()),
      GoRoute(path: '/add-usage-for', builder: (c, s) => AddUsagePage(moldId: s.uri.queryParameters['moldId'])),
      GoRoute(path: '/add-maintenance', builder: (c, s) => AddMaintenancePage(moldId: s.uri.queryParameters['moldId'])),
      GoRoute(path: '/my-records', builder: (_, __) => const MyRecordsPage()),
      GoRoute(path: '/reminder-settings', builder: (_, __) => const ReminderSettingsPage()),
      GoRoute(path: '/employee-management', builder: (_, __) => const EmployeeManagementPage()),
      GoRoute(path: '/workshop-management', builder: (_, __) => const WorkshopManagementPage()),
      GoRoute(path: '/data-report', builder: (_, __) => const DataReportPage()),
      GoRoute(path: '/change-password', builder: (_, __) => const ChangePasswordPage()),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsPage()),
      GoRoute(path: '/about', builder: (_, __) => const AboutPage()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationListPage()),
      GoRoute(path: '/audit-logs', builder: (_, __) => const AuditLogPage()),
      GoRoute(path: '/today-detail', builder: (_, __) => const TodayDetailPage()),
    ],
  );
});

class MoldApp extends ConsumerWidget {
  const MoldApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: '模具管理',
      theme: AppTheme.light,
      locale: const Locale('zh', 'CN'),
      supportedLocales: const [Locale('zh', 'CN')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: ref.watch(_routerProvider),
      debugShowCheckedModeBanner: false,
    );
  }
}
