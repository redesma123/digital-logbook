class MaintenanceModel {
  final int id;
  final int unitId;
  final String date;
  final String equipment; // Turbin, Generator, Intake, Panel Kontrol, dll.
  final String jobType; // Inspeksi Rutin, Penggantian Filter Udara, Pembersihan Trash Rack, dll.
  final String description;
  final String technician;
  final String status; // PLAN, PROCESS, COMPLETE
  final List<String> photos;

  const MaintenanceModel({
    required this.id,
    this.unitId = 1,
    required this.date,
    required this.equipment,
    required this.jobType,
    required this.description,
    this.technician = 'Andi Pratama',
    this.status = 'PLAN',
    this.photos = const [],
  });

  MaintenanceModel copyWith({
    int? id,
    int? unitId,
    String? date,
    String? equipment,
    String? jobType,
    String? description,
    String? technician,
    String? status,
    List<String>? photos,
  }) {
    return MaintenanceModel(
      id: id ?? this.id,
      unitId: unitId ?? this.unitId,
      date: date ?? this.date,
      equipment: equipment ?? this.equipment,
      jobType: jobType ?? this.jobType,
      description: description ?? this.description,
      technician: technician ?? this.technician,
      status: status ?? this.status,
      photos: photos ?? this.photos,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'unit_id': unitId,
      'date': date,
      'equipment': equipment,
      'job_type': jobType,
      'description': description,
      'technician': technician,
      'status': status,
      'photos': photos,
    };
  }

  factory MaintenanceModel.fromJson(Map<String, dynamic> json) {
    return MaintenanceModel(
      id: json['id'] as int? ?? 0,
      unitId: json['unit_id'] as int? ?? 1,
      date: json['date'] as String? ?? '12 Apr 2025',
      equipment: json['equipment'] as String? ?? 'Turbin',
      jobType: json['job_type'] as String? ?? 'Inspeksi Rutin',
      description: json['description'] as String? ?? '',
      technician: json['technician'] as String? ?? 'Andi Pratama',
      status: json['status'] as String? ?? 'PLAN',
      photos: (json['photos'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  static List<MaintenanceModel> get mockRecords => [
        const MaintenanceModel(
          id: 1,
          date: '12 Apr 2025',
          equipment: 'Turbin',
          jobType: 'Inspeksi Rutin',
          description: 'Pengecekan kondisi bearing, pelumasan, dan kebersihan.',
          technician: 'Andi Pratama',
          status: 'COMPLETE',
          photos: ['assets/images/photo_placeholder.jpg'],
        ),
        const MaintenanceModel(
          id: 2,
          date: '08 Apr 2025',
          equipment: 'Generator',
          jobType: 'Penggantian Filter Udara',
          description: 'Penggantian filter udara generator unit 1 dan vacuum debu housing.',
          technician: 'Budi Santoso',
          status: 'PROCESS',
          photos: [],
        ),
        const MaintenanceModel(
          id: 3,
          date: '03 Apr 2025',
          equipment: 'Intake',
          jobType: 'Pembersihan Trash Rack',
          description: 'Pembersihan tumpukan sampah dan kayu pada saringan intake air.',
          technician: 'Tim Sipil & Operasi',
          status: 'COMPLETE',
          photos: [],
        ),
        const MaintenanceModel(
          id: 4,
          date: '28 Mar 2025',
          equipment: 'Panel Kontrol',
          jobType: 'Pengecekan Panel',
          description: 'Inspeksi koneksi kabel terminal, pembersihan debu, dan kalibrasi meter.',
          technician: 'Andi Pratama',
          status: 'COMPLETE',
          photos: [],
        ),
      ];
}
