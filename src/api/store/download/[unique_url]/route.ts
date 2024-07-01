import type {
    MedusaRequest,
    MedusaResponse,
    AbstractFileService,
    ProductVariantService
  } from "@medusajs/medusa"
  //import DownloadLinkService from "../../../../../services/download-link"
  import DownloadLinkService from "src/services/download-link"
  //import ProductMediaService from "../../../../../services/product-media"
  import ProductMediaService from "src/services/product-media"
  //import { MediaType } from "../../../../../models/product-media"
  import { MediaType } from "../../../../models/product-media"
  
  export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const uniqueUrl = req.params.unique_url
    if (!uniqueUrl) {
      res.status(400).json({ error: "Unique URL is required" })
      return
    }
  
    const downloadLinkService = req.scope.resolve<DownloadLinkService>("downloadLinkService")
    const productMediaService = req.scope.resolve<ProductMediaService>("productMediaService")
    const productVariantService = req.scope.resolve<ProductVariantService>("productVariantService")
    const fileService = req.scope.resolve<AbstractFileService>("fileService")
  
    try {
      // Check if the download link is valid
      const isValid = await downloadLinkService.isValid(uniqueUrl)
      if (!isValid) {
        res.status(403).json({ error: "Invalid or expired download link" })
        return
      }
  
      // Retrieve the download link
      const downloadLink = await downloadLinkService.retrieveByUniqueUrl(uniqueUrl)
      if (!downloadLink) {
        res.status(404).json({ error: "Download link not found" })
        return
      }
  
      // Get the product variant details
      const variant = await productVariantService.retrieve(downloadLink.product_variant_id, {
        relations: ["product"],
      })
  
      // Get the product media
      const productMedias = await productMediaService.list({
        type: MediaType.MAIN,
        variant_id: downloadLink.product_variant_id,
      })
  
      if (productMedias.length === 0) {
        res.status(404).json({ error: "No digital product found for this variant" })
        return
      }
  
      // Get the presigned URL
      const presignedUrl = await fileService.getPresignedDownloadUrl({
        fileKey: productMedias[0].file_key,
        isPrivate: true,
      })
  
      // Return the variant details, media information, and presigned URL
      res.json({
        download_link: {
          id: downloadLink.id,
          unique_url: downloadLink.unique_url,
          expires_at: downloadLink.expires_at,
        },
        variant: {
          id: variant.id,
          title: variant.title,
          sku: variant.sku,
          thumbnail: variant.product.thumbnail,
          product: {
            id: variant.product.id,
            title: variant.product.title,
          },
          // Add any other relevant variant or product details here
        },
        media: {
          id: productMedias[0].id,
          name: productMedias[0].name,
          mime_type: productMedias[0].mime_type,
        },
        download_url: presignedUrl,
      })
    } catch (error) {
      console.error("Error in download link API:", error)
      res.status(500).json({ error: "An error occurred while processing your request" })
    }
  }