// PaymentComponent.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

//Create a Stripe promise (stripePromise) using the loadStripe function. This promise is used to load the Stripe.js script asynchronously.
const stripePromise = loadStripe('your_stripe_publishable_key');
const PaymentComponent = () => {
    return (
        <div className="col-md-8 card card-container">
            <h1>Payment</h1>
            {/* Wrap the CheckoutForm component with the Elements component and provide the Stripe promise */}
            <Elements stripe={stripePromise}>
                <CheckoutForm />
            </Elements>
        </div>
    );
};
export default PaymentComponent;