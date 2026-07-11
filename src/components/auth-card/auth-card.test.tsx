import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthCard } from './auth-card';

describe('AuthCard', () => {
  it('renders the title, children, and footer', () => {
    render(
      <AuthCard footer={<div>Footer content</div>} title="Test Title">
        <div>Form content</div>
      </AuthCard>,
    );

    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
    expect(screen.getByText('Form content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('renders without a footer when none is provided', () => {
    render(
      <AuthCard title="Test Title">
        <div>Form content</div>
      </AuthCard>,
    );

    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });
});
