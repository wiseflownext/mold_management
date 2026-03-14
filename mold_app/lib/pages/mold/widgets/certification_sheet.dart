import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../config/theme.dart';
import '../../../services/mold_service.dart';
import '../../../services/upload_service.dart';

class CertificationSheet extends ConsumerStatefulWidget {
  const CertificationSheet({
    super.key,
    required this.moldId,
    required this.currentDesignLife,
    required this.onSuccess,
  });

  final String moldId;
  final int currentDesignLife;
  final VoidCallback onSuccess;

  @override
  ConsumerState<CertificationSheet> createState() => _CertificationSheetState();
}

class _CertificationSheetState extends ConsumerState<CertificationSheet> {
  File? _image;
  final _newLifeController = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _newLifeController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final x = await picker.pickImage(source: source, imageQuality: 80);
    if (x != null && mounted) setState(() => _image = File(x.path));
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('拍照'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('相册'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    final newLife = int.tryParse(_newLifeController.text.trim());
    if (newLife == null || newLife < 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请输入有效设计寿命')),
      );
      return;
    }
    if (_image == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请上传鉴定报告')),
      );
      return;
    }
    setState(() => _loading = true);
    try {
      final url = await UploadService.instance.uploadImage(_image!);
      await MoldService.instance.updateDesignLife(
        widget.moldId,
        newLife,
        url,
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
    final newLife = int.tryParse(_newLifeController.text.trim());
    final diff = newLife != null ? newLife - widget.currentDesignLife : null;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        child: Container(
          padding: const EdgeInsets.all(AppTheme.pagePadding),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                '鉴定报告',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: _loading ? null : _showImageSourceDialog,
                child: Container(
                  height: 120,
                  decoration: BoxDecoration(
                    color: AppTheme.background,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.textSecondary.withValues(alpha: 0.3)),
                  ),
                  child: _image != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(_image!, fit: BoxFit.cover),
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_photo_alternate, size: 40, color: AppTheme.textSecondary),
                            const SizedBox(height: 8),
                            Text(
                              '点击上传',
                              style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                            ),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _newLifeController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: '新设计寿命',
                  border: OutlineInputBorder(),
                  hintText: '次',
                ),
                onChanged: (_) => setState(() {}),
              ),
              if (diff != null && diff != 0) ...[
                const SizedBox(height: 8),
                Text(
                  '当前 ${widget.currentDesignLife} → 新 $newLife (${diff > 0 ? '+' : ''}$diff)',
                  style: TextStyle(
                    fontSize: 14,
                    color: diff > 0 ? const Color(0xFF22C55E) : AppTheme.textSecondary,
                  ),
                ),
              ],
              const SizedBox(height: 20),
              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  ) : const Text('提交'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
