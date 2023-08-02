-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "code_bar" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_code_bar_key" ON "products"("code_bar");
