# Tournevent Tracker

[My Notes](notes.md)

The Tournevent Tracker is designed to provide athletes with timely and relevant updates when at a competition. It provides to the competitor a list of individual events that the competitor expects to participate in, along with constant updates to inform the athlete that their round or match will be starting soon and where exactly they need to be; extremely helpful for events with large venues. Tournevent also keeps track of the competitors performance and will show them their scores or ranking.


> [!NOTE]
>  This is a template for your startup application. You must modify this `README.md` file for each phase of your development. You only need to fill in the section for each deliverable when that deliverable is submitted in Canvas. Without completing the section for a deliverable, the TA will not know what to look for when grading your submission. Feel free to add additional information to each deliverable description, but make sure you at least have the list of rubric items and a description of what you did for each item.

> [!NOTE]
>  If you are not familiar with Markdown then you should review the [documentation](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) before continuing.

## 🚀 Specification Deliverable

> [!NOTE]
>  Fill in this sections as the submission artifact for this deliverable. You can refer to this [example](https://github.com/webprogramming260/startup-example/blob/main/README.md) for inspiration.

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### Elevator pitch

The Tournevent Tracker is designed to provide athletes with timely and relevant updates when at a competition. It provides to the competitor a list of individual events that the competitor expects to participate in, along with constant updates to inform the athlete that their round or match will be starting soon and where exactly they need to be; extremely helpful for events with large venues. Tournevent also keeps track of the competitors performance and will show them their scores or ranking.

### Design

![20250113_202414](https://github.com/user-attachments/assets/9684a88d-c867-4992-99df-21a16de82bdb)

![20250113_202409](https://github.com/user-attachments/assets/17b57e7f-140f-4c91-9030-fc5b81629eac)

![20250113_202404](https://github.com/user-attachments/assets/5ad0ddc5-9766-4601-91ca-e0b4a1dc3c69)

### Key features

-login screen with option to log in as an admin or sompetitor
-competitor information (& potentially opponent information)
-admin screen used by tournament overseers to update general tournament info.
-competitor screen used by the athletes to inform them when, and where they need to be.
-scoring information(unsure if this will be stored with the competitor individually or in a seperate database.

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - HTML will be used to create the skeleton of the web pages. For now, there will be two or three individual pages such as a login page, an admin page, and a competitor page. It will include things such as buttons for the admins to use to edit tourament progress and list elements for the competitor that show where they need to be and when.
- **CSS** - CSS will be used to give these pages a unique design. It will likely be simple, as we want the competitors to be able to easily read updates and such. it will also help buttons and text input fields to stand out more for the admins so that they can easily make necessary changes.
- **React** - React will be used in response to user input; such as when a user pushes a button or provides information.
- **Service** - Services used will likely be a "SaveScores" service that would hold on to he competitors scores so that they can be awarded properly for their performance
- **DB/Login** - a Database will be used to store user information. such as their name, username, password, and their score.
- **WebSocket** - Websocket will be used to give timely updates to the competitors. When an admin makes a change uch as updating the match number, or changing the ring that a certain evet will be held in, the competitors will be informed immediately with messages such as "you are 5 matches from competing, please get ready and report to ring 2." or "your match has been moved to ring 3." among others

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Server deployed and accessible with custom domain name** - [My server link](https://startup.timkaboti.com/).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **HTML pages** - created 5 new html pages inlcuding an index page.
- [x] **Proper HTML element usage** - I believe I used proper html elements in an effetive manner.
- [x] **Links** - each page has links to each other. some have specifc page links for specific actions ike pdhing a specific button
- [x] **Text** - there is text and headers.
- [x] **3rd party API placeholder** - placeholder for an inspirational quote api.
- [x] **Images** - there is an image named kicker.jpg used as part of the logo
- [x] **Login placeholder** - there is a login placeholder
- [x] **DB data placeholder** - there is a spot on the competitor page where information that would be stored in the database is shown to the competitor  
- [x] **WebSocket placeholder** - there is a place on the competitor screen where a webscket message would appear to alert the competitor of changes.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Header, footer, and main content body** - headers, footers, and mains given styling. headers and footers all use the same style.css file. the mains are differet enough that each one uses its own css file.
- [x] **Navigation elements** - navigation elements are styled and funtional. love dropdowns.
- [x] **Responsive to window resizing** - pages are responsive.
- [x] **Application elements** - everything is aligned and centered
- [x] **Application text content** - I am using 2 different fonts mainly. I may add a third.
- [x] **Application images** - has image in header as part of logo, and an abstract image as the main background.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Bundled using Vite** - I did not complete this part of the deliverable.
- [ ] **Components** - I did not complete this part of the deliverable.
- [ ] **Router** - Routing between login and voting components.

## 🚀 React part 2: Reactivity

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **All functionality implemented or mocked out** - I did not complete this part of the deliverable.
- [ ] **Hooks** - I did not complete this part of the deliverable.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Node.js/Express HTTP service** - I did not complete this part of the deliverable.
- [ ] **Static middleware for frontend** - I did not complete this part of the deliverable.
- [ ] **Calls to third party endpoints** - I did not complete this part of the deliverable.
- [ ] **Backend service endpoints** - I did not complete this part of the deliverable.
- [ ] **Frontend calls service endpoints** - I did not complete this part of the deliverable.

## 🚀 DB/Login deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **User registration** - I did not complete this part of the deliverable.
- [ ] **User login and logout** - I did not complete this part of the deliverable.
- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Restricts functionality based on authentication** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
