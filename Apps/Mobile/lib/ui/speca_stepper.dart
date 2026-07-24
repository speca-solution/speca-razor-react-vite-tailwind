import 'package:flutter/material.dart';

import '../theme/speca_tokens.dart';

/// Pengatur jumlah (− n +) — pola umum untuk kuantitas pesanan/porsi.
/// Tombol nonaktif otomatis saat menyentuh [min]/[max].
class SpecaQtyStepper extends StatelessWidget {
  const SpecaQtyStepper({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 1,
    this.max = 99,
  });

  final int value;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;

  @override
  Widget build(BuildContext context) {
    final c = context.specaColors;
    final r = context.specaShape.radius;

    Widget btn(IconData icon, VoidCallback? onTap) => InkWell(
          borderRadius: BorderRadius.circular(r),
          onTap: onTap,
          child: Container(
            width: 38,
            height: 38,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              border: Border.all(color: c.input),
              borderRadius: BorderRadius.circular(r),
            ),
            child: Icon(icon, size: 18, color: onTap == null ? c.mutedForeground : c.foreground),
          ),
        );

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        btn(Icons.remove, value > min ? () => onChanged(value - 1) : null),
        Container(
          width: 52,
          alignment: Alignment.center,
          child: Text(
            '$value',
            style: TextStyle(color: c.foreground, fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ),
        btn(Icons.add, value < max ? () => onChanged(value + 1) : null),
      ],
    );
  }
}
