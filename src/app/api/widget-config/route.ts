
// IMPORTANT! This file should not be used in a production environment.
// It is a temporary mock server that will be replaced with a real implementation.
// It is used to mock the response of the widget configuration.

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const widgetId = searchParams.get('id');

  if (!widgetId) {
    return NextResponse.json({ message: 'Widget ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('id', widgetId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ message: 'Widget not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ widget: data });
  } catch (error: any) {
    console.error("Error fetching widget config:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
