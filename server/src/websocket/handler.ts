import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { SimulationEngine } from '../simulation/engine.js';

const connectedClients = new Set<WebSocket>();

export function setupWebSocket(server: FastifyInstance): void {
  server.get('/ws', { websocket: true }, (connection: any, req: any) => {
    const socket: any = connection?.socket || connection;
    if (!socket || typeof socket.send !== 'function') {
      return;
    }
    connectedClients.add(socket);
    server.log.info({ ip: req.ip }, 'WebSocket client connected');

    // Send immediate initial state
    const engine = SimulationEngine.getInstance();
    const initialState = {
      type: 'INIT',
      simulationState: engine.getState(),
      events: engine.getRecentEvents()
    };
    try {
      socket.send(JSON.stringify(initialState));
    } catch (e) {
      server.log.error(e, 'Failed to send initial WS state');
    }

    socket.on('message', (message: any) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          socket.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        } else if (parsed.type === 'GET_STATE') {
          socket.send(JSON.stringify({ type: 'STATE', state: engine.getState() }));
        }
      } catch (err) {
        server.log.warn({ err }, 'Invalid message received over WebSocket');
      }
    });

    socket.on('close', () => {
      connectedClients.delete(socket);
      server.log.info('WebSocket client disconnected');
    });

    socket.on('error', (err) => {
      server.log.error({ err }, 'WebSocket client error');
      connectedClients.delete(socket);
    });
  });

  // Subscribe SimulationEngine events to WebSocket clients
  const engine = SimulationEngine.getInstance();
  engine.subscribe((data) => {
    broadcast(data);
  });
}

export function broadcast(payload: any): void {
  const jsonStr = JSON.stringify(payload);
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(jsonStr);
      } catch (err) {
        console.error('Error sending message to WS client:', err);
      }
    }
  }
}

export function broadcastAlert(alert: any): void {
  broadcast({ type: 'ALERT', alert });
}

export function broadcastCampaignUpdate(campaign: any): void {
  broadcast({ type: 'CAMPAIGN_UPDATE', campaign });
}

export function getConnectedClientCount(): number {
  return connectedClients.size;
}
