import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/storage/secure_storage_service.dart';
import '../../domain/user_model.dart';
import '../../data/auth_repository.dart';

class AuthState {
  final bool isLoading;
  final UserModel? user;
  final String? errorMessage;
  final bool rememberMe;
  final String? savedUsername;

  const AuthState({
    this.isLoading = false,
    this.user,
    this.errorMessage,
    this.rememberMe = false,
    this.savedUsername,
  });

  AuthState copyWith({
    bool? isLoading,
    UserModel? user,
    String? errorMessage,
    bool? rememberMe,
    String? savedUsername,
    bool clearError = false,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      rememberMe: rememberMe ?? this.rememberMe,
      savedUsername: savedUsername ?? this.savedUsername,
    );
  }
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);

class AuthController extends Notifier<AuthState> {
  late final AuthRepository _repository;
  late final SecureStorageService _storage;

  @override
  AuthState build() {
    _repository = ref.watch(authRepositoryProvider);
    _storage = ref.watch(secureStorageServiceProvider);
    Future.microtask(() => _loadPreferences());
    return const AuthState();
  }

  Future<void> _loadPreferences() async {
    try {
      final rememberMe = await _storage.getRememberMe();
      final savedUsername = await _storage.getSavedUsername();
      state = state.copyWith(
        rememberMe: rememberMe,
        savedUsername: savedUsername,
      );
    } catch (_) {}
  }

  void toggleRememberMe(bool? value) {
    state = state.copyWith(rememberMe: value ?? false);
  }

  Future<bool> login(String username, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final user = await _repository.login(
        username: username.trim(),
        password: password,
        rememberMe: state.rememberMe,
      );
      state = state.copyWith(
        isLoading: false,
        user: user,
      );
      return true;
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      state = state.copyWith(
        isLoading: false,
        errorMessage: msg,
      );
      return false;
    }
  }

  Future<bool> loginWithBiometrics() async {
    state = state.copyWith(isLoading: true, clearError: true);
    // Simulate biometric check / auth
    await Future.delayed(const Duration(milliseconds: 600));
    final hasToken = await _repository.hasValidToken();
    if (hasToken) {
      state = state.copyWith(
        isLoading: false,
        user: const UserModel(
          id: 1,
          username: 'operator1',
          fullName: 'Andi Pratama',
          role: 'OPERATOR',
        ),
      );
      return true;
    } else {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Biometrik belum terdaftar. Silakan login dengan username dan password terlebih dahulu.',
      );
      return false;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    await _repository.logout();
    state = const AuthState();
    _loadPreferences();
  }
}
