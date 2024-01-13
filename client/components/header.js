import Link from "next/link";

export default ({ currentUser }) => {
  const links = (
    currentUser
      ? [
          { label: "Orders", href: "/orders" },
          { label: "Sell a Ticket", href: "/tickets/new" },
          { label: "Sign Out", href: "/auth/sign-out" },
        ]
      : [
          { label: "Sign Up", href: "/auth/sign-up" },
          { label: "Sign In", href: "/auth/sign-in" },
        ]
  ).map(({ label, href }) => (
    <li key={href}>
      <Link className="navbar-brand" href={href}>
        {label}
      </Link>
    </li>
  ));

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" href="/">
          GitTix
        </Link>
        <div className="d-flex justify-content-end">
          <ul className="nav d-flex align-items-center">{links}</ul>
        </div>
      </div>
    </nav>
  );
};
