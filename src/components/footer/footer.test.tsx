import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';

import { Footer } from './footer';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string | { pathname: string };
  }) => (
    <a href={typeof href === 'string' ? href : href.pathname} {...props}>
      {children}
    </a>
  ),
}));

describe('Footer', () => {
  it('renders About link', async () => {
    const footerComponent = await Footer();
    render(footerComponent);

    expect(screen.getByRole('link', { name: 'aboutLink' })).toHaveAttribute('href', '/about');
  });

  it('renders GitHub link and open it in a new tab', async () => {
    const footerComponent = await Footer();
    render(footerComponent);

    const githubLink = screen.getByRole('link', { name: 'githubLink' });
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/AlyaEngineer/swagger-editor-app',
    );
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders current year in the copyright line', async () => {
    const footerComponent = await Footer();
    render(footerComponent);

    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Swagger Editor App`)).toBeInTheDocument();
  });
});
