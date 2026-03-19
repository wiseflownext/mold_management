import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static const Color primary = Color(0xFF1A73E8);
  static const Color accent = Color(0xFFFF6D00);
  static const Color background = Color(0xFFF5F7FA);
  static const Color card = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1F2937);
  static const Color textSecondary = Color(0xFF6B7280);

  static const double h1 = 24;
  static const double h2 = 20;
  static const double h3 = 18;
  static const double body = 16;
  static const double caption = 14;
  static const double label = 12;

  static const double cardRadius = 12;
  static const double buttonRadius = 8;
  static const double tagRadius = 20;

  static const double pagePadding = 16;
  static const double cardPadding = 16;
  static const double itemGap = 12;
  static const double sectionGap = 24;

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: primary,
          primary: primary,
          secondary: accent,
          surface: card,
          error: const Color(0xFFEF4444),
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: textPrimary,
          onSurfaceVariant: textSecondary,
        ),
        scaffoldBackgroundColor: background,
        appBarTheme: const AppBarTheme(
          backgroundColor: card,
          foregroundColor: textPrimary,
          elevation: 0,
        ),
        cardTheme: CardThemeData(
          color: card,
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(cardRadius),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(buttonRadius),
            ),
          ),
        ),
        textTheme: const TextTheme(
          headlineLarge: TextStyle(fontSize: h1, color: textPrimary),
          headlineMedium: TextStyle(fontSize: h2, color: textPrimary),
          headlineSmall: TextStyle(fontSize: h3, color: textPrimary),
          bodyLarge: TextStyle(fontSize: body, color: textPrimary),
          bodyMedium: TextStyle(fontSize: body, color: textPrimary),
          bodySmall: TextStyle(fontSize: caption, color: textSecondary),
          labelLarge: TextStyle(fontSize: label, color: textSecondary),
        ),
      );
}
