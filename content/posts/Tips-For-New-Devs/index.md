---
title: 'Common Pitfalls for New Devs'
author: Richard Sween
description: After reviewing coding academy presentations, here are three common things that jumped out for new devs to be aware of.
date: 2022-02-03T20:50:21.162Z
featuredImage: hero.jpg
featuredImageAlt: Shipping containers stacked in a lot
draft: false
tags:
  - tips
  - junior devs
  - engineering manager
---

Recently, I had the privilege to serve as an external reviewer for students at the [Mississippi Coding Academy](https://mscoding.org/). There were a few common issues I saw that I thought might be useful for other newer devs to be aware of. If you just want to see the tips, [click here to jump down to the tips](#tips).

# Background

MCA is a no-cost coding academy based in Jackson, MS that trains full-stack web developers. Periodically throughout the 11 month term, MCA brings in external evaluators from the local development community to review the student's work and provide feedback and suggestions to both the students and the academy itself.

The project we were evaluating this week is my favorite to be a part of - the students were tasked with building a game using JavaScript. Beyond that the requirements are pretty minimal - you have to show using functions and variables, you have to have interactivity, and it has to be at least tangentially a game. I love this project because you really get to see the creativity of the students shine through their work. And I was not disappointed. I actually live-Tweeted the second and third days if you want to check out some of their games [here](https://twitter.com/_RichardSween/status/1488905361100845062) and [here](https://twitter.com/_RichardSween/status/1489256577781493765).

<h1 id="tips">The Tips</h1>

## Tip One - Be Aware of Repetitive Code

This is something I've seen a few times looking at newer developers code - and certainly something I was guilty of too early on. Often I see newer devs, especially those who aren't as familiar or comforatble with functions, repeating large sections of code over and over again while only changing little things between the blocks. If you find yourself doing a lot of copy, paste, and change a few words in your code, it's probably time to create a function or class for it.

> **Why?** Two main issues with repetitive code are readability and maintainability. If you have similar code doing slightly different things, it's going to be harder to spot the important differences between sections of code. And if you find a bug or want to change a part of your repeated code, you have to be sure to remember to change it everywhere or your code is going to still be broken.

Let's look at an example. Say I have this block of code:

```javascript
let buttonOne = document.getElementById('buttonOne')
buttonOne.innerHtml('Label One')
buttonOne.onClick(() => console.log(`${buttonOne.innerHtml} clicked!`))

let buttonTwo = document.getElementById('buttonTwo')
buttonTwo.innerHtml('Label Two')
buttonTwo.onClick(() => console.log(`${buttonTwo.innerHtml} clicked!`))

let buttonThree = document.getElementById('buttonThree')
buttonThree.innerHtml('Label Three')
buttonThree.onClick(() => console.log(`${buttonThree.innerHtml} clicked!`))
```

Yikes, super repetitive. Let's see how we could refactor this into a simple function.

```javascript
function setupButton(const buttonId, const buttonText) {
    let button = document.getElementById(buttonId);
    button.innerHtml(buttonText);
    button.onClick(() => console.log(`${button.innerHtml} clicked!`));
}

setupButton("buttonOne", "Label One");
setupButton("buttonTwo", "Label Two");
setupButton("buttonThree", "Label Three");

```

Now we have one function that handles our button setup code and we can call it multiple times to handle setting up each of our three buttons. If we need to add more functionality to the button or fix a bug, we only have to update our function one time. And of course if we need a reference to our button later in the code, we could update the function to return it:

```javascript
function setupButton(const buttonId, const buttonText) {
    let button = document.getElementById(buttonId);
    ...
    return button;
}

let buttonOne = setupButton("buttonOne", "Label One");
...
```

## Tip Two - Use Text on Images with Caution

This one definitely doesn't strictly apply to newer devs, I see a lot of experienced devs making this mistake too. Using text on images is something that you should use sparingly and carefully. If you're not careful, the text could be very hard to read.

> **Why?** This is an issue related to accessibility, or making what we build usable by people with disabilities. The issue here is color contrast - even if some people can read white text on a yellow background, it doesn't mean everyone can (and it's still probably hard to read for those who can). Check out [this article on accessibility for beginners](https://www.deque.com/web-accessibility-beginners-guide/) from Deque for more information on accessibility.

Let's look at a quick example:

<style>
  .example-container {
    width: 500px;
    position: relative;
    margin: 0 auto 1rem auto;
  }
  .example-container img {
    width: 100%;
  }
  .example-container p {
    position: absolute;
    width: 500px;
    top: 240px;
    left: 0;
    font-size: 2rem;
    font-weight: bold;
    color: white;
  }
  .example-container .background {
    background-color: #00000088;
  }
</style>

<div class="example-container">
  <img
    src="background.jpg"
    alt="background image of a stacked pile of firewood"
  />
  <p>
    This is some sample text shown over a background image. This text shows
    the challenges of putting text on an image while keeping it readable for
    all users.
  </p>
</div>

Photo by <a href="https://unsplash.com/@timmossholder?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Tim Mossholder</a> on <a href="https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

While you certainly may be able to read the text on that image, it was probably difficult for you to do so. Let's see what happens when we add a semi-transparent background to the text over the image.

```css
.background {
  background-color: #00000088;
}
```

<div class="example-container">
  <img
    src="background.jpg"
    alt="background image of a stacked pile of firewood"
  />
  <p class="background">
    This is some sample text shown over a background image. This text shows
    the challenges of putting text on an image while keeping it readable for
    all users.
  </p>
</div>

Much better! But you don't have to take my word for it - let's use a tool to analyze the contrast between the text and the background image.

<img src="cca-combined.jpg" alt="Image showing the difference in contrast between having no text background on the left with having a semi-transparent text background on the right" />

This image was created using a Chrome plugin called [Color Contrast Analyzer](https://chrome.google.com/webstore/detail/color-contrast-analyzer/dagdlcijhfbmgkjokkjicnnfimlebcll) that scans your page and determines the contrast between visible elements on your page. Contrast is the difference in perceived brightness between two colors, and the Web Content Accessability Guidelines (WCAG) defines a minimum contrast ratio that all of your visible elements should have so that your content is easily perceivable by everyone. In the image above, our original image is on the left, and the image with the text background transparency is on the right. The white pixels in the image show where there is sufficient contrast between adjacent pixels. On the left, there are big gaps in our words where there isn't enough contrast between the background and the white text which make it difficult to read. However, on the right our text is entirely outlined in white showing that we have enough contrast to read our text easily.

## Tip Three - Make it Work, then Make it Better

Again, this is another issue that many seasoned developers have, but it's important for newer devs to learn this one quickly: it's much more important to have a working thing than a "pretty" thing that doesn't work. In this case "pretty", for example, could mean that the UI looks nice or that the code is very elegantly written. In either case, the end user isn't going to have a great experience if what you're building isn't functional, no matter how nice the frontend or backend looks.

This tip is especially important when it comes to deadlines. Often, deadlines are a source of stress - we want to have everything done and perfect by the time the deadline rolls around. But, sometimes just done is enough; perfect can follow later. For these JavaScript games, it didn't matter if every single feature was fully implemented as designed, it was much more important to show a functioning game.

There are two corollaries to this tip. First: don't mess with your project on deadline day! Once you're project is in a stable, good place, don't mess with it too close to your deadline. Inevitably, something will go wrong and you run the risk of not having anything to show for your work.

The second corollary is your users don't care about your tech stack. As a user, the only interface they will have with your application is the UI -- they don't care what programming language you used, or whether it was the latest or greatest. They just want to have a good experience using what you've built.

# Wrapping it Up

I always love to be able to help review game demo day at the Mississippi Coding Academy. Serving as an reviewer highlighted both the creativity and some common challenges faced by newer developers. Repetitive code can hinder readability and maintainability. By refactoring code into functions or classes, developers can streamline their work, making it easier to manage and debug. Another frequent issue was using text on images without ensuring adequate contrast, affecting accessibility. Adding a semi-transparent background can improve readability for all users.

Finally, it's crucial for developers to prioritize functionality over aesthetics, especially as deadlines approach. A working prototype is more valuable than an incomplete but beautifully designed project. Avoid making last-minute changes before deadlines and focus on delivering a user-friendly experience rather than the specifics of the tech stack.
