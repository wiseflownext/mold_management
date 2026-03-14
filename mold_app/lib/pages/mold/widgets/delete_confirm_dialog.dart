import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../services/mold_service.dart';

class DeleteConfirmDialog extends StatelessWidget {
  const DeleteConfirmDialog({
    super.key,
    required this.moldId,
    required this.onSuccess,
  });

  final String moldId;
  final VoidCallback onSuccess;

  static Future<void> show(
    BuildContext context, {
    required String moldId,
    required VoidCallback onSuccess,
  }) {
    return showDialog(
      context: context,
      builder: (ctx) => DeleteConfirmDialog(
        moldId: moldId,
        onSuccess: onSuccess,
      ),
    );
  }

  Future<void> _confirm(BuildContext context) async {
    try {
      await MoldService.instance.delete(moldId);
      if (!context.mounted) return;
      onSuccess();
      Navigator.of(context).pop();
      context.go('/molds');
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('确认删除此模具？'),
      content: const Text('删除后数据不可恢复'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('取消'),
        ),
        TextButton(
          onPressed: () => _confirm(context),
          style: TextButton.styleFrom(
            foregroundColor: const Color(0xFFEF4444),
          ),
          child: const Text('确认删除'),
        ),
      ],
    );
  }
}
