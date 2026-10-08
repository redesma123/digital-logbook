import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_assets.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_url_helper.dart';
import 'controllers/auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = ref.read(authControllerProvider);
      if (authState.savedUsername != null && authState.savedUsername!.isNotEmpty) {
        _usernameController.text = authState.savedUsername!;
      }
    });
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final username = _usernameController.text.trim();
    final password = _passwordController.text;

    final controller = ref.read(authControllerProvider.notifier);
    final success = await controller.login(
      username,
      password,
    );

    if (success && mounted) {
      final authState = ref.read(authControllerProvider);
      if (authState.isBiometricAvailable && !authState.isBiometricEnabled) {
        await _promptEnableBiometric(username, password);
      }
      if (mounted) {
        context.go('/home');
      }
    } else if (mounted) {
      final error = ref.read(authControllerProvider).errorMessage;
      if (error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: AppColors.statusTrip,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _promptEnableBiometric(String username, String password) async {
    final shouldEnable = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        actionsPadding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primaryBackground,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Image.asset(
                AppAssets.icFingerprint,
                width: 26,
                height: 26,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Aktifkan Sidik Jari?',
                style: GoogleFonts.inter(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryNavy,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          'Ingin mengaktifkan login biometrik untuk akun $username? Anda dapat masuk lebih cepat di sesi berikutnya tanpa mengetik password.',
          style: GoogleFonts.inter(
            fontSize: 13,
            height: 1.5,
            color: const Color(0xFF64748B),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(
              'Nanti Saja',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF64748B),
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            child: Text(
              'Aktifkan Sekarang',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );

    if (shouldEnable == true && mounted) {
      final controller = ref.read(authControllerProvider.notifier);
      final activated = await controller.setupBiometricAfterLogin(
        username: username,
        password: password,
      );
      if (activated && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Login sidik jari berhasil diaktifkan!'),
            backgroundColor: AppColors.statusRunning,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _handleBiometricLogin() async {
    final controller = ref.read(authControllerProvider.notifier);
    final success = await controller.loginWithBiometrics();

    if (success && mounted) {
      context.go('/home');
    } else if (mounted) {
      final error = ref.read(authControllerProvider).errorMessage;
      if (error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: AppColors.statusStandbyText,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }


  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      body: Stack(
        children: [
          // Background Image (Dam Silhouette & Sky Gradient)
          Positioned.fill(
            child: Image.asset(
              AppAssets.bgLogin,
              fit: BoxFit.cover,
              alignment: Alignment.topCenter,
            ),
          ),


          // Main Scrollable Content
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 20),

                      // Logo
                      Image.asset(
                        AppAssets.iconLogo,
                        width: 78,
                        height: 78,
                        fit: BoxFit.contain,
                      ),
                      const SizedBox(height: 12),

                      // Title & Subtitle
                      Text(
                        'HYDRO-MON',
                        style: GoogleFonts.inter(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'PLTMh Logbook & Monitoring',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Username Input Field
                      TextFormField(
                        controller: _usernameController,
                        textInputAction: TextInputAction.next,
                        decoration: InputDecoration(
                          hintText: 'Username',
                          filled: true,
                          fillColor: Colors.white,
                          prefixIcon: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            child: Image.asset(
                              AppAssets.icProfile,
                              width: 18,
                              height: 18,
                              color: AppColors.neutral500,
                            ),
                          ),
                          prefixIconConstraints: const BoxConstraints(
                            minWidth: 46,
                            minHeight: 20,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                          ),
                          contentPadding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Username wajib diisi';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Password Input Field
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => _handleLogin(),
                        decoration: InputDecoration(
                          hintText: 'Password',
                          filled: true,
                          fillColor: Colors.white,
                          prefixIcon: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            child: Image.asset(
                              AppAssets.icPassword,
                              width: 18,
                              height: 18,
                              color: AppColors.neutral500,
                            ),
                          ),
                          prefixIconConstraints: const BoxConstraints(
                            minWidth: 46,
                            minHeight: 20,
                          ),
                          suffixIcon: IconButton(
                            icon: Image.asset(
                              _obscurePassword ? AppAssets.icHidePassword : AppAssets.icShowPassword,
                              width: 20,
                              height: 20,
                              color: AppColors.neutral400,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                          ),
                          contentPadding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Password wajib diisi';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 8),

                      // Remember Me & Forgot Password Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              SizedBox(
                                width: 24,
                                height: 24,
                                child: Checkbox(
                                  value: authState.rememberMe,
                                  onChanged: (val) {
                                    ref.read(authControllerProvider.notifier).toggleRememberMe(val);
                                  },
                                  activeColor: AppColors.primary,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  side: const BorderSide(color: Color(0xFF94A3B8), width: 1.2),
                                ),
                              ),
                              const SizedBox(width: 8),
                              GestureDetector(
                                onTap: () {
                                  ref.read(authControllerProvider.notifier).toggleRememberMe(!authState.rememberMe);
                                },
                                child: Text(
                                  'Ingat saya',
                                  style: GoogleFonts.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w400,
                                    color: const Color(0xFF334155),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          TextButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Silakan hubungi Administrator untuk mereset password.'),
                                  behavior: SnackBarBehavior.floating,
                                ),
                              );
                            },
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.zero,
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: Text(
                              'Lupa password?',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Login Button
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: authState.isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            disabledBackgroundColor: AppColors.primaryLight.withValues(alpha: 0.6),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: authState.isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : Text(
                                  'Login',
                                  style: GoogleFonts.inter(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Divider "atau masuk dengan"
                      Row(
                        children: [
                          const Expanded(
                            child: Divider(
                              color: Color(0xFFCBD5E1),
                              thickness: 1,
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Text(
                              'atau masuk dengan',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w400,
                                color: const Color(0xFF64748B),
                              ),
                            ),
                          ),
                          const Expanded(
                            child: Divider(
                              color: Color(0xFFCBD5E1),
                              thickness: 1,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Biometric Login Button
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: OutlinedButton(
                          onPressed: authState.isLoading ? null : _handleBiometricLogin,
                          style: OutlinedButton.styleFrom(
                            backgroundColor: Colors.white.withValues(alpha: 0.85),
                            side: const BorderSide(color: Color(0xFFCBD5E1), width: 1.2),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.asset(
                                AppAssets.icFingerprint,
                                width: 22,
                                height: 22,
                                color: AppColors.primary,
                              ),
                              const SizedBox(width: 10),
                              Text(
                                'Login dengan Biometrik',
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primaryNavy,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 40),

                      // Footer Version
                      Text(
                        'Versi 1.0.0',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF94A3B8),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
