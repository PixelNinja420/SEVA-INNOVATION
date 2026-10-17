declare module 'sql.js' {
  const initSqlJs: (config?: any) => Promise<any>;
  export default initSqlJs;
  export type Database = any;
}

declare module 'ws' {
  import { EventEmitter } from 'events';
  export class WebSocket extends EventEmitter {
    static OPEN: number;
    readyState: number;
    send(data: any): void;
    close(): void;
  }
  export default WebSocket;
}
