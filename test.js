import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
};

function generateCPF() {
  const randomDigits = () => Math.floor(Math.random() * 10);
  let cpf = '';
  for (let i = 0; i < 11; i++) {
    cpf += randomDigits();
  }

  return cpf;
}

function generateDescription() {
  const products = [
    'Payment for product computer',
    'Payment for product smartphone',
    'Payment for product headphones',
    'Payment for product keyboard',
    'Payment for product mouse',
    'Payment for product monitor',
    'Payment for product laptop',
    'Payment for product tablet',
    'Payment for product smartwatch',
    'Payment for product camera',
  ];

  return products[Math.floor(Math.random() * products.length)];
}

function generateAmount() {
  return parseFloat((Math.random() * (1000 - 10) + 10).toFixed(2));
}

export default function () {
  const cpf = generateCPF();
  const description = generateDescription();
  const amount = generateAmount();

  const payload = JSON.stringify({
    cpf: cpf,
    description: description,
    amount: amount,
    paymentMethod: 'PIX',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://localhost:3000/api/payment', payload, params);

  check(res, {
    'status is 200 or 201': r => r.status === 200 || r.status === 201,
    'has id in data': r => r.json('data.id') !== undefined,
  });
}
