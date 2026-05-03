import { Anime, NewsItem } from '../types';

const BASE_URL = 'https://api.jikan.moe/v4';

export async function getTrendingAnime(): Promise<Anime[]> {
  const response = await fetch(`${BASE_URL}/top/anime?filter=airing&limit=10`);
  const data = await response.json();
  return data.data || [];
}

export async function getRecentAnime(): Promise<Anime[]> {
  const response = await fetch(`${BASE_URL}/seasons/now?limit=10`);
  const data = await response.json();
  return data.data || [];
}

export async function getPopularAnime(): Promise<Anime[]> {
  try {
    // Fetch 4 pages to get 100 items for batching
    const pages = [1, 2, 3, 4];
    const results = [];
    
    for (const page of pages) {
      const response = await fetch(`${BASE_URL}/top/anime?filter=bypopularity&page=${page}`);
      if (!response.ok) break;
      const data = await response.json();
      if (data.data) {
        results.push(...data.data);
      }
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    
    return results;
  } catch (e) {
    console.error("Error fetching popular anime:", e);
    return [];
  }
}

export async function searchAnime(query: string, type?: string, status?: string): Promise<Anime[]> {
  try {
    let allResults: Anime[] = [];
    let url = `${BASE_URL}/anime?q=${query}&sfw=true`;
    if (type) url += `&type=${type}`;
    if (status) url += `&status=${status}`;

    // Fetch up to 4 pages to get a good catalog (200 items)
    for (let page = 1; page <= 4; page++) {
      const response = await fetch(`${url}&page=${page}`);
      if (!response.ok) break;
      const data = await response.json();
      if (data.data) {
        allResults.push(...data.data);
      }
      if (!data.pagination?.has_next_page) break;
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    return allResults;
  } catch (e) {
    console.error("Search error:", e);
    return [];
  }
}

export async function getAnimeById(id: number): Promise<Anime> {
  const response = await fetch(`${BASE_URL}/anime/${id}/full`);
  const data = await response.json();
  return data.data;
}

export async function getAnimeNews(source: 'trending' | 'latest' | 'hot' = 'trending'): Promise<NewsItem[]> {
  try {
    let animeSource;
    switch (source) {
      case 'latest':
        animeSource = await getRecentAnime();
        break;
      case 'hot':
        animeSource = await getPopularAnime();
        break;
      case 'trending':
      default:
        animeSource = await getTrendingAnime();
    }

    if (!animeSource || animeSource.length === 0) return [];
    
    // Fetch news for the top 8 anime in parallel to avoid too many requests
    const newsPromises = animeSource.slice(0, 8).map(async (anime: any) => {
      try {
        const newsResponse = await fetch(`${BASE_URL}/anime/${anime.mal_id}/news`);
        const newsData = await newsResponse.json();
        return newsData.data || [];
      } catch (e) {
        return [];
      }
    });

    const allNewsResults = await Promise.all(newsPromises);
    
    // Flatten and sort by date, then remove duplicates
    const flattenedNews = allNewsResults.flat();
    const sortedNews = flattenedNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Unique news items by URL (to avoid duplicate stories shared across anime)
    const uniqueNews = Array.from(new Map(sortedNews.map(item => [item.url, item])).values());
    
    return uniqueNews.slice(0, 30); // Return top entries
  } catch (e) {
    console.error(`Error fetching ${source} news:`, e);
    return [];
  }
}

export async function getAnimeEpisodes(id: number) {
  try {
    let allEpisodes: any[] = [];
    let page = 1;
    let hasNextPage = true;
    
    // Limits to 15 pages (1500 episodes) to prevent infinite loops or extreme delays
    while (hasNextPage && page <= 15) {
      const response = await fetch(`${BASE_URL}/anime/${id}/episodes?page=${page}`);
      if (!response.ok) break;
      const data = await response.json();
      
      if (data.data) {
        allEpisodes.push(...data.data);
      }
      
      hasNextPage = data.pagination?.has_next_page || false;
      page++;
      
      if (hasNextPage) {
        // Respect rate limit
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    }
    
    return allEpisodes;
  } catch (e) {
    console.error("Error fetching episodes:", e);
    return [];
  }
}
