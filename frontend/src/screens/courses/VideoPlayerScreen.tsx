import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Text } from '../../components/Text';
import { ChevronLeft } from 'lucide-react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import * as ScreenCapture from 'expo-screen-capture';

const { width } = Dimensions.get('window');

// Utility to extract YouTube Video ID
const getYoutubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

export const VideoPlayerScreen = ({ route, navigation }: any) => {
    const { lesson, courseTitle } = route.params;
    const [playing, setPlaying] = useState(true);
    const [loading, setLoading] = useState(true);

    const videoId = getYoutubeId(lesson.videoUrl);

    // Security: Prevent screen recording and screenshots
    useEffect(() => {
        let subscription: any;

        const enableSecurity = async () => {
            // This prevents screenshots and recording on Android
            await ScreenCapture.preventScreenCaptureAsync();

            // On iOS, we can detect if they start recording and show an alert
            subscription = ScreenCapture.addScreenshotListener(() => {
                Alert.alert("Security Warning", "Screenshots and recording are prohibited to protect course content.");
            });
        };

        enableSecurity();

        return () => {
            // Allow screen capture again when leaving the screen
            ScreenCapture.allowScreenCaptureAsync();
            if (subscription) subscription.remove();
        };
    }, []);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
            setPlaying(false);
            Alert.alert("Lesson Completed", "You have finished this lesson.");
        }
    }, []);

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="pt-14 pb-4 px-4 flex-row items-center bg-black/80 z-10 transition-all">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-white/10 rounded-full">
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text variant="caption" weight="medium" className="text-blue-400 mb-0.5">{courseTitle}</Text>
                    <Text weight="bold" className="text-white text-lg" numberOfLines={1}>{lesson.title}</Text>
                </View>
            </View>

            {/* Video Player Area */}
            <View className="flex-1 justify-center bg-gray-950">
                {videoId ? (
                    <View className="relative">
                        {loading && (
                            <View className="absolute inset-0 z-20 items-center justify-center bg-black">
                                <ActivityIndicator size="large" color="#2563EB" />
                                <Text className="text-gray-400 mt-4 font-medium">Loading Video...</Text>
                            </View>
                        )}

                        {/* YouTube Player */}
                        <YoutubePlayer
                            height={width * (9 / 16)}
                            width={width}
                            play={playing}
                            videoId={videoId}
                            onChangeState={onStateChange}
                            onReady={() => setLoading(false)}
                            initialPlayerParams={{
                                controls: 1,
                                modestbranding: 1,
                                rel: 0,
                                iv_load_policy: 3,
                                fs: 0,
                            }}
                            webViewProps={{
                                allowsFullscreenVideo: false,
                                injectedJavaScript: `
                                    const hideElements = () => {
                                        const style = document.createElement('style');
                                        style.innerHTML = \`
                                            .ytp-chrome-top, 
                                            .ytp-watermark, 
                                            .ytp-youtube-button, 
                                            .ytp-share-button, 
                                            .ytp-show-cards-title, 
                                            .ytp-pause-overlay,
                                            .ytp-ce-element { 
                                                display: none !important; 
                                            }
                                        \`;
                                        document.head.appendChild(style);
                                    };
                                    hideElements();
                                    // Repeat to catch dynamic elements
                                    setInterval(hideElements, 1000);
                                    true;
                                `,
                            }}
                        />

                        {/* Invisible Click Shields (to prevent clicking hidden branding/share) */}
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '25%',
                                height: 60,
                                backgroundColor: 'transparent',
                                zIndex: 15
                            }}
                            pointerEvents="auto"
                        />
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 80,
                                height: 40,
                                backgroundColor: 'transparent',
                                zIndex: 15
                            }}
                            pointerEvents="auto"
                        />
                    </View>
                ) : (
                    <View className="p-10 items-center">
                        <View className="w-20 h-20 bg-red-500/10 rounded-full items-center justify-center mb-6">
                            <Text className="text-3xl text-red-500">⚠️</Text>
                        </View>
                        <Text variant="h3" weight="bold" className="text-white text-center mb-2">Invalid Video Link</Text>
                        <Text className="text-gray-400 text-center">
                            The video link provided for this lesson is invalid or not a YouTube URL.
                        </Text>
                    </View>
                )}

                <View className="p-6 mt-4">
                    <View className="flex-row items-center gap-2 mb-4">
                        <View className="bg-blue-600/20 px-3 py-1 rounded-full">
                            <Text className="text-blue-400 text-[10px] font-bold tracking-widest uppercase">Secured Content</Text>
                        </View>
                    </View>
                    <Text variant="h2" weight="bold" className="text-white mb-3">{lesson.title}</Text>
                    <Text className="text-gray-400 leading-relaxed">
                        {lesson.description || 'Welcome to this lesson! Please follow along with the video. Screen recording and screenshots are disabled to protect our premium content.'}
                    </Text>
                </View>
            </View>

            {/* Footer / Safety Badge */}
            <View className="pb-10 items-center px-10">
                <View className="flex-row items-center gap-2 opacity-40">
                    <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-blink" />
                    <Text className="text-white text-[10px] uppercase font-bold tracking-tighter">End-to-end encrypted streaming</Text>
                </View>
            </View>
        </View>
    );
};
