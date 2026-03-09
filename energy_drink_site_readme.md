# Energy Drink Rating Website

## Overview

This project is a concept website for reviewing and ranking energy
drinks.\
Users can browse a visual grid of energy drinks, quickly compare their
taste characteristics, and read community reviews.

The site focuses on **visual comparison**, **user reviews**, and **clear
taste metrics** so visitors can quickly decide which drink to try.

------------------------------------------------------------------------

# Main Goals

-   Provide a **clear ranking system** for energy drinks.
-   Show **taste characteristics and other metrics visually**.
-   Allow users to **add and read reviews** for each drink.
-   Give admins the ability to **add, edit, and remove drinks and
    reviews**.
-   Present information in a **modern tile‑based UI**.

------------------------------------------------------------------------

# Website Structure

## 1. Main Page (Energy Catalog)

The main page displays all energy drinks in a **grid / tile layout**.

Each tile (card) includes:

-   Drink photo
-   Drink name
-   Price
-   Average rating (stars, 0--5)
-   Quick visual flavor indicators

### Card Hover Behavior

When hovering over a card:

The card expands and reveals:

-   Detailed taste metrics
-   Sugar information
-   Additional flavor characteristics

The expansion occurs **only on the hovered card**, not on all cards.

------------------------------------------------------------------------

# Energy Drink Data Fields

Each energy drink contains:

-   Name
-   Image
-   Price
-   Average rating (calculated from metrics)
-   Taste metrics:
    -   Sourness (1--5)
    -   Sweetness (1--5)
    -   Concentration / intensity (1--5)
    -   Carbonation (1--5)
    -   Aftertaste strength (1--5)
    -   Price value (1--5)
-   Boolean flag:
    -   **Sugar free** (true / false)

------------------------------------------------------------------------

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

------------------------------------------------------------------------

# Flavor-Based Background Colors

Cards receive subtle background colors depending on flavor type.

Examples:

  Flavor type   Background tone
  ------------- -----------------
  Citrus        Light yellow
  Tropical      Orange
  Berry         Pink / purple
  Classic       Neutral gray
  Apple         Light green

This helps users visually scan drinks faster.

------------------------------------------------------------------------

# Review System

Each energy drink has its own **review page**.

Instead of creating separate static pages, the review page is
**dynamic** and loads the selected drink.

## Review Page Contains

-   Drink image and name
-   Overall rating
-   Taste metrics
-   List of user reviews

Each review includes:

-   Username
-   Comment
-   Personal rating
-   Date

------------------------------------------------------------------------

# User Actions

Users can:

-   Browse all energy drinks
-   Open a drink's review page
-   Read other people's reviews
-   Switch rating display (stars / diagram)

Optional features:

-   Sort drinks by rating
-   Filter sugar‑free drinks

------------------------------------------------------------------------

# Admin Features

Admins have extended control.

Admins can:

## Add Energy Drinks

Create a new drink card with:

-   Name
-   Image
-   Price
-   Taste metrics
-   Sugar-free flag

## Delete Energy Drinks

Remove drinks from the catalog.

## Manage Reviews

Admins can:

-   Add reviews
-   Delete reviews

Restriction:

Admins **cannot modify rating values of existing user reviews**, only
remove them.

------------------------------------------------------------------------

# UI / Design

## Layout

-   Responsive grid layout
-   Large modern cards
-   Smooth hover expansion
-   Clean typography

## Card Design

Card includes:

Top section: - Image

Middle: - Name - Price

Bottom: - Average rating

Expanded section: - Taste metrics - Sugar-free badge - Quick flavor
summary

------------------------------------------------------------------------

# Technologies (Planned)

Frontend:

-   HTML
-   CSS
-   JavaScript

Possible future stack:

-   React / Vue for UI
-   Node.js backend
-   Database for drinks and reviews

------------------------------------------------------------------------

# Possible Future Features

-   Search bar
-   Advanced filters
-   Community voting
-   Favorite drinks
-   Personal tasting lists
-   Mobile optimization
-   API for drink database

------------------------------------------------------------------------

# Project Purpose

This site is designed as a **visual database and review platform for
energy drinks**.

It helps users:

-   Discover new drinks
-   Compare taste profiles
-   Share their experiences
-   Find the best energy drinks quickly
