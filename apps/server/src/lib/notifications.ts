interface OrderNotification {
  customerEmail: string;
  orderId: string;
  status: string;
}

export const notifyCustomerAboutOrder = ({ customerEmail, orderId, status }: OrderNotification) => {
  console.info(`[notify] order ${orderId} is now ${status} for ${customerEmail}`);
};
