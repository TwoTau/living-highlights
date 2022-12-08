---
title: Living Highlights
author:
  - name: Vishal Devireddy
    email: none
    org: University of Washington
    city: Seattle
    state: Washington
    country: United States
  - name: Tu Nguyen
    email: none
    org: University of Washington
    city: Seattle
    state: Washington
    country: United States
conference: Proceedings of the 7th International Joint Conference on Artificial Intelligence (IJCAI '81)
keywords: 
  - Living papers
  - Social media
theme: distill
section-numbers: false
year: 2022
output:
  html: 
    styles: styles.css
    selfContained: true
---

[:annotation-thread:]{}


::: abstract
This project adds reader "highlights" and social annotations to Living Papers documents.
:::

# Introduction

## Goals

todo

## Related work

todo: see references

# Implementation

The main components of our implementation are the UI, Text Fragments, Twitter web intents, and our server that searches Twitter.

## UI

todo: Tu

## Text fragments

[Text fragments](https://web.dev/text-fragments/) are

## Twitter web intents

todo

## Living Highlights server

We need a server to use the Twitter API.

# Limitations

## (Early) adoption
<blockquote cite="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3264905/">"Systemic reform always faces a bootstrap problem: early adopters gain little benefit (because no one else is participating in the new system yet) and suffer high costs."</blockquote>
<figcaption>
— Christopher Lee, author of the now discontinued <cite>Selected-Papers Network</cite>
</figcaption>

Early adoption is the biggest problem that all social annotation platforms face.

## 7-day search limit

Twitter limits API users to only searching through the past week of Tweets.

## Equation highlighting

~~~ definitions
@h :h: disparity vector
@x :x: position vector in an image
F(x) :fx: The first stereo image
F(@x) :fx: The first stereo image
F'(@x) :fprimex: Linear approximation of $F(x)$ in the neighborhood of $@x$
F(@x + @h) :fxh: The best translated $F(@x)$ to approximate $G(@x)$
G(@x) :gx: The second stereo image
G(x) :gx: The second stereo image
@R :r: Region of interest
~~~

Currently, highlighting equations sometimes leads to slightly incorrect tweet text. For example, if you highlight part of this equation $F(@x + @h) \approx F(@x) + @hF'(@x)$ describing $F(@x)$ and $F'(@x)$ and open the Tweet intent, you will get a correct result:

```
"this equation F(x+h)≈F(x)+hF′(x) describing"
```

but highlighting a equation with fractions $L_2 \, \text{norm} = (\sum_{x \varepsilon @R} [ @F(x + @h) - G(@x) ]^2)^{\frac{1}{2}}$ breaks the $\frac{1}{2}$:

```
"equation with fractions L2​norm=(∑xεR​[F(x+h)−G(x)]2)21"
```

Possible solutions include serializing the equation or rendering a screenshot. Serializing a LaTeX equation requires converting it into text that is both readable and short (to get under the tweet length limit). Alternatively, we could include a rendered image of the selected text in the tweet. This preserves the structure of the equation, but isn't ideal for searchability or accessibility.

## Text fragment generation

It is not always possible to generate a text fragment that uniquely identifies a selection of text. In these cases, the link in the Tweet only includes the URL of the page.

## Recent events at Twitter

todo: explain Twitter imploding, how does that affect academic Twitter users?

~~~ bibliography

~~~
