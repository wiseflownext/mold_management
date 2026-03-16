import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../providers/reminder_provider.dart';
import '../../models/reminder.dart';
import '../../services/reminder_service.dart';
import '../../config/constants.dart';

class ReminderSettingsPage extends ConsumerStatefulWidget {
  const ReminderSettingsPage({super.key});

  @override
  ConsumerState<ReminderSettingsPage> createState() => _ReminderSettingsPageState();
}

class _ReminderSettingsPageState extends ConsumerState<ReminderSettingsPage> {
  final _settings = <String, _LocalSetting>{};
  bool _pushEnabled = true;
  bool _dailySummary = true;
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(reminderSettingsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: async.when(
              data: (list) {
                for (final s in list) {
                  final key = s.moldType.toUpperCase();
                  _settings.putIfAbsent(
                    key,
                    () => _LocalSetting(
                      enabled: s.enabled,
                      remainingThreshold: s.remainingThreshold,
                      warningPercent: s.warningPercent,
                      overduePercent: s.overduePercent,
                      periodicAdvanceDays: s.periodicAdvanceDays,
                    ),
                  );
                }
                return ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _sectionLabel('通知开关'),
                    const SizedBox(height: 8),
                    _card(
                      child: Column(
                        children: [
                          _switchRow('系统通知', _pushEnabled, (v) => setState(() => _pushEnabled = v)),
                          const Divider(height: 1),
                          _switchRow('每日汇总', _dailySummary, (v) => setState(() => _dailySummary = v)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    _sectionLabel('模具类型设置'),
                    const SizedBox(height: 8),
                    _buildTypeCard('模压模具', 'COMPRESSION'),
                    const SizedBox(height: 12),
                    _buildTypeCard('口型模具', 'EXTRUSION'),
                    const SizedBox(height: 12),
                    _buildTypeCard('接角模具', 'CORNER'),
                    const SizedBox(height: 24),
                    SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        onPressed: _saving ? null : () => _save(list),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1A73E8),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                        ),
                        child: _saving
                            ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('保存设置', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text(e.toString())),
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
            const Text('提醒设置', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeCard(String label, String type) {
    final s = _settings[type] ?? _LocalSetting();
    return _card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                const Spacer(),
                Switch(
                  value: s.enabled,
                  activeColor: const Color(0xFF1A73E8),
                  onChanged: (v) {
                    setState(() => _settings[type] = _LocalSetting(enabled: v, remainingThreshold: s.remainingThreshold, warningPercent: s.warningPercent, overduePercent: s.overduePercent, periodicAdvanceDays: s.periodicAdvanceDays));
                  },
                ),
              ],
            ),
            if (s.enabled) ...[
              const SizedBox(height: 8),
              _inputRow('剩余次数阈值', s.remainingThreshold, (v) {
                setState(() => _settings[type] = _LocalSetting(enabled: s.enabled, remainingThreshold: v, warningPercent: s.warningPercent, overduePercent: s.overduePercent, periodicAdvanceDays: s.periodicAdvanceDays));
              }),
              _sliderRow('预警百分比', s.warningPercent.toDouble(), 0, 100, 20, (v) {
                setState(() => _settings[type] = _LocalSetting(enabled: s.enabled, remainingThreshold: s.remainingThreshold, warningPercent: v.round(), overduePercent: s.overduePercent, periodicAdvanceDays: s.periodicAdvanceDays));
              }),
              _sliderRow('逾期百分比', s.overduePercent.toDouble(), 0, 100, 20, (v) {
                setState(() => _settings[type] = _LocalSetting(enabled: s.enabled, remainingThreshold: s.remainingThreshold, warningPercent: s.warningPercent, overduePercent: v.round(), periodicAdvanceDays: s.periodicAdvanceDays));
              }),
              _inputRow('定期保养提前告警(天)', s.periodicAdvanceDays, (v) {
                setState(() => _settings[type] = _LocalSetting(enabled: s.enabled, remainingThreshold: s.remainingThreshold, warningPercent: s.warningPercent, overduePercent: s.overduePercent, periodicAdvanceDays: v.clamp(1, 30)));
              }),
            ],
          ],
        ),
      ),
    );
  }

  Widget _inputRow(String label, int value, ValueChanged<int> onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(children: [
        Text(label, style: TextStyle(fontSize: 13, color: Colors.grey[700])),
        const Spacer(),
        SizedBox(
          width: 100,
          height: 36,
          child: TextField(
            controller: TextEditingController(text: '$value'),
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1A73E8)),
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 8),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE0E0E0))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE0E0E0))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF1A73E8))),
            ),
            onChanged: (t) { final v = int.tryParse(t); if (v != null && v >= 1) onChanged(v); },
          ),
        ),
      ]),
    );
  }

  Widget _sliderRow(String label, double value, double min, double max, int divisions, ValueChanged<double> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 4),
        Row(
          children: [
            Text(label, style: TextStyle(fontSize: 13, color: Colors.grey[700])),
            const Spacer(),
            Text('${value.round()}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1A73E8))),
          ],
        ),
        SliderTheme(
          data: SliderThemeData(
            activeTrackColor: const Color(0xFF1A73E8),
            inactiveTrackColor: const Color(0xFFE0E0E0),
            thumbColor: const Color(0xFF1A73E8),
            overlayColor: const Color(0xFF1A73E8).withValues(alpha: 0.1),
            trackHeight: 4,
          ),
          child: Slider(value: value, min: min, max: max, divisions: divisions, onChanged: onChanged),
        ),
      ],
    );
  }

  Widget _switchRow(String title, bool value, ValueChanged<bool> onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          Text(title, style: const TextStyle(fontSize: 15)),
          const Spacer(),
          Switch(value: value, activeColor: const Color(0xFF1A73E8), onChanged: onChanged),
        ],
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

  Future<void> _save(List<ReminderSetting> list) async {
    setState(() => _saving = true);
    try {
      for (final s in list) {
        final local = _settings[s.moldType.toUpperCase()];
        if (local != null) {
          await ReminderService.instance.updateSetting(s.id, {
            'enabled': local.enabled,
            'remainingThreshold': local.remainingThreshold,
            'warningPercent': local.warningPercent,
            'overduePercent': local.overduePercent,
            'periodicAdvanceDays': local.periodicAdvanceDays,
          });
        }
      }
      ref.invalidate(reminderSettingsProvider);
      Fluttertoast.showToast(msg: '保存成功');
    } catch (e) {
      Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}

class _LocalSetting {
  bool enabled;
  int remainingThreshold;
  int warningPercent;
  int overduePercent;
  int periodicAdvanceDays;

  _LocalSetting({
    this.enabled = true,
    this.remainingThreshold = 300,
    this.warningPercent = 80,
    this.overduePercent = 100,
    this.periodicAdvanceDays = 7,
  });
}
