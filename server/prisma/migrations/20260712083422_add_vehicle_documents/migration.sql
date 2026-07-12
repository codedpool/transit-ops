-- CreateTable
CREATE TABLE "vehicle_documents" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "doc_type" TEXT NOT NULL,
    "reference_number" TEXT,
    "file_url" TEXT,
    "expiry_date" DATE,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicle_documents_vehicle_id_idx" ON "vehicle_documents"("vehicle_id");

-- AddForeignKey
ALTER TABLE "vehicle_documents" ADD CONSTRAINT "vehicle_documents_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_documents" ADD CONSTRAINT "vehicle_documents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
