import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Control,
  FieldValues,
  UseControllerProps,
  useController,
} from "react-hook-form";

type InputProps<T extends FieldValues> = Omit<
  React.ComponentProps<"input">,
  "name"
> &
  Omit<UseControllerProps<T>, "control"> & {
    control: Control<T>;
  };

const Input = <T extends FieldValues>(props: InputProps<T>) => {
  const { name, control, className, type, ...rest } = props;

  const {
    field: { ref, value, onChange, onBlur, ...fieldRest },
    formState: { errors },
  } = useController<T>({ name, control });

  const errorMessage = errors?.[name]?.message;
  const isInvalid = !!errorMessage;

  return (
    <div className="w-full">
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          isInvalid && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        {...fieldRest}
        {...rest}
      />
      {isInvalid && (
        <p className="mt-1 text-xs text-red-500">{String(errorMessage)}</p>
      )}
    </div>
  );
};

Input.displayName = "Input";

export { Input };
