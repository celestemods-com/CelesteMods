# CelesteMods.com <!--TODO: embed logo here-->


<!--TODO: add table of contents here-->


## What is This Project?
When I talk to my friends who have played Celeste about why they haven't gotten into playing mods, most of them say that it's because they don't know where to start. They don't have anywhere to go to find out which mods are good and how hard each mod is. So I made [a spreadsheet](https://docs.google.com/spreadsheets/d/1_fYM8JABpChRmwvyydB3a6C5AkiFRqYLus4NWHJbJpU/edit#gid=831454936). The spreadsheet & Google Forms system quickly ran into limitations, and I decided to make a [new website](https://celestemods.com) that will be much closer to my original vision. I hope you, and the rest of the community, find the project helpful.


## Using CelesteMods.com
If you simply want to view and/or submit information about mods, get started by visiting [the website](https://celestemods.com). If you have questions, check out the FAQ page or [join our Discord](https://discord.gg/HmQxs3xF3G).
<!--TODO: add link to FAQ page when it is built-->

If you want to contribute in other ways, please keep reading.


## Contributing to CelesteMods.com
Please check out our [contributing guide](/CONTRIBUTING.md) for detailed instructions on how to submit bug reports, request new features, and create pull requests.

***Please read the guidelines before opening any issues or pull requests.***


### Setup CelesteMods.com Locally
1. Install and configure MySQL
    
    a. We recommend using XAMPP (only tested on Windows 10). It provides a built-in webserver and GUI for troubleshooting the MySQL server. If you wish to use another solution, skip to step ##. 
    

    b. Download and install [XAMPP](https://www.apachefriends.org/download.html).
    * Only the Apache web server and MySQL/MariaDB modules are required.


    c. Browse to the folder where XAMPP is installed, and find `xampp-control.exe`

    * Right-click on the .exe and open the properties menu. Go to the `Compatibility` tab and check `Run this program as an administrator`.

    * Make a shortcut to the .exe. This is how you will start and close the database.


    d. Run `xampp-control.exe`. **Don't start any modules yet.**

    * Optionally, click on the `Config` button (the button with the wrench icon in the top-right corner), and change the text editor to something other than Notepad.

    * In the `MySQL` row, click on `Config` and open `my.ini`. In lines `20` and `29`, change the port number to any number between `1,000` and `10,000`. This is your `MySQL Port` - make a note of it for later. Save and close the config.

    * In the `Apache` row, click on `Config` and open `httpd.conf`. In line `60`, change the number to any number between `1,000` and `10,000`. This is your `Apache Port` - make a note of it for later. Save and close the config.

    * In the `Apache` row again, click on `Config` and open `config.inc.php`. In line `27`, change the port number to your chosen `MySQL Port`. Save and close the config.

    * Start both Apache and MySQL

    * Browse to 127.0.0.1:XXXX, where XXXX is your `Apache Port`.

    * Click on `phpMyAdmin` in the top-right corner to access the MySQL GUI.

    * On the left is the list of databases. Click the `New` button above the list, and create a database called `modslist`.


2. Install Node.js

    a. We recommend using Node Version Manager (NVM) to install and manage Node.js

    * On Mac/Linux, use [nvm](https://github.com/nvm-sh/nvm).

    * On Windows, use [nvm-windows](https://github.com/coreybutler/nvm-windows).


    b. Install the version of node specified by the `engines` key in our [package.json](/package.json).
    
    * As of 2023-08-25, this is version 20.4.0.


3. Generate Discord Credentials

    a. If you don't need authentication to work, you can skip this step.


    b. Create a [Discord application](https://discord.com/developers/applications) and obtain your OAuth2 `CLIENT ID` and `CLIENT SECRET`.

    * Click `New Application` in the top-right and give your application any name you like.

    * Select your new application and use the sidebar to navigate to `OAuth2`.

    * Note your `CLIENT ID`.

    * Generate your `CLIENT SECRET`. Make sure to note it down somewhere safe - if you ever lose it you will have to invalidate it and generate a new one.
    
    * ***DO NOT share your CLIENT SECRET with anyone else, including CML staff.*** This secret is linked to your personal Discord account, and Discord may hold you responsible for any malicious behaviour associated with it.


4. Configure Local Repository

    a. Fork the repository and clone `main` to a local folder.
    

    b. Setup your `.env` file.

    * Create a new file in the project root called `.env`.

    * Copy the contents of `.env.example` into `.env`.

    * Populate the variables in `.env`. You will need your `MySQL Port` number, your Discord `CLIENT ID`, and your Discord `CLIENT SECRET`. Additional instructions are available in `.env.example`.


    c. Install the project's dependencies.

    * Open a terminal in the project's root directory.

    * Type `npm i` and hit `enter`.

    * Wait. Node Package Manager (npm) will download all of the dependencies and then generate your Prisma client.

    * If you installed your dependencies before configuring your `DATABASE_URL` in `.env`, you will need to manually regenerate your Prisma client. This also needs to be done after any changes to the [Prisma schema](/prisma/schema.prisma). In your terminal, type `npx prisma generate` and hit `enter`.


5. Run Local Development Server

    a. Open a terminal in the project's root directory.


    b. Type `npm run dev` and hit `enter`.


    c. Open your web browser and navigate to `http://localhost:3000`. It may take several seconds to load, especially if the server is still booting up.


### Local Development

1. Each time you open up the project, you must start up the MySQL server and the local development server (see above).


2. When you make changes in the code, the page in your browser will usually update automatically. Occasionally a manual page refresh will be required.


3. You will likely need to install the [React Developer Tools](https://react.dev/learn/react-developer-tools) browser extension.


## Additional Documentation

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

For an overview of the stack and the technologies used, please refer to the [T3 Documentation](https://create.t3.gg/en/introduction).

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [tRPC](https://trpc.io)


This project does not use Tailwind CSS. Instead, most of our React components come from [Mantine](https://mantine.dev/pages/basics/). Most of the styling for a Mantine component will be inherited from the [Mantine theme](https://mantine.dev/theming/theme-object/). For any additional styling, use the [createStyles hook](https://mantine.dev/pages/basics/#createstyles) instead of the [Styles API](https://mantine.dev/pages/basics/#styling-components-internals-with-styles-api) when possible.

Our datatables are created using [Mantine Datatable](https://icflorescu.github.io/mantine-datatable/).


## How to Get Help
If you need a hand, please [join our Discord](https://discord.gg/HmQxs3xF3G).


## Terms of Use
CelesteMods.com is licensed under [GNU AGPL v3](/LICENSE.md). By contributing to this repository (by submitting an issue, submitting a pull request, or any other contribution) you certify that you own the rights to your contribution (or have the appropriate license(s)), and you agree that, by submitting your contribution, the terms of this license will irrevocably apply to your contribution.

---

> This document was based on The Good Docs Project's [README template](https://gitlab.com/tgdp/templates/-/blob/main/readme/template-readme.md).
