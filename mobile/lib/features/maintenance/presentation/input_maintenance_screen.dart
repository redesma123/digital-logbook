import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/photo_attachment_section.dart';
import '../../dashboard/data/dashboard_repository.dart';
import '../../dashboard/domain/dashboard_model.dart';
import '../domain/maintenance_model.dart';
import 'controllers/maintenance_controller.dart';

class InputMaintenanceScreen extends ConsumerStatefulWidget {
  const InputMaintenanceScreen({super.key});

  @override
  ConsumerState<InputMaintenanceScreen> createState() => _InputMaintenanceScreenState();
}

class _InputMaintenanceScreenState extends ConsumerState<InputMaintenanceScreen> {
  final _formKey = GlobalKey<FormState>();

  int _selectedUnitId = 1;
  List<UnitItemModel> _units = const [];

  DateTime _selectedDate = DateTime.now();
  String _selectedEquipment = 'Turbin';
  String _selectedJobType = 'Inspeksi Rutin';

  final _descriptionController = TextEditingController();
  final _technicianController = TextEditingController();

  final List<String> _attachedPhotos = [];
  bool _isSaving = false;

  final List<String> _equipmentList = [
    'Turbin',
    'Generator',
    'Intake',
    'Panel Kontrol',
    'Trafo Utama',
    'Sistem Eksitasi',
    'Sistem Pelumasan',
    'Bendung & Saluran Pembawa',
  ];

  final List<String> _jobTypes = [
    'Inspeksi Rutin',
    'Penggantian Filter Udara',
    'Pembersihan Trash Rack',
    'Pengecekan Panel',
    'Pelumasan Bearing',
    'Overhaul Parsial',
    'Uji Proteksi Relay',
    'Lainnya',
  ];

  @override
  void initState() {
    super.initState();
    Future.microtask(() => _loadUnits());
  }

  Future<void> _loadUnits() async {
    try {
      final units = await ref.read(dashboardRepositoryProvider).getUnits();
      if (mounted && units.isNotEmpty) {
        setState(() {
          _units = units;
          _selectedUnitId = units.first.id;
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _technicianController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              onSurface: AppColors.neutral900,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && mounted) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _saveRecord() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final isoDateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);

    final record = MaintenanceModel(
      id: 0,
      unitId: _selectedUnitId,
      date: isoDateStr,
      plannedDate: '${isoDateStr}T00:00:00.000Z',
      equipment: _selectedEquipment,
      jobType: _selectedJobType,
      description: _descriptionController.text.trim(),
      technician: _technicianController.text.trim(),
      status: 'PLAN',
      photos: _attachedPhotos,
    );

    final success = await ref.read(maintenanceControllerProvider.notifier).createRecord(record);

    if (mounted) {
      setState(() => _isSaving = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Rencana pemeliharaan $_selectedEquipment berhasil disimpan ke database.',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
        if (context.canPop()) {
          context.pop();
        } else {
          context.go('/maintenance');
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Gagal menyimpan data pemeliharaan ke server.',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final displayDateStr = DateFormat('dd MMM yyyy').format(_selectedDate);

    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F265C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/maintenance');
            }
          },
        ),
        title: Text(
          'Input Maintenance',
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
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Unit Pembangkit Dropdown
              Text(
                'Unit Pembangkit',
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutral700),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: _selectedUnitId,
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.neutral500),
                    items: _units.isNotEmpty
                        ? _units.map((u) {
                            return DropdownMenuItem<int>(
                              value: u.id,
                              child: Text(
                                '${u.name} (${u.unitCode})',
                                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.neutral900),
                              ),
                            );
                          }).toList()
                        : [
                            DropdownMenuItem<int>(
                              value: 1,
                              child: Text('Unit 1 (PLTMH)', style: GoogleFonts.inter(fontSize: 14, color: AppColors.neutral900)),
                            ),
                          ],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedUnitId = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Tanggal Rencana
              Text(
                'Tanggal Rencana Pemeliharaan',
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutral700),
              ),
              const SizedBox(height: 6),
              InkWell(
                onTap: _pickDate,
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        displayDateStr,
                        style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.neutral900),
                      ),
                      const Icon(Icons.calendar_today_rounded, size: 18, color: AppColors.primary),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Peralatan
              Text(
                'Peralatan yang Dipelihara',
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutral700),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedEquipment,
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.neutral500),
                    items: _equipmentList.map((eq) {
                      return DropdownMenuItem<String>(
                        value: eq,
                        child: Text(
                          eq,
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.neutral900),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedEquipment = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Jenis Pekerjaan
              Text(
                'Jenis Pekerjaan',
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutral700),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedJobType,
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.neutral500),
                    items: _jobTypes.map((jt) {
                      return DropdownMenuItem<String>(
                        value: jt,
                        child: Text(
                          jt,
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.neutral900),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedJobType = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Teknisi Pelaksana
              Text(
                'Teknisi / Tim Pelaksana',
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutral700),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _technicianController,
                decoration: InputDecoration(
                  hintText: 'Contoh: Tim Mekanikal / Budi',
                  hintStyle: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF94A3B8)),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
              const SizedBox(height: 16),

              // Deskripsi Pekerjaan
              Text(
                'Deskripsi Pekerjaan *',
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutral700),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                validator: (val) => (val == null || val.trim().isEmpty) ? 'Deskripsi pekerjaan wajib diisi' : null,
                decoration: InputDecoration(
                  hintText: 'Jelaskan rincian prosedur dan komponen yang akan dirawat...',
                  hintStyle: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF94A3B8)),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                  ),
                  contentPadding: const EdgeInsets.all(14),
                ),
              ),
              const SizedBox(height: 16),

              // Foto Dokumentasi
              PhotoAttachmentSection(
                photos: _attachedPhotos,
                onPhotoAdded: (path) => setState(() => _attachedPhotos.add(path)),
                onPhotoRemoved: (path) => setState(() => _attachedPhotos.remove(path)),
              ),
              const SizedBox(height: 28),

              // Tombol Simpan
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _saveRecord,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          'Simpan Pemeliharaan',
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
      ),
    );
  }
}
