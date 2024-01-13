import Link from "next/link";

const LandingPage = ({ tickets }) => {
  const ticketList = tickets.map(({ id, title, price }) => (
    <tr key={id}>
      <td>{title}</td>
      <td>{price}</td>
      <td>
        <Link href={`/tickets/${id}`}>View</Link>
      </td>
    </tr>
  ));

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client) => {
  const { data: tickets } = await client.get("/api/tickets");

  return { tickets };
};

export default LandingPage;
