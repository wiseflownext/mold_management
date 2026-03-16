import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../services/mold_service.dart';
import '../../services/workshop_service.dart';
import '../../models/mold.dart';
import '../../models/workshop.dart';
import '../../config/constants.dart';
import '../../providers/refresh.dart';
import '../../widgets/confirm_dialog.dart';

class EditMoldPage extends ConsumerStatefulWidget {
  const EditMoldPage({super.key, required this.moldId});
  final String moldId;

  @override
  ConsumerState<EditMoldPage> createState() => _EditMoldPageState();
}

class _EditMoldPageState extends ConsumerState<EditMoldPage> {
  final _formKey = GlobalKey<FormState>();
  final _moldNumberCtrl = TextEditingController();
  final _maintCycleCtrl = TextEditingController();
  final _periodicDaysCtrl = TextEditingController();
  final _cavityCtrl = TextEditingController();

  MoldType _type = MoldType.extrusion;
  String? _workshopId;
  DateTime? _firstUseDate;
  bool _loading = false;
  bool _fetching = true;
  Mold? _mold;
  List<MoldProduct> _products = [];
  List<Workshop> _workshops = [];
  bool _dirty = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        MoldService.instance.getDetail(widget.moldId),
        WorkshopService.instance.getList(),
      ]);
      if (!mounted) return;
      final mold = results[0] as Mold;
      _mold = mold;
      _workshops = results[1] as List<Workshop>;
      _moldNumberCtrl.text = mold.moldNumber;
      _type = MoldType.fromApi(mold.type) ?? MoldType.extrusion;
      _workshopId = mold.workshopId;
      _firstUseDate = mold.firstUseDate;
      _maintCycleCtrl.text = (mold.maintenanceCycle ?? 0).toString();
      _periodicDaysCtrl.text = (mold.periodicMaintenanceDays ?? 0) > 0 ? mold.periodicMaintenanceDays.toString() : '';
      _cavityCtrl.text = mold.cavityCount.toString();
      _products = List.from(mold.products);
      setState(() => _fetching = false);
    } catch (e) {
      if (!mounted) return;
      setState(() => _fetching = false);
      Fluttertoast.showToast(msg: '加载失败: $e');
    }
  }

  @override
  void dispose() {
    _moldNumberCtrl.dispose();
    _maintCycleCtrl.dispose();
    _periodicDaysCtrl.dispose();
    _cavityCtrl.dispose();
    super.dispose();
  }

  void _goBack() {
    if (_dirty) refreshAfterMoldChange(ref, moldId: widget.moldId);
    context.pop();
  }

  Future<void> _submit() async {
    final mold = _mold;
    if (mold == null) return;
    if (!_formKey.currentState!.validate()) return;
    final ok = await ConfirmDialog.show(
      context,
      title: '确认修改',
      content: '确定要修改模具信息吗？使用寿命仅能通过上传鉴定报告修改。',
      confirmText: '确认修改',
      confirmColor: const Color(0xFF1A73E8),
    );
    if (!ok || !mounted) return;
    setState(() => _loading = true);
    try {
      final data = <String, dynamic>{
        'moldNumber': _moldNumberCtrl.text.trim(),
        'type': _type.apiValue,
        if (_workshopId != null && _workshopId!.isNotEmpty) 'workshopId': int.tryParse(_workshopId!),
        if (_firstUseDate != null) 'firstUseDate': DateFormat('yyyy-MM-dd').format(_firstUseDate!),
        'maintenanceCycle': int.tryParse(_maintCycleCtrl.text) ?? mold.maintenanceCycle,
        'cavityCount': int.tryParse(_cavityCtrl.text) ?? 1,
      };
      if (_periodicDaysCtrl.text.isNotEmpty) {
        data['periodicMaintenanceDays'] = int.tryParse(_periodicDaysCtrl.text);
      }
      await MoldService.instance.update(mold.id, data);
      if (!mounted) return;
      Fluttertoast.showToast(msg: '修改成功');
      refreshAfterMoldChange(ref, moldId: mold.id);
      context.pop();
    } catch (e) {
      Fluttertoast.showToast(msg: '$e'.replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addProduct() async {
    final mold = _mold;
    if (mold == null) return;
    final result = await _showProductDialog(context);
    if (result == null || !mounted) return;
    try {
      final p = await MoldService.instance.addProduct(mold.id, result);
      if (!mounted) return;
      setState(() { _products.add(p); _dirty = true; });
      Fluttertoast.showToast(msg: '添加成功');
    } catch (e) {
      Fluttertoast.showToast(msg: '$e'.replaceAll('Exception: ', ''));
    }
  }

  Future<void> _editProduct(MoldProduct p, int idx) async {
    final result = await _showProductDialog(context, product: p);
    if (result == null || !mounted) return;
    try {
      final updated = await MoldService.instance.updateProduct(p.id, result);
      if (!mounted) return;
      setState(() { _products[idx] = updated; _dirty = true; });
      Fluttertoast.showToast(msg: '修改成功');
    } catch (e) {
      Fluttertoast.showToast(msg: '$e'.replaceAll('Exception: ', ''));
    }
  }

  Future<void> _deleteProduct(MoldProduct p, int idx) async {
    final ok = await ConfirmDialog.show(context, title: '删除产品', content: '确定删除「${p.name ?? ''}」？');
    if (!ok || !mounted) return;
    try {
      await MoldService.instance.removeProduct(p.id);
      if (!mounted) return;
      setState(() { _products.removeAt(idx); _dirty = true; });
      Fluttertoast.showToast(msg: '删除成功');
    } catch (e) {
      Fluttertoast.showToast(msg: '$e'.replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_fetching) {
      return const Scaffold(
        backgroundColor: Color(0xFFF5F7FA),
        body: Center(child: CircularProgressIndicator()),
      );
    }
    if (_mold == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF5F7FA),
        body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('加载失败', style: TextStyle(color: Colors.red)),
          const SizedBox(height: 16),
          TextButton(onPressed: _goBack, child: const Text('返回')),
        ])),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(children: [
        _buildHeader(),
        Expanded(child: Form(
          key: _formKey,
          child: ListView(padding: const EdgeInsets.all(16), children: [
            _buildBasicInfo(),
            const SizedBox(height: 16),
            _buildParams(),
            const SizedBox(height: 16),
            _buildProducts(),
            const SizedBox(height: 16),
            _buildLifeInfo(),
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
                    : const Text('保存修改', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
            const SizedBox(height: 16),
          ]),
        )),
      ]),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
      decoration: const BoxDecoration(color: Color(0xFF1A73E8)),
      child: SizedBox(
        height: 56,
        child: Row(children: [
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _goBack,
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
              const Text('编辑模具', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              Text('使用寿命仅通过鉴定报告修改', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
            ],
          )),
        ]),
      ),
    );
  }

  Widget _buildBasicInfo() {
    return _card('基本信息', Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _input(_moldNumberCtrl, '模具编号', validator: (v) => v?.trim().isEmpty ?? true ? '必填' : null),
      const SizedBox(height: 16),
      const Text('模具类型', style: TextStyle(fontSize: 13, color: Color(0xFF666666))),
      const SizedBox(height: 8),
      Wrap(spacing: 10, runSpacing: 8, children: MoldType.values.map((t) {
        final sel = _type == t;
        return GestureDetector(
          onTap: () => setState(() => _type = t),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: sel ? const Color(0xFF1A73E8) : const Color(0xFFF0F4FF),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(t.label, style: TextStyle(fontSize: 14, color: sel ? Colors.white : const Color(0xFF1A73E8), fontWeight: FontWeight.w500)),
          ),
        );
      }).toList()),
      const SizedBox(height: 16),
      if (_workshops.isNotEmpty) ...[
        const Text('所属车间', style: TextStyle(fontSize: 13, color: Color(0xFF666666))),
        const SizedBox(height: 8),
        Wrap(spacing: 10, runSpacing: 8, children: _workshops.map((w) {
          final sel = _workshopId == w.id;
          return GestureDetector(
            onTap: () => setState(() => _workshopId = sel ? null : w.id),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: sel ? const Color(0xFF1A73E8) : const Color(0xFFF0F4FF),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(w.name, style: TextStyle(fontSize: 14, color: sel ? Colors.white : const Color(0xFF1A73E8), fontWeight: FontWeight.w500)),
            ),
          );
        }).toList()),
        const SizedBox(height: 16),
      ],
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
          child: Row(children: [
            Expanded(child: Text(
              _firstUseDate != null ? DateFormat('yyyy-MM-dd').format(_firstUseDate!) : '首次使用日期',
              style: TextStyle(fontSize: 14, color: _firstUseDate != null ? Colors.black87 : Colors.grey[500]),
            )),
            Icon(Icons.calendar_today_outlined, size: 18, color: Colors.grey[400]),
          ]),
        ),
      ),
    ]));
  }

  Widget _buildParams() {
    return _card('使用参数', Column(children: [
      _input(_maintCycleCtrl, '保养周期(次)', keyboardType: TextInputType.number, validator: (v) {
        final n = int.tryParse(v ?? '');
        return n == null || n < 1 ? '请输入正整数' : null;
      }),
      const SizedBox(height: 12),
      _input(_periodicDaysCtrl, '定期保养(天)  如30=月保 90=季保', keyboardType: TextInputType.number),
      const SizedBox(height: 12),
      _input(_cavityCtrl, '模腔数(一模出几件)', keyboardType: TextInputType.number, validator: (v) {
        if (v == null || v.isEmpty) return null;
        final n = int.tryParse(v);
        return n != null && n >= 1 ? null : '请输入>=1的整数';
      }),
    ]));
  }

  Widget _buildProducts() {
    return _card('关联产品', Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      ..._products.asMap().entries.map((e) {
        final idx = e.key;
        final p = e.value;
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFF),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFDBEAFE)),
          ),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(p.name ?? '', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF111827))),
              if (p.customer != null && p.customer!.isNotEmpty)
                Text('客户: ${p.customer}', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
              if (p.model != null && p.model!.isNotEmpty)
                Text('车型: ${p.model}', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
              if (p.partNumber != null && p.partNumber!.isNotEmpty)
                Text('零件号: ${p.partNumber}', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
            ])),
            GestureDetector(
              onTap: () => _editProduct(p, idx),
              child: const Padding(padding: EdgeInsets.all(4), child: Icon(Icons.edit_outlined, size: 18, color: Color(0xFF1A73E8))),
            ),
            const SizedBox(width: 4),
            GestureDetector(
              onTap: () => _deleteProduct(p, idx),
              child: const Padding(padding: EdgeInsets.all(4), child: Icon(Icons.delete_outline, size: 18, color: Color(0xFFEF4444))),
            ),
          ]),
        );
      }),
      GestureDetector(
        onTap: _addProduct,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFF1A73E8)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.add, size: 18, color: Color(0xFF1A73E8)),
            SizedBox(width: 6),
            Text('添加产品', style: TextStyle(fontSize: 14, color: Color(0xFF1A73E8), fontWeight: FontWeight.w500)),
          ]),
        ),
      ),
    ]));
  }

  Widget _buildLifeInfo() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFED7AA)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Row(children: [
          Icon(Icons.info_outline, size: 16, color: Color(0xFFF59E0B)),
          SizedBox(width: 6),
          Text('设计寿命', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF92400E))),
        ]),
        const SizedBox(height: 8),
        Text('${_mold?.designLife ?? 0} 次', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Color(0xFF92400E))),
        const SizedBox(height: 4),
        const Text('仅通过上传鉴定报告修改', style: TextStyle(fontSize: 12, color: Color(0xFFB45309))),
      ]),
    );
  }

  Widget _card(String title, Widget child) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 16),
        child,
      ]),
    );
  }

  Widget _input(TextEditingController ctrl, String hint, {
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboardType,
      validator: validator,
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

Future<Map<String, dynamic>?> _showProductDialog(BuildContext context, {MoldProduct? product}) {
  final nameCtrl = TextEditingController(text: product?.name ?? '');
  final customerCtrl = TextEditingController(text: product?.customer ?? '');
  final modelCtrl = TextEditingController(text: product?.model ?? '');
  final partCtrl = TextEditingController(text: product?.partNumber ?? '');
  final formKey = GlobalKey<FormState>();

  return showDialog<Map<String, dynamic>>(
    context: context,
    builder: (ctx) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(product == null ? '添加产品' : '编辑产品', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
      content: Form(
        key: formKey,
        child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
          TextFormField(
            controller: nameCtrl,
            decoration: const InputDecoration(labelText: '产品名称', isDense: true),
            validator: (v) => v?.trim().isEmpty ?? true ? '必填' : null,
          ),
          const SizedBox(height: 8),
          TextFormField(controller: customerCtrl, decoration: const InputDecoration(labelText: '客户', isDense: true)),
          const SizedBox(height: 8),
          TextFormField(controller: modelCtrl, decoration: const InputDecoration(labelText: '车型', isDense: true)),
          const SizedBox(height: 8),
          TextFormField(controller: partCtrl, decoration: const InputDecoration(labelText: '零件号', isDense: true)),
        ])),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('取消', style: TextStyle(color: Color(0xFF6B7280))),
        ),
        TextButton(
          onPressed: () {
            if (!formKey.currentState!.validate()) return;
            Navigator.pop(ctx, {
              'name': nameCtrl.text.trim(),
              if (customerCtrl.text.trim().isNotEmpty) 'customer': customerCtrl.text.trim(),
              if (modelCtrl.text.trim().isNotEmpty) 'model': modelCtrl.text.trim(),
              if (partCtrl.text.trim().isNotEmpty) 'partNumber': partCtrl.text.trim(),
            });
          },
          child: const Text('确定', style: TextStyle(color: Color(0xFF1A73E8), fontWeight: FontWeight.w600)),
        ),
      ],
    ),
  );
}
