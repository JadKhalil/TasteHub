import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function Global() {


    // userEmail': userEmail,
    //                         'bio': bio,
    //                         'numberOfFollowers': numberOfFollowers,
    //                         'numberOfFollowing' : numberOfFollowing,
    //                         'creationDate': creationDate,
    //                         'image': cloudImage["secure_url"]

  const handleSubmit = async (e) => { // Add lambda url
    e.preventDefault(); // Prevents the popup page from closing before event is handled

    const dataToSubmit = new FormData();
    dataToSubmit.append("userEmail", "edward.an03@gmail.com");
    dataToSubmit.append("bio", "live laugh love");
    dataToSubmit.append("numberOfFollowers", 0);
    dataToSubmit.append("numberOfFollowing", 2);
    const creationDate = Date.now();
    dataToSubmit.append("creationDate", creationDate);
    const promise = await fetch(
        "https://2rg6ktvhkqhy2hlqpekz7u2of40nuvmu.lambda-url.ca-central-1.on.aws/", // Lambda Function URL (needs to be hard coded)
        {
            method: "POST",
            body: dataToSubmit,
        }
    );
    console.log(dataToSubmit.entries());
    const jsonPromise = await promise.json(); // Used to access the body of the returned Json

    let alreadyExists = false; // Looks for duplicate names in the collection
    for (let i=0; i<obituaryCollection.length; i++)
    {
        if (obituaryCollection[i]['name'] === name)
        {
            alreadyExists = true;
            break;
        }
    }

    if (promise.status === 200) // Successful POST request
    {
        const newObituary = {
            'name': name,
            'birth date': birthDate,
            'death date': deathDate,
            'description': jsonPromise['description'],
            'image': jsonPromise['image'],
            'speech': jsonPromise['speech'],
            'submit time': submitTime
        }
        setObituaryCollection([newObituary,...obituaryCollection]); // Update obituaryCollection
        setDescriptionState([true,...descriptionState]); // Most recently added obituary is open by default

        if (alreadyExists === true) { // when an obituary with duplicate name is added
            window.alert(`There already exists an obituary for ${name}.\nThe old obituary will be deleted upon refresh.`);
        }
    }
    else { // Unsuccessful POST request
        window.alert(`Error! status ${promise.status}\n${jsonPromise["message"]}`);
    }
    setPopupState(false); // Close the overlay
}

  return (
    <>
      <h>Global</h>
    </>
  );
}

export default Global;
