import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/secure_storage_service.dart';
import 'api_url_helper.dart';

final apiClientProvider = Provider<Dio>((ref) {
  final storage = ref.watch(secureStorageServiceProvider);
  final baseUrl = ApiUrlHelper.baseUrl;

  final dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 5),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
          ApiUrlHelper.setActiveAuthToken(token);
        }
        return handler.next(options);
      },
      onError: (DioException error, handler) async {
        if (error.response?.statusCode == 401 && error.requestOptions.path != '/auth/refresh') {
          final refreshToken = await storage.getRefreshToken();
          if (refreshToken != null && refreshToken.isNotEmpty) {
            try {
              final refreshResponse = await dio.post(
                '/auth/refresh',
                data: {'refreshToken': refreshToken},
              );

              if (refreshResponse.statusCode == 200 && refreshResponse.data != null) {
                final newAccessToken = refreshResponse.data['accessToken'] as String?;
                final newRefreshToken = refreshResponse.data['refreshToken'] as String?;

                if (newAccessToken != null) {
                  await storage.saveTokens(
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken ?? refreshToken,
                  );

                  // Retry the original request
                  final originalOptions = error.requestOptions;
                  originalOptions.headers['Authorization'] = 'Bearer $newAccessToken';
                  final retryResponse = await dio.fetch(originalOptions);
                  return handler.resolve(retryResponse);
                }
              }
            } catch (_) {
              await storage.clearTokens();
            }
          }
        }
        return handler.next(error);
      },
    ),
  );

  return dio;
});
