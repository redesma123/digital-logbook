import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/menu_hub_bottom_sheet.dart';
import '../../home/presentation/widgets/home_bottom_nav.dart';

class OtherMenuScreen extends StatelessWidget {
  const OtherMenuScreen({super.key});

  void _onBottomNavTap(BuildContext context, int index) {
    if (index == 0) {
      context.go('/home');
    } else if (index == 1) {
      MenuHubBottomSheet.show(context);
    } else if (index == 2) {
      context.go('/profile');
    }
  }

  void _showSopDialog(BuildContext context, String title, List<String> steps) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(ctx).size.height * 0.75,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.neutral900,
              ),
            ),
            const SizedBox(height: 12),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
            const SizedBox(height: 12),
            Flexible(
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: steps.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (c, i) => Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: const BoxDecoration(
                        color: Color(0xFFDBEAFE),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '${i + 1}',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        steps[i],
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: const Color(0xFF334155),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(ctx),
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: Text('Tutup', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
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
          backgroundColor: const Color(0xFF0F265C),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.go('/home'),
          ),
        title: Text(
          'Menu & Utilitas Lainnya',
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section 1: SOP Operasional
            _buildSectionHeader('Standar Operasional Prosedur (SOP)'),
            _buildMenuCard(
              children: [
                _buildActionTile(
                  icon: Icons.play_circle_outline_rounded,
                  iconColor: const Color(0xFF16A34A),
                  title: 'SOP 01: Start Unit & Sinkronisasi',
                  subtitle: 'Tahapan aman memutar turbin dan paralel ke grid PLN',
                  onTap: () => _showSopDialog(
                    context,
                    'SOP 01: Start Unit & Sinkronisasi',
                    [
                      'Periksa level air forebay dan pastikan trash rack bersih.',
                      'Buka bypass valve penstock dan tunggu tekanan seimbang.',
                      'Buka inlet gate utama secara perlahan hingga putaran turbin mencapai 100% nominal (synchronous speed).',
                      'Aktifkan sistem eksitasi dan sinkronoskop otomatis pada panel generator.',
                      'Tutup PMT (Circuit Breaker) saat sudut fasa dan tegangan match (400 V, 50.0 Hz).',
                      'Naikkan beban aktif perlahan hingga 450 kW sesuai debit air yang tersedia.',
                    ],
                  ),
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildActionTile(
                  icon: Icons.stop_circle_outlined,
                  iconColor: const Color(0xFFD97706),
                  title: 'SOP 02: Normal Shutdown',
                  subtitle: 'Pelepasan beban bertahap dan penghentian unit terencana',
                  onTap: () => _showSopDialog(
                    context,
                    'SOP 02: Normal Shutdown',
                    [
                      'Koordinasikan dengan dispatcher PLN mengenai rencana pelepasan beban.',
                      'Turunkan beban generator bertahap (50 kW/menit) hingga mencapai batas minimal.',
                      'Buka PMT Generator saat daya mendekati nol.',
                      'Tutup guide vane / wicket gates turbin secara perlahan.',
                      'Matikan eksitasi generator dan pastikan rotor berhenti berputar.',
                      'Kunci pintu air penstock dan catat Hour Meter akhir pada logbook.',
                    ],
                  ),
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildActionTile(
                  icon: Icons.warning_amber_rounded,
                  iconColor: const Color(0xFFEF4444),
                  title: 'SOP 03: Emergency Shutdown (ESD)',
                  subtitle: 'Tindakan darurat saat terjadi trip proteksi atau bahaya fisik',
                  onTap: () => _showSopDialog(
                    context,
                    'SOP 03: Emergency Shutdown (ESD)',
                    [
                      'Tekan tombol Emergency Stop (ESD) pada panel kontrol atau pintu powerhouse.',
                      'Pastikan PMT trip seketika dan deflector menutup runner turbin.',
                      'Periksa relay proteksi (Over Current 51, Under Frequency 81, Over Temp 49).',
                      'Lakukan inspeksi visual segera pada belitan generator dan bantalan turbin.',
                      'Buat laporan gangguan resmi di menu Daftar Gangguan sebelum reset proteksi.',
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Section 2: Kontak Darurat & PIC
            _buildSectionHeader('Kontak Darurat & PIC Lapangan'),
            _buildMenuCard(
              children: [
                _buildContactTile(
                  role: 'Manager Unit PLTMh',
                  name: 'Ir. Bambang S.',
                  phone: '0812-3456-7890',
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildContactTile(
                  role: 'Supervisor Operasi & Shift',
                  name: 'Hendra Wijaya',
                  phone: '0813-9876-5432',
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildContactTile(
                  role: 'Tim Reaksi Cepat Pemeliharaan',
                  name: 'Piket Teknisi Sampean Baru',
                  phone: '0811-2233-4455',
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildContactTile(
                  role: 'Dispatcher PLN UP2B Jawa Timur',
                  name: 'Pengatur Beban Grid 20 kV',
                  phone: '031-8987654',
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Section 3: Data Teknis Unit
            _buildSectionHeader('Spesifikasi Teknis Unit Pembangkit'),
            _buildMenuCard(
              children: [
                _buildSpecRow('Nama Pembangkit', 'PLTMh Sampean Baru'),
                _buildSpecRow('Kapasitas Terpasang', '1 x 450 kW (0.45 MW)'),
                _buildSpecRow('Tipe Turbin', 'Kaplan Horizontal Open Pit'),
                _buildSpecRow('Tinggi Jatuh Efektif (Head)', '5.20 Meter'),
                _buildSpecRow('Debit Desain Penuh', '10.50 m³/s'),
                _buildSpecRow('Tegangan / Frekuensi', '400 Volt / 50 Hz'),
                _buildSpecRow('Transformator Step-Up', '400 V / 20 kV (630 kVA)', isLast: true),
              ],
            ),
            const SizedBox(height: 20),

            // Section 4: Info Sistem
            _buildSectionHeader('Informasi Sistem'),
            _buildMenuCard(
              children: [
                _buildSpecRow('Aplikasi', 'HYDRO-MON Mobile'),
                _buildSpecRow('Versi', 'v1.0.0 (Build 2026.10)'),
                _buildSpecRow('Koneksi Database', 'Tersambung (Local PLTMh)', isLast: true),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: 1, // Menu tab active
        onTap: (idx) => _onBottomNavTap(context, idx),
      ),
    ),
  );
}

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: AppColors.neutral900,
        ),
      ),
    );
  }

  Widget _buildMenuCard({required List<Widget> children}) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Icon(icon, color: iconColor, size: 22),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.neutral900,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w400,
                      color: const Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.neutral400, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildContactTile({
    required String role,
    required String name,
    required String phone,
  }) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  role,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF64748B),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  name,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.neutral900,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFDBEAFE),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.phone_rounded, color: AppColors.primary, size: 14),
                const SizedBox(width: 4),
                Text(
                  phone,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecRow(String label, String value, {bool isLast = false}) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 14, vertical: isLast ? 12 : 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF64748B),
            ),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.neutral900,
            ),
          ),
        ],
      ),
    );
  }
}
