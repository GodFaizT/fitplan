-- CreateTable
CREATE TABLE "FoodLibrary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "per" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FoodLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FoodLibrary_name_idx" ON "FoodLibrary"("name");
