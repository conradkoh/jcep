'use client';

import { Download } from 'lucide-react';

import { DIALOG_TAB_GROUPS, getInstructionsForPlatform } from './installInstructions';
import { InstallInstructionsPanel } from './InstallInstructionsPanel';
import type { InstallPlatform } from './types';
import { useAppDisplayName } from './useAppDisplayName';
import { usePwaInstall } from './usePwaInstall';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type DialogTab = 'ios' | 'android' | 'desktop';

const IOS_PLATFORMS: readonly InstallPlatform[] = ['ios-safari', 'ios-other'];
const ANDROID_PLATFORMS: readonly InstallPlatform[] = ['android-chrome', 'android-other'];

function tabForPlatform(platform: InstallPlatform): DialogTab {
  if (IOS_PLATFORMS.includes(platform)) return 'ios';
  if (ANDROID_PLATFORMS.includes(platform)) return 'android';
  return 'desktop';
}

export function InstallAppDialog() {
  const { platform, canNativeInstall, isReady, promptInstall, dialogOpen, setDialogOpen } =
    usePwaInstall();
  const appName = useAppDisplayName();

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Install {appName}</DialogTitle>
          <DialogDescription>
            Add {appName} to your home screen or desktop for quick access.
          </DialogDescription>
        </DialogHeader>

        {canNativeInstall && (
          <Button onClick={promptInstall} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Install {appName}
          </Button>
        )}

        {isReady && (
          <Tabs defaultValue={tabForPlatform(platform)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ios">iOS</TabsTrigger>
              <TabsTrigger value="android">Android</TabsTrigger>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
            </TabsList>
            <div className="grid">
              {(['ios', 'android', 'desktop'] as const).map((tab) => (
                <TabsContent
                  key={tab}
                  value={tab}
                  keepMounted
                  className="col-start-1 row-start-1 space-y-3 data-inactive:pointer-events-none data-inactive:invisible [&[hidden]]:block"
                >
                  {DIALOG_TAB_GROUPS[tab].map((platformKey) => (
                    <InstallInstructionsPanel
                      key={platformKey}
                      instructions={getInstructionsForPlatform(platformKey)}
                    />
                  ))}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
