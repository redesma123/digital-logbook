import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:local_auth/local_auth.dart';
import 'package:mobile/core/services/biometric_service.dart';
import 'package:mobile/core/storage/secure_storage_service.dart';
import 'package:mobile/features/auth/presentation/login_screen.dart';

class _FakeLocalAuthentication extends LocalAuthentication {
  @override
  Future<bool> isDeviceSupported() async => true;

  @override
  Future<bool> get canCheckBiometrics async => true;

  @override
  Future<List<BiometricType>> getAvailableBiometrics() async => [BiometricType.fingerprint];

  @override
  Future<bool> authenticate({
    required String localizedReason,
    Iterable<dynamic> authMessages = const [],
    bool biometricOnly = false,
    bool sensitiveTransaction = true,
    bool persistAcrossBackgrounding = false,
  }) async => true;

  @override
  Future<bool> stopAuthentication() async => true;
}

class _FakeSecureStorageService extends SecureStorageService {
  final Map<String, String> _data = {};

  _FakeSecureStorageService() : super(const FlutterSecureStorage());

  @override
  Future<void> setBiometricEnabled(bool enabled) async {
    _data['biometric_enabled'] = enabled.toString();
  }

  @override
  Future<bool> getBiometricEnabled() async {
    return _data['biometric_enabled'] == 'true';
  }

  @override
  Future<void> saveBiometricCredentials({
    required String username,
    required String password,
  }) async {
    _data['biometric_username'] = username;
    _data['biometric_password'] = password;
  }

  @override
  Future<Map<String, String>?> getBiometricCredentials() async {
    if (_data.containsKey('biometric_username') && _data.containsKey('biometric_password')) {
      return {
        'username': _data['biometric_username']!,
        'password': _data['biometric_password']!,
      };
    }
    return null;
  }

  @override
  Future<bool> getRememberMe() async => false;

  @override
  Future<String?> getSavedUsername() async => null;

  @override
  Future<void> clearBiometricCredentials() async {
    _data.clear();
  }
}

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

  testWidgets('LoginScreen shows warning when biometric tapped before setup', (WidgetTester tester) async {
    final fakeAuth = _FakeLocalAuthentication();
    final fakeBiometricService = BiometricService(fakeAuth);
    final fakeStorage = _FakeSecureStorageService();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          biometricServiceProvider.overrideWithValue(fakeBiometricService),
          secureStorageServiceProvider.overrideWithValue(fakeStorage),
        ],
        child: const MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    await tester.tap(find.text('Login dengan Biometrik'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 750));

    expect(find.byType(SnackBar), findsOneWidget);
    expect(find.text('Login biometrik belum diaktifkan. Silakan login dengan password terlebih dahulu.'), findsOneWidget);
  });
}
