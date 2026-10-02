import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/core/storage/secure_storage_service.dart';
import '../domain/user_model.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.watch(apiClientProvider);
  final storage = ref.watch(secureStorageServiceProvider);
  return AuthRepository(dio, storage);
});

class AuthRepository {
  final Dio _dio;
  final SecureStorageService _storage;

  AuthRepository(this._dio, this._storage);

  Future<UserModel> login({
    required String username,
    required String password,
    bool rememberMe = false,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {
          'username': username,
          'password': password,
        },
      );

      final data = response.data['data'] as Map<String, dynamic>;
      final accessToken = data['accessToken'] as String;
      final refreshToken = data['refreshToken'] as String;
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);

      await _storage.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );

      await _storage.saveRememberMe(
        rememberMe: rememberMe,
        username: rememberMe ? username : null,
      );

      return user;
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ??
          e.response?.data?['error'] as String? ??
          'Gagal melakukan login. Periksa username dan password.';
      throw Exception(msg);
    } catch (e) {
      throw Exception('Terjadi kesalahan jaringan atau server');
    }
  }

  Future<bool> hasValidToken() async {
    final token = await _storage.getAccessToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _storage.getRefreshToken();
      if (refreshToken != null) {
        await _dio.post(
          '/auth/logout',
          data: {'refreshToken': refreshToken},
        );
      }
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      await _storage.clearTokens();
    }
  }
}
