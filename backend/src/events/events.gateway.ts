// backend/src/events/events.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // Pozwalamy na połączenia z każdego źródła (Frontend/Rpi)
    },
  })
  export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    handleConnection(client: Socket) {
      console.log(`Nowe połączenie WebSocket: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Rozłączono: ${client.id}`);
    }
  
    /**
     * Raspberry Pi wysyła to zdarzenie zaraz po połączeniu,
     * żeby zameldować się w swoim "pokoju" (np. device_1).
     */
    @SubscribeMessage('joinDeviceRoom')
    handleJoinDeviceRoom(
      @MessageBody() data: { deviceId: string },
      @ConnectedSocket() client: Socket,
    ) {
      const roomName = `device_${data.deviceId}`;
      client.join(roomName);
      console.log(`Urządzenie ${data.deviceId} dołączyło do pokoju: ${roomName}`);
      return { event: 'joined', status: 'OK', room: roomName };
    }
  
    /**
     * Frontend Angulara może dołączyć tutaj, żeby słuchać o statusie zamówienia.
     */
    @SubscribeMessage('joinOrderRoom')
    handleJoinOrderRoom(
      @MessageBody() data: { orderId: string },
      @ConnectedSocket() client: Socket,
    ) {
      const roomName = `order_${data.orderId}`;
      client.join(roomName);
      return { event: 'joined', status: 'OK', room: roomName };
    }
  
    // --- METODY DO WYWOŁYWANIA PRZEZ SERWISY (OrdersService) ---
  
    // Wysyła rozkaz do konkretnego Raspberry Pi
    sendToDevice(deviceId: string, command: string, payload: any) {
      const roomName = `device_${deviceId}`;
      this.server.to(roomName).emit('deviceCommand', {
        command,
        ...payload,
      });
      console.log(`Wysłano komendę do ${roomName}: ${command}`);
    }
  
    // Powiadamia Frontend o zmianie statusu
    notifyOrderUpdate(orderId: string, status: string) {
      const roomName = `order_${orderId}`;
      this.server.to(roomName).emit('orderStatus', { status });
    }
  }