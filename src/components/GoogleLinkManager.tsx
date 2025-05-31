import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';

export const GoogleLinkManager = () => {
    const {
        user,
        linkGoogleAccount,
        unlinkGoogleAccount
    } = useAuth();

    const [isGoogleLinked, setIsGoogleLinked] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if Google is linked on load or when user changes
    useEffect(() => {
        if (user) {
            const linked = user.providerData.some(
                (provider) => provider.providerId === 'google.com'
            );
            setIsGoogleLinked(linked);
        }
    }, [user]);

    const handleLink = async () => {
        setLoading(true);
        try {
            await linkGoogleAccount();
            setIsGoogleLinked(true);
        } catch (err) {
            console.error('Failed to link Google account:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async () => {
        setLoading(true);
        try {
            if (user?.providerData.length === 1 && user.providerData[0].providerId === 'google.com') {
                alert("You can't unlink the only sign-in provider.");
                return;
            }

            await unlinkGoogleAccount();
            setIsGoogleLinked(false);
        } catch (err) {
            console.error('Failed to unlink Google account:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-2 bg-muted rounded-xl">
            <span className="text-sm font-medium">Google</span>
            {isGoogleLinked ? (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleUnlink}
                    disabled={loading}
                >
                    {loading ? 'Unlinking...' : 'Unlink'}
                </Button>
            ) : (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLink}
                    disabled={loading}
                >
                    {loading ? 'Linking...' : 'Link Google Account'}
                </Button>
            )}
        </div>
    );
};
