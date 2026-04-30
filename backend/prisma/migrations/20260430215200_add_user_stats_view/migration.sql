-- Create Materialized View for User Statistics
CREATE MATERIALIZED VIEW "UserStats" AS
SELECT 
  "userDetailsId",
  CAST(AVG("rating") AS DOUBLE PRECISION) as "averageRating",
  COUNT("id")::INTEGER as "reviewCount"
FROM "Review"
GROUP BY "userDetailsId";

-- Create unique index for Prisma findUnique compatibility
CREATE UNIQUE INDEX "UserStats_userDetailsId_key" ON "UserStats" ("userDetailsId");