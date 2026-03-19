import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthState {
  final User? user;
  final bool isLoading;

  AuthState({this.user, this.isLoading = false});
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState()) {
    checkAuth();
  }

  final _auth = AuthService.instance;

  Future<void> login(String companyCode, String username, String password) async {
    state = AuthState(isLoading: true);
    try {
      final res = await _auth.login(companyCode, username, password);
      state = AuthState(user: res.user);
    } catch (_) {
      state = AuthState();
      rethrow;
    }
  }

  Future<void> logout() async {
    await _auth.logout();
    state = AuthState();
  }

  Future<void> checkAuth() async {
    state = AuthState(isLoading: true);
    try {
      final ok = await _auth.isLoggedIn();
      if (ok) {
        final user = await _auth.getStoredUser();
        state = AuthState(user: user);
      } else {
        state = AuthState();
      }
    } catch (_) {
      state = AuthState();
    }
  }
}

final authStateProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());
