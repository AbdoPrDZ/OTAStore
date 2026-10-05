import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './ui';

export type AppLogoProps = {
  name: string;
  logoUrl?: string | null;
  size?: number;
  circular?: boolean;
};

export default ({ name, logoUrl, size = 48, circular = false }: AppLogoProps) => {
  const { colors, radius } = useTheme();

  const shared = {
    width: size,
    height: size,
    borderRadius: circular ? size / 2 : radius.control,
    borderWidth: 1,
    borderColor: colors.border,
  };

  if (logoUrl) {
    return (
      <Image source={{ uri: logoUrl }} style={shared} resizeMode="cover" />
    );
  }

  return (
    <View style={[styles.fallback, shared, { backgroundColor: colors.primarySoft }]}>
      <AppText
        variant="sectionTitle"
        color="primary"
        style={{ fontSize: size / 2.4 }}
      >
        {name.slice(0, 1).toUpperCase()}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
