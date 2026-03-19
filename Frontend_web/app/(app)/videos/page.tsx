'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoPlaylistsPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/playlists');
    }, [router]);
    return null;
}
