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
            
            // Remove the added channel from results
            setSearchResults(prev => prev.filter(c => c.channel_id !== channel.channel_id));
            
            onCreatorAdded?.();
            
            // Auto close after 2 seconds
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
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                style={{
                    backgroundColor: '#111',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Youtube size={20} color="#fff" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                                Add Creator
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                                Search YouTube to add a new creator
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.4)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                placeholder="Search by channel name or @handle..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                leftElement={<Search size={16} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />}
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                            isLoading={isSearching}
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
                        padding: '1rem 1.5rem',
                    }}
                >
                    {success && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                                borderRadius: '10px',
                                marginBottom: '1rem',
                            }}
                        >
                            <CheckCircle size={20} color="#4ade80" />
                            <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>{success}</span>
                        </div>
                    )}

                    {error && (
                        <div
                            style={{
                                padding: '1rem',
                                backgroundColor: 'rgba(248, 113, 113, 0.1)',
                                borderRadius: '10px',
                                color: '#f87171',
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
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '12px',
                                marginBottom: '0.75rem',
                                border: '1px solid rgba(255, 255, 255, 0.04)',
                            }}
                        >
                            <Avatar src={channel.avatar_url} alt={channel.display_name} fallback={channel.display_name} size="lg" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        color: '#fff',
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
                                        color: 'rgba(255, 255, 255, 0.4)',
                                        fontSize: '0.8rem',
                                        marginTop: '0.25rem',
                                    }}
                                >
                                    {channel.username}
                                </div>
                                {channel.description && (
                                    <div
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.3)',
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
                                style={{
                                    background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
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
