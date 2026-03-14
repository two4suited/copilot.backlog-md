import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const HUB_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/hubs/session`;

export function useSessionSeats(sessionId: string | undefined, initialSeats: number | null) {
  const [seatsAvailable, setSeatsAvailable] = useState<number | null>(initialSeats);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    setSeatsAvailable(initialSeats);
  }, [initialSeats]);

  useEffect(() => {
    if (!sessionId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.on('SeatsUpdated', (data: { sessionId: string; seatsAvailable: number }) => {
      if (data.sessionId === sessionId) {
        setSeatsAvailable(data.seatsAvailable);
      }
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => {
        setIsConnected(true);
        return connection.invoke('JoinSession', sessionId);
      })
      .catch(() => setIsConnected(false));

    return () => {
      if (connection.state !== signalR.HubConnectionState.Disconnected) {
        connection.invoke('LeaveSession', sessionId).catch(() => {}).finally(() => connection.stop());
      }
      setIsConnected(false);
    };
  }, [sessionId]);

  return { seatsAvailable, isConnected };
}
