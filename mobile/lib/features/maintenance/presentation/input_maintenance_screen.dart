import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/photo_attachment_section.dart';
import '../domain/maintenance_model.dart';
import 'controllers/maintenance_controller.dart';

class InputMaintenanceScreen extends ConsumerStatefulWidget {
  const InputMaintenanceScreen({super.key});

  @override
  ConsumerState<InputMaintenanceScreen> createState() => _InputMaintenanceScreenState();
}

class _InputMaintenanceScreenState extends ConsumerState<InputMaintenanceScreen> {
  final _formKey = GlobalKey<FormState>();

  DateTime _selectedDate = DateTime(2025, 4, 12);
  String _selectedEquipment = 'Turbin';
  String _selectedJobType = 'Inspeksi Rutin';
  String _selectedStatus = 'Plan';

  final _descriptionController = TextEditingController(text: 'Pengecekan kondisi bearing, pelumasan, dan kebersihan.');
  final _technicianController = TextEditingController(text: 'Andi Pratama');

  final List<String> _attachedPhotos = ['assets/images/photo_placeholder.jpg'];
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
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF0284C7),
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

    final formattedDateStr = DateFormat('dd MMM yyyy').format(_selectedDate);

    final record = MaintenanceModel(
      id: DateTime.now().millisecondsSinceEpoch,
      date: formattedDateStr,
      equipment: _selectedEquipment,
      jobType: _selectedJobType,
      description: _descriptionController.text.trim(),
      technician: _technicianController.text.trim(),
      status: _selectedStatus.toUpperCase(),
      photos: _attachedPhotos,
    );

    await ref.read(maintenanceControllerProvider.notifier).createRecord(record);

    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Catatan maintenance $_selectedEquipment berhasil disimpan!',
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
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat('dd MMM yyyy').format(_selectedDate);

    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0284C7),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.canPop() ? context.pop() : context.go('/maintenance'),
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
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Tanggal DatePicker
              _buildSectionLabel('Tanggal'),
              const SizedBox(height: 6),
              InkWell(
                onTap: _pickDate,
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.neutral300),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          formattedDate,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppColors.neutral900,
                          ),
                        ),
                      ),
                      const Icon(Icons.calendar_today_outlined, size: 18, color: Color(0xFF0284C7)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // 2. Peralatan Dropdown
              _buildSectionLabel('Peralatan'),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.neutral300),
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
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppColors.neutral900,
                          ),
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

              // 3. Jenis Pekerjaan Dropdown
              _buildSectionLabel('Jenis Pekerjaan'),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.neutral300),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedJobType,
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.neutral500),
                    items: _jobTypes.map((type) {
                      return DropdownMenuItem<String>(
                        value: type,
                        child: Text(
                          type,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppColors.neutral900,
                          ),
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

              // 4. Deskripsi Pekerjaan Textarea
              _buildSectionLabel('Deskripsi Pekerjaan'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                style: GoogleFonts.inter(fontSize: 14, color: AppColors.neutral900),
                decoration: InputDecoration(
                  hintText: 'Pengecekan kondisi bearing, pelumasan, dan kebersihan...',
                  hintStyle: GoogleFonts.inter(fontSize: 13, color: AppColors.neutral400),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.neutral300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.neutral300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF0284C7), width: 1.5),
                  ),
                  contentPadding: const EdgeInsets.all(12),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Deskripsi pekerjaan wajib diisi';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // 5. Teknisi Input
              _buildSectionLabel('Teknisi'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _technicianController,
                style: GoogleFonts.inter(fontSize: 14, color: AppColors.neutral900),
                decoration: InputDecoration(
                  hintText: 'Nama teknisi penanggung jawab',
                  hintStyle: GoogleFonts.inter(fontSize: 13, color: AppColors.neutral400),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.neutral300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.neutral300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF0284C7), width: 1.5),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Nama teknisi wajib diisi';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // 6. Status Selector (Plan, Process, Complete)
              _buildSectionLabel('Status'),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildStatusOption(
                      label: 'Plan',
                      activeColor: const Color(0xFF0284C7),
                      activeBgColor: const Color(0xFFE0F2FE),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildStatusOption(
                      label: 'Process',
                      activeColor: const Color(0xFFF59E0B),
                      activeBgColor: const Color(0xFFFEF3C7),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildStatusOption(
                      label: 'Complete',
                      activeColor: const Color(0xFF10B981),
                      activeBgColor: const Color(0xFFDCFCE7),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // 7. Foto Section
              PhotoAttachmentSection(
                label: 'Foto',
                photos: _attachedPhotos,
                onPhotoAdded: (path) {
                  setState(() {
                    _attachedPhotos.add(path);
                  });
                },
                onPhotoRemoved: (path) {
                  setState(() {
                    _attachedPhotos.remove(path);
                  });
                },
              ),
              const SizedBox(height: 28),

              // 8. Action Button Simpan
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _saveRecord,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    elevation: 0,
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(
                          'Simpan',
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.2,
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

  Widget _buildSectionLabel(String label) {
    return Text(
      label,
      style: GoogleFonts.inter(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: AppColors.neutral700,
      ),
    );
  }

  Widget _buildStatusOption({
    required String label,
    required Color activeColor,
    required Color activeBgColor,
  }) {
    final isSelected = _selectedStatus.toLowerCase() == label.toLowerCase();

    return InkWell(
      onTap: () => setState(() => _selectedStatus = label),
      borderRadius: BorderRadius.circular(8),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? activeBgColor : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? activeColor : AppColors.neutral300,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected ? activeColor : AppColors.neutral700,
            ),
          ),
        ),
      ),
    );
  }
}
