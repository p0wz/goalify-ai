import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app_strings_tr.dart';
import 'app_strings_en.dart';

/// Supported languages
enum AppLanguage { turkish, english }

/// Localization strings provider
class AppStrings {
  final AppLanguage language;

  AppStrings({this.language = AppLanguage.turkish});

  // General
  String get appName => language == AppLanguage.english
      ? AppStringsEn.appName
      : AppStringsTr.appName;
  String get ok =>
      language == AppLanguage.english ? AppStringsEn.ok : AppStringsTr.ok;
  String get cancel => language == AppLanguage.english
      ? AppStringsEn.cancel
      : AppStringsTr.cancel;
  String get save =>
      language == AppLanguage.english ? AppStringsEn.save : AppStringsTr.save;
  String get delete => language == AppLanguage.english
      ? AppStringsEn.delete
      : AppStringsTr.delete;
  String get edit =>
      language == AppLanguage.english ? AppStringsEn.edit : AppStringsTr.edit;
  String get loading => language == AppLanguage.english
      ? AppStringsEn.loading
      : AppStringsTr.loading;
  String get error =>
      language == AppLanguage.english ? AppStringsEn.error : AppStringsTr.error;
  String get success => language == AppLanguage.english
      ? AppStringsEn.success
      : AppStringsTr.success;
  String get retry =>
      language == AppLanguage.english ? AppStringsEn.retry : AppStringsTr.retry;

  // Auth
  String get login =>
      language == AppLanguage.english ? AppStringsEn.login : AppStringsTr.login;
  String get register => language == AppLanguage.english
      ? AppStringsEn.register
      : AppStringsTr.register;
  String get logout => language == AppLanguage.english
      ? AppStringsEn.logout
      : AppStringsTr.logout;
  String get email =>
      language == AppLanguage.english ? AppStringsEn.email : AppStringsTr.email;
  String get password => language == AppLanguage.english
      ? AppStringsEn.password
      : AppStringsTr.password;
  String get name =>
      language == AppLanguage.english ? AppStringsEn.name : AppStringsTr.name;
  String get forgotPassword => language == AppLanguage.english
      ? AppStringsEn.forgotPassword
      : AppStringsTr.forgotPassword;
  String get noAccount => language == AppLanguage.english
      ? AppStringsEn.noAccount
      : AppStringsTr.noAccount;
  String get hasAccount => language == AppLanguage.english
      ? AppStringsEn.hasAccount
      : AppStringsTr.hasAccount;
  String get loginTitle => language == AppLanguage.english
      ? AppStringsEn.loginTitle
      : AppStringsTr.loginTitle;
  String get loginSubtitle => language == AppLanguage.english
      ? AppStringsEn.loginSubtitle
      : AppStringsTr.loginSubtitle;
  String get registerTitle => language == AppLanguage.english
      ? AppStringsEn.registerTitle
      : AppStringsTr.registerTitle;
  String get logoutConfirm => language == AppLanguage.english
      ? AppStringsEn.logoutConfirm
      : AppStringsTr.logoutConfirm;

  // Validation
  String get emailRequired => language == AppLanguage.english
      ? AppStringsEn.emailRequired
      : AppStringsTr.emailRequired;
  String get emailInvalid => language == AppLanguage.english
      ? AppStringsEn.emailInvalid
      : AppStringsTr.emailInvalid;
  String get passwordRequired => language == AppLanguage.english
      ? AppStringsEn.passwordRequired
      : AppStringsTr.passwordRequired;
  String get passwordTooShort => language == AppLanguage.english
      ? AppStringsEn.passwordTooShort
      : AppStringsTr.passwordTooShort;
  String get nameRequired => language == AppLanguage.english
      ? AppStringsEn.nameRequired
      : AppStringsTr.nameRequired;

  // Navigation
  String get home =>
      language == AppLanguage.english ? AppStringsEn.home : AppStringsTr.home;
  String get bets =>
      language == AppLanguage.english ? AppStringsEn.bets : AppStringsTr.bets;
  String get profile => language == AppLanguage.english
      ? AppStringsEn.profile
      : AppStringsTr.profile;
  String get settings => language == AppLanguage.english
      ? AppStringsEn.settings
      : AppStringsTr.settings;
  String get notifications => language == AppLanguage.english
      ? AppStringsEn.notifications
      : AppStringsTr.notifications;
  String get premium => language == AppLanguage.english
      ? AppStringsEn.premium
      : AppStringsTr.premium;

  // Dashboard
  String get welcome => language == AppLanguage.english
      ? AppStringsEn.welcome
      : AppStringsTr.welcome;
  String get todayPredictions => language == AppLanguage.english
      ? AppStringsEn.todayPredictions
      : AppStringsTr.todayPredictions;
  String get totalPredictions => language == AppLanguage.english
      ? AppStringsEn.totalPredictions
      : AppStringsTr.totalPredictions;
  String get successRate => language == AppLanguage.english
      ? AppStringsEn.successRate
      : AppStringsTr.successRate;
  String get pending => language == AppLanguage.english
      ? AppStringsEn.pending
      : AppStringsTr.pending;
  String get won =>
      language == AppLanguage.english ? AppStringsEn.won : AppStringsTr.won;
  String get quickActions => language == AppLanguage.english
      ? AppStringsEn.quickActions
      : AppStringsTr.quickActions;
  String get recentActivity => language == AppLanguage.english
      ? AppStringsEn.recentActivity
      : AppStringsTr.recentActivity;
  String get viewAll => language == AppLanguage.english
      ? AppStringsEn.viewAll
      : AppStringsTr.viewAll;

  // Bets
  String get pendingBets => language == AppLanguage.english
      ? AppStringsEn.pendingBets
      : AppStringsTr.pendingBets;
  String get settledBets => language == AppLanguage.english
      ? AppStringsEn.settledBets
      : AppStringsTr.settledBets;
  String get noPendingBets => language == AppLanguage.english
      ? AppStringsEn.noPendingBets
      : AppStringsTr.noPendingBets;
  String get noSettledBets => language == AppLanguage.english
      ? AppStringsEn.noSettledBets
      : AppStringsTr.noSettledBets;
  String get prediction => language == AppLanguage.english
      ? AppStringsEn.prediction
      : AppStringsTr.prediction;
  String get odds =>
      language == AppLanguage.english ? AppStringsEn.odds : AppStringsTr.odds;
  String get score =>
      language == AppLanguage.english ? AppStringsEn.score : AppStringsTr.score;

  // Profile
  String get loginToProfile => language == AppLanguage.english
      ? AppStringsEn.loginToProfile
      : AppStringsTr.loginToProfile;
  String get loginToProfileSubtitle => language == AppLanguage.english
      ? AppStringsEn.loginToProfileSubtitle
      : AppStringsTr.loginToProfileSubtitle;
  String get freePlan => language == AppLanguage.english
      ? AppStringsEn.freePlan
      : AppStringsTr.freePlan;
  String get proPlan => language == AppLanguage.english
      ? AppStringsEn.proPlan
      : AppStringsTr.proPlan;

  // Status
  String get statusWon => language == AppLanguage.english
      ? AppStringsEn.statusWon
      : AppStringsTr.statusWon;
  String get statusLost => language == AppLanguage.english
      ? AppStringsEn.statusLost
      : AppStringsTr.statusLost;
  String get statusPending => language == AppLanguage.english
      ? AppStringsEn.statusPending
      : AppStringsTr.statusPending;
  String get statusRefund => language == AppLanguage.english
      ? AppStringsEn.statusRefund
      : AppStringsTr.statusRefund;

  // Settings
  String get language_ => language == AppLanguage.english
      ? AppStringsEn.language
      : AppStringsTr.language;
  String get theme =>
      language == AppLanguage.english ? AppStringsEn.theme : AppStringsTr.theme;
  String get darkMode => language == AppLanguage.english
      ? AppStringsEn.darkMode
      : AppStringsTr.darkMode;
  String get lightMode => language == AppLanguage.english
      ? AppStringsEn.lightMode
      : AppStringsTr.lightMode;
  String get help =>
      language == AppLanguage.english ? AppStringsEn.help : AppStringsTr.help;
  String get about =>
      language == AppLanguage.english ? AppStringsEn.about : AppStringsTr.about;

  // Errors
  String get connectionError => language == AppLanguage.english
      ? AppStringsEn.connectionError
      : AppStringsTr.connectionError;
  String get loginFailed => language == AppLanguage.english
      ? AppStringsEn.loginFailed
      : AppStringsTr.loginFailed;
  String get registerFailed => language == AppLanguage.english
      ? AppStringsEn.registerFailed
      : AppStringsTr.registerFailed;
  String get noData => language == AppLanguage.english
      ? AppStringsEn.noData
      : AppStringsTr.noData;
}

/// Language provider
final languageProvider = StateProvider<AppLanguage>(
  (ref) => AppLanguage.turkish,
);

/// Strings provider
final stringsProvider = Provider<AppStrings>((ref) {
  final language = ref.watch(languageProvider);
  return AppStrings(language: language);
});
