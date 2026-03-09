# Energy Drink Rating Website

## Table of Contents

- [Overview](#overview)
- [Main Goals](#main-goals)
- [Website Structure](#website-structure)
  - [Main Page (Energy Catalog)](#main-page-energy-catalog)
  - [Card Hover Behavior](#card-hover-behavior)
- [Energy Drink Data Fields](#energy-drink-data-fields)
- [Visual Rating Modes](#visual-rating-modes)
  - [Star Mode ⭐](#star-mode-)
  - [Diagram Mode 📊](#diagram-mode-)
- [Flavor-Based Background Colors](#flavor-based-background-colors)
- [Review System](#review-system)
  - [Review Page Contains](#review-page-contains)
- [User Actions](#user-actions)
- [Admin Features](#admin-features)
  - [Add Energy Drinks](#add-energy-drinks)
  - [Delete Energy Drinks](#delete-energy-drinks)
  - [Manage Reviews](#manage-reviews)
- [UI / Design](#ui--design)
  - [Layout](#layout)
  - [Card Design](#card-design)
- [Technologies (Planned)](#technologies-planned)
- [Possible Future Features](#possible-future-features)
- [Project Purpose](#project-purpose)

## Overview

This project is a concept website for reviewing and ranking energy
drinks.\
Users can browse a visual grid of energy drinks, quickly compare their
taste characteristics, and read community reviews.

The site focuses on **visual comparison**, **user reviews**, and **clear
taste metrics** so visitors can quickly decide which drink to try.

---

# Main Goals

- Provide a **clear ranking system** for energy drinks.
- Show **taste characteristics and other metrics visually**.
- Allow users to **add and read reviews** for each drink.
- Give admins the ability to **add, edit, and remove drinks and
  reviews**.
- Present information in a **modern tile‑based UI**.

---

# Website Structure

## 1. Main Page (Energy Catalog)

The main page displays all energy drinks in a **grid / tile layout**.

Each tile (card) includes:

- Drink photo
- Drink name
- Price
- Average rating (stars, 0--5)
- Quick visual flavor indicators

### Card Hover Behavior

When hovering over a card:

The card expands and reveals:

- Detailed taste metrics
- Sugar information
- Additional flavor characteristics

The expansion occurs **only on the hovered card**, not on all cards.

---

# Energy Drink Data Fields

Each energy drink contains:

- Name
- Image
- Price
- Average rating (calculated from metrics)
- Taste metrics:
  - Sourness (1--5)
  - Sweetness (1--5)
  - Concentration / intensity (1--5)
  - Carbonation (1--5)
  - Aftertaste strength (1--5)
  - Price value (1--5)
- Boolean flag:
  - **Sugar free** (true / false)

---

# Visual Rating Modes

Users can switch between two ways to view taste metrics:

## 1. Star Mode ⭐

Each metric is displayed using stars (1--5).

Example:

Sourness ⭐⭐⭐\
Sweetness ⭐⭐\
Intensity ⭐⭐⭐⭐

## 2. Diagram Mode 📊

Metrics are shown using a **radar / taste diagram**.

This allows users to quickly see the flavor profile.

A **toggle switch** lets users change between these modes.

---

# Flavor-Based Background Colors

Cards receive subtle background colors depending on flavor type.

Examples:

Flavor type Background tone

---

Citrus Light yellow
Tropical Orange
Berry Pink / purple
Classic Neutral gray
Apple Light green

This helps users visually scan drinks faster.

---

# Review System

Each energy drink has its own **review page**.

Instead of creating separate static pages, the review page is
**dynamic** and loads the selected drink.

## Review Page Contains

- Drink image and name
- Overall rating
- Taste metrics
- List of user reviews

Each review includes:

- Username
- Comment
- Personal rating
- Date

---

# User Actions

Users can:

- Browse all energy drinks
- Open a drink's review page
- Read other people's reviews
- Switch rating display (stars / diagram)

Optional features:

- Sort drinks by rating
- Filter sugar‑free drinks

---

# Admin Features

Admins have extended control.

Admins can:

## Add Energy Drinks

Create a new drink card with:

- Name
- Image
- Price
- Taste metrics
- Sugar-free flag

## Delete Energy Drinks

Remove drinks from the catalog.

## Manage Reviews

Admins can:

- Add reviews
- Delete reviews

Restriction:

Admins **cannot modify rating values of existing user reviews**, only
remove them.

---

# UI / Design

## Layout

- Responsive grid layout
- Large modern cards
- Smooth hover expansion
- Clean typography

## Card Design

Card includes:

Top section: - Image

Middle: - Name - Price

Bottom: - Average rating

Expanded section: - Taste metrics - Sugar-free badge - Quick flavor
summary

---

# Technologies (Planned)

Frontend:

- HTML
- CSS
- JavaScript

Possible future stack:

- React / Vue for UI
- Node.js backend
- Database for drinks and reviews

---

# Possible Future Features

- Search bar
- Advanced filters
- Community voting
- Favorite drinks
- Personal tasting lists
- Mobile optimization
- API for drink database

---

# Project Purpose

This site is designed as a **visual database and review platform for
energy drinks**.

It helps users:

- Discover new drinks
- Compare taste profiles
- Share their experiences
- Find the best energy drinks quickly

---

# Сайт рейтинга энергетических напитков

## Оглавление

- [Обзор](#обзор)
- [Основные цели](#основные-цели)
- [Структура сайта](#структура-сайта)
  - [Главная страница (Каталог напитков)](#главная-страница-каталог-напитков)
  - [Поведение карточки при наведении](#поведение-карточки-при-наведении)
- [Поля данных энергетических напитков](#поля-данных-энергетических-напитков)
- [Режимы визуального рейтинга](#режимы-визуального-рейтинга)
  - [Режим звезд ⭐](#режим-звезд-)
  - [Режим диаграммы 📊](#режим-диаграммы-)
- [Цвета фона на основе вкуса](#цвета-фона-на-основе-вкуса)
- [Система отзывов](#система-отзывов)
  - [Содержимое страницы отзывов](#содержимое-страницы-отзывов)
- [Действия пользователей](#действия-пользователей)
- [Функции администратора](#функции-администратора)
  - [Добавление энергетических напитков](#добавление-энергетических-напитков)
  - [Удаление энергетических напитков](#удаление-энергетических-напитков)
  - [Управление отзывами](#управление-отзывами)
- [UI / Дизайн](#ui--дизайн)
  - [Макет](#макет)
  - [Дизайн карточки](#дизайн-карточки)
- [Технологии (Планируемые)](#технологии-планируемые)
- [Возможные будущие функции](#возможные-будущие-функции)
- [Цель проекта](#цель-проекта)

## Обзор

Этот проект представляет собой концептуальный сайт для обзора и ранжирования энергетических напитков. Пользователи могут просматривать визуальную сетку энергетических напитков, быстро сравнивать их вкусовые характеристики и читать отзывы сообщества.

Сайт фокусируется на **визуальном сравнении**, **отзывах пользователей** и **ясных метриках вкуса**, чтобы посетители могли быстро решить, какой напиток попробовать.

---

# Основные цели

- Предоставить **ясную систему ранжирования** для энергетических напитков.
- Показывать **вкусовые характеристики и другие метрики визуально**.
- Позволить пользователям **добавлять и читать отзывы** для каждого напитка.
- Дать администраторам возможность **добавлять, редактировать и удалять напитки и отзывы**.
- Представлять информацию в **современном интерфейсе на основе плиток**.

---

# Структура сайта

## 1. Главная страница (Каталог напитков)

Главная страница отображает все энергетические напитки в **сетке / плиточном макете**.

Каждая плитка (карточка) включает:

- Фото напитка
- Название напитка
- Цена
- Средний рейтинг (звезды, 0--5)
- Быстрые визуальные индикаторы вкуса

### Поведение карточки при наведении

При наведении на карточку:

Карточка расширяется и раскрывает:

- Детальные метрики вкуса
- Информацию о сахаре
- Дополнительные характеристики вкуса

Расширение происходит **только на наведенной карточке**, не на всех карточках.

---

# Поля данных энергетических напитков

Каждый энергетический напиток содержит:

- Название
- Изображение
- Цена
- Средний рейтинг (рассчитывается из метрик)
- Метрики вкуса:
  - Кислотность (1--5)
  - Сладость (1--5)
  - Концентрация / интенсивность (1--5)
  - Газировка (1--5)
  - Сила послевкусия (1--5)
  - Ценность цены (1--5)
- Булевый флаг:
  - **Без сахара** (true / false)

---

# Режимы визуального рейтинга

Пользователи могут переключаться между двумя способами просмотра метрик вкуса:

## 1. Режим звезд ⭐

Каждая метрика отображается с использованием звезд (1--5).

Пример:

Кислотность ⭐⭐⭐\
Сладость ⭐⭐\
Интенсивность ⭐⭐⭐⭐

## 2. Режим диаграммы 📊

Метрики показываются с использованием **радара / вкусовой диаграммы**.

Это позволяет быстро увидеть профиль вкуса.

**Переключатель** позволяет пользователям изменять между этими режимами.

---

# Цвета фона на основе вкуса

Карточки получают тонкие фоновые цвета в зависимости от типа вкуса.

Примеры:

Тип вкуса Тон фона

---

Цитрус Светло-желтый
Тропический Оранжевый
Ягодный Розовый / фиолетовый
Классический Нейтральный серый
Яблочный Светло-зеленый

Это помогает пользователям визуально сканировать напитки быстрее.

---

# Система отзывов

Каждый энергетический напиток имеет свою **страницу отзывов**.

Вместо создания отдельных статических страниц, страница отзывов является **динамической** и загружает выбранный напиток.

## Содержимое страницы отзывов

- Изображение и название напитка
- Общий рейтинг
- Метрики вкуса
- Список отзывов пользователей

Каждый отзыв включает:

- Имя пользователя
- Комментарий
- Личный рейтинг
- Дата

---

# Действия пользователей

Пользователи могут:

- Просматривать все энергетические напитки
- Открывать страницу отзывов напитка
- Читать отзывы других людей
- Переключать отображение рейтинга (звезды / диаграмма)

Дополнительные функции:

- Сортировать напитки по рейтингу
- Фильтровать напитки без сахара

---

# Функции администратора

Администраторы имеют расширенный контроль.

Администраторы могут:

## Добавление энергетических напитков

Создать новую карточку напитка с:

- Названием
- Изображением
- Ценой
- Метриками вкуса
- Флагом без сахара

## Удаление энергетических напитков

Удалить напитки из каталога.

## Управление отзывами

Администраторы могут:

- Добавлять отзывы
- Удалять отзывы

Ограничение:

Администраторы **не могут изменять значения рейтинга существующих отзывов пользователей**, только удалять их.

---

# UI / Дизайн

## Макет

- Адаптивный сеточный макет
- Большие современные карточки
- Плавное расширение при наведении
- Четкая типографика

## Дизайн карточки

Карточка включает:

Верхняя секция: - Изображение

Середина: - Название - Цена

Низ: - Средний рейтинг

Расширенная секция: - Метрики вкуса - Значок без сахара - Быстрый обзор вкуса

---

# Технологии (Планируемые)

Фронтенд:

- HTML
- CSS
- JavaScript

Возможный будущий стек:

- React / Vue для UI
- Node.js бэкенд
- База данных для напитков и отзывов

---

# Возможные будущие функции

- Строка поиска
- Продвинутые фильтры
- Голосование сообщества
- Любимые напитки
- Личные списки дегустации
- Оптимизация для мобильных
- API для базы данных напитков

---

# Цель проекта

Этот сайт разработан как **визуальная база данных и платформа отзывов для энергетических напитков**.

Он помогает пользователям:

- Открывать новые напитки
- Сравнивать профили вкуса
- Делиться своим опытом
- Быстро находить лучшие энергетические напитки
