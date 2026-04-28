-- Create Materialized View for User Statistics
CREATE MATERIALIZED VIEW "UserStats" AS
SELECT 
  "profileId",
  CAST(AVG("rating") AS DOUBLE PRECISION) as "averageRating",
  COUNT("id")::INTEGER as "reviewCount"
FROM "Review"
GROUP BY "profileId";

-- Create unique index for Prisma findUnique compatibility
CREATE UNIQUE INDEX "UserStats_profileId_key" ON "UserStats" ("profileId");
