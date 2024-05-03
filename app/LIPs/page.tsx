'use client'

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader
} from "@/components/ui/table";

type User = {
  login: string;
};

type PullRequest = {
  id: number;
  title: string;
  body: string;
  html_url: string;
  user: User;
  comments_url: string;
  comments_count?: number; // Optional field to store the comments count
};

const PullRequests = () => {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const headers = new Headers({
      'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    });

    fetch('https://api.github.com/repos/lens-protocol/LIPs/pulls', { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error('Data received is not an array');
        }
        console.log('Received data:', data); // Log the data to inspect its structure
        const fetchCommentsCount = data.map(pr => 
          fetch(pr.comments_url, { headers })
            .then(response => response.json())
            .then(comments => comments.length)
            .catch(() => 0) // Handle errors in fetching comments
        );

        Promise.all(fetchCommentsCount).then(commentsCounts => {
          const pullRequestsWithComments = data.map((pr, index) => ({
            ...pr,
            comments_count: commentsCounts[index]
          }));
          setPullRequests(pullRequestsWithComments);
        });
      })
      .catch(error => {
        console.error('Error fetching pull requests:', error);
        setError(error.message);
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead >Title</TableHead >
          <TableHead >Body</TableHead >
          <TableHead >Author</TableHead >
          <TableHead >Comments</TableHead >
        </TableRow>
      </TableHeader>
      <TableBody>
        {pullRequests.map(pr => (
          <TableRow key={pr.id}>
            <TableCell>{pr.title}</TableCell>
            <TableCell>
              {pr.body ? pr.body.substring(0, 100) : 'No description provided'}
              {pr.body && pr.body.length > 100 && '...'}
              <a href={pr.html_url} target="_blank" rel="noopener noreferrer" style={{color: 'blue', textDecoration: 'underline'}}>Read more</a>
            </TableCell>
            <TableCell>{pr.user.login}</TableCell>
            <TableCell>{pr.comments_count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PullRequests;
