//CREATE DATABASE readbud;

CREATE TABLE library(
    id SERIAL PRIMARY KEY,
    userid VARCHAR(30),
    title VARCHAR(100),
    text TEXT UNIQUE,
    added_on DATE NOT NULL DEFAULT CURRENT_DATE,
    language_learn VARCHAR(10),
    language_first VARCHAR(10),
    word_count INTEGER,
    UNIQUE (title, text, language_learn, language_first)
);

CREATE TABLE words(
    id SERIAL PRIMARY KEY,
    userid VARCHAR(30),
    word VARCHAR(50),
    learned BOOLEAN,
    language_learn VARCHAR(10),
    language_first VARCHAR(10),
    UNIQUE (word, language_first, language_learn)
);