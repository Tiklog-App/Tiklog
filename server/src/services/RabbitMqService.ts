import amqp, { Connection, Channel } from 'amqplib';
import { Server, Socket } from 'socket.io';
import settings from '../config/settings';
import { DRIVER_RESPONSES, EXPIRATION_AMQP_MESSAGE, PACKAGE_REQUEST, PACKAGE_REQUEST_INFO } from '../config/constants';
import RedisService from './RedisService';
import { corsOptions } from '../app';
import AppLogger from '../utils/AppLogger';
import CustomAPIError from '../exceptions/CustomAPIError';
import HttpStatus from '../helpers/HttpStatus';

const logger = AppLogger.init('server').logger;
const redisService = new RedisService();

class RabbitMqService {
  private connection: Connection | null;
  private channel: Channel | null;
  private io: Server<any, any, any, any> | null;
  private pendingRequests: any[];
  private socketMap: Map<any, Socket>;

  constructor() {
    this.connection = null;
    this.channel = null;
    this.io = null;
    this.pendingRequests = [];
    this.socketMap = new Map<any, Socket>();
    // this.socketMap = {};
  }

  async connectToRabbitMQ(): Promise<void> {
    this.connection = await amqp.connect(settings.rabbitMq.connection);
    this.channel = await this.connection.createChannel();
  }

  async disconnectFromRabbitMQ(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async getAvailableDriver() {
    const keys = PACKAGE_REQUEST_INFO
    const rider = await redisService.getToken(keys);
    return rider;
  }

  async sendNotificationToDriver(driverId: any, notification: any) {

    const driverSocket = this.socketMap.get(driverId);

    if (driverSocket) {
      driverSocket.emit('notification', notification);
    }
  }

  // Function to assign the package request to a driver
  async assignPackageToDriver(packageRequest: any) {
    const driver = await this.getAvailableDriver();

    if (driver) {
      // Assign the package request to the driver
      const { riderId, riderFirstName, senderName, senderAddress, recipientAddress }: any = driver;

      const assignedPackage = {
        ...packageRequest,
        assignedTo: riderId,
      };

      // Send notification to the driver
      const notification = {
        title: 'New Delivery Request',
        body: `You have been assigned a new delivery request from ${senderName}.`,
        senderAddress: senderAddress,
        recipientAddress: recipientAddress
      };

      const driverId = riderId;
      this.sendNotificationToDriver(driverId, notification);

      const exchange = 'assigned_package_requests';
      const message = JSON.stringify(assignedPackage);

      await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
      this.channel!.publish(exchange, '', Buffer.from(message));

      console.log('Package request assigned to driver:', riderFirstName);
    } else {
      CustomAPIError.response('No available drivers found.', HttpStatus.NOT_FOUND.code);
    }
  }

  async submitPackageRequest(packageRequest: any, socket: Socket<any, any, any, any>): Promise<void> {
    const exchange = PACKAGE_REQUEST;
    const message = JSON.stringify(packageRequest);
    const expiration = EXPIRATION_AMQP_MESSAGE; // Expiration in milliseconds

    await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
    this.channel!.publish(exchange, '', Buffer.from(message), { expiration });

    // Assign the package request to a driver
    this.assignPackageToDriver(packageRequest);

    // Add the request to the pendingRequests array
    this.pendingRequests.push(packageRequest);
    console.log('Package request submitted.');
  }

  async listenForPackageRequests(): Promise<void> {
    const exchange = PACKAGE_REQUEST;

    await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
    const queue = await this.channel!.assertQueue('', { exclusive: true });
    await this.channel!.bindQueue(queue.queue, exchange, '');

    console.log('Waiting for package requests...');

    this.channel!.consume(queue.queue, (message) => {
      if (message?.content) {
        const packageRequest = JSON.parse(message.content.toString());
        console.log('Received package request:', packageRequest);

        // Send notification to drivers or trucks
        this.assignPackageToDriver(packageRequest);
      }
    }, { noAck: true });
  }

  async listenForDriverResponses(): Promise<void> {
    const exchange = DRIVER_RESPONSES;

    await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
    const queue = await this.channel!.assertQueue('', { exclusive: true });
    await this.channel!.bindQueue(queue.queue, exchange, '');

    console.log('Waiting for driver responses...');

    this.channel!.consume(queue.queue, (message) => {
      if (message?.content) {
        const driverResponse = JSON.parse(message.content.toString());

        // Check if there are any pending package requests
        // if (this.pendingRequests.length > 0) {

        // Handle the driver response (e.g., notify the user about the assigned driver)
          this.notifyUserAboutDriverResponse(driverResponse);

        //   // Remove the corresponding request from the pendingRequests array
        //   const matchedRequestIndex = this.pendingRequests.findIndex((request) => {
        //     // Compare the request with the driver response to determine a match
        //     // Adjust the logic based on your application's requirements
        //   });

        //   if (matchedRequestIndex !== -1) {
        //     this.pendingRequests.splice(matchedRequestIndex, 1);
        //   }
        // } else {
        //   // Handle the case when there are no pending package requests
        //   console.log('No package requests available. Ignoring driver response.');
        // }
      }
    }, { noAck: true });
  }

  async sendDriverResponse(driverResponse: any): Promise<void> {
    const exchange = DRIVER_RESPONSES;
    const message = JSON.stringify(driverResponse);

    await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
    this.channel!.publish(exchange, '', Buffer.from(message));

    console.log('Driver response sent.');
  }

  notifyUserAboutDriverResponse(driverResponse: any): void{
    console.log(driverResponse, 'driver response');

    const notification = {
      title: 'Rider response',
      availability: driverResponse.availability,
      riderId: driverResponse.riderId
    }

    const customerId = driverResponse.customerId;
    const customerSocket = this.socketMap.get(customerId);
    if (customerSocket) {
      console.log('hello response')
      customerSocket.emit('riderResponse', notification);
    }
  }

  // findSocketIdByRiderId(riderId: string): string | undefined {
  //   return this.socketMap.get(riderId);
  // }  

  setupSocketIO(server: any): void {
    this.io = new Server(server, {
      cors: corsOptions
    });

    this.io.on('connection', (socket: Socket<any, any, any, any>) => {
      console.log('Client connected.');
      logger.info(socket.id);

      socket.on('packageRequest', (request: any) => {
        if(request === null) {
          return socket.emit('message', 'Request has already been sent.')
        }

        this.submitPackageRequest(request, socket);
      });

      socket.on('riderId', (riderId: any) => {
        // const socketId = socket.id;
        this.socketMap.set(riderId, socket);
      
        // const data = {
        //   riderId: socketId
        // };
        // this.socketMap.set(riderId, socketId);
      });

      socket.on('customerId', (customerId: any) => {
        this.socketMap.set(customerId, socket)
      })

      socket.on('notificationAck', (data: any) => {
        // console.log('Notification acknowledgment received from driver.');
        console.log('proof that driver received notification');
      });

      socket.on('riderResponseNotificationAck', () => {
        console.log('proof that customer received notification');
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected.');
        logger.info(`Client with id ${socket.id} disconnected`)

        // Remove the socketMap entry when a rider disconnects
        // const riderId = this.findRiderIdBySocketId(socket.id);
        // if (riderId) {
        //   this.socketMap.delete(riderId);
        // }
      });

      // const riderId = this.findRiderIdBySocketId(socket.id);
      // if (riderId) {
      //   const riderSocket = socket;
      //   this.socketMap.set(riderId, riderSocket);
      // }
    });
  }

  getIO(): Server<any, any, any, any> | null {
    return this.io;
  }

  // findRiderIdBySocketId(socketId: string): string | undefined {
  //   for (const [riderId, id] of this.socketMap.entries()) {
  //     if (id === socketId) {
  //       return riderId;
  //     }
  //   }
  //   return undefined;
  // }
}


export default RabbitMqService;
