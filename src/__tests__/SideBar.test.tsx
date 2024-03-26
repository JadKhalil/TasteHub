import React from "react";
import { render } from "@testing-library/react";
import SideBar from "../Elements/SideBar";
import { useDarkMode } from '../DarkModeContext'; // Import the useDarkMode hook
import { useLocation } from 'react-router-dom'; // Import the useLocation hook

// Mock the DarkModeContext module
jest.mock('../DarkModeContext');

// Mock the useLocation hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn()
}));

test("Testing for rendering light mode sidebar", () => {
    // Mock the return value of useDarkMode
    (useDarkMode as jest.Mock).mockReturnValue({ isDarkMode: false, toggleDarkMode: jest.fn() });

    // Mock the return value of useLocation with pathname set to '/'
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });

    // Mock the useContext hook return value
    React.useContext = jest.fn().mockReturnValue({ basename: '/' });

    render(<SideBar/>);
});
