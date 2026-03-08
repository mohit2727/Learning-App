import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import React from 'react';

interface TextProps extends RNTextProps {
    className?: string;
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
    weight?: 'normal' | 'medium' | 'bold';
}

export const Text = ({ className = '', variant = 'body', weight = 'normal', ...props }: TextProps) => {
    const baseStyles = 'text-gray-900 dark:text-gray-100';

    const variantStyles = {
        h1: 'text-3xl',
        h2: 'text-2xl',
        h3: 'text-xl',
        body: 'text-base',
        caption: 'text-sm text-gray-500',
    };

    const weightStyles = {
        normal: 'font-normal',
        medium: 'font-medium',
        bold: 'font-bold',
    };

    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${weightStyles[weight]} ${className}`;

    return <RNText className={combinedStyles} {...props} />;
};
