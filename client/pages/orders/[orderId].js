import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import Router from "next/router";

import useRequest from "../../hooks/use-request";

const OrderRead = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: { orderId: order.id },
    onSuccess: () => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const interval = setInterval(findTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft <= 0) {
    return <div>Order expired</div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds{" "}
      <StripeCheckout
        token={({ id: token }) => doRequest({ token })}
        stripeKey="pk_test_51OXSmaHxxGduf7hIKonxe3PWejAgpaJxp8xB23FJKpd382RWoPAmauml6l7hg7rIM5sYLm0Si6Y5PZdkON2Cgokj00ODR51asQ"
        amount={order.ticket.price * 100}
        currency="usd"
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderRead.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  try {
    const { data: order } = await client.get(`/api/orders/${orderId}`);
    return { order };
  } catch (error) {
    return Router.replace("/orders");
  }
};

export default OrderRead;
