import React, { type ReactNode, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { Input } from '@actual-app/components/input';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { tokens } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { listen } from 'loot-core/platform/client/fetch';
import { isElectron } from 'loot-core/shared/environment';

import { AuthSettings } from './AuthSettings';
import { Backups } from './Backups';
import { BudgetTypeSettings } from './BudgetTypeSettings';
import { CurrencySettings } from './Currency';
import { EncryptionSettings } from './Encryption';
import { ExperimentalFeatures } from './Experimental';
import { ExportBudget } from './Export';
import { FormatSettings } from './Format';
import { LanguageSettings } from './LanguageSettings';
import { RepairTransactions } from './RepairTransactions';
import { ResetCache, ResetSync } from './Reset';
import { ThemeSettings } from './Themes';
import { AdvancedToggle, Setting } from './UI';

import { closeBudget } from '@desktop-client/budgets/budgetsSlice';
import { Link } from '@desktop-client/components/common/Link';
import { FormField, FormLabel } from '@desktop-client/components/forms';
import { MOBILE_NAV_HEIGHT } from '@desktop-client/components/mobile/MobileNavTabs';
import { Page } from '@desktop-client/components/Page';
import { useServerVersion } from '@desktop-client/components/ServerContext';
import { useFeatureFlag } from '@desktop-client/hooks/useFeatureFlag';
import { useGlobalPref } from '@desktop-client/hooks/useGlobalPref';
import {
  useIsOutdated,
  useLatestVersion,
} from '@desktop-client/hooks/useLatestVersion';
import { useMetadataPref } from '@desktop-client/hooks/useMetadataPref';
import { useSyncedPref } from '@desktop-client/hooks/useSyncedPref';
import { loadPrefs } from '@desktop-client/prefs/prefsSlice';
import { useDispatch } from '@desktop-client/redux';

function About() {
  const version = useServerVersion();
  const latestVersion = useLatestVersion();
  const isOutdated = useIsOutdated();

  return (
    <Setting>
      <Text>
        <Trans>
          <strong>Actual</strong> is a super fast privacy-focused app for
          managing your finances.
        </Trans>
      </Text>
      <View
        style={{
          flexDirection: 'column',
          gap: 10,
        }}
        className={css({
          [`@media (min-width: ${tokens.breakpoint_small})`]: {
            display: 'grid',
            gridTemplateRows: '1fr 1fr',
            gridTemplateColumns: '50% 50%',
            columnGap: '2em',
            gridAutoFlow: 'column',
          },
        })}
        data-vrt-mask
      >
        <Text>
          <Trans>
            Client version: {{ version: `v${window.Actual?.ACTUAL_VERSION}` }}
          </Trans>
        </Text>
        <Text>
          <Trans>Server version: {{ version }}</Trans>
        </Text>
        {isOutdated ? (
          <Link
            variant="external"
            to="https://actualbudget.org/docs/releases"
            linkColor="purple"
          >
            <Trans>New version available: {{ latestVersion }}</Trans>
          </Link>
        ) : (
          <Text style={{ color: theme.noticeText, fontWeight: 600 }}>
            <Trans>You’re up to date!</Trans>
          </Text>
        )}
        <Text>
          <Link
            variant="external"
            to="https://actualbudget.org/docs/releases"
            linkColor="purple"
          >
            <Trans>Release Notes</Trans>
          </Link>
        </Text>
      </View>
    </Setting>
  );
}

function IDName({ children }: { children: ReactNode }) {
  return <Text style={{ fontWeight: 500 }}>{children}</Text>;
}

function AdvancedAbout() {
  const [budgetId] = useMetadataPref('id');
  const [groupId] = useMetadataPref('groupId');

  return (
    <Setting>
      <Text>
        <Trans>
          <strong>IDs</strong> are the names Actual uses to identify your budget
          internally. There are several different IDs associated with your
          budget. The Budget ID is used to identify your budget file. The Sync
          ID is used to access the budget on the server.
        </Trans>
      </Text>
      <Text>
        <Trans>
          <IDName>Budget ID:</IDName> {{ budgetId }}
        </Trans>
      </Text>
      <Text style={{ color: theme.pageText }}>
        <Trans>
          <IDName>Sync ID:</IDName> {{ syncId: groupId || '(none)' }}
        </Trans>
      </Text>
      {/* low priority todo: eliminate some or all of these, or decide when/if to show them */}
      {/* <Text>
        <IDName>Cloud File ID:</IDName> {prefs.cloudFileId || '(none)'}
      </Text>
      <Text>
        <IDName>User ID:</IDName> {prefs.userId || '(none)'}
      </Text> */}
    </Setting>
  );
}

export function Settings() {
  const { t } = useTranslation();
  const [floatingSidebar] = useGlobalPref('floatingSidebar');
  const [budgetName] = useMetadataPref('budgetName');
  const dispatch = useDispatch();
  const isCurrencyExperimentalEnabled = useFeatureFlag('currency');
  const [_, setDefaultCurrencyCodePref] = useSyncedPref('defaultCurrencyCode');

  const onCloseBudget = () => {
    dispatch(closeBudget());
  };

  useEffect(() => {
    const unlisten = listen('prefs-updated', () => {
      dispatch(loadPrefs());
    });

    dispatch(loadPrefs());
    return () => unlisten();
  }, [dispatch]);

  useEffect(() => {
    if (!isCurrencyExperimentalEnabled) {
      setDefaultCurrencyCodePref('');
    }
  }, [isCurrencyExperimentalEnabled, setDefaultCurrencyCodePref]);

  const { isNarrowWidth } = useResponsive();

  return (
    <Page
      header={t('Settings')}
      style={{
        marginInline: floatingSidebar && !isNarrowWidth ? 'auto' : 0,
      }}
    >
      <View
        data-testid="settings"
        style={{
          marginTop: 10,
          flexShrink: 0,
          maxWidth: 530,
          gap: 30,
          paddingBottom: MOBILE_NAV_HEIGHT,
        }}
      >
        {isNarrowWidth && (
          <View
            style={{ gap: 10, flexDirection: 'row', alignItems: 'flex-end' }}
          >
            {/* The only spot to close a budget on mobile */}
            <FormField>
              <FormLabel title={t('Budget name')} />
              <Input
                value={budgetName}
                disabled
                style={{ color: theme.buttonNormalDisabledText }}
              />
            </FormField>
            <Button onPress={onCloseBudget}>
              <Trans>Switch file</Trans>
            </Button>
          </View>
        )}
        <About />
        <ThemeSettings />
        <FormatSettings />
        {isCurrencyExperimentalEnabled && <CurrencySettings />}
        <LanguageSettings />
        <AuthSettings />
        <EncryptionSettings />
        <BudgetTypeSettings />
        {isElectron() && <Backups />}
        <ExportBudget />
        <AdvancedToggle>
          <AdvancedAbout />
          <ResetCache />
          <ResetSync />
          <RepairTransactions />
          <ExperimentalFeatures />
        </AdvancedToggle>
      </View>
    </Page>
  );
}
