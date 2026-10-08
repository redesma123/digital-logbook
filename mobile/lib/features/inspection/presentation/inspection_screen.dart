import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_url_helper.dart';
import '../../../core/widgets/menu_hub_bottom_sheet.dart';
import '../../../core/widgets/photo_attachment_section.dart';
import '../../home/presentation/widgets/home_bottom_nav.dart';
import '../domain/inspection_model.dart';
import 'controllers/inspection_controller.dart';

class InspectionScreen extends ConsumerStatefulWidget {
  const InspectionScreen({super.key});

  @override
  ConsumerState<InspectionScreen> createState() => _InspectionScreenState();
}

class _InspectionScreenState extends ConsumerState<InspectionScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _onBottomNavTap(int index) {
    if (index == 0) {
      context.go('/home');
    } else if (index == 1) {
      MenuHubBottomSheet.show(context);
    } else if (index == 2) {
      context.go('/profile');
    }
  }

  void _showFullImage(BuildContext context, String photoPath) {
    showDialog(
      context: context,
      barrierColor: Colors.black87,
      builder: (ctx) {
        final file = File(photoPath);
        final isLocalFile = file.existsSync();
        final isAsset = photoPath.startsWith('assets/');
        final resolvedUrl = isLocalFile ? '' : ApiUrlHelper.resolvePhotoUrl(photoPath);
        final isNetwork = !isLocalFile &&
            !isAsset &&
            (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://'));

        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: Stack(
            alignment: Alignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: InteractiveViewer(
                  maxScale: 4.0,
                  child: isLocalFile
                      ? Image.file(file, fit: BoxFit.contain)
                      : isAsset
                          ? Image.asset(photoPath, fit: BoxFit.contain)
                          : isNetwork
                              ? Image.network(
                                  resolvedUrl,
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    color: const Color(0xFF1E293B),
                                    padding: const EdgeInsets.all(40),
                                    child: const Icon(Icons.broken_image,
                                        color: Colors.white54, size: 48),
                                  ),
                                )
                              : Image.file(file, fit: BoxFit.contain),
                ),
              ),
              Positioned(
                top: 10,
                right: 10,
                child: GestureDetector(
                  onTap: () => Navigator.pop(ctx),
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Colors.black54,
                      shape: BoxShape.circle,
                    ),
                    padding: const EdgeInsets.all(8),
                    child: const Icon(Icons.close, color: Colors.white, size: 20),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _handleSave() async {
    final success = await ref
        .read(inspectionControllerProvider.notifier)
        .saveCurrentInspection(notes: _notesController.text);

    if (mounted) {
      if (success) {
        _notesController.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Hasil checklist inspeksi berhasil disimpan ke riwayat!'),
            backgroundColor: Color(0xFF16A34A),
            behavior: SnackBarBehavior.floating,
          ),
        );
        _tabController.animateTo(1); // Auto switch to History tab
      } else {
        final err = ref.read(inspectionControllerProvider).errorMessage ??
            'Gagal menyimpan checklist inspeksi.';
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

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(inspectionControllerProvider);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/home');
          }
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: const Color(0xFF0F265C),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/home');
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
          bottom: TabBar(
            controller: _tabController,
            indicatorColor: Colors.white,
            indicatorWeight: 3,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            labelStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700),
            unselectedLabelStyle:
                GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500),
            tabs: [
              const Tab(
                icon: Icon(Icons.checklist_rounded, size: 20),
                text: 'Formulir Inspeksi',
              ),
              Tab(
                icon: const Icon(Icons.history_rounded, size: 20),
                text: 'Riwayat (${state.records.length})',
              ),
            ],
          ),
        ),
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildChecklistFormTab(state),
            _buildHistoryTab(state),
          ],
        ),
        bottomNavigationBar: HomeBottomNav(
          currentIndex: 1, // Menu tab active
          onTap: _onBottomNavTap,
        ),
      ),
    );
  }

  // ==========================================
  // TAB 1: FORMULIR INSPEKSI CHECKLIST
  // ==========================================
  Widget _buildChecklistFormTab(InspectionState state) {
    final normalCount = state.currentItems.where((i) => i.status == 'normal').length;
    final warningCount = state.currentItems.where((i) => i.status == 'warning').length;
    final dangerCount = state.currentItems.where((i) => i.status == 'danger').length;
    final categories = state.currentItems.map((e) => e.category).toSet().toList();

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Unit Selector & Info
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Unit & Area Inspeksi',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE0F2FE),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'PLTMh Sampean Baru',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF0369A1),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Shift Pagi',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFFD97706),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: state.currentUnit,
                      icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF64748B)),
                      items: const [
                        DropdownMenuItem(
                          value: 'Unit 1 & Saluran Air',
                          child: Text('Unit 1 (485 kW) & Saluran Air'),
                        ),
                        DropdownMenuItem(
                          value: 'Unit 2 & Saluran Air',
                          child: Text('Unit 2 (485 kW) & Saluran Air'),
                        ),
                        DropdownMenuItem(
                          value: 'Intake, Forebay & Spillway',
                          child: Text('Area Sipil (Intake, Forebay & Spillway)'),
                        ),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          ref.read(inspectionControllerProvider.notifier).setUnit(val);
                        }
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // 2. Summary Status Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildSummaryPill('Normal', normalCount, const Color(0xFF16A34A),
                    const Color(0xFFDCFCE7)),
                _buildSummaryPill('Perhatian', warningCount, const Color(0xFFD97706),
                    const Color(0xFFFEF3C7)),
                _buildSummaryPill('Bahaya', dangerCount, const Color(0xFFDC2626),
                    const Color(0xFFFEE2E2)),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // 3. Checklist Items per Category
          ...categories.map((category) {
            final catItems =
                state.currentItems.where((i) => i.category == category).toList();

            return Container(
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: const BoxDecoration(
                      color: Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(11)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.settings_suggest_rounded,
                            size: 18, color: Color(0xFF0F265C)),
                        const SizedBox(width: 8),
                        Text(
                          category,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF0F265C),
                          ),
                        ),
                      ],
                    ),
                  ),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: catItems.length,
                    separatorBuilder: (context, index) =>
                        const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    itemBuilder: (context, idx) {
                      return _buildChecklistItem(catItems[idx]);
                    },
                  ),
                ],
              ),
            );
          }),

          // 4. Catatan Observasi
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Catatan Observasi Lapangan',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF334155),
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _notesController,
                  maxLines: 3,
                  style: GoogleFonts.inter(fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Tuliskan catatan khusus atau temuan penting...',
                    hintStyle: GoogleFonts.inter(
                        fontSize: 12, color: const Color(0xFF94A3B8)),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 5. Foto Dokumentasi Observasi Temuan
          PhotoAttachmentSection(
            label: 'Foto Dokumentasi Temuan',
            photos: state.currentPhotos,
            onPhotoAdded: (path) {
              ref.read(inspectionControllerProvider.notifier).addPhoto(path);
            },
            onPhotoRemoved: (path) {
              ref.read(inspectionControllerProvider.notifier).removePhoto(path);
            },
          ),
          const SizedBox(height: 24),

          // 6. Save Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: state.isSaving ? null : _handleSave,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              icon: state.isSaving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2),
                    )
                  : const Icon(Icons.check_circle_outline,
                      color: Colors.white, size: 20),
              label: Text(
                state.isSaving ? 'Menyimpan...' : 'Simpan Hasil Inspeksi',
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
    );
  }

  // ==========================================
  // TAB 2: RIWAYAT INSPEKSI (HISTORY)
  // ==========================================
  Widget _buildHistoryTab(InspectionState state) {
    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    if (state.records.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(32),
                ),
                child: const Icon(Icons.history_toggle_off_rounded,
                    size: 32, color: Color(0xFF94A3B8)),
              ),
              const SizedBox(height: 16),
              Text(
                'Belum Ada Riwayat Inspeksi',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Lakukan checklist pemeriksaan di tab Formulir Inspeksi untuk mencatat riwayat observasi unit.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF64748B)),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () => _tabController.animateTo(0),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                icon: const Icon(Icons.add, color: Colors.white, size: 18),
                label: const Text('Mulai Checklist', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () =>
          ref.read(inspectionControllerProvider.notifier).loadHistory(),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics()),
        itemCount: state.records.length,
        separatorBuilder: (context, index) => const SizedBox(height: 14),
        itemBuilder: (context, index) {
          final record = state.records[index];
          return _buildHistoryCard(record);
        },
      ),
    );
  }

  Widget _buildHistoryCard(InspectionRecordModel record) {
    Color statusBg;
    Color statusTextColor;
    if (record.overallStatus == 'NORMAL') {
      statusBg = const Color(0xFFDCFCE7);
      statusTextColor = const Color(0xFF16A34A);
    } else if (record.overallStatus == 'WASPADA') {
      statusBg = const Color(0xFFFEF3C7);
      statusTextColor = const Color(0xFFD97706);
    } else {
      statusBg = const Color(0xFFFEE2E2);
      statusTextColor = const Color(0xFFDC2626);
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Header Waktu & Badge Status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.access_time_rounded,
                        size: 16, color: Color(0xFF64748B)),
                    const SizedBox(width: 6),
                    Text(
                      record.formattedDateTime,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    record.overallStatus,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: statusTextColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // 2. Unit & Pemeriksa
            Row(
              children: [
                const Icon(Icons.bolt_rounded, size: 16, color: Color(0xFF0284C7)),
                const SizedBox(width: 4),
                Text(
                  record.unitName,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF334155),
                  ),
                ),
                const Spacer(),
                const Icon(Icons.person_outline, size: 14, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Text(
                  record.inspectorName,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(0xFF64748B),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // 3. Status Breakdown Chips
            Row(
              children: [
                _buildSummaryPill('Normal', record.normalCount,
                    const Color(0xFF16A34A), const Color(0xFFF0FDF4)),
                const SizedBox(width: 8),
                _buildSummaryPill('Waspada', record.warningCount,
                    const Color(0xFFD97706), const Color(0xFFFFFBEB)),
                const SizedBox(width: 8),
                _buildSummaryPill('Bahaya', record.dangerCount,
                    const Color(0xFFDC2626), const Color(0xFFFEF2F2)),
              ],
            ),

            // 4. Catatan Observasi
            if (record.notes.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Text(
                  record.notes,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(0xFF475569),
                    height: 1.4,
                  ),
                ),
              ),
            ],

            // 5. Galeri Foto Lampiran Temuan
            if (record.photos.isNotEmpty) ...[
              const SizedBox(height: 14),
              Row(
                children: [
                  const Icon(Icons.photo_library_outlined,
                      size: 14, color: Color(0xFF0284C7)),
                  const SizedBox(width: 6),
                  Text(
                    '${record.photos.length} Foto Dokumentasi Temuan (Ketuk untuk memperbesar)',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF0284C7),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 80,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  itemCount: record.photos.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 8),
                  itemBuilder: (context, idx) {
                    final photoPath = record.photos[idx];
                    final file = File(photoPath);
                    final isLocal = file.existsSync();
                    final resolvedUrl = isLocal
                        ? ''
                        : ApiUrlHelper.resolvePhotoUrl(photoPath);
                    final isNet = !isLocal &&
                        (resolvedUrl.startsWith('http://') ||
                            resolvedUrl.startsWith('https://'));

                    return GestureDetector(
                      onTap: () => _showFullImage(context, photoPath),
                      child: Container(
                        width: 80,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFCBD5E1)),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: isLocal
                            ? Image.file(file, fit: BoxFit.cover)
                            : isNet
                                ? Image.network(
                                    resolvedUrl,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) => const Center(
                                      child: Icon(Icons.broken_image,
                                          color: Colors.white54, size: 24),
                                    ),
                                  )
                                : const Center(
                                    child: Icon(Icons.image,
                                        color: Colors.white54, size: 24),
                                  ),
                      ),
                    );
                  },
                ),
              ),
            ],
            const SizedBox(height: 12),

            // 6. Tombol Rincian Checklist Detail
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _showRecordDetailModal(record),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFFCBD5E1)),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                ),
                icon: const Icon(Icons.view_list_rounded,
                    size: 16, color: Color(0xFF0F265C)),
                label: Text(
                  'Lihat Rincian ${record.items.length} Item Diperiksa',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF0F265C),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showRecordDetailModal(InspectionRecordModel record) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(ctx).size.height * 0.85,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Rincian Checklist Inspeksi',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF0F265C),
                        ),
                      ),
                      Text(
                        '${record.formattedDateTime} | ${record.inspectorName}',
                        style: GoogleFonts.inter(
                            fontSize: 11, color: const Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: record.items.length,
                separatorBuilder: (context, index) => const SizedBox(height: 10),
                itemBuilder: (context, idx) {
                  final it = record.items[idx];
                  Color itColor;
                  String itLabel;
                  if (it.status == 'normal') {
                    itColor = const Color(0xFF16A34A);
                    itLabel = 'Normal';
                  } else if (it.status == 'warning') {
                    itColor = const Color(0xFFD97706);
                    itLabel = 'Waspada';
                  } else {
                    itColor = const Color(0xFFDC2626);
                    itLabel = 'Bahaya';
                  }

                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                it.category.toUpperCase(),
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF0284C7),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                it.title,
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF1E293B),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                it.description,
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  color: const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: itColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: itColor.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            itLabel,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: itColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // HELPER WIDGETS
  // ==========================================
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

  Widget _buildChecklistItem(InspectionItemModel item) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            item.title,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.neutral900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            item.description,
            style: GoogleFonts.inter(
              fontSize: 11,
              color: AppColors.neutral500,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildStatusButton(
                item,
                'normal',
                'Normal',
                const Color(0xFF16A34A),
                const Color(0xFFDCFCE7),
              ),
              const SizedBox(width: 8),
              _buildStatusButton(
                item,
                'warning',
                'Perhatian',
                const Color(0xFFD97706),
                const Color(0xFFFEF3C7),
              ),
              const SizedBox(width: 8),
              _buildStatusButton(
                item,
                'danger',
                'Bahaya',
                const Color(0xFFDC2626),
                const Color(0xFFFEE2E2),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusButton(
    InspectionItemModel item,
    String statusKey,
    String label,
    Color activeColor,
    Color activeBg,
  ) {
    final isSelected = item.status == statusKey;

    return Expanded(
      child: GestureDetector(
        onTap: () {
          ref
              .read(inspectionControllerProvider.notifier)
              .updateItemStatus(item.id, statusKey);
        },
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
