'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function passwordInputType(visible: boolean): 'password' | 'text' {
  return visible ? 'text' : 'password';
}

export function passwordVisibilityAriaLabel(visible: boolean): string {
  return visible ? 'Скрыть пароль' : 'Показать пароль';
}

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<'input'>, 'type'>
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <FormControl>
        <Input
          type={passwordInputType(visible)}
          className={cn('pr-11 font-sans', className)}
          ref={ref}
          {...props}
        />
      </FormControl>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 h-11 w-11 -translate-y-1/2 text-muted hover:bg-transparent hover:text-foreground"
        aria-label={passwordVisibilityAriaLabel(visible)}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
