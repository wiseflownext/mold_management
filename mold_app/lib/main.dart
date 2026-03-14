import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'services/api_client.dart';
import 'app.dart';

const _sentryDsn = String.fromEnvironment('SENTRY_DSN', defaultValue: '');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  ApiClient.instance.init();

  if (_sentryDsn.isNotEmpty) {
    await SentryFlutter.init(
      (options) {
        options.dsn = _sentryDsn;
        options.tracesSampleRate = 0.2;
        options.environment = const String.fromEnvironment('ENV', defaultValue: 'debug');
      },
      appRunner: () => runApp(const ProviderScope(child: MoldApp())),
    );
  } else {
    runApp(const ProviderScope(child: MoldApp()));
  }
}
