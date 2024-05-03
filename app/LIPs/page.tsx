'use client'

import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
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
  };

const PullRequests = () => {
    const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  
    useEffect(() => {
      fetch('https://api.github.com/repos/lens-protocol/LIPs/pulls')
        .then(response => response.json())
        .then(data => setPullRequests(data));
    }, []);
  
    return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Body</TableCell>
              <TableCell>Author</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pullRequests.map(pr => (
              <TableRow key={pr.id}>
                <TableCell>{pr.id}</TableCell>
                <TableCell>{pr.title}</TableCell>
                <TableCell>
                  {pr.body ? pr.body.substring(0, 100) : 'No description provided '}
                  {pr.body && pr.body.length > 100 && '... '}
                  <a href={pr.html_url} target="_blank" rel="noopener noreferrer">Read more</a>
                </TableCell>
                <TableCell>{pr.user.login}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    };

export default PullRequests;