import React, { useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import { useChangePasswordMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

const ChangePassword: NextPage<{ token: string }> = () => {
  const router = useRouter(); 
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token: typeof router.query.token === 'string' ? router.query.token : '',
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors as any)
            if ('token' in errorMap) {
              setTokenError(errorMap.token)
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            //worked
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="newPassword" placeholder="newPassword" label="New Password" type="password" />
            {tokenError ? (
              <Flex>
                <Box mr={2} style={{ color: "red" }}>{tokenError}</Box>
                <NextLink href="/forgot-password">
                  <Link>click here to generate a new token</Link>
                </NextLink>
              </Flex>
            ) : null}
            <Button mt={4} isLoading={isSubmitting} type="submit" colorScheme="teal">Change Password</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword as any);
