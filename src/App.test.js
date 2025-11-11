import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Gemini File Search demo heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Gemini File Search デモ/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders company name', () => {
  render(<App />);
  const companyElement = screen.getByText(/株式会社フィールフロウ/i);
  expect(companyElement).toBeInTheDocument();
});
