import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/auth/presentation/login_screen.dart';

void main() {
  testWidgets('LoginScreen displays all UI elements from design layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    // Header brand
    expect(find.text('HYDRO-MON'), findsOneWidget);
    expect(find.text('PLTMh Logbook & Monitoring'), findsOneWidget);

    // Inputs
    expect(find.text('Username'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);

    // Actions & Buttons
    expect(find.text('Ingat saya'), findsOneWidget);
    expect(find.text('Lupa password?'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('atau masuk dengan'), findsOneWidget);
    expect(find.text('Login dengan Biometrik'), findsOneWidget);
    expect(find.text('Versi 1.0.0'), findsOneWidget);
  });

  testWidgets('LoginScreen validates empty input fields', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    // Tap Login without entering anything
    await tester.tap(find.text('Login'));
    await tester.pump();

    expect(find.text('Username wajib diisi'), findsOneWidget);
    expect(find.text('Password wajib diisi'), findsOneWidget);
  });
}
