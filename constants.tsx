
import { Wallpaper } from './types';

export const INITIAL_WALLPAPERS: Wallpaper[] = [
  {
    id: '1',
    url: 'https://picsum.photos/id/10/1200/800',
    title: '星海巡航',
    tags: ['科幻', '赛博朋克'],
    author: '梦境绘师',
  },
  {
    id: '2',
    url: 'https://picsum.photos/id/20/1200/800',
    title: '樱花祭',
    tags: ['唯美', '古风'],
    author: '花开半夏',
  },
  {
    id: '3',
    url: 'https://picsum.photos/id/30/1200/800',
    title: '霓虹街头',
    tags: ['都市', '夜晚'],
    author: '光影捕手',
  },
  {
    id: '4',
    url: 'https://picsum.photos/id/40/1200/800',
    title: '云端彼岸',
    tags: ['天空', '治愈'],
    author: '追风少年',
  },
  {
    id: '5',
    url: 'https://picsum.photos/id/50/1200/800',
    title: '深海歌姬',
    tags: ['海洋', '奇幻'],
    author: '汐音',
  },
  {
    id: '6',
    url: 'https://picsum.photos/id/60/1200/800',
    title: '森林秘境',
    tags: ['自然', '冒险'],
    author: '林间客',
  }
];

export const TAB_ICONS: Record<string, string> = {
  '发现': 'Compass',
  '我的收藏': 'Heart',
};
