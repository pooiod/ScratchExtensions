Sure! Here's the updated version of the documentation, including the detailed explanation of the **file selector** block with the correct use of "types" and "format."

---

# SuperStorage Documentation

Welcome to the **SuperStorage** documentation! This extension allows you to easily manage **local** and **online** storage in your projects. You can store data locally on the user's device or on a remote server. Below, we’ll walk through each available block and show you how to use them effectively.

---

## Local Storage

Local storage lets you save data directly on the user's device via the browser's local storage system. Use the following blocks to manage this data:

### Retrieve Data from Local Storage

The **get local [key]** block retrieves the value stored under a specific key in local storage. Provide the key, and it will return the saved content.

```scratch3
(get local [save data] :: #31b3d4)
```

### Store Data in Local Storage

The **set local [key] to [value]** block saves data under a specific key in local storage. Just specify the key and the value you want to store.

```scratch3
set local [save data] to [data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAAEpJREFUKFOdkFEKACAIQ+f9D20sUqZUUH45fajTUMObttCZACCkmkzWorGDYtjsEVTomHewnZjSv8Hr6uJu3cxaMfr8Hn2FGspBA/gaFwffFgUWAAAAAElFTkSuQmCC] :: #31b3d4
```

### Delete Data from Local Storage

To remove data from local storage, use the **delete local [key]** block. Simply provide the key, and it will delete the associated value.

```scratch3
delete local [save data] :: #31b3d4
```

### Get All Local Storage Keys

The **get all local stored names** block retrieves a list of all the keys that are currently stored in local storage. This is useful for checking what data is available.

```scratch3
(get all local stored names :: #31b3d4)
```

---

## Online Storage

Online storage allows you to store and retrieve data from a remote server. Here are the blocks you’ll need:

### Check If the Server is Online

The **can connect to server?** block checks if the server is available to respond to storage requests. It returns a boolean value indicating whether the server is online.

```scratch3
<can connect to server? :: #31b3d4>
```

### Check if the Server is Responding

Use the **waiting for server to respond?** block to determine if the server has responded to a storage request. It will return a boolean value indicating whether the server is still processing or has completed the request.

```scratch3
<waiting for server to respond? :: #31b3d4>
```

### Handle Server Failures

The **server failed to respond?** block helps you check if the server failed to respond to a request. This is important for error handling when the server is not accessible.

```scratch3
<server failed to respond? :: #31b3d4>
```

### Retrieve Server Error Messages

The **server error** block returns an error message if the server fails to process the request. This is useful for troubleshooting.

```scratch3
(server error :: #31b3d4)
```

### Retrieve Data from the Server

To retrieve data from the server, use the **get server [key]** block. Just like **get local [key]**, this will fetch the data stored under the specified key but from the remote server.

```scratch3
(get server [save data] :: #31b3d4)
```

### Store Data on the Server

The **set server [key] to [value]** block saves data on the server under the specified key. This works similarly to the local storage block, but the data is stored remotely.

```scratch3
set server [save data] to [data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAAEtJREFUKFOdkMEOADAEQ+v/P3pLZRpkDpuT6osoQ63VtIVWA4BQ1mQ0C+MGxTL3CGZo7DvYTpRc3+CU2jeWdOdmzor3/J78ihxIizZwEhYHj2iVjAAAAABJRU5ErkJggg==] :: #31b3d4
```

### Delete Data from the Server

The **delete server [key]** block removes data from the server under the specified key.

```scratch3
delete server [save data] :: #31b3d4
```

---

## Device Storage

Device storage allows users to pick files from their device. Here’s how to interact with device files:

### Open a File Selector

The **open file selector for types [types] as [format]** block opens a file selector, allowing users to pick files from their device. You can specify the file formats to accept (e.g., text files, JSON). You can also specify the format in which you want the file returned. Available options include **raw**, **data uri**, and **hex**.

```scratch3
open file selector for types [text, json] as [raw v] :: #31b3d4
```

### Download Text Data as a File

The **download [input] as [filename]** block allows you to download text input as a file. You simply provide the content you want to save and the desired filename.

```scratch3
download [Hello, World] as [hello.txt] :: #31b3d4
```

### Download File from a Data URI

For non-text files, you can download them from a data URI using the **download file from data URI [url] as [filename]** block. This is useful for files like images or videos.

```scratch3
download file from data URI [data:text/plain;base64,SGVsbG8sIHdvcmxkIQ==] as [hello.txt] :: #31b3d4
```

---

## Cookies

Cookies are typically used for temporary data, such as session information. Here’s how to manage cookies:

### Retrieve All Cookie Names

The **get all cookie names** block returns a list of all cookie names as a JSON array.

```scratch3
(get all cookie names :: #31b3d4)
```

### Set or Change a Cookie

Use the **set cookie [KEY] to [VALUE] with expiration [DATE]** block to create or modify a cookie with a specific key, value, and optional expiration date. If no date is provided, the cookie will expire when the browser is closed <light>(usually)</light>.

```scratch3
set cookie [hello] to [Hello, World] with expiration [] :: #31b3d4
```

### Retrieve a Cookie’s Value

The **get cookie value for [KEY]** block retrieves the value of a specific cookie. If the cookie doesn’t exist, it returns nothing.

```scratch3
get cookie value for [hello] :: #31b3d4
```

### Remove a Cookie

To remove a cookie, use the **remove cookie [KEY]** block. It will delete the specified cookie.

```scratch3
remove cookie [hello] :: #31b3d4
```
