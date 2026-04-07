import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import PatientsScreen from '../screens/PatientsScreen';
import PatientDetailsScreen from '../screens/PatientDetailsScreen';
import PositionChangeScreen from '../screens/PositionChangeScreen';
import FollowUpRecordScreen from '../screens/FollowUpRecordScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Patients" component={PatientsScreen} />
        <Stack.Screen name="AddPatient" component={AddPatientScreen} />
        <Stack.Screen name="PatientDetails" component={PatientDetailsScreen} />
        <Stack.Screen name="PositionChange" component={PositionChangeScreen} />
        <Stack.Screen name="FollowUp" component={FollowUpRecordScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
