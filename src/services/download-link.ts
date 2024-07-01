// src/services/download-link.ts
import { TransactionBaseService } from "@medusajs/medusa"
import { EntityManager } from "typeorm"
import { DownloadLink } from "../models/download-link"

type CreateDownloadLinkInput = Pick<DownloadLink, "order_id" | "product_variant_id">

class DownloadLinkService extends TransactionBaseService {
  protected manager_: EntityManager
  protected transactionManager_: EntityManager

  async create(data: CreateDownloadLinkInput): Promise<DownloadLink> {
    return this.atomicPhase_(async (manager) => {
      const downloadLinkRepo = manager.getRepository(DownloadLink)
      const uniqueUrl = this.generateUniqueUrl()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      
      const downloadLink = downloadLinkRepo.create({
        ...data,
        unique_url: uniqueUrl,
        expires_at: expiresAt,
      })
      
      return await downloadLinkRepo.save(downloadLink)
    })
  }
  

  private generateUniqueUrl(): string {
    // Implement your unique URL generation logic here
    return Math.random().toString(36).substring(2, 15)
  }

  async retrieveByUniqueUrl(uniqueUrl: string): Promise<DownloadLink | null> {
    const downloadLinkRepo = this.manager_.getRepository(DownloadLink)
    return await downloadLinkRepo.findOne({ where: { unique_url: uniqueUrl } })
  }

  async isValid(uniqueUrl: string): Promise<boolean> {
    const downloadLink = await this.retrieveByUniqueUrl(uniqueUrl)
    if (!downloadLink) return false
    return new Date() < downloadLink.expires_at
  }
}

export default DownloadLinkService