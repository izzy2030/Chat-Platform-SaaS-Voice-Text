'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ChatWidget {
  id: string;
  name: string;
  configuration: string;
  userId: string;
}

export function WidgetList() {
  const firestore = useFirestore();
  const { user } = useUser();

  const chatWidgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/chatWidgets`));
  }, [firestore, user]);

  const {
    data: widgets,
    isLoading,
    error,
  } = useCollection<ChatWidget>(chatWidgetsQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Widgets</CardTitle>
        <CardDescription>
          A list of your created chat widgets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error loading widgets</AlertTitle>
                <AlertDescription>
                {error.message}
                </AlertDescription>
            </Alert>
        )}
        {!isLoading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Widget ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {widgets && widgets.length > 0 ? (
                widgets.map((widget) => (
                  <TableRow key={widget.id}>
                    <TableCell className="font-medium">{widget.name}</TableCell>
                    <TableCell>
                      <code>{widget.id}</code>
                    </TableCell>
                    <TableCell>
                      {/* Actions like Edit/Delete can go here */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center"
                  >
                    No widgets found. Create one to get started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
