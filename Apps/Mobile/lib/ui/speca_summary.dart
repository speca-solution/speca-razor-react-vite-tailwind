import 'package:flutter/material.dart';

import '../theme/speca_tokens.dart';

/// Satu baris ringkasan (label di kiri, nilai di kanan).
class SpecaSummaryRow {
  const SpecaSummaryRow(this.label, this.value, {this.emphasize = false});

  final String label;
  final String value;

  /// Baris total: teks lebih tebal + garis pemisah di atas.
  final bool emphasize;
}

/// Daftar ringkasan (subtotal / ongkir / total) — pola umum untuk rincian
/// pembayaran, rekap, atau detail apa pun berpasangan label–nilai.
class SpecaSummaryList extends StatelessWidget {
  const SpecaSummaryList({super.key, required this.rows});

  final List<SpecaSummaryRow> rows;

  @override
  Widget build(BuildContext context) {
    final c = context.specaColors;

    return Column(
      children: [
        for (final row in rows) ...[
          if (row.emphasize)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Divider(color: c.border, height: 1),
            ),
          Padding(
            padding: EdgeInsets.symmetric(vertical: row.emphasize ? 0 : 5),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  row.label,
                  style: TextStyle(
                    color: row.emphasize ? c.foreground : c.mutedForeground,
                    fontSize: row.emphasize ? 14.5 : 13.5,
                    fontWeight: row.emphasize ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
                Text(
                  row.value,
                  style: TextStyle(
                    color: row.emphasize ? c.primary : c.foreground,
                    fontSize: row.emphasize ? 15.5 : 13.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
