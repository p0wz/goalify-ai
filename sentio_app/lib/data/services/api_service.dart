import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// API Service for SENTIO
/// Connects to the existing goalify-ai backend
class ApiService {
  static const String baseUrl = 'https://goalify-ai.onrender.com/api';

  late final Dio _dio;
  String? _authToken;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    // Add interceptor for auth token and logging
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_authToken != null) {
            options.headers['Authorization'] = 'Bearer $_authToken';
          }
          if (kDebugMode) {
            print('API Request: ${options.method} ${options.uri}');
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          if (kDebugMode) {
            print('API Response: ${response.statusCode}');
          }
          return handler.next(response);
        },
        onError: (error, handler) {
          if (kDebugMode) {
            print('API Error: ${error.message}');
          }
          return handler.next(error);
        },
      ),
    );
  }

  void setAuthToken(String? token) {
    _authToken = token;
  }

  // ============ AUTH ============

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );

      if (response.data['success'] == true) {
        _authToken = response.data['token'];
      }

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
  ) async {
    try {
      final response = await _dio.post(
        '/auth/register',
        data: {'name': name, 'email': email, 'password': password},
      );

      if (response.data['success'] == true) {
        _authToken = response.data['token'];
      }

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // ============ ANALYSIS ============

  Future<Map<String, dynamic>> getAnalysisResults() async {
    try {
      final response = await _dio.get('/analysis/results');
      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  Future<Map<String, dynamic>> runAnalysis({
    int limit = 500,
    bool leagueFilter = true,
  }) async {
    try {
      final response = await _dio.post(
        '/analysis/run',
        data: {'limit': limit, 'leagueFilter': leagueFilter},
      );
      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // ============ BETS ============

  Future<Map<String, dynamic>> getApprovedBets() async {
    try {
      final response = await _dio.get('/bets/approved');
      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  Future<Map<String, dynamic>> approveBet({
    required String matchId,
    required String homeTeam,
    required String awayTeam,
    required String league,
    required String market,
    String? odds,
    required int matchTime,
  }) async {
    try {
      final response = await _dio.post(
        '/bets/approve',
        data: {
          'matchId': matchId,
          'homeTeam': homeTeam,
          'awayTeam': awayTeam,
          'league': league,
          'market': market,
          'odds': odds,
          'matchTime': matchTime,
        },
      );
      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // ============ ERROR HANDLING ============

  Map<String, dynamic> _handleError(DioException e) {
    String message = 'Bir hata oluştu';

    if (e.response != null) {
      final data = e.response?.data;
      if (data is Map && data['error'] != null) {
        message = data['error'];
      } else if (e.response?.statusCode == 401) {
        message = 'Oturum süresi doldu';
      } else if (e.response?.statusCode == 403) {
        message = 'Bu işlem için yetkiniz yok';
      } else if (e.response?.statusCode == 404) {
        message = 'İstenen kaynak bulunamadı';
      } else if (e.response?.statusCode == 500) {
        message = 'Sunucu hatası';
      }
    } else if (e.type == DioExceptionType.connectionTimeout) {
      message = 'Bağlantı zaman aşımına uğradı';
    } else if (e.type == DioExceptionType.receiveTimeout) {
      message = 'Yanıt zaman aşımına uğradı';
    } else if (e.type == DioExceptionType.connectionError) {
      message = 'İnternet bağlantısı yok';
    }

    return {'success': false, 'error': message};
  }
}

/// Global API Service instance
final apiService = ApiService();
