import NextError from 'next/error';

function Error({ statusCode }) {
  return <NextError statusCode={statusCode} />;
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res?.statusCode || err?.statusCode || 404;
  return { statusCode };
};

export default Error;
