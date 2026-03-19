import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../services/api_client.dart';
import '../../config/api.dart';

class TodayDetailPage extends StatefulWidget {
  const TodayDetailPage({super.key});

  @override
  State<TodayDetailPage> createState() => _TodayDetailPageState();
}

class _TodayDetailPageState extends State<TodayDetailPage> with SingleTickerProviderStateMixin {
  List<dynamic> _usageRecords = [];
  List<dynamic> _maintRecords = [];
  bool _loading = true;
  final _today = DateFormat('yyyy-MM-dd').format(DateTime.now());
  late final TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final futures = await Future.wait([
        ApiClient.instance.get(ApiConfig.usageRecords, params: {'startDate': _today, 'endDate': _today, 'pageSize': 200}),
        ApiClient.instance.get(ApiConfig.maintenanceRecords, params: {'startDate': _today, 'endDate': _today, 'pageSize': 200}),
      ]);
      _usageRecords = _extractList(futures[0].data);
      _maintRecords = _extractList(futures[1].data);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  List<dynamic> _extractList(dynamic data) {
    final d = data is Map ? (data['data'] ?? data) : data;
    final items = d is Map ? (d['list'] as List?) ?? (d['items'] as List?) ?? [] : (d as List?) ?? [];
    return items;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          _buildHeader(context),
          TabBar(
            controller: _tabCtrl,
            labelColor: const Color(0xFF1A73E8),
            unselectedLabelColor: const Color(0xFF6B7280),
            indicatorColor: const Color(0xFF1A73E8),
            tabs: [
              Tab(text: '使用记录 (${_usageRecords.length})'),
              Tab(text: '保养记录 (${_maintRecords.length})'),
            ],
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              child: _loading
                  ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                  : TabBarView(
                      controller: _tabCtrl,
                      children: [
                        _buildUsageList(),
                        _buildMaintList(),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUsageList() {
    if (_usageRecords.isEmpty) {
      return ListView(children: const [SizedBox(height: 120), Center(child: Text('今日暂无使用记录', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 15)))]);
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _usageRecords.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) => _UsageCard(record: _usageRecords[i]),
    );
  }

  Widget _buildMaintList() {
    if (_maintRecords.isEmpty) {
      return ListView(children: const [SizedBox(height: 120), Center(child: Text('今日暂无保养记录', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 15)))]);
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _maintRecords.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) => _MaintCard(record: _maintRecords[i]),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
      decoration: const BoxDecoration(color: Color(0xFF1A73E8)),
      child: SizedBox(
        height: 56,
        child: Row(
          children: [
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => context.pop(),
              child: Container(
                width: 36, height: 36,
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('今日详细记录', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                Text(_today, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
              ],
            )),
          ],
        ),
      ),
    );
  }
}

class _UsageCard extends StatelessWidget {
  const _UsageCard({required this.record});
  final dynamic record;

  @override
  Widget build(BuildContext context) {
    final m = record is Map ? record : <String, dynamic>{};
    final moldNumber = m['mold']?['moldNumber'] ?? m['moldNumber'] ?? '';
    final product = m['product'] ?? '';
    final quantity = m['quantity'] ?? 0;
    final cavityCount = m['mold']?['cavityCount'] ?? 1;
    final prodQty = (quantity as int) * (cavityCount as int);
    final shift = _shiftLabel(m['shift'] ?? '');
    final operator = m['operator']?['name'] ?? m['operatorName'] ?? '';
    final note = m['note'] ?? '';
    final time = m['createdAt'] ?? '';
    String timeStr = '';
    if (time is String && time.isNotEmpty) {
      try { timeStr = DateFormat('HH:mm').format(DateTime.parse(time).toLocal()); } catch (_) {}
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: Color(0x08000000), blurRadius: 4)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Text(moldNumber.toString(), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF111827)), overflow: TextOverflow.ellipsis)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(color: const Color(0xFFF0F4FF), borderRadius: BorderRadius.circular(6)),
            child: Text(shift, style: const TextStyle(fontSize: 12, color: Color(0xFF1A73E8))),
          ),
        ]),
        const SizedBox(height: 8),
        Wrap(spacing: 12, runSpacing: 4, children: [
          _tag('产品: $product'),
          _tag('模次: $quantity'),
          if (cavityCount > 1) _tag('产量: $prodQty件'),
          if (operator.toString().isNotEmpty) _tag('操作: $operator'),
        ]),
        if (note.toString().isNotEmpty) ...[
          const SizedBox(height: 6),
          Text(note.toString(), style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
        if (timeStr.isNotEmpty)
          Align(alignment: Alignment.centerRight, child: Text(timeStr, style: const TextStyle(fontSize: 11, color: Color(0xFFBBBBBB)))),
      ]),
    );
  }

  Widget _tag(String text) => Text(text, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)));
  String _shiftLabel(String s) => switch (s) { 'MORNING' => '早班', 'AFTERNOON' => '中班', 'NIGHT' => '晚班', _ => s };
}

class _MaintCard extends StatelessWidget {
  const _MaintCard({required this.record});
  final dynamic record;

  @override
  Widget build(BuildContext context) {
    final m = record is Map ? record : <String, dynamic>{};
    final moldNumber = m['mold']?['moldNumber'] ?? '';
    final type = m['type'] == 'MAINTAIN' || m['type'] == '保养' ? '保养' : '维修';
    final content = m['content'] ?? '';
    final operator = m['operator']?['name'] ?? '';
    final time = m['createdAt'] ?? '';
    String timeStr = '';
    if (time is String && time.isNotEmpty) {
      try { timeStr = DateFormat('HH:mm').format(DateTime.parse(time).toLocal()); } catch (_) {}
    }

    final isMaint = type == '保养';
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: Color(0x08000000), blurRadius: 4)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Text(moldNumber.toString(), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF111827)), overflow: TextOverflow.ellipsis)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: isMaint ? const Color(0xFFECFDF5) : const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(type, style: TextStyle(fontSize: 12, color: isMaint ? const Color(0xFF059669) : const Color(0xFFD97706))),
          ),
        ]),
        const SizedBox(height: 8),
        if (content.toString().isNotEmpty)
          Text(content.toString(), style: const TextStyle(fontSize: 13, color: Color(0xFF374151)), maxLines: 2, overflow: TextOverflow.ellipsis),
        const SizedBox(height: 4),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          if (operator.toString().isNotEmpty) Text('操作: $operator', style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
          if (timeStr.isNotEmpty) Text(timeStr, style: const TextStyle(fontSize: 11, color: Color(0xFFBBBBBB))),
        ]),
      ]),
    );
  }
}
