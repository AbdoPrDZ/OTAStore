import React from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton, AppModal, AppText } from './ui';
import { openInstallSettings } from '@/utils/installer';

export type InstallPermissionModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default ({ visible, onClose }: InstallPermissionModalProps) => {
  const { t } = useTranslation();

  return (
    <AppModal
      visible={visible}
      title={t('detail.installPermissionTitle')}
      onClose={onClose}
    >
      <AppText variant="secondary" color="secondary" style={styles.text}>
        {t('detail.installPermissionMessage')}
      </AppText>
      <AppButton
        title={t('detail.openSettings')}
        icon="cog-outline"
        onPress={async () => {
          await openInstallSettings();
          onClose();
        }}
        style={styles.action}
      />
      <AppButton
        variant="ghost"
        title={t('common.cancel')}
        onPress={onClose}
      />
    </AppModal>
  );
};

const styles = StyleSheet.create({
  text: {
    marginBottom: 16,
  },
  action: {
    marginBottom: 8,
  },
});
