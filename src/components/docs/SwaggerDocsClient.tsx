"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      Loading API explorer…
    </div>
  )
});

export default function SwaggerDocsClient() {
  return (
    <div className="swagger-docs-root min-h-[calc(100dvh-120px)] [&_.swagger-ui]:font-sans">
      <SwaggerUI url="/api/openapi" docExpansion="list" defaultModelExpandDepth={2} persistAuthorization />
    </div>
  );
}
