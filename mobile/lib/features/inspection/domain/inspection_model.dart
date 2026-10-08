import 'package:intl/intl.dart';

class InspectionItemModel {
  final String id;
  final String category;
  final String title;
  final String description;
  String status; // 'normal', 'warning', 'danger'

  InspectionItemModel({
    required this.id,
    required this.category,
    required this.title,
    required this.description,
    this.status = 'normal',
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'category': category,
    'title': title,
    'description': description,
    'status': status,
  };

  factory InspectionItemModel.fromJson(Map<String, dynamic> json) => InspectionItemModel(
    id: json['id'] as String? ?? '',
    category: json['category'] as String? ?? '',
    title: json['title'] as String? ?? '',
    description: json['description'] as String? ?? '',
    status: json['status'] as String? ?? 'normal',
  );

  InspectionItemModel copyWith({String? status}) {
    return InspectionItemModel(
      id: id,
      category: category,
      title: title,
      description: description,
      status: status ?? this.status,
    );
  }
}

class InspectionRecordModel {
  final String id;
  final DateTime createdAt;
  final String inspectorName;
  final String unitName;
  final List<InspectionItemModel> items;
  final String notes;
  final List<String> photos;

  const InspectionRecordModel({
    required this.id,
    required this.createdAt,
    required this.inspectorName,
    required this.unitName,
    required this.items,
    this.notes = '',
    this.photos = const [],
  });

  int get normalCount => items.where((i) => i.status == 'normal').length;
  int get warningCount => items.where((i) => i.status == 'warning').length;
  int get dangerCount => items.where((i) => i.status == 'danger').length;

  String get overallStatus {
    if (dangerCount > 0) return 'KRITIS';
    if (warningCount > 0) return 'WASPADA';
    return 'NORMAL';
  }

  String get formattedDate => DateFormat('dd MMM yyyy').format(createdAt);
  String get formattedTime => '${DateFormat('HH:mm').format(createdAt)} WIB';
  String get formattedDateTime => '$formattedDate, $formattedTime';

  Map<String, dynamic> toJson() => {
    'id': id,
    'createdAt': createdAt.toIso8601String(),
    'inspectorName': inspectorName,
    'unitName': unitName,
    'items': items.map((i) => i.toJson()).toList(),
    'notes': notes,
    'photos': photos,
  };

  factory InspectionRecordModel.fromJson(Map<String, dynamic> json) => InspectionRecordModel(
    id: json['id'] as String? ?? DateTime.now().millisecondsSinceEpoch.toString(),
    createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : DateTime.now(),
    inspectorName: json['inspectorName'] as String? ?? 'Operator',
    unitName: json['unitName'] as String? ?? 'Unit 1 & Saluran',
    items: (json['items'] as List<dynamic>?)
            ?.map((e) => InspectionItemModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [],
    notes: json['notes'] as String? ?? '',
    photos: (json['photos'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
  );
}
