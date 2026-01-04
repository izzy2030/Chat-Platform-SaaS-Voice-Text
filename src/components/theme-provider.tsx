'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Theme } from '@radix-ui/themes';

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider {...props}>
            <ThemeWrapper>{children}</ThemeWrapper>
        </NextThemesProvider>
    );
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) {
        return <Theme appearance="dark" accentColor="iris" grayColor="slate" panelBackground="translucent" radius="large">{children}</Theme>;
    }

    return (
        <Theme
            appearance={theme === 'light' ? 'light' : 'dark'}
            accentColor="iris"
            grayColor="slate"
            panelBackground="translucent"
            radius="large"
        >
            {children}
        </Theme>
    );
}

import { useTheme } from 'next-themes';
