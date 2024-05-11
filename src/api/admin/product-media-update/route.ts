import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import ProductMediaService from "../../../services/product-media";
import { MediaType } from "../../../models/product-media";

export const POST = async (
  req: MedusaRequest<UpdateProductMediaRequestBody>,
  res: MedusaResponse
) => {
  const productMediaService = req.scope.resolve<ProductMediaService>(
    "productMediaService"
  );

  const { id, ...update } = req.body;

  try {
    const updatedProductMedia = await productMediaService.update(id, update);
    res.json({ product_media: updatedProductMedia });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update product media" });
  }
};

interface UpdateProductMediaRequestBody {
  id: string;
  name?: string;
  file_key?: string;
  type?: string;
  mime_type?: string;
}