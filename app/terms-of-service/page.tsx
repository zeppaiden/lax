import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              By using our service, you agree to give us your firstborn child and
              promise to read all 47 pages of legal jargon that we know you&apos;ll
              just scroll past anyway.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
