import 'package:flutter/material.dart';
import '../../widgets/confirm_dialog.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../services/workshop_service.dart';
import '../../models/workshop.dart';

class WorkshopManagementPage extends StatefulWidget {
  const WorkshopManagementPage({super.key});

  @override
  State<WorkshopManagementPage> createState() => _WorkshopManagementPageState();
}

class _WorkshopManagementPageState extends State<WorkshopManagementPage> {
  List<Workshop> _list = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _list = await WorkshopService.instance.getList();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('添加车间'),
        content: TextField(
          controller: ctrl,
          autofocus: true,
          decoration: InputDecoration(
            hintText: '车间名称',
            filled: true,
            fillColor: const Color(0xFFF3F4F6),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          TextButton(
            onPressed: () async {
              final name = ctrl.text.trim();
              if (name.isEmpty) { Fluttertoast.showToast(msg: '请输入名称'); return; }
              if (_list.any((w) => w.name == name)) { Fluttertoast.showToast(msg: '名称已存在'); return; }
              Navigator.pop(ctx);
              try {
                await WorkshopService.instance.create(name);
                Fluttertoast.showToast(msg: '添加成功');
                _load();
              } catch (e) {
                Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
              }
            },
            child: const Text('添加'),
          ),
        ],
      ),
    );
  }

  void _showEditDialog(Workshop ws) {
    final ctrl = TextEditingController(text: ws.name);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('编辑车间'),
        content: TextField(
          controller: ctrl,
          decoration: InputDecoration(
            hintText: '车间名称',
            filled: true,
            fillColor: const Color(0xFFF3F4F6),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          TextButton(
            onPressed: () async {
              final name = ctrl.text.trim();
              if (name.isEmpty) { Fluttertoast.showToast(msg: '请输入名称'); return; }
              if (_list.any((w) => w.name == name && w.id != ws.id)) { Fluttertoast.showToast(msg: '名称已存在'); return; }
              Navigator.pop(ctx);
              try {
                await WorkshopService.instance.update(ws.id, name);
                Fluttertoast.showToast(msg: '保存成功');
                _load();
              } catch (e) {
                Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
              }
            },
            child: const Text('保存'),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDelete(Workshop ws) async {
    final confirmed = await ConfirmDialog.show(context, title: '删除车间', content: '确定要删除该车间吗？此操作不可恢复。');
    if (!confirmed) return;
    try {
      await WorkshopService.instance.delete(ws.id);
      Fluttertoast.showToast(msg: '删除成功');
      _load();
    } catch (e) {
      Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
    }
  }

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
                const Expanded(child: Text('车间管理', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white))),
                GestureDetector(
                  onTap: _showAddDialog,
                  child: Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.25)),
                    child: const Icon(Icons.add, size: 20, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _list.isEmpty
                    ? const Center(child: Text('暂无车间', style: TextStyle(color: Color(0xFF9CA3AF))))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _list.length,
                        itemBuilder: (_, i) => _WorkshopCard(
                          workshop: _list[i],
                          onEdit: () => _showEditDialog(_list[i]),
                          onDelete: _list[i].isDefault ? null : () => _confirmDelete(_list[i]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _WorkshopCard extends StatelessWidget {
  const _WorkshopCard({required this.workshop, required this.onEdit, this.onDelete});
  final Workshop workshop;
  final VoidCallback onEdit;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)],
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: const Color(0xFF1A73E8).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.factory_outlined, color: Color(0xFF1A73E8), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Row(
              children: [
                Flexible(child: Text(workshop.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1F2937)), maxLines: 1, overflow: TextOverflow.ellipsis)),
                if (workshop.isDefault) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(6)),
                    child: const Text('默认', style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                  ),
                ],
              ],
            ),
          ),
          GestureDetector(onTap: onEdit, child: const Padding(padding: EdgeInsets.all(6), child: Icon(Icons.edit_outlined, size: 20, color: Color(0xFF9CA3AF)))),
          if (onDelete != null)
            GestureDetector(onTap: onDelete, child: const Padding(padding: EdgeInsets.all(6), child: Icon(Icons.delete_outline, size: 20, color: Color(0xFF9CA3AF)))),
        ],
      ),
    );
  }
}
