// ============================================================
//  CineList — Master Models
//  Think of this as the single source of truth for all data
//  structures, enums, and relationships in the app.
//  Similar to Django models.py / SQLAlchemy models.
// ============================================================


// ─────────────────────────────────────────────────────────────
//  MASTER TABLE: genres
//  Supabase table name: genres
// ─────────────────────────────────────────────────────────────
//
//  id          uuid        PK, default gen_random_uuid()
//  name        text        UNIQUE NOT NULL   e.g. "Sci-Fi"
//  color       text        NOT NULL          hex or CSS var
//  created_at  timestamptz default now()
//
export const GENRES = [
  { id: 1,  name: 'Action',      color: '#FF6B6B' },
  { id: 2,  name: 'Adventure',   color: '#FF9F43' },
  { id: 3,  name: 'Animation',   color: '#F7C948' },
  { id: 4,  name: 'Comedy',      color: '#F9CA24' },
  { id: 5,  name: 'Crime',       color: '#6C5CE7' },
  { id: 6,  name: 'Documentary', color: '#A29BFE' },
  { id: 7,  name: 'Drama',       color: '#74B9FF' },
  { id: 8,  name: 'Fantasy',     color: '#FD79A8' },
  { id: 9,  name: 'Horror',      color: '#D63031' },
  { id: 10, name: 'Musical',     color: '#FDCB6E' },
  { id: 11, name: 'Mystery',     color: '#81ECEC' },
  { id: 12, name: 'Romance',     color: '#FF7675' },
  { id: 13, name: 'Sci-Fi',      color: '#00CEC9' },
  { id: 14, name: 'Thriller',    color: '#B2BEC3' },
  { id: 15, name: 'Western',     color: '#E17055' },
]

// Helper: get genre by name
export const getGenreByName = (name) =>
  GENRES.find(g => g.name.toLowerCase() === name?.toLowerCase())

// Helper: get color for a genre name (fallback gray)
export const getGenreColor = (name) =>
  getGenreByName(name)?.color ?? '#888888'


// ─────────────────────────────────────────────────────────────
//  MASTER TABLE: platforms (OTTs / Where to Watch)
//  Supabase table name: platforms
//
//  Just a name + emoji lookup. No link here — links are
//  per-movie (user adds a specific URL for that movie).
// ─────────────────────────────────────────────────────────────
//
//  id          uuid        PK, default gen_random_uuid()
//  name        text        UNIQUE NOT NULL   e.g. "Netflix"
//  logo_emoji  text        nullable          quick visual cue
//  created_at  timestamptz default now()
//
export const PLATFORMS = [
  { id: 1,  name: 'Netflix',           logo_emoji: '🔴' },
  { id: 2,  name: 'Prime Video',       logo_emoji: '🔵' },
  { id: 3,  name: 'Disney+',           logo_emoji: '✨' },
  { id: 4,  name: 'Apple TV+',         logo_emoji: '🍎' },
  { id: 5,  name: 'HBO Max',           logo_emoji: '👑' },
  { id: 6,  name: 'Hulu',              logo_emoji: '🟢' },
  { id: 7,  name: 'Peacock',           logo_emoji: '🦚' },
  { id: 8,  name: 'Paramount+',        logo_emoji: '⭐' },
  { id: 9,  name: 'MUBI',              logo_emoji: '🎞️' },
  { id: 10, name: 'JioCinema',         logo_emoji: '🎬' },
  { id: 11, name: 'JioHotstar',        logo_emoji: '🌟' },
  { id: 12, name: 'SonyLIV',           logo_emoji: '🎭' },
  { id: 13, name: 'ZEE5',              logo_emoji: '🟣' },
  { id: 14, name: 'YouTube Premium',   logo_emoji: '▶️' },
  { id: 15, name: 'Criterion Channel', logo_emoji: '🏆' },
  { id: 16, name: 'Other',             logo_emoji: '🌐' },
]

// Helper: get platform by name
export const getPlatformByName = (name) =>
  PLATFORMS.find(p => p.name.toLowerCase() === name?.toLowerCase())


// ─────────────────────────────────────────────────────────────
//  TABLE: movies
//  Supabase table name: movies
// ─────────────────────────────────────────────────────────────
//
//  id              uuid        PK, default gen_random_uuid()
//  title           text        NOT NULL
//  poster_path     text        nullable   TMDB poster path e.g. "/abc.jpg"
//  release_year    text        nullable   e.g. "2024"
//  tmdb_id         integer     nullable   UNIQUE — for deduplication
//  avg_rating      numeric     nullable   recomputed on every new rating
//  rating_count    integer     default 0
//  added_by        uuid        FK → auth.users(id)  NOT NULL
//  created_at      timestamptz default now()
//
//  ── Relationships (junction tables) ──
//  genres       : many-to-many via movie_genres
//  platforms    : many-to-many via movie_platforms
//                 + watch_link text nullable  ← movie-specific URL added by user
//  ratings      : one-to-many  via ratings

/**
 * @typedef {Object} Movie
 * @property {string}   id
 * @property {string}   title
 * @property {string|null} poster_path
 * @property {string|null} release_year
 * @property {number|null} tmdb_id
 * @property {number|null} avg_rating
 * @property {number}   rating_count
 * @property {string}   added_by          — user id
 * @property {string}   added_by_name     — joined from users (display)
 * @property {string}   created_at
 *
 * @property {string[]}   genres           — joined genre names
 * @property {string|null} platform        — platform name (from platforms master)
 * @property {string|null} watch_link      — movie-specific URL, optional, added by user
 * @property {boolean}    watched_by_me    — derived from ratings
 * @property {number|null} my_rating       — derived from ratings
 */


// ─────────────────────────────────────────────────────────────
//  JUNCTION TABLE: movie_genres
//  Supabase table name: movie_genres
// ─────────────────────────────────────────────────────────────
//
//  movie_id    uuid   FK → movies(id)   ON DELETE CASCADE
//  genre_id    uuid   FK → genres(id)   ON DELETE CASCADE
//  PRIMARY KEY (movie_id, genre_id)


// ─────────────────────────────────────────────────────────────
//  JUNCTION TABLE: movie_platforms
//  Supabase table name: movie_platforms
// ─────────────────────────────────────────────────────────────
//
//  movie_id      uuid   FK → movies(id)     ON DELETE CASCADE
//  platform_id   uuid   FK → platforms(id)  ON DELETE CASCADE
//  PRIMARY KEY (movie_id, platform_id)


// ─────────────────────────────────────────────────────────────
//  TABLE: ratings
//  Supabase table name: ratings
// ─────────────────────────────────────────────────────────────
//
//  id          uuid        PK, default gen_random_uuid()
//  movie_id    uuid        FK → movies(id)      ON DELETE CASCADE
//  user_id     uuid        FK → auth.users(id)  ON DELETE CASCADE
//  rating      smallint    NOT NULL  CHECK (rating >= 1 AND rating <= 10)
//  created_at  timestamptz default now()
//  UNIQUE (movie_id, user_id)   ← one rating per user per movie
//
//  A row existing = that user has watched this movie.
//  No separate "watched" boolean needed.

/**
 * @typedef {Object} Rating
 * @property {string} id
 * @property {string} movie_id
 * @property {string} user_id
 * @property {number} rating       — 1 to 10
 * @property {string} created_at
 */


// ─────────────────────────────────────────────────────────────
//  SUPABASE SQL — run this in the Supabase SQL editor
//  to create all tables in one shot (copy everything below)
// ─────────────────────────────────────────────────────────────
//
// -- Enable UUID extension
// create extension if not exists "pgcrypto";
//
// -- genres
// create table genres (
//   id         serial primary key,
//   name       text unique not null,
//   color      text not null,
//   created_at timestamptz default now()
// );
//
// -- platforms (no link column — links live on movie_platforms)
// create table platforms (
//   id          serial primary key,
//   name        text unique not null,
//   logo_emoji  text,
//   created_at  timestamptz default now()
// );
//
// -- movies
// create table movies (
//   id           uuid primary key default gen_random_uuid(),
//   title        text not null,
//   poster_path  text,
//   release_year text,
//   tmdb_id      integer unique,
//   avg_rating   numeric,
//   rating_count integer default 0,
//   added_by     uuid references auth.users(id) on delete cascade not null,
//   created_at   timestamptz default now()
// );
//
// -- movie_genres (junction)
// create table movie_genres (
//   movie_id  uuid references movies(id) on delete cascade,
//   genre_id  integer references genres(id) on delete cascade,
//   primary key (movie_id, genre_id)
// );
//
// -- movie_platforms (junction)
// -- watch_link is per-movie — the user pastes a specific URL for that movie
// create table movie_platforms (
//   movie_id    uuid references movies(id) on delete cascade,
//   platform_id integer references platforms(id) on delete cascade,
//   watch_link  text,   -- optional, movie-specific URL added by user
//   primary key (movie_id, platform_id)
// );
//
// -- ratings
// create table ratings (
//   id         uuid primary key default gen_random_uuid(),
//   movie_id   uuid references movies(id) on delete cascade not null,
//   user_id    uuid references auth.users(id) on delete cascade not null,
//   rating     smallint not null check (rating >= 1 and rating <= 10),
//   created_at timestamptz default now(),
//   unique (movie_id, user_id)
// );
//
// -- Seed genres
// insert into genres (name, color) values
//   ('Action','#FF6B6B'),('Adventure','#FF9F43'),('Animation','#F7C948'),
//   ('Comedy','#F9CA24'),('Crime','#6C5CE7'),('Documentary','#A29BFE'),
//   ('Drama','#74B9FF'),('Fantasy','#FD79A8'),('Horror','#D63031'),
//   ('Musical','#FDCB6E'),('Mystery','#81ECEC'),('Romance','#FF7675'),
//   ('Sci-Fi','#00CEC9'),('Thriller','#B2BEC3'),('Western','#E17055');
//
// -- Seed platforms
// insert into platforms (name, logo_emoji) values
//   ('Netflix','🔴'),
//   ('Prime Video','🔵'),
//   ('Disney+','✨'),
//   ('Apple TV+','🍎'),
//   ('HBO Max','👑'),
//   ('Hulu','🟢'),
//   ('Peacock','🦚'),
//   ('Paramount+','⭐'),
//   ('MUBI','🎞️'),
//   ('JioCinema','🎬'),
//   ('JioHotstar','🌟'),
//   ('SonyLIV','🎭'),
//   ('ZEE5','🟣'),
//   ('YouTube Premium','▶️'),
//   ('Criterion Channel','🏆'),
//   ('Other','🌐');