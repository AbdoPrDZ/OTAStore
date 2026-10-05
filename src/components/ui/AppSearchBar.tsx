import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { radius, spacing, useTheme } from '@/theme';

export type AppSearchBarProps = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  value?: string;
  onChangeText?: (text: string) => void;
  onDebounced?: (text: string) => void;
  debounceMs?: number;
};

export default ({
  value,
  onChangeText,
  onDebounced,
  debounceMs = 400,
  placeholder,
  style,
  ...rest
}: AppSearchBarProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState(value ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value ?? '');
  }, [value]);

  useEffect(() => {
    if (!onDebounced) {
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onDebounced(query);
    }, debounceMs);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs, onDebounced]);

  const handleChangeText = (text: string) => {
    setQuery(text);
    onChangeText?.(text);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.control,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={colors.textSecondary}
        style={styles.icon}
      />
      <TextInput
        value={query}
        onChangeText={handleChangeText}
        placeholder={placeholder ?? t('ui.searchPlaceholder')}
        placeholderTextColor={colors.disabled}
        style={[styles.input, { color: colors.text }]}
        {...rest}
      />
      {query.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('ui.clearSearchA11y')}
          hitSlop={spacing.sm}
          onPress={() => handleChangeText('')}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color={colors.textSecondary}
            style={styles.clear}
          />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  clear: {
    marginLeft: spacing.sm,
  },
});
