# SuperStorage
[!js-document.title="Super Storage docs"!]
---

The **SuperStorage** extension provides a way to manage both **local** and **online storage** in your projects. With this extension, you can store and retrieve data locally on a user's device, or store it on a remote server. This guide covers all the available blocks and their usage.

---

## Blocks and Functions

### Local Storage

Local storage blocks allow you to save data directly to the user's device (via browser local storage). The following blocks are available for interacting with local storage.

#### **get local [key]**  
Retrieves the value associated with the specified local storage key.
Just provide a key name, and it will return its content.

```scratch3
(get local [save data] :: #31b3d4)
```

#### **set local [key] to [value]**  
Sets a value in local storage for the given key.
Just provide a key name, and it will save your chosen content to that key.

```scratch3
set local [save data] to [data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAAEpJREFUKFOdkFEKACAIQ+f9D20sUqZUUH45fajTUMObttCZACCkmkzWorGDYtjsEVTomHewnZjSv8Hr6uJu3cxaMfr8Hn2FGspBA/gaFwffFgUWAAAAAElFTkSuQmCC] :: #31b3d4
```

#### **delete local [key]**  
Deletes the specified key and its associated value from local storage.  
Just prvide a key name, and it will be wiped from existance.

```scratch3
delete local [save data] :: #31b3d4
```

#### **get all local stored names**  
Retrieves a list of all the keys currently stored in local storage.  

```scratch3
(get all local stored names :: #31b3d4)
```

---

### Online Storage

Online storage allows you to interact with data stored on a remote server. Use the following blocks for managing server-side storage.

#### **waiting for server to respond?**  
Checks if the server has responded to a storage request. This block can be used to determine whether data retrieval or saving is still pending.  
Returns a boolean value indicating whether the server is responding to something.

```scratch3
<waiting for server to respond? :: #31b3d4>
```

#### **server failed to respond?**  
Checks if the server request has failed. This block can be used to handle server errors gracefully.  
Returns a boolean value indicating whether the server request has failed.

```scratch3
<server failed to respond? :: #31b3d4>
```

#### **server error**  
Returns a text value when the server returns an error response. This block can be used to handle errors like server downtime or failed requests.
Best when paured with the `server failed to respond?` block.

```scratch3
(server error :: #31b3d4)
```

#### **get server [key]**  
Retrieves a value from the server associated with the specified key.  
Works like `get local [key]` but with an online server.

```scratch3
(get server [save data] :: #31b3d4)
```

#### **set server [key] to [value]**  
Sets a value on the server under the specified key.  
Works like `set local [key] to [data]` but with an online server.

```scratch3
set server [save data] to [data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAAEtJREFUKFOdkMEOADAEQ+v/P3pLZRpkDpuT6osoQ63VtIVWA4BQ1mQ0C+MGxTL3CGZo7DvYTpRc3+CU2jeWdOdmzor3/J78ihxIizZwEhYHj2iVjAAAAABJRU5ErkJggg==] :: #31b3d4
```

#### **delete server [key]**  
Deletes the specified key and its associated value from the server.  
Works like `delete local [key]` but with an online server.

```scratch3
delete server [save data] :: #31b3d4
```

---

## Additional Notes

- **Performance Considerations**: When using online storage, make sure to account for the time it may take for the server to respond.
- **Data Persistence**: Data stored locally is saved only on the user's device and may not persist across different sessions or devices. Use online storage for cross-session persistence.
- **Server Errors**: Handle server errors gracefully by using the `server error` block. This can help provide users with feedback in case the server is unavailable.


<p style="color: #7a7a7a; bottom: 3px; width: 500px;" hidden>Documentation by pooiod7</p>
