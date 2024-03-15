
Make sure to look at all of these locations befor making chnages to the code in order to locate all of them. If chnages are made, the locations I have provided bellow would will longer be accurate.

If you cannot find all of them, please look for teh following syntax:

    // Index
    //
    //
    // Info About needed change here
    //
    //
    //

Ensure that that you are able to account all indexes from 1 to 8.

once all of these changes have been implemnted, please let Jean Know so that he can do Cattered.

---

#### PostElement: Ln29
- This useState needs to starty of with a booleen value. 
    - True if the browsing user follows teh creater of the post
    - Else False
- Dont forget to remove teh place holder boolean

---

#### ~~PostElement: Ln42~~
- ~~This useState needs to start of with a list of the existing comments of that post in the format: [ { username : "John Doe", comment : "I really like this meal, thank you !" }, { username : "Jane Doe", comment : "I really hate this meal, you should be banned!" } ]~~
- ~~Dont forget to remove teh place holder comments~~

---

#### PostElement: Ln87
- This function needs to call teh datat base and follow/unfollow the owner fo the post
- Dont forget to keep the setIsFollowed(!isFollowed); befor the call.

---

#### ~~PostElement: Ln105~~
- ~~This function needs to call the database to add a comment to teh list of comments top that post~~
- ~~If you want to, you can use the newListOfComments to completely reset teh list to this new list~~
- ~~Dont forget to make the call last in this function (implement it after the already written logic)~~

---

#### ~~PostElement: Ln125~~
- ~~This function needs to call the database to remove a comment from the list of comments~~
- ~~If you want to, you can use the newListOfComments to completely reset teh list to this new list~~
- ~~Dont forget to make the call last in this function (implement it after the already written logic)~~

---

#### PostElement: Ln150
- Bellow this comment, replace userEmail with the UserName of the current browsing user.
- This change needs to be done in conjunction with a future comment located where this fucntuion is being called from.

---

#### ~~PostElement: Ln264~~
- ~~This effect will need to call the db for teh actual stored number instead of calculating it manually~~
- ~~Only once the other chnages are made.~~

---

#### PostElement: Ln347
- This userEmail var needs to be chnaged to the userName of the Browsing user.