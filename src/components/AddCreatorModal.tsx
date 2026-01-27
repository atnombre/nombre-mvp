import React, { useState, useCallback } from 'react';
import { Search, Plus, X, CheckCircle, Youtube, Users } from 'lucide-react';
import { Button, Input, Avatar } from './ui';
import { api, YouTubeSearchResult } from '../services/api';

interface AddCreatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreatorAdded?: () => void;
}

export const AddCreatorModal: React.FC<AddCreatorModalProps> = ({
    isOpen,
    onClose,
    onCreatorAdded
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError(null);
        setSearchResults([]);

        try {
            const results = await api.searchYouTubeChannels(searchQuery);
            setSearchResults(results);
            if (results.length === 0) {
                setError('No channels found. Try a different search.');
            }
        } catch (err: any) {
            setError(err.message || 'Search failed');
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleAddCreator = async (channel: YouTubeSearchResult) => {
        setIsAdding(channel.channel_id);
        setError(null);
        setSuccess(null);

        try {
            const result = await api.addCreatorFromYouTube(channel.channel_id);
            setSuccess(result.message);

            setSearchResults(prev => prev.filter(c => c.channel_id !== channel.channel_id));

            onCreatorAdded?.();

            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to add creator');
        } finally {
            setIsAdding(null);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSearchResults([]);
        setError(null);
        setSuccess(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                // Heavy blur backdrop
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1.5rem',
                animation: 'fadeIn 0.2s ease',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                style={{
                    // Glass modal
                    background: 'rgba(17, 17, 17, 0.9)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '18px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
                    animation: 'scaleIn 0.2s ease',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '1.5rem 1.75rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(255, 0, 0, 0.25)',
                            }}
                        >
                            <Youtube size={22} color="#fff" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'rgba(255, 255, 255, 1)' }}>
                                Add Creator
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                                Search YouTube to add a new creator
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                placeholder="Search by channel name or @handle..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                leftElement={<Search size={16} />}
                                variant="glass"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                            isLoading={isSearching}
                            glow
                        >
                            Search
                        </Button>
                    </div>
                </div>

                {/* Results */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '1.25rem 1.75rem',
                    }}
                >
                    {success && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                background: 'rgba(0, 200, 83, 0.1)',
                                border: '1px solid rgba(0, 200, 83, 0.2)',
                                borderRadius: '12px',
                                marginBottom: '1rem',
                            }}
                        >
                            <CheckCircle size={20} color="#00C853" />
                            <span style={{ color: '#00C853', fontSize: '0.9rem' }}>{success}</span>
                        </div>
                    )}

                    {error && (
                        <div
                            style={{
                                padding: '1rem',
                                background: 'rgba(255, 82, 82, 0.1)',
                                border: '1px solid rgba(255, 82, 82, 0.2)',
                                borderRadius: '12px',
                                color: '#FF5252',
                                fontSize: '0.9rem',
                                marginBottom: '1rem',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {searchResults.length === 0 && !isSearching && !error && (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '3rem 1rem',
                                color: 'rgba(255, 255, 255, 0.3)',
                            }}
                        >
                            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p style={{ margin: 0 }}>Search for a YouTube channel to add</p>
                        </div>
                    )}

                    {searchResults.map((channel) => (
                        <div
                            key={channel.channel_id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                // Glass result card
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                borderRadius: '14px',
                                marginBottom: '0.75rem',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            }}
                        >
                            <Avatar src={channel.avatar_url} alt={channel.display_name} fallback={channel.display_name} size="lg" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        color: 'rgba(255, 255, 255, 1)',
                                        fontSize: '0.95rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {channel.display_name}
                                </div>
                                <div
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.45)',
                                        fontSize: '0.8rem',
                                        marginTop: '0.25rem',
                                    }}
                                >
                                    {channel.username}
                                </div>
                                {channel.description && (
                                    <div
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.35)',
                                            fontSize: '0.75rem',
                                            marginTop: '0.35rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {channel.description}
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={() => handleAddCreator(channel)}
                                disabled={isAdding === channel.channel_id}
                                isLoading={isAdding === channel.channel_id}
                                glow
                                style={{
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Plus size={16} />
                                Add
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
