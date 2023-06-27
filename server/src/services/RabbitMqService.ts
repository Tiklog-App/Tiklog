import amqp, { Connection, Channel } from 'amqplib';
import { Server, Socket } from 'socket.io';
import settings from '../config/settings';
import { DRIVER_RESPONSES, EXPIRATION_AMQP_MESSAGE, PACKAGE_REQUEST } from '../config/constants';
import RedisService from './RedisService';

const redisService = new RedisService();

class RabbitMqService {
  private connection: Connection | null;
  private channel: Channel | null;
  private io: Server<any, any, any, any> | null;
  private pendingRequests: any[]

  constructor() {
    this.connection = null;
    this.channel = null;
    this.io = null;
    this.pendingRequests = []
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
    const keys = 'riderInfo'
    const rider = await redisService.getToken(keys);
    return rider;
  }

  async sendNotificationToDriver(driver: any, notification: any) {
    const driverSocket = driver.socket;
  
    if (driverSocket) {
      driverSocket.emit('notification', notification);
    }
  }

  // Function to assign the package request to a driver
  // async assignPackageToDriver(packageRequest: any) {
  //   const driver = redisService.getToken('riderInfo');
    
  //   if (driver) {
  //     // Assign the package request to the driver
  //     const { _id, firstName }: any = driver 

  //     const assignedPackage = {
  //       ...packageRequest,
  //       assignedTo: _id
  //     };

  //     // Send notification to the driver
  //     const notification = {
  //       title: 'New Delivery Request',
  //       body: `You have been assigned a new delivery request from  to .`,
  //     };

  //     this.sendNotificationToDriver(driver, notification);

  //     const exchange = 'assigned_package_requests';
  //     const message = JSON.stringify(assignedPackage);

  //     await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
  //     this.channel!.publish(exchange, '', Buffer.from(message));

  //     console.log('Package request assigned to driver:', firstName);

  //   } else {
  //     console.log('No available drivers found.');
  //   }
  // }
  // Function to assign the package request to a driver
  async assignPackageToDriver(packageRequest: any) {
    const driver = await this.getAvailableDriver();

    if (driver) {
      // Assign the package request to the driver
      const { _id, firstName }: any = driver;

      const assignedPackage = {
        ...packageRequest,
        assignedTo: _id,
      };

      // Send notification to the driver
      const notification = {
        title: 'New Delivery Request',
        body: `You have been assigned a new delivery request from to .`,
      };

      this.sendNotificationToDriver(driver, notification);

      const exchange = 'assigned_package_requests';
      const message = JSON.stringify(assignedPackage);

      await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
      this.channel!.publish(exchange, '', Buffer.from(message));

      console.log('Package request assigned to driver:', firstName);
    } else {
      console.log('No available drivers found.');
    }
  }

  // async submitPackageRequest(packageRequest: any, socket: Socket<any, any, any, any>): Promise<void> {
  //   const exchange = PACKAGE_REQUEST;
  //   const message = JSON.stringify(packageRequest);
  //   const expiration = EXPIRATION_AMQP_MESSAGE; // Expiration in milliseconds
  
  //   await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
  //   this.channel!.publish(exchange, '', Buffer.from(message), { expiration });

  //     // Emit the package request event to the server
  //   socket.emit('packageRequest', packageRequest);


  //   // Assign the package request to a driver
  //   this.assignPackageToDriver(packageRequest);
  
  //   // this.pendingRequests.push(request);
  //   console.log(this.pendingRequests, 'Package request submitted.');
  // }


  async submitPackageRequest(packageRequest: any, socket: Socket<any, any, any, any>): Promise<void> {
    const exchange = PACKAGE_REQUEST;
    const message = JSON.stringify(packageRequest);
    const expiration = EXPIRATION_AMQP_MESSAGE; // Expiration in milliseconds

    await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
    this.channel!.publish(exchange, '', Buffer.from(message), { expiration });

    // Emit the package request event to the server
    socket.emit('packageRequest', packageRequest);

    // Assign the package request to a driver
    this.assignPackageToDriver(packageRequest);

    // Add the request to the pendingRequests array
    this.pendingRequests.push(packageRequest);
    console.log('Package request submitted.', this.pendingRequests);
  }

  // async listenForPackageRequests(): Promise<void> {
  //   const exchange = PACKAGE_REQUEST;

  //   await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
  //   const queue = await this.channel!.assertQueue('', { exclusive: true });
  //   await this.channel!.bindQueue(queue.queue, exchange, '');

  //   console.log('Waiting for package requests...');

  //   this.channel!.consume(queue.queue, (message) => {
  //     if (message?.content) {
  //       const packageRequest = JSON.parse(message.content.toString());
  //       console.log('Received package request:', packageRequest);

  //       // Send notification to drivers or trucks
  //       this.sendNotificationToDriver(packageRequest);
  //     }
  //   }, { noAck: true });
  // }
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

  // async listenForDriverResponses(): Promise<void> {
  //   const exchange = DRIVER_RESPONSES;

  //   await this.channel!.assertExchange(exchange, 'fanout', { durable: false });
  //   const queue = await this.channel!.assertQueue('', { exclusive: true });
  //   await this.channel!.bindQueue(queue.queue, exchange, '');

  //   console.log('Waiting for driver responses...');

  //   this.channel!.consume(queue.queue, (message) => {
  //     if (message?.content) {
  //       const driverResponse = JSON.parse(message.content.toString());

  //       // Check if there are any pending package requests
  //       if (this.pendingRequests.length > 0) {
  //           // Handle the driver response (e.g., notify the user about the assigned driver)
  //           this.notifyUserAboutAssignment(driverResponse);

  //           // Remove the corresponding request from the pendingRequests array
  //           const matchedRequestIndex = this.pendingRequests.findIndex((request) => {
  //           // Compare the request with the driver response to determine a match
  //           // Adjust the logic based on your application's requirements
  //           });

  //           if (matchedRequestIndex !== -1) {
  //               this.pendingRequests.splice(matchedRequestIndex, 1);
  //           }
  //       } else {
  //           // Handle the case when there are no pending package requests
  //           console.log('No package requests available. Ignoring driver response.');
  //       }
  //     }
  //   }, { noAck: true });
  // }

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
        if (this.pendingRequests.length > 0) {
          // Handle the driver response (e.g., notify the user about the assigned driver)
          this.notifyUserAboutAssignment(driverResponse);

          // Remove the corresponding request from the pendingRequests array
          const matchedRequestIndex = this.pendingRequests.findIndex((request) => {
            // Compare the request with the driver response to determine a match
            // Adjust the logic based on your application's requirements
          });

          if (matchedRequestIndex !== -1) {
            this.pendingRequests.splice(matchedRequestIndex, 1);
          }
        } else {
          // Handle the case when there are no pending package requests
          console.log('No package requests available. Ignoring driver response.');
        }
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

  notifyUserAboutAssignment(driverResponse: any): void {
    // Code to notify the user about the assigned driver
    
  }

  setupSocketIO(server: any): void {
    this.io = new Server(server);

    this.io.on('connection', (socket: Socket<any, any, any, any>) => {
      console.log('Client connected.');

      socket.on('packageRequest', (request: any) => {
        this.submitPackageRequest(request, socket);
      });

      socket.on('notificationAck', () => {
        console.log('Notification acknowledgment received from driver.');
        // Perform any necessary actions upon receiving the acknowledgment from the driver
      });


      socket.on('disconnect', () => {
        console.log('Client disconnected.');
      });
    });
  }

  getIO(): Server<any, any, any, any> | null {
    return this.io;
  }
}


export default RabbitMqService;
