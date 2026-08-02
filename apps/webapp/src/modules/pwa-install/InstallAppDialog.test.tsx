import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { InstallAppDialog } from './InstallAppDialog';
import { PwaInstallContext, type PwaInstallContextValue } from './PwaInstallContext';
import type { InstallPlatform } from './types';

function renderDialog(platform: InstallPlatform = 'ios-safari') {
  const value: PwaInstallContextValue = {
    platform,
    isInstalled: false,
    canNativeInstall: false,
    isReady: true,
    dialogOpen: true,
    setDialogOpen: vi.fn(),
    promptInstall: vi.fn().mockResolvedValue(undefined),
  };
  return render(
    <PwaInstallContext.Provider value={value}>
      <InstallAppDialog />
    </PwaInstallContext.Provider>
  );
}

describe('InstallAppDialog', () => {
  it('keeps all three tab panels mounted when switching tabs (no height collapse)', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(screen.getByRole('tab', { name: 'iOS' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Android' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Desktop' })).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="tabs-content"]')).toHaveLength(3);

    await user.click(screen.getByRole('tab', { name: 'Android' }));

    expect(document.querySelectorAll('[data-slot="tabs-content"]')).toHaveLength(3);
    expect(screen.getByText(/PWA installation on iOS requires Safari/)).toBeInTheDocument();
  });
});
