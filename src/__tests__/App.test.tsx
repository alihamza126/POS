import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../app/App';

describe('App', () => {
  it('renders the todo app and allows adding tasks', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Todo app' }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('New task'), {
      target: { value: 'Plan the day' },
    });
    fireEvent.submit(
      screen
        .getByRole('button', { name: 'Add task' })
        .closest('form') as HTMLFormElement,
    );

    expect(screen.getByText('Plan the day')).toBeInTheDocument();
  });
});
