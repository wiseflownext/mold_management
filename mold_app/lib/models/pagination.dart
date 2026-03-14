class PaginatedResponse<T> {
  final List<T> items;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  PaginatedResponse({
    required this.items,
    required this.total,
    this.page = 1,
    this.pageSize = 10,
    this.totalPages = 1,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    final list = json['items'] as List<dynamic>? ?? json['list'] as List<dynamic>? ?? [];
    final total = (json['total'] as num?)?.toInt() ?? 0;
    final page = (json['page'] as num?)?.toInt() ?? 1;
    final pageSize = (json['pageSize'] as num?)?.toInt() ?? 10;
    return PaginatedResponse(
      items: list.map((e) => fromJsonT(e as Map<String, dynamic>)).toList(),
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: (json['totalPages'] as num?)?.toInt() ?? (pageSize > 0 ? (total / pageSize).ceil() : 1),
    );
  }

  Map<String, dynamic> toJson(Object? Function(T) toJsonT) => {
        'items': items.map((e) => toJsonT(e)).toList(),
        'total': total,
        'page': page,
        'pageSize': pageSize,
        'totalPages': totalPages,
      };
}
