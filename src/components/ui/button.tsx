import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../shared/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-navy/20 bg-background text-navy hover:bg-navy/5 hover:border-navy/30',
        secondary:
          'bg-white text-navy border border-navy/10 shadow-soft hover:bg-navy/5',
        ghost: 'text-navy hover:bg-navy/5',
        link: 'text-primary underline-offset-4 hover:underline',
        navy: 'bg-navy text-white shadow-lg shadow-navy/20 hover:bg-navy/90 hover:shadow-navy/30',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
Button.defaultProps = {
  asChild: false,
};

export { Button, buttonVariants };
