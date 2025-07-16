import Image from 'next/image'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Image
              src="/brand/favicon-16x16.png"
              alt="GuAskReal Logo"
              width={16}
              height={16}
              className="size-4"
            />
          </div>
          <span className="text-2xl font-bold">GuAskReal.</span>
        </a>
        {children}
      </div>
    </div>
  )
}
