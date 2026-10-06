import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/menu_hub_bottom_sheet.dart';
import '../../auth/presentation/controllers/auth_controller.dart';
import '../../home/presentation/widgets/home_bottom_nav.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isSyncing = false;
  bool _pushNotificationEnabled = true;

  Future<void> _handleSync() async {
    setState(() => _isSyncing = true);
    await Future.delayed(const Duration(milliseconds: 800));
    if (mounted) {
      setState(() => _isSyncing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Sinkronisasi data logbook & monitoring berhasil!',
            style: GoogleFonts.inter(fontWeight: FontWeight.w600),
          ),
          backgroundColor: const Color(0xFF10B981),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _showChangePasswordDialog() {
    final oldPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          title: Text(
            'Ubah Password',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: oldPasswordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Password Lama',
                  labelStyle: GoogleFonts.inter(fontSize: 13),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: newPasswordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Password Baru',
                  labelStyle: GoogleFonts.inter(fontSize: 13),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(
                'Batal',
                style: GoogleFonts.inter(color: AppColors.neutral500),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Password berhasil diperbarui',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                    ),
                    backgroundColor: const Color(0xFF10B981),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text('Simpan', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
            ),
          ],
        );
      },
    );
  }

  void _showNotificationSettings() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Pengaturan Notifikasi',
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    title: Text(
                      'Notifikasi Gangguan Operasional',
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500),
                    ),
                    subtitle: Text(
                      'Terima peringatan saat terjadi unit trip atau anomali',
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.neutral500),
                    ),
                    value: _pushNotificationEnabled,
                    onChanged: (val) {
                      setModalState(() => _pushNotificationEnabled = val);
                      setState(() => _pushNotificationEnabled = val);
                    },
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0284C7),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text('Tutup', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showAboutDialog() {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          title: Text(
            'Tentang Aplikasi',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'HYDRO-MON',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF0284C7),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Versi 1.0.0 (Build 2025.04)',
                style: GoogleFonts.inter(fontSize: 13, color: AppColors.neutral500),
              ),
              const SizedBox(height: 12),
              Text(
                'Sistem Pencatatan Logbook Digital dan Monitoring Operasional PLTMh Sampean Baru secara real-time dan terintegrasi.',
                style: GoogleFonts.inter(fontSize: 13, color: AppColors.neutral700, height: 1.4),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(
                'Tutup',
                style: GoogleFonts.inter(color: const Color(0xFF0284C7), fontWeight: FontWeight.w600),
              ),
            ),
          ],
        );
      },
    );
  }

  void _showHelpDialog() {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          title: Text(
            'Bantuan Operasional',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Kontak Dukungan Teknis:',
                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Text('• Tim IT Pusat: it-support@hydromon.id', style: GoogleFonts.inter(fontSize: 13)),
              Text('• Supervisor Operasi: 0812-3456-7890', style: GoogleFonts.inter(fontSize: 13)),
              const SizedBox(height: 12),
              Text(
                'Manual book dan panduan SOP dapat diakses pada menu dokumentasi web.',
                style: GoogleFonts.inter(fontSize: 12, color: AppColors.neutral500),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(
                'Mengerti',
                style: GoogleFonts.inter(color: const Color(0xFF0284C7), fontWeight: FontWeight.w600),
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _handleBiometricToggle(bool enable) async {
    final success = await ref.read(authControllerProvider.notifier).toggleBiometric(enable);
    if (!success && mounted) {
      final err = ref.read(authControllerProvider).errorMessage;
      if (err != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(err),
            backgroundColor: AppColors.statusTrip,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          title: Text(
            'Konfirmasi Keluar',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          content: Text(
            'Apakah Anda yakin ingin keluar dari aplikasi HYDRO-MON?',
            style: GoogleFonts.inter(fontSize: 14, color: AppColors.neutral700),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text(
                'Batal',
                style: GoogleFonts.inter(color: AppColors.neutral500),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text('Keluar', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
            ),
          ],
        );
      },
    );

    if (confirm == true && mounted) {
      await ref.read(authControllerProvider.notifier).logout();
      if (mounted) {
        context.go('/login');
      }
    }
  }

  void _onBottomNavTap(int index) {
    if (index == 0) {
      context.go('/home');
    } else if (index == 1) {
      MenuHubBottomSheet.show(context);
    } else if (index == 2) {
      // Current Screen: Profil
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final user = authState.user;
    final userName = user?.fullName.isNotEmpty == true ? user!.fullName : 'Andi Pratama';
    final userRole = user?.role.isNotEmpty == true ? user!.role : 'Operator';

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          context.go('/home');
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.surfacePage,
        appBar: AppBar(
          backgroundColor: const Color(0xFF0284C7),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/home'),
          ),
        title: Text(
          'Profil & Pengaturan',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        centerTitle: false,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        child: Column(
          children: [
            // 1. User Profile Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.neutral200),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x05000000),
                    blurRadius: 6,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: const Color(0xFF0284C7),
                    child: const Icon(
                      Icons.person,
                      size: 32,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          userName,
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.neutral900,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          userRole,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: AppColors.neutral500,
                          ),
                        ),
                        Text(
                          'PLTMh Sampean Baru',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                            color: AppColors.neutral500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.neutral400,
                    size: 24,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 2. Settings Menu List Card
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.neutral200),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x05000000),
                    blurRadius: 6,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.lock_outline_rounded,
                    title: 'Ubah Password',
                    onTap: _showChangePasswordDialog,
                  ),
                  _buildMenuDivider(),
                  _buildMenuItem(
                    icon: Icons.fingerprint_rounded,
                    title: 'Login Biometrik / Sidik Jari',
                    subtitle: authState.isBiometricEnabled ? 'Aktif (Sentuh untuk ubah)' : 'Nonaktif',
                    trailing: Switch(
                      value: authState.isBiometricEnabled,
                      activeThumbColor: const Color(0xFF0284C7),
                      onChanged: _handleBiometricToggle,
                    ),
                    onTap: () => _handleBiometricToggle(!authState.isBiometricEnabled),
                  ),
                  _buildMenuDivider(),
                  _buildMenuItem(
                    icon: Icons.notifications_none_rounded,
                    title: 'Pengaturan Notifikasi',
                    onTap: _showNotificationSettings,
                  ),
                  _buildMenuDivider(),
                  _buildMenuItem(
                    icon: Icons.sync_rounded,
                    title: 'Sinkronisasi Data',
                    trailing: _isSyncing
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0284C7)),
                          )
                        : null,
                    onTap: _isSyncing ? null : _handleSync,
                  ),
                  _buildMenuDivider(),
                  _buildMenuItem(
                    icon: Icons.info_outline_rounded,
                    title: 'Tentang Aplikasi',
                    subtitle: 'HYDRO-MON v1.0.0',
                    onTap: _showAboutDialog,
                  ),
                  _buildMenuDivider(),
                  _buildMenuItem(
                    icon: Icons.help_outline_rounded,
                    title: 'Bantuan',
                    onTap: _showHelpDialog,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // 3. Tombol Keluar (Logout)
            InkWell(
              onTap: _handleLogout,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: Center(
                  child: Text(
                    'Keluar',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFFEF4444),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: 2, // Profil is active
        onTap: _onBottomNavTap,
      ),
    ),
  );
}

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 22, color: AppColors.neutral700),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.neutral900,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.neutral500,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            trailing ??
                const Icon(
                  Icons.chevron_right_rounded,
                  size: 20,
                  color: AppColors.neutral400,
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuDivider() {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Divider(height: 1, color: AppColors.neutral200),
    );
  }
}
