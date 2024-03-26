import React from "react";
import { render, screen } from "@testing-library/react";
import CreatePostOverlay from "../Elements/CreatePostOverlay";
import { useUser } from '../UserContext'; // Import the useUser hook

jest.mock('../UserContext'); // Mock the UserContext module
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn()
  }));


test("Testing for rendering", () => {
    // Mock the return value of useUser
    (useUser as jest.Mock).mockReturnValue({ user: { userEmail: 'test@example.com', userName: 'testuser' } });
    (React.useState as jest.Mock).mockImplementation(() => [false, jest.fn()]);

    render(<CreatePostOverlay setPostCreate={React.useState}/>);

    // Check if the input element with placeholder "Recipe Name" is in the document
    const recipeNameInput = screen.getByPlaceholderText(/Recipe Name/i);
    expect(recipeNameInput).toBeInTheDocument();

    const prepTimeInput = screen.getByPlaceholderText(/PrepTime/i);
    expect(prepTimeInput).toBeInTheDocument();

    const descriptionInput = screen.getByPlaceholderText(/Description/i);
    expect(descriptionInput).toBeInTheDocument();

    const categoryInput = screen.getByPlaceholderText(/Category/i);
    expect(categoryInput).toBeInTheDocument();

})
