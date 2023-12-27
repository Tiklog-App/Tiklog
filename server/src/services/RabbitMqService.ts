import amqp, { Connection, Channel } from 'amqplib';
import { Server, Socket } from 'socket.io';
import settings from '../config/settings';
import {
  ADMIN_CHARGES,
  DELIVERED,
  DRIVER_RESPONSES,
  EXPIRATION_AMQP_MESSAGE,
  ON_TRANSIT,
  PACKAGE_REQUEST,
  PACKAGE_REQUEST_INFO,
  RIDER_READY_TO_COLLECT_PACKAGE,
  RIDER_REQUESTED
} from '../config/constants';
import RedisService from './RedisService';
import { corsOptions } from '../app';
import AppLogger from '../utils/AppLogger';
import CustomAPIError from '../exceptions/CustomAPIError';
import HttpStatus from '../helpers/HttpStatus';
import datasources from  '../services/dao';

const logger = AppLogger.init('server').logger;
const redisService = new RedisService();

class RabbitMqService {
  private connection: Connection | null;
  private channel: Channel | null;
  private io: Server<any, any, any, any> | null;
  private pendingRequests: any[];
  private socketMap: Map<any, Socket>;
  private onlineUsers: any[];

  constructor() {
    this.connection = null;
    this.channel = null;
    this.io = null;
    this.pendingRequests = [];
    this.socketMap = new Map<any, Socket>();
    this.onlineUsers = [];
  }

  async connectToRabbitMQ(): Promise<void> {
    this.connection = await amqp.connect(settings.rabbitMq.connection);
    this.channel = await this.connection.createChannel();
    await this.consumePrivateMessagesFromRabbitMQ();
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

  async consumePrivateMessagesFromRabbitMQ(): Promise<void> {
    if (this.channel) {
      this.channel.assertQueue('privateMessages');
      this.channel.consume('privateMessages', (msg) => {
        if (msg) {
          const { senderId, receiverId, message } = JSON.parse(msg.content.toString());
          const receiverSocket = this.socketMap.get(receiverId);

          if (receiverSocket) {
            receiverSocket.emit('privateMessage', { senderId, message });
          }
          this.channel!.ack(msg);
        }
      }, { noAck: false });
    } else {
      throw new CustomAPIError('RabbitMQ channel is not available', HttpStatus.INTERNAL_SERVER_ERROR.code);
    }
  }

  async getAvailableDriver() {
    const keys = PACKAGE_REQUEST_INFO
    const rider = await redisService.getToken(keys);
    
    return rider;
  }

  async sendNotificationToDriver(riderId: any, notification: any) {

    const driverSocket = this.socketMap.get(riderId);

    if (driverSocket) {
      driverSocket.emit('notification', notification);
    }
  }

  // Function to assign the package request to a driver
  async assignPackageToDriver(packageRequest: any) {
    const driver = await this.getAvailableDriver();

    if (driver) {
      // Assign the package request to the driver
      const {
        riderId,
        riderFirstName,
        senderName,
        senderAddress,
        recipientAddress,
        customerId,
        senderPhoto
      }: any = driver;

      const assignedPackage = {
        ...packageRequest,
        assignedTo: riderId,
      };

      // Send notification to the driver
      const notification = {
        title: 'New Delivery Request',
        body: `You have been assigned a new delivery request from ${senderName}.`,
        senderAddress: senderAddress,
        recipientAddress: recipientAddress,
        customerId: customerId,
        senderPhoto: senderPhoto,
        customerName: senderName
      };

      // const driverId = riderId;
      this.sendNotificationToDriver(riderId, notification);

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
    const exchange = PACKAGE_REQUEST
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
    const exchange = PACKAGE_REQUEST

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

  async notifyUserAboutDriverResponse(driverResponse: any): Promise<void>{
    const notification = {
      title: 'Rider response',
      availability: driverResponse.availability,
      riderId: driverResponse.riderId,
      arrivalTime: driverResponse.arrivalTime,
      riderPhoto: driverResponse.riderPhoto,
      riderName: driverResponse.riderName
    }

    const customerId = driverResponse.customerId;
    console.log(customerId, 'customer id')
    const customerSocket = this.socketMap.get(customerId);
    console.log(customerSocket?.id, 'cus socket id')
    const redisData = await redisService.getToken(PACKAGE_REQUEST_INFO);
    const { riderId, deliveryId }: any = redisData;
    if (customerSocket) {
      if(driverResponse.availability) {
        customerSocket.emit('riderResponse', notification);
        this.riderAvailability(driverResponse.availability);
        await datasources.deliveryDAOService.updateByAny(
          { _id: deliveryId },
          { rider: riderId, status: RIDER_REQUESTED }
        )

      } else {
        this.riderAvailability(driverResponse.availability);
        customerSocket.emit('riderDeclined', {
          body: 'Rider declined your request',
          riderName: driverResponse.riderName,
          riderPhoto: driverResponse.riderPhoto,
        });
        await redisService.deleteRedisKey(PACKAGE_REQUEST_INFO)
      }
    }
  }

  //Rider is available to accept delivery
  async riderAvailability(availabilityStatus: boolean): Promise<void> {
    const keys = PACKAGE_REQUEST_INFO
    const redisData = await redisService.getToken(keys);
    const {deliveryId, riderId, customerId, deliveryRefNumber }: any = redisData;

    await datasources.notificationDAOService.create({
      deliveryRefNumber: deliveryRefNumber,
      riderAvailabilityStatus: availabilityStatus,
      rider: riderId,
      customer: customerId,
      delivery: deliveryId
    } as any);

  };

  async sendMessageToUser(
    senderId: any, receiverId: any, 
    message: string, chatId: string
    ) {
      if (receiverId) {
        
        // const targetSocketRooms = this.io?.sockets.adapter.rooms.get(receiverId);
        const targetSocketRooms = this.socketMap.get(receiverId);
        if (targetSocketRooms) {
          // this.io?.to(receiverId).emit('receivePrivateMessage', { senderId, message });
          targetSocketRooms.emit('receivePrivateMessage', { senderId, message });
        } else {
          await this.sendMessageToRabbitMQ('privateMessages', JSON.stringify({ senderId, message }));
        }
      } else {
        console.log('Invalid target user ID provided.');
      }

    }
  
    async sendMessageToRabbitMQ(queue: string, message: string): Promise<void> {
      try {
        if (this.channel) {
          this.channel.sendToQueue(queue, Buffer.from(message));
        } else {
          throw new CustomAPIError('RabbitMQ channel is not available', HttpStatus.INTERNAL_SERVER_ERROR.code);
        }
      } catch (error) {
        throw new CustomAPIError('Error while sending message to RabbitMQ', HttpStatus.INTERNAL_SERVER_ERROR.code);
      }
    }

  //Sends a notification to customer notifying package delivery
  async startDeliveryNotification(data: any): Promise<void> {
    const customerSocket = this.socketMap.get(data.customerId);
    if(customerSocket){
      console.log('delivery started')
      const keys = PACKAGE_REQUEST_INFO
      const redisData = await redisService.getToken(keys);

      const {estimatedDeliveryTime, deliveryId, riderId, deliveryRefNumber, riderPhoto}: any = redisData;

      const deliveryData = {
        ...data,
        deliveryRefNumber,
        estimatedDeliveryTime: estimatedDeliveryTime,
        riderPhoto
      }
      customerSocket.emit('startDeliveryNotification', deliveryData);
      await datasources.deliveryDAOService.updateByAny(
        {_id: deliveryId},
        {status: ON_TRANSIT}
      )
      await datasources.riderDAOService.updateByAny(
        { _id: riderId },
        { busy: true }
      )
    }
  }

  //Sends a notification to customer notifying package delivered
  async endDeliveryNotification(data: any): Promise<void> {
    const customerSocket = this.socketMap.get(data.customerId);
    if(customerSocket){
      console.log('delivery ended')
      const keys = PACKAGE_REQUEST_INFO
      const redisData = await redisService.getToken(keys);

      const {estimatedDeliveryTime, deliveryId, riderId, deliveryRefNumber, riderPhoto}: any = redisData;

      const deliveryData = {
        ...data,
        deliveryRefNumber,
        estimatedDeliveryTime: estimatedDeliveryTime,
        riderPhoto
      }
      customerSocket.emit('endDeliveryNotification', deliveryData);
      const delivery = await datasources.deliveryDAOService.updateByAny(
        {_id: deliveryId},
        {status: DELIVERED}
      )
      await datasources.riderDAOService.updateByAny(
        { _id: riderId },
        { busy: false }
      )
      
      const riderWallet = await datasources.riderWalletDAOService.findByAny({ rider: riderId });
      const adminFee = delivery && ADMIN_CHARGES/100 * delivery.deliveryFee;
      const riderFee = delivery && delivery.deliveryFee - Math.round(adminFee as number) as number;

      if(riderWallet) {
        await datasources.riderWalletDAOService.update(
          { _id: riderWallet._id },
          { balance: riderFee && riderFee + riderWallet.balance }
        )
      } else {
        const walletValues = {
          rider: riderId,
          balance: riderFee
        }
        await datasources.riderWalletDAOService.create(walletValues as any)
      }

      //saves the admin charges for the delivery
      await datasources.adminFeeDAOService.create({
        deliveryRefNumber: deliveryRefNumber,
        rider: riderId,
        adminFee: adminFee
      } as any)

      await redisService.deleteRedisKey(keys)
    }
  }

  //Notify customer of rider's arrival
  async handleRiderArrival(data: any) {
    const redisData = await redisService.getToken(PACKAGE_REQUEST_INFO);
    const { deliveryId }: any = redisData;

    const customerSocket = this.socketMap.get(data.customerId);
    if(customerSocket){
      console.log('rider has arrived');

      await datasources.deliveryDAOService.updateByAny(
        { _id: deliveryId },
        { status: RIDER_READY_TO_COLLECT_PACKAGE }
      )
      
      customerSocket.emit('riderArrivalNotification', data.riderArrived)
    }

  }

  findSocketIdByRiderId(riderId: any): any | undefined {
    return this.socketMap.get(riderId);
  }  

  setupSocketIO(server: any): void {
    this.io = new Server(server, {
      cors: corsOptions
    });

    this.io.on('connection', (socket: Socket<any, any, any, any>) => {
      console.log(`Client connected. ${socket.id}`);
      logger.info(socket.id);

      socket.on('packageRequest', (request: any) => {

        if(request === null) {
          return socket.emit('requestAlreadySent', 'Request has already been sent.')
        }

        this.submitPackageRequest(request, socket);
      });

      socket.on('riderId', (riderId: any) => {
        if (riderId) {
          if(!this.onlineUsers.some(user => user.userId === riderId)) {
            this.onlineUsers.push({
              riderId,
              socketId: socket.id
            })
          }
          this.socketMap.set(riderId, socket);
          console.log(`Socket set for riderId: ${riderId}`);
        } else {
          console.log('Invalid or disconnected socket.');
        }

        socket.emit("getOnlineUsers", this.onlineUsers);
      });

      socket.on('customerId', (customerId: any) => {
        if (customerId) {
          if(!this.onlineUsers.some(user => user.userId === customerId)) {
            this.onlineUsers.push({
              customerId,
              socketId: socket.id
            })
          }
          this.socketMap.set(customerId, socket)
          console.log(`Socket ${socket.id} set for customerId: ${customerId}`);
        } else {
          console.log('Invalid or disconnected socket.');
        }

        socket.emit("getOnlineUsers", this.onlineUsers);
      });

      socket.on('sendPrivateMessage', (data: any) => {
        const { senderId, receiverId, message, chatId } = data;
  
        this.sendMessageToUser(senderId, receiverId, message, chatId)
        
        // Emit the private message to the receiver's room
        // io.to(receiverId).emit('receivePrivateMessage', { senderId, message });
      });

      socket.on('arrived', (data: any) => {
        if(data) {
          this.handleRiderArrival(data)
        }
      })

      socket.on('startDelivery', (data: any) => {
        if(data) {
          this.startDeliveryNotification(data)
        }
      })

      socket.on('endDelivery', (data: any) => {
        if(data) {
          this.endDeliveryNotification(data)
        }
      })

      socket.on('notificationAck', (data: any) => {
        // console.log('Notification acknowledgment received from driver.');
        console.log('proof that driver received notification');
      });

      socket.on('riderResponseNotificationAck', (data: any) => {
        console.log('proof that customer received notification');
          // this.riderAvailability(data.availability)
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected.');
        logger.info(`Client with id ${socket.id} disconnected`);

        this.onlineUsers = this.onlineUsers.filter(user => user.socketId !== socket.id)
        console.log(this.onlineUsers, 'online')
        socket.emit("getOnlineUsers", this.onlineUsers);

        // Add riderId to the socketMap when a rider disconnects
        // const riderId = this.findRiderIdBySocketId(socket.id);
        // console.log(riderId, 'rider id after disconnect')
        // if (riderId) {
        //   this.socketMap.set(riderId, socket);
        // }

        // const socketId = this.findSocketIdByRiderId(customerId);
        // console.log(riderId, 'rider id after disconnect')
        // if (riderId) {
        //   this.socketMap.set(riderId, socket);
        // }

        
      });

      const riderId = this.findRiderIdBySocketId(socket.id);
      if (riderId) {
        const riderSocket = socket;
        this.socketMap.set(riderId, riderSocket);
      }
    });
  }

  getIO(): Server<any, any, any, any> | null {
    return this.io;
  }

  findRiderIdBySocketId(socketId: string): string | undefined {
    for (const [riderId, id] of this.socketMap.entries()) {
      //@ts-ignore
      if (id === socketId) {
        return riderId;
      }
    }
    return undefined;
  }
}


export default RabbitMqService;
