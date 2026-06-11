import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen        from '../screens/SplashScreen';
import OnboardingScreen    from '../screens/OnboardingScreen';
import CouponListScreen    from '../screens/CouponListScreen';
import CouponCreateScreen  from '../screens/CouponCreateScreen';
import CouponDetailScreen  from '../screens/CouponDetailScreen';
import CouponEditScreen    from '../screens/CouponEditScreen';
import CouponCameraScreen  from '../screens/CouponCameraScreen';
import CouponGalleryScreen from '../screens/CouponGalleryScreen';

export type CouponPrefill = {
  title?: string; brand?: string; store?: string;
  expiryDate?: string; couponCode?: string; memo?: string;
};

export type RootStackParamList = {
  Splash:        undefined;
  Onboarding:    undefined;
  CouponList:    undefined;
  CouponCreate:  { prefill?: CouponPrefill };
  CouponDetail:  { couponId: string };
  CouponEdit:    { couponId: string };
  CouponCamera:  undefined;
  CouponGallery: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Splash"        component={SplashScreen} />
        <Stack.Screen name="Onboarding"    component={OnboardingScreen} />
        <Stack.Screen name="CouponList"    component={CouponListScreen} />
        <Stack.Screen name="CouponCreate"  component={CouponCreateScreen} />
        <Stack.Screen name="CouponDetail"  component={CouponDetailScreen} />
        <Stack.Screen name="CouponEdit"    component={CouponEditScreen} />
        <Stack.Screen
          name="CouponCamera"
          component={CouponCameraScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="CouponGallery"
          component={CouponGalleryScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
