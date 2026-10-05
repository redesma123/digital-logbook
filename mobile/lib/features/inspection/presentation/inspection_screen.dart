import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/menu_hub_bottom_sheet.dart';
import '../../home/presentation/widgets/home_bottom_nav.dart';

class InspectionItem {
  final String id;
  final String category;
  final String title;
  final String description;
  String status; // 'normal', 'warning', 'danger'

  InspectionItem({
    required this.id,
    required this.category,
    required this.title,
    required this.description,
    this.status = 'normal',
  });
}

class InspectionScreen extends StatefulWidget {
  const InspectionScreen({super.key});

  @override
  State<InspectionScreen> createState() => _InspectionScreenState();
}

class _InspectionScreenState extends State<InspectionScreen> {
  final TextEditingController _notesController = TextEditingController();
  bool _isSaving = false;

  late List<InspectionItem> _items;

  @override
  void initState() {
    super.initState();
    _items = [
      // Sektor 1: Turbin & Saluran Penstock
      InspectionItem(
        id: '1',
        category: 'Turbin & Penstock',
        title: 'Suara & Getaran Turbin',
        description: 'Bebas dari suara gesekan abnormal dan vibrasi di bawah 5.0 mm/s',
        status: 'normal',
      ),
      InspectionItem(
        id: '2',
        category: 'Turbin & Penstock',
        title: 'Suhu Bantalan (Bearing)',
        description: 'Temperatur guide & thrust bearing normal (< 65 °C)',
        status: 'normal',
      ),
      InspectionItem(
        id: '3',
        category: 'Turbin & Penstock',
        title: 'Kebocoran Shaft Seal',
        description: 'Tidak ada rembesan air berlebih pada packing shaft turbin',
        status: 'warning',
      ),
      InspectionItem(
        id: '4',
        category: 'Turbin & Penstock',
        title: 'Tekanan Manometer Penstock',
        description: 'Tekanan statis dan dinamis air sesuai head rencana (0.52 bar)',
        status: 'normal',
      ),

      // Sektor 2: Generator & Eksitasi
      InspectionItem(
        id: '5',
        category: 'Generator & Eksitasi',
        title: 'Suhu Belitan Stator Winding',
        description: 'Temperatur belitan generator berada pada range aman (< 80 °C)',
        status: 'normal',
      ),
      InspectionItem(
        id: '6',
        category: 'Generator & Eksitasi',
        title: 'Kondisi Slip Ring & Carbon Brush',
        description: 'Ketebalan sikat arang memenuhi syarat & tidak ada percikan api',
        status: 'normal',
      ),
      InspectionItem(
        id: '7',
        category: 'Generator & Eksitasi',
        title: 'Sirkulasi Udara Pendingin',
        description: 'Saluran inlet & exhaust udara generator bebas hambatan debu',
        status: 'normal',
      ),

      // Sektor 3: Intake & Forebay
      InspectionItem(
        id: '8',
        category: 'Intake & Forebay',
        title: 'Kebersihan Trash Rack Intake',
        description: 'Saringan air intake bebas dari sumbatan sampah ranting / sedimen',
        status: 'warning',
      ),
      InspectionItem(
        id: '9',
        category: 'Intake & Forebay',
        title: 'Pintu Air & Mekanisme Katup',
        description: 'Sluice gate & stop log dapat dioperasikan normal tanpa macet',
        status: 'normal',
      ),

      // Sektor 4: Panel Kontrol & Trafo
      InspectionItem(
        id: '10',
        category: 'Panel Kontrol & Trafo',
        title: 'Status Alarm Panel Kontrol PLC',
        description: 'Tidak ada indikator fault trip atau warning aktif pada panel',
        status: 'normal',
      ),
      InspectionItem(
        id: '11',
        category: 'Panel Kontrol & Trafo',
        title: 'Level Minyak & Suhu Trafo Step-Up',
        description: 'Indikator oil level oli trafo dalam batas normal dan suhu < 75 °C',
        status: 'normal',
      ),
    ];
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  void _onBottomNavTap(int index) {
    if (index == 0) {
      context.go('/home');
    } else if (index == 1) {
      MenuHubBottomSheet.show(context);
    } else if (index == 2) {
      context.push('/profile');
    }
  }

  Future<void> _handleSave() async {
    setState(() => _isSaving = true);
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Hasil checklist inspeksi berhasil disimpan!'),
          backgroundColor: Color(0xFF16A34A),
          behavior: SnackBarBehavior.floating,
        ),
      );
      if (Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      } else {
        try {
          context.go('/home');
        } catch (_) {}
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final normalCount = _items.where((i) => i.status == 'normal').length;
    final warningCount = _items.where((i) => i.status == 'warning').length;
    final dangerCount = _items.where((i) => i.status == 'danger').length;

    // Group items by category
    final categories = _items.map((e) => e.category).toSet().toList();

    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F265C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              try {
                context.go('/home');
              } catch (_) {}
            }
          },
        ),
        title: Text(
          'Checklist Inspeksi',
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
            // 1. Plant Info & Status Summary Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'PLTMh Sampean Baru',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.neutral900,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDBEAFE),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Shift Pagi',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Inspektor: Andi Pratama • 12 Parameter Terdaftar',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: const Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  const SizedBox(height: 12),

                  // Summary Badges Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildSummaryPill('Normal', normalCount, const Color(0xFF16A34A), const Color(0xFFDCFCE7)),
                      _buildSummaryPill('Perhatian', warningCount, const Color(0xFFD97706), const Color(0xFFFEF3C7)),
                      _buildSummaryPill('Bahaya', dangerCount, const Color(0xFFEF4444), const Color(0xFFFEE2E2)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // 2. Checklist Groups
            ...categories.map((cat) {
              final catItems = _items.where((i) => i.category == cat).toList();
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    cat,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.neutral900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: catItems.length,
                      separatorBuilder: (_, _) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      itemBuilder: (context, index) {
                        final item = catItems[index];
                        return _buildChecklistItem(item);
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              );
            }),

            // 3. Catatan Inspeksi
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Catatan Temuan Tambahan',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.neutral900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _notesController,
                    maxLines: 3,
                    style: GoogleFonts.inter(fontSize: 13, color: AppColors.neutral900),
                    decoration: InputDecoration(
                      hintText: 'Tuliskan catatan observasi abnormal jika ada...',
                      hintStyle: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      contentPadding: const EdgeInsets.all(12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 4. Save Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : _handleSave,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                icon: _isSaving
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
                label: Text(
                  _isSaving ? 'Menyimpan...' : 'Simpan Hasil Inspeksi',
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: 1, // Menu tab active
        onTap: _onBottomNavTap,
      ),
    );
  }

  Widget _buildSummaryPill(String label, int count, Color color, Color bg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 7,
            height: 7,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            '$label: $count',
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChecklistItem(InspectionItem item) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            item.title,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.neutral900,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            item.description,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 10),

          // Status Selector Buttons (Normal, Perhatian, Bahaya)
          Row(
            children: [
              _buildStatusChoice(item, 'normal', 'Normal', const Color(0xFF16A34A), const Color(0xFFDCFCE7)),
              const SizedBox(width: 8),
              _buildStatusChoice(item, 'warning', 'Perhatian', const Color(0xFFD97706), const Color(0xFFFEF3C7)),
              const SizedBox(width: 8),
              _buildStatusChoice(item, 'danger', 'Bahaya', const Color(0xFFEF4444), const Color(0xFFFEE2E2)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChoice(InspectionItem item, String statusKey, String label, Color activeColor, Color activeBg) {
    final isSelected = item.status == statusKey;

    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => item.status = statusKey),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: isSelected ? activeBg : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? activeColor : const Color(0xFFE2E8F0),
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? activeColor : const Color(0xFF64748B),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
