import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../services/auth_service.dart';

class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({super.key});

  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  final _oldCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _showOld = false;
  bool _showNew = false;
  bool _showConfirm = false;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _newCtrl.addListener(() => setState(() {}));
    _confirmCtrl.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _oldCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  int _strength(String p) {
    if (p.isEmpty) return 0;
    var s = 0;
    if (p.length >= 8) s++;
    if (p.contains(RegExp(r'[A-Z]'))) s++;
    if (p.contains(RegExp(r'[0-9]'))) s++;
    if (p.contains(RegExp(r'[^a-zA-Z0-9]'))) s++;
    return s;
  }

  String _strengthLabel(int s) => switch (s) { 0 => '', 1 => '弱', 2 => '中', 3 => '强', _ => '很强' };
  Color _strengthColor(int s) => switch (s) { 1 => const Color(0xFFEF4444), 2 => const Color(0xFFF59E0B), _ => const Color(0xFF22C55E) };

  Future<void> _submit() async {
    final oldP = _oldCtrl.text;
    final newP = _newCtrl.text;
    final confirm = _confirmCtrl.text;
    if (oldP.isEmpty) { Fluttertoast.showToast(msg: '请输入原密码'); return; }
    if (newP.length < 8) { Fluttertoast.showToast(msg: '新密码至少8位'); return; }
    if (newP == oldP) { Fluttertoast.showToast(msg: '新密码不能与原密码相同'); return; }
    if (newP != confirm) { Fluttertoast.showToast(msg: '两次输入不一致'); return; }
    setState(() => _loading = true);
    try {
      await AuthService.instance.changePassword(oldP, newP);
      Fluttertoast.showToast(msg: '修改成功');
      if (mounted) context.pop();
    } catch (e) {
      Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    final strength = _strength(_newCtrl.text);
    final mismatch = _confirmCtrl.text.isNotEmpty && _newCtrl.text != _confirmCtrl.text;

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
                const Text('修改密码', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildPwdField('原密码', _oldCtrl, _showOld, () => setState(() => _showOld = !_showOld)),
                    const SizedBox(height: 20),
                    _buildPwdField('新密码', _newCtrl, _showNew, () => setState(() => _showNew = !_showNew)),
                    if (strength > 0) ...[
                      const SizedBox(height: 10),
                      Row(
                        children: List.generate(4, (i) {
                          return Expanded(
                            child: Container(
                              height: 4,
                              margin: EdgeInsets.only(right: i < 3 ? 4 : 0),
                              decoration: BoxDecoration(
                                color: i < strength ? _strengthColor(strength) : const Color(0xFFE5E7EB),
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: 6),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Text(_strengthLabel(strength), style: TextStyle(fontSize: 12, color: _strengthColor(strength))),
                      ),
                    ],
                    const SizedBox(height: 20),
                    _buildPwdField('确认新密码', _confirmCtrl, _showConfirm, () => setState(() => _showConfirm = !_showConfirm)),
                    if (mismatch)
                      const Padding(
                        padding: EdgeInsets.only(top: 6),
                        child: Text('两次输入不一致', style: TextStyle(fontSize: 12, color: Color(0xFFEF4444))),
                      ),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity, height: 48,
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
                            : const Text('确认修改', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPwdField(String label, TextEditingController ctrl, bool visible, VoidCallback toggle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF374151))),
        const SizedBox(height: 8),
        TextField(
          controller: ctrl,
          obscureText: !visible,
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color(0xFFF3F4F6),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            suffixIcon: IconButton(
              icon: Icon(visible ? Icons.visibility_off : Icons.visibility, color: const Color(0xFF9CA3AF), size: 20),
              onPressed: toggle,
            ),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          ),
        ),
      ],
    );
  }
}
