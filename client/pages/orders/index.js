import Link from "next/link";

const OrdersIndex = ({ orders }) => {
  console.log("component orders", orders);
  const orderList = orders.map(
    ({ id, ticket: { id: ticketId, title }, status }) => (
      <tr key={id}>
        <td>
          <Link href={`/tickets/${ticketId}`}>{title}</Link>
        </td>
        <td>{status}</td>
      </tr>
    )
  );

  return (
    <div>
      <h1>Orders</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{orderList}</tbody>
      </table>
    </div>
  );
};

OrdersIndex.getInitialProps = async (context, client) => {
  try {
    const { data: orders } = await client.get("/api/orders");
    console.log("orders", orders);
    return { orders };
  } catch (error) {
    console.log("error", error);
    return { redirect: { destination: "/", permanent: false } };
  }
};

export default OrdersIndex;
