import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/maintenance/presentation/input_maintenance_screen.dart';
import 'package:mobile/features/maintenance/presentation/maintenance_list_screen.dart';

void main() {
  testWidgets('InputMaintenanceScreen displays all form fields matching Screen 9 layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: InputMaintenanceScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // App Bar
    expect(find.text('Input Maintenance'), findsOneWidget);

    // Form labels
    expect(find.text('Tanggal'), findsOneWidget);
    expect(find.text('Peralatan'), findsOneWidget);
    expect(find.text('Jenis Pekerjaan'), findsOneWidget);
    expect(find.text('Deskripsi Pekerjaan'), findsOneWidget);
    expect(find.text('Teknisi'), findsOneWidget);
    expect(find.text('Status'), findsOneWidget);
    expect(find.text('Foto'), findsOneWidget);

    // Initial values
    expect(find.text('Turbin'), findsOneWidget);
    expect(find.text('Inspeksi Rutin'), findsOneWidget);
    expect(find.text('Pengecekan kondisi bearing, pelumasan, dan kebersihan.'), findsOneWidget);
    expect(find.text('Andi Pratama'), findsOneWidget);

    // Status buttons
    expect(find.text('Plan'), findsOneWidget);
    expect(find.text('Process'), findsOneWidget);
    expect(find.text('Complete'), findsOneWidget);

    // Action button
    expect(find.text('Simpan'), findsOneWidget);
  });

  testWidgets('InputMaintenanceScreen allows changing status selection', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: InputMaintenanceScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    final processFinder = find.text('Process');
    await tester.ensureVisible(processFinder);
    await tester.pumpAndSettle();
    await tester.tap(processFinder);
    await tester.pumpAndSettle();

    final completeFinder = find.text('Complete');
    await tester.ensureVisible(completeFinder);
    await tester.pumpAndSettle();
    await tester.tap(completeFinder);
    await tester.pumpAndSettle();
  });

  testWidgets('MaintenanceListScreen displays cards and filters matching Screen 10 layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: MaintenanceListScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // App Bar & Filter
    expect(find.text('Daftar Maintenance'), findsOneWidget);
    expect(find.text('Semua Status'), findsOneWidget);

    // Maintenance equipment titles & job types
    expect(find.text('Turbin'), findsOneWidget);
    expect(find.text('Inspeksi Rutin'), findsOneWidget);
    expect(find.text('Generator'), findsOneWidget);
    expect(find.text('Penggantian Filter Udara'), findsOneWidget);
    expect(find.text('Intake'), findsOneWidget);
    expect(find.text('Pembersihan Trash Rack'), findsOneWidget);
    expect(find.text('Panel Kontrol'), findsOneWidget);
    expect(find.text('Pengecekan Panel'), findsOneWidget);

    // Status Badges
    expect(find.text('COMPLETE'), findsNWidgets(3));
    expect(find.text('PROCESS'), findsOneWidget);

    // Bottom Navigation Bar
    expect(find.text('Beranda'), findsOneWidget);
    expect(find.text('Menu'), findsOneWidget);
    expect(find.text('Profil'), findsOneWidget);
  });

  testWidgets('MaintenanceListScreen opens detail modal when a maintenance card is tapped', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: MaintenanceListScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Tap on the first maintenance card
    await tester.tap(find.text('Inspeksi Rutin'));
    await tester.pumpAndSettle();

    // Verify detail modal opened with detailed information
    expect(find.text('Peralatan'), findsOneWidget);
    expect(find.text('Teknisi Penanggung Jawab'), findsOneWidget);
    expect(find.text('Deskripsi Pekerjaan'), findsOneWidget);
    expect(find.text('Tutup'), findsOneWidget);

    // Tap Close
    await tester.tap(find.text('Tutup'));
    await tester.pumpAndSettle();

    expect(find.text('Teknisi Penanggung Jawab'), findsNothing);
  });
}
