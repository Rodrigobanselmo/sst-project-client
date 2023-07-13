import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import queryString from 'query-string';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Kit: NextPage = () => {
  const { query } = useRouter();
  const queries = queryString.stringify(query || {});

  return (
    <>
      <SHeaderTag hideInitial title={'PDF:Kit Med '} />
      <iframe
        src={`/api/pdf/kit?${queries}`}
        width="100%"
        height="100%"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          width: '100%',
          height: '100%',
        }}
      ></iframe>
      <div
        style={{
          zIndex: 100000,
          height: 200,
          backgroundColor: 'red',
          width: 100,
        }}
      >
        djkendjknjk
      </div>
    </>
  );
};

export default Kit;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
