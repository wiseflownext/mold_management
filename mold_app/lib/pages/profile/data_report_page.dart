import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../services/report_service.dart';

class DataReportPage extends StatefulWidget {
  const DataReportPage({super.key});

  @override
  State<DataReportPage> createState() => _DataReportPageState();
}

class _DataReportPageState extends State<DataReportPage> {
  int _selected = 0;
  DateTime? _start;
  DateTime? _end;
  bool _loading = false;

  static const _types = [
    _ReportType(icon: Icons.assignment_outlined, name: '使用记录', desc: '模具使用数据导出'),
    _ReportType(icon: Icons.build_outlined, name: '维保记录', desc: '维修保养数据导出'),
    _ReportType(icon: Icons.inventory_2_outlined, name: '模具台账', desc: '全部模具信息导出'),
    _ReportType(icon: Icons.bar_chart_outlined, name: '统计分析', desc: '使用与维保统计概览'),
  ];

  Future<void> _pickDate(bool isStart) async {
    final d = await showDatePicker(
      context: context,
      initialDate: (isStart ? _start : _end) ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (d != null) setState(() => isStart ? _start = d : _end = d);
  }

  Future<void> _export() async {
    final needDate = _selected == 0 || _selected == 1 || _selected == 3;
    if (needDate && (_start == null || _end == null)) {
      Fluttertoast.showToast(msg: '请选择日期范围');
      return;
    }
    setState(() => _loading = true);
    try {
      final fmt = DateFormat('yyyy-MM-dd');
      if (_selected == 0) {
        final bytes = await ReportService.instance.downloadUsageCSV(startDate: fmt.format(_start!), endDate: fmt.format(_end!));
        await _shareBytes(bytes, 'usage_report.csv', '使用记录报表');
      } else if (_selected == 1) {
        final bytes = await ReportService.instance.downloadMaintenanceCSV(startDate: fmt.format(_start!), endDate: fmt.format(_end!));
        await _shareBytes(bytes, 'maintenance_report.csv', '维保记录报表');
      } else if (_selected == 2) {
        final bytes = await ReportService.instance.downloadMoldLedgerCSV();
        await _shareBytes(bytes, 'mold_ledger.csv', '模具台账报表');
      } else if (_selected == 3) {
        final stats = await ReportService.instance.getStatistics(startDate: fmt.format(_start!), endDate: fmt.format(_end!));
        if (!mounted) return;
        _showStatisticsDialog(stats);
      }
    } catch (e) {
      Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _shareBytes(List<int> bytes, String filename, String text) async {
    if (bytes.isEmpty) { Fluttertoast.showToast(msg: '无数据'); return; }
    final dir = await getTemporaryDirectory();
    final file = await File('${dir.path}/$filename').writeAsBytes(bytes);
    await Share.shareXFiles([XFile(file.path)], text: text);
  }

  void _showStatisticsDialog(Map<String, dynamic> stats) {
    final byType = (stats['byType'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final byWorkshop = (stats['byWorkshop'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final monthly = (stats['monthly'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final typeMap = {'COMPRESSION': '模压', 'EXTRUSION': '口型', 'CORNER': '接角'};

    showDialog(context: context, builder: (_) => AlertDialog(
      title: const Text('统计分析', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
      content: SizedBox(
        width: double.maxFinite,
        child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          _statRow('涉及模具数', '${stats['moldCount'] ?? 0}'),
          _statRow('使用记录数', '${stats['usageRecordCount'] ?? 0}'),
          _statRow('总生产数量', '${stats['usageTotalQuantity'] ?? 0}'),
          _statRow('维保记录数', '${stats['maintenanceRecordCount'] ?? 0}'),
          if (byType.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Text('按类型', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
            const SizedBox(height: 4),
            ...byType.map((t) => _statRow(typeMap[t['type']] ?? '${t['type']}', '${t['count']}')),
          ],
          if (byWorkshop.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Text('按车间', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
            const SizedBox(height: 4),
            ...byWorkshop.map((w) => _statRow('${w['workshop']}', '${w['count']}')),
          ],
          if (monthly.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Text('月度趋势', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
            const SizedBox(height: 4),
            ...monthly.map((m) => _statRow('${m['month']}', '产量${m['quantity']}  共${m['count']}条')),
          ],
        ])),
      ),
      actions: [
        TextButton(onPressed: () => _exportStatisticsText(stats, byType, byWorkshop, monthly, typeMap), child: const Text('导出')),
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('关闭')),
      ],
    ));
  }

  Future<void> _exportStatisticsText(Map<String, dynamic> stats, List<Map<String, dynamic>> byType, List<Map<String, dynamic>> byWorkshop, List<Map<String, dynamic>> monthly, Map<String, String> typeMap) async {
    final buf = StringBuffer('统计分析报告\n');
    buf.writeln('涉及模具数: ${stats['moldCount']}');
    buf.writeln('使用记录数: ${stats['usageRecordCount']}');
    buf.writeln('总生产数量: ${stats['usageTotalQuantity']}');
    buf.writeln('维保记录数: ${stats['maintenanceRecordCount']}');
    if (byType.isNotEmpty) { buf.writeln('\n按类型:'); for (final t in byType) buf.writeln('  ${typeMap[t['type']] ?? t['type']}: ${t['count']}'); }
    if (byWorkshop.isNotEmpty) { buf.writeln('\n按车间:'); for (final w in byWorkshop) buf.writeln('  ${w['workshop']}: ${w['count']}'); }
    if (monthly.isNotEmpty) { buf.writeln('\n月度趋势:'); for (final m in monthly) buf.writeln('  ${m['month']}: 产量${m['quantity']} 共${m['count']}条'); }
    final dir = await getTemporaryDirectory();
    final file = await File('${dir.path}/statistics.txt').writeAsString(buf.toString());
    await Share.shareXFiles([XFile(file.path)], text: '统计分析报告');
  }

  Widget _statRow(String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
      Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF1A73E8))),
    ]),
  );

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.only(top: top + 8, left: 16, right: 16, bottom: 16),
            decoration: const BoxDecoration(color: Color(0xFF1A73E8)),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.25)),
                    child: const Icon(Icons.arrow_back_ios_new, size: 18, color: Colors.white),
                  ),
                ),
                const SizedBox(width: 12),
                const Text('数据报表', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('选择报表类型', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                  const SizedBox(height: 12),
                  ...List.generate(_types.length, (i) {
                    final t = _types[i];
                    final sel = _selected == i;
                    return GestureDetector(
                      onTap: () => setState(() => _selected = i),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: sel ? Border.all(color: const Color(0xFF1A73E8), width: 1.5) : null,
                          boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 42, height: 42,
                              decoration: BoxDecoration(
                                color: sel ? const Color(0xFF1A73E8).withValues(alpha: 0.1) : const Color(0xFFF3F4F6),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(t.icon, color: sel ? const Color(0xFF1A73E8) : const Color(0xFF9CA3AF), size: 22),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(t.name, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: sel ? const Color(0xFF1A73E8) : const Color(0xFF1F2937))),
                                  const SizedBox(height: 2),
                                  Text(t.desc, style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
                                ],
                              ),
                            ),
                            if (sel)
                              const Icon(Icons.check_circle, color: Color(0xFF1A73E8), size: 22),
                          ],
                        ),
                      ),
                    );
                  }),
                  if (_selected != 2) ...[
                    const SizedBox(height: 8),
                    const Text('选择日期范围', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: _DateBtn(label: _start != null ? DateFormat('yyyy-MM-dd').format(_start!) : '起始日期', onTap: () => _pickDate(true))),
                        const Padding(padding: EdgeInsets.symmetric(horizontal: 10), child: Text('~', style: TextStyle(color: Color(0xFF9CA3AF)))),
                        Expanded(child: _DateBtn(label: _end != null ? DateFormat('yyyy-MM-dd').format(_end!) : '结束日期', onTap: () => _pickDate(false))),
                      ],
                    ),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity, height: 48,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _export,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1A73E8),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: _loading
                          ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('导出报表', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DateBtn extends StatelessWidget {
  const _DateBtn({required this.label, required this.onTap});
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_outlined, size: 16, color: Color(0xFF9CA3AF)),
            const SizedBox(width: 8),
            Expanded(child: Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280)))),
          ],
        ),
      ),
    );
  }
}

class _ReportType {
  final IconData icon;
  final String name;
  final String desc;
  const _ReportType({required this.icon, required this.name, required this.desc});
}
