import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/mold_provider.dart';
import '../../providers/refresh.dart';
import '../../services/maintenance_service.dart';
import '../../services/mold_service.dart';
import '../../models/mold.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../widgets/mold_search_select.dart';

class AddMaintenancePage extends ConsumerStatefulWidget {
  const AddMaintenancePage({super.key, this.moldId});

  final String? moldId;

  @override
  ConsumerState<AddMaintenancePage> createState() => _AddMaintenancePageState();
}

class _AddMaintenancePageState extends ConsumerState<AddMaintenancePage> {
  Mold? _mold;
  MaintenanceType _type = MaintenanceType.maintain;
  final _contentCtrl = TextEditingController();
  DateTime _date = DateTime.now();
  bool _loading = false;
  bool _showSuccess = false;
  bool _popScheduled = false;

  @override
  void initState() {
    super.initState();
    if (widget.moldId != null && widget.moldId!.isNotEmpty) {
      MoldService.instance.getDetail(widget.moldId!).then((m) {
        if (mounted) setState(() => _mold = m);
      });
    }
  }

  @override
  void dispose() {
    _contentCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_mold == null) {
      Fluttertoast.showToast(msg: '请选择模具');
      return;
    }
    final content = _contentCtrl.text.trim();
    if (content.isEmpty) {
      Fluttertoast.showToast(msg: '请输入维保内容');
      return;
    }
    setState(() => _loading = true);
    try {
      await MaintenanceService.instance.create(
        _mold!.id,
        _type.apiValue,
        content,
        DateFormat('yyyy-MM-dd').format(_date),
      );
      refreshAfterRecord(ref, moldId: _mold!.id.toString());
      setState(() {
        _loading = false;
        _showSuccess = true;
      });
    } catch (e) {
      setState(() => _loading = false);
      Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authStateProvider).user;
    final top = MediaQuery.of(context).padding.top;

    if (_showSuccess) return _buildSuccess();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(children: [
        Container(
          padding: EdgeInsets.only(top: top),
          color: const Color(0xFF1A73E8),
          child: SizedBox(
            height: 64,
            child: Row(children: [
              GestureDetector(
                onTap: () => context.pop(),
                child: Container(
                  margin: const EdgeInsets.only(left: 16),
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('新增维保记录', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text('记录模具保养/维修信息', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
                ],
              )),
            ]),
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              _card('模具编号', true, MoldSearchSelect(
                initialMold: _mold,
                onSelected: (m) => setState(() => _mold = m),
              )),
              const SizedBox(height: 12),
              _card('维保类型', true, Row(children: [
                Expanded(child: _typeBtn(
                  MaintenanceType.maintain,
                  '保养',
                  const Color(0xFFECFDF5),
                  const Color(0xFFA7F3D0),
                  const Color(0xFF059669),
                )),
                const SizedBox(width: 12),
                Expanded(child: _typeBtn(
                  MaintenanceType.repair,
                  '维修',
                  const Color(0xFFFEF3C7),
                  const Color(0xFFFDE68A),
                  const Color(0xFFD97706),
                )),
              ])),
              const SizedBox(height: 12),
              _card('维保内容', true, Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  TextField(
                    controller: _contentCtrl,
                    maxLines: 5,
                    maxLength: 500,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: '请输入维保内容',
                      hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
                      filled: true,
                      fillColor: const Color(0xFFF3F4F6),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.all(12),
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${_contentCtrl.text.length}/500',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
                  ),
                ],
              )),
              const SizedBox(height: 12),
              _card('日期', true, GestureDetector(
                onTap: () async {
                  final d = await showDatePicker(
                    context: context,
                    initialDate: _date,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now(),
                  );
                  if (d != null) setState(() => _date = d);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3F4F6),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(DateFormat('yyyy-MM-dd').format(_date), style: const TextStyle(fontSize: 15)),
                      const Icon(Icons.calendar_today_outlined, size: 18, color: Color(0xFF9CA3AF)),
                    ],
                  ),
                ),
              )),
              const SizedBox(height: 12),
              _card('操作人', false, Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  user?.name ?? user?.username ?? '',
                  style: const TextStyle(fontSize: 15, color: Color(0xFF374151)),
                ),
              )),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1A73E8),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: _loading
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('提交', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(height: 24),
            ]),
          ),
        ),
      ]),
    );
  }

  Widget _typeBtn(MaintenanceType t, String label, Color bg, Color border, Color textColor) {
    final sel = _type == t;
    return GestureDetector(
      onTap: () => setState(() => _type = t),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: sel ? textColor.withValues(alpha: 0.12) : const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: sel ? textColor : const Color(0xFFE5E7EB), width: sel ? 2.5 : 1),
          boxShadow: sel ? [BoxShadow(color: textColor.withValues(alpha: 0.2), blurRadius: 8, offset: const Offset(0, 2))] : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (sel) ...[
              Icon(Icons.check_circle, color: textColor, size: 20),
              const SizedBox(width: 6),
            ],
            Text(label, style: TextStyle(
              fontSize: 16,
              fontWeight: sel ? FontWeight.w700 : FontWeight.w400,
              color: sel ? textColor : const Color(0xFF9CA3AF),
            )),
          ],
        ),
      ),
    );
  }

  Widget _card(String label, bool req, Widget child) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          if (req) const Text('* ', style: TextStyle(color: Color(0xFFEF4444), fontSize: 13)),
          Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
        ]),
        const SizedBox(height: 10),
        child,
      ]),
    );
  }

  Widget _buildSuccess() {
    if (!_popScheduled) {
      _popScheduled = true;
      Future.delayed(const Duration(milliseconds: 1500), () {
        if (mounted) {
          if (Navigator.of(context).canPop()) {
            context.pop();
          } else {
            context.go('/home');
          }
        }
      });
    }
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 80, height: 80,
            decoration: const BoxDecoration(color: Color(0xFF22C55E), shape: BoxShape.circle),
            child: const Icon(Icons.check_rounded, color: Colors.white, size: 48),
          ),
          const SizedBox(height: 20),
          const Text('提交成功', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
          const SizedBox(height: 8),
          const Text('维保记录已保存', style: TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
        ],
      )),
    );
  }
}
