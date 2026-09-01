import bcrypt from "bcryptjs";
import { Role, TechnicianVerificationStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import config from "../config";

export const seedSuperAdmin = async () => {
	try {
		const isSuperAdminExists = await prisma.user.findFirst({
			where: {
				role: Role.SUPER_ADMIN,
			},
		});

		if (isSuperAdminExists) {
			console.log("Super Admin already exists");
			return;
		}

		const name = config.super_admin_name;
		const email = config.super_admin_email;
		const password = config.super_admin_password;

		if (!name || !email || !password) {
			throw new Error(
				"Super Admin Name, Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const superAdmin = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.SUPER_ADMIN,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Super Admin created successfully:", superAdmin);
	} catch (error) {
		console.error("Error seeding super admin:", error);

		await prisma.user.delete({
			where: { email: config.super_admin_email },
		});
	}
};

export const seedTesterAdmin = async () => {
	try {
		const isTesterAdminExist = await prisma.user.findUnique({
			where: { email: config.tester_admin_email },
		});

		if (isTesterAdminExist) {
			console.log("Tester Admin already exists!");
			return;
		}

		const name = config.tester_admin_name;
		const email = config.tester_admin_email;
		const password = config.tester_admin_password;

		if (!name || !email || !password) {
			throw new Error(
				"Tester Admin Name, Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerAdmin = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.ADMIN,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Tester Admin created:", testerAdmin);
	} catch (error) {
		console.error("Error seeding tester admin:", error);

		await prisma.user.delete({
			where: { email: config.tester_admin_email },
		});
	}
};

export const seedTesterTechnician = async () => {
	try {
		const isTesterTechnicianExist = await prisma.user.findUnique({
			where: { email: config.tester_technician_email },
		});

		if (isTesterTechnicianExist) {
			console.log("Tester Technician already exists!");
			return;
		}

		const name = config.tester_technician_name;
		const email = config.tester_technician_email;
		const password = config.tester_technician_password;

		if (!name || !email || !password) {
			throw new Error(
				"Tester Technician Name, Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerTechnician = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.TECHNICIAN,
				needPasswordChange: false,
				emailVerified: true,
				technician: {
					create: {
                        name: name,
                        email: email,
						experienceYears: 3,
						bio: "Experienced power grid technician",
						contactNumber: "01700000000",
						address: "Dhaka, Bangladesh",
						verificationStatus: TechnicianVerificationStatus.APPROVED,
					},
				},
			},
		});

		console.log("Tester Technician created:", testerTechnician);
	} catch (error) {
		console.error("Error seeding tester technician:", error);

		await prisma.user.delete({
			where: { email: config.tester_technician_email },
		});
	}
};
