# FilePile Documentation
FilePile lets you implament a file sharing system in your projects.
You can almost compare it to a google drive folder where anyone can upload files.

> Note: FilePile should not be used for the distribution of executable files. This includes applications, code, and anything that can potentially do harm. <br>
> This extension is made for tasks like level sharing and distribution of assets. Please use with respect.

---

### Display names
Your display name is used to show others that you are active in a room. <br>
Your display name won't be attatched to any files or anything, it's just to show everyone you are here.

```scratch3
Set display name to [Piler5678] :: #4C7C8E
```

### Rooms
Rooms are isolated spaces. Files in one room are invisible to others.

> It is recommended you don't use the default room.

```scratch3
Set room [117] :: #4C7C8E
Room :: reporter #4C7C8E
```

Default room is `0`.

### Adding and removing files
File pile keeps a list of every file you have.
This list is used to send your files to others on the network.

```scratch3
Add file [Hello, world] as [hello.txt] as type [raw v] :: #4C7C8E
```

You can choose how the file content is interpreted:
* **raw** – normal text
* **binary** – binary string (like `01001000`)
* **hex** – hexadecimal content
* **base64** – encoded text content

If you want to stop sharing a file, you use the `Remove file` block.

```scratch3
Remove file [hello.txt] :: #4C7C8E
```

You can also see what files you are actively sharing with the `Active files` block.

```scratch3
Active files :: reporter #4C7C8E
```

### Searching for files
The search function in FilePile is made with as much as I could add into a search function,
because you could be hosting many different types of files for many
different project types.

```scratch3
Search for [hello] in [File Name v] :: reporter #4C7C8E
```

Modes:
* **File Name** – matches text in file names
* **File Text** – searches the content of files for text
* **File Content** – uses hex input for searching the content of non-text files

You can use filters:
* `filetype:txt`
* `integrity:230421`
* `size>200` (works in bites and can accept > < and =)
* `-"excludeThis"` (can be combined with other filters like `-filetype:txt`)
* `OR` (combine searches: `filetype:txt OR filetype:png`)
* `*` (returns all files found)

Search can also combine filters and exclusions.

`filetype:txt report size>800 -"draft"` <br>
(Find all `.txt` files with “report” in their name, larger than 800 bits, excluding any that contain “draft”.)

### Downloading files
Downloading a file will add it to the download cache where you gan get the download speed (kb/s), and progress.
After downloading a file, it will be added to your active files list.

You can download files by typing in a file name and an integrity id. <br>
You don't *need* an integrity id to download a file,
but if you have one it is reccomended to use it to prevent getting files
that don't match the content you expect.

```scratch3
Start downloading [hello.txt:123456] :: #4C7C8E //you can input "filename:integrity" or just "filename"
```

If you don't include an integrity id it will grab the first file it recives.
If nobody has the file yet, FilePile will check every 10 seconds until someone does.

Downloads can also be paused and resumed using these blocks:
```scratch3
Pause download [hello.txt] :: #4C7C8E
Resume download [hello.txt] :: #4C7C8E
```

And can be canceled:
```scratch3
Cancel download [hello.txt] :: #4C7C8E
```

Downloads can also be exported to continue later.
ThYouen resume an exported download by using the exported JSON with the same `Start downloading` block from before.
```scratch3
Export download [hello.txt] :: reporter #4C7C8E
```

### Getting a file
Once downloaded or shared, you can read its content as one of the following types:
* **raw** – returns plain text
* **binary** – returns a binary string
* **hex** – returns hex format
* **base64** – returns base64 encoding

```scratch3
Get file [hello.txt] as [raw] :: reporter #4C7C8E
```

### What are integrity IDs
The integrity ID is a six-digit number generated from the content of a file.
Each character in the file is converted to its character code, and all codes are summed together.
The sum is then reduced modulo 1,000,000 to get a six-digit number.
This makes sure that even small changes in the content will produce a different ID.

```scratch3
define Integrity of content (CONTENT)
set [sum v] to [0]
repeat (length of (CONTENT))
change [sum v] by (ascii of (letter (repeat index) of (CONTENT)) :: #0076b6)
end
return (join [000000] ((sum) mod (1000000))) :: custom cap
```

Generate one from any text using the `Integrity of content` block

```scratch3
Integrity of content [Hello, world] :: reporter #4C7C8E
```

---

## How downloads work internally
Downloads are split into **chunks** up to 0.5 MB each.
Each chunk is verified by integrity before saving. If a chunk fails, it retries until it succeeds.

FilePile keeps speed data for the last 20 chunks. The `estimate speed` block uses this moving window to smooth out fluctuations.
However, if progress stops for 2 seconds, speed returns to 0 until new chunks start arriving.

Paused downloads remember their chunks, integrity, and seeder info.
When resumed or imported from JSON, FilePile continues exactly where it left off.
