export class PublicProfileDto {
  firstName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  tags: {
    skills: string[];
    interests: string[];
  };
  stats: {
    rating: number;
    level: number;
    xpProgress: number;
  };
  badges: BadgeDto[];
  communities: CommunityDto[];
  portfolio: PortfolioItemDto[];
}

export class BadgeDto {
  name: string;
  iconUrl: string;
  description: string | null;
}

export class CommunityDto {
  name: string;
  slug: string;
  avatarUrl: string | null;
}

export class PortfolioItemDto {
  title: string;
  description: string | null;
  link: string | null;
}
