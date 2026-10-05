import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { radius, spacing, useTheme } from '@/theme';
import AppText from './AppText';

export type AppModalProps = {
  visible: boolean;
  title?: string;
  onClose?: () => void;
  children: ReactNode;
};

export default ({ visible, title, onClose, children }: AppModalProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          onPress={() => {}}
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {title ? (
            <View style={styles.header}>
              <AppText variant="sectionTitle" style={styles.headerTitle}>
                {title}
              </AppText>
              {onClose ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.close')}
                  hitSlop={spacing.sm}
                  onPress={onClose}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color={colors.textSecondary}
                  />
                </Pressable>
              ) : null}
            </View>
          ) : null}
          <View style={styles.body}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/** Stable id generator used by the provider-less modal helpers below. */
export const useModal = () => {
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  return { visible, open, close };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: radius.sheet,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTitle: {
    flex: 1,
  },
  body: {
    paddingHorizontal: spacing.lg,
  },
});

// Re-exported context placeholder to keep the module surface predictable.
export const ModalContext = createContext<null>(null);
export const useModalContext = () => useContext(ModalContext);
