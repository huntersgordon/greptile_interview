import React, { useEffect, useState } from 'react';
import { Container, Card, Text, Loader, Badge } from '@mantine/core';
import { useParams } from 'react-router-dom';

interface Changelog {
  date: string;
  title: string;
  content: string;
}

const ChangelogView = () => {
  const { repoName } = useParams();
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/changes/${repoName}`)
      .then(res => res.json())
      .then(data => setChangelogs(data.changelog))
      .finally(() => setLoading(false));
  }, [repoName]);

  if (loading) return <Loader />;

  return (
    <Container size="md" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      {changelogs.map((log, i) => (
        <Card key={i} mb="md" shadow="sm" padding="lg" style={{ border: '1px solid black', borderRadius: '8px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#e0f7fa', color: '#00796b', padding: '5px 10px', borderRadius: '12px', marginBottom: '10px' }}>
            {log.date}
          </div>
          <Text size="lg" fw={700} mt="sm" style={{ color: '#333', marginBottom: '10px' }}>{log.title}</Text>
          {log.content.split('\n').map((line, idx) => (
            line.startsWith('##') ? 
              <Text key={idx} fw={600} size="md" mt="xs" style={{ color: '#555', marginTop: '5px', marginBottom: '5px' }}>{line.replace('##', '').trim()}</Text> :
              <Text key={idx} ml="md" size="sm" style={{ color: '#777', marginLeft: '20px', marginBottom: '5px' }}>{line.replace('-', '•')}</Text>
          ))}
        </Card>
      ))}
    </Container>
  );
};

export default ChangelogView;
