import 'package:flutter/material.dart';

import '../theme/speca_tokens.dart';

/// Satu opsi dalam [SpecaSegmented]: ikon + judul + keterangan singkat.
class SpecaSegmentOption {
  const SpecaSegmentOption({required this.icon, required this.title, this.subtitle});

  final IconData icon;
  final String title;
  final String? subtitle;
}

/// Pemilih eksklusif berbentuk kartu berdampingan — untuk pilihan cara/metode
/// (mis. ambil sendiri vs diantar, bayar tunai vs transfer).
class SpecaSegmented extends StatelessWidget {
  const SpecaSegmented({
    super.key,
    required this.options,
    required this.selectedIndex,
    required this.onChanged,
  });

  final List<SpecaSegmentOption> options;
  final int selectedIndex;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final c = context.specaColors;
    final r = context.specaShape.radius;

    return Row(
      children: List.generate(options.length, (i) {
        final o = options[i];
        final isOn = i == selectedIndex;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: i == options.length - 1 ? 0 : 10),
            child: InkWell(
              borderRadius: BorderRadius.circular(r),
              onTap: () => onChanged(i),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: BoxDecoration(
                  color: isOn ? c.primary.withValues(alpha: 0.08) : Colors.transparent,
                  border: Border.all(color: isOn ? c.primary : c.input, width: isOn ? 1.5 : 1),
                  borderRadius: BorderRadius.circular(r),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(o.icon, size: 18, color: isOn ? c.primary : c.mutedForeground),
                        const Spacer(),
                        if (isOn) Icon(Icons.check_circle, size: 16, color: c.primary),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      o.title,
                      style: TextStyle(
                        color: c.foreground,
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (o.subtitle != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          o.subtitle!,
                          style: TextStyle(color: c.mutedForeground, fontSize: 11.5),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        );
      }),
    );
  }
}
