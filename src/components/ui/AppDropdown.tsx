import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { radius, spacing, useTheme } from '@/theme';
import AppSearchBar from './AppSearchBar';
import AppText from './AppText';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

export type AppDropdownItem = {
  value: string;
  label: string;
};

export type AppDropdownProps = {
  label?: string;
  placeholder: string;
  items: AppDropdownItem[];
  selectedValue?: string | null;
  onSelect: (value: string) => void;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
  searchable?: boolean;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  style?: StyleProp<ViewStyle>;
};

type DropdownCoords = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default ({
  label,
  placeholder,
  items,
  selectedValue,
  onSelect,
  error,
  loading = false,
  disabled = false,
  title,
  searchable = false,
  icon,
  style,
}: AppDropdownProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<DropdownCoords | null>(null);
  const fieldRef = useRef<React.ElementRef<typeof View>>(null);

  const selectedItem = items.find(item => item.value === selectedValue);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return items;
    }

    return items.filter(item => item.label.toLowerCase().includes(q));
  }, [items, query]);

  const openDropdown = () => {
    if (disabled) {
      return;
    }
    fieldRef.current?.measureInWindow((x, y, width, height) => {
      setCoords({ x, y, width, height });
      setOpen(true);
    });
  };

  const closeDropdown = () => {
    setOpen(false);
    setQuery('');
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    closeDropdown();
  };

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <AppText variant="secondary" color="secondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View ref={fieldRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={openDropdown}
          style={({ pressed }) => [
            styles.field,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.error : colors.border,
              borderRadius: radius.control,
              opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
            },
          ]}
        >
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={colors.textSecondary}
              style={styles.fieldIcon}
            />
          ) : null}
          <AppText
            variant="body"
            color={selectedItem ? 'text' : 'disabled'}
            numberOfLines={1}
            style={styles.fieldText}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </AppText>
          <MaterialCommunityIcons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
            style={styles.chevron}
          />
        </Pressable>
      </View>
      {error ? (
        <AppText variant="secondary" color="error" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      {open && coords ? (
        <Modal
          visible
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={closeDropdown}
        >
          <Pressable style={styles.overlay} onPress={closeDropdown}>
            <Pressable
              onPress={() => {}}
              style={[
                styles.dropdown,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  left: coords.x,
                  top: coords.y + coords.height + 4,
                  width: coords.width,
                },
              ]}
            >
              {title ? (
                <View style={styles.header}>
                  <AppText variant="sectionTitle">{title}</AppText>
                </View>
              ) : null}
              {searchable ? (
                <AppSearchBar
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t('ui.searchPlaceholder')}
                  style={styles.search}
                />
              ) : null}
              {loading ? (
                <LoadingState />
              ) : filteredItems.length === 0 ? (
                <EmptyState
                  title={t('ui.noOptionsTitle')}
                  description={t('ui.noOptionsDescription')}
                />
              ) : (
                <FlatList
                  data={filteredItems}
                  keyExtractor={item => item.value}
                  initialNumToRender={12}
                  style={styles.list}
                  renderItem={({ item }) => {
                    const isSelected = item.value === selectedValue;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => handleSelect(item.value)}
                        style={({ pressed }) => [
                          styles.option,
                          pressed && styles.optionPressed,
                        ]}
                      >
                        <AppText
                          variant="body"
                          color={isSelected ? 'primary' : 'text'}
                          bold={isSelected}
                          style={styles.optionText}
                          numberOfLines={2}
                        >
                          {item.label}
                        </AppText>
                        {isSelected ? (
                          <MaterialCommunityIcons
                            name="check"
                            size={22}
                            color={colors.primary}
                            style={styles.check}
                          />
                        ) : null}
                      </Pressable>
                    );
                  }}
                />
              )}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  fieldIcon: {
    marginRight: spacing.sm,
  },
  fieldText: {
    flex: 1,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  error: {
    marginTop: spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  dropdown: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: radius.card,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 360,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  search: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    maxHeight: 280,
    paddingHorizontal: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: spacing.md,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionText: {
    flex: 1,
  },
  check: {
    marginLeft: spacing.sm,
  },
});
