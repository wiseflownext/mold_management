import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/audit_log_service.dart';

class AuditLogPage extends StatefulWidget {
  const AuditLogPage({super.key});

  @override
  State<AuditLogPage> createState() => _State();
}

class _State extends State<AuditLogPage> {
  final List<Map<String, dynamic>> _items = [];
  bool _loading = true;
  int _page = 1;
  int _total = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await AuditLogService.instance.getList(page: _page);
      setState(() {
        _items.addAll(List<Map<String, dynamic>>.from(data['items']));
        _total = data['total'];
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  String _actionLabel(String? action) => switch (action) {
        'CREATE' => '新增',
        'DELETE' => '删除',
        'STATUS_CHANGE' => '状态变更',
        'RESET_PASSWORD' => '重置密码',
        'LOGIN' => '登录',
        _ => action ?? '',
      };

  String _targetLabel(String? type) => switch (type) {
        'mold' => '模具',
        'user' => '用户',
        'usage_record' => '使用记录',
        'maintenance_record' => '维保记录',
        'auth' => '系统',
        _ => type ?? '',
      };

  IconData _actionIcon(String? a) => switch (a) {
        'CREATE' => Icons.add_circle_outline,
        'DELETE' => Icons.delete_outline,
        'LOGIN' => Icons.login,
        'STATUS_CHANGE' => Icons.swap_horiz,
        'RESET_PASSWORD' => Icons.lock_reset,
        _ => Icons.history,
      };
  Color _actionColor(String? a) => switch (a) {
        'CREATE' => const Color(0xFF22C55E),
        'DELETE' => const Color(0xFFEF4444),
        'LOGIN' => const Color(0xFF1A73E8),
        _ => const Color(0xFF6B7280),
      };
  String _fmtTime(dynamic v) {
    final s = '$v';
    if (s.length >= 16) return s.substring(0, 16).replaceAll('T', ' ');
    return s.replaceAll('T', ' ');
  }

  Color _actionBg(String? a) => switch (a) {
        'CREATE' => const Color(0xFFECFDF5),
        'DELETE' => const Color(0xFFFEF2F2),
        'LOGIN' => const Color(0xFFEFF6FF),
        _ => const Color(0xFFF3F4F6),
      };

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.only(top: top),
            decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFF1A73E8), Color(0xFF1557C0)])),
            child: SizedBox(
              height: 56,
              child: Row(children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    margin: const EdgeInsets.only(left: 16), width: 36, height: 36,
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle),
                    child: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                  ),
                ),
                const SizedBox(width: 12),
                const Text('操作日志', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              ]),
            ),
          ),
          Expanded(
            child: _loading && _items.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : _items.isEmpty
                    ? const Center(child: Text('暂无操作日志', style: TextStyle(color: Color(0xFF9CA3AF))))
                    : NotificationListener<ScrollNotification>(
                        onNotification: (n) {
                          if (n is ScrollEndNotification && n.metrics.extentAfter < 100 && _items.length < _total && !_loading) {
                            _page++;
                            _load();
                          }
                          return false;
                        },
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _items.length,
                          itemBuilder: (_, i) {
                            final item = _items[i];
                            return Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 6)],
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 40, height: 40,
                                    decoration: BoxDecoration(color: _actionBg(item['action']), borderRadius: BorderRadius.circular(10)),
                                    child: Icon(_actionIcon(item['action']), color: _actionColor(item['action']), size: 22),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('${item['userName'] ?? ''} ${_actionLabel(item['action'])} ${_targetLabel(item['targetType'])}',
                                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF1F2937))),
                                        if (item['detail'] != null)
                                          Padding(
                                            padding: const EdgeInsets.only(top: 4),
                                            child: Text('${item['detail']}', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)), maxLines: 2, overflow: TextOverflow.ellipsis),
                                          ),
                                        Padding(
                                          padding: const EdgeInsets.only(top: 4),
                                          child: Text(_fmtTime(item['createdAt']), style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
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
