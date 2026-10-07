import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/services/biometric_service.dart';
import 'package:mobile/core/storage/secure_storage_service.dart';
import '../../domain/user_model.dart';
import '../../data/auth_repository.dart';

class AuthState {
  final bool isLoading;
  final UserModel? user;
  final String? errorMessage;
  final bool rememberMe;
  final String? savedUsername;
  final bool isBiometricEnabled;
  final bool isBiometricAvailable;

  const AuthState({
    this.isLoading = false,
    this.user,
    this.errorMessage,
    this.rememberMe = false,
    this.savedUsername,
    this.isBiometricEnabled = false,
    this.isBiometricAvailable = false,
  });

  AuthState copyWith({
    bool? isLoading,
    UserModel? user,
    String? errorMessage,
    bool? rememberMe,
    String? savedUsername,
    bool? isBiometricEnabled,
    bool? isBiometricAvailable,
    bool clearError = false,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      rememberMe: rememberMe ?? this.rememberMe,
      savedUsername: savedUsername ?? this.savedUsername,
      isBiometricEnabled: isBiometricEnabled ?? this.isBiometricEnabled,
      isBiometricAvailable: isBiometricAvailable ?? this.isBiometricAvailable,
    );
  }
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);

class AuthController extends Notifier<AuthState> {
  late final AuthRepository _repository;
  late final SecureStorageService _storage;
  late final BiometricService _biometricService;

  @override
  AuthState build() {
    _repository = ref.watch(authRepositoryProvider);
    _storage = ref.watch(secureStorageServiceProvider);
    _biometricService = ref.watch(biometricServiceProvider);
    Future.microtask(() => _loadInitialSession());
    return const AuthState();
  }

  Future<void> _loadInitialSession() async {
    try {
      final rememberMe = await _storage.getRememberMe();
      final savedUsername = await _storage.getSavedUsername();
      final isBioEnabled = await _storage.getBiometricEnabled();
      final isBioAvail = await _biometricService.isBiometricAvailable();
      final currentUser = await _repository.getCurrentUser();

      state = state.copyWith(
        rememberMe: rememberMe,
        savedUsername: savedUsername,
        isBiometricEnabled: isBioEnabled,
        isBiometricAvailable: isBioAvail,
        user: currentUser,
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

      if (state.isBiometricEnabled) {
        await _storage.saveBiometricCredentials(
          username: username.trim(),
          password: password,
        );
      }

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
    try {
      final isAvail = await _biometricService.isBiometricAvailable();
      if (!isAvail) {
        state = state.copyWith(
          isLoading: false,
          errorMessage: 'Sensor biometrik tidak tersedia pada perangkat.',
        );
        return false;
      }

      final isBioEnabled = await _storage.getBiometricEnabled();
      final savedCreds = await _storage.getBiometricCredentials();

      if (!isBioEnabled || savedCreds == null || savedCreds['username'] == null || savedCreds['password'] == null) {
        state = state.copyWith(
          isLoading: false,
          errorMessage: 'Login biometrik belum diaktifkan. Silakan login dengan password terlebih dahulu.',
        );
        return false;
      }

      final authenticated = await _biometricService.authenticate(
        localizedReason: 'Pindai sidik jari atau wajah untuk masuk ke HYDRO-MON',
      );

      if (!authenticated) {
        state = state.copyWith(
          isLoading: false,
          errorMessage: 'Autentikasi biometrik dibatalkan.',
        );
        return false;
      }

      final user = await _repository.login(
        username: savedCreds['username']!,
        password: savedCreds['password']!,
        rememberMe: true,
      );
      state = state.copyWith(isLoading: false, user: user);
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

  Future<bool> setupBiometricAfterLogin({
    required String username,
    required String password,
  }) async {
    try {
      final isAvail = await _biometricService.isBiometricAvailable();
      if (!isAvail) return false;

      final authenticated = await _biometricService.authenticate(
        localizedReason: 'Pindai sidik jari Anda untuk mengaktifkan login biometrik di perangkat ini',
      );

      if (!authenticated) return false;

      await _storage.setBiometricEnabled(true);
      await _storage.saveBiometricCredentials(
        username: username.trim(),
        password: password,
      );
      state = state.copyWith(isBiometricEnabled: true);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> refreshProfile() async {
    try {
      final user = await _repository.getCurrentUser();
      if (user != null) {
        state = state.copyWith(user: user);
      }
    } catch (_) {}
  }

  Future<bool> toggleBiometric(bool enabled) async {
    if (enabled) {
      final isAvail = await _biometricService.isBiometricAvailable();
      if (!isAvail) {
        state = state.copyWith(
          errorMessage: 'Sensor sidik jari / biometrik tidak tersedia pada perangkat ini.',
        );
        return false;
      }

      final authenticated = await _biometricService.authenticate(
        localizedReason: 'Verifikasi sidik jari Anda untuk mengaktifkan login biometrik',
      );

      if (!authenticated) {
        return false;
      }

      await _storage.setBiometricEnabled(true);
      state = state.copyWith(isBiometricEnabled: true);
      return true;
    } else {
      await _storage.setBiometricEnabled(false);
      await _storage.clearBiometricCredentials();
      state = state.copyWith(isBiometricEnabled: false);
      return true;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    await _repository.logout();
    state = const AuthState();
    _loadInitialSession();
  }
}
