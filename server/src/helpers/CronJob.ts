import RiderLicenseRepository from "../repositories/RiderLicenseRepository";

const riderLicenseRepository = new RiderLicenseRepository()

export default class CronJob {
    public static async vehicleLicenseIsExpired () {
        console.log('cron job started')
        const riders = await riderLicenseRepository.findAll({});
        const currentDate = new Date();

        for (const rider of riders) {
            if(new Date(rider.expiryDate) <= currentDate) {
                await riderLicenseRepository.update(
                    { _id: rider._id },
                    { isExpired: true }
                )
            };
        }
    }
}

