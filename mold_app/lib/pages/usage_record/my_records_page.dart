import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../services/usage_record_service.dart';
import '../../models/usage_record.dart';
import '../../providers/auth_provider.dart';
import '../../config/constants.dart';

class MyRecordsPage extends ConsumerStatefulWidget {
  const MyRecordsPage({super.key});

  @override
  ConsumerState<MyRecordsPage> createState() => _State();
}

class _State extends ConsumerState<MyRecordsPage> {
  int _tab = 0;
  final List<UsageRecord> _records = [];
  bool _loading = true;
  bool _loadingMore = false;
  bool _hasMore = true;
  int _page = 1;
  static const _pageSize = 20;
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
    _load();
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollCtrl.position.extentAfter < 200 && !_loadingMore && _hasMore) {
      _loadMore();
    }
  }

  Future<void> _load() async {
    _page = 1;
    _hasMore = true;
    _records.clear();
    setState(() => _loading = true);
    await _fetch();
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _loadMore() async {
    if (_loadingMore || !_hasMore) return;
    setState(() => _loadingMore = true);
    _page++;
    await _fetch();
    if (mounted) setState(() => _loadingMore = false);
  }

  Future<void> _fetch() async {
    try {
      DateTime? start, end;
      final now = DateTime.now();
      if (_tab == 0) {
        start = DateTime(now.year, now.month, 1);
        end = now;
      } else if (_tab == 1) {
        final last = DateTime(now.year, now.month - 1);
        start = DateTime(last.year, last.month, 1);
        end = DateTime(last.year, last.month + 1, 0);
      }

      final user = ref.read(authStateProvider).user;
      final isAdmin = user?.role.toLowerCase() == 'admin';
      final operatorId = isAdmin ? null : user?.id;

      final r = await UsageRecordService.instance.getList(
        _page, _pageSize,
        startDate: start != null ? DateFormat('yyyy-MM-dd').format(start) : null,
        endDate: end != null ? DateFormat('yyyy-MM-dd').format(end) : null,
        operatorId: operatorId,
      );
      if (mounted) {
        setState(() {
          _records.addAll(r.items);
          _hasMore = r.items.length >= _pageSize;
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final totalQty = _records.fold<int>(0, (s, r) => s + (r.quantity ?? 0));
    final moldIds = _records.map((r) => r.moldId).toSet();

    final grouped = <String, List<UsageRecord>>{};
    for (final r in _records) {
      final d = r.recordDate != null ? DateFormat('yyyy-MM-dd').format(r.recordDate!) : '';
      grouped.putIfAbsent(d, () => []).add(r);
    }
    final dates = grouped.keys.toList()..sort((a, b) => b.compareTo(a));

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          _Header(onBack: () => context.pop()),
          _TabBar(tab: _tab, onTab: (t) { _tab = t; _load(); }),
          _StatsCard(count: _records.length, qty: totalQty, molds: moldIds.length),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _records.isEmpty
                      ? ListView(physics: const AlwaysScrollableScrollPhysics(), children: [SizedBox(height: MediaQuery.of(context).size.height * 0.3, child: const Center(child: Text('暂无记录', style: TextStyle(color: Color(0xFF9CA3AF)))))])
                      : ListView.builder(
                          controller: _scrollCtrl,
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                          itemCount: dates.length + (_loadingMore ? 1 : 0),
                          itemBuilder: (_, i) {
                            if (i == dates.length) return const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator(strokeWidth: 2)));
                            final d = dates[i];
                            final items = grouped[d]!;
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Padding(padding: const EdgeInsets.only(top: 16, bottom: 8), child: Text(d, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF374151)))),
                                ...items.map((r) => _RecordItem(record: r)),
                              ],
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.onBack});
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    return Container(
      padding: EdgeInsets.only(top: top + 8, left: 16, right: 16, bottom: 16),
      decoration: const BoxDecoration(color: Color(0xFF1A73E8)),
      child: Row(children: [
        GestureDetector(
          onTap: onBack,
          child: Container(width: 36, height: 36, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.25)), child: const Icon(Icons.arrow_back_ios_new, size: 18, color: Colors.white)),
        ),
        const SizedBox(width: 12),
        const Text('我的使用记录', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
      ]),
    );
  }
}

class _TabBar extends StatelessWidget {
  const _TabBar({required this.tab, required this.onTab});
  final int tab;
  final void Function(int) onTab;

  @override
  Widget build(BuildContext context) {
    const labels = ['本月', '上月', '全部'];
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
      child: Row(children: List.generate(3, (i) {
        final sel = tab == i;
        return Padding(
          padding: const EdgeInsets.only(right: 10),
          child: GestureDetector(
            onTap: () => onTab(i),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: sel ? const Color(0xFF1A73E8) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: sel ? null : Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: Text(labels[i], style: TextStyle(fontSize: 13, color: sel ? Colors.white : const Color(0xFF6B7280), fontWeight: sel ? FontWeight.w600 : FontWeight.normal)),
            ),
          ),
        );
      })),
    );
  }
}

class _StatsCard extends StatelessWidget {
  const _StatsCard({required this.count, required this.qty, required this.molds});
  final int count, qty, molds;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)]),
      child: Row(children: [_StatCol(label: '总记录数', value: '$count'), _StatCol(label: '总生产量', value: '$qty'), _StatCol(label: '涉及模具', value: '$molds')]),
    );
  }
}

class _StatCol extends StatelessWidget {
  const _StatCol({required this.label, required this.value});
  final String label, value;

  @override
  Widget build(BuildContext context) => Expanded(child: Column(children: [
    Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1A73E8))),
    const SizedBox(height: 4),
    Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
  ]));
}

class _RecordItem extends StatelessWidget {
  const _RecordItem({required this.record});
  final UsageRecord record;

  @override
  Widget build(BuildContext context) {
    final mold = record.mold;
    final shiftLabel = Shift.fromApi(record.shift)?.label ?? record.shift ?? '';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)]),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(mold?.moldNumber ?? record.moldId, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
          if (record.product != null) Padding(padding: const EdgeInsets.only(top: 4), child: Text(record.product!, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)))),
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text('${record.quantity ?? 0}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
          if (shiftLabel.isNotEmpty) Container(
            margin: const EdgeInsets.only(top: 4),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: const Color(0xFF1A73E8).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
            child: Text(shiftLabel, style: const TextStyle(fontSize: 11, color: Color(0xFF1A73E8))),
          ),
        ]),
      ]),
    );
  }
}
