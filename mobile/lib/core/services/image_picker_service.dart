import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile/core/constants/app_colors.dart';

final imagePickerServiceProvider = Provider<ImagePickerService>((ref) {
  return ImagePickerService(ImagePicker());
});

class ImagePickerService {
  final ImagePicker _picker;

  ImagePickerService(this._picker);

  static const double maxImageDimension = 1280.0;
  static const int imageCompressionQuality = 75;
  static const int maxFileSizeBytes = 5 * 1024 * 1024; // 5 MB per SRS F-33

  /// Pick an image from camera with automatic compression per SRS F-31
  Future<File?> pickFromCamera() async {
    return _pickImage(ImageSource.camera);
  }

  /// Pick an image from gallery with automatic compression per SRS F-31
  Future<File?> pickFromGallery() async {
    return _pickImage(ImageSource.gallery);
  }

  Future<File?> _pickImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: maxImageDimension,
        maxHeight: maxImageDimension,
        imageQuality: imageCompressionQuality,
      );

      if (pickedFile == null) return null;

      final file = File(pickedFile.path);
      if (!await file.exists()) return null;

      final length = await file.length();
      if (length > maxFileSizeBytes) {
        throw Exception('Ukuran foto melebihi batas maksimal 5 MB.');
      }

      return file;
    } catch (e) {
      debugPrint('Error picking image: $e');
      rethrow;
    }
  }

  /// Displays an action bottom sheet to choose between Camera and Gallery
  Future<File?> showImageSourceDialog(BuildContext context) async {
    return showModalBottomSheet<File?>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (BuildContext sheetContext) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  'Lampirkan Foto Dokumentasi',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.neutral900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Ambil foto langsung di lokasi atau pilih dari galeri',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: AppColors.neutral500,
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: _buildSourceOption(
                        icon: Icons.camera_alt_rounded,
                        title: 'Kamera',
                        subtitle: 'Ambil foto langsung',
                        color: const Color(0xFF0284C7),
                        onTap: () async {
                          final file = await pickFromCamera();
                          if (sheetContext.mounted) {
                            Navigator.pop(sheetContext, file);
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: _buildSourceOption(
                        icon: Icons.photo_library_rounded,
                        title: 'Galeri',
                        subtitle: 'Pilih dari memori',
                        color: const Color(0xFF10B981),
                        onTap: () async {
                          final file = await pickFromGallery();
                          if (sheetContext.mounted) {
                            Navigator.pop(sheetContext, file);
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSourceOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.neutral900,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 11,
                color: AppColors.neutral500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
