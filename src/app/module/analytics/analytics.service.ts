import httpStatus from "http-status";
import {
  OutageStatus,
  PaymentStatus,
  Role,
  ScheduledOutageStatus,
  SubscriptionStatus,
  TechnicianVerificationStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { RequestUser } from "../../middleware/checkAuth";

const getAdminAnalytics = async () => {
  // users
  const totalUsers = await prisma.user.count({
    where: { isDeleted: false },
  });

  const totalCustomers = await prisma.user.count({
    where: { role: Role.CUSTOMER, isDeleted: false },
  });

  const totalTechnicians = await prisma.technician.count({
    where: {
      verificationStatus: TechnicianVerificationStatus.APPROVED,
      isDeleted: false,
    },
  });

  const totalPendingTechnicians = await prisma.technician.count({
    where: {
      verificationStatus: TechnicianVerificationStatus.PENDING,
      isDeleted: false,
    },
  });

  const totalBlockedUsers = await prisma.user.count({
    where: { status: "BLOCKED", isDeleted: false },
  });

  // unexpected outages
  const totalUnexpectedOutages = await prisma.unexpectedOutage.count({
    where: { isDeleted: false },
  });

  const reportedOutages = await prisma.unexpectedOutage.count({
    where: { status: OutageStatus.REPORTED, isDeleted: false },
  });

  const assignedOutages = await prisma.unexpectedOutage.count({
    where: { status: OutageStatus.ASSIGNED, isDeleted: false },
  });

  const inProgressOutages = await prisma.unexpectedOutage.count({
    where: { status: OutageStatus.IN_PROGRESS, isDeleted: false },
  });

  const resolvedOutages = await prisma.unexpectedOutage.count({
    where: { status: OutageStatus.RESOLVED, isDeleted: false },
  });

  // scheduled outages
  const totalScheduledOutages = await prisma.scheduledOutage.count({
    where: { isDeleted: false },
  });

  const upcomingOutages = await prisma.scheduledOutage.count({
    where: { status: ScheduledOutageStatus.UPCOMING, isDeleted: false },
  });

  const ongoingOutages = await prisma.scheduledOutage.count({
    where: { status: ScheduledOutageStatus.ONGOING, isDeleted: false },
  });

  const completedOutages = await prisma.scheduledOutage.count({
    where: { status: ScheduledOutageStatus.COMPLETED, isDeleted: false },
  });

  const cancelledOutages = await prisma.scheduledOutage.count({
    where: { status: ScheduledOutageStatus.CANCELLED, isDeleted: false },
  });

  // premium
  const totalActivePremiumUsers = await prisma.premiumUser.count({
    where: { status: SubscriptionStatus.ACTIVE, isDeleted: false },
  });

  const totalExpiredPremiumUsers = await prisma.premiumUser.count({
    where: { status: SubscriptionStatus.EXPIRED, isDeleted: false },
  });

  // revenue
  const totalRevenueResult = await prisma.payment.aggregate({
    where: { status: PaymentStatus.PAID, isDeleted: false },
    _sum: { amount: true },
    _count: { id: true },
  });

  const totalRevenue = totalRevenueResult._sum.amount || 0;
  const totalPaidPayments = totalRevenueResult._count.id || 0;

  // most popular package
  const mostPopularPackage = await prisma.premiumPackage.findFirst({
    where: { isDeleted: false },
    include: {
      _count: { select: { premiumUsers: true } },
    },
    orderBy: { premiumUsers: { _count: "desc" } },
  });

  // most affected area
  const mostAffectedArea = await prisma.area.findFirst({
    where: { isDeleted: false },
    include: {
      _count: { select: { unexpectedOutages: true } },
    },
    orderBy: { unexpectedOutages: { _count: "desc" } },
  });

  return {
    users: {
      totalUsers,
      totalCustomers,
      totalTechnicians,
      totalPendingTechnicians,
      totalBlockedUsers,
    },
    unexpectedOutages: {
      total: totalUnexpectedOutages,
      reported: reportedOutages,
      assigned: assignedOutages,
      inProgress: inProgressOutages,
      resolved: resolvedOutages,
    },
    scheduledOutages: {
      total: totalScheduledOutages,
      upcoming: upcomingOutages,
      ongoing: ongoingOutages,
      completed: completedOutages,
      cancelled: cancelledOutages,
    },
    premium: {
      totalActivePremiumUsers,
      totalExpiredPremiumUsers,
    },
    revenue: {
      totalRevenue,
      totalPaidPayments,
    },
    mostPopularPackage,
    mostAffectedArea,
  };
};

const getCustomerAnalytics = async (user: RequestUser) => {
  const customer = await prisma.customer.findUnique({
    where: { userId: user.userId },
  });

  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer Profile Not Found");
  }

  // outages
  const totalReportedOutages = await prisma.unexpectedOutage.count({
    where: { reporterId: user.userId, isDeleted: false },
  });

  const reportedOutages = await prisma.unexpectedOutage.count({
    where: {
      reporterId: user.userId,
      status: OutageStatus.REPORTED,
      isDeleted: false,
    },
  });

  const assignedOutages = await prisma.unexpectedOutage.count({
    where: {
      reporterId: user.userId,
      status: OutageStatus.ASSIGNED,
      isDeleted: false,
    },
  });

  const inProgressOutages = await prisma.unexpectedOutage.count({
    where: {
      reporterId: user.userId,
      status: OutageStatus.IN_PROGRESS,
      isDeleted: false,
    },
  });

  const resolvedOutages = await prisma.unexpectedOutage.count({
    where: {
      reporterId: user.userId,
      status: OutageStatus.RESOLVED,
      isDeleted: false,
    },
  });

  // subscriptions
  const activeSubscriptions = await prisma.premiumUser.findMany({
    where: {
      userId: user.userId,
      status: SubscriptionStatus.ACTIVE,
      isDeleted: false,
    },
    include: {
      package: true,
      area: true,
    },
  });

  const totalExpiredSubscriptions = await prisma.premiumUser.count({
    where: {
      userId: user.userId,
      status: SubscriptionStatus.EXPIRED,
      isDeleted: false,
    },
  });

  const totalCancelledSubscriptions = await prisma.premiumUser.count({
    where: {
      userId: user.userId,
      status: SubscriptionStatus.CANCELLED,
      isDeleted: false,
    },
  });

  // payments
  const spentResult = await prisma.payment.aggregate({
    where: {
      status: PaymentStatus.PAID,
      isDeleted: false,
      premiumUser: { userId: user.userId },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  const totalAmountSpent = spentResult._sum.amount || 0;
  const totalPaidPayments = spentResult._count.id || 0;

  return {
    outages: {
      total: totalReportedOutages,
      reported: reportedOutages,
      assigned: assignedOutages,
      inProgress: inProgressOutages,
      resolved: resolvedOutages,
    },
    subscriptions: {
      active: activeSubscriptions,
      totalExpired: totalExpiredSubscriptions,
      totalCancelled: totalCancelledSubscriptions,
    },
    payments: {
      totalAmountSpent,
      totalPaidPayments,
    },
  };
};

const getTechnicianAnalytics = async (user: RequestUser) => {
  const technician = await prisma.technician.findUnique({
    where: { userId: user.userId },
  });

  if (!technician) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician Profile Not Found");
  }

  // unexpected outages
  const totalUnexpectedAssignments = await prisma.unexpectedOutage.count({
    where: { technicianId: technician.id, isDeleted: false },
  });

  const assignedOutages = await prisma.unexpectedOutage.count({
    where: {
      technicianId: technician.id,
      status: OutageStatus.ASSIGNED,
      isDeleted: false,
    },
  });

  const inProgressOutages = await prisma.unexpectedOutage.count({
    where: {
      technicianId: technician.id,
      status: OutageStatus.IN_PROGRESS,
      isDeleted: false,
    },
  });

  const resolvedOutages = await prisma.unexpectedOutage.count({
    where: {
      technicianId: technician.id,
      status: OutageStatus.RESOLVED,
      isDeleted: false,
    },
  });

  // scheduled outages
  const totalScheduledAssignments = await prisma.scheduledOutage.count({
    where: { technicianId: technician.id, isDeleted: false },
  });

  const upcomingScheduled = await prisma.scheduledOutage.count({
    where: {
      technicianId: technician.id,
      status: ScheduledOutageStatus.UPCOMING,
      isDeleted: false,
    },
  });

  const ongoingScheduled = await prisma.scheduledOutage.count({
    where: {
      technicianId: technician.id,
      status: ScheduledOutageStatus.ONGOING,
      isDeleted: false,
    },
  });

  const completedScheduled = await prisma.scheduledOutage.count({
    where: {
      technicianId: technician.id,
      status: ScheduledOutageStatus.COMPLETED,
      isDeleted: false,
    },
  });

  return {
    unexpectedOutages: {
      total: totalUnexpectedAssignments,
      assigned: assignedOutages,
      inProgress: inProgressOutages,
      resolved: resolvedOutages,
    },
    scheduledOutages: {
      total: totalScheduledAssignments,
      upcoming: upcomingScheduled,
      ongoing: ongoingScheduled,
      completed: completedScheduled,
    },
    totalAssignments: totalUnexpectedAssignments + totalScheduledAssignments,
    pendingAssignments: assignedOutages + upcomingScheduled,
    resolvedAssignments: resolvedOutages + completedScheduled,
  };
};

export const AnalyticsServices = {
  getAdminAnalytics,
  getCustomerAnalytics,
  getTechnicianAnalytics,
};