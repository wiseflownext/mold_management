import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _darkMode = false;
  bool _autoSync = true;
  int _syncInterval = 15;
  String _cacheSize = '计算中...';

  @override
  void initState() {
    super.initState();
    _calcCache();
  }

  Future<void> _calcCache() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      var size = 0;
      await for (final e in Directory(dir.path).list(recursive: true, followLinks: false)) {
        if (e is File) size += await e.length();
      }
      if (!mounted) return;
      setState(() {
        if (size < 1024) {
          _cacheSize = '$size B';
        } else if (size < 1024 * 1024) {
          _cacheSize = '${(size / 1024).toStringAsFixed(1)} KB';
        } else {
          _cacheSize = '${(size / 1024 / 1024).toStringAsFixed(1)} MB';
        }
      });
    } catch (_) {
      if (mounted) setState(() => _cacheSize = '0 B');
    }
  }

  Future<void> _clearCache() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      await for (final e in Directory(dir.path).list(recursive: true, followLinks: false)) {
        if (e is File) await e.delete();
      }
      if (!mounted) return;
      setState(() => _cacheSize = '0 B');
      Fluttertoast.showToast(msg: '缓存已清除');
    } catch (_) {
      Fluttertoast.showToast(msg: '清除失败');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _sectionLabel('显示设置'),
                const SizedBox(height: 8),
                _card(
                  child: _row(
                    icon: Icons.dark_mode_outlined,
                    title: '深色模式',
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('即将推出', style: TextStyle(fontSize: 12, color: Colors.grey[500])),
                        const SizedBox(width: 8),
                        Switch(value: _darkMode, onChanged: null),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                _sectionLabel('数据设置'),
                const SizedBox(height: 8),
                _card(
                  child: Column(
                    children: [
                      _row(
                        icon: Icons.sync,
                        title: '自动同步',
                        trailing: Switch(
                          value: _autoSync,
                          activeColor: const Color(0xFF1A73E8),
                          onChanged: (v) => setState(() => _autoSync = v),
                        ),
                      ),
                      const Divider(height: 1),
                      _row(
                        icon: Icons.timer_outlined,
                        title: '同步间隔',
                        trailing: _buildIntervalSelector(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                _sectionLabel('存储管理'),
                const SizedBox(height: 8),
                _card(
                  child: _row(
                    icon: Icons.folder_outlined,
                    title: '缓存大小',
                    subtitle: _cacheSize,
                    trailing: TextButton(
                      onPressed: _clearCache,
                      style: TextButton.styleFrom(
                        foregroundColor: const Color(0xFF1A73E8),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: const BorderSide(color: Color(0xFF1A73E8)),
                        ),
                      ),
                      child: const Text('清除缓存', style: TextStyle(fontSize: 13)),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                _sectionLabel('版本'),
                const SizedBox(height: 8),
                _card(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, size: 20, color: Color(0xFF1A73E8)),
                        const SizedBox(width: 12),
                        const Text('v2.1.0', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text('已是最新', style: TextStyle(fontSize: 12, color: Color(0xFF2E7D32))),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
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
            const Text('系统设置', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildIntervalSelector() {
    return PopupMenuButton<int>(
      onSelected: (v) => setState(() => _syncInterval = v),
      itemBuilder: (_) => [5, 15, 30, 60]
          .map((v) => PopupMenuItem(value: v, child: Text('$v 分钟')))
          .toList(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFF0F4FF),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('$_syncInterval 分钟', style: const TextStyle(fontSize: 14, color: Color(0xFF1A73E8))),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_drop_down, color: Color(0xFF1A73E8), size: 20),
          ],
        ),
      ),
    );
  }

  Widget _sectionLabel(String text) {
    return Text(text, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[600]));
  }

  Widget _card({required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)],
      ),
      child: child,
    );
  }

  Widget _row({required IconData icon, required String title, String? subtitle, required Widget trailing}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF1A73E8)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 15)),
                if (subtitle != null)
                  Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.grey[500])),
              ],
            ),
          ),
          trailing,
        ],
      ),
    );
  }
}
