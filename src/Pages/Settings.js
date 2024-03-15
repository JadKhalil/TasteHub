import React, { useEffect, useState } from "react";
import "./Settings.css";

function Settings() {


  const [setingsList, setSettingList] = useState([
    {
      categoryName : "Category 1",
      optionsList : [
        {
          optionName : "Option 1",
          optionID : "C1O1",
          isSelected : true
        },
        {
          optionName : "Option 2",
          optionID : "C1O2",
          isSelected : false
        },
        {
          optionName : "Option 3",
          optionID : "C1O3",
          isSelected : false
        }
      ]
    },
    {
      categoryName : "Category 2",
      optionsList : [
        {
          optionName : "Option 1",
          optionID : "C2O1",
          isSelected : true
        },
        {
          optionName : "Option 2",
          optionID : "C2O2",
          isSelected : false
        },
        {
          optionName : "Option 3",
          optionID : "C2O3",
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

          <div className="settings-options-box">
            {category.optionsList.map((option) => handleOptions(option, category))}
          </div>

        </div>
      </div>
    )
  }


  const handleOptions = (option, category) => {
    return (
      <div className="settings-option-box">
        <span 
        className={option.isSelected ? "active-settings-option" : "settings-option"} 
        onClick={() => handleOptionClicked(option.optionID, category)}
        >
          {option.optionName}
        </span>
      </div>
    )
  }



  const handleOptionClicked = (ID, clickedCategory) => {
    // Update state with new settingsList
    const newSettingsList = setingsList.map(category => {
      if (category.categoryName === clickedCategory.categoryName) {
        // If this is the category of the clicked option, map its options
        return {
          ...category,
          optionsList: category.optionsList.map(option => ({
            ...option,
            // Set isSelected to true if the optionID matches the clicked ID, otherwise false
            isSelected: option.optionID === ID,
          })),
        };
      } else {
        // If this is not the category of the clicked option, return the category as is
        return category;
      }
    })
    
    setSettingList(newSettingsList);
    console.log(`${ID} was clicked!`);
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
