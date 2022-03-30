import { render, screen } from '@testing-library/react';
import App from './App';

describe("Renders initial test cases", () => {

  test('Renders "Minesweeper" text in header', () => {
    render(<App />);
    const element = screen.getByText(/Minesweeper/i);
    expect(element).toBeInTheDocument();
  });

  test('Renders initial bombs left "💣 10"', () => {
    render(<App />);
    const element = screen.getByText(/💣 10/i);
    expect(element).toBeInTheDocument();
  });

  test('Renders initial reset button "🙂"', () => {
    render(<App />);
    const element = screen.getByText(/🙂/i);
    expect(element).toBeInTheDocument();
  });

  test('Renders initial timer "00:00"', () => {
    render(<App />);
    const element = screen.getByText(/00:00/i);
    expect(element).toBeInTheDocument();
  });

});

describe("DOM initial test cases", () => {

  test('Found all 72 (8×9) elements with class="cells"', () => {
    render(<App />);
    const elements = document.querySelectorAll('.cell').length;
    expect(elements).toBe(72);
  });

});






