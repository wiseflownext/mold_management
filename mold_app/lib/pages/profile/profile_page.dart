import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../config/theme.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    final user = auth.user;

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final isAdmin = user.role == 'admin';
    final initial = user.name.isNotEmpty
        ? user.name[0]
        : (user.username.isNotEmpty ? user.username[0] : '?');

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeader(context, initial, user.name, isAdmin, user.workshop, user.companyName),
            const SizedBox(height: 16),
            _buildMenuCard(context, isAdmin),
            const SizedBox(height: 16),
            _buildLogoutButton(context, ref),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    String initial,
    String name,
    bool isAdmin,
    String? workshop,
    String? companyName,
  ) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 24,
        bottom: 28,
        left: 20,
        right: 20,
      ),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1A73E8), Color(0xFF4A9AF5)],
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              initial,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A73E8),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        isAdmin ? '管理员' : '操作员',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    if (workshop != null && workshop.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      Text(
                        workshop,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white.withValues(alpha: 0.7),
                        ),
                      ),
                    ],
                    if (companyName != null && companyName.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          companyName,
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuCard(BuildContext context, bool isAdmin) {
    final items = <_MenuItemData>[
      _MenuItemData(
        icon: Icons.assignment_outlined,
        title: '我的使用记录',
        iconColor: const Color(0xFF1A73E8),
        iconBg: const Color(0xFFEFF6FF),
        path: '/my-records',
      ),
      if (isAdmin)
        _MenuItemData(
          icon: Icons.insert_chart_outlined,
          title: '数据报表导出',
          iconColor: const Color(0xFFDC2626),
          iconBg: const Color(0xFFFEF2F2),
          path: '/data-report',
          badge: '管理员',
        ),
      if (isAdmin)
        _MenuItemData(
          icon: Icons.people_outline,
          title: '员工管理',
          iconColor: const Color(0xFF7C3AED),
          iconBg: const Color(0xFFF5F3FF),
          path: '/employee-management',
        ),
      if (isAdmin)
        _MenuItemData(
          icon: Icons.business_outlined,
          title: '车间管理',
          iconColor: const Color(0xFF0891B2),
          iconBg: const Color(0xFFECFEFF),
          path: '/workshop-management',
        ),
      if (isAdmin)
        _MenuItemData(
          icon: Icons.notifications_outlined,
          title: '维保提醒设置',
          iconColor: const Color(0xFFD97706),
          iconBg: const Color(0xFFFFF7ED),
          path: '/reminder-settings',
        ),
      if (isAdmin)
        _MenuItemData(
          icon: Icons.history,
          title: '操作日志',
          iconColor: const Color(0xFF475569),
          iconBg: const Color(0xFFF1F5F9),
          path: '/audit-logs',
        ),
      _MenuItemData(
        icon: Icons.lock_outline,
        title: '修改密码',
        iconColor: const Color(0xFF6B7280),
        iconBg: const Color(0xFFF3F4F6),
        path: '/change-password',
      ),
      _MenuItemData(
        icon: Icons.settings_outlined,
        title: '系统设置',
        iconColor: const Color(0xFF6B7280),
        iconBg: const Color(0xFFF3F4F6),
        path: '/settings',
      ),
      _MenuItemData(
        icon: Icons.info_outline,
        title: '关于',
        iconColor: const Color(0xFF6B7280),
        iconBg: const Color(0xFFF3F4F6),
        path: '/about',
      ),
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(color: Color(0x0F000000), blurRadius: 6),
        ],
      ),
      child: Column(
        children: List.generate(items.length, (i) {
          final item = items[i];
          return Column(
            children: [
              if (i > 0)
                const Divider(height: 1, indent: 62, endIndent: 16),
              InkWell(
                onTap: () => context.push(item.path),
                borderRadius: BorderRadius.vertical(
                  top: i == 0 ? const Radius.circular(14) : Radius.zero,
                  bottom: i == items.length - 1
                      ? const Radius.circular(14)
                      : Radius.zero,
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: item.iconBg,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        alignment: Alignment.center,
                        child: Icon(item.icon, size: 20, color: item.iconColor),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          item.title,
                          style: const TextStyle(
                            fontSize: 15,
                            color: Color(0xFF111827),
                          ),
                        ),
                      ),
                      if (item.badge != null) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDC2626).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Text(
                            '管理员',
                            style: TextStyle(
                              fontSize: 11,
                              color: Color(0xFFDC2626),
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                      ],
                      const Icon(
                        Icons.chevron_right,
                        size: 20,
                        color: Color(0xFFD1D5DB),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(color: Color(0x0F000000), blurRadius: 6),
        ],
      ),
      child: InkWell(
        onTap: () async {
          await ref.read(authStateProvider.notifier).logout();
          if (context.mounted) context.go('/login');
        },
        borderRadius: BorderRadius.circular(14),
        child: const SizedBox(
          width: double.infinity,
          height: 50,
          child: Center(
            child: Text(
              '退出登录',
              style: TextStyle(
                fontSize: 15,
                color: Color(0xFFDC2626),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MenuItemData {
  final IconData icon;
  final String title;
  final Color iconColor;
  final Color iconBg;
  final String path;
  final String? badge;

  const _MenuItemData({
    required this.icon,
    required this.title,
    required this.iconColor,
    required this.iconBg,
    required this.path,
    this.badge,
  });
}
