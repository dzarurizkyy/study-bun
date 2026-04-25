-- CreateTable
CREATE TABLE `address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `street` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `province` VARCHAR(100) NULL,
    `postal_code` VARCHAR(10) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    `contact_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `address` ADD CONSTRAINT `address_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
