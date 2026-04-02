---
title: 'Building a Backend-less Web App with LocalStorage'
author: Richard Sween
description: Web apps don't need a database or logins to store data and be useful.
date: 2020-09-17T20:50:21.162Z
featuredImage: hero.jpg
featuredImageAlt: Shipping containers stacked in a lot
draft: false
tags:
  - localStorage
  - web app
  - react
---

I recently wrote a post about how knowing how to code is a useful skill that can be applied to problems in everyday life, not just as a career. In that post, which you can read [here](/blogs/Benefits-Learning-Code/), I talked about how I wanted to keep track of my progress in a video game and how I created a simple web app to solve my problem. In this post, I'll walk through my process of creating the app using the Web Storage API in Javascript to handle my data storage without needing a database or user accounts.

# Designing a Backend-less Web App

I go into more detail about my problem in my last post but the basic premise is that I had several lists of items that I wanted to track. I knew that I wanted to keep things as simple as possible, so that meant no database, no user registration/logins, and no API. I decided to use React for the frontend, which admittedly was probably overkill, but it was easy for me to build something fast. I also knew that I would plan on deploying the app to Amplify since I've had a lot of success recently deploying projects using it. Since I wanted to store all my data on the client device, but I wanted data to persist between sessions, I decided to use localStorage in the browser to act as my data storage for the app.

# What is localStorage?

Per [the MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), localStorage allows you to store data on a client device that is saved across browser sessions. That means that even if the user closes the tab or browser window, the information you stored will still be available to your web app the next time the user visits your page (the caveat to this is private or incognito browsing modes, localStorage is cleared when the last private tab or window is closed). The localStorage object stores your data as a dictionary of key/value pairs.

There are two major limitations of localStorage. The first is that both keys and values in localStorage must be strings. There are some ways around this limitation of course. Primitives can of course easily be turned into strings and then parsed back into their primitive type. For JavaScript objects, you can call `JSON.stringify(obj)` to turn the object into a string for storage, which you can then use `JSON.parse(string)` to covert back into an object. You could even store files or images in localStorage if you store the raw image data as a string, but I wouldn't recommend it.

The second limitation on localStorage is size. The total size available depends on the browser and ranges from 2.5MB to 10MB or can be unlimited. Again, localStorage isn't a place to store a lot of files or other large data but it is perfect for storing other data that is too large to fit on a 2KB cookie. Be mindful of your users, however. They may not have a large amount of storage to dedicate to the browser, so you should limit the amount of data you intend to store as much as possible.

# Using LocalStorage in a React App

Using the localStorage API is pretty straightforward. To store a value, use `localStorage.setItem(key, value)`, where "key" is a unique key you will use to retrieve your data later, and "value" is whatever data you wish to store. In my app, I was storing each list of items as an object in the component's state, so when I was ready to save my progress, I used `JSON.stringify(obj)` to turn my object into a string, and then pass that string to the `setItem` method on localStorage.

When the page loads, I performed the process in reverse. I fetch the string out of storage using `localStorage.getItem(key)` and then passed it through `JSON.parse(string)` to get my object containing my data and set it as my component's state.

# Other LocalStorage methods

Two other methods I didn't use in my app but may be useful to you are `removeItem` and `clear`. If you want to remove a single item from the browser, you can use `localStorage.removeItem(key)` to remove a single value from localStorage. And if you want to get rid of all the data you are storing in the browser, you can use `localStorage.clear()`.

# Pros and Cons to using LocalStorage

For this app, the big pro for me was how easy it was to create a persistent state using only two browser API calls. The Web Storage APIs (of which localStorage is a part) are very well supported across browsers going back to IE8. The one big drawback to using localStorage is that the data you store is confined to the browser, so if a user tries to access your app from another browser, they're starting from scratch again. This is an obvious limitation and one that I was fine with for this app, but you'll have to decide if that's a tradeoff you want to make for your app. There are some potential workarounds, like creating an export file of the data that you could import into another browser elsewhere, but at that point you may be better off creating a backend database to track that information.

# Wrap Up

I hope this gave you a practical introduction to the localStorage API and how you can use it to store data for a web app without having to stand up a database. If you're interested in checking out the app, I have it hosted at https://rdr-naturalist-tracker.richardsween.dev/. All the code is open source, and you can check it out at https://github.com/sweenr/rdr-naturalist-tracker.

<span>Lead Photo by <a href="https://unsplash.com/@frankiefoto?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">frank mckenna</a> on <a href="https://unsplash.com/s/photos/storage?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>
