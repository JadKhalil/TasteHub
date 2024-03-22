import React, { useEffect, useState, useRef } from "react";
import "./Settings.css";
import Login from "./Login";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";
import Popup from 'reactjs-popup';
import { FileInput, Label } from 'flowbite-react';

function Settings() {
  const { user: contextUser, login, logout } = useUser();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    // Add/remove 'dark-mode' class based on isDarkMode state
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logOut = () => {
    googleLogout();
    localStorage.removeItem("user");
    // Remove the settings from localStorage upon logout
    localStorage.removeItem("settings");
    logout();
    setUser(null);
    navigate("/");
  };

  const [settingsList, setSettingList] = useState([
    {
      categoryName: "Colour Theme",
      categoryType: "Selector",
      optionsList: [
        {
          optionName: "Light-Mode",
          isSelected: false,
        },
        {
          optionName: "Dark-Mode",
          isSelected: false,
        },
      ],
    },
    {
      categoryName: "Account",
      categoryType: "Edit",
      optionsList: [
        {
          optionType: "EditPicture",
          optionName: "Profile Picture",
          optionValue: user?.image,
          optionNewValue: "",
        },
        {
          optionType: "EditText",
          optionName: "Bio",
          optionValue: user?.bio,
          optionNewValue: "",
          optionAction: () => {},
        },
        {
          optionType: "EditButton",
          optionName: "LogOut",
          optionAction: () => logOut(),
        },
      ],
    },
    {
      categoryName: "Favorite Food",
      categoryType: "Selector",
      optionsList: [
        {
          optionName: "Italian",
          isSelected: false,
        },
        {
          optionName: "Mexican",
          isSelected: false,
        },
        {
          optionName: "Vegetarian",
          isSelected: false,
        },
        {
          optionName: "Carnivore",
          isSelected: false,
        },
        {
          optionName: "Indian",
          isSelected: false,
        },
      ],
    },
  ]);

  const updateSettingsInLocalStorage = (newSettingsList) => {
    const settings = {
      colourTheme: newSettingsList
        .find((category) => category.categoryName === "Colour Theme")
        ?.optionsList.find((option) => option.isSelected)?.optionName,
      favoriteFood: newSettingsList
        .find((category) => category.categoryName === "Favorite Food")
        ?.optionsList.find((option) => option.isSelected)?.optionName,
    };

    localStorage.setItem("settings", JSON.stringify(settings));
  };

  // useEffect(() => {
  //   updateSettingsInLocalStorage(settingsList)
  // }, []);

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
              {category.optionsList.map((option) =>
                handleSelectorOptions(option, category)
              )}
            </div>
          ) : (
            <></>
          )}

          {category.categoryType === "Edit" ? (
            <div className="settings-options-box">
              {category.optionsList.map((option) =>
                handleEditOptions(option, category)
              )}
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  };

  const handleEditOptions = (option, category) => {
    if (option.optionType === "EditText") {
      return <>{handleEditTextOptions(option, category)}</>;
    } else if (option.optionType === "EditButton") {
      return <>{handleEditButtonOptions(option, category)}</>;
    } else if (option.optionType === "EditPicture") {
      return <>{handleEditPictureOptions(option, category)}</>;
    }
  };

  const handleEditPictureOptions = (option, category) => {
    return (
      <div className="settings-edit-picture-option-box">
        <span className="settings-edit-picture-option-span">
          {`${option.optionName}:`}
        </span>
          <Popup trigger=
              {
                <button 
                  className={isDarkMode ? "dark-mode-settings-edit-picture-option-button" : "settings-edit-picture-option-button"}
                >
                  <img 
                    src={option.optionValue} 
                    className={isDarkMode ? "dark-mode-settings-edit-picture-option-image" : "settings-edit-picture-option-image"}
                  />
                </button>
              }
              position="right center">
              <label for="file-uplaude-settings-profile-pic"><strong>{'Choose a file: '}</strong></label>
              <input
                  type="file"
                  id='file-uplaude-settings-profile-pic'
                  className={isDarkMode ? "dark-mode-settings-edit-picture-option-file" : "settings-edit-picture-option-file"}
                  onChange={() => {}}
                  accept=".png, .jpg, .jpeg, img"
              />
          </Popup>
      </div>
    );
  };

  const handleEditButtonOptions = (option, category) => {
    return (
      <div className="settings-edit-button-option-box">
        <button
          className={isDarkMode ? "dark-mode-settings-edit-button-option-submit-button" : "settings-edit-button-option-submit-button"}
          onClick={() => option.optionAction()}
        >
          {option.optionName}
        </button>
      </div>
    );
  };

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
            onChange={(e) =>
              handleOnChangeEditTextOptions(
                category.categoryName,
                option.optionName,
                e.target.value
              )
            }
          />
          {option.optionNewValue !== "" ? (
            <button
              className="settings-edit-text-option-submit-button"
              onClick={() => option.optionAction()}
            >
              Submit
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  };

  const handleOnChangeEditTextOptions = (
    categoryName,
    optionName,
    newValue
  ) => {
    setSettingList((currentSettingsList) =>
      currentSettingsList.map((category) => {
        // Find the matching category
        if (category.categoryName === categoryName) {
          return {
            ...category,
            optionsList: category.optionsList.map((option) => {
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


  const handleSelectorOptions = (option, category) => {
    const optionID = `${category.categoryName} : ${option.optionName}`;

    return (
      <div className="settings-selector-option-box">
        <span
          className={
            option.isSelected
              ? "active-settings-selector-option"
              : "settings-selector-option"
          }
          onClick={() => handleSelectorOptionClicked(optionID, category)}
        >
          {option.optionName}
        </span>
      </div>
    );
  };

  const handleSelectorOptionClicked = (optionID, clickedCategory) => {
    // Update state with new settingsList
    const newSettingsList = settingsList.map((category) => {
      if (category.categoryName === clickedCategory.categoryName) {
        // If this is the category of the clicked option, map its options
        return {
          ...category,
          optionsList: category.optionsList.map((option) => ({
            ...option,
            // Set isSelected to true if the optionID matches the clicked ID, otherwise false
            isSelected:
              `${category.categoryName} : ${option.optionName}` === optionID,
          })),
        };
      } else {
        // If this is not the category of the clicked option, return the category as is
        return category;
      }
    });

    // Update settings in localStorage after state update
    setSettingList(newSettingsList);

    // Update isDarkMode state based on the selected theme
    const selectedTheme = newSettingsList
      .find((category) => category.categoryName === "Colour Theme")
      ?.optionsList.find((option) => option.isSelected)?.optionName;

    if (selectedTheme === "Dark-Mode") {
      toggleDarkMode(true);
    } else {
      toggleDarkMode(false);
    }
    // Update settings in localStorage after state update
    updateSettingsInLocalStorage(newSettingsList); // Pass the updated settings list to updateSettingsInLocalStorage
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedSettings = localStorage.getItem("settings");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedSettings) {
      const parsedStoredSettings = JSON.parse(storedSettings);
      const selectedColourTheme = parsedStoredSettings.colourTheme;
      const selectedFavoriteFood = parsedStoredSettings.favoriteFood;

      const updatedSettingsList = settingsList.map((setting) => {
        if (setting.categoryName === "Colour Theme") {
          setting.optionsList = setting.optionsList.map((option) => ({
            ...option,
            isSelected: option.optionName === selectedColourTheme,
          }));
        } else if (setting.categoryName === "Favorite Food") {
          setting.optionsList = setting.optionsList.map((option) => ({
            ...option,
            isSelected: option.optionName === selectedFavoriteFood,
          }));
        }
        return setting;
      });

      setSettingList(updatedSettingsList);
      updateSettingsInLocalStorage(updatedSettingsList);
    }
  }, []);

  return (
    <div className="settings-big-box">
      <div className="settings-box">
        <div className="settings-header-big-box">
          <div className="settings-header-box">
            <h1 className="settings-header-label-h1">Settings</h1>
          </div>
        </div>

        <div className="settings-categories-big-box">
          <div className="settings-categories-box">
            {settingsList.map(handleCategories)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
