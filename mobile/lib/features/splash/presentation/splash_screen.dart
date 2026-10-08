import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_assets.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  Timer? _timer;
  late final AnimationController _animController;
  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutCubic,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animController,
        curve: Curves.easeOutCubic,
      ),
    );

    _animController.forward();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer(const Duration(milliseconds: 1300), () {
      _navigateToLogin();
    });
  }

  void _navigateToLogin() {
    if (mounted) {
      _timer?.cancel();
      context.go('/login');
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: _navigateToLogin,
        behavior: HitTestBehavior.opaque,
        child: Stack(
          children: [
            // Full Screen Background Photo
            Positioned.fill(
              child: Image.asset(
                AppAssets.bgSplash,
                fit: BoxFit.cover,
                alignment: Alignment.center,
              ),
            ),

            // Subtle Cinematic Vignette & Gradient Overlay
            Positioned.fill(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Color(0x55000000), // Soft top darkness
                      Color(0x77051329), // Deep blue-tinted middle
                      Color(0xBB000000), // Clean dark bottom
                    ],
                    stops: [0.0, 0.5, 1.0],
                  ),
                ),
              ),
            ),

            // Centered Branding Content with smooth entrance animation
            SafeArea(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Water Drop Turbine Logo with soft glow
                          Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF0284C7).withValues(alpha: 0.28),
                                  blurRadius: 36,
                                  spreadRadius: 8,
                                ),
                              ],
                            ),
                            child: Image.asset(
                              AppAssets.iconLogo,
                              width: 130,
                              height: 130,
                              fit: BoxFit.contain,
                            ),
                          ),
                          const SizedBox(height: 28),

                          // App Title - Clean, Modern & Elegant Typography
                          Text(
                            'HYDRO-MON',
                            style: GoogleFonts.inter(
                              fontSize: 28,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 2.2,
                              color: Colors.white,
                              shadows: const [
                                Shadow(
                                  color: Color(0x66000000),
                                  blurRadius: 16,
                                  offset: Offset(0, 2),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Subtitle 1 - Clean lighter weight
                          Text(
                            'Digital Logbook & Monitoring',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                              letterSpacing: 0.6,
                              color: const Color(0xFFE2E8F0),
                              shadows: const [
                                Shadow(
                                  color: Color(0x88000000),
                                  blurRadius: 10,
                                  offset: Offset(0, 1),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 4),

                          // Subtitle 2 - Plant Location
                          Text(
                            'PLTMH Sampean Baru',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w500,
                              letterSpacing: 0.6,
                              color: const Color(0xFF93C5FD), // Soft aesthetic blue accent
                              shadows: const [
                                Shadow(
                                  color: Color(0x88000000),
                                  blurRadius: 10,
                                  offset: Offset(0, 1),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
