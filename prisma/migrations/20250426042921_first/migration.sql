-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombres` VARCHAR(50) NOT NULL,
    `Apellidos` VARCHAR(50) NOT NULL,
    `UserName` VARCHAR(50) NOT NULL,
    `Password` VARCHAR(200) NOT NULL,
    `Email` VARCHAR(100) NOT NULL,
    `Celular` VARCHAR(10) NOT NULL,
    `Imagen` VARCHAR(191) NOT NULL,
    `DateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_Rol` INTEGER NOT NULL,

    UNIQUE INDEX `Usuario_UserName_key`(`UserName`),
    UNIQUE INDEX `Usuario_Email_key`(`Email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Catalogos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(50) NOT NULL,
    `Descripcion` VARCHAR(150) NULL,
    `id_Admin` INTEGER NOT NULL,

    UNIQUE INDEX `Catalogos_Nombre_key`(`Nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(100) NOT NULL,
    `id_Cat` INTEGER NOT NULL,
    `id_Admin` INTEGER NOT NULL,

    UNIQUE INDEX `Categorias_Nombre_key`(`Nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Email` VARCHAR(100) NOT NULL,
    `UserName` VARCHAR(50) NOT NULL,
    `Password` VARCHAR(200) NOT NULL,
    `celular` VARCHAR(10) NOT NULL,
    `id_Rol` INTEGER NOT NULL,

    UNIQUE INDEX `Admin_Email_key`(`Email`),
    UNIQUE INDEX `Admin_UserName_key`(`UserName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Productos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(50) NOT NULL,
    `Descripcion` VARCHAR(200) NOT NULL,
    `Disponibilidad` BOOLEAN NOT NULL,
    `Precio` VARCHAR(20) NOT NULL,
    `Presentacion` VARCHAR(50) NOT NULL,
    `Imagen` VARCHAR(191) NOT NULL,
    `id_Categoria` INTEGER NOT NULL,
    `id_Usuario` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_id_Rol_fkey` FOREIGN KEY (`id_Rol`) REFERENCES `Roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Catalogos` ADD CONSTRAINT `Catalogos_id_Admin_fkey` FOREIGN KEY (`id_Admin`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Categorias` ADD CONSTRAINT `Categorias_id_Cat_fkey` FOREIGN KEY (`id_Cat`) REFERENCES `Catalogos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Categorias` ADD CONSTRAINT `Categorias_id_Admin_fkey` FOREIGN KEY (`id_Admin`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_id_Rol_fkey` FOREIGN KEY (`id_Rol`) REFERENCES `Roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Productos` ADD CONSTRAINT `Productos_id_Categoria_fkey` FOREIGN KEY (`id_Categoria`) REFERENCES `Categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Productos` ADD CONSTRAINT `Productos_id_Usuario_fkey` FOREIGN KEY (`id_Usuario`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
