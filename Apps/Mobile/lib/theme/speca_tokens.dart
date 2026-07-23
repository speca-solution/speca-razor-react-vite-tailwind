import 'package:flutter/material.dart';

/// Token desain mobile — CERMIN dari token CSS tema web
/// (`Libs/UI/Assets/Themes/theme1/_tokens.css` & `theme2/_tokens.css`).
///
/// KENAPA disalin, bukan di-import: Flutter merender widget sendiri dan tidak
/// membaca CSS. Agar mobile satu keluarga dengan web, nilai token disamakan
/// MANUAL di sini. Bila token web berubah, perbarui file ini (satu tempat).
///
/// Sumbu tema sama dengan web: theme1 (rasa Metronic, biru, flat/bordered) dan
/// theme2 (rasa Vuexy, ungu, soft/melayang).
enum SpecaThemeVariant { theme1, theme2 }

/// Satu set nilai warna untuk satu mode (light/dark) — nama field mengikuti
/// nama variabel CSS agar mudah dilacak balik ke web.
@immutable
class SpecaColors {
  const SpecaColors({
    required this.background,
    required this.foreground,
    required this.muted,
    required this.mutedForeground,
    required this.secondaryForeground,
    required this.accent,
    required this.border,
    required this.input,
    required this.primary,
    required this.primaryForeground,
  });

  final Color background;
  final Color foreground;
  final Color muted;
  final Color mutedForeground;
  final Color secondaryForeground;
  final Color accent;
  final Color border;
  final Color input;
  final Color primary;
  final Color primaryForeground;
}

/// Token BENTUK (radius, tinggi kontrol, padding, shadow) — juga cermin web.
@immutable
class SpecaShape {
  const SpecaShape({
    required this.radius,
    required this.radiusCard,
    required this.controlHeight,
    required this.controlPadX,
    required this.cardPadX,
    required this.fontControl,
    required this.cardShadow,
  });

  final double radius;
  final double radiusCard;
  final double controlHeight;
  final double controlPadX;
  final double cardPadX;
  final double fontControl;
  final List<BoxShadow> cardShadow;
}

/// Nilai token per varian/mode. Angka rem web dikonversi ke logical pixel
/// dengan basis 16 (1rem = 16px), sama seperti default browser.
class SpecaTokens {
  // ── theme1 (Metronic) ──────────────────────────────────────────────────────
  static const _theme1Light = SpecaColors(
    background: Color(0xFFFFFFFF),
    foreground: Color(0xFF071437),
    muted: Color(0xFFF9F9F9),
    mutedForeground: Color(0xFF99A1B7),
    secondaryForeground: Color(0xFF4B5675),
    accent: Color(0xFFF1F1F4),
    border: Color(0xFFF1F1F4),
    input: Color(0xFFDBDFE9),
    primary: Color(0xFF1B84FF),
    primaryForeground: Color(0xFFFFFFFF),
  );

  static const _theme1Dark = SpecaColors(
    background: Color(0xFF15171C),
    foreground: Color(0xFFF5F5F5),
    muted: Color(0xFF1B1C22),
    mutedForeground: Color(0xFF636674),
    secondaryForeground: Color(0xFF9A9CAE),
    accent: Color(0xFF1B1C22),
    border: Color(0xFF26272F),
    input: Color(0xFF363843),
    primary: Color(0xFF1B84FF),
    primaryForeground: Color(0xFFFFFFFF),
  );

  // radius .375rem=6, radius-card .75rem=12, control-h 2.125rem=34, px .75rem=12
  static const _theme1Shape = SpecaShape(
    radius: 6,
    radiusCard: 12,
    controlHeight: 34,
    controlPadX: 12,
    cardPadX: 20,
    fontControl: 13,
    cardShadow: [BoxShadow(color: Color(0x0D000000), blurRadius: 2, offset: Offset(0, 1))],
  );

  // ── theme2 (Vuexy) ─────────────────────────────────────────────────────────
  static const _theme2Light = SpecaColors(
    background: Color(0xFFF8F7FA),
    foreground: Color(0xFF444050),
    muted: Color(0xFFFFFFFF),
    mutedForeground: Color(0xFFA5A3AE),
    secondaryForeground: Color(0xFF6D6B77),
    accent: Color(0xFFEFEEF6),
    border: Color(0xFFE6E6E8),
    input: Color(0xFFD1CFD4),
    primary: Color(0xFF7367F0),
    primaryForeground: Color(0xFFFFFFFF),
  );

  static const _theme2Dark = SpecaColors(
    background: Color(0xFF25293C),
    foreground: Color(0xFFCFD3EC),
    muted: Color(0xFF2F3349),
    mutedForeground: Color(0xFF7E82A3),
    secondaryForeground: Color(0xFF9DA1BE),
    accent: Color(0xFF3A3F57),
    border: Color(0xFF434968),
    input: Color(0xFF565B7C),
    primary: Color(0xFF7367F0),
    primaryForeground: Color(0xFFFFFFFF),
  );

  // radius .375rem=6, radius-card .375rem=6, control-h 2.625rem=42, px 1rem=16
  static const _theme2Shape = SpecaShape(
    radius: 6,
    radiusCard: 6,
    controlHeight: 42,
    controlPadX: 16,
    cardPadX: 24,
    fontControl: 13,
    cardShadow: [BoxShadow(color: Color(0x144B465C), blurRadius: 6, offset: Offset(0, 2))],
  );

  static SpecaColors colors(SpecaThemeVariant v, Brightness b) {
    final dark = b == Brightness.dark;
    return switch (v) {
      SpecaThemeVariant.theme1 => dark ? _theme1Dark : _theme1Light,
      SpecaThemeVariant.theme2 => dark ? _theme2Dark : _theme2Light,
    };
  }

  static SpecaShape shape(SpecaThemeVariant v) => switch (v) {
        SpecaThemeVariant.theme1 => _theme1Shape,
        SpecaThemeVariant.theme2 => _theme2Shape,
      };
}

/// Akses token dari widget: `context.specaColors` / `context.specaShape`.
/// Ditanam ke ThemeData lewat [ThemeExtension] agar ikut light/dark otomatis.
@immutable
class SpecaTheme extends ThemeExtension<SpecaTheme> {
  const SpecaTheme({required this.colors, required this.shape});

  final SpecaColors colors;
  final SpecaShape shape;

  @override
  SpecaTheme copyWith({SpecaColors? colors, SpecaShape? shape}) =>
      SpecaTheme(colors: colors ?? this.colors, shape: shape ?? this.shape);

  // Token diskrit (warna brand & bentuk) tidak perlu di-lerp antar tema.
  @override
  SpecaTheme lerp(ThemeExtension<SpecaTheme>? other, double t) =>
      other is SpecaTheme && t >= 0.5 ? other : this;
}

extension SpecaThemeContext on BuildContext {
  SpecaTheme get speca => Theme.of(this).extension<SpecaTheme>()!;
  SpecaColors get specaColors => speca.colors;
  SpecaShape get specaShape => speca.shape;
}
