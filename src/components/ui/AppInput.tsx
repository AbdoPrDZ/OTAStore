import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { radius, spacing, useTheme } from '@/theme';
import AppText from './AppText';

export type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export default ({
  label,
  error,
  style,
  secureTextEntry = false,
  editable,
  ...rest
}: AppInputProps) => {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(true);

  const isSecure = secureTextEntry && hidden;
  const isDisabled = editable === false;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <AppText variant="secondary" color="secondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.disabled}
          style={[styles.input, { color: colors.text }]}
          secureTextEntry={isSecure}
          editable={editable}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            accessibilityState={{ disabled: isDisabled }}
            disabled={isDisabled}
            hitSlop={8}
            onPress={() => setHidden(current => !current)}
          >
            <MaterialCommunityIcons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={isDisabled ? colors.disabled : colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="secondary" color="error" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.control,
    borderWidth: 1,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  error: {
    marginTop: spacing.xs,
  },
});
