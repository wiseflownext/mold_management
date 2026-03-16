import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/mold_provider.dart';
import '../../providers/refresh.dart';
import '../../providers/auth_provider.dart';
import '../../models/mold.dart';
import '../../models/usage_record.dart';
import '../../models/maintenance_record.dart';
import '../../config/constants.dart';
import '../../widgets/status_badge.dart';
import 'widgets/status_change_sheet.dart';
import 'widgets/certification_sheet.dart';
import '../../services/mold_service.dart';
import '../../services/usage_record_service.dart';
import '../../services/maintenance_service.dart';
import '../../widgets/confirm_dialog.dart';
import 'package:fluttertoast/fluttertoast.dart';

const _bg = Color(0xFFF5F7FA);
const _primary = Color(0xFF1A73E8);
const _cardShadow = BoxShadow(color: Color(0x0F000000), blurRadius: 6);

class MoldDetailPage extends ConsumerStatefulWidget {
  const MoldDetailPage({super.key, required this.id});

  final String id;

  @override
  ConsumerState<MoldDetailPage> createState() => _MoldDetailPageState();
}

class _MoldDetailPageState extends ConsumerState<MoldDetailPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _productsExpanded = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _refresh() => refreshAfterMoldChange(ref, moldId: widget.id);

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authStateProvider);
    final isAdmin = auth.user?.role.toLowerCase() == 'admin';
    final moldAsync = ref.watch(moldDetailProvider(widget.id));

    return Scaffold(
      backgroundColor: _bg,
      body: moldAsync.when(
        data: (mold) => RefreshIndicator(
          onRefresh: () async => ref.invalidate(moldDetailProvider(widget.id)),
          color: _primary,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
            SliverToBoxAdapter(
              child: _Header(
                mold: mold,
                isAdmin: isAdmin,
                onRefresh: _refresh,
                onDeleteSuccess: () {
                  refreshAfterMoldChange(ref);
                  if (context.mounted) context.go('/molds');
                },
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    _BasicInfoCard(mold: mold),
                    const SizedBox(height: 12),
                    _ProductsCard(products: mold.products, expanded: _productsExpanded, onToggle: () => setState(() => _productsExpanded = !_productsExpanded)),
                    const SizedBox(height: 12),
                    _RecordsCard(
                      mold: mold,
                      tabController: _tabController,
                      isAdmin: isAdmin,
                      onRefresh: _refresh,
                    ),
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ],
        ),
        ),
        loading: () => const Center(child: CircularProgressIndicator(color: _primary)),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('$e', style: const TextStyle(color: Colors.red, fontSize: 14)),
              const SizedBox(height: 16),
              TextButton(onPressed: _refresh, child: const Text('重试')),
            ],
          ),
        ),
      ),
      bottomNavigationBar: moldAsync.valueOrNull != null
          ? _BottomButtons(mold: moldAsync.value!, onRefresh: _refresh)
          : null,
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.mold, required this.isAdmin, required this.onRefresh, required this.onDeleteSuccess});

  final Mold mold;
  final bool isAdmin;
  final VoidCallback onRefresh;
  final VoidCallback onDeleteSuccess;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [_primary, Color(0xFF1557C0)],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              GestureDetector(
                onTap: () => context.pop(),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  '模具详情',
                  style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w600),
                ),
              ),
              if (isAdmin)
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_horiz, color: Colors.white, size: 24),
                  color: Colors.white,
                  onSelected: (v) async {
                    if (v == 'edit') {
                      context.push('/edit-mold?id=${mold.id}');
                    } else if (v == 'status') {
                      showModalBottomSheet(
                        context: context,
                        builder: (ctx) => StatusChangeSheet(
                          moldId: mold.id,
                          currentStatus: mold.status,
                          onSuccess: onRefresh,
                        ),
                      );
                    } else if (v == 'cert') {
                      showModalBottomSheet(
                        context: context,
                        builder: (ctx) => CertificationSheet(
                          moldId: mold.id,
                          currentDesignLife: mold.designLife ?? 0,
                          onSuccess: onRefresh,
                        ),
                      );
                    } else if (v == 'delete') {
                      final ok = await ConfirmDialog.show(context, title: '删除模具', content: '确定要删除该模具吗？此操作不可恢复');
                      if (ok) {
                        try {
                          await MoldService.instance.delete(mold.id);
                          Fluttertoast.showToast(msg: '删除成功');
                          onDeleteSuccess();
                        } catch (e) {
                          Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
                        }
                      }
                    }
                  },
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(value: 'edit', child: Text('编辑信息')),
                    const PopupMenuItem(value: 'status', child: Text('变更状态')),
                    const PopupMenuItem(value: 'cert', child: Text('上传鉴定报告')),
                    const PopupMenuItem(value: 'delete', child: Text('删除模具', style: TextStyle(color: Color(0xFFEF4444)))),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BasicInfoCard extends StatelessWidget {
  const _BasicInfoCard({required this.mold});

  final Mold mold;

  @override
  Widget build(BuildContext context) {
    final workshopName = mold.workshop?.name ?? '-';
    final firstUse = mold.firstUseDate != null
        ? '${mold.firstUseDate!.year}-${mold.firstUseDate!.month.toString().padLeft(2, '0')}-${mold.firstUseDate!.day.toString().padLeft(2, '0')}'
        : '-';
    final typeLabel = MoldType.fromApi(mold.type)?.label ?? mold.type;
    final designLife = mold.designLife ?? 1;
    final usageCount = mold.usageCount ?? 0;
    final lifePercent = designLife > 0 ? (usageCount / designLife * 100).clamp(0.0, 100.0) : 0.0;
    final maintCycle = mold.maintenanceCycle ?? 0;
    final sinceLastMaint = mold.sinceLastMaintenance;
    final maintRemaining = maintCycle > 0 ? maintCycle - sinceLastMaint : 0;

    Color progressColor = _primary;
    if (lifePercent > 80) progressColor = const Color(0xFFEF4444);
    else if (lifePercent > 60) progressColor = const Color(0xFFF59E0B);

    Color maintColor = const Color(0xFF22C55E);
    if (maintCycle > 0) {
      final ratio = sinceLastMaint / maintCycle;
      if (ratio >= 1.0) maintColor = const Color(0xFFEF4444);
      else if (ratio >= 0.8) maintColor = const Color(0xFFF59E0B);
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [_cardShadow],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  mold.moldNumber,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Color(0xFF111827)),
                ),
              ),
              StatusBadge(status: mold.status),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _InfoCell(label: '类型', value: typeLabel)),
              Expanded(child: _InfoCell(label: '车间', value: workshopName)),
              Expanded(child: _InfoCell(label: '首次使用', value: firstUse)),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _InfoCell(label: '累计使用', value: '$usageCount 次')),
              Expanded(child: _InfoCell(label: '设计寿命', value: '$designLife 次')),
              Expanded(child: _InfoCell(label: '保养周期', value: '$maintCycle 次')),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _InfoCell(label: '模腔数', value: '${mold.cavityCount}')),
              Expanded(child: _InfoCell(label: '累计产出', value: '${usageCount * mold.cavityCount} 件')),
              Expanded(child: _InfoCell(label: '累计保养', value: '${mold.totalMaintenanceCount} 次')),
            ],
          ),
          if (designLife > 0) ...[
            const SizedBox(height: 16),
            _LifeProgressBar(label: '使用寿命', current: usageCount, total: designLife, color: progressColor),
            const SizedBox(height: 12),
            if (maintCycle > 0)
              _LifeProgressBar(
                label: '按次保养',
                current: sinceLastMaint,
                total: maintCycle,
                color: maintColor,
                suffix: maintRemaining > 0
                    ? '距保养还剩 $maintRemaining 次${mold.lastMaintenanceDate != null ? '  上次: ${mold.lastMaintenanceDate}' : ''}'
                    : '已超期 ${-maintRemaining} 次，请及时保养',
            ),
            if (mold.periodicMaintenanceDays != null && mold.periodicMaintenanceDays! > 0) ...[
              const SizedBox(height: 12),
              Builder(builder: (_) {
                final days = mold.daysSinceLastMaintenance ?? 0;
                final period = mold.periodicMaintenanceDays!;
                final remain = period - days;
                Color c = const Color(0xFF22C55E);
                if (remain <= 0) c = const Color(0xFFEF4444);
                else if (days >= period * 0.8) c = const Color(0xFFF59E0B);
                return _LifeProgressBar(
                  label: '定期保养',
                  current: days,
                  total: period,
                  color: c,
                  unit: '天',
                  suffix: remain > 0
                      ? '距保养还剩 $remain 天${mold.lastMaintenanceDate != null ? '  上次: ${mold.lastMaintenanceDate}' : ''}'
                      : '已超期 ${-remain} 天，请及时保养',
                );
              }),
            ],
          ],
        ],
      ),
    );
  }
}

class _LifeProgressBar extends StatelessWidget {
  const _LifeProgressBar({required this.label, required this.current, required this.total, required this.color, this.suffix, this.unit = '次'});
  final String label;
  final int current;
  final int total;
  final Color color;
  final String? suffix;
  final String unit;

  @override
  Widget build(BuildContext context) {
    final pct = total > 0 ? (current / total * 100).clamp(0.0, 100.0) : 0.0;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280), fontWeight: FontWeight.w500)),
        const Spacer(),
        Text('$current / $total $unit', style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w600)),
        const SizedBox(width: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(4)),
          child: Text('${pct.toStringAsFixed(1)}%', style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w700)),
        ),
      ]),
      const SizedBox(height: 6),
      Stack(children: [
        Container(height: 10, decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(5))),
        FractionallySizedBox(
          widthFactor: (pct / 100).clamp(0.0, 1.0),
          child: Container(
            height: 10,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [color.withValues(alpha: 0.7), color]),
              borderRadius: BorderRadius.circular(5),
            ),
          ),
        ),
      ]),
      if (suffix != null) ...[
        const SizedBox(height: 4),
        Text(suffix!, style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
      ],
    ]);
  }
}

class _InfoCell extends StatelessWidget {
  const _InfoCell({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 14, color: Color(0xFF111827), fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      );
}

class _ProductsCard extends StatelessWidget {
  const _ProductsCard({required this.products, required this.expanded, required this.onToggle});

  final List<MoldProduct> products;
  final bool expanded;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [_cardShadow],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GestureDetector(
            onTap: onToggle,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('关联产品', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                Icon(expanded ? Icons.expand_less : Icons.expand_more, size: 24, color: const Color(0xFF6B7280)),
              ],
            ),
          ),
          if (expanded) ...[
            const SizedBox(height: 12),
            ...products.map((p) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFF),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFDBEAFE)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (p.name != null) Text('产品: ${p.name}', style: const TextStyle(fontSize: 13, color: Color(0xFF111827), fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
                      if (p.customer != null) Text('客户: ${p.customer}', style: const TextStyle(fontSize: 13, color: Color(0xFF374151)), maxLines: 1, overflow: TextOverflow.ellipsis),
                      if (p.model != null) Text('车型: ${p.model}', style: const TextStyle(fontSize: 13, color: Color(0xFF374151)), maxLines: 1, overflow: TextOverflow.ellipsis),
                      if (p.partNumber != null) Text('零件号: ${p.partNumber}', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)), maxLines: 1, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                )),
          ],
        ],
      ),
    );
  }
}

class _RecordsCard extends StatelessWidget {
  const _RecordsCard({required this.mold, required this.tabController, required this.isAdmin, required this.onRefresh});

  final Mold mold;
  final TabController tabController;
  final bool isAdmin;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [_cardShadow],
      ),
      child: Column(
        children: [
          TabBar(
            controller: tabController,
            labelColor: _primary,
            unselectedLabelColor: const Color(0xFF6B7280),
            indicatorColor: _primary,
            indicatorWeight: 2,
            labelStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            unselectedLabelStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
            tabs: const [Tab(text: '使用记录'), Tab(text: '维保记录')],
          ),
          SizedBox(
            height: 280,
            child: TabBarView(
              controller: tabController,
              children: [
                _UsageRecordsList(records: mold.usageRecords, cavityCount: mold.cavityCount, isAdmin: isAdmin, onDeleted: onRefresh),
                _MaintenanceRecordsList(records: mold.maintenanceRecords, isAdmin: isAdmin, onDeleted: onRefresh),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _UsageRecordsList extends StatelessWidget {
  const _UsageRecordsList({required this.records, required this.cavityCount, required this.isAdmin, required this.onDeleted});

  final List<UsageRecord> records;
  final int cavityCount;
  final bool isAdmin;
  final VoidCallback onDeleted;

  static String _shiftLabel(String? s) {
    if (s == null) return '';
    final u = s.toUpperCase();
    if (u == 'MORNING') return '早班';
    if (u == 'AFTERNOON') return '中班';
    if (u == 'NIGHT') return '晚班';
    return s;
  }

  @override
  Widget build(BuildContext context) {
    if (records.isEmpty) {
      return const Center(child: Text('暂无使用记录', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 13)));
    }

    return ListView.builder(
      shrinkWrap: true,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: records.length,
      itemBuilder: (ctx, i) {
        final r = records[i];
        final date = r.recordDate != null
            ? '${r.recordDate!.year}-${r.recordDate!.month.toString().padLeft(2, '0')}-${r.recordDate!.day.toString().padLeft(2, '0')}'
            : '-';
        final opName = r.operator?.name ?? r.operator?.username ?? '-';
        final content = Padding(
          padding: EdgeInsets.only(bottom: i < records.length - 1 ? 12 : 0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(color: _primary, shape: BoxShape.circle),
                  ),
                  if (i < records.length - 1)
                    Container(
                      width: 1,
                      height: 48,
                      color: const Color(0xFFE5E7EB),
                      margin: const EdgeInsets.only(top: 4),
                    ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(date, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF111827))),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDF4),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(_shiftLabel(r.shift), style: const TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      cavityCount > 1
                          ? '${r.product ?? '-'} x ${r.quantity ?? 0} (产出${(r.quantity ?? 0) * cavityCount}件)'
                          : '${r.product ?? '-'} x ${r.quantity ?? 0}',
                      style: const TextStyle(fontSize: 13, color: Color(0xFF374151)), maxLines: 1, overflow: TextOverflow.ellipsis,
                    ),
                    Text('操作人: $opName', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
        );
        if (isAdmin) {
          return GestureDetector(
            onLongPress: () async {
              final ok = await ConfirmDialog.show(ctx, title: '删除使用记录', content: '确定要删除该记录吗？');
              if (!ok) return;
              try {
                await UsageRecordService.instance.delete(r.id);
                Fluttertoast.showToast(msg: '删除成功');
                onDeleted();
              } catch (e) {
                Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
              }
            },
            child: content,
          );
        }
        return content;
      },
    );
  }
}

class _MaintenanceRecordsList extends StatelessWidget {
  const _MaintenanceRecordsList({required this.records, required this.isAdmin, required this.onDeleted});

  final List<MaintenanceRecord> records;
  final bool isAdmin;
  final VoidCallback onDeleted;

  static String _typeLabel(String? s) {
    if (s == null) return '';
    final u = s.toUpperCase();
    if (u == 'MAINTAIN') return '保养';
    if (u == 'REPAIR') return '维修';
    return s ?? '';
  }

  static (Color, Color) _typeColors(String? s) {
    final u = (s ?? '').toUpperCase();
    if (u == 'MAINTAIN') return (const Color(0xFF059669), const Color(0xFFECFDF5));
    if (u == 'REPAIR') return (const Color(0xFFD97706), const Color(0xFFFEF3C7));
    return (const Color(0xFF374151), const Color(0xFFF3F4F6));
  }

  @override
  Widget build(BuildContext context) {
    if (records.isEmpty) {
      return const Center(child: Text('暂无维保记录', style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 13)));
    }

    return ListView.builder(
      shrinkWrap: true,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: records.length,
      itemBuilder: (ctx, i) {
        final r = records[i];
        final date = r.recordDate != null
            ? '${r.recordDate!.year}-${r.recordDate!.month.toString().padLeft(2, '0')}-${r.recordDate!.day.toString().padLeft(2, '0')}'
            : '-';
        final opName = r.operator?.name ?? r.operator?.username ?? '-';
        final (textColor, bgColor) = _typeColors(r.type);
        final content = Padding(
          padding: EdgeInsets.only(bottom: i < records.length - 1 ? 12 : 0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(color: textColor, shape: BoxShape.circle),
                  ),
                  if (i < records.length - 1)
                    Container(
                      width: 1,
                      height: 56,
                      color: const Color(0xFFE5E7EB),
                      margin: const EdgeInsets.only(top: 4),
                    ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(date, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF111827))),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(999)),
                          child: Text(_typeLabel(r.type), style: TextStyle(fontSize: 11, color: textColor, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(r.content, style: const TextStyle(fontSize: 13, color: Color(0xFF374151)), maxLines: 2, overflow: TextOverflow.ellipsis),
                    Text('操作人: $opName', style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
        );
        if (isAdmin) {
          return GestureDetector(
            onLongPress: () async {
              final ok = await ConfirmDialog.show(ctx, title: '删除维保记录', content: '确定要删除该记录吗？');
              if (!ok) return;
              try {
                await MaintenanceService.instance.delete(r.id);
                Fluttertoast.showToast(msg: '删除成功');
                onDeleted();
              } catch (e) {
                Fluttertoast.showToast(msg: e.toString().replaceAll('Exception: ', ''));
              }
            },
            child: content,
          );
        }
        return content;
      },
    );
  }
}

class _BottomButtons extends StatelessWidget {
  const _BottomButtons({required this.mold, required this.onRefresh});

  final Mold mold;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    final disabled = mold.status == 'SCRAPPED';
    return Container(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 12),
      decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 8, offset: const Offset(0, -2))]),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: disabled ? null : () => context.push('/add-usage-for?moldId=${mold.id}'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: _primary,
                  side: BorderSide(color: disabled ? const Color(0xFFD1D5DB) : _primary),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('新增使用记录'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: disabled ? null : () => context.push('/add-maintenance?moldId=${mold.id}'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: disabled ? const Color(0xFFD1D5DB) : _primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text('新增维保记录'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
