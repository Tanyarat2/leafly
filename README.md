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
   [![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/PyurVf3H)
# Faculty of Information and Communication Technology <br/> ITCS223 Introduction to Web Development <br/> Node.js

## Instructions:
- This exercise consists of one task to create a simple web server using Express framework with Node.js 
- Students are required to submit their work via GitHub by Lab 15.

### Preparation of Express
1. Check that the Node.js is installed using the command `node --version` in the terminal
2. Create a working folder with your student ID, i.e., `XX88XXX-express`
3. Open Visual Studio Code and "Open Folder" you have created in Step 2)
4. Open `Terminal` in Visual Studio Code to initialize and set up the project using `npm init`
5. Put the project information with the following information:
    * entry point: `app.js`
    * author:  Your name and Student ID
   then, type `yes` to confirm all the information

   After the preparation, your directory should have the following structure:
   
	   XX88XXX-express		(root)
		|_ package.json
   
	In `package.json` file, there should be the following information:

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
	  "license": "ISC"
	}
   ```

6. Create the main file (entry point), `app.js`, which will be the main file for the server
   After this step, your directory should have the following structure:
   
	   
	   XX88XXX-express		(root)
		|_ app.js		(entry point file)
	  	|_ package.json	
	   
   
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
9. Set up the `start` command in `package.json` by adding `"start": "nodemon app.js"` in the section `"scripts"`
  
   After this step, the section `"scripts"` should be as follows:

   ```
	{
	  "name": "XX88XXX-express",
	  "version": "1.0.0",
	  "description": "",
	  "main": "app.js",
	  "scripts": {
	    "start": "nodemon app.js"
	  },
	  "author": "[Your Name], [Your Student ID]",
	  "license": "ISC",
	  "dependencies": {
	    "express": "^4.21.2"
	    "nodemon": "^3.1.9"
  	  }
	}
   ```
10. Download all html files and put in the folder `html`
    After this step, your directory should have the following structure:
    ```
    
	   XX88XXX-express		(root)
	    > html			(folder)
		   |_ error.html		(inside html folder)
		   |_ sign-in.html		(inside html folder)	
	    > node_modules		(folder)
	    |_ app.js		(top level)
	    |_ package_lock.json	(top level)
	    |_ package.json	(top level)
	
 Complete this preparation before starting the question

---


## Direction:

**Create the server with the Express Framework** using Node.js. The server should work as follows:
* The server is set to be run in the localhost with the `port=3030` ([**Expected Output 1**](#expected-output-1))
* The server takes the following requests and responses:
	* **Request**: `GET	http://localhost:3030/`<br>**Response**: Plain text "Hello World! in plain text" and the text log in the terminal
          ([**Expected Output 2**](#expected-output-2))
	* **Request**: `GET	http://localhost:3030/signin`<br>**Response**: A HTML page: `sign-in.html` and the text log in the terminal  ([**Expected Output 3**](#expected-output-3))
 	* **Request**: `POST	http://localhost:3030/form-submit`<br>**Response**: No response to the user but this is the route for form handling 
	 but there will be a text log to the server (email and timestamp) from the form submitted. ([**Expected Output 4**](#expected-output-4))
	 After logging, the route will redirect to another route `/member`
	 <br>**Hint** the command `res.redirect('/path')` navigates to the given path.
	* **Request**: `GET	http://localhost:3030/member`<br>**Response**: A HTML page: `sign-in.html` which is the confirmation after a user signs in.
          ([**Expected Output 5**](#expected-output-5))
 	* When users send a request to any unknown routes (not mentioned above), the server sends a response with **the page** `error.html`
    	  and logs in to the terminal.  ([**Expected Output 6**](#expected-output-6))


## Submission
Commit the JS file - `app.js` and the HTML file `sign-in.html`

---


## Expected Output

### Expected Output 1

[back to top](#direction)

When the server starts to run with the command `npm start` in the terminal, the output must show the text log as follows.
```
> lab@1.0.0 start
> nodemon app.js

[nodemon] 3.1.9
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node app.js`
Server listening on port: 3030
```

<hr>

### Expected Output 2

[back to top](#direction)

When a user opens the browser and goes to `localhost:3030/` which means he/she sends a **request** to the given **route** `/` at the server,
the browser should show the text as follows,

![root](/expected_output/root.png)

**and** the terminal log should show in the path requested.

```
Request at /
```

<hr>

### Expected Output 3

[back to top](#direction)

When a user goes to `localhost:3030/signin` in the browser which means he/she sends a **request** to the given **route** `/signin`


The output from the browser should be 
![signin](/expected_output/signin.png)

**and** The output from the terminal must show the path, i.e.,
```
Req: /signin
Retrieve a form
```

 
<hr>

### Expected Output 4

[back to top](#direction)

When a user fills in the form and clicks the "Submit" button, the form will be processed at the route `/form-submit` with the method `POST`

![signin-filled](/expected_output/signin-filled.png)

The terminal will log the email and the timestamp, for example, 

```
Request at /form-submit
Form submitted by jidapa.kra@mahidol.ac.th at 1741337376830
```

Then, the route is redirected to the route `/member` (See Expected Output 5)

<hr>

### Expected Output 5

[back to top](#direction)

After the form was processed at the route `/form-submit`, the **route** `/member` shows the HTML page: `success.html`

![success](/expected_output/success.png)

and the output from the terminal must show the path, i.e.,

```
Request at /member
```

<hr>

### Expected Output 6

[back to top](#direction)

When users send a request to any unknown routes (not mentioned above), the server sends a response with **the page** `error.html`
and logs in to the terminal, for example, `localhost:3030/omg`


The output from the browser should be 
![error](/expected_output/error.png)

**and** The output from the terminal must show the path, i.e.,

```
Request at /omg
404: Invalid accessed
```

<hr>



