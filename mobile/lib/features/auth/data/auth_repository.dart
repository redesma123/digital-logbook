import 'dart:convert';
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

      await _storage.saveUserData(jsonEncode(user.toJson()));

      await _storage.saveRememberMe(
        rememberMe: rememberMe,
        username: rememberMe ? username : null,
      );

      return user;
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] as String? ??
          e.response?.data?['error'] as String? ??
          (e.response?.statusCode == 401
              ? 'Username atau password salah'
              : 'Gagal melakukan login. Periksa koneksi ke server.');
      throw Exception(msg);
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Terjadi kesalahan pada sistem autentikasi');
    }
  }

  Future<UserModel?> getCurrentUser() async {
    try {
      final token = await _storage.getAccessToken();
      if (token == null || token.isEmpty) return null;

      final response = await _dio.get('/auth/me');
      if (response.statusCode == 200 && response.data?['data'] != null) {
        final user = UserModel.fromJson(response.data['data'] as Map<String, dynamic>);
        await _storage.saveUserData(jsonEncode(user.toJson()));
        return user;
      }
    } catch (_) {
      // Fallback to locally saved user if offline
      final savedJson = await _storage.getUserData();
      if (savedJson != null && savedJson.isNotEmpty) {
        try {
          return UserModel.fromJson(jsonDecode(savedJson) as Map<String, dynamic>);
        } catch (_) {}
      }
    }
    return null;
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
      await _storage.clearUserData();
    }
  }
}
