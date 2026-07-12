import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

type MockAppLinkButtonProps = ComponentPropsWithoutRef<'a'> & {
  color?: string;
  endIcon?: ReactNode;
  isExternal?: boolean;
  variant?: string;
};

vi.mock('@/components', () => ({
  AppLinkButton: (props: MockAppLinkButtonProps) => {
    const { children, href, isExternal, ...linkProps } = props;
    delete linkProps.color;
    delete linkProps.endIcon;
    delete linkProps.variant;

    return (
      <a
        href={href as string}
        rel={isExternal ? 'noreferrer' : linkProps.rel}
        target={isExternal ? '_blank' : linkProps.target}
        {...linkProps}
      >
        {children}
      </a>
    );
  },
}));

import AboutPage, { generateMetadata } from './page';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));

const params = Promise.resolve({ locale: 'en' });

describe('AboutPage', () => {
  it('renders the course, project, team, and resource sections', async () => {
    render(await AboutPage({ params }));

    expect(screen.getByRole('heading', { level: 1, name: 'hero.title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'course.title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'project.title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'team.title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'resources.title' })).toBeInTheDocument();
  });

  it('renders every team member with a GitHub profile link', async () => {
    render(await AboutPage({ params }));

    expect(screen.getByText('Alla Tsaiukova')).toBeInTheDocument();
    expect(screen.getByText('Yulia Demir')).toBeInTheDocument();
    expect(screen.getByText('Ivan Khodorov')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'team.githubProfile' })).toHaveLength(3);
  });

  it('renders links to the course, school, docs, and repository', async () => {
    render(await AboutPage({ params }));

    expect(screen.getAllByRole('link', { name: 'resources.course' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'resources.course' })[0]).toHaveAttribute(
      'href',
      'https://rs.school/courses/reactjs',
    );
    expect(screen.getByRole('link', { name: 'resources.school' })).toHaveAttribute(
      'href',
      'https://rs.school/',
    );
    expect(screen.getByRole('link', { name: 'resources.docs' })).toHaveAttribute(
      'href',
      'https://rs.school/docs',
    );
    expect(screen.getAllByRole('link', { name: 'resources.repository' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'resources.repository' })[0]).toHaveAttribute(
      'href',
      'https://github.com/AlyaEngineer/swagger-editor-app',
    );
  });

  it('generates localized page metadata', async () => {
    await expect(generateMetadata({ params })).resolves.toEqual({
      description: 'metadata.description',
      title: 'metadata.title',
    });
  });
});
