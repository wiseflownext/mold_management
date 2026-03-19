import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/notification.dart';
import '../../providers/notification_provider.dart';
import '../../services/notification_service.dart';
import '../../widgets/empty_state.dart';

class NotificationListPage extends ConsumerStatefulWidget {
  const NotificationListPage({super.key});

  @override
  ConsumerState<NotificationListPage> createState() => _State();
}

class _State extends ConsumerState<NotificationListPage> {
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.invalidate(notificationListProvider));
  }

  Future<void> _markAllRead() async {
    await NotificationService.instance.markAllRead();
    ref.invalidate(notificationListProvider);
    ref.invalidate(unreadCountProvider);
  }

  Future<void> _markRead(AppNotification n) async {
    if (n.isRead) return;
    await NotificationService.instance.markRead(n.id);
    ref.invalidate(notificationListProvider);
    ref.invalidate(unreadCountProvider);
  }

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    final async = ref.watch(notificationListProvider(NotificationListParams()));

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.only(top: top),
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Color(0xFF1A73E8), Color(0xFF1557C0)]),
            ),
            child: SizedBox(
              height: 56,
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: Container(
                      margin: const EdgeInsets.only(left: 16),
                      width: 36, height: 36,
                      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle),
                      child: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(child: Text('通知中心', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600))),
                  GestureDetector(
                    onTap: _markAllRead,
                    child: const Padding(
                      padding: EdgeInsets.only(right: 16),
                      child: Text('全部已读', style: TextStyle(color: Colors.white, fontSize: 14)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                _TabChip(label: '全部', selected: _tab == 0, onTap: () => setState(() => _tab = 0)),
                const SizedBox(width: 8),
                _TabChip(label: '未读', selected: _tab == 1, onTap: () => setState(() => _tab = 1)),
              ],
            ),
          ),
          Expanded(
            child: async.when(
              data: (result) {
                final list = result.items;
                final filtered = _tab == 1 ? list.where((n) => !n.isRead).toList() : list;
                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(notificationListProvider);
                    ref.invalidate(unreadCountProvider);
                  },
                  child: filtered.isEmpty
                      ? ListView(children: const [EmptyState(message: '暂无通知')])
                      : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filtered.length,
                    itemBuilder: (_, i) => _NotificationCard(
                      notification: filtered[i],
                      onTap: () {
                        _markRead(filtered[i]);
                        if (filtered[i].moldId != null) {
                          context.push('/molds/${filtered[i].moldId}');
                        }
                      },
                    ),
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => EmptyState(message: e.toString()),
            ),
          ),
        ],
      ),
    );
  }
}

class _TabChip extends StatelessWidget {
  const _TabChip({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF1A73E8) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: selected ? const Color(0xFF1A73E8) : const Color(0xFFD1D5DB)),
        ),
        child: Text(label, style: TextStyle(fontSize: 13, color: selected ? Colors.white : const Color(0xFF6B7280))),
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({required this.notification, required this.onTap});
  final AppNotification notification;
  final VoidCallback onTap;

  static const _typeConfig = {
    'MAINTENANCE_OVERDUE': (Color(0xFFEF4444), Icons.error_outline),
    'MAINTENANCE_SOON': (Color(0xFFF59E0B), Icons.warning_amber_rounded),
    'STATUS_CHANGE': (Color(0xFF1A73E8), Icons.swap_horiz),
    'USAGE_RECORD': (Color(0xFF22C55E), Icons.add_chart),
    'LIFE_EXCEEDED': (Color(0xFFDC2626), Icons.dangerous_outlined),
    'LIFE_WARNING': (Color(0xFFF97316), Icons.timer_outlined),
  };

  @override
  Widget build(BuildContext context) {
    final config = _typeConfig[notification.type] ?? (const Color(0xFF6B7280), Icons.notifications);
    final (color, icon) = config;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: notification.isRead ? Colors.white : const Color(0xFFF0F7FF),
          borderRadius: BorderRadius.circular(14),
          boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 6)],
        ),
        child: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(notification.title, style: TextStyle(fontSize: 14, fontWeight: notification.isRead ? FontWeight.w400 : FontWeight.w600, color: const Color(0xFF1F2937)), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ),
                      if (!notification.isRead)
                        Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFF1A73E8), shape: BoxShape.circle)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(notification.message, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)), maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Text(_timeAgo(notification.createdAt), style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                ],
              ),
            ),
            if (notification.moldId != null)
              const Icon(Icons.chevron_right, color: Color(0xFF9CA3AF), size: 20),
          ],
        ),
      ),
    );
  }

  String _timeAgo(DateTime? dt) {
    if (dt == null) return '';
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return '刚刚';
    if (diff.inHours < 1) return '${diff.inMinutes}分钟前';
    if (diff.inDays < 1) return '${diff.inHours}小时前';
    if (diff.inDays < 30) return '${diff.inDays}天前';
    return '${dt.month}/${dt.day}';
  }
}
