"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacySettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy & Data Settings</CardTitle>
        <CardDescription>Control data collection and privacy preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Privacy settings will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;