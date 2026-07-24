import { Suspense } from "react";
import { ReviewWorkspace } from "@/components/review/review-workspace";
import { CardSkeleton } from "@/components/ui/skeleton";

export default async function ReturnReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<CardSkeleton rows={6} />}>
      <ReviewWorkspace returnId={id} />
    </Suspense>
  );
}
