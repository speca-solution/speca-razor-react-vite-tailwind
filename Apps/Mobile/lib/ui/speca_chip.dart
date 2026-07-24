import 'package:flutter/material.dart';

import '../theme/speca_tokens.dart';

/// Nada status — sepadan dengan varian badge di tema web (success/info/warning/
/// danger/muted). Warna sengaja hidup di sini agar konsisten lintas layar.
enum SpecaTone { primary, success, warning, danger, muted }

extension SpecaToneColors on SpecaTone {
  Color base(BuildContext context) {
    final c = context.specaColors;
    return switch (this) {
      SpecaTone.primary => c.primary,
      SpecaTone.success => const Color(0xFF17C653),
      SpecaTone.warning => const Color(0xFFF6B100),
      SpecaTone.danger => const Color(0xFFF8285A),
      SpecaTone.muted => c.mutedForeground,
    };
  }
}

/// Label status ringkas (mis. "Dalam Pengiriman", "Selesai", "Aktif").
/// Latar = warna nada dengan alpha rendah → terbaca di light & dark.
class SpecaStatusChip extends StatelessWidget {
  const SpecaStatusChip(this.label, {super.key, this.tone = SpecaTone.primary, this.icon});

  final String label;
  final SpecaTone tone;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final color = tone.base(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(context.specaShape.radius),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: 13, color: color), const SizedBox(width: 5)],
          Text(
            label,
            style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

/// Deret chip pilihan — dipakai untuk hal seperti pemilih hari (S S R K J S M),
/// filter kategori, atau opsi singkat. Mendukung pilih-banyak.
class SpecaChoiceChips extends StatelessWidget {
  const SpecaChoiceChips({
    super.key,
    required this.labels,
    required this.selected,
    required this.onChanged,
  });

  final List<String> labels;
  final Set<int> selected;
  final ValueChanged<Set<int>> onChanged;

  @override
  Widget build(BuildContext context) {
    final c = context.specaColors;
    final r = context.specaShape.radius;
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: List.generate(labels.length, (i) {
        final isOn = selected.contains(i);
        return InkWell(
          borderRadius: BorderRadius.circular(r),
          onTap: () {
            final next = Set<int>.from(selected);
            isOn ? next.remove(i) : next.add(i);
            onChanged(next);
          },
          child: Container(
            constraints: const BoxConstraints(minWidth: 42),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: isOn ? c.primary : Colors.transparent,
              border: Border.all(color: isOn ? c.primary : c.input),
              borderRadius: BorderRadius.circular(r),
            ),
            child: Text(
              labels[i],
              style: TextStyle(
                color: isOn ? c.primaryForeground : c.secondaryForeground,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        );
      }),
    );
  }
}
