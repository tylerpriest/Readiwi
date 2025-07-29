// Reader plugin exports
export { readerPlugin } from './plugin';
export { useReaderStore } from './stores/reader-store';
export { readerService } from './services/reader-service';

// Components
export { default as ReaderView } from './components/ReaderView';
export { default as ChapterList } from './components/ChapterList';

// Types
export type {
  Chapter,
  ReadingPosition,
  ReaderSettings,
  ReaderState,
  ChapterNavigation,
  ReaderTheme,
} from './types/reader-types';

export { DEFAULT_READER_SETTINGS, READER_THEMES } from './types/reader-types';