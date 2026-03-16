import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/mold_provider.dart';
import '../../providers/refresh.dart';
import '../../services/usage_record_service.dart';
import '../../services/mold_service.dart';
import '../../models/mold.dart';
import '../../config/constants.dart';
import '../../widgets/mold_search_select.dart';

class AddUsagePage extends ConsumerStatefulWidget {
  const AddUsagePage({super.key, this.moldId});

  final String? moldId;

  @override
  ConsumerState<AddUsagePage> createState() => _AddUsagePageState();
}

class _AddUsagePageState extends ConsumerState<AddUsagePage> {
  Mold? _mold;
  String? _product;
  int _quantity = 0;
  Shift _shift = Shift.morning;
  DateTime _date = DateTime.now();
  final _noteCtrl = TextEditingController();
  final _qtyCtrl = TextEditingController(text: '0');
  bool _loading = false;
  bool _showSuccess = false;

  @override
  void initState() {
    super.initState();
    _qtyCtrl.addListener(() {
      final v = int.tryParse(_qtyCtrl.text) ?? 0;
      if (_quantity != v) setState(() => _quantity = v);
    });
    if (widget.moldId != null && widget.moldId!.isNotEmpty) {
      MoldService.instance.getDetail(widget.moldId!).then((m) {
        if (mounted) {
          setState(() {
            _mold = m;
            _product = m.products.isNotEmpty ? (m.products.first.name ?? m.products.first.partNumber ?? '') : null;
          });
        }
      });
    }
  }

  @override
  void dispose() {
    _noteCtrl.dispose();
    _qtyCtrl.dispose();
    super.dispose();
  }

  void _reset() {
    setState(() {
      _mold = null;
      _product = null;
      _quantity = 0;
      _shift = Shift.morning;
      _date = DateTime.now();
      _noteCtrl.clear();
      _qtyCtrl.text = '0';
      _showSuccess = false;
    });
  }

  Future<void> _submit() async {
    final user = ref.read(authStateProvider).user;
    if (user == null) return;
    if (_mold == null) {
      Fluttertoast.showToast(msg: '请选择模具');
      return;
    }
    if (_product == null || _product!.isEmpty) {
      Fluttertoast.showToast(msg: '请选择关联产品');
      return;
    }
    final qty = int.tryParse(_qtyCtrl.text) ?? _quantity;
    if (qty <= 0) {
      Fluttertoast.showToast(msg: '请输入生产数量');
      return;
    }
    setState(() => _loading = true);
    try {
      await UsageRecordService.instance.create(
        _mold!.id,
        _product!,
        qty,
        _shift.apiValue,
        DateFormat('yyyy-MM-dd').format(_date),
        note: _noteCtrl.text.trim().isEmpty ? null : _noteCtrl.text.trim(),
      );
      refreshAfterRecord(ref, moldId: _mold?.id.toString());
      setState(() {
        _loading = false;
        _showSuccess = true;
      });
      Future.delayed(const Duration(milliseconds: 1500), () {
        if (!mounted) return;
        if (widget.moldId != null && Navigator.of(context).canPop()) {
          context.pop();
        } else {
          _reset();
        }
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
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.only(top: top),
            color: const Color(0xFF1A73E8),
            child: SizedBox(
              height: 56,
              child: Row(children: [
                if (widget.moldId != null) ...[
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
                ],
                Expanded(child: Text('新增使用记录', textAlign: widget.moldId != null ? TextAlign.left : TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600))),
              ]),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(children: [
                _card('模具编号', true, MoldSearchSelect(
                  initialMold: _mold,
                  inUseOnly: true,
                  onSelected: (m) => setState(() {
                    _mold = m;
                    _product = m.products.isNotEmpty
                        ? (m.products.first.name ?? m.products.first.partNumber ?? '')
                        : null;
                  }),
                )),
                const SizedBox(height: 12),
                _card('关联产品', true, Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3F4F6),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _product,
                      isExpanded: true,
                      hint: const Text('选择产品', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 15)),
                      items: (_mold?.products ?? []).map((p) {
                        final l = p.name ?? p.partNumber ?? '';
                        return DropdownMenuItem(value: l, child: Text(l, overflow: TextOverflow.ellipsis));
                      }).toList(),
                      onChanged: _mold != null ? (v) => setState(() => _product = v) : null,
                    ),
                  ),
                )),
                const SizedBox(height: 12),
                _card('生产数量', true, Row(children: [
                  _stepBtn(Icons.remove, () {
                    final v = (_quantity - 10).clamp(0, 999999);
                    _qtyCtrl.text = v.toString();
                  }),
                  const SizedBox(width: 8),
                  Expanded(child: TextField(
                    controller: _qtyCtrl,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
                    decoration: const InputDecoration(border: InputBorder.none),
                  )),
                  const Text('次', style: TextStyle(fontSize: 15, color: Color(0xFF6B7280))),
                  const SizedBox(width: 8),
                  _stepBtn(Icons.add, () {
                    final v = _quantity + 10;
                    _qtyCtrl.text = v.toString();
                  }),
                ])),
                const SizedBox(height: 12),
                _card('班次', true, Row(
                  children: Shift.values.map((s) {
                    final sel = _shift == s;
                    return Expanded(child: GestureDetector(
                      onTap: () => setState(() => _shift = s),
                      child: Container(
                        margin: EdgeInsets.only(right: s != Shift.night ? 10 : 0),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: sel ? const Color(0xFFEFF6FF) : const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: sel ? const Color(0xFF1A73E8) : Colors.transparent,
                            width: 1.5,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(s.label, style: TextStyle(
                          fontSize: 14,
                          fontWeight: sel ? FontWeight.w600 : FontWeight.normal,
                          color: sel ? const Color(0xFF1A73E8) : const Color(0xFF374151),
                        )),
                      ),
                    ));
                  }).toList(),
                )),
                const SizedBox(height: 12),
                _card('日期', false, GestureDetector(
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
                const SizedBox(height: 12),
                _card('备注', false, TextField(
                  controller: _noteCtrl,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: '选填',
                    hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
                    filled: true,
                    fillColor: const Color(0xFFF3F4F6),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.all(12),
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
        ],
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
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2))],
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

  Widget _stepBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40, height: 40,
        decoration: BoxDecoration(
          color: const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: const Color(0xFF374151)),
      ),
    );
  }

  Widget _buildSuccess() {
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
          const Text('使用记录已保存', style: TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
        ],
      )),
    );
  }
}
