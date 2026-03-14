import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/mold.dart';
import '../models/pagination.dart';
import '../services/mold_service.dart';
import '../services/home_service.dart';

final moldListParamsProvider = StateProvider<MoldListParams>((ref) => MoldListParams());

final moldListProvider = FutureProvider<PaginatedResponse<Mold>>((ref) {
  final params = ref.watch(moldListParamsProvider);
  return MoldService.instance.getList(
    params.page,
    params.pageSize,
    keyword: params.keyword,
    type: params.type,
    status: params.status,
  );
});

class MoldListNotifier extends StateNotifier<AsyncValue<({List<Mold> items, int total, bool hasMore})>> {
  MoldListNotifier(this._ref) : super(const AsyncValue.loading()) {
    load();
  }

  final Ref _ref;
  static const _pageSize = 20;
  int _page = 1;
  final List<Mold> _items = [];

  MoldListParams get _params => _ref.read(moldListParamsProvider);

  Future<void> load() async {
    state = const AsyncValue.loading();
    _page = 1;
    _items.clear();
    await _fetch();
  }

  Future<void> loadMore() async {
    if (state.valueOrNull == null || !state.value!.hasMore) return;
    _page++;
    await _fetch();
  }

  Future<void> _fetch() async {
    try {
      final res = await MoldService.instance.getList(
        _page,
        _pageSize,
        keyword: _params.keyword,
        type: _params.type,
        status: _params.status,
      );
      if (_page == 1) _items.clear();
      _items.addAll(res.items);
      final hasMore = _items.length < res.total;
      state = AsyncValue.data((
        items: List.from(_items),
        total: res.total,
        hasMore: hasMore,
      ));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final moldListNotifierProvider =
    StateNotifierProvider<MoldListNotifier, AsyncValue<({List<Mold> items, int total, bool hasMore})>>(
  (ref) => MoldListNotifier(ref),
);

class MoldListParams {
  final int page;
  final int pageSize;
  final String? keyword;
  final String? type;
  final String? status;

  MoldListParams({
    this.page = 1,
    this.pageSize = 20,
    this.keyword,
    this.type,
    this.status,
  });
}

final moldDetailProvider = FutureProvider.family<Mold, String>(
  (ref, id) => MoldService.instance.getDetail(id),
);

final moldStatisticsProvider = FutureProvider<MoldStatistics>(
  (ref) => MoldService.instance.getStatistics(),
);

final todaySummaryProvider = FutureProvider<TodaySummary>(
  (ref) => MoldService.instance.getTodaySummary(),
);

final dashboardProvider = FutureProvider<DashboardData>(
  (ref) => HomeService.instance.getDashboard(),
);
