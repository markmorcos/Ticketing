import "bootstrap/dist/css/bootstrap.css";

import buildClient from "../api/build-client";
import Header from "../components/header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async ({ Component, ctx }) => {
  const client = buildClient(ctx);
  const {
    data: { currentUser },
  } = await client.get("/api/users/current-user").catch(console.log);
  const pageProps = await Component.getInitialProps?.(ctx, client, currentUser);

  return { pageProps, currentUser };
};

export default AppComponent;
