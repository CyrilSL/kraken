import type { 
    AbstractFileService, 
    MedusaRequest, 
    MedusaResponse, 
    OrderService, 
    ProductVariant,
    ProductVariantService,
  } from "@medusajs/medusa"
  import ProductMediaService from "../../../../../services/product-media"
 //import ProductMediaService from "src/services/product-media"
 import { MediaType } from "../../../../../models/product-media"

 
  export const GET = async (
    req: MedusaRequest, 
    res: MedusaResponse
  ) => {
    const variantId = req.params.variant_id
    if (!variantId) {
      res.status(400).json({ error: "Variant ID is required" })
      return
    }
  
    const productVariantService = req.scope.resolve<ProductVariantService>("productVariantService")
    const productMediaService = req.scope.resolve<ProductMediaService>("productMediaService")
    const fileService = req.scope.resolve<AbstractFileService>("fileService")
  
    try {
      // Check if the variant exists
      const variant = await productVariantService.retrieve(variantId)
  
      if (!variant) {
        res.status(404).json({ error: "Product variant not found" })
        return
      }
  
      // Get the product media
      const productMedias = await productMediaService.list({
        type: MediaType.MAIN,
        variant_id: variant.id,
      })
  
      if (productMedias.length === 0) {
        res.status(404).json({ error: "No digital product found for this variant" })
        return
      }
  
      // Get the presigned URL
      const url = await fileService.getPresignedDownloadUrl({
        fileKey: productMedias[0].file_key,
        isPrivate: true,
      })
  
      res.json({
        url,
        name: productMedias[0].name,
        mime_type: productMedias[0].mime_type,
      })
    } catch (error) {
      res.status(500).json({ error: "An error occurred while processing your request" })
    }
  }