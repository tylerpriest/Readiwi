"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AudioSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Text-to-Speech Settings</CardTitle>
        <CardDescription>Configure audio playback and voice settings</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Audio settings will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default AudioSettings;