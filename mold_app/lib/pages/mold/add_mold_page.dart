import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../services/mold_service.dart';
import '../../services/workshop_service.dart';
import '../../models/workshop.dart';
import '../../config/constants.dart';
import '../../providers/mold_provider.dart';
import '../../providers/workshop_provider.dart';

class AddMoldPage extends ConsumerStatefulWidget {
  const AddMoldPage({super.key});

  @override
  ConsumerState<AddMoldPage> createState() => _AddMoldPageState();
}

class _AddMoldPageState extends ConsumerState<AddMoldPage> {
  final _formKey = GlobalKey<FormState>();
  final _moldNumberCtrl = TextEditingController();
  final _designLifeCtrl = TextEditingController();
  final _maintCycleCtrl = TextEditingController();

  MoldType _type = MoldType.extrusion;
  String? _workshopId;
  DateTime? _firstUseDate;
  final List<_ProductForm> _products = [_ProductForm()];
  bool _loading = false;

  @override
  void dispose() {
    _moldNumberCtrl.dispose();
    _designLifeCtrl.dispose();
    _maintCycleCtrl.dispose();
    for (final p in _products) {
      p.dispose();
    }
    super.dispose();
  }

  int? get _designLife => int.tryParse(_designLifeCtrl.text);
  int? get _maintCycle => int.tryParse(_maintCycleCtrl.text);
  int? get _maintCount {
    final dl = _designLife;
    final mc = _maintCycle;
    if (dl != null && mc != null && mc > 0) return dl ~/ mc;
    return null;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_products.any((p) => p.nameCtrl.text.trim().isEmpty)) {
      Fluttertoast.showToast(msg: '请填写所有产品名称');
      return;
    }
    setState(() => _loading = true);
    try {
      final data = {
        'moldNumber': _moldNumberCtrl.text.trim(),
        'type': _type.apiValue,
        if (_workshopId != null && _workshopId!.isNotEmpty) 'workshopId': int.tryParse(_workshopId!),
        if (_firstUseDate != null) 'firstUseDate': DateFormat('yyyy-MM-dd').format(_firstUseDate!),
        'designLife': _designLife!,
        'maintenanceCycle': _maintCycle!,
        'products': _products
            .map((p) => {
                  'name': p.nameCtrl.text.trim(),
                  if (p.customerCtrl.text.trim().isNotEmpty) 'customer': p.customerCtrl.text.trim(),
                  if (p.modelCtrl.text.trim().isNotEmpty) 'model': p.modelCtrl.text.trim(),
                  if (p.partNumberCtrl.text.trim().isNotEmpty) 'partNumber': p.partNumberCtrl.text.trim(),
                })
            .toList(),
      };
      await MoldService.instance.create(data);
      if (!mounted) return;
      ref.invalidate(moldListNotifierProvider);
      context.go('/molds');
    } catch (e) {
      Fluttertoast.showToast(msg: '$e'.replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final workshops = ref.watch(workshopListProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _buildBasicInfo(workshops),
                  const SizedBox(height: 16),
                  _buildUsageParams(),
                  const SizedBox(height: 16),
                  _buildProducts(),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1A73E8),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: _loading
                          ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('保存', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
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
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('新增模具', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                  Text('仅管理员可操作', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBasicInfo(AsyncValue<List<Workshop>> workshops) {
    return _card(
      title: '基本信息',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _input(_moldNumberCtrl, '模具编号', validator: (v) => v?.trim().isEmpty ?? true ? '必填' : null),
          const SizedBox(height: 16),
          const Text('模具类型', style: TextStyle(fontSize: 13, color: Color(0xFF666666))),
          const SizedBox(height: 8),
          Wrap(
            spacing: 10,
            runSpacing: 8,
            children: MoldType.values.map((t) {
              final selected = _type == t;
              return GestureDetector(
                onTap: () => setState(() => _type = t),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: selected ? const Color(0xFF1A73E8) : const Color(0xFFF0F4FF),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(t.label, style: TextStyle(fontSize: 14, color: selected ? Colors.white : const Color(0xFF1A73E8), fontWeight: FontWeight.w500)),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          workshops.when(
            data: (list) {
              if (list.isEmpty) return const SizedBox.shrink();
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('所属车间', style: TextStyle(fontSize: 13, color: Color(0xFF666666))),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 10,
                    runSpacing: 8,
                    children: list.map((w) {
                      final selected = _workshopId == w.id;
                      return GestureDetector(
                        onTap: () => setState(() => _workshopId = selected ? null : w.id),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: selected ? const Color(0xFF1A73E8) : const Color(0xFFF0F4FF),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(w.name, style: TextStyle(fontSize: 14, color: selected ? Colors.white : const Color(0xFF1A73E8), fontWeight: FontWeight.w500)),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                ],
              );
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
          GestureDetector(
            onTap: () async {
              final d = await showDatePicker(
                context: context,
                initialDate: _firstUseDate ?? DateTime.now(),
                firstDate: DateTime(2000),
                lastDate: DateTime.now(),
              );
              if (d != null) setState(() => _firstUseDate = d);
            },
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFDDDDDD)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      _firstUseDate != null ? DateFormat('yyyy-MM-dd').format(_firstUseDate!) : '首次使用日期',
                      style: TextStyle(fontSize: 14, color: _firstUseDate != null ? Colors.black87 : Colors.grey[500]),
                    ),
                  ),
                  Icon(Icons.calendar_today_outlined, size: 18, color: Colors.grey[400]),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUsageParams() {
    return _card(
      title: '使用参数',
      child: Column(
        children: [
          _input(_designLifeCtrl, '设计寿命(次)', keyboardType: TextInputType.number, validator: (v) {
            final n = int.tryParse(v ?? '');
            return n == null || n < 1 ? '请输入正整数' : null;
          }, onChanged: (_) => setState(() {})),
          const SizedBox(height: 12),
          _input(_maintCycleCtrl, '保养周期(次)', keyboardType: TextInputType.number, validator: (v) {
            final n = int.tryParse(v ?? '');
            return n == null || n < 1 ? '请输入正整数' : null;
          }, onChanged: (_) => setState(() {})),
          if (_maintCount != null) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F4FF),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('预计可保养 $_maintCount 次', style: const TextStyle(fontSize: 13, color: Color(0xFF1A73E8))),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildProducts() {
    return _card(
      title: '关联产品',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...List.generate(_products.length, (i) {
            final p = _products[i];
            return Container(
              margin: EdgeInsets.only(bottom: i < _products.length - 1 ? 16 : 0),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Text('产品 ${i + 1}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                      const Spacer(),
                      if (_products.length > 1)
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              _products[i].dispose();
                              _products.removeAt(i);
                            });
                          },
                          child: const Icon(Icons.close, size: 18, color: Colors.red),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _input(p.nameCtrl, '产品名称', validator: (v) => v?.trim().isEmpty ?? true ? '必填' : null),
                  const SizedBox(height: 8),
                  _input(p.customerCtrl, '客户'),
                  const SizedBox(height: 8),
                  _input(p.modelCtrl, '车型'),
                  const SizedBox(height: 8),
                  _input(p.partNumberCtrl, '零件号'),
                ],
              ),
            );
          }),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => setState(() => _products.add(_ProductForm())),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFF1A73E8), style: BorderStyle.solid),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add, size: 18, color: Color(0xFF1A73E8)),
                  SizedBox(width: 6),
                  Text('添加产品', style: TextStyle(fontSize: 14, color: Color(0xFF1A73E8), fontWeight: FontWeight.w500)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _card({required String title, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _input(TextEditingController ctrl, String hint, {
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    ValueChanged<String>? onChanged,
  }) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboardType,
      validator: validator,
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
        filled: true,
        fillColor: const Color(0xFFF9FAFB),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE0E0E0))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE0E0E0))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF1A73E8))),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      ),
    );
  }
}

class _ProductForm {
  final nameCtrl = TextEditingController();
  final customerCtrl = TextEditingController();
  final modelCtrl = TextEditingController();
  final partNumberCtrl = TextEditingController();

  void dispose() {
    nameCtrl.dispose();
    customerCtrl.dispose();
    modelCtrl.dispose();
    partNumberCtrl.dispose();
  }
}
