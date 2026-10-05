import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/incident/presentation/input_incident_screen.dart';
import 'package:mobile/features/incident/presentation/incident_list_screen.dart';

void main() {
  testWidgets('InputIncidentScreen displays all form fields matching Screen 7 layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: InputIncidentScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // App Bar
    expect(find.text('Input Gangguan'), findsOneWidget);

    // Form labels
    expect(find.text('Tanggal & Waktu'), findsOneWidget);
    expect(find.text('Peralatan'), findsOneWidget);
    expect(find.text('Jenis Gangguan'), findsOneWidget);
    expect(find.text('Deskripsi Gangguan'), findsOneWidget);
    expect(find.text('Tindakan Operator'), findsOneWidget);
    expect(find.text('Status'), findsOneWidget);
    expect(find.text('Foto'), findsOneWidget);

    // Initial values
    expect(find.text('Generator'), findsOneWidget);
    expect(find.text('Trip'), findsOneWidget);
    expect(find.text('Generator trip karena over current.'), findsOneWidget);
    expect(find.text('Cek proteksi dan reset.'), findsOneWidget);

    // Status buttons
    expect(find.text('Open'), findsOneWidget);
    expect(find.text('Process'), findsOneWidget);
    expect(find.text('Closed'), findsOneWidget);

    // Action button
    expect(find.text('Simpan'), findsOneWidget);
  });

  testWidgets('InputIncidentScreen allows changing status selection', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: InputIncidentScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    final processFinder = find.text('Process');
    await tester.ensureVisible(processFinder);
    await tester.pumpAndSettle();
    await tester.tap(processFinder);
    await tester.pumpAndSettle();

    final closedFinder = find.text('Closed');
    await tester.ensureVisible(closedFinder);
    await tester.pumpAndSettle();
    await tester.tap(closedFinder);
    await tester.pumpAndSettle();
  });

  testWidgets('IncidentListScreen displays cards and filters matching Screen 8 layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: IncidentListScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // App Bar & Filter
    expect(find.text('Daftar Gangguan'), findsOneWidget);
    expect(find.text('Semua Status'), findsOneWidget);

    // Incident titles & status badges
    expect(find.text('Generator Trip'), findsOneWidget);
    expect(find.text('Turbine Vibration'), findsOneWidget);
    expect(find.text('Intake Tersumbat'), findsOneWidget);
    expect(find.text('Panel Kontrol'), findsOneWidget);

    expect(find.text('OPEN'), findsOneWidget);
    expect(find.text('PROCESS'), findsOneWidget);
    expect(find.text('CLOSED'), findsNWidgets(2));

    // Bottom Navigation Bar
    expect(find.text('Beranda'), findsOneWidget);
    expect(find.text('Logbook'), findsOneWidget);
    expect(find.text('Menu'), findsOneWidget);
    expect(find.text('Profil'), findsOneWidget);
  });

  testWidgets('IncidentListScreen opens detail modal when an incident card is tapped', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: IncidentListScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Tap on the first incident card
    await tester.tap(find.text('Generator Trip'));
    await tester.pumpAndSettle();

    // Verify detail modal opened with detailed information
    expect(find.text('Peralatan Terkait'), findsOneWidget);
    expect(find.text('Dilaporkan Oleh'), findsOneWidget);
    expect(find.text('Deskripsi Gangguan'), findsOneWidget);
    expect(find.text('Tindakan Operator'), findsOneWidget);
    expect(find.text('Tutup'), findsOneWidget);

    // Tap Close
    await tester.tap(find.text('Tutup'));
    await tester.pumpAndSettle();

    expect(find.text('Peralatan Terkait'), findsNothing);
  });
}
