"use client";

import * as React from "react";

export type FilePickerHandle = {
  open: () => void;
  reset: () => void;
};

export interface FileInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "type" | "value" | "defaultValue" | "onChange"
  > {
  onFilesSelected: (files: File[]) => void;
}

const FileInput = React.forwardRef<FilePickerHandle, FileInputProps>(
  function FileInput(
    { onFilesSelected, multiple = false, className, ...props },
    forwardedRef,
  ) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(
      forwardedRef,
      () => ({
        open: () => inputRef.current?.click(),
        reset: () => {
          if (inputRef.current) inputRef.current.value = "";
        },
      }),
      [],
    );

    return (
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        tabIndex={-1}
        className={className ?? "sr-only"}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);

          if (files.length > 0) {
            onFilesSelected(files);
          }

          event.currentTarget.value = "";
        }}
        {...props}
      />
    );
  },
);

FileInput.displayName = "FileInput";

export { FileInput };
