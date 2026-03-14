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

class _TodayDetailPageState extends State<TodayDetailPage> {
  List<dynamic> _records = [];
  bool _loading = true;
  final _today = DateFormat('yyyy-MM-dd').format(DateTime.now());

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final r = await ApiClient.instance.get(ApiConfig.usageRecords, params: {
        'startDate': _today,
        'endDate': _today,
        'pageSize': 200,
      });
      final d = r.data is Map ? (r.data['data'] ?? r.data) : r.data;
      final items = d is Map ? (d['list'] as List?) ?? (d['items'] as List?) ?? [] : (d as List?) ?? [];
      if (mounted) setState(() => _records = items);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              child: _loading
                  ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                  : _records.isEmpty
                      ? ListView(children: const [
                          SizedBox(height: 120),
                          Center(child: Text('今日暂无使用记录', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 15))),
                        ])
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _records.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (_, i) => _RecordCard(record: _records[i]),
                        ),
            ),
          ),
        ],
      ),
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
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Text('共 ${_records.length} 条', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14)),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecordCard extends StatelessWidget {
  const _RecordCard({required this.record});
  final dynamic record;

  @override
  Widget build(BuildContext context) {
    final m = record is Map ? record : <String, dynamic>{};
    final moldNumber = m['mold']?['moldNumber'] ?? m['moldNumber'] ?? '';
    final product = m['product'] ?? '';
    final quantity = m['quantity'] ?? 0;
    final shift = _shiftLabel(m['shift'] ?? '');
    final operator = m['operator']?['name'] ?? m['operatorName'] ?? '';
    final note = m['note'] ?? '';
    final time = m['createdAt'] ?? '';
    String timeStr = '';
    if (time is String && time.isNotEmpty) {
      try {
        final dt = DateTime.parse(time).toLocal();
        timeStr = DateFormat('HH:mm').format(dt);
      } catch (_) {
        timeStr = time.length > 16 ? time.substring(11, 16) : '';
      }
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: Color(0x08000000), blurRadius: 4)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  moldNumber.toString(),
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF111827)),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F4FF),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(shift, style: const TextStyle(fontSize: 12, color: Color(0xFF1A73E8))),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            runSpacing: 4,
            children: [
              _tag('产品: $product'),
              _tag('数量: $quantity'),
              if (operator.toString().isNotEmpty) _tag('操作: $operator'),
            ],
          ),
          if (note.toString().isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(note.toString(), style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)), maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
          if (timeStr.isNotEmpty)
            Align(
              alignment: Alignment.centerRight,
              child: Text(timeStr, style: const TextStyle(fontSize: 11, color: Color(0xFFBBBBBB))),
            ),
        ],
      ),
    );
  }

  Widget _tag(String text) {
    return Text(text, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)));
  }

  String _shiftLabel(String s) => switch (s) {
        'MORNING' => '早班',
        'AFTERNOON' => '中班',
        'NIGHT' => '晚班',
        _ => s,
      };
}
