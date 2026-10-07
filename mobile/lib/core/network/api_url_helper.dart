import 'package:flutter/foundation.dart';

class ApiUrlHelper {
  static const String _configuredBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const String _defaultBaseUrl = kIsWeb ? 'http://localhost:3000/api/v1' : 'http://192.168.1.70:3000/api/v1';

  static String get baseUrl => _configuredBaseUrl.isNotEmpty ? _configuredBaseUrl : _defaultBaseUrl;

  /// Mengubah path attachment relatif menjadi full network URL dengan token opsional
  static String resolvePhotoUrl(String path, [String? token]) {
    if (path.isEmpty) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      if (token != null && token.isNotEmpty && !path.contains('token=')) {
        return path.contains('?') ? '$path&token=$token' : '$path?token=$token';
      }
      return path;
    }
    if (path.startsWith('/')) {
      final url = '$baseUrl$path';
      if (token != null && token.isNotEmpty) {
        return '$url?token=$token';
      }
      return url;
    }
    return path;
  }
}
