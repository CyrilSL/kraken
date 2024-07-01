import {
  type SubscriberConfig,
  type SubscriberArgs,
  OrderService,
  ProductVariantService,
} from "@medusajs/medusa"
import ProductMediaService from "../services/product-media"
import { MediaType } from "../models/product-media"

export default async function handleOrderPlaced({
  data,
  eventName,
  container,
  pluginOptions,
}: SubscriberArgs<Record<string, string>>) {
  const sendGridService = container.resolve("sendgridService")
  const orderService: OrderService = container.resolve("orderService")
  const productVariantService: ProductVariantService = container.resolve("productVariantService")
  const productMediaService: ProductMediaService = container.resolve("productMediaService")
  const fileService = container.resolve("fileService")

  const order = await orderService.retrieve(data.id, {
    relations: ["items", "items.variant"],
  })



  
  const downloadLinkService = container.resolve("downloadLinkService")
  const downloadLinks = []

  for (const item of order.items) {
    const productMedias = await productMediaService.retrieveMediasByVariant(item.variant)
    if (productMedias.length > 0) {
      const downloadLink = await downloadLinkService.create({
        order_id: order.id,
        product_variant_id: item.variant_id,
      })
      downloadLinks.push(downloadLink)
    }
  }

  sendGridService.sendEmail({
    templateId: "d-826590d270974e73b1baa55b33ba8309",
    from: "lucascyrilsamuel@gmail.com",
    to: order.email,
    dynamic_template_data: {
      download_links: downloadLinks.map(link => `${process.env.FRONTEND_URL}/d/${link.unique_url}`),
    },
  })

  console.log("unique link : ",downloadLinks.map(link => `${process.env.FRONTEND_URL}/d/${link.unique_url}`))

  const digitalProducts = await Promise.all(
    order.items.map(async (item) => {
      const productMedias = await productMediaService.list({
        type: MediaType.MAIN,
        variant_id: item.variant_id,
      })

      if (productMedias.length > 0) {
        const url = await fileService.getPresignedDownloadUrl({
          fileKey: productMedias[0].file_key,
          isPrivate: true,
        })

        return {
          name: item.title,
          url,
          mime_type: productMedias[0].mime_type,
        }
      }

      return null
    })
  )

  const filteredDigitalProducts = digitalProducts.filter(product => product !== null)

  sendGridService.sendEmail({
    templateId: "d-826590d270974e73b1baa55b33ba8309",
    from: "lucascyrilsamuel@gmail.com",
    to: order.email,
    dynamic_template_data: {
      orderId: order.id,  // Add the order ID here
      items: order.items,
      status: order.status,
      digitalProducts: filteredDigitalProducts,
    },
  })
}

export const config: SubscriberConfig = {
  event: OrderService.Events.PLACED,
  context: {
    subscriberId: "order-placed-handler",
  },
}