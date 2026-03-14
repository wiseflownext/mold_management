import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/mold.dart';
import '../services/mold_service.dart';
import 'status_badge.dart';

class MoldSearchSelect extends ConsumerStatefulWidget {
  const MoldSearchSelect({
    super.key,
    required this.onSelected,
    this.initialMold,
    this.inUseOnly = false,
  });

  final void Function(Mold) onSelected;
  final Mold? initialMold;
  final bool inUseOnly;

  @override
  ConsumerState<MoldSearchSelect> createState() => _MoldSearchSelectState();
}

class _MoldSearchSelectState extends ConsumerState<MoldSearchSelect> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  List<Mold> _results = [];
  bool _loading = false;
  bool _showDropdown = false;
  Mold? _selected;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _selected = widget.initialMold;
    if (_selected != null) _controller.text = _selected!.moldNumber;
    _controller.addListener(_onSearch);
  }

  @override
  void didUpdateWidget(covariant MoldSearchSelect oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialMold != _selected && widget.initialMold != null) {
      setState(() {
        _selected = widget.initialMold;
        _controller.text = _selected!.moldNumber;
      });
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onSearch() {
    final q = _controller.text.trim();
    if (q.isEmpty) {
      _debounce?.cancel();
      setState(() { _results = []; _showDropdown = false; _selected = null; });
      return;
    }
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () => _doSearch(q));
  }

  Future<void> _doSearch(String q) async {
    setState(() => _loading = true);
    try {
      final r = await MoldService.instance.getList(1, 20, keyword: q, status: widget.inUseOnly ? 'IN_USE' : null);
      if (mounted) setState(() { _results = r.items; _showDropdown = true; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _controller,
          focusNode: _focusNode,
          style: const TextStyle(fontSize: 15, color: Color(0xFF111827)),
          decoration: InputDecoration(
            hintText: '搜索模具编号',
            hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 15),
            prefixIcon: const Icon(Icons.search, color: Color(0xFF9CA3AF), size: 20),
            suffixIcon: _loading
                ? const Padding(
                    padding: EdgeInsets.all(12),
                    child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                  )
                : null,
            filled: true,
            fillColor: const Color(0xFFF3F4F6),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFBFDBFE), width: 1.5)),
            contentPadding: const EdgeInsets.symmetric(vertical: 12),
          ),
          onTap: () {
            if (_controller.text.isNotEmpty && _results.isNotEmpty) {
              setState(() => _showDropdown = true);
            }
          },
        ),
        if (_showDropdown && _results.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(top: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: 16, offset: const Offset(0, 4))],
            ),
            constraints: const BoxConstraints(maxHeight: 240),
            child: ListView.separated(
              shrinkWrap: true,
              padding: EdgeInsets.zero,
              itemCount: _results.length,
              separatorBuilder: (_, __) => const Divider(height: 1, indent: 16, endIndent: 16),
              itemBuilder: (_, i) {
                final m = _results[i];
                final isSelected = _selected?.id == m.id;
                return InkWell(
                  onTap: () {
                    setState(() {
                      _selected = m;
                      _controller.text = m.moldNumber;
                      _showDropdown = false;
                    });
                    widget.onSelected(m);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    color: isSelected ? const Color(0xFFEFF6FF) : Colors.transparent,
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(m.moldNumber, style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                                color: isSelected ? const Color(0xFF1A73E8) : const Color(0xFF111827),
                              )),
                              if (m.products.isNotEmpty && m.products.first.name != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 2),
                                  child: Text(m.products.first.name!, style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)), maxLines: 1, overflow: TextOverflow.ellipsis),
                                ),
                            ],
                          ),
                        ),
                        StatusBadge(status: m.status),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}
