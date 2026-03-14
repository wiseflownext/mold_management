import 'package:flutter/material.dart';
import '../../widgets/confirm_dialog.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../services/user_service.dart';
import '../../services/workshop_service.dart';
import '../../models/user.dart';
import '../../models/workshop.dart';
import '../../config/constants.dart';

class EmployeeManagementPage extends StatefulWidget {
  const EmployeeManagementPage({super.key});

  @override
  State<EmployeeManagementPage> createState() => _EmployeeManagementPageState();
}

class _EmployeeManagementPageState extends State<EmployeeManagementPage> {
  final _searchCtrl = TextEditingController();
  List<User> _users = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final keyword = _searchCtrl.text.trim();
      final r = await UserService.instance.getList(1, 100, keyword: keyword.isEmpty ? null : keyword);
      if (mounted) setState(() => _users = r.items);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showForm({User? user}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _EmployeeForm(user: user, onSaved: _load),
    );
  }

  Future<void> _confirmDelete(User user) async {
    final confirmed = await ConfirmDialog.show(context, title: '删除员工', content: '确定要删除该员工吗？此操作不可恢复。');
    if (!confirmed) return;
    try {
      await UserService.instance.delete(user.id);
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
                const Expanded(child: Text('员工管理', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white))),
                GestureDetector(
                  onTap: () => _showForm(),
                  child: Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.25)),
                    child: const Icon(Icons.add, size: 20, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (_) => _load(),
              decoration: InputDecoration(
                hintText: '搜索员工',
                hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF9CA3AF)),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _users.isEmpty
                    ? const Center(child: Text('暂无员工', style: TextStyle(color: Color(0xFF9CA3AF))))
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        itemCount: _users.length,
                        itemBuilder: (_, i) => _EmployeeCard(
                          user: _users[i],
                          onEdit: () => _showForm(user: _users[i]),
                          onDelete: () => _confirmDelete(_users[i]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _EmployeeCard extends StatelessWidget {
  const _EmployeeCard({required this.user, required this.onEdit, required this.onDelete});
  final User user;
  final VoidCallback onEdit, onDelete;

  @override
  Widget build(BuildContext context) {
    final initial = user.name.isNotEmpty ? user.name[0] : '?';
    final isAdmin = user.role == 'admin';
    final roleColor = isAdmin ? const Color(0xFF1A73E8) : const Color(0xFF22C55E);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: roleColor.withValues(alpha: 0.15),
            child: Text(initial, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: roleColor)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(child: Text(user.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1F2937)), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: roleColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
                      child: Text(isAdmin ? Role.admin.label : Role.operator.label, style: TextStyle(fontSize: 11, color: roleColor, fontWeight: FontWeight.w500)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(user.username, style: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
              ],
            ),
          ),
          GestureDetector(onTap: onEdit, child: const Padding(padding: EdgeInsets.all(6), child: Icon(Icons.edit_outlined, size: 20, color: Color(0xFF9CA3AF)))),
          GestureDetector(onTap: onDelete, child: const Padding(padding: EdgeInsets.all(6), child: Icon(Icons.delete_outline, size: 20, color: Color(0xFF9CA3AF)))),
        ],
      ),
    );
  }
}

class _EmployeeForm extends StatefulWidget {
  const _EmployeeForm({this.user, required this.onSaved});
  final User? user;
  final VoidCallback onSaved;

  @override
  State<_EmployeeForm> createState() => _EmployeeFormState();
}

class _EmployeeFormState extends State<_EmployeeForm> {
  final _usernameCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  String _role = 'operator';
  String? _workshopId;
  List<Workshop> _workshops = [];
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    if (widget.user != null) {
      _usernameCtrl.text = widget.user!.username;
      _nameCtrl.text = widget.user!.name;
      _role = widget.user!.role;
    }
    WorkshopService.instance.getList().then((l) {
      if (!mounted) return;
      setState(() {
        _workshops = l;
        if (widget.user?.workshopId != null) {
          _workshopId = widget.user!.workshopId;
        } else if (widget.user?.workshop != null) {
          try { _workshopId = l.firstWhere((w) => w.name == widget.user!.workshop).id; } catch (_) {}
        }
      });
    });
  }

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _nameCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final username = _usernameCtrl.text.trim();
    final name = _nameCtrl.text.trim();
    final password = _passwordCtrl.text;
    if (username.isEmpty || name.isEmpty) { Fluttertoast.showToast(msg: '请填写账号和姓名'); return; }
    if (widget.user == null && password.isEmpty) { Fluttertoast.showToast(msg: '请输入密码'); return; }
    setState(() => _saving = true);
    try {
      if (widget.user != null) {
        if (password.isNotEmpty) {
          final confirmed = await ConfirmDialog.show(context, title: '重置密码', content: '确定要重置该用户的密码吗？', confirmColor: const Color(0xFFF59E0B));
          if (!confirmed) return;
        }
        await UserService.instance.update(widget.user!.id, {'name': name, 'role': _role, if (_workshopId != null) 'workshopId': int.tryParse(_workshopId!)});
        if (password.isNotEmpty) await UserService.instance.resetPassword(widget.user!.id, password);
      } else {
        await UserService.instance.create({'username': username, 'name': name, 'password': password, 'role': _role, if (_workshopId != null) 'workshopId': int.tryParse(_workshopId!)});
      }
      Fluttertoast.showToast(msg: '保存成功');
      if (mounted) Navigator.pop(context);
      widget.onSaved();
    } catch (e) {
      Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottom),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: const Color(0xFFE5E7EB), borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 16),
            Text(widget.user != null ? '编辑员工' : '添加员工', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 20),
            _buildField('用户名', _usernameCtrl, enabled: widget.user == null),
            const SizedBox(height: 14),
            _buildField('姓名', _nameCtrl),
            const SizedBox(height: 14),
            _buildField('密码${widget.user != null ? "(留空不修改)" : ""}', _passwordCtrl, obscure: true),
            const SizedBox(height: 14),
            const Text('角色', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF374151))),
            const SizedBox(height: 8),
            Row(
              children: [
                _RoleChip(label: '管理员', selected: _role == 'admin', onTap: () => setState(() => _role = 'admin')),
                const SizedBox(width: 10),
                _RoleChip(label: '操作员', selected: _role == 'operator', onTap: () => setState(() => _role = 'operator')),
              ],
            ),
            const SizedBox(height: 14),
            const Text('车间', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF374151))),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(10)),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _workshopId,
                  hint: const Text('选择车间', style: TextStyle(color: Color(0xFF9CA3AF))),
                  isExpanded: true,
                  items: _workshops.map((w) => DropdownMenuItem(value: w.id, child: Text(w.name))).toList(),
                  onChanged: (v) => setState(() => _workshopId = v),
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity, height: 48,
              child: ElevatedButton(
                onPressed: _saving ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1A73E8),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: _saving
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('保存', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController ctrl, {bool obscure = false, bool enabled = true}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF374151))),
        const SizedBox(height: 8),
        TextField(
          controller: ctrl,
          obscureText: obscure,
          enabled: enabled,
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color(0xFFF3F4F6),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          ),
        ),
      ],
    );
  }
}

class _RoleChip extends StatelessWidget {
  const _RoleChip({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF1A73E8) : const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(label, style: TextStyle(color: selected ? Colors.white : const Color(0xFF6B7280), fontWeight: FontWeight.w500)),
      ),
    );
  }
}
