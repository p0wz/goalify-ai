import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

/// RevenueCat Service - Manages in-app purchases
class RevenueCatService {
  static final RevenueCatService _instance = RevenueCatService._internal();
  factory RevenueCatService() => _instance;
  RevenueCatService._internal();

  // RevenueCat API Keys
  static const String _apiKeyiOS = 'test_RQdELQKOakZSwpDoukCdlobZGwz';
  static const String _apiKeyAndroid = 'test_RQdELQKOakZSwpDoukCdlobZGwz';

  // Entitlement ID (set this in RevenueCat dashboard)
  static const String entitlementId = 'pro';

  bool _isInitialized = false;
  CustomerInfo? _customerInfo;

  /// Initialize RevenueCat SDK
  Future<void> initialize({String? userId}) async {
    if (_isInitialized) return;

    try {
      final apiKey = Platform.isIOS ? _apiKeyiOS : _apiKeyAndroid;

      final configuration = PurchasesConfiguration(apiKey);
      if (userId != null) {
        configuration.appUserID = userId;
      }

      await Purchases.configure(configuration);
      _isInitialized = true;

      // Fetch initial customer info
      await refreshCustomerInfo();

      debugPrint('[RevenueCat] Initialized successfully');
    } catch (e) {
      debugPrint('[RevenueCat] Init error: $e');
    }
  }

  /// Refresh customer info from RevenueCat
  Future<CustomerInfo?> refreshCustomerInfo() async {
    try {
      _customerInfo = await Purchases.getCustomerInfo();
      return _customerInfo;
    } catch (e) {
      debugPrint('[RevenueCat] Customer info error: $e');
      return null;
    }
  }

  /// Check if user has active "pro" entitlement
  bool get isPremium {
    return _customerInfo?.entitlements.active.containsKey(entitlementId) ??
        false;
  }

  /// Get all available offerings (subscription packages)
  Future<Offerings?> getOfferings() async {
    try {
      return await Purchases.getOfferings();
    } catch (e) {
      debugPrint('[RevenueCat] Offerings error: $e');
      return null;
    }
  }

  /// Purchase a package
  Future<PurchaseResult> purchasePackage(Package package) async {
    try {
      _customerInfo = await Purchases.purchasePackage(package);

      if (isPremium) {
        return PurchaseResult.success;
      } else {
        return PurchaseResult.failed;
      }
    } on PurchasesErrorCode catch (e) {
      if (e == PurchasesErrorCode.purchaseCancelledError) {
        return PurchaseResult.cancelled;
      }
      debugPrint('[RevenueCat] Purchase error: $e');
      return PurchaseResult.failed;
    } catch (e) {
      debugPrint('[RevenueCat] Purchase error: $e');
      return PurchaseResult.failed;
    }
  }

  /// Restore previous purchases
  Future<bool> restorePurchases() async {
    try {
      _customerInfo = await Purchases.restorePurchases();
      return isPremium;
    } catch (e) {
      debugPrint('[RevenueCat] Restore error: $e');
      return false;
    }
  }

  /// Login with user ID (for syncing across devices)
  Future<void> login(String userId) async {
    try {
      final result = await Purchases.logIn(userId);
      _customerInfo = result.customerInfo;
      debugPrint('[RevenueCat] Logged in: $userId');
    } catch (e) {
      debugPrint('[RevenueCat] Login error: $e');
    }
  }

  /// Logout user
  Future<void> logout() async {
    try {
      _customerInfo = await Purchases.logOut();
      debugPrint('[RevenueCat] Logged out');
    } catch (e) {
      debugPrint('[RevenueCat] Logout error: $e');
    }
  }
}

/// Purchase result enum
enum PurchaseResult { success, cancelled, failed }
