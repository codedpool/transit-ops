// Vehicle document service — metadata records (title, type, reference, expiry, link).
const prisma = require('../../lib/prisma');
const AppError = require('../../utils/AppError');

async function listByVehicle(vehicleId) {
  return prisma.vehicleDocument.findMany({
    where: { vehicleId: Number(vehicleId) },
    orderBy: { createdAt: 'desc' },
  });
}

async function create(data, userId) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new AppError(404, 'Vehicle not found.', 'VEHICLE_NOT_FOUND');
  return prisma.vehicleDocument.create({
    data: {
      vehicleId: data.vehicleId,
      title: data.title,
      docType: data.docType,
      referenceNumber: data.referenceNumber || null,
      fileUrl: data.fileUrl || null,
      expiryDate: data.expiryDate || null,
      createdById: userId || null,
    },
  });
}

async function remove(id) {
  const doc = await prisma.vehicleDocument.findUnique({ where: { id } });
  if (!doc) throw new AppError(404, 'Document not found.', 'NOT_FOUND');
  await prisma.vehicleDocument.delete({ where: { id } });
}

module.exports = { listByVehicle, create, remove };
