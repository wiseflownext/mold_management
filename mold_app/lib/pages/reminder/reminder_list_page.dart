import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../models/reminder.dart';
import '../../providers/reminder_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/empty_state.dart';

final _reminderFilterProvider = StateProvider<int>((ref) => 0);

const Color _bgRed = Color(0xFFFEF2F2);
const Color _bgOrange = Color(0xFFFFF7ED);
const Color _bgYellow = Color(0xFFFFFBEB);
const Color _bgGreen = Color(0xFFF0FDF4);
const Color _tabSelected = Color(0xFF1A73E8);

class ReminderListPage extends ConsumerWidget {
  const ReminderListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(_reminderFilterProvider);
    final async = ref.watch(alertsProvider);
    final isAdmin = ref.watch(authStateProvider).user?.role == 'admin';
    void setFilter(int t) => ref.read(_reminderFilterProvider.notifier).state = t;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          async.when(
            data: (list) => _Header(list: list, isAdmin: isAdmin),
            loading: () => _Header(list: const [], isAdmin: isAdmin),
            error: (_, __) => _Header(list: const [], isAdmin: isAdmin),
          ),
          async.when(
            data: (list) => _StatsCard(list: list, selected: filter, onTap: setFilter),
            loading: () => const SizedBox(height: 100),
            error: (_, __) => const SizedBox(height: 100),
          ),
          _TabBar(tab: filter, onTab: setFilter),
          Expanded(
            child: async.when(
              data: (list) {
                final filtered = _filterList(list, filter);
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(alertsProvider),
                  child: _AlertList(alerts: filtered),
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

List<MaintenanceAlert> _filterList(List<MaintenanceAlert> list, int filter) {
  final lv = (String? v) => v?.toUpperCase();
  switch (filter) {
    case 1: return list.where((a) => a.isOverdue == true || (a.remainingUses ?? 0) <= 0).toList();
    case 2: return list.where((a) => a.isOverdue != true && (lv(a.urgencyLevel) == 'CRITICAL' || lv(a.urgencyLevel) == 'WARNING')).toList();
    case 3: return list.where((a) => a.isOverdue != true && lv(a.urgencyLevel) != 'CRITICAL' && lv(a.urgencyLevel) != 'WARNING').toList();
    default: return list;
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.list, required this.isAdmin});
  final List<MaintenanceAlert> list;
  final bool isAdmin;

  @override
  Widget build(BuildContext context) {
    final total = list.length;
    final overdue = list.where((a) => a.isOverdue == true || (a.remainingUses ?? 0) <= 0).length;
    return Container(
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 16, left: 16, right: 16, bottom: 20),
      decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFFFF6D00), Color(0xFFE65100)])),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('维保提醒', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 4),
          Text('共${total}条提醒，$overdue条逾期', style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.9))),
        ])),
        if (isAdmin)
          GestureDetector(
            onTap: () => context.push('/reminder-settings'),
            child: Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.25), shape: BoxShape.circle), child: const Icon(Icons.settings, color: Colors.white, size: 22)),
          ),
      ]),
    );
  }
}

class _StatsCard extends StatelessWidget {
  const _StatsCard({required this.list, required this.selected, required this.onTap});
  final List<MaintenanceAlert> list;
  final int selected;
  final void Function(int) onTap;

  @override
  Widget build(BuildContext context) {
    final overdue = list.where((a) => a.isOverdue == true || (a.remainingUses ?? 0) <= 0).length;
    final lv = (String? v) => v?.toUpperCase();
    final urgent = list.where((a) => a.isOverdue != true && lv(a.urgencyLevel) == 'CRITICAL').length;
    final warning = list.where((a) => a.isOverdue != true && lv(a.urgencyLevel) == 'WARNING').length;
    final normal = list.where((a) => a.isOverdue != true && lv(a.urgencyLevel) != 'CRITICAL' && lv(a.urgencyLevel) != 'WARNING').length;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)]),
      child: Row(children: [
        _StatItem(label: '逾期', count: overdue, color: UrgencyColors.overdue, selected: selected == 1, onTap: () => onTap(selected == 1 ? 0 : 1)),
        _StatItem(label: '紧急', count: urgent, color: const Color(0xFFF59E0B), selected: selected == 2, onTap: () => onTap(selected == 2 ? 0 : 2)),
        _StatItem(label: '预警', count: warning, color: UrgencyColors.warning, selected: selected == 2, onTap: () => onTap(selected == 2 ? 0 : 2)),
        _StatItem(label: '待关注', count: normal, color: UrgencyColors.normal, selected: selected == 3, onTap: () => onTap(selected == 3 ? 0 : 3)),
      ]),
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem({required this.label, required this.count, required this.color, required this.selected, required this.onTap});
  final String label;
  final int count;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Expanded(
    child: GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4),
        decoration: selected ? BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)) : null,
        child: Column(children: [
          Text('$count', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 12, color: color)),
        ]),
      ),
    ),
  );
}

class _TabBar extends StatelessWidget {
  const _TabBar({required this.tab, required this.onTab});
  final int tab;
  final void Function(int) onTab;

  @override
  Widget build(BuildContext context) {
    const tabs = ['全部', '逾期', '即将到期', '待关注'];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(children: List.generate(tabs.length, (i) => Padding(
          padding: EdgeInsets.only(right: i < tabs.length - 1 ? 8 : 0),
          child: _TabChip(label: tabs[i], selected: tab == i, onTap: () => onTab(i)),
        ))),
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
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: selected ? _tabSelected : Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: selected ? _tabSelected : const Color(0xFFD1D5DB), width: 1),
      ),
      child: Text(label, style: TextStyle(fontSize: 13, color: selected ? Colors.white : const Color(0xFF6B7280))),
    ),
  );
}

class _AlertList extends StatelessWidget {
  const _AlertList({required this.alerts});
  final List<MaintenanceAlert> alerts;

  @override
  Widget build(BuildContext context) {
    if (alerts.isEmpty) {
      return ListView(physics: const AlwaysScrollableScrollPhysics(), children: [SizedBox(height: MediaQuery.of(context).size.height * 0.3, child: const EmptyState(message: '暂无数据'))]);
    }
    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      itemCount: alerts.length,
      itemBuilder: (_, i) => _AlertCard(alert: alerts[i]),
    );
  }
}

class _AlertCard extends StatelessWidget {
  const _AlertCard({required this.alert});
  final MaintenanceAlert alert;

  static ({Color bar, Color bg, String badge}) _style(MaintenanceAlert a) {
    final lv = a.urgencyLevel?.toUpperCase();
    if (a.isOverdue == true || (a.remainingUses ?? 0) <= 0) return (bar: UrgencyColors.overdue, bg: _bgRed, badge: '已逾期');
    if (lv == 'CRITICAL') return (bar: const Color(0xFFF59E0B), bg: _bgOrange, badge: '紧急');
    if (lv == 'WARNING') return (bar: UrgencyColors.warning, bg: _bgYellow, badge: '预警');
    return (bar: UrgencyColors.normal, bg: _bgGreen, badge: '待关注');
  }

  @override
  Widget build(BuildContext context) {
    final s = _style(alert);
    final cycle = alert.maintenanceCycle ?? 1;
    final remaining = alert.remainingUses ?? 0;
    final progress = cycle > 0 ? (1 - remaining / cycle).clamp(0.0, 1.0) : 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(color: s.bg, borderRadius: BorderRadius.circular(14), boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)]),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.push('/molds/${alert.moldId}'),
          borderRadius: BorderRadius.circular(14),
          child: IntrinsicHeight(
            child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Container(width: 4, decoration: BoxDecoration(color: s.bar, borderRadius: const BorderRadius.horizontal(left: Radius.circular(14)))),
              Expanded(child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Flexible(child: Text.rich(TextSpan(children: [
                      TextSpan(text: alert.moldNumber, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
                      if (alert.productName != null && alert.productName!.isNotEmpty) TextSpan(text: ' | ${alert.productName}', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                    ]), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: s.bar.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                      child: Text(s.badge, style: TextStyle(fontSize: 11, color: s.bar, fontWeight: FontWeight.w500)),
                    ),
                  ]),
                  const SizedBox(height: 10),
                  Row(children: [
                    Text(remaining <= 0 ? '已逾期${-remaining}次' : '剩余${remaining}次', style: TextStyle(fontSize: 12, color: s.bar)),
                    const SizedBox(width: 12),
                    Expanded(child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(value: progress, backgroundColor: s.bar.withValues(alpha: 0.2), valueColor: AlwaysStoppedAnimation(s.bar), minHeight: 6),
                    )),
                  ]),
                ]),
              )),
            ]),
          ),
        ),
      ),
    );
  }
}
