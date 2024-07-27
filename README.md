# filedrive
A simple online storage app similar to Google Drive built with node express

## Introduction 
This is an extremely minimal app. Users are able to sign up, login, upload/download their files,create/remove folders. Below is a screenshot of the drive section, where I have uploaded the project files.  

![filedrive screenshot](/screenshot1.png)  
## Installation & Usage
**Prerequisites**
- Node
- Postgresql@16

You will need a **.env** file with your postgresql's **DATABASE_URL**. Then download required packages with `npm i`, apply a migrate with `npx prisma migrate dev`, run the server `npm run start` and access via localhost:3000.
