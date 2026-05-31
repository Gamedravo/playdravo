import { useState } from 'react';

export type AccountSettingsView = 'main' | 'email' | 'logout-all' | 'delete' | 'notifications' | 'privacy';

export function useModals() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isBugReportModalOpen, setIsBugReportModalOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [accountSettingsView, setAccountSettingsView] = useState<AccountSettingsView>('main');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitModModalOpen, setIsSubmitModModalOpen] = useState(false);
  const [isGameRequestModalOpen, setIsGameRequestModalOpen] = useState(false);

  const openAccountSettings = (view: AccountSettingsView = 'main') => {
    setAccountSettingsView(view);
    setIsAccountSettingsOpen(true);
  };

  return {
    isCommandPaletteOpen, setIsCommandPaletteOpen,
    isHelpCenterOpen, setIsHelpCenterOpen,
    isStatusModalOpen, setIsStatusModalOpen,
    isSupportModalOpen, setIsSupportModalOpen,
    isLegalModalOpen, setIsLegalModalOpen,
    isPreferencesModalOpen, setIsPreferencesModalOpen,
    isReportModalOpen, setIsReportModalOpen,
    isLoginModalOpen, setIsLoginModalOpen,
    isUsernameModalOpen, setIsUsernameModalOpen,
    isBugReportModalOpen, setIsBugReportModalOpen,
    isAccountSettingsOpen, setIsAccountSettingsOpen,
    accountSettingsView, setAccountSettingsView,
    openAccountSettings,
    isProfileDropdownOpen, setIsProfileDropdownOpen,
    isSubmitModalOpen, setIsSubmitModalOpen,
    isSubmitModModalOpen, setIsSubmitModModalOpen,
    isGameRequestModalOpen, setIsGameRequestModalOpen,
  };
}
