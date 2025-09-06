import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImageGeneratorForm } from '../ImageGeneratorForm'
import expect from "expect";

// Mock fetch

// @ts-ignore
global.fetch = jest.fn();

describe('ImageGeneratorForm', () => {
  beforeEach(() => {
      // @ts-ignore
      (fetch as jest.Mock).mockClear();
  });

  it('renders the form correctly', () => {
    render(<ImageGeneratorForm />)
    expect(screen.getByLabelText(/image prompt/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument()
  })

  it('handles user input', () => {
    render(<ImageGeneratorForm />)
    const input = screen.getByLabelText(/image prompt/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'a cat on a mat' } })
    expect(input.value).toBe('a cat on a mat')
  })

  it('shows loading state on submit', async () => {
    // @ts-ignore
      (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Prevent promise from resolving
    render(<ImageGeneratorForm />)
    const button = screen.getByRole('button', { name: /generate image/i })
    fireEvent.click(button)

    await waitFor(() => {
        expect(button).toBeDisabled()
        expect(button).toHaveTextContent(/generating.../i)
    })
  })

  it('handles successful API response', async () => {
    const mockUrl = 'mock-url';
    // @ts-ignore
      (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ image: mockUrl }),
    });

    render(<ImageGeneratorForm />);
    const input = screen.getByLabelText(/image prompt/i);
    const button = screen.getByRole('button', { name: /generate image/i });

    fireEvent.change(input, { target: { value: 'a beautiful landscape' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByAltText('Generated')).toHaveAttribute('src', mockUrl);
    });
  });

  it('handles API error', async () => {
    // @ts-ignore
      (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<ImageGeneratorForm />);
    const input = screen.getByLabelText(/image prompt/i);
    const button = screen.getByRole('button', { name: /generate image/i });

    fireEvent.change(input, { target: { value: 'a broken prompt' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/failed to generate image/i)).toBeInTheDocument();
    });
  });
});
