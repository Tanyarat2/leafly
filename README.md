# Project Name

## Description
Short description of your project.

## Installation
1. npm install
2. Setup database
3. node back-end.js
4. node front-end.js

## Usage
- Front-end: http://localhost:3000
- Admin: http://localhost:3001/admin-login

## Technologies
- Node.js
- Express
- MySQL

## Known Issues
- Session expires quickly.

## Author
- Name: John Doe
- ID: 65123456

   
7. Install the module `express` using the command `npm install express` **and**
   install `nodemon` using the command `npm install nodemon` respectively
   
   After this step, your directory should have the following structure:
   
	   XX88XXX-express		(root)
		> node_modules		(folder)
		|_ app.js		(top-level)
	  	|_ package_lock.json	(top-level)
	 	|_ package.json	(top-level)
   
   
   In `package.json` file, there should have the `dependencies` section automatically:
   ```
	{
	  "name": "XX88XXX-express",
	  "version": "1.0.0",
	  "description": "",
	  "main": "app.js",
	  "scripts": {
	    "test": "echo \"Error: no test specified\" && exit 1"
	  },
	  "author": "[Your Name], [Your Student ID]",
	  "license": "ISC",
	  "dependencies": {
	    "express": "^4.21.2"
	    "nodemon": "^3.1.9"
  	  }
	}
   ```
