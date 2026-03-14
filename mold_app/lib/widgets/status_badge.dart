import 'package:flutter/material.dart';
import '../config/constants.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.status, this.size = 'md'});

  final String status;
  final String size;

  static const _config = {
    'IN_USE': (_cGreen, _cGreenBg, _cGreenDot, '在用'),
    'REPAIRING': (_cAmber, _cAmberBg, _cAmberDot, '维修中'),
    'STOPPED': (_cGray, _cGrayBg, _cGrayDot, '停用'),
    'SCRAPPED': (_cRed, _cRedBg, _cRedDot, '报废'),
  };

  static const _cGreen = Color(0xFF059669);
  static const _cGreenBg = Color(0xFFECFDF5);
  static const _cGreenDot = Color(0xFF10B981);
  static const _cAmber = Color(0xFFD97706);
  static const _cAmberBg = Color(0xFFFFF7ED);
  static const _cAmberDot = Color(0xFFF59E0B);
  static const _cGray = Color(0xFF6B7280);
  static const _cGrayBg = Color(0xFFF3F4F6);
  static const _cGrayDot = Color(0xFF9CA3AF);
  static const _cRed = Color(0xFFDC2626);
  static const _cRedBg = Color(0xFFFEF2F2);
  static const _cRedDot = Color(0xFFEF4444);

  @override
  Widget build(BuildContext context) {
    final key = status.toUpperCase();
    final cfg = _config[key];
    final textColor = cfg?.$1 ?? _cGray;
    final bg = cfg?.$2 ?? _cGrayBg;
    final dot = cfg?.$3 ?? _cGrayDot;
    final label = cfg?.$4 ?? MoldStatus.labelOf(status);

    final isSmall = size == 'sm';
    final hPad = isSmall ? 6.0 : 8.0;
    final vPad = isSmall ? 1.0 : 3.0;
    final fontSize = isSmall ? 10.0 : 12.0;

    return Container(
      padding: EdgeInsets.symmetric(horizontal: hPad, vertical: vPad),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: isSmall ? 5 : 6,
            height: isSmall ? 5 : 6,
            decoration: BoxDecoration(color: dot, shape: BoxShape.circle),
          ),
          SizedBox(width: isSmall ? 3 : 4),
          Text(label, style: TextStyle(color: textColor, fontSize: fontSize, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
