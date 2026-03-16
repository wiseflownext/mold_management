import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pull_to_refresh_flutter3/pull_to_refresh_flutter3.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../models/mold.dart';
import '../../providers/auth_provider.dart';
import '../../providers/mold_provider.dart';
import 'widgets/mold_card.dart';

class MoldListPage extends ConsumerStatefulWidget {
  const MoldListPage({super.key});

  @override
  ConsumerState<MoldListPage> createState() => _MoldListPageState();
}

class _MoldListPageState extends ConsumerState<MoldListPage> {
  final _searchCtrl = TextEditingController();
  final _refreshCtrl = RefreshController();
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _refreshCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 100) {
      ref.read(moldListNotifierProvider.notifier).loadMore();
    }
  }

  void _setKeyword(String? v) {
    final p = ref.read(moldListParamsProvider);
    ref.read(moldListParamsProvider.notifier).state =
        MoldListParams(keyword: v, type: p.type, status: p.status);
    ref.read(moldListNotifierProvider.notifier).load();
  }

  void _setType(String? v) {
    final p = ref.read(moldListParamsProvider);
    ref.read(moldListParamsProvider.notifier).state =
        MoldListParams(keyword: p.keyword, type: v, status: p.status);
    ref.read(moldListNotifierProvider.notifier).load();
  }

  void _setStatus(String? v) {
    final p = ref.read(moldListParamsProvider);
    ref.read(moldListParamsProvider.notifier).state =
        MoldListParams(keyword: p.keyword, type: p.type, status: v);
    ref.read(moldListNotifierProvider.notifier).load();
  }

  Future<void> _onRefresh() async {
    await ref.read(moldListNotifierProvider.notifier).load();
    _refreshCtrl.refreshCompleted();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authStateProvider);
    final isAdmin = auth.user?.role.toLowerCase() == 'admin';
    final listState = ref.watch(moldListNotifierProvider);
    final params = ref.watch(moldListParamsProvider);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Column(
        children: [
          _buildHeader(isAdmin),
          _buildTypeTabs(params.type),
          _buildFilterRow(params.status, listState),
          Expanded(child: _buildList(listState)),
        ],
      ),
    );
  }

  Widget _buildHeader(bool isAdmin) {
    return Container(
      color: AppTheme.primary,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
          child: Column(
            children: [
              Row(
                children: [
                  const Text(
                    '模具列表',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  if (isAdmin)
                    GestureDetector(
                      onTap: () => context.push('/add-mold'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.add, color: Colors.white, size: 18),
                            SizedBox(width: 4),
                            Text(
                              '新增模具',
                              style: TextStyle(color: Colors.white, fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _searchCtrl,
                style: const TextStyle(fontSize: 14),
                decoration: InputDecoration(
                  hintText: '搜索编号/产品/客户/车型/零件号',
                  hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
                  prefixIcon: const Icon(Icons.search, color: Color(0xFF9CA3AF), size: 20),
                  suffixIcon: _searchCtrl.text.isNotEmpty
                      ? GestureDetector(
                          onTap: () { _searchCtrl.clear(); _setKeyword(null); },
                          child: const Icon(Icons.close, color: Color(0xFF9CA3AF), size: 18),
                        )
                      : null,
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  isDense: true,
                ),
                onChanged: (v) {
                  if (v.isEmpty) _setKeyword(null);
                },
                onSubmitted: (v) => _setKeyword(v.isEmpty ? null : v),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeTabs(String? current) {
    final tabs = <(String, String?)>[
      ('全部', null),
      ...MoldType.values.map((t) => (t.label, t.apiValue)),
    ];
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0xFFE5E7EB),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: tabs.map((tab) {
          final selected = current == tab.$2;
          return Expanded(
            child: GestureDetector(
              onTap: () => _setType(tab.$2),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: selected ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  tab.$1,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: selected ? AppTheme.primary : const Color(0xFF6B7280),
                    fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildFilterRow(
    String? currentStatus,
    AsyncValue<({List<Mold> items, int total, bool hasMore})> listState,
  ) {
    final label =
        currentStatus == null ? '全部状态' : MoldStatus.labelOf(currentStatus);
    final active = currentStatus != null;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        children: [
          PopupMenuButton<String>(
            onSelected: (v) => _setStatus(v.isEmpty ? null : v),
            offset: const Offset(0, 36),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            itemBuilder: (_) => [
              const PopupMenuItem(value: '', child: Text('全部状态')),
              ...MoldStatus.values.map(
                (s) => PopupMenuItem(value: s.apiValue, child: Text(s.label)),
              ),
            ],
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: active ? const Color(0xFFEFF6FF) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: active ? AppTheme.primary : const Color(0xFFE5E7EB),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 13,
                      color: active ? AppTheme.primary : const Color(0xFF6B7280),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.keyboard_arrow_down,
                    size: 16,
                    color: active ? AppTheme.primary : const Color(0xFF6B7280),
                  ),
                ],
              ),
            ),
          ),
          const Spacer(),
          listState.when(
            data: (d) => Text(
              '共 ${d.total} 副',
              style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
            ),
            loading: () => const Text(
              '共 - 副',
              style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
            ),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }

  Widget _buildList(
    AsyncValue<({List<Mold> items, int total, bool hasMore})> listState,
  ) {
    return listState.when(
      data: (d) => d.items.isEmpty
          ? const Center(
              child: Text('暂无数据', style: TextStyle(color: Color(0xFF6B7280))),
            )
          : SmartRefresher(
              controller: _refreshCtrl,
              onRefresh: _onRefresh,
              child: ListView.builder(
                controller: _scrollCtrl,
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 80),
                itemCount: d.items.length,
                itemBuilder: (_, i) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: MoldCard(
                    mold: d.items[i],
                    onTap: () => context.push('/molds/${d.items[i].id}'),
                  ),
                ),
              ),
            ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('$e', style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(moldListNotifierProvider.notifier).load(),
              child: const Text('重试'),
            ),
          ],
        ),
      ),
    );
  }
}
