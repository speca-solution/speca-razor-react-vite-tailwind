import 'package:flutter/material.dart';

import 'speca_tokens.dart';

/// Membangun [ThemeData] dari token SPECA sehingga widget Material standar
/// (tombol, kartu, input, bottom-nav) otomatis tampil seperti tema WEB —
/// tanpa styling manual di tiap layar.
///
/// Pakai: `MaterialApp(theme: buildSpecaTheme(SpecaThemeVariant.theme1),
///                     darkTheme: buildSpecaTheme(..., brightness: Brightness.dark))`
ThemeData buildSpecaTheme(
  SpecaThemeVariant variant, {
  Brightness brightness = Brightness.light,
}) {
  final c = SpecaTokens.colors(variant, brightness);
  final s = SpecaTokens.shape(variant);
  final isDark = brightness == Brightness.dark;

  final scheme = ColorScheme(
    brightness: brightness,
    primary: c.primary,
    onPrimary: c.primaryForeground,
    secondary: c.accent,
    onSecondary: c.secondaryForeground,
    error: isDark ? const Color(0xFFFF6F6F) : const Color(0xFFF8285A),
    onError: Colors.white,
    surface: c.muted,
    onSurface: c.foreground,
    outline: c.border,
    surfaceContainerLowest: c.background,
    surfaceContainerHighest: c.accent,
  );

  final radiusCard = BorderRadius.circular(s.radiusCard);
  final radiusCtl = BorderRadius.circular(s.radius);

  OutlineInputBorder inputBorder(Color color, [double width = 1]) => OutlineInputBorder(
        borderRadius: radiusCtl,
        borderSide: BorderSide(color: color, width: width),
      );

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    scaffoldBackgroundColor: c.background,
    // Web memakai Inter; di mobile pakai font sistem agar tanpa aset tambahan.
    fontFamily: null,

    extensions: [SpecaTheme(colors: c, shape: s)],

    appBarTheme: AppBarTheme(
      backgroundColor: c.background,
      foregroundColor: c.foreground,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: c.foreground,
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
    ),

    cardTheme: CardThemeData(
      color: c.muted,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: radiusCard,
        side: BorderSide(color: c.border),
      ),
    ),

    dividerTheme: DividerThemeData(color: c.border, thickness: 1, space: 1),

    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: c.primary,
        foregroundColor: c.primaryForeground,
        minimumSize: Size(0, s.controlHeight + 8), // sentuh nyaman di mobile
        padding: EdgeInsets.symmetric(horizontal: s.controlPadX + 4),
        shape: RoundedRectangleBorder(borderRadius: radiusCtl),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),

    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: c.foreground,
        side: BorderSide(color: c.input),
        minimumSize: Size(0, s.controlHeight + 8),
        padding: EdgeInsets.symmetric(horizontal: s.controlPadX + 4),
        shape: RoundedRectangleBorder(borderRadius: radiusCtl),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),

    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: c.primary),
    ),

    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: isDark ? c.accent : c.background,
      contentPadding: EdgeInsets.symmetric(
        horizontal: s.controlPadX,
        vertical: 14,
      ),
      border: inputBorder(c.input),
      enabledBorder: inputBorder(c.input),
      focusedBorder: inputBorder(c.primary, 1.5),
      labelStyle: TextStyle(color: c.mutedForeground, fontSize: 14),
      hintStyle: TextStyle(color: c.mutedForeground, fontSize: 14),
    ),

    chipTheme: ChipThemeData(
      backgroundColor: c.accent,
      side: BorderSide(color: c.border),
      labelStyle: TextStyle(color: c.secondaryForeground, fontSize: 12.5),
      shape: RoundedRectangleBorder(borderRadius: radiusCtl),
    ),

    listTileTheme: ListTileThemeData(
      iconColor: c.mutedForeground,
      textColor: c.foreground,
      shape: RoundedRectangleBorder(borderRadius: radiusCtl),
    ),

    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: c.muted,
      surfaceTintColor: Colors.transparent,
      indicatorColor: c.primary.withValues(alpha: 0.12),
      elevation: 0,
      height: 64,
      labelTextStyle: WidgetStatePropertyAll(
        TextStyle(fontSize: 11.5, color: c.mutedForeground, fontWeight: FontWeight.w500),
      ),
    ),

    textTheme: TextTheme(
      titleLarge: TextStyle(color: c.foreground, fontSize: 18, fontWeight: FontWeight.w600),
      titleMedium: TextStyle(color: c.foreground, fontSize: 15, fontWeight: FontWeight.w600),
      bodyMedium: TextStyle(color: c.foreground, fontSize: 14),
      bodySmall: TextStyle(color: c.mutedForeground, fontSize: 12.5),
      labelLarge: TextStyle(color: c.foreground, fontSize: s.fontControl, fontWeight: FontWeight.w600),
    ),
  );
}
