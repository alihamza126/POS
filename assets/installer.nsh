; ============================================================
; A POS System - Custom NSIS Installer Script (installer.nsh)
; Developer: AH Developer | Contact: +92 303 782 8419
; This file is included by electron-builder's NSIS installer.
; ============================================================

; ---- Custom Welcome Page Text ----
!define MUI_WELCOMEPAGE_TITLE "Welcome to A POS System Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of A POS System.$\r$\n$\r$\nA POS System is an offline-first Point of Sale and Inventory Management solution built for retail and wholesale businesses.$\r$\n$\r$\n$\r$\n\
Key Features:$\r$\n\
  \u2022 Offline-first - works without internet$\r$\n\
  \u2022 Invoice & receipt generation$\r$\n\
  \u2022 Inventory & stock management$\r$\n\
  \u2022 Customer & supplier ledgers$\r$\n\
  \u2022 Cloud sync with Supabase$\r$\n$\r$\n\
$\r$\nClick Next to continue."

; ---- Custom Finish Page Text ----
!define MUI_FINISHPAGE_TITLE "A POS System Installation Complete"
!define MUI_FINISHPAGE_TEXT "A POS System has been successfully installed on your computer.$\r$\n$\r$\n\
For support and assistance:$\r$\n\
  Phone / WhatsApp: +92 303 782 8419$\r$\n\
  Developer: AH Developer$\r$\n$\r$\n\
Click Finish to launch the application."

; ---- Uninstaller Welcome Text ----
!define MUI_UNWELCOMEPAGE_TITLE "Uninstall A POS System"
!define MUI_UNWELCOMEPAGE_TEXT "This wizard will uninstall A POS System from your computer.$\r$\n$\r$\n\
Note: Your local business data (SQLite database) will NOT be deleted.$\r$\n\
You can find your data in the AppData folder if needed.$\r$\n$\r$\n\
Click Next to continue."

; ---- Abort Warning ----
!define MUI_ABORTWARNING
!define MUI_ABORTWARNING_TEXT "Are you sure you want to abort the installation of A POS System?"

; ---- Header Branding ----
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_RIGHT

; ---- After Install: Registry info for Add/Remove Programs ----
!macro customInstall
  WriteRegStr HKCU "Software\AHDeveloper\APOSSystem" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\AHDeveloper\APOSSystem" "Version" "1.0.0"
  WriteRegStr HKCU "Software\AHDeveloper\APOSSystem" "Developer" "AH Developer"
  WriteRegStr HKCU "Software\AHDeveloper\APOSSystem" "Support" "+92 303 782 8419"
!macroend

; ---- On Uninstall: Clean registry ----
!macro customUnInstall
  DeleteRegKey HKCU "Software\AHDeveloper\APOSSystem"
!macroend
