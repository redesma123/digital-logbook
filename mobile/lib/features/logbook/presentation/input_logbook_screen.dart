import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/photo_attachment_section.dart';
import '../data/logbook_repository.dart';
import '../domain/logbook_model.dart';
import 'controllers/logbook_controller.dart';

class InputLogbookScreen extends ConsumerStatefulWidget {
  const InputLogbookScreen({super.key});

  @override
  ConsumerState<InputLogbookScreen> createState() => _InputLogbookScreenState();
}

class _InputLogbookScreenState extends ConsumerState<InputLogbookScreen> {
  final _formKey = GlobalKey<FormState>();

  DateTime _selectedDate = DateTime(2025, 4, 12);
  String _selectedShift = 'Pagi';
  String _selectedUnitStatus = 'Running';

  final _voltageController = TextEditingController(text: '400');
  final _currentController = TextEditingController(text: '820');
  final _frequencyController = TextEditingController(text: '50.0');
  final _activePowerController = TextEditingController(text: '450');
  final _powerFactorController = TextEditingController(text: '0.98');
  final _flowRateController = TextEditingController(text: '2.50');
  final _waterLevelController = TextEditingController(text: '1.80');
  final _bearingTempController = TextEditingController(text: '52');
  final _notesController = TextEditingController(text: 'Kondisi normal.');
  late final TextEditingController _hmStartController;
  final _hmEndController = TextEditingController();

  final List<String> _attachedPhotos = [];
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    // Operan shift: HM awal = HM akhir shift sebelumnya.
    final lastHm = ref.read(logbookRepositoryProvider).latestHourMeterEnd;
    _hmStartController = TextEditingController(text: lastHm?.toStringAsFixed(1) ?? '');
    _hmStartController.addListener(_onHmChanged);
    _hmEndController.addListener(_onHmChanged);
  }

  void _onHmChanged() => setState(() {});

  double? get _runningHours {
    final start = double.tryParse(_hmStartController.text);
    final end = double.tryParse(_hmEndController.text);
    return (start != null && end != null) ? end - start : null;
  }

  @override
  void dispose() {
    _voltageController.dispose();
    _currentController.dispose();
    _frequencyController.dispose();
    _activePowerController.dispose();
    _powerFactorController.dispose();
    _flowRateController.dispose();
    _waterLevelController.dispose();
    _bearingTempController.dispose();
    _notesController.dispose();
    _hmStartController.dispose();
    _hmEndController.dispose();
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
              primary: AppColors.primary,
              onPrimary: Colors.white,
              surface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _submitLogbook() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final entry = LogbookModel(
      id: DateTime.now().millisecondsSinceEpoch,
      date: DateFormat('dd MMM yyyy').format(_selectedDate),
      time: DateFormat('HH:mm').format(DateTime.now()),
      shift: _selectedShift,
      unitStatus: _selectedUnitStatus,
      operatorName: 'Andi Pratama',
      voltage: double.tryParse(_voltageController.text) ?? 400,
      current: double.tryParse(_currentController.text) ?? 820,
      frequency: double.tryParse(_frequencyController.text) ?? 50.0,
      activePower: double.tryParse(_activePowerController.text) ?? 450,
      powerFactor: double.tryParse(_powerFactorController.text) ?? 0.98,
      flowRate: double.tryParse(_flowRateController.text) ?? 2.50,
      waterLevel: double.tryParse(_waterLevelController.text) ?? 1.80,
      bearingTemp: double.tryParse(_bearingTempController.text) ?? 52,
      hourMeterStart: double.tryParse(_hmStartController.text),
      hourMeterEnd: double.tryParse(_hmEndController.text),
      notes: _notesController.text.trim(),
      photos: _attachedPhotos,
    );

    final success = await ref.read(logbookControllerProvider.notifier).saveLogbook(entry);

    if (mounted) {
      setState(() => _isSaving = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Entri logbook berhasil disimpan!'),
            backgroundColor: AppColors.statusRunning,
            behavior: SnackBarBehavior.floating,
          ),
        );
        context.go('/history-logbook');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat('dd MMM yyyy').format(_selectedDate);

    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F265C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
        ),
        title: Text(
          'Input Logbook',
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
              // 1. Date Selector
              Text(
                'Tanggal',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.neutral700,
                ),
              ),
              const SizedBox(height: 6),
              GestureDetector(
                onTap: _pickDate,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        formattedDate,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.neutral900,
                        ),
                      ),
                      const Icon(
                        Icons.calendar_today_outlined,
                        size: 18,
                        color: AppColors.primary,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // 2. Shift Selector (Pills)
              Text(
                'Shift',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.neutral700,
                ),
              ),
              const SizedBox(height: 6),
              Row(
                children: ['Pagi', 'Siang', 'Malam'].map((shift) {
                  final isSelected = _selectedShift == shift;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedShift = shift),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primary : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : const Color(0xFFCBD5E1),
                            ),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: AppColors.primary.withValues(alpha: 0.25),
                                      blurRadius: 8,
                                      offset: const Offset(0, 3),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Center(
                            child: Text(
                              shift,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? Colors.white : AppColors.neutral700,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              // 3. Parameter Operasi Section Card
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
                      'Parameter Operasi',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.neutral900,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildParamField('Tegangan (V)', _voltageController),
                    _buildParamField('Arus (A)', _currentController),
                    _buildParamField('Frekuensi (Hz)', _frequencyController),
                    _buildParamField('Daya Aktif (kW)', _activePowerController),
                    _buildParamField('Faktor Daya', _powerFactorController),
                    _buildParamField('Debit Air (m³/s)', _flowRateController),
                    _buildParamField('Tinggi Muka Air (m)', _waterLevelController),
                    _buildParamField('Suhu Bearing (°C)', _bearingTempController, isLast: true),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 4. Hour Meter (Operan Shift)
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
                      'Hour Meter (Operan Shift)',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.neutral900,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildParamField('HM Awal (jam)', _hmStartController, validator: _validateHmStart),
                    _buildParamField('HM Akhir (jam)', _hmEndController, validator: _validateHmEnd),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Jam Operasi',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: AppColors.neutral700,
                          ),
                        ),
                        Text(
                          _runningHours == null ? '-' : '${_runningHours!.toStringAsFixed(1)} jam',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 5. Status Unit Selector (Running, Standby, Shutdown, Trip)
              Text(
                'Status Unit',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.neutral700,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildStatusButton('Running', const Color(0xFF16A34A)),
                  const SizedBox(width: 8),
                  _buildStatusButton('Standby', const Color(0xFFEAB308)),
                  const SizedBox(width: 8),
                  _buildStatusButton('Shutdown', AppColors.statusOffline),
                  const SizedBox(width: 8),
                  _buildStatusButton('Trip', AppColors.statusTrip),
                ],
              ),
              const SizedBox(height: 20),

              // 5. Catatan
              Text(
                'Catatan',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.neutral700,
                ),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _notesController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Kondisi normal...',
                  fillColor: Colors.white,
                  filled: true,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // 6. Foto Dokumentasi
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

              // 7. Simpan Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _submitLogbook,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          'Simpan Logbook',
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

  // Aturan validasi HM sesuai docs/SCHEMA.md: start ≥ 0, end ≥ start, running 0–8 jam/shift.
  String? _validateHmStart(String? v) {
    final start = double.tryParse(v ?? '');
    if (start == null) return 'Wajib diisi';
    if (start < 0) return 'Min. 0';
    return null;
  }

  String? _validateHmEnd(String? v) {
    final end = double.tryParse(v ?? '');
    if (end == null) return 'Wajib diisi';
    final start = double.tryParse(_hmStartController.text);
    if (start != null && end < start) return '< HM awal';
    final running = _runningHours;
    if (running != null && running > 8) return 'Maks. 8 jam';
    return null;
  }

  Widget _buildParamField(
    String label,
    TextEditingController controller, {
    bool isLast = false,
    String? Function(String?)? validator,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            flex: 5,
            child: Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.neutral700,
                ),
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: TextFormField(
              controller: controller,
              validator: validator,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              textAlign: TextAlign.right,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.neutral900,
              ),
              decoration: InputDecoration(
                isDense: true,
                errorStyle: GoogleFonts.inter(fontSize: 10),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
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
          ),
        ],
      ),
    );
  }

  Widget _buildStatusButton(String status, Color activeColor) {
    final isSelected = _selectedUnitStatus == status;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedUnitStatus = status),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: isSelected ? activeColor : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? activeColor : const Color(0xFFCBD5E1),
            ),
          ),
          child: Center(
            child: Text(
              status,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : AppColors.neutral700,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
