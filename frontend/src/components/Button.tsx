import { TouchableOpacity, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import React from 'react';
import { Text } from './Text';

interface ButtonProps extends TouchableOpacityProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
    className?: string;
    textClassName?: string;
}

export const Button = ({
    label,
    variant = 'primary',
    isLoading = false,
    className = '',
    textClassName = '',
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyles = 'flex-row items-center justify-center root:rounded-lg py-3 px-4';

    const variantStyles = {
        primary: 'bg-blue-600 active:bg-blue-700',
        secondary: 'bg-gray-200 active:bg-gray-300',
        outline: 'bg-transparent border border-blue-600',
        ghost: 'bg-transparent active:bg-gray-100',
    };

    const textVariantStyles = {
        primary: 'text-white font-semibold',
        secondary: 'text-gray-900 font-semibold',
        outline: 'text-blue-600 font-semibold',
        ghost: 'text-blue-600 font-semibold',
    };

    const isDisabled = disabled || isLoading;
    const disabledStyles = isDisabled ? 'opacity-50' : '';

    const combinedContainerStyles = `${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`;
    const combinedTextStyles = `${textVariantStyles[variant]} ${textClassName}`;

    return (
        <TouchableOpacity
            className={combinedContainerStyles}
            disabled={isDisabled}
            activeOpacity={0.8}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : '#2563EB'} />
            ) : (
                <Text variant="body" className={combinedTextStyles}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};
