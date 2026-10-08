import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/inspection/domain/inspection_model.dart';

final inspectionRepositoryProvider = Provider<InspectionRepository>((ref) {
  return InspectionRepository();
});

class InspectionRepository {
  InspectionRepository();

  /// Default baseline inspection checklist items template
  List<InspectionItemModel> getDefaultTemplateItems() {
    return [
      // Sektor 1: Turbin & Saluran Penstock
      InspectionItemModel(
        id: '1',
        category: 'Turbin & Penstock',
        title: 'Suara & Getaran Turbin',
        description: 'Bebas dari suara gesekan abnormal dan vibrasi di bawah 5.0 mm/s',
        status: 'normal',
      ),
      InspectionItemModel(
        id: '2',
        category: 'Turbin & Penstock',
        title: 'Suhu Bantalan (Bearing)',
        description: 'Temperatur guide & thrust bearing normal (< 65 °C)',
        status: 'normal',
      ),
      InspectionItemModel(
        id: '3',
        category: 'Turbin & Penstock',
        title: 'Kebocoran Shaft Seal',
        description: 'Tidak ada rembesan air berlebih pada packing shaft turbin',
        status: 'warning',
      ),
      InspectionItemModel(
        id: '4',
        category: 'Turbin & Penstock',
        title: 'Tekanan Manometer Penstock',
        description: 'Tekanan statis dan dinamis air sesuai head rencana (0.52 bar)',
        status: 'normal',
      ),

      // Sektor 2: Generator & Eksitasi
      InspectionItemModel(
        id: '5',
        category: 'Generator & Eksitasi',
        title: 'Suhu Belitan Stator Winding',
        description: 'Temperatur belitan generator berada pada range aman (< 80 °C)',
        status: 'normal',
      ),
      InspectionItemModel(
        id: '6',
        category: 'Generator & Eksitasi',
        title: 'Kondisi Slip Ring & Carbon Brush',
        description: 'Ketebalan sikat arang memenuhi syarat & tidak ada percikan api',
        status: 'normal',
      ),
      InspectionItemModel(
        id: '7',
        category: 'Generator & Eksitasi',
        title: 'Sirkulasi Udara Pendingin',
        description: 'Saluran inlet & exhaust udara generator bebas hambatan debu',
        status: 'normal',
      ),

      // Sektor 3: Intake & Forebay
      InspectionItemModel(
        id: '8',
        category: 'Intake & Forebay',
        title: 'Kebersihan Trash Rack Intake',
        description: 'Bebas dari tumpukan sampah, kayu ranting, dan gulma air',
        status: 'normal',
      ),
      InspectionItemModel(
        id: '9',
        category: 'Intake & Forebay',
        title: 'Level Sedimen Desilting Basin',
        description: 'Endapan pasir & lumpur di bawah ambang batas kuras (50 cm)',
        status: 'normal',
      ),
      InspectionItemModel(
        id: '10',
        category: 'Intake & Forebay',
        title: 'Kesiapan Pintu Air Darurat',
        description: 'Mekanisme hoisting & stoplog dalam kondisi siap operasi',
        status: 'normal',
      ),

      // Sektor 4: Panel Kontrol & Trafo
      InspectionItemModel(
        id: '11',
        category: 'Panel Kontrol & Trafo',
        title: 'Status Alarm Panel Kontrol PLC',
        description: 'Semua lampu indikator warning/trip padam, sistem siap sinkron',
        status: 'normal',
      ),
    ];
  }

  static final List<InspectionRecordModel> _records = [
    InspectionRecordModel(
      id: 'insp-seed-1',
      createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      inspectorName: 'Budi Santoso (Operator)',
      unitName: 'Unit 1 & Saluran Air',
      items: [
        InspectionItemModel(
          id: '1',
          category: 'Turbin & Penstock',
          title: 'Suara & Getaran Turbin',
          description: 'Bebas dari suara gesekan abnormal dan vibrasi di bawah 5.0 mm/s',
          status: 'normal',
        ),
        InspectionItemModel(
          id: '2',
          category: 'Turbin & Penstock',
          title: 'Suhu Bantalan (Bearing)',
          description: 'Temperatur guide & thrust bearing normal (< 65 °C)',
          status: 'normal',
        ),
        InspectionItemModel(
          id: '3',
          category: 'Turbin & Penstock',
          title: 'Kebocoran Shaft Seal',
          description: 'Rembesan tipis teramati di seal turbin sisi intake',
          status: 'warning',
        ),
        InspectionItemModel(
          id: '4',
          category: 'Turbin & Penstock',
          title: 'Tekanan Manometer Penstock',
          description: 'Tekanan penstock 0.52 bar stabil',
          status: 'normal',
        ),
        InspectionItemModel(
          id: '5',
          category: 'Generator & Eksitasi',
          title: 'Suhu Belitan Stator Winding',
          description: 'Temperatur belitan 68 °C',
          status: 'normal',
        ),
        InspectionItemModel(
          id: '6',
          category: 'Generator & Eksitasi',
          title: 'Kondisi Slip Ring & Carbon Brush',
          description: 'Sikat arang terpasang baik, tidak ada arcing',
          status: 'normal',
        ),
        InspectionItemModel(
          id: '7',
          category: 'Generator & Eksitasi',
          title: 'Sirkulasi Udara Pendingin',
          description: 'Pendingin kipas berputar normal',
          status: 'normal',
        ),
        InspectionItemModel(
          id: '8',
          category: 'Intake & Forebay',
          title: 'Kebersihan Trash Rack Intake',
          description: 'Sampah ranting dibersihkan di trash rack',
          status: 'normal',
        ),
        InspectionItemModel(
          id: '9',
          category: 'Intake & Forebay',
          title: 'Level Sedimen Desilting Basin',
          description: 'Endapan sedimen ~20 cm, aman',
          status: 'normal',
        ),
        InspectionItemModel(
          id: '10',
          category: 'Intake & Forebay',
          title: 'Kesiapan Pintu Air Darurat',
          description: 'Stoplog siap operasional',
          status: 'normal',
        ),
        InspectionItemModel(
          id: '11',
          category: 'Panel Kontrol & Trafo',
          title: 'Status Alarm Panel Kontrol PLC',
          description: 'Semua lampu indikator warning/trip padam, sistem siap sinkron',
          status: 'normal',
        ),
      ],
      notes: 'Pemeriksaan rutin shift pagi. Ditemukan rembesan kecil pada seal shaft turbin namun masih dalam batas aman operasional.',
      photos: [],
    ),
  ];

  Future<List<InspectionRecordModel>> getAllRecords() async {
    // If needed in future: sync with storage
    return List.from(_records);
  }

  Future<bool> saveRecord(InspectionRecordModel record) async {
    _records.insert(0, record);
    return true;
  }
}
