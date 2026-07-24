import 'package:flutter/material.dart';

import '../theme/speca_tokens.dart';

/// Judul bagian + aksi opsional di kanan ("Lihat semua").
class SpecaSectionHeader extends StatelessWidget {
  const SpecaSectionHeader(this.title, {super.key, this.actionLabel, this.onAction});

  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final c = context.specaColors;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: TextStyle(color: c.foreground, fontSize: 15, fontWeight: FontWeight.w600),
          ),
          if (actionLabel != null)
            GestureDetector(
              onTap: onAction,
              child: Text(
                actionLabel!,
                style: TextStyle(color: c.primary, fontSize: 12.5, fontWeight: FontWeight.w600),
              ),
            ),
        ],
      ),
    );
  }
}

/// Kartu statistik ringkas (label + nilai besar + ikon) — untuk saldo, jumlah
/// pesanan, poin, atau metrik apa pun. Biasa dipakai berdampingan 2–3 kolom.
class SpecaStatCard extends StatelessWidget {
  const SpecaStatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    this.onTap,
  });

  final String label;
  final String value;
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.specaColors;
    final s = context.specaShape;
    return InkWell(
      borderRadius: BorderRadius.circular(s.radiusCard),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: c.muted,
          border: Border.all(color: c.border),
          borderRadius: BorderRadius.circular(s.radiusCard),
          boxShadow: s.cardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 16, color: c.primary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(color: c.mutedForeground, fontSize: 12),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(color: c.foreground, fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}

/// Baris menu: ikon + judul + nilai/keterangan opsional + chevron.
/// Untuk daftar pengaturan, akun, atau navigasi sekunder.
class SpecaMenuTile extends StatelessWidget {
  const SpecaMenuTile({
    super.key,
    required this.icon,
    required this.title,
    this.trailingText,
    this.trailing,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String? trailingText;
  final Widget? trailing;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.specaColors;
    return InkWell(
      borderRadius: BorderRadius.circular(context.specaShape.radius),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 13),
        child: Row(
          children: [
            Icon(icon, size: 19, color: c.mutedForeground),
            const SizedBox(width: 12),
            Expanded(
              child: Text(title, style: TextStyle(color: c.foreground, fontSize: 14)),
            ),
            ?trailing,
            if (trailingText != null)
              Text(trailingText!, style: TextStyle(color: c.mutedForeground, fontSize: 12.5)),
            const SizedBox(width: 6),
            Icon(Icons.chevron_right, size: 18, color: c.mutedForeground),
          ],
        ),
      ),
    );
  }
}

/// Kartu bergradien untuk sorotan (promo, membership, poin). Warna dasar dari
/// token primary sehingga tetap selaras saat tema diganti.
class SpecaHighlightCard extends StatelessWidget {
  const SpecaHighlightCard({
    super.key,
    required this.title,
    required this.subtitle,
    this.badge,
    this.action,
  });

  final String title;
  final String subtitle;
  final String? badge;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final c = context.specaColors;
    final s = context.specaShape;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [c.primary, Color.lerp(c.primary, Colors.black, 0.28)!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(s.radiusCard),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (badge != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.22),
                borderRadius: BorderRadius.circular(s.radius),
              ),
              child: Text(
                badge!,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ),
          Text(
            title,
            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 12.5),
          ),
          if (action != null) ...[const SizedBox(height: 12), action!],
        ],
      ),
    );
  }
}
