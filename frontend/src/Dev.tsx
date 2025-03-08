import React, { useState, useEffect, useCallback } from 'react';
import { Container, Center, Combobox, TextInput, Loader, Group, Text, Button, useCombobox, Card, Badge } from '@mantine/core';
import dayjs from 'dayjs';
import { DatePicker } from '@mantine/dates';

interface Repository {
    id: number;
    full_name: string;
    description: string;
}

function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

const Dev = () => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<Repository[]>([]);
    const [days, setDays] = useState(3);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
    const [changelogLink, setChangelogLink] = useState<string | null>(null);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const fetchRepositories = useCallback(
        debounce(async (query: string) => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=10`
                );
                const data = await response.json();
                setSuggestions(data.items || []);
            } catch (error) {
                console.error('Error fetching GitHub data:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        if (inputValue.length >= 3) {
            fetchRepositories(inputValue);
        } else {
            setSuggestions([]);
        }
    }, [inputValue, fetchRepositories]);

    useEffect(() => {
        if (suggestions.length > 0) {
            combobox.openDropdown();
        } else {
            combobox.closeDropdown();
        }
    }, [suggestions]);

    const generateChangelog = async () => {
        if (!selectedRepo) {
            console.error('No repository selected');
            return;
        }

        setGenerating(true);
        setChangelogLink(null);

        try {
            const response = await fetch('http://localhost:5000/generate-changelog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    repo: selectedRepo.full_name,
                    hash: btoa(selectedRepo.full_name),
                    days: days,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate changelog');
            }

            setChangelogLink(`http://${window.location.hostname}:3000/changes/${btoa(selectedRepo.full_name)}`);
        } catch (error) {
            console.error('Error generating changelog:', error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Container size="sm" style={{ height: '100vh', display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
            <Text size="lg" mb="md">Search GitHub Repositories</Text>
            <Combobox
                store={combobox}
                onOptionSubmit={(value) => {
                    const repo = suggestions.find(repo => repo.full_name === value);
                    if (repo) {
                        setSelectedRepo(repo);
                        setInputValue(value);
                    }
                    combobox.closeDropdown();
                }}
                withinPortal={false}
            >
                <Combobox.Target>
                    <TextInput
                        placeholder="Enter repository name"
                        value={inputValue}
                        onChange={(event) => {
                            setSelectedRepo(null);
                            setInputValue(event.currentTarget.value);
                        }}
                        rightSection={loading ? <Loader size="xs" /> : null}
                        styles={{
                            input: {
                                width: '100%',
                                maxWidth: '600px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid #ccc',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                fontSize: '16px',
                                fontFamily: 'Avenir, sans-serif',
                            },
                        }}
                    />
                </Combobox.Target>
                {suggestions.length > 0 && !selectedRepo && (
                    <Combobox.Dropdown>
                        <Combobox.Options>
                            {suggestions.slice(0, 5).map((repo) => (
                                <Combobox.Option value={repo.full_name} key={repo.id}>
                                    <Group style={{ padding: '8px', borderBottom: '1px solid #e0e0e0', cursor: 'pointer' }}>
                                        <div style={{ textAlign: 'left' }}>
                                            <Text style={{ fontSize: '14px', color: 'white' }}>{repo.full_name}</Text>
                                            <Text size="xs" color="dimmed" style={{ fontSize: '12px', color: '#666' }}>
                                                {repo.description || 'No description'}
                                            </Text>
                                        </div>
                                    </Group>
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    </Combobox.Dropdown>
                )}
            </Combobox>
            {selectedRepo && (
                <Card shadow="sm" padding="lg" mt="md" style={{ fontFamily: 'Avenir, sans-serif', maxWidth: '600px', textAlign: 'center' }}>
                    <div style={{ backgroundColor: 'gray', color: 'white', fontSize: '14px', padding: '4px 8px', borderRadius: '12px', fontFamily: 'Avenir, sans-serif', display: 'inline-block' }}>
                        {selectedRepo.full_name}
                    </div>
                    <Text size="xs" color="dimmed" mt="xs">{selectedRepo.description || 'No description available'}</Text>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Button
                            fullWidth
                            mt="md"
                            variant="filled"
                            color="blue"
                            onClick={generateChangelog}
                            disabled={generating}
                            style={{
                                backgroundColor: '#6fcf97',
                                color: '#fff',
                                padding: '12px 20px',
                                borderRadius: '20px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                transition: 'background-color 0.3s ease',
                                fontFamily: 'Avenir, sans-serif',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007BFF')}
                        >
                            {generating ? 'Changelog Generating...' : 'Generate Changelog'}
                        </Button>
                        <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '10px' }}>
                            <input
                                type="number"
                                min="1"
                                placeholder="30"
                                onChange={(e) => setDays(Number(e.target.value))}
                                style={{
                                    width: '60px',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    marginRight: '5px',
                                    fontSize: '14px',
                                    fontFamily: 'Avenir, sans-serif',
                                }}
                            />
                            <span style={{ fontSize: '14px', color: 'white' }}>(days)</span>
                        </div>
                    </div>
                    {changelogLink && (
                        <Text mt="md">
                            <a href={changelogLink} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
                                View Changelog for {selectedRepo.full_name}
                            </a>
                        </Text>
                    )}
                </Card>
            )}
        </Container>
    );
};

export default Dev;
