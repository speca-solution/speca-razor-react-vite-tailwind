import 'package:flutter/material.dart';

import '../theme/speca_tokens.dart';
import '../ui/ui_kit.dart';

/// Galeri UI kit — memperagakan seluruh komponen generik dengan token tema.
/// Berperan sama seperti halaman `/Components` di web: rujukan visual saat
/// menyusun layar baru.
class UiKitDemoPage extends StatefulWidget {
  const UiKitDemoPage({super.key});

  @override
  State<UiKitDemoPage> createState() => _UiKitDemoPageState();
}

class _UiKitDemoPageState extends State<UiKitDemoPage> {
  int _qty = 3;
  int _method = 1;
  Set<int> _days = {0, 3};

  @override
  Widget build(BuildContext context) {
    final c = context.specaColors;
    final s = context.specaShape;

    Widget card(Widget child) => Container(
          width: double.infinity,
          padding: EdgeInsets.all(s.cardPadX * 0.7),
          decoration: BoxDecoration(
            color: c.muted,
            border: Border.all(color: c.border),
            borderRadius: BorderRadius.circular(s.radiusCard),
            boxShadow: s.cardShadow,
          ),
          child: child,
        );

    return Scaffold(
      appBar: AppBar(title: const Text('UI Kit')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          const SpecaHighlightCard(
            badge: 'Sorotan',
            title: 'Kartu Highlight',
            subtitle: 'Gradien dari token primary — ikut berubah saat tema diganti.',
          ),
          const SizedBox(height: 20),

          const SpecaSectionHeader('Status & Chip', actionLabel: 'Lihat semua'),
          card(Wrap(
            spacing: 8,
            runSpacing: 8,
            children: const [
              SpecaStatusChip('Dalam Proses', tone: SpecaTone.primary, icon: Icons.autorenew),
              SpecaStatusChip('Selesai', tone: SpecaTone.success, icon: Icons.check_circle),
              SpecaStatusChip('Menunggu', tone: SpecaTone.warning),
              SpecaStatusChip('Batal', tone: SpecaTone.danger),
              SpecaStatusChip('Arsip', tone: SpecaTone.muted),
            ],
          )),
          const SizedBox(height: 20),

          const SpecaSectionHeader('Statistik'),
          Row(
            children: [
              const Expanded(
                child: SpecaStatCard(label: 'Saldo', value: 'Rp125.000', icon: Icons.account_balance_wallet),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: SpecaStatCard(label: 'Pesanan', value: '3 Aktif', icon: Icons.receipt_long),
              ),
            ],
          ),
          const SizedBox(height: 20),

          const SpecaSectionHeader('Pilih Metode'),
          card(SpecaSegmented(
            selectedIndex: _method,
            onChanged: (i) => setState(() => _method = i),
            options: const [
              SpecaSegmentOption(icon: Icons.storefront, title: 'Ambil Sendiri', subtitle: 'Di lokasi'),
              SpecaSegmentOption(icon: Icons.local_shipping, title: 'Diantar', subtitle: 'Ke alamat'),
            ],
          )),
          const SizedBox(height: 20),

          const SpecaSectionHeader('Jumlah & Pilihan'),
          card(Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Jumlah', style: TextStyle(color: c.foreground, fontSize: 14)),
                  SpecaQtyStepper(value: _qty, onChanged: (v) => setState(() => _qty = v), max: 20),
                ],
              ),
              const SizedBox(height: 16),
              Text('Hari aktif', style: TextStyle(color: c.foreground, fontSize: 14)),
              const SizedBox(height: 10),
              SpecaChoiceChips(
                labels: const ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                selected: _days,
                onChanged: (v) => setState(() => _days = v),
              ),
            ],
          )),
          const SizedBox(height: 20),

          const SpecaSectionHeader('Timeline Status'),
          card(const SpecaStatusTimeline(
            currentIndex: 2,
            steps: [
              SpecaTimelineStep(title: 'Permintaan Diterima', detail: '09:15 WIB'),
              SpecaTimelineStep(title: 'Sedang Diproses', detail: '09:20 WIB'),
              SpecaTimelineStep(title: 'Dalam Perjalanan', detail: '09:35 WIB'),
              SpecaTimelineStep(title: 'Selesai', detail: 'Estimasi 09:55 WIB'),
            ],
          )),
          const SizedBox(height: 20),

          const SpecaSectionHeader('Ringkasan'),
          card(SpecaSummaryList(rows: [
            SpecaSummaryRow('Subtotal ($_qty item)', 'Rp${_qty * 8}.000'),
            const SpecaSummaryRow('Biaya layanan', 'Rp5.000'),
            SpecaSummaryRow('Total', 'Rp${_qty * 8 + 5}.000', emphasize: true),
          ])),
          const SizedBox(height: 16),
          FilledButton(onPressed: () {}, child: const Text('Tombol Utama')),
          const SizedBox(height: 10),
          OutlinedButton(onPressed: () {}, child: const Text('Tombol Sekunder')),
          const SizedBox(height: 20),

          const SpecaSectionHeader('Daftar Menu'),
          card(Column(
            children: const [
              SpecaMenuTile(icon: Icons.person_outline, title: 'Profil Saya'),
              SpecaMenuTile(icon: Icons.location_on_outlined, title: 'Alamat', trailingText: '2 tersimpan'),
              SpecaMenuTile(icon: Icons.help_outline, title: 'Pusat Bantuan'),
              SpecaMenuTile(icon: Icons.settings_outlined, title: 'Pengaturan'),
            ],
          )),
        ],
      ),
    );
  }
}
