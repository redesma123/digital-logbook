import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/photo_attachment_section.dart';
import '../../dashboard/data/dashboard_repository.dart';
import '../../dashboard/domain/dashboard_model.dart';
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

  int _selectedUnitId = 1;
  List<UnitItemModel> _units = const [];

  DateTime _selectedDate = DateTime.now();
  String _selectedShift = 'PAGI';
  String _selectedUnitStatus = 'RUNNING';

  // Parameter Operasi Wajib / Inti
  final _voltageController = TextEditingController();
  final _currentController = TextEditingController();
  final _frequencyController = TextEditingController();
  final _activePowerController = TextEditingController();
  final _powerFactorController = TextEditingController();
  final _flowRateController = TextEditingController();
  final _waterLevelController = TextEditingController();
  final _bearingTempController = TextEditingController();
  final _notesController = TextEditingController();
  late final TextEditingController _hmStartController;
  final _hmEndController = TextEditingController();

  // Parameter Operasi Tambahan (Opsional)
  bool _isOptionalExpanded = false;
  final _rpmController = TextEditingController();
  final _genTempController = TextEditingController();
  final _turbTempController = TextEditingController();
  final _vibrationController = TextEditingController();
  final _headController = TextEditingController();
  final _pressureController = TextEditingController();
  final _reactivePowerController = TextEditingController();
  final _intakeConditionController = TextEditingController();

  final List<String> _attachedPhotos = [];
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _hmStartController = TextEditingController();
    _hmStartController.addListener(_onHmChanged);
    _hmEndController.addListener(_onHmChanged);
    Future.microtask(() => _loadInitialData());
  }

  Future<void> _loadInitialData() async {
    try {
      final units = await ref.read(dashboardRepositoryProvider).getUnits();
      if (mounted && units.isNotEmpty) {
        setState(() {
          _units = units;
          _selectedUnitId = units.first.id;
        });
      }
      await _loadLatestHm(_selectedUnitId);
    } catch (_) {}
  }

  Future<void> _loadLatestHm(int unitId) async {
    try {
      final lastHm = await ref.read(logbookRepositoryProvider).fetchLatestHourMeter(unitId);
      if (mounted && lastHm != null) {
        setState(() {
          _hmStartController.text = lastHm.toStringAsFixed(1);
        });
      }
    } catch (_) {}
  }

  void _onHmChanged() => setState(() {});

  double? get _runningHours {
    final start = double.tryParse(_hmStartController.text);
    final end = double.tryParse(_hmEndController.text);
    return (start != null && end != null && end >= start) ? end - start : null;
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
    _rpmController.dispose();
    _genTempController.dispose();
    _turbTempController.dispose();
    _vibrationController.dispose();
    _headController.dispose();
    _pressureController.dispose();
    _reactivePowerController.dispose();
    _intakeConditionController.dispose();
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
      unitId: _selectedUnitId,
      date: DateFormat('yyyy-MM-dd').format(_selectedDate),
      time: DateFormat('HH:mm').format(DateTime.now()),
      shift: _selectedShift,
      unitStatus: _selectedUnitStatus,
      voltage: double.tryParse(_voltageController.text) ?? 0.0,
      current: double.tryParse(_currentController.text) ?? 0.0,
      frequency: double.tryParse(_frequencyController.text) ?? 0.0,
      activePower: double.tryParse(_activePowerController.text) ?? 0.0,
      powerFactor: double.tryParse(_powerFactorController.text) ?? 0.0,
      flowRate: double.tryParse(_flowRateController.text) ?? 0.0,
      waterLevel: double.tryParse(_waterLevelController.text) ?? 0.0,
      bearingTemp: double.tryParse(_bearingTempController.text) ?? 0.0,
      hourMeterStart: double.tryParse(_hmStartController.text),
      hourMeterEnd: double.tryParse(_hmEndController.text),
      notes: _notesController.text.trim(),
      photos: _attachedPhotos,
      rpm: double.tryParse(_rpmController.text),
      generatorTemp: double.tryParse(_genTempController.text),
      turbineTemp: double.tryParse(_turbTempController.text),
      vibrationMms: double.tryParse(_vibrationController.text),
      headM: double.tryParse(_headController.text),
      pressureBar: double.tryParse(_pressureController.text),
      reactivePowerKvar: double.tryParse(_reactivePowerController.text),
      intakeCondition: _intakeConditionController.text.trim().isNotEmpty
          ? _intakeConditionController.text.trim()
          : null,
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
              // 1. Unit Selector
              Text(
                'Unit Pembangkit',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.neutral700,
                ),
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
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.neutral900,
                                ),
                              ),
                            );
                          }).toList()
                        : const [
                            DropdownMenuItem<int>(
                              value: 1,
                              child: Text('Unit 1 (PLTMH)'),
                            ),
                          ],
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedUnitId = val);
                        _loadLatestHm(val);
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // 2. Date Selector
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

              // 3. Shift Selector (Pills)
              Text(
                'Shift Operasi',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.neutral700,
                ),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  {'label': 'Pagi', 'value': 'PAGI'},
                  {'label': 'Siang', 'value': 'SIANG'},
                  {'label': 'Malam', 'value': 'MALAM'},
                ].map((item) {
                  final isSelected = _selectedShift == item['value'];
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedShift = item['value']!),
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
                              item['label']!,
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

              // 4. Parameter Operasi Section Card (Parameter Inti)
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
                      'Parameter Operasi Inti',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.neutral900,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildParamField('Tegangan (V)', _voltageController, hint: '400'),
                    _buildParamField('Arus (A)', _currentController, hint: '820'),
                    _buildParamField('Frekuensi (Hz)', _frequencyController, hint: '50.0'),
                    _buildParamField('Daya Aktif (kW)', _activePowerController, hint: '450'),
                    _buildParamField('Faktor Daya (Cos φ)', _powerFactorController, hint: '0.98'),
                    _buildParamField('Debit Air (m³/s)', _flowRateController, hint: '2.50'),
                    _buildParamField('Tinggi Muka Air (m)', _waterLevelController, hint: '1.80'),
                    _buildParamField('Suhu Bearing (°C)', _bearingTempController, hint: '52', isLast: true),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // 5. Parameter Tambahan (Opsional - Collapsible Accordion)
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    InkWell(
                      onTap: () {
                        setState(() {
                          _isOptionalExpanded = !_isOptionalExpanded;
                        });
                      },
                      borderRadius: BorderRadius.circular(14),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Parameter Teknis Lanjutan',
                                  style: GoogleFonts.inter(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.neutral900,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'RPM, Suhu Turbin/Generator, Vibrasi, Head, Tekanan',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    color: AppColors.neutral500,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Icon(
                                _isOptionalExpanded
                                    ? Icons.keyboard_arrow_up
                                    : Icons.keyboard_arrow_down,
                                size: 20,
                                color: AppColors.neutral700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (_isOptionalExpanded) ...[
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            _buildParamField('Putaran Turbin (RPM)', _rpmController, hint: '1000'),
                            _buildParamField('Suhu Generator (°C)', _genTempController, hint: '60'),
                            _buildParamField('Suhu Turbin (°C)', _turbTempController, hint: '45'),
                            _buildParamField('Vibrasi (mm/s)', _vibrationController, hint: '1.2'),
                            _buildParamField('Tinggi Jatuh / Head (m)', _headController, hint: '12.0'),
                            _buildParamField('Tekanan Penstock (bar)', _pressureController, hint: '1.5'),
                            _buildParamField('Daya Reaktif (kVAR)', _reactivePowerController, hint: '90'),
                            _buildParamField('Kondisi Intake', _intakeConditionController, hint: 'Normal / Bersih', isLast: true, isText: true),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 6. Hour Meter (Operan Shift)
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
                    _buildParamField('HM Awal (jam)', _hmStartController, hint: '0.0', validator: _validateHmStart),
                    _buildParamField('HM Akhir (jam)', _hmEndController, hint: '0.0', validator: _validateHmEnd),
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

              // 7. Status Unit Selector (RUNNING, STANDBY, OFFLINE, TRIP)
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
                  _buildStatusButton('Running', 'RUNNING', const Color(0xFF16A34A)),
                  const SizedBox(width: 8),
                  _buildStatusButton('Standby', 'STANDBY', const Color(0xFFEAB308)),
                  const SizedBox(width: 8),
                  _buildStatusButton('Offline', 'OFFLINE', AppColors.statusOffline),
                  const SizedBox(width: 8),
                  _buildStatusButton('Trip', 'TRIP', AppColors.statusTrip),
                ],
              ),
              const SizedBox(height: 20),

              // 8. Catatan
              Text(
                'Catatan Operasi',
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
                  hintText: 'Kondisi operasional unit...',
                  fillColor: Colors.white,
                  filled: true,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // 9. Foto Dokumentasi
              PhotoAttachmentSection(
                label: 'Foto Dokumentasi',
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

              // 10. Tombol Simpan
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
    String? hint,
    bool isLast = false,
    bool isText = false,
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
              keyboardType: isText ? TextInputType.text : const TextInputType.numberWithOptions(decimal: true),
              textAlign: isText ? TextAlign.left : TextAlign.right,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.neutral900,
              ),
              decoration: InputDecoration(
                isDense: true,
                hintText: hint,
                hintStyle: GoogleFonts.inter(fontSize: 12, color: AppColors.neutral400, fontWeight: FontWeight.normal),
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

  Widget _buildStatusButton(String label, String value, Color activeColor) {
    final isSelected = _selectedUnitStatus == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedUnitStatus = value),
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
              label,
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
