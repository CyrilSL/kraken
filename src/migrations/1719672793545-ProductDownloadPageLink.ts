import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductDownloadPageLink1719672793545 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "download_link" (
            "id" character varying NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "order_id" character varying NOT NULL,
            "product_variant_id" character varying NOT NULL,
            "unique_url" character varying NOT NULL,
            "expires_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "PK_download_link" PRIMARY KEY ("id")
        )`)

        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_DOWNLOAD_LINK_UNIQUE_URL" ON "download_link" ("unique_url")`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_DOWNLOAD_LINK_UNIQUE_URL"`)
        await queryRunner.query(`DROP TABLE "download_link"`)
    }

}
