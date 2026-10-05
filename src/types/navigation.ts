import type { CompositeScreenProps } from '@react-navigation/native';
import type { DrawerScreenProps as RNDrawerScreenProps } from '@react-navigation/drawer';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type StoreSource = 'public' | 'private';

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  Login: undefined;
  AppDetail: { id: number; source: StoreSource };
  AppReviews: {
    id: number;
    source: StoreSource;
    name: string;
    ratingAvg: number | null;
    ratingCount: number;
  };
};

export type MainDrawerParamList = {
  Store: undefined;
  MyAppsUpdates: undefined;
  Profile: undefined;
  Settings: undefined;
  About: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainDrawerScreenProps<T extends keyof MainDrawerParamList> =
  CompositeScreenProps<
    RNDrawerScreenProps<MainDrawerParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;
