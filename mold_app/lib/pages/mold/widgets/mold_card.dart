import 'package:flutter/material.dart';
import '../../../config/constants.dart';
import '../../../models/mold.dart';
import '../../../widgets/status_badge.dart';

class MoldCard extends StatelessWidget {
  const MoldCard({super.key, required this.mold, required this.onTap});

  final Mold mold;
  final VoidCallback onTap;

  static String _shortLabel(String type) => switch (MoldType.fromApi(type)) {
        MoldType.compression => '模压',
        MoldType.extrusion => '口型',
        MoldType.corner => '接角',
        _ => '其他',
      };

  static (Color, Color) _typeColors(String type) =>
      switch (MoldType.fromApi(type)) {
        MoldType.extrusion => (const Color(0xFFEFF6FF), const Color(0xFF1A73E8)),
        MoldType.corner => (const Color(0xFFFEF3C7), const Color(0xFFF59E0B)),
        MoldType.compression => (const Color(0xFFF0FDF4), const Color(0xFF22C55E)),
        _ => (const Color(0xFFF3F4F6), const Color(0xFF6B7280)),
      };

  @override
  Widget build(BuildContext context) {
    final product = mold.products.isNotEmpty ? mold.products.first : null;
    final customer = product?.customer ??
        mold.products.map((p) => p.customer).whereType<String>().firstOrNull;
    final (bg, fg) = _typeColors(mold.type);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 6)],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: bg,
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Text(
                _shortLabel(mold.type),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: fg,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    mold.moldNumber,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF111827),
                    ),
                  ),
                  if (product?.name != null) ...[
                    const SizedBox(height: 3),
                    Text(
                      product!.name!,
                      style: const TextStyle(fontSize: 13, color: Color(0xFF111827)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  if (customer != null && customer.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      customer,
                      style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                StatusBadge(status: mold.status),
                const SizedBox(height: 6),
                Text(
                  '已用 ${mold.usageCount ?? 0} 次',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                ),
                const SizedBox(height: 4),
                const Icon(Icons.chevron_right, color: Color(0xFF6B7280), size: 18),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
