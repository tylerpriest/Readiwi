"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const KeyboardSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyboard Shortcuts</CardTitle>
        <CardDescription>Customize keyboard shortcuts and navigation</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Keyboard settings will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default KeyboardSettings;