import React, { Suspense, lazy } from 'react';
import { UserProfile, Game } from '../types';
import { type ReplitUser } from '../hooks/useReplitAuth';
import { AccountSettingsView } from '../hooks/useModals';

const CombinedGameModal = lazy(() =>
  import('./modals/CombinedGameModal').then((m) => ({ default: m.CombinedGameModal }))
);
const SubmitModModal = lazy(() =>
  import('./modals/SubmitModModal').then((m) => ({ default: m.SubmitModModal }))
);
const GameRequestModal = lazy(() =>
  import('./modals/GameRequestModal').then((m) => ({ default: m.GameRequestModal }))
);
const AccountSettingsModal = lazy(() =>
  import('./AccountSettingsModal').then((m) => ({ default: m.AccountSettingsModal }))
);
const SupportModal = lazy(() =>
  import('./modals/SupportModal').then((m) => ({ default: m.SupportModal }))
);
const SystemStatusModal = lazy(() =>
  import('./modals/SystemStatusModal').then((m) => ({ default: m.SystemStatusModal }))
);
const LegalModal = lazy(() =>
  import('./modals/LegalModal').then((m) => ({ default: m.LegalModal }))
);
const GameIssueReportModal = lazy(() =>
  import('./modals/GameIssueReportModal').then((m) => ({ default: m.GameIssueReportModal }))
);
const LoginModal = lazy(() =>
  import('./LoginModal').then((m) => ({ default: m.LoginModal }))
);
const UsernameSetupModal = lazy(() =>
  import('./UsernameSetupModal').then((m) => ({ default: m.UsernameSetupModal }))
);
const BugReportModal = lazy(() =>
  import('./modals/BugReportModal').then((m) => ({ default: m.BugReportModal }))
);

interface GlobalModalsProps {
  modalsState: any;
  user: ReplitUser | null;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  legalContent: { title: string; content: string };
  isDarkMode: boolean;
  t: (key: string) => string;
  activeGame: Game | null;
  accountSettingsView: AccountSettingsView;
}

function ModalSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
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
        <ModalSuspense>
          <CombinedGameModal
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            isDarkMode={isDarkMode}
            t={t}
            user={user as any}
            userProfile={userProfile}
          />
        </ModalSuspense>
      )}

      {isSubmitModModalOpen && (
        <ModalSuspense>
          <SubmitModModal
            isOpen={isSubmitModModalOpen}
            onClose={() => setIsSubmitModModalOpen(false)}
            isDarkMode={isDarkMode}
            t={t}
            user={user as any}
            activeGame={activeGame}
          />
        </ModalSuspense>
      )}

      {isGameRequestModalOpen && (
        <ModalSuspense>
          <GameRequestModal
            isOpen={isGameRequestModalOpen}
            onClose={() => setIsGameRequestModalOpen(false)}
            isDarkMode={isDarkMode}
            t={t}
            user={user as any}
          />
        </ModalSuspense>
      )}

      {isAccountSettingsOpen && (
        <ModalSuspense>
          <AccountSettingsModal
            isOpen={isAccountSettingsOpen}
            onClose={() => setIsAccountSettingsOpen(false)}
            user={user}
            isDarkMode={isDarkMode}
            t={t}
            initialView={accountSettingsView}
            onEditUsername={() => {
              setIsAccountSettingsOpen(false);
              setIsUsernameModalOpen(true);
            }}
          />

        </ModalSuspense>
      )}

      {isSupportModalOpen && (
        <ModalSuspense>
          <SupportModal
            isOpen={isSupportModalOpen}
            onClose={() => setIsSupportModalOpen(false)}
            isDarkMode={isDarkMode}
            t={t}
          />
        </ModalSuspense>
      )}

      {isStatusModalOpen && (
        <ModalSuspense>
          <SystemStatusModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            isDarkMode={isDarkMode}
            t={t}
          />
        </ModalSuspense>
      )}

      {isLegalModalOpen && (
        <ModalSuspense>
          <LegalModal
            isOpen={isLegalModalOpen}
            onClose={() => setIsLegalModalOpen(false)}
            isDarkMode={isDarkMode}
            t={t}
            legalContent={legalContent}
          />
        </ModalSuspense>
      )}

      {isReportModalOpen && activeGame && (
        <ModalSuspense>
          <GameIssueReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            isDarkMode={isDarkMode}
            t={t}
            activeGame={activeGame}
            user={user}
          />
        </ModalSuspense>
      )}

      {isLoginModalOpen && (
        <ModalSuspense>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            isDarkMode={isDarkMode}
            t={t}
          />
        </ModalSuspense>
      )}

      {isUsernameModalOpen && user && (
        <ModalSuspense>
          <UsernameSetupModal
            isOpen={isUsernameModalOpen}
            onClose={() => setIsUsernameModalOpen(false)}
            userId={user.id}
            onComplete={(newUsername) => {
              const localProfileKey = `gamedravo:userProfile:${user.id}`;
              const existingLocalProfile = JSON.parse(localStorage.getItem(localProfileKey) || 'null') || {};
              localStorage.setItem(
                localProfileKey,
                JSON.stringify({ ...existingLocalProfile, displayName: newUsername, username: newUsername, usernameSet: true })
              );
              setUserProfile((prev) =>
                prev ? { ...prev, displayName: newUsername, username: newUsername, usernameSet: true } : prev
              );
              setIsUsernameModalOpen(false);
            }}
            isDarkMode={isDarkMode}
          />

        </ModalSuspense>
      )}

      {isBugReportModalOpen && (
        <ModalSuspense>
          <BugReportModal
            isOpen={isBugReportModalOpen}
            onClose={() => setIsBugReportModalOpen(false)}
            isDarkMode={isDarkMode}
            t={t}
            user={user}
          />
        </ModalSuspense>
      )}
    </>
  );
}
