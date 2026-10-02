import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../domain/incident_model.dart';
import 'controllers/incident_controller.dart';

class InputIncidentScreen extends ConsumerStatefulWidget {
  const InputIncidentScreen({super.key});

  @override
  ConsumerState<InputIncidentScreen> createState() => _InputIncidentScreenState();
}

class _InputIncidentScreenState extends ConsumerState<InputIncidentScreen> {
  final _formKey = GlobalKey<FormState>();

  DateTime _selectedDateTime = DateTime(2025, 4, 12, 14, 25);
  String _selectedEquipment = 'Generator';
  String _selectedIncidentType = 'Trip';
  String _selectedStatus = 'Open';

  final _descriptionController = TextEditingController(text: 'Generator trip karena over current.');
  final _operatorActionController = TextEditingController(text: 'Cek proteksi dan reset.');

  final List<String> _attachedPhotos = ['assets/images/photo_placeholder.jpg'];
  bool _isSaving = false;

  final List<String> _equipmentList = [
    'Generator',
    'Turbin',
    'Intake',
    'Panel Kontrol',
    'Trafo Utama',
    'Sistem Eksitasi',
    'Sistem Pelumasan',
  ];

  final List<String> _incidentTypes = [
    'Trip',
    'Turbine Vibration',
    'Suhu Tinggi (Overheating)',
    'Intake Tersumbat',
    'Alarm Komunikasi',
    'Kebocoran Oli/Air',
    'Tegangan Tidak Stabil',
    'Lainnya',
  ];

  @override
  void dispose() {
    _descriptionController.dispose();
    _operatorActionController.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime() async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: _selectedDateTime,
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

    if (pickedDate != null && mounted) {
      final pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_selectedDateTime),
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

      if (pickedTime != null) {
        setState(() {
          _selectedDateTime = DateTime(
            pickedDate.year,
            pickedDate.month,
            pickedDate.day,
            pickedTime.hour,
            pickedTime.minute,
          );
        });
      }
    }
  }

  Future<void> _saveIncident() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final formattedDateStr = DateFormat('dd MMM yyyy HH:mm').format(_selectedDateTime);

    final incident = IncidentModel(
      id: DateTime.now().millisecondsSinceEpoch,
      dateTime: formattedDateStr,
      equipment: _selectedEquipment,
      incidentType: _selectedIncidentType,
      description: _descriptionController.text.trim(),
      operatorAction: _operatorActionController.text.trim(),
      status: _selectedStatus.toUpperCase(),
      photos: _attachedPhotos,
    );

    await ref.read(incidentControllerProvider.notifier).createIncident(incident);

    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Laporan gangguan $_selectedEquipment berhasil disimpan!',
            style: GoogleFonts.inter(fontWeight: FontWeight.w600),
          ),
          backgroundColor: const Color(0xFF10B981),
          behavior: SnackBarBehavior.floating,
        ),
      );
      if (context.canPop()) {
        context.pop();
      } else {
        context.go('/incidents');
      }
    }
  }

  void _addPhotoMock() {
    setState(() {
      _attachedPhotos.add('assets/images/photo_placeholder.jpg');
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Foto dokumentasi berhasil ditambahkan (Total: ${_attachedPhotos.length})'),
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final formattedDateTime = DateFormat('dd MMM yyyy HH:mm').format(_selectedDateTime);

    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0284C7),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.canPop() ? context.pop() : context.go('/incidents'),
        ),
        title: Text(
          'Input Gangguan',
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
              // 1. Tanggal & Waktu Picker
              _buildSectionLabel('Tanggal & Waktu'),
              const SizedBox(height: 6),
              InkWell(
                onTap: _pickDateTime,
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
                          formattedDateTime,
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

              // 3. Jenis Gangguan Dropdown
              _buildSectionLabel('Jenis Gangguan'),
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
                    value: _selectedIncidentType,
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.neutral500),
                    items: _incidentTypes.map((type) {
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
                      if (val != null) setState(() => _selectedIncidentType = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // 4. Deskripsi Gangguan Textarea
              _buildSectionLabel('Deskripsi Gangguan'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                style: GoogleFonts.inter(fontSize: 14, color: AppColors.neutral900),
                decoration: InputDecoration(
                  hintText: 'Tuliskan rincian gangguan yang terjadi...',
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
                    return 'Deskripsi gangguan wajib diisi';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // 5. Tindakan Operator Textarea
              _buildSectionLabel('Tindakan Operator'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _operatorActionController,
                maxLines: 3,
                style: GoogleFonts.inter(fontSize: 14, color: AppColors.neutral900),
                decoration: InputDecoration(
                  hintText: 'Tindakan yang diambil saat gangguan berlangsung...',
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
                    return 'Tindakan operator wajib diisi';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // 6. Status Selector (Open, Process, Closed)
              _buildSectionLabel('Status'),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildStatusOption(
                      label: 'Open',
                      activeColor: const Color(0xFFEF4444),
                      activeBgColor: const Color(0xFFFEE2E2),
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
                      label: 'Closed',
                      activeColor: const Color(0xFF10B981),
                      activeBgColor: const Color(0xFFDCFCE7),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // 7. Foto Section
              _buildSectionLabel('Foto'),
              const SizedBox(height: 8),
              SizedBox(
                height: 72,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  children: [
                    ..._attachedPhotos.map((photoPath) {
                      return Container(
                        width: 72,
                        height: 72,
                        margin: const EdgeInsets.only(right: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.neutral300),
                          color: AppColors.neutral100,
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(9),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Container(
                                color: const Color(0xFF1E293B),
                                child: const Center(
                                  child: Icon(Icons.image, color: Colors.white54, size: 28),
                                ),
                              ),
                              Positioned(
                                top: 2,
                                right: 2,
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _attachedPhotos.remove(photoPath);
                                    });
                                  },
                                  child: Container(
                                    decoration: const BoxDecoration(
                                      color: Colors.black54,
                                      shape: BoxShape.circle,
                                    ),
                                    padding: const EdgeInsets.all(2),
                                    child: const Icon(Icons.close, size: 14, color: Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                    // Add Photo Button "+"
                    InkWell(
                      onTap: _addPhotoMock,
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.neutral300, width: 1.5),
                        ),
                        child: const Center(
                          child: Icon(Icons.add, size: 30, color: AppColors.neutral500),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // 8. Action Button Simpan
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _saveIncident,
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
