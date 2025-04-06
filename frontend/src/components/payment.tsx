import { useState } from 'react';
import axios from 'axios';

type PaymentType = 'subscription' | 'credits';

export default function PaymentPage() {
  const [amount, setAmount] = useState<number>(10);
  const [type, setType] = useState<PaymentType>('credits');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/checkout_sessions', { amount, type });
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Buy Credits / Subscription</h2>

      <div style={{ marginBottom: 10 }}>
        <label>
          Amount (USD):{' '}
          <input
            type="number"
            value={amount}
            min={1}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>
          <select value={type} onChange={(e) => setType(e.target.value as PaymentType)}>
            <option value="credits">Buy Credits</option>
            <option value="subscription">Subscribe</option>
          </select>
        </label>
      </div>

      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Redirecting...' : 'Pay with Stripe'}
      </button>

      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
    </div>
  );
}
