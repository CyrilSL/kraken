import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    OrderService,
    AbstractFileService,
  } from "@medusajs/medusa"
  import ProductMediaService from "../services/product-media"
  
  export default async function handleOrderPlaced({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    const orderService: OrderService = container.resolve(
      "orderService"
    )
    const fileService: AbstractFileService = container.resolve(
      "fileService"
    )
    const productMediaService: ProductMediaService = 
      container.resolve(
        "productMediaService"
      )
    const sendgridService = container.resolve("sendgridService")
  
    const order = await orderService.retrieve(data.id, {
      relations: [
        "items", 
        "items.variant", 
      ],
    })
  
    // find product medias in the order
    const urls = []
      for (const item of order.items) {
    const productMedias = await productMediaService
      .retrieveMediasByVariant(item.variant)
    const downloadUrls = await Promise.all(
      productMedias.map(async (productMedia) => {
       
    // get the download URL from the file service
        return await fileService.getPresignedDownloadUrl({
          fileKey: productMedia.file_key,
          isPrivate: true,
        })
      })
    )
  
    urls.push(...downloadUrls)
    }
  
    sendgridService.sendEmail({
      templateId: "digital-download",
      from: "hello@medusajs.com",
      to: order.email,
      dynamic_template_data: {
        // any data necessary for your template...
        digital_download_urls: urls,
      },
    })
  }
  
  export const config: SubscriberConfig = {
    event: OrderService.Events.PLACED,
    context: {
      subscriberId: "order-placed-handler",
    },
  }