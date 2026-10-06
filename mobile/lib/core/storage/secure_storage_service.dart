import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final secureStorageServiceProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService(const FlutterSecureStorage());
});

class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService(this._storage);

  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _savedUsernameKey = 'saved_username';
  static const String _rememberMeKey = 'remember_me';

  static const String _biometricEnabledKey = 'biometric_enabled';
  static const String _biometricUsernameKey = 'biometric_username';
  static const String _biometricPasswordKey = 'biometric_password';

  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    try {
      await _storage.write(key: _accessTokenKey, value: accessToken);
      await _storage.write(key: _refreshTokenKey, value: refreshToken);
    } catch (_) {}
  }

  Future<String?> getAccessToken() async {
    try {
      return await _storage.read(key: _accessTokenKey);
    } catch (_) {
      return null;
    }
  }

  Future<String?> getRefreshToken() async {
    try {
      return await _storage.read(key: _refreshTokenKey);
    } catch (_) {
      return null;
    }
  }

  Future<void> clearTokens() async {
    try {
      await _storage.delete(key: _accessTokenKey);
      await _storage.delete(key: _refreshTokenKey);
    } catch (_) {}
  }

  Future<void> saveRememberMe({required bool rememberMe, String? username}) async {
    try {
      await _storage.write(key: _rememberMeKey, value: rememberMe.toString());
      if (username != null && rememberMe) {
        await _storage.write(key: _savedUsernameKey, value: username);
      } else {
        await _storage.delete(key: _savedUsernameKey);
      }
    } catch (_) {}
  }

  Future<bool> getRememberMe() async {
    try {
      final val = await _storage.read(key: _rememberMeKey);
      return val == 'true';
    } catch (_) {
      return false;
    }
  }

  Future<String?> getSavedUsername() async {
    try {
      return await _storage.read(key: _savedUsernameKey);
    } catch (_) {
      return null;
    }
  }

  Future<void> setBiometricEnabled(bool enabled) async {
    try {
      await _storage.write(key: _biometricEnabledKey, value: enabled.toString());
    } catch (_) {}
  }

  Future<bool> getBiometricEnabled() async {
    try {
      final val = await _storage.read(key: _biometricEnabledKey);
      return val == 'true';
    } catch (_) {
      return false;
    }
  }

  Future<void> saveBiometricCredentials({
    required String username,
    required String password,
  }) async {
    try {
      await _storage.write(key: _biometricUsernameKey, value: username);
      await _storage.write(key: _biometricPasswordKey, value: password);
    } catch (_) {}
  }

  Future<Map<String, String>?> getBiometricCredentials() async {
    try {
      final username = await _storage.read(key: _biometricUsernameKey);
      final password = await _storage.read(key: _biometricPasswordKey);
      if (username != null && password != null) {
        return {'username': username, 'password': password};
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<void> clearBiometricCredentials() async {
    try {
      await _storage.delete(key: _biometricUsernameKey);
      await _storage.delete(key: _biometricPasswordKey);
      await _storage.delete(key: _biometricEnabledKey);
    } catch (_) {}
  }
}
