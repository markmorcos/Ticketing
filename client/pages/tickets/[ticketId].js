import Router from "next/router";

import useRequest from "../../hooks/use-request";

const TicketRead = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: { ticketId: ticket.id },
    onSuccess: ({ id }) => Router.push(`/orders/${id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: ${ticket.price}</h4>
      {errors}
      <button className="btn btn-primary" onClick={() => doRequest()}>
        Purchase
      </button>
    </div>
  );
};

TicketRead.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data: ticket } = await client
    .get(`/api/tickets/${ticketId}`)
    .catch((error) => console.log(error?.response?.data?.errors));
  return { ticket };
};

export default TicketRead;
