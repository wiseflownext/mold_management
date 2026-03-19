import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../config/theme.dart';
import '../../../config/constants.dart';
import '../../../services/mold_service.dart';

class StatusChangeSheet extends ConsumerStatefulWidget {
  const StatusChangeSheet({
    super.key,
    required this.moldId,
    required this.currentStatus,
    required this.onSuccess,
  });

  final String moldId;
  final String currentStatus;
  final VoidCallback onSuccess;

  @override
  ConsumerState<StatusChangeSheet> createState() => _StatusChangeSheetState();
}

class _StatusChangeSheetState extends ConsumerState<StatusChangeSheet> {
  MoldStatus? _selected;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _selected = MoldStatus.fromApi(widget.currentStatus);
  }

  Future<void> _confirm() async {
    if (_selected == null) return;
    setState(() => _loading = true);
    try {
      await MoldService.instance.update(
        widget.moldId,
        {'status': _selected!.apiValue},
      );
      if (!mounted) return;
      widget.onSuccess();
      Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final options = MoldStatus.values
        .where((s) => s.apiValue != widget.currentStatus.toUpperCase())
        .toList();

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(AppTheme.pagePadding),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              '变更状态',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '当前: ${MoldStatus.labelOf(widget.currentStatus)}',
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            ...options.map((s) => RadioListTile<MoldStatus>(
                  value: s,
                  groupValue: _selected,
                  onChanged: _loading ? null : (v) => setState(() => _selected = v),
                  title: Text(s.label),
                  activeColor: AppTheme.primary,
                )),
            const SizedBox(height: 16),
            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: _loading || _selected == null ? null : _confirm,
                child: _loading ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                ) : const Text('确认'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
