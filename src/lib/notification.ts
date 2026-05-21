type SendOrderEmailInput = {
  orderId: string;
  to: string;
  status: string;
  amount: number;
};

export async function sendOrderStatusEmail(input: SendOrderEmailInput) {
  // Mock inicial: logging transacional
  console.log(
    `[email-mock] Pedido ${input.orderId} | para=${input.to} | status=${input.status} | total=${input.amount.toFixed(2)}`,
  );
}
