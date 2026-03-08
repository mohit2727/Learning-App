import { TextInput, TextInputProps, View } from 'react-native';
import React, { useState } from 'react';
import { Text } from './Text';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    className?: string;
    containerClassName?: string;
}

export const Input = ({
    label,
    error,
    className = '',
    containerClassName = '',
    onFocus,
    onBlur,
    ...props
}: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const baseInputStyles = 'h-12 px-4 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
    const defaultBorder = 'border-gray-200 dark:border-gray-700';
    const focusBorder = 'border-blue-500';
    const errorBorder = 'border-red-500';

    const borderColor = error ? errorBorder : isFocused ? focusBorder : defaultBorder;
    const combinedInputStyles = `${baseInputStyles} ${borderColor} ${className}`;

    return (
        <View className={`w-full mb-4 ${containerClassName}`}>
            {label && (
                <Text variant="caption" className="mb-1.5 font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </Text>
            )}
            <TextInput
                className={combinedInputStyles}
                placeholderTextColor="#9ca3af" // gray-400
                onFocus={(e) => {
                    setIsFocused(true);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    onBlur?.(e);
                }}
                {...props}
            />
            {error && (
                <Text variant="caption" className="text-red-500 mt-1">
                    {error}
                </Text>
            )}
        </View>
    );
};
