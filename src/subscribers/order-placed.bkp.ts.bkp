import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    OrderService,
  } from "@medusajs/medusa"
  
  export default async function handleOrderPlaced({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    const sendGridService = container.resolve("sendgridService")
    const orderService: OrderService = container.resolve(
      "orderService"
    )
  
    const order = await orderService.retrieve(data.id, {
      // you can include other relations as well
      relations: ["items"],
    })
  
    sendGridService.sendEmail({
      templateId: "d-826590d270974e73b1baa55b33ba8309",
      from: "lucascyrilsamuel@gmail.com",
      to: order.email,
      dynamic_template_data: {
        // any data necessary for your template...
        items: order.items,
        status: order.status,
      },
    })
  }
  
  export const config: SubscriberConfig = {
    event: OrderService.Events.PLACED,
    context: {
      subscriberId: "order-placed-handler",
    },
  }