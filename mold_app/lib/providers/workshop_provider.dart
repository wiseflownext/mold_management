import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/workshop.dart';
import '../services/workshop_service.dart';

final workshopListProvider =
    FutureProvider<List<Workshop>>((ref) => WorkshopService.instance.getList());
