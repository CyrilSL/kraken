import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import ProductMediaService from "../../../services/product-media"
import { MediaType } from "../../../models/product-media"


interface ProductMediaRequestBody {
    id:string;
    variant_id: string;
    file_key: string;X
    type?: string; // Add this line
    name?: string;
    mime_type?: string;
  }


export const POST = async (
  req: MedusaRequest<ProductMediaRequestBody>,
  res: MedusaResponse
) => {
  const {
    id,
    name,
    file_key,
    variant_id,
    type,
    mime_type,
  } = req.body;

  const productMediaService = req.scope.resolve<ProductMediaService>(
    "productMediaService"
  );

  const updatedProductMedia = await productMediaService.update(id, {
    name,
    file_key,
    variant_id,
    type: MediaType[type as keyof typeof MediaType],
    mime_type,
  });

  res.json({
    product_media: updatedProductMedia,
  });
};