import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens
import { HomeScreen } from '../screens/dashboard/HomeScreen';
import { TestCategoryScreen } from '../screens/tests/TestCategoryScreen';
import { ActiveTestScreen } from '../screens/tests/ActiveTestScreen';
import { TestResultScreen } from '../screens/tests/TestResultScreen';
import { CoursesScreen } from '../screens/courses/CoursesScreen';
import { CourseDetailScreen } from '../screens/courses/CourseDetailScreen';
import { VideoPlayerScreen } from '../screens/courses/VideoPlayerScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { LeaderboardScreen } from '../screens/leaderboard/LeaderboardScreen';

// ─── Tab Navigator ────────────────────────────────────────────────────────────────

export type MainTabParamList = {
    Home: undefined;
    Tests: undefined;
    Leaderboard: undefined;
    Courses: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
);

const TabsNavigator = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                height: 62,
                paddingBottom: 8,
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: '#F3F4F6',
            },
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
    >
        <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />, tabBarLabel: 'Home' }}
        />
        <Tab.Screen
            name="Tests"
            component={TestCategoryScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📝" focused={focused} />, tabBarLabel: 'Tests' }}
        />
        <Tab.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏆" focused={focused} />, tabBarLabel: 'Leaderboard' }}
        />
        <Tab.Screen
            name="Courses"
            component={CoursesScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📚" focused={focused} />, tabBarLabel: 'Courses' }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />, tabBarLabel: 'Profile' }}
        />
    </Tab.Navigator>
);

import { MyTestsScreen } from '../screens/profile/MyTestsScreen';
import { MyCoursesScreen } from '../screens/profile/MyCoursesScreen';

// ─── Root Stack (contains tabs + modal screens pushed on top) ──────────────────

export type AppStackParamList = {
    Main: undefined;
    ActiveTest: undefined;
    TestResult: { answers: (number | null)[]; questions: any[] };
    CourseDetail: { courseId: string };
    VideoPlayer: { lesson: any; courseTitle: string };
    MyTests: undefined;
    MyCourses: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const MainNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabsNavigator} />
        <Stack.Screen name="ActiveTest" component={ActiveTestScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="TestResult" component={TestResultScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="MyTests" component={MyTestsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="MyCourses" component={MyCoursesScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
);
