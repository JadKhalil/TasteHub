import React from "react";
import { render, screen } from "@testing-library/react";
import CreatePostOverlay from "../Elements/CreatePostOverlay";
import { useState } from "react";

test("Testing for rendering", ()=> {
    const [showPostCreateMock, setPostCreateMock] = useState(false);
    render(<CreatePostOverlay setPostCreate={setPostCreateMock}/>);

})