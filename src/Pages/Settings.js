import React, { useEffect, useState } from "react";
import "./Settings.css";
import Login from "./Login";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";

function Settings() {
  const { user: contextUser, login, logout } = useUser();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logOut = () => {
    googleLogout();
    localStorage.removeItem("user");
    logout();
    setUser(null);
    navigate("/");
  };

  const [setingsList, setSettingList] = useState([
    {
      categoryName : "Colour Theme",
      categoryType : "Selector",
      optionsList : [
        {
          optionName : "Light-Mode",
          isSelected : true
        },
        {
          optionName : "Dark-Mode",
          isSelected : false
        }
      ]
    },
    {
      categoryName : "Account",
      categoryType : "Edit",
      optionsList : [
        {
          optionType : "EditText",
          optionName : "Name",
          optionValue : (user.name),
          optionNewValue : ""
        },
        {
          optionType : "EditButton",
          optionName : "LogOut",
          optionAction : () => logOut(),
        }
      ]
    },
    {
      categoryName : "Favorite Food",
      categoryType : "Selector",
      optionsList : [
        {
          optionName : "Italian",
          isSelected : false
        },
        {
          optionName : "Mexican",
          isSelected : false
        },
        {
          optionName : "Vegetarian",
          isSelected : false
        },
        {
          optionName : "Carnivore",
          isSelected : true
        },
        {
          optionName : "Indian",
          isSelected : false
        }
      ]
    }
  ]);


  const handleCategories = (category) => {
    return (
      <div className="settings-category-big-box">
        <div className="settings-category-box">


          <div className="settings-category-title-box">
            <h4 className="settings-category-title-h4">
              {category.categoryName}
            </h4>
          </div>


          {category.categoryType === "Selector" ? (
            <div className="settings-options-box">
              {category.optionsList.map((option) => handleSelectorOptions(option, category))}
            </div>
          ) : ( <></> )}


          {category.categoryType === "Edit" ? (
            <div className="settings-options-box">
              {category.optionsList.map((option) => handleEditOptions(option, category))}
            </div>
          ) : ( <></> )}


        </div>
      </div>
    )
  }


  const handleEditOptions = (option, category) => {
    if (option.optionType === "EditText") {
      return (
        <>
          {handleEditTextOptions(option, category)}
        </>
      )
    } else if (option.optionType === "EditButton") {
      return (
        <>
          {handleEditButtonOptions(option, category)}
        </>
      )
    }
  }
  


  const handleEditButtonOptions = (option, category) => {
    return (
      <div className="settings-edit-button-option-box">

        <button 
        className="settings-edit-button-option-submit-button"
        onClick={() => option.optionAction()}
        >
            {option.optionName}
        </button>

      </div>
    )
  }
  


  const handleEditTextOptions = (option, category) => {
    return (
      <div className="settings-edit-text-option-box">

        <span className="settings-edit-text-option">
          {`${option.optionName}:`}
        </span>

        <div className="settings-edit-text-option-textBox-box">
          <input
          className="settings-edit-text-option-textBox"
          type="text" 
          placeholder={option.optionValue}
          value={option.optionNewValue}
          onChange={(e) => handleOnChangeEditTextOptions(
            category.categoryName, 
            option.optionName, 
            e.target.value
          )}
          />
          {option.optionNewValue !== "" ? (
              <button 
              className="settings-edit-text-option-submit-button"
              onClick={() => handleOnSubmitEditTextOptions(
                category.categoryName, 
                option.optionName
              )}
              >
                  Submit
              </button>
          ) : ( <></> )}
        </div>

      </div>
    )
  }

  const handleOnChangeEditTextOptions = (categoryName, optionName, newValue) => {
    setSettingList(currentSettingsList =>
      currentSettingsList.map(category => {
        // Find the matching category
        if (category.categoryName === categoryName) {
          return {
            ...category,
            optionsList: category.optionsList.map(option => {
              // Find the matching option and update its optionNewValue
              if (option.optionName === optionName) {
                return {
                  ...option,
                  optionNewValue: newValue,
                };
              }
              return option;
            }),
          };
        }
        return category;
      })
    );
  };
  

  const handleOnSubmitEditTextOptions = (categoryName, optionName) => {
    setSettingList(currentSettingsList =>
      currentSettingsList.map(category => {
        // Find the matching category
        if (category.categoryName === categoryName) {
          return {
            ...category,
            optionsList: category.optionsList.map(option => {
              // Find the matching option and update its optionValue
              if (option.optionName === optionName && option.optionName === "Name") {
                // Retrieve the user object from localStorage
                const storedUser = JSON.parse(localStorage.getItem("user"));
  
                // Update the user object with the new name
                const updatedUser = {
                  ...storedUser,
                  name: option.optionNewValue,
                };
  
                // Save the updated user object back to localStorage
                localStorage.setItem("user", JSON.stringify(updatedUser));
  
                // Update the user state to reflect the changes in the UI
                setUser(updatedUser);
  
                return {
                  ...option,
                  optionValue: option.optionNewValue,
                  optionNewValue: '', // Optionally reset optionNewValue
                };
              }
              return option;
            }),
          };
        }
        return category;
      })
    );
  };
  

  

  const handleSelectorOptions = (option, category) => {
    
    const optionID = `${category.categoryName} : ${option.optionName}`

    return (
      <div className="settings-selector-option-box">
        <span 
        className={option.isSelected ? "active-settings-selector-option" : "settings-selector-option"} 
        onClick={() => handleSelectorOptionClicked(optionID, category)}
        >
          {option.optionName}
        </span>
      </div>
    )
  }



  const handleSelectorOptionClicked = (optionID, clickedCategory) => {

    // Update state with new settingsList
    const newSettingsList = setingsList.map(category => {
      if (category.categoryName === clickedCategory.categoryName) {
        // If this is the category of the clicked option, map its options
        return {
          ...category,
          optionsList: category.optionsList.map(option => ({
            ...option,
            // Set isSelected to true if the optionID matches the clicked ID, otherwise false
            isSelected: `${category.categoryName} : ${option.optionName}` === optionID,
          })),
        };
      } else {
        // If this is not the category of the clicked option, return the category as is
        return category;
      }
    })
    
    setSettingList(newSettingsList);
    console.log(`${optionID} was clicked!`);
  };


  return (
    <div className="settings-big-box">
      <div className="settings-box">


        <div className="settings-header-big-box">
          <div className="settings-header-box">
            <h1 className="settings-header-label-h1">
              Settings
            </h1>
          </div>
        </div>

        <div className="settings-categories-big-box">
          <div className="settings-categories-box">
            {setingsList.map(handleCategories)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
