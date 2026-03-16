import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../providers/mold_provider.dart';
import '../../providers/refresh.dart';
import '../../services/home_service.dart';
import '../../models/reminder.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    final user = auth.user;
    final name =
        user != null && user.name.isNotEmpty ? user.name : (user?.username ?? '');
    final roleLabel =
        user?.role == 'admin' ? Role.admin.label : Role.operator.label;
    final now = DateTime.now();
    final weeks = ['一', '二', '三', '四', '五', '六', '日'];
    final dateStr = '${now.month}月${now.day}日 周${weeks[now.weekday - 1]}';
    final dashboard = ref.watch(dashboardProvider);
    final unreadCount = dashboard.whenOrNull(data: (d) => d.unreadCount) ?? 0;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: RefreshIndicator(
        onRefresh: () async => refreshAll(ref),
        child: ListView(
          padding: EdgeInsets.zero,
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            _HeaderSection(
              name: name,
              roleLabel: roleLabel,
              dateStr: dateStr,
              unreadCount: unreadCount,
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              child: Column(
                children: [
                  _buildQuickActions(context),
                  const SizedBox(height: 20),
                  _StatusGrid(),
                  const SizedBox(height: 20),
                  _ReminderCard(),
                  const SizedBox(height: 20),
                  _TodayCard(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _buildQuickActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ActionBtn(
            title: '新增使用记录',
            icon: Icons.add_chart,
            colors: const [Color(0xFF1A73E8), Color(0xFF1557C0)],
            onTap: () => context.go('/add-usage'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ActionBtn(
            title: '新增维保记录',
            icon: Icons.build_outlined,
            colors: const [Color(0xFFF97316), Color(0xFFEA580C)],
            onTap: () => context.push('/add-maintenance'),
          ),
        ),
      ],
    );
  }
}

class _HeaderSection extends StatelessWidget {
  const _HeaderSection({
    required this.name,
    required this.roleLabel,
    required this.dateStr,
    required this.unreadCount,
  });

  final String name;
  final String roleLabel;
  final String dateStr;
  final int unreadCount;

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    return Container(
      padding: EdgeInsets.fromLTRB(20, top + 16, 16, 20),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1A73E8), Color(0xFF1557C0)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        '你好，$name',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        roleLabel,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  dateStr,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),
          Stack(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  padding: EdgeInsets.zero,
                  onPressed: () => GoRouter.of(context).push('/notifications'),
                  icon: const Icon(
                    Icons.notifications_outlined,
                    color: Colors.white,
                    size: 22,
                  ),
                ),
              ),
              if (unreadCount > 0)
                Positioned(
                  right: 2,
                  top: 2,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Color(0xFFEF4444),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  const _ActionBtn({
    required this.title,
    required this.icon,
    required this.colors,
    required this.onTap,
  });

  final String title;
  final IconData icon;
  final List<Color> colors;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: colors.first.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, color: Colors.white, size: 32),
                const SizedBox(height: 12),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatusGrid extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(dashboardProvider).when(
          data: (d) {
            final s = d.statistics;
            return Column(
            children: [
              Row(
                children: [
                  Expanded(child: _statusTile(context, '在用', s.inUse, const Color(0xFFA7F3D0))),
                  const SizedBox(width: 12),
                  Expanded(child: _statusTile(context, '维修中', s.repairing, const Color(0xFFFDE68A))),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _statusTile(context, '停用', s.stopped, const Color(0xFFE5E7EB))),
                  const SizedBox(width: 12),
                  Expanded(child: _statusTile(context, '报废', s.scrapped, const Color(0xFFFECACA))),
                ],
              ),
            ],
          );
          },
          loading: () => const _LoadingCard(height: 140),
          error: (_, __) => const SizedBox.shrink(),
        );
  }

  Widget _statusTile(BuildContext context, String label, int count, Color barColor) {
    return GestureDetector(
      onTap: () => context.go('/molds'),
      child: Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(color: Color(0x0F000000), blurRadius: 6),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 40,
            decoration: BoxDecoration(
              color: barColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$count',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF111827),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF6B7280),
                ),
              ),
            ],
          ),
        ],
      ),
    ));
  }
}

class _ReminderCard extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(dashboardProvider).when(
          data: (d) {
            final alerts = d.alerts;
            if (alerts.isEmpty) return const SizedBox.shrink();
            return GestureDetector(
              onTap: () => context.go('/reminders'),
              child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                boxShadow: const [
                  BoxShadow(color: Color(0x0F000000), blurRadius: 6),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded,
                          color: Color(0xFFF59E0B), size: 20),
                      const SizedBox(width: 6),
                      const Text(
                        '维保提醒',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF111827),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 1),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '${alerts.length}',
                          style: const TextStyle(
                              fontSize: 12, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  ...alerts.take(5).map((a) => _alertItem(a)),
                ],
              ),
            ));
          },
          loading: () => const _LoadingCard(height: 160),
          error: (_, __) => const SizedBox.shrink(),
        );
  }

  Widget _alertItem(MaintenanceAlert a) {
    final cycle = a.maintenanceCycle ?? 1;
    final remaining = a.remainingUses ?? 0;
    final progress = cycle > 0 ? ((cycle - remaining) / cycle).clamp(0.0, 1.0) : 1.0;
    final color = _urgencyColor(a);
    final productInfo = a.productName?.isNotEmpty == true ? ' · ${a.productName}' : '';

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '${a.moldNumber}$productInfo',
                  style: const TextStyle(fontSize: 14, color: Color(0xFF111827)),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(4)),
                child: Text(
                  remaining <= 0 ? '已逾期${-remaining}次' : '剩余${remaining}次',
                  style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Stack(children: [
            Container(height: 6, decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(3))),
            FractionallySizedBox(
              widthFactor: progress.clamp(0.0, 1.0),
              child: Container(
                height: 6,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [color.withValues(alpha: 0.6), color]),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
          ]),
          if (a.periodicMaintenanceDays != null && a.periodicMaintenanceDays! > 0) ...[
            const SizedBox(height: 4),
            Text(
              (a.periodicRemaining ?? 0) <= 0
                  ? '定期保养已超 ${-(a.periodicRemaining ?? 0)} 天'
                  : '定期保养剩 ${a.periodicRemaining} 天',
              style: TextStyle(
                fontSize: 11,
                color: (a.periodicRemaining ?? 0) <= 0 ? const Color(0xFFEF4444) : const Color(0xFF6B7280),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Color _urgencyColor(MaintenanceAlert a) {
    if (a.isOverdue == true) return const Color(0xFFEF4444);
    return switch (a.urgencyLevel) {
      'CRITICAL' => const Color(0xFFF59E0B),
      'WARNING' => const Color(0xFFEAB308),
      _ => const Color(0xFF22C55E),
    };
  }
}

class _TodayCard extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(dashboardProvider).when(
          data: (d) {
            final s = d.todaySummary;
            return GestureDetector(
            onTap: () => GoRouter.of(context).push('/today-detail'),
            child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: const [
                BoxShadow(color: Color(0x0F000000), blurRadius: 6),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      '今日概览',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF111827),
                      ),
                    ),
                    const Spacer(),
                    const Icon(Icons.chevron_right, color: Color(0xFF9CA3AF), size: 20),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _item('${s.usageRecordCount}', '使用记录'),
                    _item('${s.totalQuantity}', '生产总量'),
                    _item('${s.activeMoldCount}', '活跃模具'),
                  ],
                ),
              ],
            ),
          ));
          },
          loading: () => const _LoadingCard(height: 110),
          error: (_, __) => const SizedBox.shrink(),
        );
  }

  Widget _item(String value, String label) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1A73E8),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
          ),
        ],
      ),
    );
  }
}

class _LoadingCard extends StatelessWidget {
  const _LoadingCard({required this.height});
  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(color: Color(0x0F000000), blurRadius: 6),
        ],
      ),
      child: const Center(
        child: CircularProgressIndicator(strokeWidth: 2),
      ),
    );
  }
}
