'use client';

import { Loader2 } from 'lucide-react';
import { ChatWidgetComponent } from '@/components/widget/chat-widget';
import { useEffect, useState, use } from 'react';

// This page will be rendered inside the iframe on the external website
export default function WidgetPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = use(params);
  const [widgetConfig, setWidgetConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substring(2)}`);


  useEffect(() => {
    async function fetchWidgetConfig() {
      if (!widgetId) {
        setError('No widget ID provided.');
        setIsLoading(false);
        return;
      }
      try {
        // Since we cannot easily query subcollections across all users on the client-side
        // without compromising security or indexing, we use a dedicated API route.
        const res = await fetch(`/api/widget-config?id=${widgetId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch widget configuration');
        }
        const { widget } = await res.json();
        setWidgetConfig(widget);
      } catch (e: any) {
        console.error(e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWidgetConfig();
  }, [widgetId]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <div className="text-red-500 text-center">
          <p><strong>Error</strong></p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-transparent">
      {widgetConfig && <ChatWidgetComponent widgetConfig={widgetConfig} sessionId={sessionId} />}
    </div>
  );
}
