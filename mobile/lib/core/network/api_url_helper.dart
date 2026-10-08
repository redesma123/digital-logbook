import 'package:flutter/foundation.dart';

class ApiUrlHelper {
  /// Base URL resmi Production (Domain HTTPS publik Render.com)
  static const String _productionBaseUrl = 'https://digital-logbook-i836.onrender.com/api/v1';

  /// Base URL yang disuntikkan via build argument: --dart-define=API_BASE_URL=...
  static const String _buildEnvUrl = String.fromEnvironment('API_BASE_URL');

  /// Fallback untuk development lokal / default
  static const String _devWebUrl = 'https://digital-logbook-i836.onrender.com/api/v1';
  static const String _devLanUrl = 'https://digital-logbook-i836.onrender.com/api/v1';

  /// URL dinamis yang bisa diubah saat runtime di mode Debug/Testing
  static String? _dynamicOverrideUrl;

  /// Ubah URL secara dinamis saat testing di mode Debug
  static void setDynamicUrl(String? newUrl) {
    if (newUrl == null || newUrl.trim().isEmpty) {
      _dynamicOverrideUrl = null;
    } else {
      var trimmed = newUrl.trim();
      if (!trimmed.endsWith('/api/v1')) {
        trimmed = trimmed.endsWith('/') ? '${trimmed}api/v1' : '$trimmed/api/v1';
      }
      _dynamicOverrideUrl = trimmed;
    }
  }

  /// Menentukan Base URL aktif berdasarkan environment dan mode build
  static String get baseUrl {
    // 1. Jika ada override dinamis saat testing (Debug mode)
    if (kDebugMode && _dynamicOverrideUrl != null && _dynamicOverrideUrl!.isNotEmpty) {
      return _dynamicOverrideUrl!;
    }

    // 2. Jika disuntikkan via CI/CD atau build command (--dart-define)
    if (_buildEnvUrl.isNotEmpty) {
      return _buildEnvUrl;
    }

    // 3. Jika mode PRODUCTION (flutter build apk/appbundle/ipa) -> Selalu pakai domain publik
    if (kReleaseMode) {
      return _productionBaseUrl;
    }

    // 4. Jika mode DEVELOPMENT di Web
    if (kIsWeb) {
      return _devWebUrl;
    }

    // 5. Fallback Development di Mobile (HP Fisik / LAN)
    return _devLanUrl;
  }

  static String? _activeAuthToken;

  /// Simpan token otentikasi aktif untuk request media/gambar
  static void setActiveAuthToken(String? token) {
    _activeAuthToken = token;
  }

  /// Mengubah path attachment relatif menjadi full network URL dengan token otentikasi
  static String resolvePhotoUrl(String path, [String? token]) {
    if (path.isEmpty) return '';

    // JIKA PATH ADALAH FILE SISTEM LOKAL (Hasil image_picker di HP Android/iOS)
    if (path.startsWith('/data/') ||
        path.startsWith('/storage/') ||
        path.startsWith('/var/') ||
        path.startsWith('/private/') ||
        path.startsWith('file://')) {
      return path;
    }

    final effectiveToken = (token != null && token.isNotEmpty) ? token : _activeAuthToken;

    if (path.startsWith('http://') || path.startsWith('https://')) {
      if (effectiveToken != null && effectiveToken.isNotEmpty && !path.contains('token=')) {
        return path.contains('?') ? '$path&token=$effectiveToken' : '$path?token=$effectiveToken';
      }
      return path;
    }

    if (path.startsWith('/')) {
      final url = '$baseUrl$path';
      if (effectiveToken != null && effectiveToken.isNotEmpty) {
        return '$url?token=$effectiveToken';
      }
      return url;
    }

    if (path.startsWith('attachments/') || path.startsWith('uploads/')) {
      final url = '$baseUrl/$path';
      if (effectiveToken != null && effectiveToken.isNotEmpty) {
        return '$url?token=$effectiveToken';
      }
      return url;
    }

    return path;
  }
}
