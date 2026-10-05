import React from 'react';
import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import DrawerContent from '@/components/DrawerContent';
import About from '@/screens/About';
import AppDetail from '@/screens/AppDetail';
import AppReviews from '@/screens/AppReviews';
import Login from '@/screens/Login';
import MyAppsUpdates from '@/screens/MyAppsUpdates';
import Profile from '@/screens/Profile';
import Settings from '@/screens/Settings';
import Store from '@/screens/Store';
import Splash from '@/screens/Splash';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/theme';
import type { MainDrawerParamList, RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();

type DrawerIconProps = { color: string; size: number };

const StoreIcon = ({ color, size }: DrawerIconProps) => (
  <MaterialCommunityIcons name="storefront-outline" size={size} color={color} />
);
const UpdatesIcon = ({ color, size }: DrawerIconProps) => (
  <MaterialCommunityIcons name="update" size={size} color={color} />
);
const SettingsIcon = ({ color, size }: DrawerIconProps) => (
  <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
);
const ProfileIcon = ({ color, size }: DrawerIconProps) => (
  <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
);
const AboutIcon = ({ color, size }: DrawerIconProps) => (
  <MaterialCommunityIcons name="information-outline" size={size} color={color} />
);

const renderDrawerContent = (props: DrawerContentComponentProps) => (
  <DrawerContent {...props} />
);

const MainDrawer = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerActiveBackgroundColor: colors.primarySoft,
        drawerStyle: { backgroundColor: colors.surface },
        drawerLabelStyle: { fontWeight: '600' },
      }}
    >
      <Drawer.Screen
        name="Store"
        component={Store}
        options={{ drawerLabel: t('drawer.store'), drawerIcon: StoreIcon }}
      />
      <Drawer.Screen
        name="MyAppsUpdates"
        component={MyAppsUpdates}
        options={{ drawerLabel: t('drawer.myApps'), drawerIcon: UpdatesIcon }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{ drawerLabel: t('drawer.profile'), drawerIcon: ProfileIcon }}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{ drawerLabel: t('drawer.settings'), drawerIcon: SettingsIcon }}
      />
      <Drawer.Screen
        name="About"
        component={About}
        options={{ drawerLabel: t('drawer.about'), drawerIcon: AboutIcon }}
      />
    </Drawer.Navigator>
  );
};

export default () => {
  const { restoring } = useAuth();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {restoring ? (
        <Stack.Screen name="Splash" component={Splash} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainDrawer} />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="AppDetail" component={AppDetail} />
          <Stack.Screen name="AppReviews" component={AppReviews} />
        </>
      )}
    </Stack.Navigator>
  );
};
