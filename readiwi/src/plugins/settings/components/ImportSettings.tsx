"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ImportSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import & Download Settings</CardTitle>
        <CardDescription>Configure book import behavior and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Import settings will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default ImportSettings;