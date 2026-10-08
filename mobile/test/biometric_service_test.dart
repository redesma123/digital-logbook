import 'package:flutter_test/flutter_test.dart';
import 'package:local_auth/local_auth.dart';
import 'package:mobile/core/services/biometric_service.dart';

class FakeLocalAuthentication extends LocalAuthentication {
  final bool deviceSupported;
  final bool hasBiometrics;
  final List<BiometricType> biometricTypes;
  final bool authResult;

  FakeLocalAuthentication({
    this.deviceSupported = true,
    this.hasBiometrics = true,
    this.biometricTypes = const [BiometricType.fingerprint],
    this.authResult = true,
  });

  @override
  Future<bool> isDeviceSupported() async => deviceSupported;

  @override
  Future<bool> get canCheckBiometrics async => hasBiometrics;

  @override
  Future<List<BiometricType>> getAvailableBiometrics() async => biometricTypes;

  @override
  Future<bool> authenticate({
    required String localizedReason,
    Iterable<dynamic> authMessages = const [],
    bool biometricOnly = false,
    bool sensitiveTransaction = true,
    bool persistAcrossBackgrounding = false,
  }) async {
    return authResult;
  }

  @override
  Future<bool> stopAuthentication() async => true;
}

void main() {
  group('BiometricService', () {
    test('isBiometricAvailable returns true when device supports and has biometrics', () async {
      final fakeAuth = FakeLocalAuthentication(deviceSupported: true, hasBiometrics: true);
      final service = BiometricService(fakeAuth);

      final isAvailable = await service.isBiometricAvailable();
      expect(isAvailable, isTrue);
    });

    test('isBiometricAvailable returns false when device is not supported', () async {
      final fakeAuth = FakeLocalAuthentication(deviceSupported: false, hasBiometrics: true);
      final service = BiometricService(fakeAuth);

      final isAvailable = await service.isBiometricAvailable();
      expect(isAvailable, isFalse);
    });

    test('isBiometricAvailable returns false when device cannot check biometrics', () async {
      final fakeAuth = FakeLocalAuthentication(deviceSupported: true, hasBiometrics: false);
      final service = BiometricService(fakeAuth);

      final isAvailable = await service.isBiometricAvailable();
      expect(isAvailable, isFalse);
    });

    test('getAvailableBiometrics returns enrolled biometrics list', () async {
      final fakeAuth = FakeLocalAuthentication(
        biometricTypes: [BiometricType.fingerprint, BiometricType.strong],
      );
      final service = BiometricService(fakeAuth);

      final types = await service.getAvailableBiometrics();
      expect(types, contains(BiometricType.fingerprint));
      expect(types.length, 2);
    });

    test('authenticate returns true when authentication succeeds', () async {
      final fakeAuth = FakeLocalAuthentication(
        deviceSupported: true,
        hasBiometrics: true,
        authResult: true,
      );
      final service = BiometricService(fakeAuth);

      final result = await service.authenticate();
      expect(result, isTrue);
    });

    test('authenticate returns false when device lacks biometrics', () async {
      final fakeAuth = FakeLocalAuthentication(
        deviceSupported: false,
        hasBiometrics: false,
        authResult: true,
      );
      final service = BiometricService(fakeAuth);

      final result = await service.authenticate();
      expect(result, isFalse);
    });
  });
}
