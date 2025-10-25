import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import App from './App.jsx'
const stripePromise = loadStripe(
  "pk_test_51RZrxGCBKb71bOIJsDr27TDyA8utt17M5ZB2g6t6L10N8ApCF0zLv6Gp1VU7RMyah42UtPe8e9G4iTvVo4KKiCuC00oFXsPaNc"
);
createRoot(document.getElementById('root')).render(

    <Elements stripe={stripePromise}>
   
      <App />
  
  </Elements>

)
  