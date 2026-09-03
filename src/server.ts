import app from "./app";
import config from "./app/config";
import { startCronJobs } from "./app/lib/cron";
import { transporter } from "./app/lib/nodemailer";
import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";
import { seedSuperAdmin, seedTesterAdmin, seedTesterTechnician } from "./app/utils/seed";

const PORT = config.port;

const main = async () => {
	try {
		await prisma.$connect();
		console.log("Connected to the database successfully.");

		await redisClient.connect(); // Connect to Redis
		console.log("Connected to Redis successfully.");

		await transporter.verify();
		console.log("Nodemailer connected successfully.");

		await seedSuperAdmin();
		await seedTesterAdmin();
		await seedTesterTechnician();

		startCronJobs()

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
};

main();
