import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import { Rocket } from 'lucide-react-native';

interface ComingSoonProps {
    title?: string;
    message?: string;
    icon?: React.ReactNode;
    small?: boolean;
}

export const ComingSoon = ({
    title = "Coming Soon",
    message = "We're currently preparing high-quality content for you. Stay tuned!",
    icon = <Rocket size={48} color="#2563EB" />,
    small = false
}: ComingSoonProps) => {
    return (
        <View className={`items-center justify-center ${small ? 'py-8' : 'py-20'} px-6 w-full`}>
            <View className={`${small ? 'w-16 h-16' : 'w-24 h-24'} bg-blue-50 dark:bg-blue-900/20 rounded-full items-center justify-center mb-6 border border-blue-100 dark:border-blue-800`}>
                {React.cloneElement(icon as React.ReactElement<any>, { size: small ? 32 : 48 })}
            </View>
            <Text variant={small ? 'h3' : 'h2'} weight="bold" className="text-gray-900 dark:text-white mb-2 text-center">
                {title}
            </Text>
            <Text variant={small ? 'caption' : 'body'} className="text-gray-500 text-center leading-6">
                {message}
            </Text>
        </View>
    );
};
