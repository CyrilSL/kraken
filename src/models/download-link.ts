import { BaseEntity, generateEntityId } from "@medusajs/medusa"
import { BeforeInsert, Column, Entity, Index } from "typeorm"

@Entity()
export class DownloadLink extends BaseEntity {
    @Column({ type: "varchar" })
    order_id: string

    @Column({ type: "varchar" })
    product_variant_id: string

    @Index({ unique: true })
    @Column({ type: "varchar" })
    unique_url: string

    @Column({ type: 'timestamp with time zone', nullable: true })
    expires_at: Date

    @BeforeInsert()
    private beforeInsert(): void {
        this.id = generateEntityId(this.id, "dlink")
    }
}