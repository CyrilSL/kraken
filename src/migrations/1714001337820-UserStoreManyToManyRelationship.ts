import { MigrationInterface, QueryRunner } from "typeorm";

export class UserStoreManyToManyRelationship1714001337820 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the user_stores join table with raw SQL
        await queryRunner.query(`
            CREATE TABLE "user_stores" (
                "user_id" varchar NOT NULL,
                "store_id" varchar NOT NULL,
                CONSTRAINT "pk_user_stores" PRIMARY KEY ("user_id", "store_id"),
                CONSTRAINT "fk_user_stores_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_user_stores_store_id" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the user_stores join table with raw SQL
        await queryRunner.query(`
            DROP TABLE "user_stores"
        `);
    }
}
