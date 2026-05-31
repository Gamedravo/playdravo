import React from 'react';
import { SubmitGameModal } from './modals/SubmitGameModal';
import { SubmitModModal } from './modals/SubmitModModal';
import { GameRequestModal } from './modals/GameRequestModal';
import { AccountSettingsModal } from './AccountSettingsModal';
import { SupportModal } from './modals/SupportModal';
import { SystemStatusModal } from './modals/SystemStatusModal';
import { LegalModal } from './modals/LegalModal';
import { GameIssueReportModal } from './modals/GameIssueReportModal';
import { LoginModal } from './LoginModal';
import { UsernameSetupModal } from './UsernameSetupModal';
import { BugReportModal } from './modals/BugReportModal';
import { UserProfile, Game } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { AccountSettingsView } from '../hooks/useModals';

interface GlobalModalsProps {
  modalsState: any;
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  legalContent: { title: string; content: string };
  isDarkMode: boolean;
  t: (key: string) => string;
  activeGame: Game | null;
  accountSettingsView: AccountSettingsView;
}

export function GlobalModals({
  modalsState,
  user,
  userProfile,
  setUserProfile,
  legalContent,
  isDarkMode,
  t,
  activeGame,
  accountSettingsView,
}: GlobalModalsProps) {
  const {
    isStatusModalOpen, setIsStatusModalOpen,
    isSupportModalOpen, setIsSupportModalOpen,
    isLegalModalOpen, setIsLegalModalOpen,
    isReportModalOpen, setIsReportModalOpen,
    isLoginModalOpen, setIsLoginModalOpen,
    isUsernameModalOpen, setIsUsernameModalOpen,
    isBugReportModalOpen, setIsBugReportModalOpen,
    isAccountSettingsOpen, setIsAccountSettingsOpen,
    isSubmitModalOpen, setIsSubmitModalOpen,
    isSubmitModModalOpen, setIsSubmitModModalOpen,
    isGameRequestModalOpen, setIsGameRequestModalOpen,
  } = modalsState;

  return (
    <>
      {isSubmitModalOpen && (
        <SubmitGameModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
          user={user as any}
        />
      )}

      {isSubmitModModalOpen && (
        <SubmitModModal
          isOpen={isSubmitModModalOpen}
          onClose={() => setIsSubmitModModalOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
          user={user as any}
          activeGame={activeGame}
        />
      )}

      {isGameRequestModalOpen && (
        <GameRequestModal
          isOpen={isGameRequestModalOpen}
          onClose={() => setIsGameRequestModalOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
          user={user as any}
        />
      )}

      <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        user={user as any}
        isDarkMode={isDarkMode}
        t={t}
        initialView={accountSettingsView}
      />

      {isSupportModalOpen && (
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
          user={user as any}
        />
      )}

      {isStatusModalOpen && (
        <SystemStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
        />
      )}

      {isLegalModalOpen && (
        <LegalModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
          legalContent={legalContent}
        />
      )}

      {isReportModalOpen && (
        <GameIssueReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
          user={userProfile as any}
          activeGame={activeGame}
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
        />
      )}

      {isUsernameModalOpen && (
        <UsernameSetupModal
          isOpen={isUsernameModalOpen}
          onClose={() => setIsUsernameModalOpen(false)}
          userId={user?.uid || ''}
          isDarkMode={isDarkMode}
          onComplete={(newUsername) => {
            if (userProfile) {
              setUserProfile({ ...userProfile, displayName: newUsername, usernameSet: true });
            }
          }}
        />
      )}

      {isBugReportModalOpen && (
        <BugReportModal
          isOpen={isBugReportModalOpen}
          onClose={() => setIsBugReportModalOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
          user={userProfile as any}
        />
      )}
    </>
  );
}
