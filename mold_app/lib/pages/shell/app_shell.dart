import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/refresh.dart';

class AppShell extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;
  const AppShell({super.key, required this.navigationShell});

  void _onTap(WidgetRef ref, int index) {
    if (index == 0 || index == 1 || index == 3) refreshAll(ref);
    navigationShell.goBranch(index);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Color(0x0F000000), blurRadius: 10, offset: Offset(0, -2))],
        ),
        child: SafeArea(
          child: SizedBox(
            height: 56,
            child: Row(
              children: [
                _Tab(icon: Icons.home_outlined, activeIcon: Icons.home, label: '首页', index: 0, current: navigationShell.currentIndex, onTap: () => _onTap(ref, 0)),
                _Tab(icon: Icons.view_in_ar_outlined, activeIcon: Icons.view_in_ar, label: '模具', index: 1, current: navigationShell.currentIndex, onTap: () => _onTap(ref, 1)),
                _CenterTab(onTap: () => _onTap(ref, 2), isActive: navigationShell.currentIndex == 2),
                _Tab(icon: Icons.notifications_outlined, activeIcon: Icons.notifications, label: '维保', index: 3, current: navigationShell.currentIndex, onTap: () => _onTap(ref, 3)),
                _Tab(icon: Icons.person_outline, activeIcon: Icons.person, label: '我的', index: 4, current: navigationShell.currentIndex, onTap: () => _onTap(ref, 4)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int index;
  final int current;
  final VoidCallback onTap;
  const _Tab({required this.icon, required this.activeIcon, required this.label, required this.index, required this.current, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final active = index == current;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(active ? activeIcon : icon, size: 22, color: active ? const Color(0xFF1A73E8) : const Color(0xFF9CA3AF)),
            const SizedBox(height: 2),
            Text(label, style: TextStyle(fontSize: 10, color: active ? const Color(0xFF1A73E8) : const Color(0xFF9CA3AF), fontWeight: active ? FontWeight.w600 : FontWeight.w400)),
          ],
        ),
      ),
    );
  }
}

class _CenterTab extends StatelessWidget {
  final VoidCallback onTap;
  final bool isActive;
  const _CenterTab({required this.onTap, required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF1A73E8), Color(0xFF1557C0)]),
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [BoxShadow(color: Color(0x591A73E8), blurRadius: 8, offset: Offset(0, 2))],
              ),
              child: const Icon(Icons.add, size: 22, color: Colors.white),
            ),
            const SizedBox(height: 2),
            Text('记录', style: TextStyle(fontSize: 10, color: isActive ? const Color(0xFF1A73E8) : const Color(0xFF9CA3AF))),
          ],
        ),
      ),
    );
  }
}
