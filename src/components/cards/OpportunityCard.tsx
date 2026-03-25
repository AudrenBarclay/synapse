import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Opportunity } from "@/types";
import { formatMiles } from "@/utils/format";

export function OpportunityCard({
  opportunity,
  compact
}: {
  opportunity: Opportunity;
  compact?: boolean;
}) {
  return (
    <Card className="transition hover:shadow-card">
      <CardContent className={compact ? "p-4" : undefined}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-slate-900">
                {opportunity.specialty} shadowing
              </div>
              <div className="text-sm text-slate-600">
                {opportunity.doctorName} · {opportunity.locationLabel}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="slate">{formatMiles(opportunity.distanceMiles)}</Badge>
              {opportunity.available ? (
                <Badge variant="mint">Available</Badge>
              ) : (
                <Badge variant="slate">Waitlist</Badge>
              )}
            </div>
            <p className="text-sm text-slate-600">{opportunity.description}</p>
          </div>
          <Link href={`/doctors/${opportunity.doctorId}`} className="shrink-0">
            <Button size="sm" variant="secondary">
              Doctor
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

