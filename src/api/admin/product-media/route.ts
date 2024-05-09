import type { 
    MedusaRequest, 
    MedusaResponse,
  } from "@medusajs/medusa"
  import ProductMediaService 
    from "../../../services/product-media"
  import { MediaType } from "../../../models/product-media"
  
  export const GET = async (
    req: MedusaRequest, 
    res: MedusaResponse
  ) => {
    const productMediaService = req.scope.resolve<
      ProductMediaService
    >("productMediaService")
    // omitting pagination for simplicity
    const [productMedias, count] = await productMediaService
      .listAndCount({
        type: MediaType.MAIN,
      }, {
        relations: ["variant"],
      }
    )
  
    res.json({
      product_medias: productMedias,
      count,
    })
  }
  
  interface ProductMediaRequestBody {
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
    // validation omitted for simplicity
    const {
      variant_id,
      file_key,
      type = "main", // default value
      name,
      mime_type,
    } = req.body;
  
    const productMediaService = req.scope.resolve<ProductMediaService>(
      "productMediaService"
    );
  
    const productMedia = await productMediaService.create({
      variant_id,
      file_key,
      type: MediaType[type as keyof typeof MediaType], // Cast the string value to the MediaType enum
      name,
      mime_type,
    });
  
    res.json({
      product_media: productMedia,
    });
  };