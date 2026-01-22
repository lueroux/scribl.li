import { stripe } from '@Scriblli/lib/server-only/stripe';

type CreateCustomerOptions = {
  name: string;
  email: string;
};

export const createCustomer = async ({ name, email }: CreateCustomerOptions) => {
  return await stripe.customers.create({
    name,
    email,
  });
};
