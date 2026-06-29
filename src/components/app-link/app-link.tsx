'use client';

import Button, { type ButtonProps } from '@mui/material/Button';
import { type ComponentProps, forwardRef } from 'react';

import { Link as I18nLink } from '@/i18n/navigation';

type I18nLinkProps = ComponentProps<typeof I18nLink>;

type LinkBehaviorProps = Omit<I18nLinkProps, 'href'> & {
  to: I18nLinkProps['href'];
};

const LinkBehavior = forwardRef<HTMLAnchorElement, LinkBehaviorProps>(function LinkBehavior(
  { to, ...props },
  ref,
) {
  return <I18nLink href={to} ref={ref} {...props} />;
});

type AppLinkAsButtonProps = Omit<ButtonProps, 'component' | 'href' | 'ref'> & {
  href?: undefined;
};

type AppLinkAsLinkProps = Omit<
  ButtonProps<typeof LinkBehavior>,
  'component' | 'href' | 'ref' | 'to'
> & {
  href: I18nLinkProps['href'];
};

type AppLinkProps = AppLinkAsButtonProps | AppLinkAsLinkProps;

export const AppLink = (props: AppLinkProps) => {
  if (props.href !== undefined) {
    const { children, color = 'primary', href, variant, ...linkProps } = props;

    return (
      <Button color={color} component={LinkBehavior} to={href} variant={variant} {...linkProps}>
        {children}
      </Button>
    );
  }

  const { children, color = 'primary', variant, ...buttonProps } = props;

  return (
    <Button color={color} variant={variant} {...buttonProps}>
      {children}
    </Button>
  );
};
