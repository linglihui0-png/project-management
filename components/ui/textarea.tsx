import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
          "flex min-h-16 w-full rounded-lg border border-gray-300 bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-gray-500 focus-visible:border-blue-500 focus-visible:ring-3 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20 md:text-sm",
          className
        )}
      {...props}
    />
  )
}

export { Textarea }
