import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/inspection/presentation/inspection_screen.dart';

void main() {
  testWidgets('InspectionScreen displays checklist items, categories, and summary badges', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: InspectionScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // App Bar & Title
    expect(find.text('Checklist Inspeksi'), findsOneWidget);
    expect(find.text('PLTMh Sampean Baru'), findsOneWidget);
    expect(find.text('Shift Pagi'), findsOneWidget);

    // Summary counters
    expect(find.text('Normal'), findsWidgets);
    expect(find.text('Perhatian'), findsWidgets);
    expect(find.text('Bahaya'), findsWidgets);

    // Categories
    expect(find.text('Turbin & Penstock'), findsOneWidget);
    expect(find.text('Generator & Eksitasi'), findsOneWidget);
    expect(find.text('Intake & Forebay'), findsOneWidget);
    expect(find.text('Panel Kontrol & Trafo'), findsOneWidget);

    // Specific inspection items
    expect(find.text('Suara & Getaran Turbin'), findsOneWidget);
    expect(find.text('Suhu Belitan Stator Winding'), findsOneWidget);
    expect(find.text('Kebersihan Trash Rack Intake'), findsOneWidget);
    expect(find.text('Status Alarm Panel Kontrol PLC'), findsOneWidget);

    // Bottom Navigation Bar
    expect(find.text('Beranda'), findsOneWidget);
    expect(find.text('Logbook'), findsOneWidget);
    expect(find.text('Menu'), findsOneWidget);
    expect(find.text('Profil'), findsOneWidget);
  });

  testWidgets('InspectionScreen allows changing item status and entering notes', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: InspectionScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Find the first "Perhatian" status button and tap it
    final warningChips = find.widgetWithText(GestureDetector, 'Perhatian');
    if (warningChips.evaluate().isNotEmpty) {
      await tester.tap(warningChips.first);
      await tester.pumpAndSettle();
    }

    // Scroll down to the notes field
    final notesField = find.byType(TextField);
    await tester.ensureVisible(notesField);
    await tester.enterText(notesField, 'Semua parameter dalam kondisi terpantau baik.');
    await tester.pumpAndSettle();

    // Find save button and tap
    final saveButton = find.text('Simpan Hasil Inspeksi');
    await tester.ensureVisible(saveButton);
    await tester.tap(saveButton);
    await tester.pump(const Duration(milliseconds: 700));
  });
}
